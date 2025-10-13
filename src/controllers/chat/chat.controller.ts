import { Response } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../types/types';
import { HttpStatus } from '../../utils/http-status.enum';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { IChatService } from '../../services/chat/chat.service.interface';
import { IChatController } from './chat.controller.interface';

@injectable()
export class ChatController implements IChatController {
  constructor(
    @inject(TYPES.IChatService) private _chatService: IChatService
  ) {}

  async getChatHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const bookingId = req.params.bookingId;
      const userId = req.user?.id;
      const role = req.user?.role;

      if (!userId || !role) {
        res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          message: 'Unauthorized',
          status: HttpStatus.UNAUTHORIZED,
        });
        return;
      }

      const messages = await this._chatService.getChatHistory(bookingId, userId, role);
      res.status(HttpStatus.SUCCESS).json({
        success: true,
        data: messages,
        status: HttpStatus.SUCCESS,
      });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
     const statusCode = 
      error.message === 'Unauthorized access to chat' ? HttpStatus.UNAUTHORIZED :
      error.message === 'Booking not found' ? HttpStatus.NOT_FOUND :
      error.message === 'Invalid booking ID' ? HttpStatus.BAD_REQUEST :
      HttpStatus.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to fetch chat history',
        status: statusCode,
      });
    }
  }

  async getActiveChats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          message: 'Unauthorized',
          status: HttpStatus.UNAUTHORIZED,
        });
        return;
      }

      const activeChats = await this._chatService.getActiveChats(userId);
      res.status(HttpStatus.SUCCESS).json({
        success: true,
        data: activeChats,
        status: HttpStatus.SUCCESS,
      });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: error.message || 'Failed to fetch active chats',
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }
}