
import { Router } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types/types'; 

import { INotificationController } from '../controllers/notification/notification.controller.interface';
import { authMiddleware } from '../middlewares/auth.middleware';
import { Role } from '../models/user.model';

@injectable()
export class NotificationRoutes {
  public router: Router;

  constructor(
    @inject(TYPES.INotificationController) private _notificationController: INotificationController,
    
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.get('/',authMiddleware(),this._notificationController.getNotifications.bind(this._notificationController));
    this.router.get('/unread-count',authMiddleware(), this._notificationController.getUnreadCount.bind(this._notificationController));
    this.router.put('/:id/read',authMiddleware(), this._notificationController.markNotificationAsRead.bind(this._notificationController));
    this.router.put('/mark-all-read',authMiddleware(),this._notificationController.markAllNotificationsAsRead.bind(this._notificationController));
    this.router.post('/video-call',authMiddleware([Role.ADMIN, Role.PARTNER]), this._notificationController.createVideoCallNotification.bind(this._notificationController));
  }
  public getRouter(){
        return this.router
    }
}