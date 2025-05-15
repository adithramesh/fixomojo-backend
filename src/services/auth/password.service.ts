import argon2 from 'argon2'
import { injectable } from 'inversify'
interface IpasswordService{
    hash(password:string):Promise<string>
    verifyPassword(hashedPasswrod:string, storedPassword:string):Promise<boolean>
}
@injectable()
export class PasswordService implements IpasswordService{
    async hash(password: string): Promise<string> {
        return argon2.hash(password)
    }
    async verifyPassword(password: string, storedPassword: string): Promise<boolean> {
        return argon2.verify(storedPassword,password)
    } 
}



