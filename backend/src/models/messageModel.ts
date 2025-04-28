import mongoose, { Schema, Document } from 'mongoose';

interface IMessage extends Document {
  userId: string;
  doctorId: string;
  senderId: string;
  senderRole: 'user' | 'doctor';
  message: string;
  timestamp: Date;
}

const messageSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  doctorId: { type: String, required: true },
  senderId: { type: String, required: true },
  senderRole: { type: String, enum: ['user', 'doctor'], required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model<IMessage>('Message', messageSchema);