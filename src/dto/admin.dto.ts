// import mongoose from "mongoose";

export interface PaginationRequestDTO {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: string | "asc" | "desc";
  searchTerm?:string;
  status?:string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filter?:any;
  // filter?: Record<string, unknown>;
}

export interface PaginatedResponseDTO<T> {
  items: T;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  status?: string;
}

export interface ServiceRequestDTO {
  serviceName: string;
  image: string;
  description?: string;
}

export interface ServiceResponseDTO {
  id?: string | number;
  serviceName: string;
  image?: string;
  description?: string;
  status?: string;
  createdAt?: string;
  updatedAt?:string;
  message?:string;
}

export interface SubServiceRequestDTO {
  serviceId?:string;
  subServiceName: string;
  price: number;
  description?: string;
  image?: string;
  status: "active" | "blocked" | "suspended" | "deleted";
}

export interface SubServiceResponseDTO {
  id: string;
  subServiceName: string;
  serviceId?: string;
  serviceName?: string;
  price?: number;
  description?: string;
  image?: string;
  status: "active" | "blocked" | "suspended" | "deleted";
  createdAt?: string;
  updatedAt?: string;
}

export interface UserResponseDTO {
  id?: string | number;
  username: string;
  phoneNumber: string;
  image?:string;
  email: string;
  status?: string;
  licenseStatus?: string;
  role: string;
  createdAt?: string;
  location?: {
    address?: string;
    latitude: number;
    longitude: number;
  };
  experience?:number;
  rating?:number;
}

export interface AdminDashboardResponseDTO {
  totalRevenue:number;
  totalBookings:number;
  activePartners:number;
  totalCustomers:number;
  bookingStatusDistribution?: { status: string; count: number }[];
  revenueTrends?: { week: number; totalRevenue: number }[];
}
