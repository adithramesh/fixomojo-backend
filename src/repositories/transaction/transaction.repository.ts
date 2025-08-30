import Transaction, { ITransaction } from "../../models/transaction.model";
import { BaseRepository } from "../base.repository";
import { ITransactionRepository } from "./transaction.repository.interface";

export class TransactionRepository
  extends BaseRepository<ITransaction>
  implements ITransactionRepository
{
  constructor() {
    super(Transaction);
  }
  async logTransaction(data: Partial<ITransaction>): Promise<ITransaction> {
    return this.create(data);
  }

  async getTransactionByUser(userId: string): Promise<ITransaction | null> {
    return this.findById(userId);
  }

  async getTransactionByReference(referenceId: string): Promise<ITransaction | null> {
    return this.findOne({referenceId})
  }

  async findTransactionsPaginated(
    skip: number,
    limit: number,
    sortBy: string,
    sortOrder: string,
    filter: Record<string, unknown> = {}
  ):Promise<ITransaction[]> {
    const sortDirection: 1 | -1 = sortOrder === "asc" ? 1 : -1;
    const sortOptions: Record<string, 1 | -1> = sortBy
      ? { [sortBy]: sortDirection }
      : {};
    return await Transaction.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .exec();
  }


  async countTransactions(userId: string) {
    const totalTransactions = await this.find({userId});
    const count = totalTransactions.length;
    console.log("length", count);
    return count;
  }
}
