import { PaginationRequestDTO } from "../../dto/admin.dto";
import { IOffer } from "../../models/offer.model";

export interface IOfferService{
  addOffer(data: Partial<IOffer>): Promise<{ success: boolean; message: string; data?: IOffer }>;
  getAllOffers(pagination: PaginationRequestDTO): Promise<{
    success: boolean;
    message: string;
    data?: {
      offers: IOffer[];
      pagination: {
        total: number;
        page: number;
        pages: number;
        limit: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    };
  }>;
  getUserOffers(userId: string): Promise<{ success: boolean; message: string; data?: Partial<IOffer & { display_discount: string }>[] }>;
  toggleOfferStatus(id: string): Promise<{ success: boolean; message: string; data?: { _id: string; status: string } }>;
  getOfferById(id: string): Promise<IOffer | null>
  updateOffer(offerId: string, updateData: Partial<IOffer>): Promise<{ success: boolean; message: string; data?: IOffer }>;
  deleteOffer(offerId:string):Promise<{success:boolean; message: string}>
  applyBestOffer(userId: string,totalAmount: number): Promise<{offerApplied: boolean;discountAmount: number;finalAmount: number;appliedOfferName?: string;}>
}