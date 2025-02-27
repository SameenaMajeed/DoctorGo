export interface IAdminService {
  adminLogin(
    email: string,
    password: string
  ): Promise<{ admin: any; accessToken: string; refreshToken: string }>;
  refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }>;

  getPendingDoctors(page : number ,  limit: number , searchTerm: string): Promise<{ doctors: any[]; total: number }>;

  updateDoctorStatus(doctorId: string, isBlocked: boolean,  blockReason?: string) : Promise<any>;

  getAllDoctors(
    page: number,
    limit: number,
    searchTerm: string,
    isBlocked: string
  ): Promise<{ doctors: any[]; total: number }>;

  getAllUsers(
    page: number,
    limit: number,
    searchTerm: string,
    isBlocked: string
  ): Promise<{ users: any[]; total: number }>;

  doctorBlock(doctorId: string, isBlocked: boolean): Promise<any>;
  userBlock(userId: string, isBlocked: boolean): Promise<any>;
}
