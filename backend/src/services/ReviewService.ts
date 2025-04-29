import { IBookingRepository } from "../interfaces/Booking/BookingRepositoryInterface";
import { IReviewRepository } from "../interfaces/review/IReviewRepository";
import { IReviewService } from "../interfaces/review/IReviewServiceInterface";
import { IReview } from "../models/ReviewModel";

class ReviewService implements IReviewService {
    constructor(
        private ReviewRepository : IReviewRepository,
        private AppointmentRepository : IBookingRepository
    ){}
    async addReview(doctor_id : string , user_id :string, reviewText : string , rating : number): Promise<IReview> {  


      // Validate appointment
      const appointment = await this.AppointmentRepository.findAppointmentByDoctorAndPatient(doctor_id.toString(), user_id.toString());
      console.log(appointment)
      if (!appointment) {
        throw new Error('You can only review doctors you have booked an appointment with.');
      }
  
      // Check for existing review
      const existingReview = await this.ReviewRepository.findReviewByDoctorAndPatient(doctor_id.toString(), user_id.toString());
      if (existingReview) {
        throw new Error('You have already reviewed this doctor.');
      }
  
      // Create review
      return await this.ReviewRepository.createReview({doctor_id, user_id, reviewText, rating});
    }
  
    async getReviewsByDoctorId(doctorId: string): Promise<IReview[]> {
      return await this.ReviewRepository.getReviewsByDoctorId(doctorId);
    }
  }
  
  export default ReviewService;