import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";


export interface IOfferController {
  addOffer(req: AuthRequest, res: Response): Promise<void>;
  getAllOffers(req: AuthRequest, res: Response): Promise<void>;
  getUserOffers(req: AuthRequest, res: Response): Promise<void>;
  toggleOfferStatus(req: AuthRequest, res: Response): Promise<void>;
  getOfferById(req: AuthRequest, res: Response): Promise<void>
  updateOffer(req: AuthRequest, res: Response): Promise<void>;
  deleteOffer(req:AuthRequest, res:Response): Promise<void>;
  applyBestOffer(req:AuthRequest, res:Response): Promise<void>
}