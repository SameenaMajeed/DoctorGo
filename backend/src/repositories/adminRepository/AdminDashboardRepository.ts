import mongoose from "mongoose";
import { IAdminDashboardRepository } from "../../interfaces/admin/IAdminDashboardRepository";
import Booking, {
  AppointmentStatus,
  IBooking,
} from "../../models/commonModel/BookingModel";
import { DateRange } from "../../types/dashboardTypes";

export class AdminDashboardRepository implements IAdminDashboardRepository {
 

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
      .limit(5)
      .populate("doctor_id", "name specialty")
      .populate("user_id", "name")
      .lean();
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

  async getPlatformFreeTotal(dateFilter: DateRange, doctorId?: string): Promise<number> {
  const query = this.buildBaseQuery(dateFilter, doctorId);
  console.log(query)
  
  const result = await Booking.aggregate([
    { $match: query },
    {
      $group: {
        _id: doctorId,
        total: {
          $sum: {
            $cond: [
              { $eq: ["$status", AppointmentStatus.CONFIRMED] },
              "$platformFee",
              0
            ]
          }
        }
      }
    }
  ]);

  console.log(result)
  
  return result[0]?.total || 0;
}
}
