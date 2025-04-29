export interface HomeRequestDTO{
    userId:string
}

export interface HomeResponseDTO{
    serviceNames?:string[]
    subSevice?:string[]
    offers?:string[]
}