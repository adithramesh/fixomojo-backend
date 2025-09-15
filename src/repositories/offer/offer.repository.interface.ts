import { FilterQuery } from "mongoose";
import { IOffer } from "../../models/offer.model";
import { IBaseRepository } from "../base.repository.interface";

export interface IOfferRepository extends IBaseRepository<IOffer>  {
  createOffer(data: Partial<IOffer>): Promise<IOffer>;
  findOffersPaginated(skip: number, limit: number, sortBy: string, sortOrder: string, filter: FilterQuery<IOffer>): Promise<IOffer[]>;
  countOffers(filter: FilterQuery<IOffer>): Promise<number>;
  getOfferByType(offerType: string): Promise<IOffer | null>;
  getOfferByServiceCategory(serviceId: string): Promise<IOffer | null>;
  getActiveOffers(filter: FilterQuery<IOffer>): Promise<IOffer[]>;
}