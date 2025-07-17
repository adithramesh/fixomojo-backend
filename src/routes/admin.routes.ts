import { Router } from 'express'
import { inject, injectable } from 'inversify'
import { TYPES } from '../types/types'
import { authMiddleware } from '../middlewares/auth.middleware'
import { upload } from '../../src/config/multer.config'
import { IAdminController } from '../controllers/admin/admin.controller.interface'

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
        this.router.use(authMiddleware);
        this.router.post('/add-service',upload.single('image'),this._adminController.addService.bind(this._adminController))
        this.router.post('/services/:id/sub-services',upload.single('image'),this._adminController.subService.bind(this._adminController))
        this.router.get('/user-management', (req, res) => this._adminController.getUsers(req, res))
        this.router.get('/service-management', (req, res) => this._adminController.getServices(req, res))
        this.router.get('/sub-service-management', (req, res) => this._adminController.getSubServices(req, res))
        this.router.get('/service/:id', (req, res) => this._adminController.getServiceById(req, res))
        this.router.get('/sub-service/:id', (req, res) => this._adminController.getSubServiceById(req, res))
        this.router.patch('/users/:id/change-status',(req, res) => this._adminController.changeUserStatus(req, res))
        this.router.patch('/services/:id/change-status',this._adminController.changeServiceStatus.bind(this._adminController))
        this.router.patch('/sub-services/:id/change-status',this._adminController.changeSubServiceStatus.bind(this._adminController))
        this.router.put('/services/:id/update-service',upload.single('image'), this._adminController.updateService.bind(this._adminController))
        this.router.put('/sub-services/:id/update-sub-service',upload.single('image'),this._adminController.updateSubService.bind(this._adminController))

        //location
        this.router.patch('/partner/:id/location',this._adminController.updateUser.bind(this._adminController))
        this.router.get('/saved-location',this._adminController.savedLocation.bind(this._adminController))
    }

    public getRouter(){
        return this.router
    }
}