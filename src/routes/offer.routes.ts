import { Router } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types/types';
import { authMiddleware } from '../middlewares/auth.middleware';
import { IOfferController } from '../controllers/offer/offer.controller.interface';

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
    this.router.use(authMiddleware);

    this.router.post('/add', this._offerController.addOffer.bind(this._offerController));
    this.router.get('/all', this._offerController.getAllOffers.bind(this._offerController));
    this.router.get('/user-offers', this._offerController.getUserOffers.bind(this._offerController));
    this.router.put('/toggle-status/:id', this._offerController.toggleOfferStatus.bind(this._offerController));
    this.router.get('/update/:id', this._offerController.getOfferById.bind(this._offerController));
    this.router.put('/update/:id', this._offerController.updateOffer.bind(this._offerController));
    this.router.delete('/delete-offer/:id', this._offerController.deleteOffer.bind(this._offerController))
    this.router.get('/check-offer', this._offerController.applyBestOffer.bind(this._offerController))
  }

  public getRouter() {
    return this.router;
  }
}