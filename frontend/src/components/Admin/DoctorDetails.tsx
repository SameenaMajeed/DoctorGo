"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
// import adminApi from "../../axios/AdminInstance";
import Loader from "./Loader";
import CancelConfirmationModal from "../CommonComponents/CancelConfirmationModal";
import { toast } from "react-hot-toast";
import {
  Stethoscope,
  ArrowLeft,
  UserCheck,
  UserX,
  CalendarDays,
  Mail,
  Phone,
  Award,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  TrendingUp,
  Calendar,
  Briefcase,
  X,
} from "lucide-react";
import { Button } from "../CommonComponents/Button";
import { Card, CardContent } from "../CommonComponents/UI/card";
import { Separator } from "@radix-ui/react-dropdown-menu";
import ErrorDisplay from "./Home/ErrorDisplay";
import { createApiInstance } from "../../axios/apiService";

interface IDoctor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  profilePicture?: string;
  qualification: string;
  isBlocked: boolean;
  specialization: string;
  registrationNumber: string;
  certificate: string;
  isApproved: boolean;
  verificationStatus: "pending" | "approved" | "rejected";
  submittedAt: Date;
  verifiedAt?: Date;
  experience?: number;
}

const adminApi = createApiInstance("admin");

const DoctorDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<IDoctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [note, setNote] = useState("");

  const fetchDoctorDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.get(`/doctor/${id}`);
      setDoctor(response.data.data);
    } catch (err) {
      console.error("Error fetching doctor details:", err);
      setError("Failed to load doctor details. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDoctorDetails();
  }, [fetchDoctorDetails]);

  const handleApprove = () => setShowApproveModal(true);
  const handleReject = () => setShowRejectModal(true);

  const confirmApprove = async () => {
    if (!doctor) return;
    const toastId = toast.loading("Approving doctor...");
    try {
      await adminApi.post("/verify", {
        doctorId: doctor._id,
        status: "approved",
        notes: "Everything is verified",
      });
      toast.success("Doctor approved successfully!", { id: toastId });
      fetchDoctorDetails();
    } catch (err) {
      console.error("Error approving doctor:", err);
      toast.error("Failed to approve doctor. Please try again.", {
        id: toastId,
      });
    } finally {
      setShowApproveModal(false);
    }
  };

  const confirmReject = async () => {
    if (!doctor || !note.trim()) {
      toast.error("Please enter a note before rejecting.");
      return;
    }
    const toastId = toast.loading("Rejecting doctor...");
    try {
      await adminApi.post("/verify", {
        doctorId: doctor._id,
        status: "rejected",
        notes: note,
      });
      toast.success("Doctor rejected successfully!", { id: toastId });
      fetchDoctorDetails();
    } catch (err) {
      console.error("Error rejecting doctor:", err);
      toast.error("Failed to reject doctor. Please try again.", {
        id: toastId,
      });
    } finally {
      setShowRejectModal(false);
      setNote("");
    }
  };

  const handleCloseApproveModal = () => setShowApproveModal(false);
  const handleCloseRejectModal = () => setShowRejectModal(false);

  // Enhanced experience level calculation
  const getExperienceLevel = (years: number) => {
    if (years <= 2)
      return {
        level: "Junior",
        color: "from-blue-400 to-blue-600",
        bgColor: "from-blue-50 to-blue-100",
        textColor: "text-blue-800",
        stars: 2,
      };
    if (years <= 5)
      return {
        level: "Mid-Level",
        color: "from-green-400 to-green-600",
        bgColor: "from-green-50 to-green-100",
        textColor: "text-green-800",
        stars: 3,
      };
    if (years <= 10)
      return {
        level: "Senior",
        color: "from-orange-400 to-orange-600",
        bgColor: "from-orange-50 to-orange-100",
        textColor: "text-orange-800",
        stars: 4,
      };
    return {
      level: "Expert",
      color: "from-purple-400 to-purple-600",
      bgColor: "from-purple-50 to-purple-100",
      textColor: "text-purple-800",
      stars: 5,
    };
  };

  // Calculate experience progress (max 20 years for visualization)
  const getExperienceProgress = (years: number) => {
    const maxYears = 20;
    return Math.min((years / maxYears) * 100, 100);
  };

  if (loading) return <Loader />;

  if (error)
    return <ErrorDisplay error = {error}/>

  if (!doctor)
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 max-w-sm mx-auto text-center border border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Stethoscope className="w-7 h-7 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Doctor not found
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              The requested doctor details could not be loaded.
            </p>
            <Button
              onClick={() => navigate("/admin/doctors")}
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              Go to Doctor List
            </Button>
          </div>
        </div>
      </div>
    );

  const getStatusBadge = (status: string) => {
    let bgColor = "bg-gradient-to-r from-gray-100 to-gray-200";
    let textColor = "text-gray-800";
    let icon = AlertCircle;

    switch (status) {
      case "approved":
        bgColor = "bg-gradient-to-r from-emerald-100 to-emerald-200";
        textColor = "text-emerald-800";
        icon = CheckCircle;
        break;
      case "pending":
        bgColor = "bg-gradient-to-r from-amber-100 to-amber-200";
        textColor = "text-amber-800";
        icon = AlertCircle;
        break;
      case "rejected":
        bgColor = "bg-gradient-to-r from-red-100 to-red-200";
        textColor = "text-red-800";
        icon = XCircle;
        break;
      default:
        break;
    }

    const Icon = icon;

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${bgColor} ${textColor} shadow-sm border border-white/50`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const experienceData = doctor.experience
    ? getExperienceLevel(doctor.experience)
    : null;
  const experienceProgress = doctor.experience
    ? getExperienceProgress(doctor.experience)
    : 0;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="flex-1 p-4 lg:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Compact Header Section */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-all duration-200 hover:bg-white/60 rounded-lg px-3 py-1.5 backdrop-blur-sm text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back to Doctors</span>
            </Button>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    Doctor Details
                  </h1>
                  <p className="text-gray-600 text-sm">
                    Profile and verification status for {doctor.name}
                  </p>
                </div>
              </div>

              {/* Compact Action Buttons */}
              <div className="flex flex-wrap gap-2">
                {doctor.verificationStatus === "pending" && (
                  <>
                    <Button
                      onClick={handleApprove}
                      className="group relative inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                      title="Approve doctor"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </Button>
                    <Button
                      onClick={handleReject}
                      className="group relative inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                      title="Reject doctor"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Compact Main Content */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Compact Profile Card */}
            <div className="xl:col-span-1">
              <Card className="rounded-2xl shadow-xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-5">
                  <div className="text-center">
                    {/* Compact Profile Picture */}
                    <div className="relative inline-block mb-4">
                      <div className="w-20 h-20 rounded-full border-3 border-white shadow-xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        {doctor.profilePicture ? (
                          <img
                            src={doctor.profilePicture || "/placeholder.svg"}
                            alt={`${doctor.name}'s profile`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-xl font-bold text-white">
                            {doctor.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1">
                        {getStatusBadge(doctor.verificationStatus)}
                      </div>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                      {doctor.name}
                    </h2>
                    <p className="text-sm text-blue-600 font-semibold mb-3">
                      {doctor.specialization}
                    </p>

                    {doctor.isBlocked && (
                      <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-red-100 to-red-200 text-red-800 shadow-sm border border-red-200 mb-4">
                        <UserX className="w-3 h-3 mr-1" />
                        Account Blocked
                      </div>
                    )}
                  </div>

                  <Separator className="my-4 bg-gray-200" />

                  {/* Compact Contact Information */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-gray-900 mb-2">
                      Contact Information
                    </h3>

                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                      <div className="p-2 bg-blue-200 rounded-lg">
                        <Mail className="w-4 h-4 text-blue-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-blue-800">
                          Email
                        </p>
                        <p className="font-semibold text-gray-900 truncate text-sm">
                          {doctor.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                      <div className="p-2 bg-green-200 rounded-lg">
                        <Phone className="w-4 h-4 text-green-700" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-green-800">
                          Phone
                        </p>
                        <p className="font-semibold text-gray-900 text-sm">
                          {doctor.phone || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Compact Details Section */}
            <div className="xl:col-span-2 space-y-6">
              {/* Enhanced Professional Information with Better Experience Section */}
              <Card className="rounded-2xl shadow-xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                      <Award className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Professional Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-4 h-4 text-purple-600" />
                        <span className="text-xs font-semibold text-purple-800">
                          Qualification
                        </span>
                      </div>
                      <p className="font-bold text-gray-900 text-sm">
                        {doctor.qualification}
                      </p>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-semibold text-blue-800">
                          Registration Number
                        </span>
                      </div>
                      <p className="font-bold text-gray-900 text-sm">
                        {doctor.registrationNumber}
                      </p>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200 hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg">
                          <CalendarDays className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">
                          Timeline
                        </h3>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200 hover:shadow-md transition-all duration-300">
                          <div className="p-2 bg-indigo-200 rounded-lg">
                            <CalendarDays className="w-4 h-4 text-indigo-700" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-indigo-800 mb-1">
                              Application Submitted
                            </p>
                            <p className="font-bold text-gray-900 text-sm">
                              {new Date(doctor.submittedAt).toLocaleDateString(
                                "en-GB"
                              )}
                            </p>
                          </div>
                        </div>

                        {doctor.verifiedAt && (
                          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200 hover:shadow-md transition-all duration-300">
                            <div className="p-2 bg-emerald-200 rounded-lg">
                              <CheckCircle className="w-4 h-4 text-emerald-700" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-emerald-800 mb-1">
                                Verification Completed
                              </p>
                              <p className="font-bold text-gray-900 text-sm">
                                {new Date(doctor.verifiedAt).toLocaleDateString(
                                  "en-GB"
                                )}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Enhanced Experience Card - Now takes full width on mobile, half on larger screens */}
                    <div className="md:col-span-1">
                      {doctor.experience && experienceData ? (
                        <div
                          className={`p-5 bg-gradient-to-br ${experienceData.bgColor} rounded-xl border border-opacity-50 hover:shadow-lg transition-all duration-300 relative overflow-hidden group`}
                        >
                          {/* Background decoration */}
                          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full"></div>

                          <div className="relative z-10">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Briefcase
                                  className={`w-5 h-5 ${experienceData.textColor
                                    .replace("text-", "text-")
                                    .replace("-800", "-600")}`}
                                />
                                <span
                                  className={`text-xs font-bold ${experienceData.textColor} uppercase tracking-wide`}
                                >
                                  Professional Experience
                                </span>
                              </div>
                              <TrendingUp
                                className={`w-4 h-4 ${experienceData.textColor
                                  .replace("text-", "text-")
                                  .replace("-800", "-600")} opacity-60`}
                              />
                            </div>

                            {/* Experience Years Display */}
                            <div className="flex items-baseline gap-2 mb-3">
                              <span className="text-3xl font-bold text-gray-900">
                                {doctor.experience}
                              </span>
                              <span className="text-sm font-semibold text-gray-700">
                                {doctor.experience === 1 ? "Year" : "Years"}
                              </span>
                            </div>

                            {/* Experience Level Badge */}
                            <div className="flex items-center gap-2 mb-3">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${experienceData.color} text-white shadow-sm`}
                              >
                                {experienceData.level}
                              </span>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${
                                      i < experienceData.stars
                                        ? `${experienceData.textColor
                                            .replace("text-", "text-")
                                            .replace(
                                              "-800",
                                              "-600"
                                            )} fill-current`
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>

                            {/* Experience Progress Bar */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span
                                  className={`font-medium ${experienceData.textColor}`}
                                >
                                  Experience Level
                                </span>
                                <span className="text-gray-600">
                                  {Math.round(experienceProgress)}%
                                </span>
                              </div>
                              <div className="w-full bg-white/60 rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-full bg-gradient-to-r ${experienceData.color} rounded-full transition-all duration-1000 ease-out shadow-sm`}
                                  style={{ width: `${experienceProgress}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>Beginner</span>
                                <span>Expert (20+ years)</span>
                              </div>
                            </div>

                            {/* Additional Experience Info */}
                            <div className="mt-4 pt-3 border-t border-white/30">
                              <div className="flex items-center gap-2 text-xs">
                                <Calendar
                                  className={`w-3 h-3 ${experienceData.textColor
                                    .replace("text-", "text-")
                                    .replace("-800", "-600")}`}
                                />
                                <span className="text-gray-700 font-medium">
                                  Started practicing in{" "}
                                  {new Date().getFullYear() -
                                    (doctor.experience || 0)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-gray-600" />
                            <span className="text-xs font-semibold text-gray-800">
                              Experience
                            </span>
                          </div>
                          <p className="font-bold text-gray-900 text-sm">
                            Not specified
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Experience Certificate
                    </h3>
                  </div>

                  <Button
                    onClick={() => setIsFullscreen(true)}
                    className="mt-4"
                    variant="outline"
                  >
                    View Fullscreen
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center">
          <div className="relative p-4">
            <button
              className="absolute top-2 right-2 text-white bg-gray-800 rounded-full p-2 hover:bg-gray-700"
              onClick={() => setIsFullscreen(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={doctor.certificate || "/placeholder.svg"}
              alt="Full Experience Certificate"
              className="w-auto max-w-[600px] h-auto max-h-[80vh] rounded-lg shadow-lg"
            />
          </div>
        </div>
      )}

      <CancelConfirmationModal
        isOpen={showApproveModal}
        onConfirm={confirmApprove}
        onClose={handleCloseApproveModal}
        message={`Are you sure you want to approve ${doctor.name}'s registration?`}
      />

      <CancelConfirmationModal
        isOpen={showRejectModal}
        onConfirm={confirmReject}
        onClose={handleCloseRejectModal}
        message={`Are you sure you want to reject ${doctor.name}'s registration? This action cannot be undone.`}
        requireNote={true}
        note={note}
        setNote={setNote}
      />
    </div>
  );
};

export default DoctorDetailsPage;

// "use client"

// import type React from "react"
// import { useState, useEffect, useCallback } from "react"
// import { useParams, useNavigate } from "react-router-dom"
// import adminApi from "../../axios/AdminInstance"
// import Loader from "./Loader"
// import AdminSidebar from "./Home/AdminSidebar"
// import CancelConfirmationModal from "../CommonComponents/CancelConfirmationModal"
// import { toast } from "react-hot-toast"
// import {
//   Stethoscope,
//   FileText,
//   Award,
//   Hash,
//   Briefcase,
//   Mail,
//   Phone,
//   MapPin,
//   Calendar,
//   UserCheck,
//   UserX,
//   ArrowLeft,
//   Shield,
// } from "lucide-react"

// interface IDoctor {
//   _id: string
//   name: string
//   email: string
//   phone: string
//   address: string
//   specialization: string
//   experience: number
//   registrationNo: string
//   certificateDetails: string
//   verificationStatus: "pending" | "approved" | "rejected"
//   isBlocked: boolean
//   createdAt: string
//   updatedAt: string
// }

// const DoctorDetailsPage: React.FC = () => {
//   const { id } = useParams<{ id: string }>()
//   const navigate = useNavigate()
//   const [doctor, setDoctor] = useState<IDoctor | null>(null)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const [showApproveModal, setShowApproveModal] = useState(false)
//   const [showRejectModal, setShowRejectModal] = useState(false)

//   const fetchDoctorDetails = useCallback(async () => {
//     setLoading(true)
//     setError(null)
//     try {
//       const response = await adminApi.get(`/doctor/${id}`)
//       setDoctor(response.data.data)
//     } catch (err) {
//       console.error("Error fetching doctor details:", err)
//       setError("Failed to load doctor details. Please try again.")
//     } finally {
//       setLoading(false)
//     }
//   }, [id])

//   useEffect(() => {
//     fetchDoctorDetails()
//   }, [fetchDoctorDetails])

//   const handleApprove = () => {
//     setShowApproveModal(true)
//   }

//   const handleReject = () => {
//     setShowRejectModal(true)
//   }

//   const confirmApprove = async () => {
//     if (!doctor) return
//     const toastId = toast.loading("Approving doctor...")
//     try {
//       await adminApi.put(`/doctor/approve/${doctor._id}`)
//       toast.success("Doctor approved successfully!", { id: toastId })
//       fetchDoctorDetails() // Refetch to update status
//     } catch (err) {
//       console.error("Error approving doctor:", err)
//       toast.error("Failed to approve doctor. Please try again.", { id: toastId })
//     } finally {
//       setShowApproveModal(false)
//     }
//   }

//   const confirmReject = async () => {
//     if (!doctor) return
//     const toastId = toast.loading("Rejecting doctor...")
//     try {
//       await adminApi.put(`/doctor/reject/${doctor._id}`)
//       toast.success("Doctor rejected successfully!", { id: toastId })
//       fetchDoctorDetails() // Refetch to update status
//     } catch (err) {
//       console.error("Error rejecting doctor:", err)
//       toast.error("Failed to reject doctor. Please try again.", { id: toastId })
//     } finally {
//       setShowRejectModal(false)
//     }
//   }

//   const handleCloseApproveModal = () => setShowApproveModal(false)
//   const handleCloseRejectModal = () => setShowRejectModal(false)

//   if (loading) return <Loader />

//   if (error)
//     return (
//       <div className="flex min-h-screen bg-gradient-to-br from-red-50 to-red-100">
//         <div className="w-64">
//           <AdminSidebar />
//         </div>
//         <div className="flex-1 flex items-center justify-center">
//           <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
//             <div className="text-center">
//               <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
//                   />
//                 </svg>
//               </div>
//               <h3 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h3>
//               <p className="text-red-600 font-medium">{error}</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     )

//   if (!doctor)
//     return (
//       <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
//         <div className="w-64">
//           <AdminSidebar />
//         </div>
//         <div className="flex-1 flex items-center justify-center">
//           <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto text-center">
//             <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
//               <Stethoscope className="w-8 h-8 text-gray-400" />
//             </div>
//             <h3 className="text-xl font-semibold text-gray-900 mb-2">Doctor not found</h3>
//             <p className="text-gray-500">The requested doctor details could not be loaded.</p>
//             <button
//               onClick={() => navigate("/admin/doctors")}
//               className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200 shadow-md"
//             >
//               Go to Doctor List
//             </button>
//           </div>
//         </div>
//       </div>
//     )

//   const getStatusBadge = (status: string) => {
//     let bgColor = "bg-gray-100"
//     let textColor = "text-gray-800"
//     let dotColor = "bg-gray-500"

//     switch (status) {
//       case "approved":
//         bgColor = "bg-emerald-100"
//         textColor = "text-emerald-800"
//         dotColor = "bg-emerald-500"
//         break
//       case "pending":
//         bgColor = "bg-amber-100"
//         textColor = "text-amber-800"
//         dotColor = "bg-amber-500"
//         break
//       case "rejected":
//         bgColor = "bg-red-100"
//         textColor = "text-red-800"
//         dotColor = "bg-red-500"
//         break
//       default:
//         break
//     }

//     return (
//       <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${bgColor} ${textColor}`}>
//         <div className={`w-2 h-2 rounded-full mr-2 ${dotColor}`} />
//         {status.charAt(0).toUpperCase() + status.slice(1)}
//       </span>
//     )
//   }

//   return (
//     <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
//       <div className="w-64 flex-shrink-0">
//         <AdminSidebar />
//       </div>

//       <div className="flex-1 p-6 lg:p-8">
//         <div className="max-w-7xl mx-auto">
//           {/* Header Section */}
//           <div className="mb-8 flex items-center justify-between">
//             <div>
//               <button
//                 onClick={() => navigate(-1)}
//                 className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors duration-200"
//               >
//                 <ArrowLeft className="w-5 h-5" />
//                 <span className="font-medium">Back to Doctors</span>
//               </button>
//               <div className="flex items-center gap-3 mb-2">
//                 <div className="p-2 bg-blue-600 rounded-lg">
//                   <Stethoscope className="w-6 h-6 text-white" />
//                 </div>
//                 <h1 className="text-3xl font-bold text-gray-900">Doctor Details</h1>
//               </div>
//               <p className="text-gray-600">Detailed information and verification status for {doctor.name}</p>
//             </div>
//             {doctor.verificationStatus === "pending" && (
//               <div className="flex gap-3">
//                 <button
//                   onClick={handleApprove}
//                   className="group relative inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
//                   title="Approve doctor"
//                 >
//                   <UserCheck className="w-4 h-4" />
//                   <span>Approve</span>
//                 </button>
//                 <button
//                   onClick={handleReject}
//                   className="group relative inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
//                   title="Reject doctor"
//                 >
//                   <UserX className="w-4 h-4" />
//                   <span>Reject</span>
//                 </button>
//               </div>
//             )}
//           </div>

//           {/* Doctor Details Card */}
//           <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden p-8">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//               {/* Personal Details */}
//               <div>
//                 <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-3">Personal Information</h2>
//                 <div className="space-y-4">
//                   <div className="flex items-center gap-3">
//                     <Stethoscope className="w-5 h-5 text-blue-600" />
//                     <div>
//                       <p className="text-sm font-medium text-gray-600">Name</p>
//                       <p className="text-lg font-semibold text-gray-900">{doctor.name}</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-3">
//                     <Mail className="w-5 h-5 text-blue-600" />
//                     <div>
//                       <p className="text-sm font-medium text-gray-600">Email</p>
//                       <p className="text-lg font-semibold text-gray-900">{doctor.email}</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-3">
//                     <Phone className="w-5 h-5 text-blue-600" />
//                     <div>
//                       <p className="text-sm font-medium text-gray-600">Phone</p>
//                       <p className="text-lg font-semibold text-gray-900">{doctor.phone || "N/A"}</p>
//                     </div>
//                   </div>
//                   {/* <div className="flex items-start gap-3">
//                     <MapPin className="w-5 h-5 text-blue-600 mt-1" />
//                     <div>
//                       <p className="text-sm font-medium text-gray-600">Address</p>
//                       <p className="text-lg font-semibold text-gray-900">{doctor.address || "N/A"}</p>
//                     </div>
//                   </div> */}
//                   <div className="flex items-center gap-3">
//                     <Calendar className="w-5 h-5 text-blue-600" />
//                     <div>
//                       <p className="text-sm font-medium text-gray-600">Registered On</p>
//                       <p className="text-lg font-semibold text-gray-900">
//                         {new Date(doctor.createdAt).toLocaleDateString("en-GB")}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Professional Details */}
//               <div>
//                 <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-3">Professional Information</h2>
//                 <div className="space-y-4">
//                   <div className="flex items-center gap-3">
//                     <Award className="w-5 h-5 text-purple-600" />
//                     <div>
//                       <p className="text-sm font-medium text-gray-600">Specialization</p>
//                       <p className="text-lg font-semibold text-gray-900">{doctor.specialization}</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-3">
//                     <Briefcase className="w-5 h-5 text-purple-600" />
//                     <div>
//                       <p className="text-sm font-medium text-gray-600">Experience</p>
//                       <p className="text-lg font-semibold text-gray-900">
//                         {doctor.experience} {doctor.experience === 1 ? "Year" : "Years"}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-3">
//                     <Hash className="w-5 h-5 text-purple-600" />
//                     <div>
//                       <p className="text-sm font-medium text-gray-600">Registration No.</p>
//                       <p className="text-lg font-semibold text-gray-900">{doctor.registrationNo}</p>
//                     </div>
//                   </div>
//                   <div className="flex items-start gap-3">
//                     <FileText className="w-5 h-5 text-purple-600 mt-1" />
//                     <div>
//                       <p className="text-sm font-medium text-gray-600">Certificate Details</p>
//                       <p className="text-lg font-semibold text-gray-900 whitespace-pre-wrap">
//                         {doctor.certificateDetails || "N/A"}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-3">
//                     <Shield className="w-5 h-5 text-purple-600" />
//                     <div>
//                       <p className="text-sm font-medium text-gray-600">Verification Status</p>
//                       {getStatusBadge(doctor.verificationStatus)}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Approve Confirmation Modal */}
//       <CancelConfirmationModal
//         isOpen={showApproveModal}
//         onConfirm={confirmApprove}
//         onClose={handleCloseApproveModal}
//         message={`Are you sure you want to approve ${doctor.name}'s registration?`}
//       />

//       {/* Reject Confirmation Modal */}
//       <CancelConfirmationModal
//         isOpen={showRejectModal}
//         onConfirm={confirmReject}
//         onClose={handleCloseRejectModal}
//         message={`Are you sure you want to reject ${doctor.name}'s registration? This action cannot be undone.`}
//       />
//     </div>
//   )
// }

// export default DoctorDetailsPage
