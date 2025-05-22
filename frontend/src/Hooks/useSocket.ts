import { useState, useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { BaseUrl } from "../constants";
import { IMessage, IChatUser } from "../Types";

export const useSocket = (
  userId: string | undefined,
  token: string | undefined,
  role: "user" | "doctor"
) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatUsers, setChatUsers] = useState<IChatUser[]>([]);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [optimisticIds, setOptimisticIds] = useState<Set<string>>(new Set());

  const fetchChatUsers = useCallback(async () => {
    if (!userId || !token) return;

    setIsLoading(true);
    try {
      const endpoint = role === "user" 
        ? `api/users/chats/doctors/${userId}`
        : `api/doctor/chats/users/${userId}`;
      
      const response = await fetch(`${BaseUrl}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      const fetchedUsers = data.data?.[role === "user" ? "doctors" : "users"] || [];
      const formattedUsers = fetchedUsers.map((user: any) => ({
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        mobile_no: user.mobile_no,
        profilePicture: user.profilePicture,
        specialization: user.specialization,
        qualification: user.qualification,
        lastMessage: user.lastMessage,
        lastMessageTime: user.lastMessageTime,
        online: user.online,
      }));

      setChatUsers(
        formattedUsers
          .map((user: IChatUser) => ({
            ...user,
            unreadCount: 0,
          }))
          .sort((a: IChatUser, b: IChatUser) => {
            const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
            const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
            return timeB - timeA;
          })
      );
      setError(null);
    } catch (err: any) {
      setError(err.message || `Failed to fetch ${role === "user" ? "doctors" : "users"}`);
    } finally {
      setIsLoading(false);
    }
  }, [userId, token, role]);

  const joinChat = useCallback((otherUserId: string) => {
    if (!socket || !userId || !isConnected) return;

    const roomData = role === "user" 
      ? { userId, doctorId: otherUserId }
      : { userId: otherUserId, doctorId: userId };
    
    socket.emit("joinChat", roomData);

    socket.on("previousMessages", (previousMessages: IMessage[]) => {
      setMessages(previousMessages || []);
    });

    return () => {
      socket.off("previousMessages");
    };
  }, [socket, userId, isConnected, role]);

  const sendMessage = useCallback(async (messageData: {
    userId: string;
    doctorId: string;
    message: string;
    timestamp: string;
    id: string;
    senderId: string;
  }) => {
    if (!socket || !isConnected) return;

    try {
      // Track this optimistic message ID
      setOptimisticIds(prev => new Set(prev).add(messageData.id));

      // Optimistic UI update
      setMessages((prev :any ) => [...prev, messageData]);

      // Update chat users list
      setChatUsers(prev =>
        prev
          .map(user =>
            user.id === (role === "user" ? messageData.doctorId : messageData.userId)
              ? {
                  ...user,
                  lastMessage: messageData.message,
                  lastMessageTime: messageData.timestamp,
                }
              : user
          )
          .sort((a, b) => {
            const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
            const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
            return timeB - timeA;
          })
      );

      // Send via socket
      socket.emit("sendMessage", {
        userId: messageData.userId,
        doctorId: messageData.doctorId,
        message: messageData.message,
      });

      return true;
    } catch (err) {
      // Remove the optimistic message if sending fails
      setMessages(prev => prev.filter(m => m._id !== messageData.id));
      setOptimisticIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(messageData.id);
        return newSet;
      });
      throw err;
    }
  }, [socket, isConnected, role]);

  const updateUnreadCount = useCallback((
    userId: string,
    count: number | ((prevCount: number) => number)
  ) => {
    setChatUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId
          ? {
              ...user,
              unreadCount:
                typeof count === "function"
                  ? count(user.unreadCount || 0)
                  : count,
            }
          : user
      )
    );
  }, []);

  useEffect(() => {
    if (!userId || !token) {
      setError("Please log in to access chat");
      return;
    }

    fetchChatUsers();

    const newSocket = io(BaseUrl, {
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const handleReceiveMessage = (message: IMessage) => {
      // Skip if this is our own message that was optimistically added
      if (message.senderId === userId && optimisticIds.has(message._id)) {
        setOptimisticIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(message._id);
          return newSet;
        });
        return;
      }

      // Prevent duplicate messages
      setMessages(prev => {
        if (prev.some(m => m._id === message._id|| m._id === message._id)) return prev;
        return [...prev, message];
      });

      // Update chat users list
      setChatUsers((prev : any)=> {
        const updated = prev.map((user :any) =>
          user.id === (role === "user" ? message.doctorId : message.userId)
            ? {
                ...user,
                lastMessage: message.message,
                lastMessageTime: message.timestamp,
              }
            : user
        );
        return updated.sort((a : any, b : any) => {
          const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
          const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
          return timeB - timeA;
        });
      });
    };

    newSocket.on("connect", () => {
      setIsConnected(true);
      setError(null);
    });

    newSocket.on("connect_error", (err: any) => {
      setIsConnected(false);
      setError("Connection failed: " + err.message);
    });

    newSocket.on("error", (error: string) => {
      setError(`Socket error: ${error}`);
    });

    newSocket.on("receiveMessage", handleReceiveMessage);

    setSocket(newSocket);

    return () => {
      newSocket.off("receiveMessage", handleReceiveMessage);
      newSocket.disconnect();
    };
  }, [userId, token, fetchChatUsers, role, optimisticIds]);

  return {
    socket,
    isConnected,
    error,
    chatUsers,
    messages,
    isLoading,
    optimisticIds,
    joinChat,
    sendMessage,
    updateUnreadCount,
    setMessages,
    setChatUsers,
  };
};