import Wallet, { IWallet } from "../../models/wallet.model";
import { BaseRepository } from "../base.repository";
import { IWalletRepository } from "./wallet.repository.interface";

export class WalletRepository extends BaseRepository<IWallet> implements IWalletRepository {

  constructor(){
    super(Wallet);
  }

async findWalletByUserId(userId: string): Promise<IWallet | null> {
  return this.findOne({ userId }); 
}

async updateBalance(userId: string, amount: number): Promise<IWallet | null> {
  return Wallet.findOneAndUpdate(
    { userId },
    { $inc: { balance: amount }, $set: { updatedAt: new Date() } },
    { new: true }
  );
}

async createWallet(userId: string, role:  "partner" | "admin" | "user" | undefined, share: number, referenceId?: string): Promise<IWallet> {
  return this.create({
    userId,
    role,
    balance: share,
    referenceId,
    currency: 'INR',
  });
}

}