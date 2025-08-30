import mongoose from "mongoose";
import User, { IUser } from "../../models/user.model";
import { BaseRepository } from "../base.repository";
import { IUserRepository } from "./user.repository.interface";
import { injectable } from "inversify";

@injectable()
export class UserRepository extends BaseRepository<IUser> implements IUserRepository {
    constructor() {
    super(User); 
    }
    async createUser(signUpData: Partial<IUser>): Promise<string> { 
        const user = await this.create(signUpData);
        return (user._id as mongoose.Types.ObjectId).toString();
    }
    async findUserByPhone(phoneNumber: string): Promise<IUser | null> {
        return await this.findOne({phoneNumber})
    }
    async findUserById(id: string): Promise<IUser | null> {
        return await this.findById(id)
    }
    async updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
        return await User.findByIdAndUpdate(id,updateData,{new:true})
    } 
    async findAllUsers(): Promise<IUser[]> {
        const users = await this.find()
        return users
    }

    async findUsersPaginated(skip: number,limit: number,sortBy: string,sortOrder: string,filter:Record<string, unknown> = {}) 
    {
        const sortDirection: 1 | -1 = sortOrder === 'asc' ? 1 : -1; 
        const sortOptions: Record<string, 1 | -1> = sortBy ? { [sortBy]: sortDirection } : {}; 
        return await User.find(filter)
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .exec();
      }
    
    async countUsers(filter: Record<string, unknown> = {}) {
        return await this.count(filter);
    }

}