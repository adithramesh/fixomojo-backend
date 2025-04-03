
import User, { IUser } from "../models/user.model";
import { IUserRepository } from "./user.repository.interface";

export class UserRepository implements IUserRepository{
    async createUser(signUpData: Partial<IUser>): Promise<IUser> {
        return User.create(signUpData)
    }
    async findUserByEmail(email: string): Promise<IUser | null> {
        return User.findOne({email})
    }
    async findUserById(id: string): Promise<IUser | null> {
        return User.findById(id)
    }
    async updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
        return User.findByIdAndUpdate(id,updateData,{new:true})
    }
    
}