
export interface PaginationRequestDTO {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: string| 'asc' | 'desc';
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
      status?: string;
      createdAt?: string;
    }

    export interface UserResponseDTO {
      id?: string | number;
      username: string;
      phoneNumber: string;
      email:string;
      status?: string;
      licenseStatus?:string;
      role: string;
      createdAt?: string;
      // Add other needed properties
  }
    