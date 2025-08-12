import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware'; // Assuming this path

export interface INotificationController {
  getNotifications(req: AuthRequest, res: Response): Promise<void>;
  getUnreadCount(req: AuthRequest, res: Response): Promise<void>;
  markNotificationAsRead(req: AuthRequest, res: Response): Promise<void>;
  markAllNotificationsAsRead(req: AuthRequest, res: Response): Promise<void>;
}