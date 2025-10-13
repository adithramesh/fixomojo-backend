import { Request, Response } from "express";
import {  PaginatedResponseDTO, PaginationRequestDTO, ServiceRequestDTO, ServiceResponseDTO, SubServiceRequestDTO, SubServiceResponseDTO, UserResponseDTO } from "../../dto/admin.dto";
import { IAdminController } from "./admin.controller.interface";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types/types";
import { HttpStatus } from "../../utils/http-status.enum";
import { uploadToCloudinary } from "../../utils/cloudinary.uploader";
import mongoose from "mongoose";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { IAdminService } from "../../services/admin/admin.service.interface";
import { StreamTokenResponseDTO } from "../../dto/stream.dto";
import { IStreamService } from "../../services/stream/stream.service.interface";
import { ServiceLookupDTO } from "../../dto/offer.dto";

type EmptyParams = Record<string, never>;

@injectable()
export class AdminController implements IAdminController {
  constructor(
    @inject(TYPES.IAdminService) private _adminService: IAdminService,
    @inject(TYPES.IStreamService) private _streamService : IStreamService
  ) {} 
  async addService(
    req: Request<EmptyParams, object, ServiceRequestDTO>,
    res: Response<ServiceResponseDTO>
  ): Promise<void> {
    try {
      const serviceData = req.body;
      if (req.file) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const uploadResult:any = await uploadToCloudinary(req.file.buffer, 'services');
        serviceData.image = uploadResult.public_id;
      }
      const response = await this._adminService.createService(serviceData);
      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
        console.log("error occured", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async subService(req: Request<EmptyParams, object, SubServiceRequestDTO>, res: Response<SubServiceResponseDTO>): Promise<void> {
    try {
      const subServiceData= req.body;
      const serviceId = subServiceData.serviceId;
      if (req.file) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const uploadResult:any = await uploadToCloudinary(req.file.buffer, 'sub-services');
        subServiceData.image = uploadResult.public_id
      }

      const response = await this._adminService.createSubService(serviceId!, subServiceData)
      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
        console.log("error occured", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getUsers(req:Request, res: Response<PaginatedResponseDTO<UserResponseDTO[]>>): Promise<void> {
    try {
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
        filter: {}
      };      
      const response = await this._adminService.getServices(pagination);
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

      };
      if (req.query.serviceId) {
            const serviceId = req.query.serviceId as string;
            if (mongoose.Types.ObjectId.isValid(serviceId)) {
                pagination.filter.serviceId = serviceId;
            } else {
               res.status(HttpStatus.BAD_REQUEST);
            }
        }
    const serviceName= req.query.serviceName as string
      if(serviceName){
        pagination.filter= {serviceName}
      }
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
      const response = await this._adminService.changeSubServiceStatus(subServiceId)
      res.status(HttpStatus.SUCCESS).json(response);
    } catch (error) {
      console.log("error occured", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async updateService(req:Request<EmptyParams, object, ServiceRequestDTO>, res:Response<ServiceResponseDTO>):Promise<void>{
     try {
      const serviceId = req.params.id
      const serviceData = req.body
       if (req.file) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const uploadResult:any = await uploadToCloudinary(req.file.buffer, 'services');
        serviceData.image = uploadResult.public_id;
      }
      const response = await this._adminService.updateService(serviceId, serviceData)
      res.status(HttpStatus.SUCCESS).json(response);
    } catch (error) {
      console.log("error occured", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }


  async updateSubService(req:Request<EmptyParams, object, SubServiceRequestDTO>, res:Response<SubServiceResponseDTO>):Promise<void>{
    try {
      const subServiceId = req.params.id 
      const subServiceData = req.body
      if (req.file) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const uploadResult:any = await uploadToCloudinary(req.file.buffer, 'sub-services');
        subServiceData.image = uploadResult.public_id;
      }
      const response = await this._adminService.updateSubService(subServiceId, subServiceData)
      res.status(HttpStatus.SUCCESS).json(response);
    } catch (error) {
      console.log("error occured", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async savedLocation(req: AuthRequest, res: Response<string>): Promise<void> {
    try {
      const userId = req.user?.id.toString() ||""
      const response = await this._adminService.savedLocation(userId)
      res.status(HttpStatus.SUCCESS).json(response)
    } catch (error) {
      console.log("error occured", error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  // async getDashboard(req: AuthRequest, res: Response<AdminDashboardResponseDTO>): Promise<void> {
  //   try {
  //     const userId = req.user?.id.toString() ||""
  //     const response = await this._adminService.getDashboard(userId)
  //     res.status(HttpStatus.SUCCESS).json(response)
  //   } catch (error) {
  //     console.log("error occured", error);
  //     res.status(HttpStatus.INTERNAL_SERVER_ERROR)
  //   }
  // }

  async getDashboard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query; // get from query params
      // const userId = req.user?.id; 

      const dashboardData = await this._adminService.getDashboard(
        // userId!,
        startDate as string,
        endDate as string
      );

      res.status(HttpStatus.SUCCESS).json(dashboardData);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch dashboard data' });
    }
  }
  async getStreamToken(req: AuthRequest, res: Response<StreamTokenResponseDTO>): Promise<void> {
    try {
      const userId = req.user?.id;
      const token = await this._streamService.generateStreamToken(userId!);
      res.status(HttpStatus.SUCCESS).json({success:true,message:'Token Generated', data:{token}, status:HttpStatus.SUCCESS})
    } catch (error:unknown) {
      console.error('Error generating Stream token:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAllActiveServices(_req:Request, res:Response<ServiceLookupDTO[]>): Promise<void> {
    try {
      const response = await this._adminService.getAllActiveServices()
      res.status(HttpStatus.SUCCESS).json(response)
    } catch (error:unknown) {
      console.error('Error generating Stream token:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
