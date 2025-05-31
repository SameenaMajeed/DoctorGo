import { io, Socket } from 'socket.io-client';

interface Notification {
  _id: string;
  userId?: string;
  doctorId?: string;
  bookingId?: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

interface SocketData {
  token: string;
  role: 'user' | 'doctor';
}

export class SocketClient {
  private socket: Socket;
  private listeners: { [key: string]: (data: any) => void } = {};

  constructor(data: SocketData) {
    this.socket = io(process.env.REACT_APP_API_URL || 'http://localhost:3000', {
      auth: { token: data.token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.socket.emit('getNotifications');
    });

    this.socket.on('notifications', (notifications: Notification[]) => {
      this.emit('notifications', notifications);
    });

    this.socket.on('notification', (notification: Notification) => {
      this.emit('notification', notification);
    });

    this.socket.on('error', (error: string) => {
      console.error('Socket error:', error);
      this.emit('error', error);
    });
  }

  on(event: string, callback: (data: any) => void) {
    this.listeners[event] = callback;
  }

  emit(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event](data);
    }
  }

  markNotificationRead(notificationId: string) {
    this.socket.emit('markNotificationRead', notificationId);
  }

  joinVideoCall(roomId: string, bookingId: string) {
    this.socket.emit('joinVideoCall', { roomId, bookingId });
  }

  sendSignal(roomId: string, signalData: any, senderRole: 'doctor' | 'user') {
    this.socket.emit('signal', { roomId, signalData, senderRole });
  }

  disconnect() {
    this.socket.disconnect();
  }
}