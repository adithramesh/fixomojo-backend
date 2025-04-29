import { Request, Response } from "express";
import { HomeRequestDTO, HomeResponseDTO } from "../dto/home.dto";
import { IUserController } from "./user.controller.interface"
import { inject, injectable } from "inversify";
import { UserService } from "../services/user.service";
import { TYPES } from "../../../types/types";

@injectable()
export class UserController implements IUserController{
    constructor(
        @inject(TYPES.UserService) private _userService:UserService
    ){}
    async getHome(req: Request<HomeRequestDTO>, res: Response<HomeResponseDTO>): Promise<void> {
        const data = req.body
        const response = await this._userService.getHome(data)
        res.status(200).json(response)
        throw new Error("Method not implemented.");
    }

}