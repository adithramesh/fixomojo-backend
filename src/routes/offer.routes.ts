import { Router } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types/types';
import { authMiddleware } from '../middlewares/auth.middleware';
import { IOfferController } from '../controllers/offer/offer.controller.interface';
import { Role } from '../models/user.model';

@injectable()
export class OfferRoutes {
  private router: Router;

  constructor(
    @inject(TYPES.IOfferController) private _offerController: IOfferController
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/add',authMiddleware([Role.ADMIN]), this._offerController.addOffer.bind(this._offerController));
    this.router.get('/all',authMiddleware([Role.ADMIN, Role.USER]), this._offerController.getAllOffers.bind(this._offerController));
    this.router.get('/user-offers',authMiddleware([Role.USER]), this._offerController.getUserOffers.bind(this._offerController));
    this.router.put('/toggle-status/:id',authMiddleware([Role.ADMIN]), this._offerController.toggleOfferStatus.bind(this._offerController));
    this.router.get('/update/:id',authMiddleware([Role.ADMIN]), this._offerController.getOfferById.bind(this._offerController));
    this.router.put('/update/:id',authMiddleware([Role.ADMIN]), this._offerController.updateOffer.bind(this._offerController));
    this.router.delete('/delete-offer/:id',authMiddleware([Role.ADMIN]), this._offerController.deleteOffer.bind(this._offerController))
    this.router.get('/check-offer',authMiddleware([Role.USER]), this._offerController.applyBestOffer.bind(this._offerController))
  }

  public getRouter() {
    return this.router;
  }
}