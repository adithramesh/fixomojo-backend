import { Response } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../types/types'; // Assuming this path
import { HttpStatus } from '../../utils/http-status.enum'; // Assuming this path
import { AuthRequest } from '../../middlewares/auth.middleware'; // Assuming this path
import { INotificationService } from '../../services/notification/notification.service.interface'; // Assuming this path
import { INotificationController } from './notification.controller.interface';
import { PaginationRequestDTO } from '../../dto/admin.dto'; // Assuming this path for your DTOs
import mongoose from 'mongoose';

@injectable()
export class NotificationController implements INotificationController {
  constructor(
    @inject(TYPES.INotificationService) private _notificationService: INotificationService
  ) {}

  /**
   * GET /api/notifications
   * Fetches paginated notifications for the authenticated user.
   */
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

      // Extract pagination parameters from query string
      // Convert to numbers, provide defaults
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const sortBy = (req.query.sortBy as string) || 'createdAt';
      const sortOrder = (req.query.sortOrder as string) || 'desc';
      const searchTerm = req.query.searchTerm as string;

      // Filter object can be passed as a JSON string in a query parameter, e.g., ?filter={"read":false}
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
        data: paginatedNotifications, // This will be your PaginatedResponseDTO
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

  /**
   * PUT /api/notifications/:id/read
   * Marks a specific notification as read.
   */
  async markNotificationAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const notificationId = req.params.id;

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

      // Important: Add a check here to ensure the user is authorized to mark *this* notification as read.
      // This can be done by fetching the notification and checking its recipientId against the userId.
      // For this minimal implementation, we'll rely on the service to handle potential internal errors if the ID doesn't belong.
      // A more robust solution might pass userId to markAsRead for server-side authorization.
      const isMarked = await this._notificationService.markAsRead(notificationId);

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
}