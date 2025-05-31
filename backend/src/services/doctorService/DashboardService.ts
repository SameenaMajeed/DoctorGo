// services/DashboardService.ts
import { IDoctorRepository } from "../../interfaces/doctor/doctorRepositoryInterface";
import { UserRepositoryInterface as IPatientRepository } from "../../interfaces/user/UserRepositoryInterface";
import { IBookingRepository as IAppointmentRepository } from "../../interfaces/Booking/BookingRepositoryInterface";
import IPrescriptionRepository  from "../../interfaces/prescription/IPrescriptionRepository";

export class DashboardService {
  constructor(
    private doctorRepository: IDoctorRepository,
    private patientRepository: IPatientRepository,
    private appointmentRepository: IAppointmentRepository,
    private prescriptionRepository: IPrescriptionRepository
  ) {}

  async getDashboardStats(doctorId: string) {
    // Verify doctor exists
    const doctor = await this.doctorRepository.findById(doctorId);
    if (!doctor) {
      throw new Error("Doctor not found");
    }

    // Get all stats in parallel
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [
      totalPatients,
      newPatients,
      totalPrescriptions,
      monthlyEarnings,
      recentAppointments
    ] = await Promise.all([
      this.countPatientsByDoctor(doctorId),
      this.countNewPatients(doctorId, thirtyDaysAgo),
      this.prescriptionRepository.findPrescriptions(doctorId, "", undefined, 1, 1, "").then(res => res.total),
      this.getMonthlyEarnings(doctorId, sixMonthsAgo),
      this.getRecentAppointmentsWithPatients(doctorId)
    ]);

    // Calculate total earnings from monthly earnings
    const totalEarnings = monthlyEarnings.reduce(
      (sum, month) => sum + month.total,
      0
    );

    return {
      totalPatients,
      newPatients,
      totalPrescriptions,
      totalEarnings,
      monthlyEarnings,
      recentPatients: this.mapAppointmentsToPatients(recentAppointments)
    };
  }

  private async countPatientsByDoctor(doctorId: string): Promise<number> {
    // Since your patient repository is actually UserRepositoryInterface,
    // we need to count patients through appointments
    const result = await this.appointmentRepository.getPatientsForDoctor(doctorId, 1, 1);
    return result.total;
  }

  private async countNewPatients(doctorId: string, since: Date): Promise<number> {
    // Count new patients through appointments created after 'since' date
    const result = await this.appointmentRepository.getPatientsForDoctor(doctorId, 1, 1);
    // Note: This might need adjustment based on your actual data model
    // You might need to filter appointments by createdAt date
    return result.total; // Placeholder - adjust based on your needs
  }

  private async getMonthlyEarnings(doctorId: string, since: Date): Promise<{ month: number; total: number }[]> {
    // Since your IBookingRepository doesn't have direct aggregation support,
    // we'll implement this by fetching all completed appointments and processing in memory
    // Note: For production, consider adding aggregation support to your repository
    
    const allAppointments = await this.appointmentRepository.findByDoctorId(doctorId);
    
    const completedAppointments = allAppointments.filter(
      appt => appt.status === 'completed' && new Date(appt.appointmentDate) >= since
    );

    // Group by month and sum prices
    const monthlyEarningsMap = completedAppointments.reduce((acc, appt) => {
      const month = new Date(appt.appointmentDate).getMonth() + 1; // 1-12
      const price = appt.ticketPrice || 0;
      acc.set(month, (acc.get(month) || 0) + price);
      return acc;
    }, new Map<number, number>());

    // Convert map to array
    return Array.from(monthlyEarningsMap.entries())
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => a.month - b.month);
  }

  private async getRecentAppointmentsWithPatients(doctorId: string): Promise<any[]> {
    const result = await this.appointmentRepository.getPatientsForDoctor(doctorId, 1, 4);
    return result.patients;
  }

  private mapAppointmentsToPatients(appointments: any[]): any[] {
    return appointments.map(appt => ({
      _id: appt.user?._id || appt.userId,
      name: appt.user?.name || 'Unknown',
      phone: appt.user?.phone || 'Not provided',
      prescriptions: [] 
    }));
  }
}