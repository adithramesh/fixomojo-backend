import { Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types/types";
import { HttpStatus } from "../../utils/http-status.enum";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { PaginationRequestDTO } from "../../dto/admin.dto";
import { IOfferService } from "../../services/offer/offer.service.interface";
import { IOfferController } from "./offer.controller.interface";

@injectable()
export class OfferController implements IOfferController {
  constructor(@inject(TYPES.IOfferService) private _offerService: IOfferService) {}

  async addOffer(req: AuthRequest, res: Response): Promise<void> {
    try {
      const data = req.body;
      const result = await this._offerService.addOffer(data);
      if (result.success) {
        res.status(HttpStatus.SUCCESS).json({ success: true, data: result.data, message: result.message });
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: result.message });
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Failed to add offer:", error);
      res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: error.message || "Failed to add offer" });
    }
  }

  async getAllOffers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const pagination: PaginationRequestDTO = {
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 10,
        sortBy: (req.query.sortBy as string) || "createdAt",
        sortOrder: (req.query.sortOrder as string) || "desc",
        filter: {},
      };
      const result = await this._offerService.getAllOffers(pagination);
      if (result.success) {
        res.status(HttpStatus.SUCCESS).json({ success: true, data: result.data, message: result.message });
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: result.message });
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Failed to get offers:", error);
      res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: error.message || "Failed to get offers" });
    }
  }

  async getUserOffers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id.toString() || "";
      const result = await this._offerService.getUserOffers(userId);
      if (result.success) {
        res.status(HttpStatus.SUCCESS).json({ success: true, data: result.data, message: result.message });
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: result.message });
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Failed to get user offers:", error);
      res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: error.message || "Failed to get user offers" });
    }
  }

  async toggleOfferStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const result = await this._offerService.toggleOfferStatus(id);
      if (result.success) {
        res.status(HttpStatus.SUCCESS).json({ success: true, data: result.data, message: result.message });
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: result.message });
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Failed to toggle offer status:", error);
      res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: error.message || "Failed to toggle offer status" });
    }
  }

  async getOfferById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id;
    const offer = await this._offerService.getOfferById(id);
    if (offer) {
      res.status(HttpStatus.SUCCESS).json({ success: true, data: offer });
    } else {
      res.status(HttpStatus.NOT_FOUND).json({ success: false, message: "Offer not found" });
    }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: error.message });
  }
}

  async updateOffer(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const data = req.body;
      const result = await this._offerService.updateOffer(id, data);
      if (result.success) {
        res.status(HttpStatus.SUCCESS).json({ success: true, data: result.data, message: result.message });
      } else {
        res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: result.message });
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Failed to update offer:", error);
      res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: error.message || "Failed to update offer" });
    }
  }

  async deleteOffer(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id= req.params.id
      const result = await this._offerService.deleteOffer(id)
      res.status(HttpStatus.SUCCESS).json({ success: true, message: result.message });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Failed to delete offer:", error);
      res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: error.message || "Failed to delete offer" });
    }
  }  

  async applyBestOffer(req:AuthRequest, res:Response): Promise<void>{
    try {
      const id= req.user?.id.toString() || "";
      const price=Number(req.query.price)
      if (isNaN(price)) {
        res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "Invalid price value" });
      }
      const appliedOfferDetails = await this._offerService.applyBestOffer(id, price)
      res.status(HttpStatus.SUCCESS).json( appliedOfferDetails );
    } catch (error) {
      console.error("Failed to delete offer:", error);
      res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "Failed to delete offer" });
    }
  }
}