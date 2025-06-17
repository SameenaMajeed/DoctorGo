import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { verifyToken } from "./utils/jwt";
import messageModel from "./models/commonModel/messageModel";
import userModel from "./models/userModel/userModel";
import doctorModel from "./models/doctorMpdel/DoctorModel";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import BookingModel, {
  AppointmentStatus,
} from "./models/commonModel/BookingModel";

import { Notification } from "./models/commonModel/NotificationModel";
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

  io.use(async(socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    console.log('token :',token)
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
      let name = "";

    // Fetch name from DB
    if (decoded.role === "user") {
      const user = await userModel.findById(decoded.id);
      name = user?.name || "";
    } else if (decoded.role === "doctor") {
      const doctor = await doctorModel.findById(decoded.id);
      name = doctor?.name || "";
    }
      (socket as AuthenticatedSocket).data = {
        id: decoded.id,
        role: decoded.role,
        email: decoded.email || "",
        name,
      };

      console.log('data:',socket.data)
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
    socket.on(
      "joinChat",
      async (data: { userId: string; doctorId: string }) => {
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
            socket.emit(
              "error",
              "Unauthorized: Cannot join chat for another user"
            );
            return;
          }
          if (role === "doctor" && id !== doctorId) {
            socket.emit(
              "error",
              "Unauthorized: Cannot join chat for another doctor"
            );
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
      }
    );

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

    socket.on(
      "message",
      async (data: { userId: string; doctorId: string; message: string }) => {
        try {
          const { userId, doctorId, message } = data;

          // Create notification for the recipient
          const notification = {
            recipientId: socket.data.role === "user" ? doctorId : userId,
            recipientType: socket.data.role === "user" ? "doctor" : "user",
            type: "NEW_MESSAGE",
            title: "New Message",
            message: `You have a new message from ${socket.data.name}`,
            // link: `/chat`,
            read: false,
            timestamp: new Date(),
          };

          // Save notification to database (implement this in your notification service)
          const savedNotification =
            await new Notification(notification).save()

          // Emit notification to recipient
          const recipientRoom =
            socket.data.role === "user"
              ? `doctor_${doctorId}`
              : `user_${userId}`;
          io.to(recipientRoom).emit("newNotification", savedNotification);

        } catch (error) {
          console.error("Error handling message notification:", error);
        }
      }
    );

    // Handle video call room creation (doctor only)
    socket.on("createVideoCallRoom", async (data: { bookingId: string }) => {
      try {
        if (role !== "doctor") {
          socket.emit("error", "Only doctors can create video call rooms");
          return;
        }

        const { bookingId } = data;
        const booking = await BookingModel.findById(bookingId);

        if (!booking) {
          socket.emit("error", "Booking not found");
          return;
        }

        if (booking.doctor_id.toString() !== id) {
          socket.emit("error", "Unauthorized: Doctor ID does not match");
          return;
        }

        if (
          booking.modeOfAppointment !== "online" ||
          booking.status !== AppointmentStatus.CONFIRMED
        ) {
          socket.emit("error", "Invalid booking for video call");
          return;
        }

        // Generate unique room ID
        const roomId = uuidv4();
        await BookingModel.findByIdAndUpdate(bookingId, {
          videoCallRoomId: roomId,
        });

        // Join the doctor to the room
        const videoRoom = `video_${roomId}`;
        socket.join(videoRoom);

        // Emit room ID to doctor
        socket.emit("videoCallRoomCreated", { bookingId, roomId });

        // Notify user via their notification room
        io.to(`user_${booking.user_id}`).emit("videoCallRoomAssigned", {
          bookingId,
          roomId,
        });

        // Trigger email sending (implement this in BookingService)
        io.emit("sendVideoCallEmail", {
          bookingId,
          roomId,
          userId: booking.user_id,
        });
      } catch (error) {
        console.error("Error in createVideoCallRoom:", error);
        socket.emit("error", "Failed to create video call room");
      }
    });

    // Handle joining video call room
    socket.on(
      "joinVideoCall",
      async (data: { roomId: string; bookingId: string }) => {
        try {
          const { roomId, bookingId } = data;
          const booking = await BookingModel.findById(bookingId);

          if (!booking) {
            throw new Error("Booking not found");
          }

          // Role validation
          if (role === "doctor" && booking.doctor_id.toString() !== id) {
            throw new Error("Doctor not authorized for this booking");
          }

          if (role === "user" && booking.user_id.toString() !== id) {
            throw new Error("Patient not authorized for this booking");
          }

          const videoRoom = `video_${roomId}`;
          socket.join(videoRoom);

          // Notify other participants
          socket.to(videoRoom).emit("participantJoined", { role });

          console.log(`${role} joined video room ${videoRoom}`);
        } catch (error: any) {
          console.error("Join error:", error);
          socket.emit("error", { message: error.message });
        }
      }
    );

    // Unified signaling handler
    socket.on(
      "signal",
      (data: {
        roomId: string;
        signalData: any;
        senderRole: "doctor" | "user";
      }) => {
        const videoRoom = `video_${data.roomId}`;
        socket.to(videoRoom).emit("signal", {
          signalData: data.signalData,
          senderRole: data.senderRole,
        });
      }
    );
    // WebRTC signaling events
    socket.on("offer", (data: { roomId: string; offer: any }) => {
      const videoRoom = `video_${data.roomId}`;
      socket.to(videoRoom).emit("offer", data.offer);
    });

    socket.on("answer", (data: { roomId: string; answer: any }) => {
      const videoRoom = `video_${data.roomId}`;
      socket.to(videoRoom).emit("answer", data.answer);
    });

    socket.on("ice-candidate", (data: { roomId: string; candidate: any }) => {
      const videoRoom = `video_${data.roomId}`;
      socket.to(videoRoom).emit("ice-candidate", data.candidate);
    });

    //   // Handle events like booking creation or modification
    // socket.on("newBooking", async (data) => {
    //   try {
    //     const { userId, doctorId, message } = data;

    //     // Save the notification in the database
    //     const notification = new NotificationModel({
    //       userId,
    //       doctorId,
    //       message,
    //       read: false, // Initially, the notification is unread
    //     });

    //     await notification.save();

    //     // Emit the notification to the appropriate user or doctor
    //     if (socket.data.role === "user") {
    //       io.to(`doctor_${doctorId}`).emit("notification", {
    //         message,
    //         timestamp: new Date(),
    //       });
    //     } else if (socket.data.role === "doctor") {
    //       io.to(`user_${userId}`).emit("notification", {
    //         message,
    //         timestamp: new Date(),
    //       });
    //     }
    //   } catch (error) {
    //     console.error("Error in newBooking event:", error);
    //     socket.emit("error", "Failed to send notification");
    //   }
    // })

    socket.on("disconnect", () => {
      console.log(
        `Disconnected: ${socket.id} (Role: ${socket.data.role}, ID: ${socket.data.id})`
      );
    });
  });

  return io;
};

// import { Server, Socket } from "socket.io";
// import { Server as HttpServer } from "http";
// import { verifyToken } from "./utils/jwt";
// import messageModel from "./models/commonModel/messageModel";
// import userModel from "./models/userModel/userModel";
// import doctorModel from "./models/doctorMpdel/DoctorModel";
// import { v4 as uuidv4 } from "uuid";
// import dotenv from "dotenv";
// import BookingModel, {
//   AppointmentStatus,
// } from "./models/commonModel/BookingModel";
// import { NotificationService } from "./services/commonService/NotificationService";
// import { NotificationType } from "./models/commonModel/NotificationModel";
// dotenv.config();

// interface SocketData {
//   id: string;
//   role: "user" | "doctor";
//   email: string;
//   name: string;
// }

// interface AuthenticatedSocket extends Socket {
//   data: SocketData;
// }

// export const initializeSocket = (server: HttpServer): Server => {
//   const io = new Server(server, {
//     cors: {
//       origin: process.env.CLIENT_URL || "http://localhost:5173",
//       methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
//       allowedHeaders: ["Content-Type", "Authorization"],
//       credentials: true,
//     },
//     pingTimeout: 60000,
//   });

//   const notificationService = new NotificationService(io);

//   io.use((socket: Socket, next) => {
//     const token = socket.handshake.auth.token;
//     if (!token) {
//       return next(new Error("Authentication error: No token provided"));
//     }
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
//       (socket as AuthenticatedSocket).data = {
//         id: decoded.id,
//         role: decoded.role,
//         email: decoded.email || "",
//         name: decoded.name || "",

//       };
//       next();
//     } catch (error) {
//       console.error("Socket auth error:", error);
//       next(new Error("Authentication error: Invalid token"));
//     }
//   });

//   io.on("connection", (socket: AuthenticatedSocket) => {
//     console.log(
//       `Connected: ${socket.id} (Role: ${socket.data.role}, ID: ${socket.data.id})`
//     );

//     const { role, id } = socket.data;
//     const notificationRoom = role === "user" ? `user_${id}` : `doctor_${id}`;
//     socket.join(notificationRoom);

//     socket.on('getNotifications', async () => {
//       try {
//         const notifications = role === 'user'
//           ? await notificationService.getUserNotifications(id)
//           : await notificationService.getDoctorNotifications(id);
//         socket.emit('notifications', notifications);
//       } catch (error) {
//         socket.emit('error', 'Failed to fetch notifications');
//       }
//     });

//     socket.on('markNotificationRead', async (notificationId: string) => {
//       try {
//         await notificationService.markNotificationAsRead(notificationId);
//         socket.emit('notificationMarkedRead', notificationId);
//       } catch (error) {
//         socket.emit('error', 'Failed to mark notification as read');
//       }
//     });

//     // Handle reconnection
//     socket.on("reconnect", () => {
//       socket.join(notificationRoom);
//       console.log(`Reconnected: ${socket.id}`);
//     });

//     // Chat room handling
//     socket.on(
//       "joinChat",
//       async (data: { userId: string; doctorId: string }) => {
//         try {
//           const { userId, doctorId } = data;
//           if (!userId || !doctorId) {
//             socket.emit("error", "Missing userId or doctorId");
//             return;
//           }

//           const user = await userModel.findById(userId).lean();
//           const doctor = await doctorModel.findById(doctorId).lean();
//           if (!user || !doctor) {
//             socket.emit("error", "User or doctor not found");
//             return;
//           }

//           if (role === "user" && id !== userId) {
//             socket.emit(
//               "error",
//               "Unauthorized: Cannot join chat for another user"
//             );
//             return;
//           }
//           if (role === "doctor" && id !== doctorId) {
//             socket.emit(
//               "error",
//               "Unauthorized: Cannot join chat for another doctor"
//             );
//             return;
//           }

//           const room = `chat_user_${userId}_${doctorId}`;
//           socket.join(room);
//           const previousMessages = await messageModel
//             .find({ userId, doctorId })
//             .sort({ timestamp: 1 })
//             .lean();
//           socket.emit("previousMessages", previousMessages);
//         } catch (error) {
//           console.error("Error in joinChat:", error);
//           socket.emit("error", "Failed to join chat");
//         }
//       }
//     );

//     // Message handling
//     socket.on(
//       "sendMessage",
//       async (data: { userId: string; doctorId: string; message: string }) => {
//         try {
//           const { userId, doctorId, message } = data;
//           if (!userId || !doctorId || !message) {
//             socket.emit("error", "Missing required fields");
//             return;
//           }

//           const user = await userModel.findById(userId).lean();
//           const doctor = await doctorModel.findById(doctorId).lean();
//           if (!user || !doctor) {
//             socket.emit("error", "User or doctor not found");
//             return;
//           }

//           const room = `chat_user_${userId}_${doctorId}`;
//           const messageData = {
//             userId,
//             doctorId,
//             senderId: socket.data.id,
//             senderRole: socket.data.role as "user" | "doctor",
//             message,
//             timestamp: new Date(),
//           };
//           const newMessage = await new messageModel(messageData).save();
//           io.to(room).emit("receiveMessage", newMessage);

//           // Update last message for both participants
//           await userModel.findByIdAndUpdate(userId, {
//             lastMessage: message,
//             lastMessageTime: new Date(),
//           });
//           await doctorModel.findByIdAndUpdate(doctorId, {
//             lastMessage: message,
//             lastMessageTime: new Date(),
//           });
//         } catch (error) {
//           console.error("Error in sendMessage:", error);
//           socket.emit("error", "Failed to send message");
//         }
//       }
//     );

//     // Handle video call room creation (doctor only)
//     socket.on("createVideoCallRoom", async (data: { bookingId: string }) => {
//       try {
//         if (role !== "doctor") {
//           socket.emit("error", "Only doctors can create video call rooms");
//           return;
//         }

//         const { bookingId } = data;
//         const booking = await BookingModel.findById(bookingId);

//         if (!booking) {
//           socket.emit("error", "Booking not found");
//           return;
//         }

//         if (booking.doctor_id.toString() !== id) {
//           socket.emit("error", "Unauthorized: Doctor ID does not match");
//           return;
//         }

//         if (
//           booking.modeOfAppointment !== "online" ||
//           booking.status !== AppointmentStatus.CONFIRMED
//         ) {
//           socket.emit("error", "Invalid booking for video call");
//           return;
//         }

//         // Generate unique room ID
//         const roomId = uuidv4();
//         await BookingModel.findByIdAndUpdate(bookingId, {
//           videoCallRoomId: roomId,
//         });

//         // Join the doctor to the room
//         const videoRoom = `video_${roomId}`;
//         socket.join(videoRoom);

//         // Emit room ID to doctor
//         socket.emit("videoCallRoomCreated", { bookingId, roomId });

//         await notificationService.sendVideoCallNotification(
//           bookingId,
//           booking.user_id.toString(),
//           booking.doctor_id.toString(),
//           NotificationType.VIDEO_CALL_STARTING,
//           roomId
//         );

//         // Notify user via their notification room
//         io.to(`user_${booking.user_id}`).emit("videoCallRoomAssigned", {
//           bookingId,
//           roomId,
//         });

//         // Trigger email sending (implement this in BookingService)
//         io.emit("sendVideoCallEmail", {
//           bookingId,
//           roomId,
//           userId: booking.user_id,
//         });
//       } catch (error) {
//         console.error("Error in createVideoCallRoom:", error);
//         socket.emit("error", "Failed to create video call room");
//       }
//     });

//     // Handle joining video call room
//     socket.on(
//       "joinVideoCall",
//       async (data: { roomId: string; bookingId: string }) => {
//         try {
//           const { roomId, bookingId } = data;
//           const booking = await BookingModel.findById(bookingId);

//           if (!booking) {
//             throw new Error("Booking not found");
//           }

//           // Role validation
//           if (role === "doctor" && booking.doctor_id.toString() !== id) {
//             throw new Error("Doctor not authorized for this booking");
//           }

//           if (role === "user" && booking.user_id.toString() !== id) {
//             throw new Error("Patient not authorized for this booking");
//           }

//           const videoRoom = `video_${roomId}`;
//           socket.join(videoRoom);

//           // Notify other participants
//           socket.to(videoRoom).emit("participantJoined", { role });

//           if (role === 'user') {
//           await notificationService.sendVideoCallNotification(
//             bookingId,
//             booking.user_id.toString(),
//             booking.doctor_id.toString(),
//             NotificationType.PATIENT_WAITING,
//             roomId
//           );
//         }

//           console.log(`${role} joined video room ${videoRoom}`);
//         } catch (error : any) {
//           console.error("Join error:", error);
//           socket.emit("error", { message: error.message });
//         }
//       }
//     );

//     // Unified signaling handler
//     socket.on(
//       "signal",
//       (data: {
//         roomId: string;
//         signalData: any;
//         senderRole: "doctor" | "user";
//       }) => {
//         const videoRoom = `video_${data.roomId}`;
//         socket.to(videoRoom).emit("signal", {
//           signalData: data.signalData,
//           senderRole: data.senderRole,
//         });
//       }
//     );
//     // WebRTC signaling events
//     socket.on("offer", (data: { roomId: string; offer: any }) => {
//       const videoRoom = `video_${data.roomId}`;
//       socket.to(videoRoom).emit("offer", data.offer);
//     });

//     socket.on("answer", (data: { roomId: string; answer: any }) => {
//       const videoRoom = `video_${data.roomId}`;
//       socket.to(videoRoom).emit("answer", data.answer);
//     });

//     socket.on("ice-candidate", (data: { roomId: string; candidate: any }) => {
//       const videoRoom = `video_${data.roomId}`;
//       socket.to(videoRoom).emit("ice-candidate", data.candidate);
//     });

//     socket.on("disconnect", () => {
//       console.log(
//         `Disconnected: ${socket.id} (Role: ${socket.data.role}, ID: ${socket.data.id})`
//       );
//     });
//   });

//   return io;
// };
