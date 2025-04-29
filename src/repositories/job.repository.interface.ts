import { IJob } from "../models/job.model";

export interface IJobRepository {
    createJobDesignation(designation:string):Promise<IJob>
    getAllJobs():Promise<IJob[]>
}