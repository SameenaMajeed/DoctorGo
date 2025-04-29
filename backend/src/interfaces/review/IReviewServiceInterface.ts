import { IReview } from "../../models/ReviewModel";

export interface IReviewService {
  addReview(doctor_id : string , user_id :string, reviewText : string , rating : number): Promise<IReview>;
  getReviewsByDoctorId(doctorId: string): Promise<IReview[]>;
}