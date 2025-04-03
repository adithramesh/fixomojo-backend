import argon2 from 'argon2'

interface IpasswordService{
    hash(password:string):Promise<string>
    verifyPassword(hashedPasswrod:string, password:string):Promise<boolean>
}


export class PasswordService implements IpasswordService{
    async hash(password: string): Promise<string> {
        return argon2.hash(password)
    }
    async verifyPassword(hashedPasswrod: string, password: string): Promise<boolean> {
        return argon2.verify(hashedPasswrod,password)
    }
    
}



