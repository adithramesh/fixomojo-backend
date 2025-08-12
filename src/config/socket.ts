import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import config from './env';
import { socketAuthMiddleware } from '../middlewares/socket.auth.middleware';
import { injectable, inject } from 'inversify';
import { IChatService } from '../services/chat/chat.service.interface';
import { TYPES } from '../types/types';


@injectable()
export class SocketConfig {
  private io!: Server;

  constructor(
    @inject(TYPES.IChatService) private _chatService: IChatService
  ) {}

  initSocket(httpServer: HttpServer): Server {
    this.io = new Server(httpServer, {
      cors: {
        origin: config.CLIENT_URL,
        methods: ['GET', 'POST'],
        allowedHeaders: ['Authorization', 'Content-Type'],
        credentials: true,
      },
    });

    this.io.use(socketAuthMiddleware);

    this.io.on('connection', (socket: Socket) => {
      console.log('New client connected:', socket.id);

      const user = socket.data.user;
      const bookingId = socket.handshake.query.bookingId as string;

      // **Crucial for Notifications: Join user-specific room**
      // This ensures we can target specific users for notifications.
      if (user && user.id) {
        socket.join(`user:${user.id}`);
        console.log(`User ${user.id} joined personal room user:${user.id}`);
      }
      // --- End crucial part ---


      if (bookingId) {
        socket.join(`booking:${bookingId}`);
        console.log(`User ${user.id} joined room booking:${bookingId}`);
      }

      socket.on('message', async (data: { bookingId: string; messageText: string }) => {
        try {
          const { bookingId, messageText } = data;
          const savedMessage = await this._chatService.sendMessage(
            bookingId,
            messageText,
            user.id,
            user.role
          );

          this.io.to(`booking:${bookingId}`).emit('message', {
            messageId: savedMessage._id!.toString(),
            bookingId: savedMessage.bookingId.toString(),
            messageText: savedMessage.messageText,
            senderType: savedMessage.senderType,
            senderId: savedMessage.senderType === 'user' ? savedMessage.userId.toString() : savedMessage.technicianId.toString(),
            createdAt: savedMessage.createdAt,
          });

           // **Trigger Notification for Chat Message:**
          // Notify the recipient of the chat message if they are not the sender
          const recipientId = user.id === savedMessage.userId.toString() ? savedMessage.technicianId : savedMessage.userId;
          // const recipientRole = user.id === savedMessage.userId.toString() ? savedMessage.technicianRole : savedMessage.userRole; // Assuming these exist on savedMessage
          if (recipientId && recipientId.toString() !== user.id) { // Don't notify self
            // You would need to inject NotificationService here too, or have a shared event bus
            // For simplicity now, let's add a direct emit method to SocketConfig
            this.emitToUser(recipientId.toString(), 'newChatMessage', {
                bookingId: savedMessage.bookingId.toString(),
                senderId: user.id,
                message: messageText,
                // ... other chat-specific data for immediate display
            });
          }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          socket.emit('error', {
            success: false,
            message: error.message || 'Failed to send message',
            status: 400,
          });
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    return this.io;
  }

  getIo(): Server {
    return this.io;
  }

// **New method to emit to a specific user's room**
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emitToUser(userId: string, event: string, data: any): void {
    if (!this.io) {
      console.error("Socket.IO not initialized. Cannot emit.");
      return;
    }
    this.io.to(`user:${userId}`).emit(event, data);
    console.log(`Emitted event '${event}' to user:${userId} with data:`, data);
  }

  // **New method to emit to a specific room (e.g., 'adminNotifications')**
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emitToRoom(roomName: string, event: string, data: any): void {
    if (!this.io) {
      console.error("Socket.IO not initialized. Cannot emit.");
      return;
    }
    this.io.to(roomName).emit(event, data);
    console.log(`Emitted event '${event}' to room:${roomName} with data:`, data);
  }

}