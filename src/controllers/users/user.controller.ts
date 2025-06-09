import { Request, Response } from "express";
import { HomeResponseDTO } from "../../dto/home.dto";
import { IUserController } from "./user.controller.interface"
import { inject, injectable } from "inversify";
import { UserService } from "../../services/users/user.service";
import { TYPES } from "../../types/types";
import { HttpStatus } from "../../utils/http-status.enum";

@injectable()
export class UserController implements IUserController{
    constructor(
        @inject(TYPES.UserService) private _userService:UserService
    ){}
    async getHome( _req: Request,res: Response<HomeResponseDTO>): Promise<void> {
        const response = await this._userService.getHome()
        res.status(HttpStatus.SUCCESS).json(response)
    }

}