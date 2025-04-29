import { IReview, Review } from "../../models/ReviewModel";

export interface IReviewRepository {
    createReview(reviewData: Review): Promise<IReview>;
    getReviewsByDoctorId(doctorId: string): Promise<IReview[]>;
    findReviewByDoctorAndPatient(doctorId: string, patientId: string): Promise<IReview | null>;
  }