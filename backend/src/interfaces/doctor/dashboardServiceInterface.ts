// interfaces/doctor/dashboardServiceInterface.ts
export interface IDashboardService {
  getDashboardStats(doctorId: string): Promise<any>; 
}
