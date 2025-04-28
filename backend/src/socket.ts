import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { verifyToken } from "./utils/jwt";
import messageModel from "./models/messageModel";
import userModel from "./models/userModel";
import doctorModel from "./models/DoctorModel";

import dotenv from "dotenv";
dotenv.config();

interface SocketData {
  id: string;
  role: "user" | "doctor";
  email: string;
}

interface AuthenticatedSocket extends Socket {
  data: SocketData;
}

export const initializeSocket = (server: HttpServer): Server => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    },
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
      (socket as AuthenticatedSocket).data = decoded as SocketData;
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
    console.log(
      `Socket ${socket.id} joined notification room: ${notificationRoom}`
    );

    socket.on("joinChat", async (data: { userId: string; doctorId: string }) => {
      try {
        const { userId, doctorId } = data;
        console.log(data)
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
        socket.emit("joined", { room });
      } catch (error) {
        console.error("Error in joinChat:", error);
        socket.emit("error", "Failed to join chat");
      }
    });

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
        } catch (error) {
          console.error("Error in sendMessage:", error);
          socket.emit("error", "Failed to send message");
        }
      }
    );

    socket.on("disconnect", () => {
      console.log(`Disconnected: ${socket.id} (Role: ${socket.data.role}, ID: ${socket.data.id})`);
    });
  });

  return io;
};

// import { Server, Socket } from "socket.io";
// import { Server as HttpServer } from "http";
// import { verifyToken } from "./utils/jwt";
// import chatModel from "./models/messageModel";

// import dotenv from "dotenv";
// dotenv.config();

// interface SocketData {
//   id: string;
//   role: "user" | "doctor";
//   email: string;
// }

// interface AuthenticatedSocket extends Socket {
//   data: SocketData;
// }

// export const initializeSocket = (server: HttpServer): Server => {
//   const io = new Server(server, {
//     cors: {
//       origin: "http://localhost:5173",
//       methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
//       allowedHeaders: ["Content-Type", "Authorization"],
//       credentials: true,
//     },
//   });

//   // middleware for a Socket.IO server : authenticate user before the connection
//   io.use((socket: Socket, next) => {
//     const token = socket.handshake.auth.token;

//     if (!token)
//       return next(new Error("Authentication error : No token Provided"));

//     try {
//       const decoded = verifyToken(token);
//       if (
//         !decoded ||
//         typeof decoded !== "object" ||
//         !("id" in decoded) ||
//         !("role" in decoded)
//       ) {
//         return next(new Error("Invalid token"));
//       }

//       (socket as AuthenticatedSocket).data = decoded as SocketData;
//       next();
//     } catch (error) {
//       console.error("Socket auth error:", error);
//       next(new Error("Authentication error: Invalid token"));
//     }
//   });

//   //when a User successfully connects,This execute(after passing authentication):
//   io.on("connection", (socket: AuthenticatedSocket) => {
//     console.log(
//       `Connected: ${socket.id} (Role: ${socket.data.role}, ID: ${socket.data.id})`
//     );

//     // Join notification room based on role
//     const { role, id } = socket.data;
//     let notificationRoom: string | null = null;
//     if (role === "user") {
//       notificationRoom = `user_${id}`;
//     } else if (role === "doctor") {
//       notificationRoom = `doctor_${id}`;
//     }

//     if (notificationRoom) {
//       socket.join(notificationRoom);
//       console.log(
//         `Socket ${socket.id} joined notification room: ${notificationRoom}`
//       );
//     }

//     // Optional: Log incoming notifications for debugging
//     socket.on("receiveNotification", (notification: any) => {
//       console.log(
//         `Notification received by ${socket.id} (Role: ${role}, ID: ${id}):`,
//         notification
//       );
//     });

//     // request to join a private chat room between different roles:
//     socket.on(
//       "joinChat",
//       async (data: { userId?: string; doctorId?: string }) => {
//         try {
//           const { userId, doctorId } = data;
//           console.log("Join chat request:", {
//             userId,
//             doctorId,
//             role: socket.data.role,
//             id: socket.data.id,
//           });

//           // User <=> doctor
//           if (userId && doctorId) {
//             const room = `chat_user_${userId}_${doctorId}`;

//             if (socket.data.role === "user" && socket.data.id !== userId) {
//               socket.emit(
//                 "error",
//                 "Unauthorized: Cannot join chat for another user"
//               );
//               return;
//             }

//             if (socket.data.role === "doctor" && socket.data.id !== doctorId) {
//               socket.emit(
//                 "error",
//                 "Unauthorized: Cannot join chat for another doctor"
//               );
//               return;
//             }
//             socket.join(room);

//             const previousMessages = await chatModel
//               .find({ userId, doctorId })
//               .sort({ timestamp: 1 })
//               .lean();
//             console.log(
//               `Joined room ${room} with ${previousMessages.length} previous messages`
//             );
//             socket.emit("previousMessages", previousMessages);
//             socket.emit("joined", { room });
//           }else {
//             socket.emit('error', 'Invalid chat parameters');
//             console.log('Invalid joinChat parameters:', data);
//           }
//         } catch (error) {
//           console.error("Error in joinChat:", error);
//           socket.emit("error", "Failed to join chat");
//         }
//       });

//     // sending a message:  
//       socket.on('sendMessage', async (data: { userId?: string; doctorId?: string; message: string }) => {
//         try {
//           const { userId, doctorId , message } = data;
//           console.log('Send message request:', { userId, doctorId, message, senderRole: socket.data.role, senderId: socket.data.id });
  
//           if (!message) {
//             socket.emit('error', 'Missing message');
//             console.log('Missing message in sendMessage');
//             return;
//           }
  
//           // Doctor <=> User Message
//           if (userId && doctorId) {
//             const room = `chat_user_${userId}_${doctorId}`;
//             const messageData = {
//               userId,
//               doctorId,
//               senderId: socket.data.id,
//               senderRole: socket.data.role as 'user' | 'doctor',
//               message,
//               timestamp: new Date(),
//             };
//             console.log('Saving doctor <=> User message:', messageData);
//             const newMessage = await new chatModel(messageData).save();
//             console.log(`Message saved for room ${room}`);
//             io.to(room).emit('receiveMessage', newMessage);
//           }else {
//             socket.emit('error', 'Invalid message parameters');
//             console.log('Invalid sendMessage parameters:', data);
//           }
//         } catch (error) {
//           console.error('Error in sendMessage:', error);
//           socket.emit('error', 'Failed to send message');
//         }
//       });

      
//       socket.on('disconnect', () => {
//       console.log(`Disconnected: ${socket.id} (Role: ${socket.data.role}, ID: ${socket.data.id})`);
//     });
//   });

//   return io;
// };
