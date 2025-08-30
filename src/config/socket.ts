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

  /**
   * Initializes the Socket.IO server with the provided HTTP server.
   * This method must be called once at the start of the application.
   * @param httpServer The Node.js HTTP server instance.
   */
  initSocket(httpServer: HttpServer): void {
    if (this.io) {
      console.warn('Socket.IO is already initialized.');
      return;
    }

    this.io = new Server(httpServer, {
      cors: {
        origin: config.CLIENT_URL,
        methods: ['GET', 'POST'],
        allowedHeaders: ['Authorization', 'Content-Type'],
        credentials: true,
      },
    });

    this.io.use(socketAuthMiddleware);
    this.initListeners();
  }

 
  private initListeners(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log('New client connected:', socket.id);
      const user = socket.data.user;

      // Join user-specific room
      if (user && user.id) {
        socket.join(`user:${user.id}`);
        console.log(`User ${user.id} joined personal room user:${user.id}`);
      }

      // New event listener for joining a booking room
      socket.on('joinBookingRoom', (bookingId: string) => {
        if (bookingId) {
            socket.join(`booking:${bookingId}`);
            console.log(`User ${user.id} joined booking room: booking:${bookingId}`);
        }
      });

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

          // Trigger Notification for Chat Message
          const recipientId = user.id === savedMessage.userId.toString() ? savedMessage.technicianId : savedMessage.userId;
          if (recipientId && recipientId.toString() !== user.id) {
            this.emitToUser(recipientId.toString(), 'newChatMessage', {
                bookingId: savedMessage.bookingId.toString(),
                senderId: user.id,
                message: messageText,
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
  }

  getIo(): Server {
    if (!this.io) {
      throw new Error("Socket.IO not initialized. Call initSocket() first.");
    }
    return this.io;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emitToUser(userId: string, event: string, data: any): void {
    if (!this.io) {
      console.error("Socket.IO not initialized. Cannot emit.");
      return;
    }
    this.io.to(`user:${userId}`).emit(event, data);
    console.log(`Emitted event '${event}' to user:${userId} with data:`, data);
  }

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