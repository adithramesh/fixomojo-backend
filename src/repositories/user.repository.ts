import mongoose from "mongoose";
import User, { IUser } from "../models/user.model";
import { IUserRepository } from "./user.repository.interface";
import { injectable } from "inversify";

@injectable()
export class UserRepository implements IUserRepository{
    async createUser(signUpData: Partial<IUser>): Promise<string> { 
        const user = await User.create(signUpData);
        return (user._id as mongoose.Types.ObjectId).toString();
    }
    async findUserByPhone(phoneNumber: string): Promise<IUser | null> {
        return await User.findOne({phoneNumber})
    }
    async findUserById(id: string): Promise<IUser | null> {
        return await User.findById(id)
    }
    async updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
        return await User.findByIdAndUpdate(id,updateData,{new:true})
    } 
}