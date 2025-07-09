"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import Navbar from "../User/Home/Navbar";
import Footer from "../CommonComponents/Footer";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../axios/UserInstance";
import toast from "react-hot-toast";
import slotApi from "../../axios/SlotInstance";
import type { ISlot } from "../../types/Slot";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useSelector } from "react-redux";
import type { RootState } from "../../slice/Store/Store";
import type { IDoctor, IReview } from "../../Types";
import {
  Calendar,
  Star,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle,
  XCircle,
  Heart,
  Award,
  Clock,
  Shield,
  Sparkles,
  User,
  Stethoscope,
  ArrowRight,
} from "lucide-react";

const AppointmentPage: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const userId = useSelector((state: RootState) => state.user?.user?.id);

  const [doctor, setDoctor] = useState<IDoctor | null>(null);
  const [availableSlots, setAvailableSlots] = useState<ISlot[]>([]);
  const [userBookedSlots, setUserBookedSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<ISlot | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [isBooking, setIsBooking] = useState<boolean>(false);
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const reviewsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const doctorResponse = await api.get(`/doctors/${doctorId}`);
        console.log(doctorResponse.data.data) 
        setDoctor(doctorResponse.data.data);
        const reviewsResponse = await api.get(`/reviews/doctor/${doctorId}`);
        setReviews(reviewsResponse.data.data || []);
      } catch (error) {
        console.error("Error fetching doctor details:", error);
        toast.error("Failed to load doctor details.");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [doctorId]);

  useEffect(() => {
    if (selectedDate) {
      fetchAppointmentsAndSlots(selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    const fetchUserBookings = async () => {
      if (userId && doctorId) {
        try {
          const response = await api.get(
            `/bookings/user/${userId}?doctorId=${doctorId}`
          );
          const bookedSlotIds = response.data.data.map(
            (booking: any) => booking.slot_id
          );
          setUserBookedSlots(bookedSlotIds);
        } catch (error) {
          console.error("Error fetching user bookings:", error);
        }
      }
    };
    fetchUserBookings();
  }, [userId, doctorId]);

  useEffect(() => {
    const container = reviewsContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const scrollPosition = container.scrollLeft;
      const containerWidth = container.clientWidth;
      const currentPage = Math.round(scrollPosition / containerWidth);
      setCurrentPage(currentPage);
    };
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollLeft = () => {
    if (reviewsContainerRef.current) {
      reviewsContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (reviewsContainerRef.current) {
      reviewsContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  const scrollToPage = (pageIndex: number) => {
    if (reviewsContainerRef.current) {
      const scrollWidth = reviewsContainerRef.current.scrollWidth;
      const pageWidth = scrollWidth / Math.ceil(reviews.length / 4);
      reviewsContainerRef.current.scrollTo({
        left: pageWidth * pageIndex,
        behavior: "smooth",
      });
      setCurrentPage(pageIndex);
    }
  };

  const fetchAppointmentsAndSlots = async (date: Date) => {
    try {
      setIsLoadingSlots(true);
      const formattedDate = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-");
      const slotsResponse = await slotApi.get(
        `/time-slots/${doctorId}/available?date=${formattedDate}`
      );
      setAvailableSlots(slotsResponse.data?.data?.slots || []);
    } catch (error) {
      console.error("Error fetching slots:", error);
      toast.error("Failed to load available slots");
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date && !isNaN(date.getTime())) {
      const maxDate = new Date();
      maxDate.setMonth(maxDate.getMonth() + 3);
      if (date > maxDate) {
        toast.error(
          "Appointments can only be booked up to 3 months in advance"
        );
        return;
      }
      setSelectedDate(date);
    } else {
      setSelectedDate(null);
      setAvailableSlots([]);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      toast.error("Please select a time slot.");
      return;
    }
    if (userBookedSlots.includes(selectedSlot._id)) {
      toast.error("You already have an appointment in this time slot.");
      return;
    }
    try {
      setIsBooking(true);
      navigate("/appointment/verification", {
        state: {
          doctor,
          selectedSlot,
        },
      });
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to book appointment");
    } finally {
      setIsBooking(false);
    }
  };

  const formatTimeString = (timeString: string) => {
    if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeString)) {
      const [hours, minutes] = timeString.split(":").map(Number);
      const period = hours >= 12 ? "PM" : "AM";
      const hours12 = hours % 12 || 12;
      return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
    }
    try {
      const date = new Date(timeString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    } catch (error) {
      console.error("Error formatting time:", error);
    }
    return "Invalid Time";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-16 shadow-2xl border border-slate-200/60 max-w-md mx-auto">
            <div className="text-center">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                </div>
                <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping"></div>
                <div className="absolute inset-2 bg-indigo-500/10 rounded-full animate-pulse delay-300"></div>
              </div>
              <h3 className="text-3xl font-bold text-slate-800 mb-3">
                Loading Doctor Details
              </h3>
              <p className="text-slate-600 text-lg">
                Please wait while we fetch the information...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-red-50/90 backdrop-blur-md border border-red-200 rounded-3xl p-16 max-w-lg mx-auto text-center shadow-2xl">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
              <XCircle className="text-red-600" size={48} />
            </div>
            <h3 className="text-3xl font-bold text-red-800 mb-4">
              Doctor Not Found
            </h3>
            <p className="text-red-600 mb-8 text-lg">
              The requested doctor profile could not be found.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8 mt-16">
        {/* Enhanced Progress Steps */}
        <div className="mb-16 relative z-10">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {/* Step 1 */}
            <div className="flex flex-col items-center relative group">
              <div className="rounded-full h-16 w-16 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-xl transform hover:scale-110 transition-all duration-300 group-hover:shadow-2xl">
                <span className="font-bold text-lg">1</span>
              </div>
              <span className="mt-4 text-base font-bold text-blue-600">
                Select Slot
              </span>
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full shadow-lg"></div>
            </div>

            {/* Progress line */}
            <div className="flex-auto mx-8 relative">
              <div className="h-2 bg-gradient-to-r from-blue-500 via-blue-400 to-slate-300 rounded-full shadow-sm"></div>
              <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-blue-400 rounded-full transform -translate-y-1/2 animate-pulse"></div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center group">
              <div className="rounded-full h-16 w-16 bg-slate-200 flex items-center justify-center text-slate-500 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <span className="font-bold text-lg">2</span>
              </div>
              <span className="mt-4 text-base font-semibold text-slate-500">
                Enter Details
              </span>
            </div>

            {/* Progress line */}
            <div className="flex-auto mx-8 relative">
              <div className="h-2 bg-slate-300 rounded-full shadow-sm"></div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center group">
              <div className="rounded-full h-16 w-16 bg-slate-200 flex items-center justify-center text-slate-500 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <span className="font-bold text-lg">3</span>
              </div>
              <span className="mt-4 text-base font-semibold text-slate-500">
                Confirmation
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Doctor Profile Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden mb-12 border border-slate-200/60 group hover:shadow-3xl transition-all duration-500">
          {/* Enhanced Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0">
              <div className="absolute top-4 right-4 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
              <div className="absolute bottom-4 left-4 w-24 h-24 bg-white/10 rounded-full animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-500 transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>

            <div className="relative z-10 text-center py-8">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
                <h1 className="text-3xl font-bold">Dr. {doctor.name}</h1>
                <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
              </div>
              <p className="text-blue-100 text-lg font-medium">
                {doctor.specialization}
              </p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Shield className="w-4 h-4 text-green-300" />
                <span className="text-green-200 text-sm font-medium">
                  Verified Professional
                </span>
              </div>
            </div>
          </div>

          {/* Enhanced Content */}
          <div className="flex flex-col lg:flex-row p-8 lg:p-12 gap-8">
            <div className="flex-shrink-0 lg:w-1/3 flex flex-col items-center lg:items-start">
              <div className="relative mb-8">
                <div className="relative w-64 h-64 lg:w-80 lg:h-80">
                  {" "}
                  <img
                    src={doctor.profilePicture || "/profile.png"}
                    alt={doctor.name}
                    className="w-full h-full rounded-3xl object-cover border-4 border-white shadow-2xl group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute -bottom-4 -right-4 w-14 h-14 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-4 border-white flex items-center justify-center shadow-xl animate-pulse">
                    <CheckCircle className="w-7 h-7 text-white" />{" "}
                  </div>
                  <div className="absolute -top-4 -left-4 w-14 h-14 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full border-4 border-white flex items-center justify-center shadow-xl">
                    <Stethoscope className="w-7 h-7 text-white" />{" "}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Enhanced Doctor Details */}
            <div className="flex-1 space-y-8">
              {/* About Section */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    About Dr. {doctor.name.split(" ")[0]}
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {doctor.bio ||
                    `Dr. ${doctor.name.split(" ")[0]} is a board-certified ${
                      doctor.specialization
                    } with ${
                      doctor.experience
                    } years of experience. Specializing in modern treatment approaches with a patient-centered focus, delivering comprehensive medical care with emphasis on preventive medicine, early diagnosis, and effective treatment strategies.`}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Experience Card */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Award className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {doctor.experience || "5"}+
                      </p>
                      <p className="text-gray-600 font-medium">
                        Years Experience
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rating Card */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {doctor.averageRating} <span className="text-amber-500">★</span>
                      </p>
                      <p className="text-gray-600 font-medium">
                        Patient Rating
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Consultation Card */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-100/30 rounded-full"></div>
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Heart className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">
                          Consultation Fee
                        </h4>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-3xl font-bold text-gray-900">
                          ₹{doctor.ticketPrice || "500"}
                        </p>
                        <p className="text-gray-600 text-sm">
                          Inclusive of all taxes
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Book Appointment Section */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 lg:p-12 mb-12 border border-slate-200/60 overflow-hidden relative">
          {/* Decorative elements */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-100/30 rounded-full filter blur-3xl"></div>
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-indigo-100/30 rounded-full filter blur-3xl"></div>

          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center gap-4 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-4 rounded-full border border-blue-200/60 shadow-sm">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">
                  Book Your Appointment
                </h2>
              </div>
              <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                Select your preferred date and time slot for consultation with
                Dr. {doctor.name}
              </p>
            </div>

            {/* Date Selection */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">
                  Select Appointment Date
                </h3>
              </div>
              <div className="relative max-w-lg">
                <DatePicker
                  selected={selectedDate}
                  onChange={handleDateChange}
                  className="w-full px-6 py-4 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-lg font-medium shadow-sm hover:shadow-md bg-white"
                  minDate={new Date()}
                  maxDate={
                    new Date(new Date().setMonth(new Date().getMonth() + 3))
                  }
                  placeholderText="Choose your appointment date"
                  dateFormat="MMMM d, yyyy"
                  calendarClassName="shadow-2xl border border-slate-200 rounded-2xl overflow-hidden"
                />
                {/* <Calendar className="absolute right-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-slate-400 pointer-events-none" /> */}
              </div>
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">
                    Available Time Slots
                  </h3>
                </div>

                {isLoadingSlots ? (
                  <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-br from-slate-50 to-blue-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <div className="relative mb-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center shadow-lg">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                      </div>
                      <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-ping"></div>
                    </div>
                    <h4 className="text-xl font-bold text-slate-800 mb-2">
                      Loading Available Slots
                    </h4>
                    <p className="text-slate-600 max-w-md text-center">
                      We're checking the doctor's availability for your selected
                      date
                    </p>
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                    {availableSlots.map((slot) => {
                      const isBookedByUser = userBookedSlots.includes(slot._id);
                      const isSelected = selectedSlot?._id === slot._id;
                      return (
                        <button
                          key={slot._id}
                          onClick={() =>
                            !isBookedByUser && setSelectedSlot(slot)
                          }
                          className={`
                    px-4 py-4 rounded-2xl text-sm font-bold border-2 transition-all duration-300 hover:shadow-lg relative overflow-hidden
                    ${
                      isSelected
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-600 shadow-xl shadow-blue-500/20"
                        : isBookedByUser
                        ? "bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200"
                        : "bg-white text-slate-700 hover:bg-blue-50 border-slate-200 hover:border-blue-300 shadow-sm"
                    }
                  `}
                          disabled={isBookedByUser}
                        >
                          {isSelected && (
                            <div className="absolute top-0 right-0 w-4 h-4 bg-blue-500 transform rotate-45 translate-x-1 -translate-y-1"></div>
                          )}
                          <div className="flex flex-col items-center gap-2">
                            <Clock
                              className={`w-5 h-5 ${
                                isSelected ? "text-white" : "text-blue-500"
                              }`}
                            />
                            <div className="text-center">
                              <div
                                className={`font-bold ${
                                  isSelected ? "text-white" : "text-slate-800"
                                }`}
                              >
                                {formatTimeString(slot.startTime)} -{" "}
                                {formatTimeString(slot.endTime)}
                              </div>
                              {isBookedByUser && (
                                <div className="text-xs text-red-500 mt-1">
                                  Booked
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gradient-to-br from-slate-50 to-blue-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Clock className="w-8 h-8 text-slate-400" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-800 mb-2">
                      No Available Slots
                    </h4>
                    <p className="text-slate-600 mb-4">
                      The doctor has no availability on{" "}
                      {selectedDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <button
                      onClick={() => setSelectedDate(null)}
                      className="text-blue-600 font-medium hover:text-blue-800 transition-colors"
                    >
                      Choose a different date
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Book Appointment Button */}
            <button
              onClick={handleBooking}
              disabled={
                !selectedSlot ||
                userBookedSlots.includes(selectedSlot?._id || "") ||
                isBooking
              }
              className={`
        w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-lg
        ${
          selectedSlot &&
          !userBookedSlots.includes(selectedSlot._id) &&
          !isBooking
            ? "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white hover:shadow-xl transform hover:scale-[1.02]"
            : "bg-slate-100 text-slate-400 cursor-not-allowed"
        }
      `}
            >
              {isBooking ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="ml-2">Processing...</span>
                </>
              ) : selectedSlot && userBookedSlots.includes(selectedSlot._id) ? (
                <>
                  <XCircle className="w-6 h-6" />
                  <span className="ml-2">Already Booked</span>
                </>
              ) : (
                <>
                  <Calendar className="w-6 h-6" />
                  <span className="ml-2">Confirm Appointment</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Enhanced Reviews Section */}
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl shadow-2xl p-8 lg:p-12 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-8 right-8 w-40 h-40 bg-white rounded-full"></div>
            <div className="absolute bottom-8 left-8 w-32 h-32 bg-white rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>

          {/* Header Section */}
          <div className="text-center mb-12 relative z-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Star className="w-8 h-8 text-yellow-300" />
              <h2 className="text-4xl font-bold text-white">
                What Our Patients Say
              </h2>
              <Star className="w-8 h-8 text-yellow-300" />
            </div>
            <p className="text-blue-100 text-xl leading-relaxed max-w-3xl mx-auto">
              World-class care for everyone. Our Health System offers unmatched,
              expert health care with compassionate service.
            </p>
          </div>

          {/* Reviews Container */}
          <div className="relative">
            {/* Enhanced Navigation Arrows */}
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-4 rounded-full bg-white bg-opacity-20 hover:bg-opacity-40 transition-all duration-300 backdrop-blur-sm border border-white border-opacity-30 shadow-lg hover:scale-110"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-4 rounded-full bg-white bg-opacity-20 hover:bg-opacity-40 transition-all duration-300 backdrop-blur-sm border border-white border-opacity-30 shadow-lg hover:scale-110"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>

            {/* Enhanced Scrollable Reviews */}
            <div
              ref={reviewsContainerRef}
              className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 px-2 -mx-2"
              style={{ scrollbarWidth: "none" }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {reviews.map((review, index) => (
                <div
                  key={index}
                  className={`flex-shrink-0 w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 px-2 snap-start transition-transform duration-300 ${
                    isHovered ? "hover:scale-105" : ""
                  }`}
                >
                  <div className="bg-white rounded-3xl shadow-2xl p-8 h-full flex flex-col hover:shadow-3xl transition-all duration-300 relative overflow-hidden">
                    {/* Large Quote Mark */}
                    <div className="absolute top-4 left-6 text-4xl text-blue-200 font-serif leading-none">
                      "
                    </div>

                    {/* Rating */}
                    <div className="flex mb-4 justify-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < review.rating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-slate-300"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Review Text */}
                    <p className="text-slate-700 italic mb-6 flex-grow text-center leading-relaxed font-medium">
                      {review.reviewText}
                    </p>

                    {/* Reviewer Info */}
                    <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-100">
                      <div className="relative">
                        <img
                          src={
                            review.user_id.profilePicture ||
                            "/placeholder.svg?height=50&width=50"
                          }
                          alt={review.user_id.name}
                          className="w-12 h-12 rounded-full border-3 border-slate-100 shadow-lg"
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      <div className="text-center">
                        <h4 className="font-bold text-slate-800">
                          {review.user_id.name}
                        </h4>
                        <p className="text-sm text-slate-500 font-medium">
                          Verified Patient
                        </p>
                      </div>
                    </div>

                    {/* Bottom Quote Mark */}
                    <div className="absolute bottom-4 right-6 text-4xl text-blue-200 font-serif leading-none transform rotate-180">
                      "
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Scroll Indicators */}
          <div className="flex justify-center gap-3 mt-8">
            {Array.from({ length: Math.ceil(reviews.length / 4) }).map(
              (_, i) => (
                <button
                  key={i}
                  onClick={() => scrollToPage(i)}
                  className={`h-3 rounded-full transition-all duration-300 ${
                    currentPage === i
                      ? "bg-white w-8 shadow-lg"
                      : "bg-white bg-opacity-30 w-3 hover:bg-opacity-50"
                  }`}
                  aria-label={`Go to page ${i + 1}`}
                />
              )
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AppointmentPage;

// import type React from "react";
// import { useEffect, useRef, useState } from "react";
// import Navbar from "../User/Home/Navbar";
// import Footer from "../CommonComponents/Footer";
// import { useNavigate, useParams } from "react-router-dom";
// import api from "../../axios/UserInstance";
// import toast from "react-hot-toast";
// import slotApi from "../../axios/SlotInstance";
// import type { ISlot } from "../../types/Slot";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import { useSelector } from "react-redux";
// import type { RootState } from "../../slice/Store/Store";
// import type { IReview } from "../../Types";
// import {
//   Calendar,
//   Star,
//   ChevronLeft,
//   ChevronRight,
//   Loader2,
//   CheckCircle,
//   XCircle,
//   Heart,
// } from "lucide-react";

// interface IDoctor {
//   _id: string;
//   name: string;
//   specialization: string;
//   experience: number;
//   description: string;
//   profilePicture: string;
//   ticketPrice: number;
//   extraCharge: number;
//   bio: string;
// }

// const AppointmentPage: React.FC = () => {
//   const { doctorId } = useParams<{ doctorId: string }>();
//   const navigate = useNavigate();
//   const userId = useSelector((state: RootState) => state.user?.user?.id);

//   const [doctor, setDoctor] = useState<IDoctor | null>(null);
//   const [availableSlots, setAvailableSlots] = useState<ISlot[]>([]);
//   const [userBookedSlots, setUserBookedSlots] = useState<string[]>([]);
//   const [selectedSlot, setSelectedSlot] = useState<ISlot | null>(null);
//   const [selectedDate, setSelectedDate] = useState<Date | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
//   const [isBooking, setIsBooking] = useState<boolean>(false);
//   const [reviews, setReviews] = useState<IReview[]>([]);
//   const [activeReviewIndex, setActiveReviewIndex] = useState<number>(0);

//   const [isHovered, setIsHovered] = useState(false);
//   const [currentPage, setCurrentPage] = useState(0);
//   const reviewsContainerRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const fetchDoctor = async () => {
//       try {
//         const doctorResponse = await api.get(`/doctors/${doctorId}`);
//         setDoctor(doctorResponse.data.data);

//         const reviewsResponse = await api.get(`/reviews/doctor/${doctorId}`);
//         setReviews(reviewsResponse.data.data || []);
//       } catch (error) {
//         console.error("Error fetching doctor details:", error);
//         toast.error("Failed to load doctor details.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDoctor();
//   }, [doctorId]);

//   useEffect(() => {
//     if (selectedDate) {
//       fetchAppointmentsAndSlots(selectedDate);
//     }
//   }, [selectedDate]);

//   useEffect(() => {
//     const fetchUserBookings = async () => {
//       if (userId && doctorId) {
//         try {
//           const response = await api.get(
//             `/bookings/user/${userId}?doctorId=${doctorId}`
//           );
//           const bookedSlotIds = response.data.data.map(
//             (booking: any) => booking.slot_id
//           );
//           setUserBookedSlots(bookedSlotIds);
//         } catch (error) {
//           console.error("Error fetching user bookings:", error);
//         }
//       }
//     };

//     fetchUserBookings();
//   }, [userId, doctorId]);

//   useEffect(() => {
//     const container = reviewsContainerRef.current;
//     if (!container) return;

//     const handleScroll = () => {
//       const scrollPosition = container.scrollLeft;
//       const containerWidth = container.clientWidth;
//       const currentPage = Math.round(scrollPosition / containerWidth);
//       setCurrentPage(currentPage);
//     };

//     container.addEventListener("scroll", handleScroll);
//     return () => container.removeEventListener("scroll", handleScroll);
//   }, []);

//   const scrollLeft = () => {
//     if (reviewsContainerRef.current) {
//       reviewsContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
//     }
//   };

//   const scrollRight = () => {
//     if (reviewsContainerRef.current) {
//       reviewsContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
//     }
//   };

//   const scrollToPage = (pageIndex: number) => {
//     if (reviewsContainerRef.current) {
//       const scrollWidth = reviewsContainerRef.current.scrollWidth;
//       const pageWidth = scrollWidth / Math.ceil(reviews.length / 4);
//       reviewsContainerRef.current.scrollTo({
//         left: pageWidth * pageIndex,
//         behavior: "smooth",
//       });
//       setCurrentPage(pageIndex);
//     }
//   };

//   const fetchAppointmentsAndSlots = async (date: Date) => {
//     try {
//       setIsLoadingSlots(true);
//       const formattedDate = [
//         date.getFullYear(),
//         String(date.getMonth() + 1).padStart(2, "0"),
//         String(date.getDate()).padStart(2, "0"),
//       ].join("-");

//       const slotsResponse = await slotApi.get(
//         `/time-slots/${doctorId}/available?date=${formattedDate}`
//       );

//       setAvailableSlots(slotsResponse.data?.data?.slots || []);
//     } catch (error) {
//       console.error("Error fetching slots:", error);
//       toast.error("Failed to load available slots");
//     } finally {
//       setIsLoadingSlots(false);
//     }
//   };

//   const handleDateChange = (date: Date | null) => {
//     if (date && !isNaN(date.getTime())) {
//       const maxDate = new Date();
//       maxDate.setMonth(maxDate.getMonth() + 3);
//       if (date > maxDate) {
//         toast.error(
//           "Appointments can only be booked up to 3 months in advance"
//         );
//         return;
//       }
//       setSelectedDate(date);
//     } else {
//       setSelectedDate(null);
//       setAvailableSlots([]);
//     }
//   };

//   const handleBooking = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!selectedSlot) {
//       toast.error("Please select a time slot.");
//       return;
//     }

//     if (userBookedSlots.includes(selectedSlot._id)) {
//       toast.error("You already have an appointment in this time slot.");
//       return;
//     }

//     try {
//       setIsBooking(true);
//       navigate("/appointment/verification", {
//         state: {
//           doctor,
//           selectedSlot,
//         },
//       });
//     } catch (error) {
//       console.error("Booking error:", error);
//       toast.error("Failed to book appointment");
//     } finally {
//       setIsBooking(false);
//     }
//   };

//   const formatTimeString = (timeString: string) => {
//     if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeString)) {
//       const [hours, minutes] = timeString.split(":").map(Number);
//       const period = hours >= 12 ? "PM" : "AM";
//       const hours12 = hours % 12 || 12;
//       return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
//     }

//     try {
//       const date = new Date(timeString);
//       if (!isNaN(date.getTime())) {
//         return date.toLocaleTimeString("en-US", {
//           hour: "2-digit",
//           minute: "2-digit",
//         });
//       }
//     } catch (error) {
//       console.error("Error formatting time:", error);
//     }

//     return "Invalid Time";
//   };

//   const handlePrevReview = () => {
//     setActiveReviewIndex((prev) =>
//       prev === 0 ? reviews.length - 1 : prev - 1
//     );
//   };

//   const handleNextReview = () => {
//     setActiveReviewIndex((prev) =>
//       prev === reviews.length - 1 ? 0 : prev + 1
//     );
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <Navbar />
//         <div className="flex items-center justify-center min-h-[60vh]">
//           <div className="text-center">
//             <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
//             <p className="text-lg text-gray-600">Loading doctor details...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!doctor) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <Navbar />
//         <div className="flex items-center justify-center min-h-[60vh]">
//           <div className="text-center">
//             <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
//             <p className="text-xl text-red-600 font-semibold">
//               Doctor not found
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Navbar />

//       <div className="max-w-4xl mx-auto px-4 py-6 mt-16">
//         <div className="mb-8 relative z-10">
//           {" "}
//           <div className="flex items-center justify-between">
//             {/* Step 1 */}
//             <div className="flex flex-col items-center">
//               <div className="rounded-full h-8 w-8 bg-blue-600 flex items-center justify-center text-white">
//                 1
//               </div>
//               <span className="mt-2 text-xs font-medium text-blue-600">
//                 Select Slot
//               </span>
//             </div>

//             {/* Progress line */}
//             <div className="flex-auto mx-4 relative top-4 h-0.5 bg-gray-300"></div>
//             {/* Step 2 */}
//             <div className="flex flex-col items-center">
//               <div className="rounded-full h-8 w-8 bg-gray-300 flex items-center justify-center text-gray-600">
//                 2
//               </div>
//               <span className="mt-2 text-xs font-medium text-gray-500">
//                 Enter Details
//               </span>
//             </div>

//             {/* Progress line */}
//             <div className="flex-auto mx-4 relative top-4 h-0.5 bg-gray-300"></div>

//             {/* Step 3 */}
//             <div className="flex flex-col items-center">
//               <div className="rounded-full h-8 w-8 bg-gray-300 flex items-center justify-center text-gray-600">
//                 3
//               </div>
//               <span className="mt-2 text-xs font-medium text-gray-500">
//                 Confirmation
//               </span>
//             </div>
//           </div>
//         </div>
//         {/* Doctor Profile Card - Matching the screenshot exactly */}
//         <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
//           {/* Blue Header */}
//           <div className="bg-blue-600 text-white text-center py-4">
//             <h1 className="text-xl font-semibold">Dr. {doctor.name}</h1>
//           </div>

//           {/* Doctor Info Section */}
//           <div className="p-6">
//             <div className="flex items-start gap-4">
//               {/* Doctor Image */}
//               <div className="flex-shrink-0">
//                 <img
//                   src={
//                     doctor.profilePicture ||
//                     "/placeholder.svg?height=80&width=80"
//                   }
//                   alt={doctor.name}
//                   className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
//                 />
//                 {/* Green verification dot */}
//                 <div className="relative -mt-6 ml-16">
//                   <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
//                     <CheckCircle className="w-3 h-3 text-white" />
//                   </div>
//                 </div>
//               </div>

//               {/* Doctor Details */}
//               <div className="flex-1">
//                 <div className="flex items-center gap-4 mb-2">
//                   <span className="text-orange-500 text-sm">
//                     ⭐ {doctor.experience} Years Experience
//                   </span>
//                   <span className="text-orange-500 text-sm">⭐ 4.8 Rating</span>
//                 </div>

//                 <h3 className="font-semibold text-gray-800 mb-2">
//                   About Doctor
//                 </h3>
//                 <p className="text-gray-600 text-sm leading-relaxed mb-4">
//                   {doctor.bio ||
//                     `Dr. ${doctor.name} is a highly experienced ${doctor.specialization} with ${doctor.experience} years of practice.`}
//                 </p>

//                 {/* Consultation Fee - Green background like in screenshot */}
//                 <div className="bg-green-100 border border-green-200 rounded-lg p-3 inline-block">
//                   <span className="text-green-800 font-semibold">
//                     Consultation Fee: ₹{doctor.ticketPrice}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Book Appointment Section - Matching screenshot */}
//         <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
//           <div className="flex items-center gap-2 mb-4">
//             <Calendar className="w-5 h-5 text-blue-600" />
//             <h2 className="text-lg font-semibold text-gray-800">
//               Book Your Appointment
//             </h2>
//           </div>
//           <p className="text-gray-500 text-sm mb-6">
//             Select your preferred date and time slot
//           </p>

//           {/* Date Selection */}
//           <div className="mb-6">
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Select Date:
//             </label>
//             <DatePicker
//               selected={selectedDate}
//               onChange={handleDateChange}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               minDate={new Date()}
//               maxDate={new Date(new Date().setMonth(new Date().getMonth() + 3))}
//               placeholderText="Choose your appointment date"
//               dateFormat="MMMM d, yyyy"
//             />
//           </div>

//           {/* Time Slots */}
//           {selectedDate && (
//             <div className="mb-6">
//               <h3 className="text-sm font-medium text-gray-700 mb-3">
//                 Available Time Slots:
//               </h3>

//               {isLoadingSlots ? (
//                 <div className="flex items-center justify-center py-8">
//                   <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
//                   <span className="text-gray-600">
//                     Loading available slots...
//                   </span>
//                 </div>
//               ) : availableSlots.length > 0 ? (
//                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
//                   {availableSlots.map((slot) => {
//                     const isBookedByUser = userBookedSlots.includes(slot._id);
//                     const isSelected = selectedSlot?._id === slot._id;

//                     return (
//                       <button
//                         key={slot._id}
//                         onClick={() => !isBookedByUser && setSelectedSlot(slot)}
//                         className={`
//                           px-3 py-2 rounded-md text-sm border transition-colors
//                           ${
//                             isSelected
//                               ? "bg-blue-600 text-white border-blue-600"
//                               : isBookedByUser
//                               ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
//                               : "bg-white text-gray-700 hover:bg-blue-50 border-gray-300"
//                           }
//                         `}
//                         disabled={isBookedByUser}
//                       >
//                         {formatTimeString(slot.startTime)} -{" "}
//                         {formatTimeString(slot.endTime)}
//                         {isBookedByUser && " (Booked)"}
//                       </button>
//                     );
//                   })}
//                 </div>
//               ) : (
//                 <div className="text-center py-6 text-gray-500">
//                   <p>No available slots for this date.</p>
//                   <p className="text-sm">Please try another date.</p>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Book Appointment Button - Matching screenshot style */}
//           <button
//             onClick={handleBooking}
//             disabled={
//               !selectedSlot ||
//               userBookedSlots.includes(selectedSlot?._id || "") ||
//               isBooking
//             }
//             className={`
//               w-full py-3 rounded-md font-medium flex items-center justify-center gap-2
//               ${
//                 selectedSlot &&
//                 !userBookedSlots.includes(selectedSlot._id) &&
//                 !isBooking
//                   ? "bg-blue-600 text-white hover:bg-blue-700"
//                   : "bg-gray-300 text-gray-500 cursor-not-allowed"
//               }
//             `}
//           >
//             {isBooking ? (
//               <>
//                 <Loader2 className="w-4 h-4 animate-spin" />
//                 Processing...
//               </>
//             ) : selectedSlot && userBookedSlots.includes(selectedSlot._id) ? (
//               "Already Booked"
//             ) : (
//               <>
//                 <Calendar className="w-4 h-4" />
//                 Book Appointment
//               </>
//             )}
//           </button>
//         </div>

//         {/* Reviews Section - Matching screenshot */}
//         <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl shadow-2xl p-8 lg:p-12 relative overflow-hidden">
//           {/* Header Section */}
//           <div className="text-center mb-12">
//             <div className="flex items-center justify-center gap-3 mb-4">
//               <Star className="w-8 h-8 text-yellow-300" />
//               <h2 className="text-4xl font-bold text-white">
//                 What Our Patients Say
//               </h2>
//               <Star className="w-8 h-8 text-yellow-300" />
//             </div>
//             <p className="text-blue-100 text-xl leading-relaxed max-w-3xl mx-auto">
//               World-class care for everyone. Our Health System offers unmatched,
//               expert health care with compassionate service.
//             </p>
//           </div>

//           {/* Reviews Container */}
//           <div className="relative">
//             {/* Navigation Arrows - Only show if scrollable */}
//             <button
//               onClick={scrollLeft}
//               className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white bg-opacity-20 hover:bg-opacity-40 transition-all duration-300 backdrop-blur-sm border border-white border-opacity-30 shadow-lg hover:scale-110"
//               aria-label="Scroll left"
//             >
//               <ChevronLeft className="w-6 h-6 text-white" />
//             </button>

//             <button
//               onClick={scrollRight}
//               className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white bg-opacity-20 hover:bg-opacity-40 transition-all duration-300 backdrop-blur-sm border border-white border-opacity-30 shadow-lg hover:scale-110"
//               aria-label="Scroll right"
//             >
//               <ChevronRight className="w-6 h-6 text-white" />
//             </button>

//             {/* Scrollable Reviews */}
//             <div
//               ref={reviewsContainerRef}
//               className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 px-2 -mx-2"
//               style={{ scrollbarWidth: "none" }} // Hide scrollbar for cleaner look
//               onMouseEnter={() => setIsHovered(true)}
//               onMouseLeave={() => setIsHovered(false)}
//             >
//               {reviews.map((review, index) => (
//                 <div
//                   key={index}
//                   className={`flex-shrink-0 w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 px-2 snap-start transition-transform duration-300 ${
//                     isHovered ? "hover:scale-105" : ""
//                   }`}
//                 >
//                   <div className="bg-white rounded-2xl shadow-lg p-6 h-full flex flex-col hover:shadow-xl transition-all duration-300">
//                     {/* Rating */}
//                     <div className="flex mb-3">
//                       {[...Array(5)].map((_, i) => (
//                         <Star
//                           key={i}
//                           className={`w-5 h-5 ${
//                             i < review.rating
//                               ? "text-yellow-400 fill-yellow-400"
//                               : "text-slate-300"
//                           }`}
//                         />
//                       ))}
//                     </div>

//                     {/* Review Text */}
//                     <p className="text-slate-700 italic mb-4 flex-grow">
//                       "{review.reviewText}"
//                     </p>

//                     {/* Reviewer Info */}
//                     <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
//                       <img
//                         src={
//                           review.user_id.profilePicture || "/placeholder.svg"
//                         }
//                         alt={review.user_id.name}
//                         className="w-10 h-10 rounded-full border-2 border-slate-100"
//                       />
//                       <div>
//                         <h4 className="font-medium text-slate-800">
//                           {review.user_id.name}
//                         </h4>
//                         <p className="text-sm text-slate-500">
//                           Verified Patient
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Scroll Indicators */}
//           <div className="flex justify-center gap-2 mt-6">
//             {Array.from({ length: Math.ceil(reviews.length / 4) }).map(
//               (_, i) => (
//                 <button
//                   key={i}
//                   onClick={() => scrollToPage(i)}
//                   className={`w-3 h-3 rounded-full transition-all ${
//                     currentPage === i
//                       ? "bg-white w-6"
//                       : "bg-white bg-opacity-30"
//                   }`}
//                   aria-label={`Go to page ${i + 1}`}
//                 />
//               )
//             )}
//           </div>
//         </div>
//       </div>

//       <Footer />
//     </div>
//   );
// };

// export default AppointmentPage;
