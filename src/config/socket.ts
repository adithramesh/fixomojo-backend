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
}