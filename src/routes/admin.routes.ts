import { Router } from 'express'
import { inject, injectable } from 'inversify'
import { TYPES } from '../types/types'
import { AdminController } from '../controllers/admin/admin.controller'
import { authMiddleware } from '../middlewares/auth.middleware'

@injectable()
export class AdminRoutes {
    private router : Router
    constructor(
        @inject(TYPES.AdminController) private _adminController : AdminController
    ){
        this.router=Router()
        this.initializeRoutes()
    }
    private initializeRoutes(){
        this.router.use(authMiddleware);
        this.router.post('/add-service',this._adminController.addService.bind(this._adminController))
        this.router.get('/user-management', (req, res) => this._adminController.getUsers(req, res))
        this.router.get('/service-management', (req, res) => this._adminController.getServices(req, res))
        // this.router.patch('/users/:id/change-status',this._adminController.changeUserStatus.bind(this._adminController))
        this.router.patch('/users/:id/change-status',(req, res) => this._adminController.changeUserStatus(req, res))
        this.router.patch('/services/:id/change-status',this._adminController.changeServiceStatus.bind(this._adminController))
    }

    public getRouter(){
        return this.router
    }
}