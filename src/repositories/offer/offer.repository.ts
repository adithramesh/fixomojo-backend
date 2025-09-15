import { FilterQuery, Types } from "mongoose";
import Offer, { IOffer } from "../../models/offer.model";
import { BaseRepository } from "../base.repository";
import { IOfferRepository } from "./offer.repository.interface";

export class OfferRepository extends BaseRepository<IOffer> implements IOfferRepository {
  
    constructor() {
    super(Offer);
  }

  async createOffer(data: Partial<IOffer>): Promise<IOffer> {
    return this.create(data);
  }

  async findOffersPaginated(
    skip: number,
    limit: number,
    sortBy: string,
    sortOrder: string,
    filter: FilterQuery<IOffer> = {}
  ): Promise<IOffer[]> {
    const sortDirection: 1 | -1 = sortOrder === "asc" ? 1 : -1;
    const sortOptions: Record<string, 1 | -1> = sortBy ? { [sortBy]: sortDirection } : {};
    return await Offer.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async countOffers(filter: FilterQuery<IOffer> = {}): Promise<number> {
    return await Offer.countDocuments(filter);
  }

  async getOfferByType(offerType: string): Promise<IOffer | null> {
    const filter: FilterQuery<IOffer> = {
      offer_type: offerType,
      status: "Active",
      valid_until: { $gte: new Date() },
    };
    return this.findOne(filter);
  }

  async getOfferByServiceCategory(serviceId: string): Promise<IOffer | null> {
    const filter: FilterQuery<IOffer> = {
      offer_type: "service_category",
      serviceId: new Types.ObjectId(serviceId),
      status: "Active",
      valid_until: { $gte: new Date() },
    };
    return this.findOne(filter);
  }

  async getActiveOffers(filter: FilterQuery<IOffer>): Promise<IOffer[]> {
    return await Offer.find(filter).sort({ createdAt: -1 }).exec();
  }
}