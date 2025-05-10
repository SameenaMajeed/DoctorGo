import { IReview } from "../../models/commonModel/ReviewModel";

export interface IReviewService {
  addReview(doctor_id : string , user_id :string,appointment_id: string, reviewText : string , rating : number): Promise<IReview>;
  updateReview(
    reviewId: string,
    reviewData: Partial<IReview>,
    userId: string
  ): Promise<IReview | null>;
  getReviewsByDoctorId(doctorId: string): Promise<IReview[]>;
  checkAppointment(
    doctorId: string,
    userId: string,
    appointmentId: string
  ): Promise<boolean>;
  findReviewByDoctorAndPatient(
    doctorId: string,
    userId: string
  ): Promise<IReview | null>;
  getReviewById(reviewId: string): Promise<IReview | null>;
  findReviewByAppointment(appointmentId: string): Promise<IReview | null>
}
