import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { verifyToken } from "./utils/jwt";
import messageModel from "./models/commonModel/messageModel";
import userModel from "./models/userModel/userModel";
import doctorModel from "./models/doctorMpdel/DoctorModel";

import dotenv from "dotenv";
dotenv.config();

interface SocketData {
  id: string;
  role: "user" | "doctor";
  email: string;
  name: string;
}

interface AuthenticatedSocket extends Socket {
  data: SocketData;
}

export const initializeSocket = (server: HttpServer): Server => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    },
    pingTimeout: 60000,
  });

  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }
    try {
      const decoded = verifyToken(token);
      if (
        !decoded ||
        typeof decoded !== "object" ||
        !("id" in decoded) ||
        !("role" in decoded)
      ) {
        return next(new Error("Invalid token"));
      }
      (socket as AuthenticatedSocket).data = {
        id: decoded.id,
        role: decoded.role,
        email: decoded.email || "",
        name: decoded.name || "",
      };
      next();
    } catch (error) {
      console.error("Socket auth error:", error);
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(
      `Connected: ${socket.id} (Role: ${socket.data.role}, ID: ${socket.data.id})`
    );

    const { role, id } = socket.data;
    const notificationRoom = role === "user" ? `user_${id}` : `doctor_${id}`;
    socket.join(notificationRoom);

    // Handle reconnection
    socket.on("reconnect", () => {
      socket.join(notificationRoom);
      console.log(`Reconnected: ${socket.id}`);
    });

    // Chat room handling
    socket.on("joinChat", async (data: { userId: string; doctorId: string }) => {
      try {
        const { userId, doctorId } = data;
        if (!userId || !doctorId) {
          socket.emit("error", "Missing userId or doctorId");
          return;
        }

        const user = await userModel.findById(userId).lean();
        const doctor = await doctorModel.findById(doctorId).lean();
        if (!user || !doctor) {
          socket.emit("error", "User or doctor not found");
          return;
        }

        if (role === "user" && id !== userId) {
          socket.emit("error", "Unauthorized: Cannot join chat for another user");
          return;
        }
        if (role === "doctor" && id !== doctorId) {
          socket.emit("error", "Unauthorized: Cannot join chat for another doctor");
          return;
        }

        const room = `chat_user_${userId}_${doctorId}`;
        socket.join(room);
        const previousMessages = await messageModel
          .find({ userId, doctorId })
          .sort({ timestamp: 1 })
          .lean();
        socket.emit("previousMessages", previousMessages);
      } catch (error) {
        console.error("Error in joinChat:", error);
        socket.emit("error", "Failed to join chat");
      }
    });

    // Message handling
    socket.on(
      "sendMessage",
      async (data: { userId: string; doctorId: string; message: string }) => {
        try {
          const { userId, doctorId, message } = data;
          if (!userId || !doctorId || !message) {
            socket.emit("error", "Missing required fields");
            return;
          }

          const user = await userModel.findById(userId).lean();
          const doctor = await doctorModel.findById(doctorId).lean();
          if (!user || !doctor) {
            socket.emit("error", "User or doctor not found");
            return;
          }

          const room = `chat_user_${userId}_${doctorId}`;
          const messageData = {
            userId,
            doctorId,
            senderId: socket.data.id,
            senderRole: socket.data.role as "user" | "doctor",
            message,
            timestamp: new Date(),
          };
          const newMessage = await new messageModel(messageData).save();
          io.to(room).emit("receiveMessage", newMessage);

          // Update last message for both participants
          await userModel.findByIdAndUpdate(userId, {
            lastMessage: message,
            lastMessageTime: new Date(),
          });
          await doctorModel.findByIdAndUpdate(doctorId, {
            lastMessage: message,
            lastMessageTime: new Date(),
          });
        } catch (error) {
          console.error("Error in sendMessage:", error);
          socket.emit("error", "Failed to send message");
        }
      }
    );

    // Video call handling
    socket.on(
      "startVideoCall",
      async (data: { userId: string; doctorId: string; room: string; callerName: string }) => {
        try {
          const { userId, doctorId, room, callerName } = data;
          if (!userId || !doctorId || !room) {
            socket.emit("error", "Missing userId, doctorId, or room");
            return;
          }

          const user = await userModel.findById(userId).lean();
          const doctor = await doctorModel.findById(doctorId).lean();
          if (!user || !doctor) {
            socket.emit("error", "User or doctor not found");
            return;
          }

          if (role === "user" && id !== userId) {
            socket.emit("error", "Unauthorized: Cannot start video call for another user");
            return;
          }
          if (role === "doctor" && id !== doctorId) {
            socket.emit("error", "Unauthorized: Cannot start video call for another doctor");
            return;
          }

          // Notify the doctor about the incoming call
          io.to(`doctor_${doctorId}`).emit("incomingVideoCall", {
            room,
            callerName,
            callerId: userId,
          });

          // Confirm to the caller that the call was initiated
          socket.emit("videoCallInitiated", { room });

          console.log(`Video call initiated by ${userId} to ${doctorId} in room ${room}`);
        } catch (error) {
          console.error("Error in startVideoCall:", error);
          socket.emit("error", "Failed to start video call");
        }
      }
    );

    // When doctor accepts the call
    socket.on("acceptVideoCall", async (data: { room: string; doctorId: string; userId: string }) => {
      try {
        const { room, doctorId, userId } = data;
        if (!room || !doctorId || !userId) {
          socket.emit("error", "Missing room, doctorId, or userId");
          return;
        }

        // Verify the doctor is the one accepting
        if (socket.data.role !== "doctor" || socket.data.id !== doctorId) {
          socket.emit("error", "Unauthorized call acceptance");
          return;
        }

        // Notify both parties that the call is starting
        io.to(`user_${userId}`).emit("doctorJoinedCall");
        io.to(room).emit("videoCallStarted", { room });

        console.log(`Doctor ${doctorId} joined call in room ${room}`);
      } catch (error) {
        console.error("Error in acceptVideoCall:", error);
        socket.emit("error", "Failed to accept video call");
      }
    });

    // When doctor rejects the call
    socket.on("rejectVideoCall", (data: { userId: string; doctorId: string }) => {
      try {
        const { userId, doctorId } = data;
        if (!userId || !doctorId) {
          socket.emit("error", "Missing userId or doctorId");
          return;
        }

        // Verify the doctor is the one rejecting
        if (socket.data.role !== "doctor" || socket.data.id !== doctorId) {
          socket.emit("error", "Unauthorized call rejection");
          return;
        }

        // Notify the user that the call was rejected
        io.to(`user_${userId}`).emit("videoCallRejected");

        console.log(`Doctor ${doctorId} rejected call from user ${userId}`);
      } catch (error) {
        console.error("Error in rejectVideoCall:", error);
        socket.emit("error", "Failed to reject video call");
      }
    });

    // End video call
    socket.on("endVideoCall", async (data: { userId: string; doctorId: string }) => {
      try {
        const { userId, doctorId } = data;
        if (!userId || !doctorId) {
          socket.emit("error", "Missing userId or doctorId");
          return;
        }

        // Verify permissions
        const isUser = socket.data.role === "user" && socket.data.id === userId;
        const isDoctor = socket.data.role === "doctor" && socket.data.id === doctorId;
        
        if (!isUser && !isDoctor) {
          socket.emit("error", "Unauthorized to end this call");
          return;
        }

        // Notify both parties
        io.to(`user_${userId}`).emit("endVideoCall");
        io.to(`doctor_${doctorId}`).emit("endVideoCall");

        console.log(`Video call ended between user ${userId} and doctor ${doctorId}`);
      } catch (error) {
        console.error("Error in endVideoCall:", error);
        socket.emit("error", "Failed to end video call");
      }
    });

    socket.on("disconnect", () => {
      console.log(`Disconnected: ${socket.id} (Role: ${socket.data.role}, ID: ${socket.data.id})`);
    });
  });

  return io;
};