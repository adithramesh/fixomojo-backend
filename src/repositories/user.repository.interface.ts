import { IUser } from "../models/user.model";

export interface IUserRepository{
    createUser(signUpData:Partial<IUser>):Promise<string>;
    findUserByPhone(phoneNumber:string):Promise<IUser |null>;
    findUserById(id: string):Promise<IUser | null>;
    updateUser(id:string, updateData:Partial<IUser>): Promise<IUser |null>
}


