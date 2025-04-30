import { IReviewRepository } from "../interfaces/review/IReviewRepository";
import ReviewModel, { IReview, Review } from "../models/ReviewModel";


class ReviewRepository implements IReviewRepository {
  async createReview(reviewData : Review): Promise<IReview> {
    const review = new ReviewModel(reviewData);
    console.log(review)
    return await review.save();
  }

  async getReviewsByDoctorId(doctorId: string): Promise<IReview[]> {
    return await ReviewModel.find({ doctor_id: doctorId })
      .populate('user_id', 'name profilePicture')
      .sort({ createdAt: -1 });
  }

  async findReviewByDoctorAndPatient(doctorId: string, patientId: string): Promise<IReview | null> {
    return await ReviewModel.findOne({ doctor: doctorId, patient: patientId });
  }
}

export default ReviewRepository;