import { injectable } from "inversify";
import { IJobRepository } from "./job.repository.interface";
import Job,{ IJob } from "../models/job.model";

@injectable()
export class JobRepository implements IJobRepository {
    async createJobDesignation(designation: string): Promise<IJob> {
        return await Job.create(designation) 
    }
    async getAllJobs(): Promise<IJob[]> {
        return await Job.find()
    }
}