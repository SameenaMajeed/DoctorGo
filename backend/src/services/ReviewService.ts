import { HttpStatus } from "../constants/Httpstatus";
import { IBookingRepository } from "../interfaces/Booking/BookingRepositoryInterface";
import { IReviewRepository } from "../interfaces/review/IReviewRepository";
import { IReviewService } from "../interfaces/review/IReviewServiceInterface";
import { IReview } from "../models/ReviewModel";
import { AppError } from "../utils/AppError";

class ReviewService implements IReviewService {
  constructor(
    private ReviewRepository: IReviewRepository,
    private AppointmentRepository: IBookingRepository
  ) {}
  async addReview(
    doctor_id: string,
    user_id: string,
    appointment_id: string,
    reviewText: string,
    rating: number
  ): Promise<IReview> {
    // Validate appointment exists and belongs to this user/doctor
    const appointment = await this.AppointmentRepository.findAppointmentById(
      appointment_id
    );

    console.log('Found appointment:', appointment);

  if (!appointment) {
    console.log('Appointment not found');
    throw new AppError(
      HttpStatus.BadRequest,
      'Appointment not found'
    );
  }

  if (appointment.doctor_id.toString() !== doctor_id) {
    console.log('Doctor mismatch:', {
      appointmentDoctor: appointment.doctor_id.toString(),
      requestedDoctor: doctor_id
    });
    throw new AppError(
      HttpStatus.BadRequest,
      'Doctor mismatch'
    );
  }

  if (appointment.user_id.toString() !== user_id) {
    console.log('User mismatch:', {
      appointmentUser: appointment.user_id.toString(),
      requestingUser: user_id
    });
    throw new AppError(
      HttpStatus.BadRequest,
      'User mismatch'
    );
  }

  if (appointment.status !== 'completed') {
    console.log('Status not completed:', appointment.status);
    throw new AppError(
      HttpStatus.BadRequest,
      'Appointment not completed'
    );
  }


  if (
      !appointment ||
      appointment.doctor_id.toString() !== doctor_id ||
      appointment.user_id.toString() !== user_id ||
      appointment.status !== "completed"
    ) {
      throw new AppError(
        HttpStatus.BadRequest,
        "You can only review completed appointments you booked"
      );
    }

    // // Validate appointment
    // const appointment = await this.AppointmentRepository.findAppointmentByDoctorAndPatient(doctor_id.toString(), user_id.toString());
    // console.log(appointment)
    // if (!appointment) {
    //   throw new AppError(HttpStatus.BadRequest,'You can only review doctors you have booked an appointment with.');
    // }

    // Check for existing review
    const existingReview =
      await this.ReviewRepository.findReviewByAppointment(appointment_id);
    if (existingReview) {
      throw new AppError(
        HttpStatus.BadRequest,
        "You have already reviewed this appointment."
      );
    }

    // Create review
    return await this.ReviewRepository.createReview({
      doctor_id,
      user_id,
      reviewText,
      appointment_id,
      rating,
    });
  }

  async updateReview(
    reviewId: string,
    reviewData: Partial<IReview>,
    userId: string
  ): Promise<IReview | null> {
    const existingReview = await this.ReviewRepository.findReviewById(reviewId);

    if (!existingReview) {
      throw new AppError(HttpStatus.BadRequest, "Review not found");
    }

    if (existingReview.user_id.toString() !== userId) {
      throw new AppError(
        HttpStatus.BadRequest,
        "You can only update your own reviews"
      );
    }

    const review = await this.ReviewRepository.updateReview(
      reviewId,
      reviewData,
      userId
    );

    return review;
  }

  async getReviewsByDoctorId(doctorId: string): Promise<IReview[]> {
    return await this.ReviewRepository.getReviewsByDoctorId(doctorId);
  }

  async checkAppointment(
    doctorId: string,
    userId: string,
    appointmentId: string
  ): Promise<boolean> {
    const appointment = await this.AppointmentRepository.findAppointmentById(
      appointmentId
    );

    return !!(
      appointment &&
      appointment.doctor_id.toString() === doctorId &&
      appointment.user_id.toString() === userId &&
      appointment.status === "completed"
    );
  }

  async findReviewByDoctorAndPatient(
    doctorId: string,
    userId: string
  ): Promise<IReview | null> {
    return await this.ReviewRepository.findReviewByDoctorAndPatient(
      doctorId,
      userId
    );
  }

  async getReviewById(reviewId: string): Promise<IReview | null> {
    return await this.ReviewRepository.findReviewById(reviewId);
  }

  async findReviewByAppointment(
    appointmentId: string
  ): Promise<IReview | null> {
    return await this.ReviewRepository.findReviewByAppointment(appointmentId);
  }
}

export default ReviewService;
