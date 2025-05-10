import { IReviewRepository } from "../../interfaces/review/IReviewRepository";
import ReviewModel, {
  IReview,
  Review,
} from "../../models/commonModel/ReviewModel";

class ReviewRepository implements IReviewRepository {
  async createReview(reviewData: Review): Promise<IReview> {
    const review = new ReviewModel(reviewData);
    console.log(review);
    return await review.save();
  }

  async updateReview(
    reviewId: string,
    reviewData: Partial<IReview>,
    userId: string
  ): Promise<IReview | null> {
    return await ReviewModel.findOneAndUpdate(
      { _id: reviewId, user_id: userId }, // Ensure user can only update their own review
      { $set: reviewData },
      { new: true }
    );
  }

  async findReviewById(reviewId: string): Promise<IReview | null> {
    return await ReviewModel.findById(reviewId);
  }

  async getReviewsByDoctorId(doctorId: string): Promise<IReview[]> {
    return await ReviewModel.find({ doctor_id: doctorId })
      .populate("user_id", "name profilePicture")
      .sort({ createdAt: -1 });
  }

  // async findReviewByDoctorAndPatient(doctorId: string, patientId: string): Promise<IReview | null> {
  //   return await ReviewModel.findOne({ doctor: doctorId, patient: patientId });
  // }

  async findReviewByDoctorAndPatient(
    doctorId: string,
    userId: string
  ): Promise<IReview | null> {
    return await ReviewModel.findOne({
      doctor_id: doctorId,
      user_id: userId,
    });
  }

  async findReviewByAppointment(
    appointmentId: string
  ): Promise<IReview | null> {
    return await ReviewModel.findOne({ appointment_id: appointmentId });
  }
}

export default ReviewRepository;
