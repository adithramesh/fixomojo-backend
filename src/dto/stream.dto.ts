export interface StreamTokenRequestDTO {
  userId: string;
}


export interface StreamTokenResponseDTO {
  success: boolean;
  message: string;
  data: { token: string };
  status: number; 
}