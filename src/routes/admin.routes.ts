import { Router } from 'express'
import { inject, injectable } from 'inversify'
import { TYPES } from '../types/types'
import { authMiddleware } from '../middlewares/auth.middleware'  
import { upload } from '../../src/config/multer.config'
import { IAdminController } from '../controllers/admin/admin.controller.interface'
import { Role } from '../models/user.model'

@injectable()
export class AdminRoutes {
    private router : Router
    constructor(
        @inject(TYPES.IAdminController) private _adminController : IAdminController
    ){
        this.router=Router()
        this.initializeRoutes()
    }
    private initializeRoutes(){

        // Admin-only routes
        this.router.post('/add-service', authMiddleware([Role.ADMIN]), upload.single('image'), this._adminController.addService.bind(this._adminController))
        this.router.post('/services/:id/sub-services', authMiddleware([Role.ADMIN]), upload.single('image'), this._adminController.subService.bind(this._adminController))
        this.router.get('/service/:id', authMiddleware([Role.ADMIN]), (req, res) => this._adminController.getServiceById(req, res))
        this.router.get('/sub-service/:id', authMiddleware([Role.ADMIN]), (req, res) => this._adminController.getSubServiceById(req, res))
        this.router.patch('/users/:id/change-status', authMiddleware([Role.ADMIN]), (req, res) => this._adminController.changeUserStatus(req, res))
        this.router.patch('/services/:id/change-status', authMiddleware([Role.ADMIN]), this._adminController.changeServiceStatus.bind(this._adminController))
        this.router.patch('/sub-services/:id/change-status', authMiddleware([Role.ADMIN]), this._adminController.changeSubServiceStatus.bind(this._adminController))
        this.router.put('/services/:id/update-service', authMiddleware([Role.ADMIN]), upload.single('image'), this._adminController.updateService.bind(this._adminController))
        this.router.put('/sub-services/:id/update-service', authMiddleware([Role.ADMIN]), upload.single('image'), this._adminController.updateSubService.bind(this._adminController))
        this.router.get('/active-services', authMiddleware([Role.ADMIN]), this._adminController.getAllActiveServices.bind(this._adminController))
        //location
        this.router.patch('/partner/:id/location', authMiddleware([Role.ADMIN]), this._adminController.updateUser.bind(this._adminController))
        this.router.get('/saved-location', authMiddleware([Role.ADMIN]), this._adminController.savedLocation.bind(this._adminController))
        //dashboard
        this.router.get('/dashboard', authMiddleware([Role.ADMIN]), this._adminController.getDashboard.bind(this._adminController))
        //video-call
        this.router.post('/stream-token', authMiddleware([Role.ADMIN]), this._adminController.getStreamToken.bind(this._adminController))

        // Admin + User routes 
        this.router.get('/user-management', authMiddleware([Role.ADMIN, Role.USER]), (req, res) => this._adminController.getUsers(req, res))
        this.router.get('/service-management', authMiddleware([Role.ADMIN, Role.USER]), (req, res) => this._adminController.getServices(req, res))
        this.router.get('/sub-service-management', authMiddleware([Role.ADMIN, Role.USER]), (req, res) => this._adminController.getSubServices(req, res))
    }
    public getRouter(){
        return this.router
    }
}