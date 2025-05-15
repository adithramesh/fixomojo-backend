import { Request, Response } from "express";
import { PaginatedResponseDTO, PaginationRequestDTO, ServiceRequestDTO, ServiceResponseDTO, UserResponseDTO } from "../../dto/admin.dto";
import { IAdminController } from "./admin.controller.interface";
import { inject, injectable } from "inversify";
import { AdminService } from "../../services/admin/admin.service";
import { TYPES } from "../../types/types";
import { HttpStatus } from "../../utils/http-status.enum";

@injectable()
export class AdminController implements IAdminController {
  constructor(
    @inject(TYPES.AdminService) private _adminService: AdminService
  ) {}
  async addService(
    req: Request<ServiceRequestDTO>,
    res: Response<ServiceResponseDTO>
  ): Promise<void> {
    try {
      const serviceData = req.body;
      console.log("serviceData",serviceData);
      
      const response = await this._adminService.createService(serviceData);
      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
        console.log("error occured", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getUsers(req:Request, res: Response<PaginatedResponseDTO<UserResponseDTO[]>>): Promise<void> {
    try {
      console.log("inside getUsers");
      
      const pagination: PaginationRequestDTO = {
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 10,
        sortBy: (req.query.sortBy as string) || 'username',
        sortOrder: (req.query.sortOrder as string) || 'asc',
        filter:{}
      };
      const roleFilter = req.query.role as string;
      if(roleFilter && (roleFilter==='user' || roleFilter==='partner')){
        pagination.filter={role:roleFilter}
      }
      const response = await this._adminService.getUsers(pagination);
      res.status(HttpStatus.SUCCESS).json(response);
    } catch (error) {
      console.log("error occured", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getServices(req: Request, res: Response<PaginatedResponseDTO<ServiceResponseDTO[]>>): Promise<void> {
    try {
      const pagination: PaginationRequestDTO = {
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 10,
        sortBy: (req.query.sortBy as string) || 'serviceName',
        sortOrder: (req.query.sortOrder as string) || 'asc',
        filter:{}
      };
      const response = await this._adminService.getServices(pagination);
      console.log("response",response);
      
      res.status(HttpStatus.SUCCESS).json(response);
    } catch (error) {
      console.log("error occured", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async changeUserStatus(req: Request, res: Response<UserResponseDTO>): Promise<void> {
    try {
      const userId=req.params.id;
      const  licenseStatusObject  = req.body;
      console.log("userId",userId);
      const response = await this._adminService.changeUserStatus(userId, licenseStatusObject.licenseStatus)
      res.status(HttpStatus.SUCCESS).json(response);
    } catch (error) {
      console.log("error occured", error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async changeServiceStatus(req: Request, res: Response<ServiceResponseDTO>): Promise<void> {
    try {
      const serviceId=req.params.id;
      console.log("userId",serviceId);
      
      const response = await this._adminService.changeServiceStatus(serviceId)
      res.status(HttpStatus.SUCCESS).json(response);
    } catch (error) {
      console.log("error occured", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
