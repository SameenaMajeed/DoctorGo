import NotificationModel from "../models/commonModel/NotificationModel";
import { Server } from "socket.io";

export const sendNotification = async (
  io: Server,
  recipientId: string,
  recipientRole: "user" | "doctor",
  type: string,
  title: string,
  message: string,
  data?: any
) => {
  const room = `${recipientRole}_${recipientId}`;

  const notification = await new NotificationModel({
    recipientId,
    recipientRole,
    type,
    title,
    message,
    data,
  }).save();

  io.to(room).emit("newNotification", notification);
};
