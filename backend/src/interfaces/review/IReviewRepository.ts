import { IReview, Review } from "../../models/ReviewModel";

export interface IReviewRepository {
    createReview(reviewData: Review): Promise<IReview>;
    getReviewsByDoctorId(doctorId: string): Promise<IReview[]>;
    // findReviewByDoctorAndPatient(doctorId: string, patientId: string): Promise<IReview | null>;
    updateReview(
        reviewId: string,
        reviewData: Partial<IReview>,
        userId: string
      ): Promise<IReview | null> 

      findReviewById(reviewId: string): Promise<IReview | null> 
    findReviewByDoctorAndPatient(doctorId: string, userId: string): Promise<IReview | null>
    findReviewByAppointment(appointmentId: string): Promise<IReview | null>
  }