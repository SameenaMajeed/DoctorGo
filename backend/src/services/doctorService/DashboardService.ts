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

  // Define date filters
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Get all stats in parallel
  const [
    totalPatients,
    newPatients,
    totalPrescriptions,
    recentAppointments,
    totalAppointments,
    todayAppointments,
    upcomingAppointments
  ] = await Promise.all([
    this.countPatientsByDoctor(doctorId),
    this.countNewPatients(doctorId, thirtyDaysAgo),
    this.prescriptionRepository.findPrescriptions(doctorId, "", undefined, 1, 1, "").then(res => res.total),
    this.getRecentAppointmentsWithPatients(doctorId),
    this.countAppointments(doctorId),
    this.countAppointments(doctorId, today, tomorrow),
    this.countAppointments(doctorId, new Date()) 
  ]);

  return {
    totalPatients,
    newPatients,
    totalPrescriptions,
    totalAppointments,
    todayAppointments,
    upcomingAppointments,
    recentPatients: this.mapAppointmentsToPatients(recentAppointments),
  };
}


private async countAppointments(doctorId: string, startDate?: Date, endDate?: Date): Promise<number> {
  const filter: any = { doctor_id : doctorId };

  if (startDate && endDate) {
    filter.appointmentDate = { $gte: startDate, $lt: endDate };
  } else if (startDate) {
    filter.appointmentDate = { $gte: startDate };
  }

  console.log('filter data:', filter)

  return this.appointmentRepository.countAppointments(filter);
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

  private async getRecentAppointmentsWithPatients(doctorId: string): Promise<any[]> {
    const result = await this.appointmentRepository.getPatientsForDoctor(doctorId, 1, 4);
    console.log('result:',result)
    return result.patients;
  }

  private mapAppointmentsToPatients(appointments: any[]): any[] {
    return appointments.map(appt => ({
      _id: appt.user_id?._id || appt.userId,
      name: appt.user_id?.name || 'Unknown',
      phone: appt.user_id?.mobile_no || 'Not provided',
      age: appt.user_id?.age || 'Not provided',
      profilePicture: appt.user_id?.profilePicture|| 'Not provided',
    }));
  }
}