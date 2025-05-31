import mongoose from "mongoose";
import { IAdminDashboardRepository } from "../../interfaces/admin/IAdminDashboardRepository";
import Booking, {
  AppointmentStatus,
  IBooking,
} from "../../models/commonModel/BookingModel";
import { DateRange } from "../../types/dashboardTypes";

export class AdminDashboardRepository implements IAdminDashboardRepository {
  // private buildBaseQuery(dateFilter: DateRange, doctorId?: string) {
  //   const query: any = { appointmentDate: dateFilter };
  //   if (doctorId) {
  //     query["doctor_id"] = new mongoose.Types.ObjectId(doctorId);
  //   }
  //   return query;
  // }

  private buildBaseQuery(dateFilter: DateRange, doctorId?: string) {
    const query: any = {
      appointmentDate: {
        $gte: new Date(dateFilter.$gte),
        $lte: new Date(dateFilter.$lte),
      },
    };

    if (doctorId) {
      query["doctor_id"] = new mongoose.Types.ObjectId(doctorId);
    }
    return query;
  }

  async getRecentBookings(
    dateFilter: DateRange,
    doctorId?: string
  ): Promise<IBooking[]> {
    const query = this.buildBaseQuery(dateFilter, doctorId);

    return await Booking.find(query)
      .sort({ appointmentDate: -1 })
      .limit(10)
      .populate("doctor_id", "name specialty")
      .populate("user_id", "name")
      .lean();
  }
  async getTotalRevenue(
    dateFilter: DateRange,
    doctorId?: string
  ): Promise<number> {
    const query = {
      ...this.buildBaseQuery(dateFilter, doctorId),
      status: AppointmentStatus.COMPLETED,
    };

    const result = await Booking.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: {
              $subtract: ["$ticketPrice", { $ifNull: ["$discount", 0] }],
            },
          },
        },
      },
    ]);

    return result[0]?.totalRevenue || 0;
  }

  async getBookingStats(
    dateFilter: DateRange,
    doctorId?: string
  ): Promise<{
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  }> {
    const query = this.buildBaseQuery(dateFilter, doctorId);

    const result = await Booking.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Convert array to object with default values
    const stats = {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    };

    result.forEach((item) => {
      if (item._id === AppointmentStatus.PENDING) stats.pending = item.count;
      if (item._id === AppointmentStatus.CONFIRMED)
        stats.confirmed = item.count;
      if (item._id === AppointmentStatus.COMPLETED)
        stats.completed = item.count;
      if (item._id === AppointmentStatus.CANCELLED)
        stats.cancelled = item.count;
    });

    return stats;
  }

  async getBookingTrends(
    dateFilter: DateRange,
    filter: "daily" | "monthly" | "yearly",
    doctorId?: string
  ): Promise<Array<{ date: string; count: number; revenue: number }>> {
    const query = this.buildBaseQuery(dateFilter, doctorId);
    const dateFormat =
      filter === "daily" ? "%Y-%m-%d" : filter === "monthly" ? "%Y-%m" : "%Y";

    return await Booking.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            $dateToString: { format: dateFormat, date: "$appointmentDate" },
          },
          count: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [
                { $eq: ["$status", AppointmentStatus.COMPLETED] },
                { $subtract: ["$ticketPrice", { $ifNull: ["$discount", 0] }] },
                0,
              ],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: "$_id",
          count: 1,
          revenue: 1,
          _id: 0,
        },
      },
    ]);
  }

  async getTopDoctors(
    dateFilter: DateRange,
    doctorId?: string
  ): Promise<
    Array<{ _id: string; name: string; revenue: number; bookings: number }>
  > {
    const query = {
      ...this.buildBaseQuery(dateFilter, doctorId),
      status: AppointmentStatus.COMPLETED,
    };

    return await Booking.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "doctors",
          localField: "doctor_id",
          foreignField: "_id",
          as: "doctor",
        },
      },
      { $unwind: "$doctor" },
      {
        $group: {
          _id: "$doctor_id",
          name: { $first: "$doctor.name" },
          revenue: {
            $sum: {
              $subtract: ["$ticketPrice", { $ifNull: ["$discount", 0] }],
            },
          },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 1, // Keep _id instead of converting to id
          name: 1,
          revenue: 1,
          bookings: 1,
        },
      },
    ]);
  }

  async getSpecialtyActivity(
    dateFilter: DateRange,
    doctorId?: string
  ): Promise<Array<{ _id: string; name: string; bookings: number }>> {
    const query = this.buildBaseQuery(dateFilter, doctorId);

    return await Booking.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "doctors",
          localField: "doctor_id",
          foreignField: "_id",
          as: "doctor",
        },
      },
      { $unwind: "$doctor" },
      {
        $group: {
          _id: "$doctor.specialty",
          bookings: { $sum: 1 },
        },
      },
      { $sort: { bookings: -1 } },
      {
        $project: {
          id: "$_id",
          name: "$_id",
          bookings: 1,
          _id: 0,
        },
      },
    ]);
  }

  async getPendingApprovals(): Promise<number> {
    return await Booking.countDocuments({
      status: { $in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
    });
  }

  async getTopPatients(
    dateFilter: DateRange,
    doctorId?: string
  ): Promise<
    Array<{
      _id: string;
      name: string;
      totalBookings: number;
      totalSpent: number;
    }>
  > {
    const query = this.buildBaseQuery(dateFilter, doctorId);

    return await Booking.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $group: {
          _id: "$user_id",
          name: { $first: "$user.name" },
          totalBookings: { $sum: 1 },
          totalSpent: {
            $sum: {
              $cond: [
                { $eq: ["$status", AppointmentStatus.COMPLETED] },
                { $subtract: ["$ticketPrice", { $ifNull: ["$discount", 0] }] },
                0,
              ],
            },
          },
        },
      },
      { $sort: { totalBookings: -1 } },
      { $limit: 5 },
      {
        $project: {
          id: "$_id",
          name: 1,
          totalBookings: 1,
          totalSpent: 1,
          _id: 0,
        },
      },
    ]);
  }

  async getPatientGrowth(
    dateFilter: DateRange,
    filter: "daily" | "monthly" | "yearly"
  ): Promise<Array<{ date: string; count: number }>> {
    const dateFormat =
      filter === "daily" ? "%Y-%m-%d" : filter === "monthly" ? "%Y-%m" : "%Y";

    return await Booking.aggregate([
      { $match: { appointmentDate: dateFilter } },
      {
        $group: {
          _id: {
            $dateToString: { format: dateFormat, date: "$appointmentDate" },
          },
          patients: { $addToSet: "$user_id" },
        },
      },
      {
        $project: {
          date: "$_id",
          count: { $size: "$patients" },
          _id: 0,
        },
      },
      { $sort: { date: 1 } },
    ]);
  }

  async getOverviewCounts(doctorId?: string): Promise<{
    totalBookings: number;
    activeDoctors: number;
    activePatients: number;
  }> {
    const query = doctorId
      ? { doctor_id: new mongoose.Types.ObjectId(doctorId) }
      : {};

    const result = await Booking.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          activeDoctors: { $addToSet: "$doctor_id" },
          activePatients: { $addToSet: "$user_id" },
        },
      },
      {
        $project: {
          totalBookings: 1,
          activeDoctors: { $size: "$activeDoctors" },
          activePatients: { $size: "$activePatients" },
        },
      },
    ]);

    return (
      result[0] || { totalBookings: 0, activeDoctors: 0, activePatients: 0 }
    );
  }
}
