export interface PartnerDashboardResponseDTO {
  totalRevenue:number;
  totalBookings:number;
  completedBookings:number;
  cancelledBookings:number
  avgTaskPerDay?:number
}