
import { Router } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types/types'; 

import { INotificationController } from '../controllers/notification/notification.controller.interface';
import { authMiddleware } from '../middlewares/auth.middleware';

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
    this.router.use(authMiddleware);
  
    this.router.get('/',this._notificationController.getNotifications.bind(this._notificationController));
    this.router.get('/unread-count', this._notificationController.getUnreadCount.bind(this._notificationController));
    this.router.put('/:id/read', this._notificationController.markNotificationAsRead.bind(this._notificationController));
    this.router.put('/mark-all-read',this._notificationController.markAllNotificationsAsRead.bind(this._notificationController));
    this.router.post('/video-call', this._notificationController.createVideoCallNotification.bind(this._notificationController));
  }
  public getRouter(){
        return this.router
    }
}