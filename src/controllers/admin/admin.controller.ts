import { Request, Response } from "express";
import { PaginatedResponseDTO, PaginationRequestDTO, ServiceRequestDTO, ServiceResponseDTO, SubServiceResponseDTO, UserResponseDTO } from "../../dto/admin.dto";
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

  async subService(req: Request, res: Response<SubServiceResponseDTO>): Promise<void> {
    try {
      const subServiceData= req.body;
      const serviceId = req.params.id;
      console.log("subServiceData", subServiceData);
      
      const response = await this._adminService.createSubService(serviceId, subServiceData)
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
        searchTerm:(req.query.searchTerm as string) || '',
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
        searchTerm:(req.query.searchTerm as string) || '',
        filter:  {}
      };
      console.log("paginaton in getServices", pagination);
      
      const response = await this._adminService.getServices(pagination);
      console.log("response",response);
      
      res.status(HttpStatus.SUCCESS).json(response);
    } catch (error) {
      console.log("error occured", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getSubServices(req: Request, res: Response<PaginatedResponseDTO<SubServiceResponseDTO[]>>): Promise<void> {
    try {
      const pagination: PaginationRequestDTO = {
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 10,
        sortBy: (req.query.sortBy as string) || 'subServiceName',
        sortOrder: (req.query.sortOrder as string) || 'asc',
        searchTerm: req.query.searchTerm as string || '',
        filter:  {},
        
        // {
        //   serviceId: req.query.serviceId ? { serviceId: req.query.serviceId as string } : {}
        // }
      };
      const serviceName= req.query.serviceName as string
      if(serviceName){
        console.log("inside service id filter");
        pagination.filter= {serviceName}
      }
      console.log('Received pagination:', pagination);
      const response = await this._adminService.getSubServices(pagination);
      res.status(HttpStatus.SUCCESS).json(response);
    } catch (error) {
      console.error('Error occurred in getSubServices:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getServiceById(req:Request, res:Response<ServiceResponseDTO>):Promise<void>{
    try {
      const serviceId= req.params.id as string
      const response = await this._adminService.getServiceById(serviceId)
      res.status(HttpStatus.SUCCESS).json(response);
    } catch (error) {
      console.error('Error occurred in getServicesById:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getSubServiceById(req:Request, res:Response<SubServiceResponseDTO>):Promise<void>{
    try {
      const subServiceId= req.params.id as string
      const response = await this._adminService.getSubServiceById(subServiceId)
      res.status(HttpStatus.SUCCESS).json(response);
    } catch (error) {
      console.error('Error occurred in getSubServicesById:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR);
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

  async updateUser(req: Request, res: Response<UserResponseDTO>): Promise<void> {
     try {
      const userId = req.params.id
      const {address,latitude, longitude} = req.body
       const updatePayload = {
      location: {
        address,
        latitude,
        longitude
      }
    };
      console.log("updatePayload", updatePayload);
      
      const response = await this._adminService.updateUser(userId, updatePayload)
      res.status(HttpStatus.SUCCESS).json(response);
    } catch (error) {
      console.log("error occured", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async changeServiceStatus(req: Request, res: Response<ServiceResponseDTO>): Promise<void> {
    try {
      const serviceId=req.params.id;
      console.log("serviceId",serviceId);
      
      const response = await this._adminService.changeServiceStatus(serviceId)
      res.status(HttpStatus.SUCCESS).json(response);
    } catch (error) {
      console.log("error occured", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

   async changeSubServiceStatus(req: Request, res: Response<SubServiceResponseDTO>): Promise<void> {
    try {
      const subServiceId=req.params.id;
      console.log("subServiceId",subServiceId);
      const response = await this._adminService.changeSubServiceStatus(subServiceId)
      res.status(HttpStatus.SUCCESS).json(response);
    } catch (error) {
      console.log("error occured", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async updateService(req:Request, res:Response<ServiceResponseDTO>):Promise<void>{
     try {
      const serviceId = req.params.id
      const serviceData = req.body
      const response = await this._adminService.updateService(serviceId, serviceData)
      res.status(HttpStatus.SUCCESS).json(response);
    } catch (error) {
      console.log("error occured", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }


  async updateSubService(req:Request, res:Response<SubServiceResponseDTO>):Promise<void>{
    try {
      const subServiceId = req.params.id
      const subServiceData = req.body
      const response = await this._adminService.updateSubService(subServiceId, subServiceData)
      res.status(HttpStatus.SUCCESS).json(response);
    } catch (error) {
      console.log("error occured", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
