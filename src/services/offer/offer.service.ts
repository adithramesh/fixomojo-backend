import { inject, injectable } from "inversify";
import mongoose, { FilterQuery } from "mongoose";
import { PaginationRequestDTO } from "../../dto/admin.dto";
import { IOffer } from "../../models/offer.model";
import { TYPES } from "../../types/types";
import { IBookingRepository } from "../../repositories/booking/booking.repository.interface"; // Assuming this exists based on required logic
import { IOfferRepository } from "../../repositories/offer/offer.repository.interface";
import { IOfferService } from "./offer.service.interface";

@injectable()
export class OfferService implements IOfferService {
  constructor(
    @inject(TYPES.IOfferRepository) private _offerRepository: IOfferRepository,
    @inject(TYPES.IBookingRepository) private _bookingRepository: IBookingRepository
  ) {}

  // async addOffer(data: Partial<IOffer>): Promise<{ success: boolean; message: string; data?: IOffer }> {
  //   try {
  //     const response = await this._offerRepository.createOffer(data);
  //     return {
  //       success: true,
  //       message: "Offer created successfully",
  //       data: response,
  //     };
  //   } catch (error) {
  //     console.error("Error creating offer:", error);
  //     return {
  //       success: false,
  //       message: "Failed to create offer",
  //     };
  //   }
  // }

  async addOffer(data: Partial<IOffer>): Promise<{ success: boolean; message: string; data?: IOffer }> {
    try {
      
      const sanitizedData = { ...data };
      if ( sanitizedData.serviceId === null || sanitizedData.serviceId === undefined) {
        delete sanitizedData.serviceId;
      }
      
      const response = await this._offerRepository.createOffer(sanitizedData);
      return {
        success: true,
        message: "Offer created successfully",
        data: response,
      };
    } catch (error) {
      console.error("Error creating offer:", error);
      return {
        success: false,
        message: "Failed to create offer",
      };
    }
  }

  async getAllOffers(pagination: PaginationRequestDTO): Promise<{
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
  }> {
    try {
      const { page = 1, pageSize = 10, sortBy = "createdAt", sortOrder = "desc", filter = {} } = pagination;
      const skip = (page - 1) * pageSize;
      const result = await this._offerRepository.findOffersPaginated(skip, pageSize, sortBy, sortOrder, filter);
      const total = await this._offerRepository.countOffers(filter);
      const pages = Math.ceil(total / pageSize);
      return {
        success: true,
        message: "Offers fetched successfully",
        data: {
          offers: result,
          pagination: {
            total,
            page,
            pages,
            limit: pageSize,
            hasNextPage: page < pages,
            hasPrevPage: page > 1,
          },
        },
      };
    } catch (error) {
      console.error("Error fetching offers:", error);
      return {
        success: false,
        message: "Failed to fetch offers",
      };
    }
  }

  async getUserOffers(userId: string): Promise<{ success: boolean; message: string; data?: Partial<IOffer & { display_discount: string }>[] }> {
    try {
      const completedBookings = await this._bookingRepository.countBookingsByUserId(userId,{});
      const isFirstTimeUser = completedBookings === 0;

      const filter: FilterQuery<IOffer> = {
        status: "Active",
        valid_until: { $gte: new Date() },
      };

      if (isFirstTimeUser) {
        filter.$or = [
          { offer_type: "global" },
          { offer_type: "service_category" },
          { offer_type: "first_time_user" },
        ];
      } else {
        filter.$or = [
          { offer_type: "global" },
          { offer_type: "service_category" },
        ];
      }

      const result = await this._offerRepository.getActiveOffers(filter);

      const transformedOffers = result.map((offer) => ({
        title: offer.title,
        description: offer.description,
        offer_type: offer.offer_type,
        discount_type: offer.discount_type,
        discount_value: offer.discount_value,
        max_discount: offer.max_discount,
        min_booking_amount: offer.min_booking_amount,
        valid_until: offer.valid_until,
        display_discount:
          offer.discount_type === "percentage"
            ? `${offer.discount_value}% OFF`
            : `₹${offer.discount_value} OFF`,
      }));

      return {
        success: true,
        message: "User offers fetched successfully",
        data: transformedOffers,
      };
    } catch (error) {
      console.error("Error fetching user offers:", error);
      return {
        success: false,
        message: "Failed to fetch user offers",
      };
    }
  }

  async toggleOfferStatus(id: string): Promise<{ success: boolean; message: string; data?: { _id: string; status: string } }> {
    try {
      const offer = await this._offerRepository.findById(id);
      if (!offer) {
        return {
          success: false,
          message: "Offer not found",
        };
      }

      const newStatus = offer.status === "Active" ? "Blocked" : "Active";
      const response = await this._offerRepository.update(id, { status: newStatus });

      if (!response) {
        return {
          success: false,
          message: "Failed to update offer status",
        };
      }

      return {
        success: true,
        message: `Offer ${newStatus === "Active" ? "unblocked" : "blocked"} successfully`,
        data: {
          _id: response._id,
          status: response.status,
        },
      };
    } catch (error) {
      console.error("Error toggling offer status:", error);
      return {
        success: false,
        message: "Failed to toggle offer status",
      };
    }
  }

  async getOfferById(id: string): Promise<IOffer | null> {
    try {
      return await this._offerRepository.findById(id);
    } catch (error) {
      console.error("Error fetching offer:", error);
      return null;
    }
  }

  async updateOffer(offerId: string, updateData: Partial<IOffer>): Promise<{ success: boolean; message: string; data?: IOffer }> {
    try {
      const offer = await this._offerRepository.findById(offerId);
      if (!offer) {
        return {
          success: false,
          message: "Offer not found",
        };
      }

      const updatedOffer = await this._offerRepository.update(offerId, updateData);

      if (!updatedOffer) {
        return {
          success: false,
          message: "Failed to update offer",
        };
      }

      return {
        success: true,
        message: "Offer updated successfully",
        data: updatedOffer,
      };
    } catch (error) {
      console.error("Error updating offer:", error);
      return {
        success: false,
        message: "Failed to update offer",
      };
    }
  }

  async deleteOffer(offerId: string): Promise<{ success: boolean; message: string; }> {
    if (!mongoose.Types.ObjectId.isValid(offerId)) {
      throw new Error('Invalid booking or user ID');
    }
    const offer = await this._offerRepository.findById(offerId);
    if (!offer) {
      throw new Error('Booking not found');
    } else {  
    this._offerRepository.delete(offerId)
    return {success:true, message:"Offer deleted successfully"}
    }
  }

  async applyBestOffer(
    userId: string,
    totalAmount: number
  ): Promise<{
    offerApplied: boolean;
    discountAmount: number;
    finalAmount: number;
    appliedOfferName?: string;
  }> {
    const userBookings = await this._bookingRepository.countBookingsByUserId(userId, {});
    const isFirstTimeUser = userBookings === 0;

    interface OfferFilter {
      status: string;
      valid_until: { $gte: Date };
    }

    const filter: OfferFilter= {
      status: "Active",
      valid_until: { $gte: new Date() }
    };

    const offers = await this._offerRepository.getActiveOffers(filter);

    let bestOfferName: string | undefined = undefined;
    let maxDiscount = 0;

    for (const offer of offers) {
      // Skip if not eligible
      if (offer.min_booking_amount && totalAmount < offer.min_booking_amount) continue;
      if (offer.offer_type === "first_time_user" && !isFirstTimeUser) continue;

      const discount = this.calculateDiscount(offer, totalAmount);
      if (discount > maxDiscount) {
        maxDiscount = discount;
        bestOfferName = offer.title ?? undefined;;
      }
    }

    const finalAmount = totalAmount - maxDiscount;

    return {
      offerApplied: !!bestOfferName,
      discountAmount: maxDiscount,
      finalAmount,
      appliedOfferName: bestOfferName || undefined,
    };
}

private calculateDiscount(offer: IOffer, totalAmount: number): number {
  if (offer.discount_type === "percentage") {
    let discount = (totalAmount * offer.discount_value) / 100;
    if (offer.max_discount) discount = Math.min(discount, offer.max_discount);
    return discount;
  }
  if (offer.discount_type === "flat_amount") {
    return Math.min(offer.discount_value, totalAmount);
  }
  return 0;
}




}