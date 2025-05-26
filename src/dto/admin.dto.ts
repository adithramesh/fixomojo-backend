export interface PaginationRequestDTO {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: string | "asc" | "desc";
  searchTerm?:string;
  filter?: Record<string, unknown>;
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
  // subServices?: SubServiceResponseDTO[];
  status?: string;
  createdAt?: string;
  updatedAt?:string;
}

export interface SubServiceRequestDTO {
  serviceId:string;
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
  email: string;
  status?: string;
  licenseStatus?: string;
  role: string;
  createdAt?: string;
  // Add other needed properties
}
