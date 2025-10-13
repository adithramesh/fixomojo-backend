import { Response } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../types/types'; 
import { HttpStatus } from '../../utils/http-status.enum';
import { AuthRequest } from '../../middlewares/auth.middleware'; 
import { INotificationService } from '../../services/notification/notification.service.interface'; 
import { INotificationController } from './notification.controller.interface';
import { PaginationRequestDTO } from '../../dto/admin.dto'; 
import mongoose from 'mongoose';

@injectable()
export class NotificationController implements INotificationController {
  constructor(
    @inject(TYPES.INotificationService) private _notificationService: INotificationService
  ) {}

 
  async getNotifications(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          message: 'Unauthorized: User not authenticated.',
          status: HttpStatus.UNAUTHORIZED,
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const sortBy = (req.query.sortBy as string) || 'createdAt';
      const sortOrder = (req.query.sortOrder as string) || 'desc';
      const searchTerm = req.query.searchTerm as string;

    
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let filter: Record<string, any> = {};
      if (req.query.filter) {
        try {
          filter = JSON.parse(req.query.filter as string);
        } catch (parseError) {
          console.error("Error parsing filter query parameter:", parseError);
          res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            message: 'Invalid filter format. Must be a valid JSON string.',
            status: HttpStatus.BAD_REQUEST,
          });
          return;
        }
      }

      const paginationRequest: PaginationRequestDTO = {
        page,
        pageSize,
        sortBy,
        sortOrder,
        searchTerm,
        filter,
      };

      const paginatedNotifications = await this._notificationService.getNotifications(
        paginationRequest,
        userId
      );

      res.status(HttpStatus.SUCCESS).json({
        success: true,
        data: paginatedNotifications, 
        message: 'Notifications fetched successfully.',
        status: HttpStatus.SUCCESS,
      });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error in NotificationController.getNotifications:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Failed to fetch notifications.',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  /**
   * GET /api/notifications/unread-count
   * Gets the count of unread notifications for the authenticated user.
   */
  async getUnreadCount(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          message: 'Unauthorized: User not authenticated.',
          status: HttpStatus.UNAUTHORIZED,
        });
        return;
      }

      const unreadCount = await this._notificationService.getUnreadCount(userId);

      res.status(HttpStatus.SUCCESS).json({
        success: true,
        data: { count: unreadCount }, // Return count within a 'data' object
        message: 'Unread notification count fetched successfully.',
        status: HttpStatus.SUCCESS,
      });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error in NotificationController.getUnreadCount:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Failed to fetch unread notification count.',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  
  async markNotificationAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const notificationId = req.params.id;
      const { actionTaken } = req.body;

      if (!userId) {
        res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          message: 'Unauthorized: User not authenticated.',
          status: HttpStatus.UNAUTHORIZED,
        });
        return;
      }
      if (!notificationId || !mongoose.Types.ObjectId.isValid(notificationId)) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Invalid notification ID provided.',
          status: HttpStatus.BAD_REQUEST,
        });
        return;
      }
      const isMarked = await this._notificationService.markAsRead(notificationId,actionTaken);

      if (isMarked) {
        res.status(HttpStatus.SUCCESS).json({
          success: true,
          message: 'Notification marked as read successfully.',
          status: HttpStatus.SUCCESS,
        });
      } else {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: 'Notification not found or already read.',
          status: HttpStatus.NOT_FOUND,
        });
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error in NotificationController.markNotificationAsRead:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Failed to mark notification as read.',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  /**
   * PUT /api/notifications/mark-all-read
   * Marks all unread notifications for the authenticated user as read.
   */
  async markAllNotificationsAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          message: 'Unauthorized: User not authenticated.',
          status: HttpStatus.UNAUTHORIZED,
        });
        return;
      }

      const isMarked = await this._notificationService.markAllAsRead(userId);

      if (isMarked) {
        res.status(HttpStatus.SUCCESS).json({
          success: true,
          message: 'All unread notifications marked as read successfully.',
          status: HttpStatus.SUCCESS,
        });
      } else {
        res.status(HttpStatus.SUCCESS).json({ // Still success if nothing was marked, just 0 modified
          success: true,
          message: 'No unread notifications to mark as read.',
          status: HttpStatus.SUCCESS,
        });
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error in NotificationController.markAllNotificationsAsRead:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Failed to mark all notifications as read.',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async createVideoCallNotification(req: AuthRequest, res: Response): Promise<void> {
    try {
      const senderId = req.user?.id;
      const { recipientId, recipientRole, type, message, payload } = req.body;

      if (!senderId || !recipientId || !type || !message) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Missing required fields: recipientId, type, or message.',
          status: HttpStatus.BAD_REQUEST,
        });
        return;
      }

      await this._notificationService.createNotification(
        recipientId,
        recipientRole,
        type,
        message,
        payload,
        new mongoose.Types.ObjectId(senderId),
        req.user?.role
      );

      res.status(HttpStatus.SUCCESS).json({
        success: true,
        message: 'Notification created and sent successfully.',
        status: HttpStatus.SUCCESS,
      });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error in NotificationController.createNotification:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Failed to create notification.',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }
}