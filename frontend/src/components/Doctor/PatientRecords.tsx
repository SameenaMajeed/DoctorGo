"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Plus,
  ArrowLeft,
  Calendar,
  Stethoscope,
  Pill,
  FileText,
  User,
  Phone,
  Mail,
  Search,
  Filter,
  Activity,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Button } from "../CommonComponents/Button";
import { Card, CardContent } from "../CommonComponents/card";
import type { IUser } from "../../types/auth";
import type { IAppointment, IPrescription } from "../../Types";
// import doctorApi from "../../axios/DoctorInstance";
import Pagination from "../../Pagination/Pagination";
import { useSelector } from "react-redux";
import type { RootState } from "../../slice/Store/Store";
import { createApiInstance } from "../../axios/apiService";

interface IMedicalRecord {
  date: string;
  complaint: string;
  diagnosis: string;
  treatment: string;
  prescription: string;
  _id?: string;
}

interface ILocationState {
  patient?: IUser;
  appointment?: IAppointment;
}

const doctorApi = createApiInstance("doctor");

const MedicalRecord: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const doctorId = useSelector((state: RootState) => state.doctor.doctor?._id);
  const location = useLocation();

  // State management
  const [patient, setPatient] = useState<IUser | null>(null);
  const [appointment] = useState<IAppointment | null>(null);
  const [records, setRecords] = useState<IMedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 4;
  const [total, setTotal] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);

  // Fetch patient data and prescriptions
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const state = location.state as ILocationState | undefined;
        let patientData = state?.patient;

        if (!patientData && userId) {
          const patientRes = await doctorApi.get(`/patient-records/${userId}`);
          patientData = patientRes.data;
        }

        if (!patientData) {
          throw new Error("No patient identifier available");
        }

        setPatient(patientData);

        if (!doctorId || !userId) {
          throw new Error("Doctor ID or User ID missing");
        }

        const response = await doctorApi.get("/allPrescriptions", {
          params: {
            doctorId,
            userId,
            page,
            limit,
            searchTerm,
          },
        });

        const { prescriptions, total } = response.data.data;

        const mappedRecords: IMedicalRecord[] = prescriptions.map(
          (p: IPrescription) => ({
            _id: p._id,
            date: new Date(p.createdAt).toLocaleDateString(),
            complaint: p.symptoms,
            diagnosis: p.disease,
            treatment: p.medicines
              .map((m) => `${m.name} (${m.quantity}, ${m.time_gap})`)
              .join(", "),
            prescription: p.medicines
              .map((m) => `${m.name}: ${m.quantity} doses, ${m.time_gap}`)
              .join("; "),
          })
        );

        setTotal(Math.ceil(total / limit));
        setRecords(mappedRecords);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load medical records");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location.state, userId, page, searchTerm, navigate]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= total) {
      setPage(newPage);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    try {
      await doctorApi.delete(`/records/${recordId}`);
      setRecords(records.filter((record) => record._id !== recordId));
    } catch (err) {
      console.error("Failed to delete record:", err);
      setError("Failed to delete record");
    }
  };

  const handleSelectRecord = (recordId: string) => {
    setSelectedRecords((prev) =>
      prev.includes(recordId)
        ? prev.filter((id) => id !== recordId)
        : [...prev, recordId]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-gray-600 font-medium">
            Loading medical records...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mb-4 mx-auto">
            <User className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 font-medium">Patient not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

      <div className="relative z-10 flex gap-8 p-6">
        {/* Enhanced Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-80 flex-shrink-0"
        >
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl overflow-hidden">
            {/* Patient Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
              <div className="text-center">
                <div className="relative inline-block">
                  <img
                    src={
                      patient.profilePicture ||
                      "/placeholder.svg?height=120&width=120"
                    }
                    alt="Profile"
                    className="w-24 h-24 rounded-full mx-auto border-4 border-white shadow-lg object-cover"
                  />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h2 className="mt-4 text-xl font-bold">{patient.name}</h2>
                <p className="text-blue-100 text-sm">
                  Patient ID: #{patient._id?.slice(-6)}
                </p>
              </div>
            </div>

            {/* Patient Details */}
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Email
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {patient.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Phone
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {patient.mobile_no}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Age & Gender
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {patient.age} years • {patient.gender}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {records.length}
                  </div>
                  <div className="text-xs text-blue-600 font-medium">
                    Total Records
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {
                      records.filter(
                        (r) =>
                          new Date(r.date) >
                          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                      ).length
                    }
                  </div>
                  <div className="text-xs text-green-600 font-medium">
                    This Month
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mt-6">
                <Button
                  onClick={() =>
                    navigate(`/doctor/newRecords`, {
                      state: { patient, appointment },
                    })
                  }
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-md hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-sm sm:text-base">
                    Create New Record
                  </span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate(`/doctor/${doctorId}/patients`)}
                  className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-black rounded-xl transition-colors duration-200 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="text-sm sm:text-base font-medium">
                    Back to Patients
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Medical Records
                </h1>
                <p className="text-gray-600 mt-1">
                  Complete medical history for {patient.name}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() =>
                    navigate(`/doctor/newRecords`, {
                      state: { patient, appointment },
                    })
                  }
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-md hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-sm sm:text-base">
                    Create New Record
                  </span>
                </Button>
                {selectedRecords.length > 0 && (
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <FileText className="w-4 h-4" />
                    Bulk Actions ({selectedRecords.length})
                  </Button>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex flex-1 gap-4 items-center">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search medical records..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                  </Button>
                </div>
                <div className="text-sm text-gray-600">
                  Showing {records.length} of {records.length} records
                </div>
              </div>
            </div>
          </motion.div>

          {/* Records Grid */}
          <AnimatePresence mode="wait">
            {records.length > 0 ? (
              <motion.div
                key="records"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {records.map((record, index) => (
                  <motion.div
                    key={record._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group"
                  >
                    <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <input
                              type="checkbox"
                              checked={selectedRecords.includes(
                                record._id || ""
                              )}
                              onChange={() =>
                                handleSelectRecord(record._id || "")
                              }
                              className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />

                            <div className="flex-1 space-y-4">
                              {/* Header */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                      Medical Record
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                      <Calendar className="w-4 h-4" />
                                      {record.date}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      record._id &&
                                      handleDeleteRecord(record._id)
                                    }
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>

                              {/* Content Grid */}
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                  <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                      <AlertCircle className="w-4 h-4 text-red-600" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-xs text-red-600 uppercase tracking-wide font-medium mb-1">
                                        Chief Complaint
                                      </p>
                                      <p className="text-sm text-gray-900">
                                        {record.complaint}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                      <Stethoscope className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-xs text-blue-600 uppercase tracking-wide font-medium mb-1">
                                        Diagnosis
                                      </p>
                                      <p className="text-sm text-gray-900">
                                        {record.diagnosis}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                      <Activity className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-xs text-green-600 uppercase tracking-wide font-medium mb-1">
                                        Treatment
                                      </p>
                                      <p className="text-sm text-gray-900">
                                        {record.treatment}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                      <Pill className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-xs text-purple-600 uppercase tracking-wide font-medium mb-1">
                                        Prescription
                                      </p>
                                      <p className="text-sm text-gray-900">
                                        {record.prescription}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-20"
              >
                <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
                  <CardContent className="p-12">
                    <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <FileText className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No Medical Records Found
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Start by creating the first medical record for this
                      patient
                    </p>
                    <Button
                      onClick={() =>
                        navigate(`/doctor/newRecords`, {
                          state: { patient, appointment },
                        })
                      }
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Record
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination */}
          {total > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center mt-8"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
                <Pagination
                  currentPage={page}
                  totalPages={total}
                  onPageChange={handlePageChange}
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalRecord;

// import React, { useState, useEffect } from "react";
// import { useLocation, useNavigate, useParams } from "react-router-dom";
// import { Button } from "../CommonComponents/Button";
// import { Card, CardContent } from "../CommonComponents/card";
// import { Eye, Trash2 } from "lucide-react";
// import { IUser } from "../../types/auth";
// import { IAppointment, IPrescription } from "../../Types";
// import doctorApi from "../../axios/DoctorInstance";
// import Pagination from "../../Pagination/Pagination";
// import { useSelector } from "react-redux";
// import { RootState } from "../../slice/Store/Store";

// interface IMedicalRecord {
//   date: string;
//   complaint: string;
//   diagnosis: string;
//   treatment: string;
//   prescription: string;
//   _id?: string;
// }

// interface ILocationState {
//   patient?: IUser;
//   appointment?: IAppointment;
// }

// const MedicalRecord: React.FC = () => {
//   const navigate = useNavigate();
//   const { userId } = useParams<{ userId: string }>();
//   const doctorId = useSelector((state: RootState) => state.doctor.doctor?._id);

//   console.log(userId, doctorId);

//   const location = useLocation();

//   // State management
//   const [patient, setPatient] = useState<IUser | null>(null);
//   const [appointment] = useState<IAppointment | null>(null);
//   const [records, setRecords] = useState<IMedicalRecord[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [page, setPage] = useState(1);
//   const limit = 4;
//   const [total, setTotal] = useState(1);
//   const [searchTerm] = useState("");

//   // Fetch patient data and prescriptions
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const state = location.state as ILocationState | undefined;
//         let patientData = state?.patient;

//         if (!patientData && userId) {
//           // Fetch patient data if not in state
//           const patientRes = await doctorApi.get(`/patient-records/${userId}`);
//           patientData = patientRes.data;
//         }

//         if (!patientData) {
//           throw new Error("No patient identifier available");
//         }

//         setPatient(patientData);

//         if (!doctorId || !userId) {
//           throw new Error("Doctor ID or User ID missing");
//         }

//         const response = await doctorApi.get("/allPrescriptions", {
//           params: {
//             doctorId,
//             userId,
//             page,
//             limit,
//             searchTerm,
//           },
//         });

//         console.log(response.data);

//         const { prescriptions, total } = response.data.data;

//         // Map prescriptions to MedicalRecord format
//         const mappedRecords: IMedicalRecord[] = prescriptions.map(
//           (p: IPrescription) => ({
//             _id: p._id,
//             date: new Date(p.createdAt).toLocaleDateString(),
//             complaint: p.symptoms,
//             diagnosis: p.disease,
//             treatment: p.medicines
//               .map((m) => `${m.name} (${m.quantity}, ${m.time_gap})`)
//               .join(", "),
//             prescription: p.medicines
//               .map((m) => `${m.name}: ${m.quantity} doses, ${m.time_gap}`)
//               .join("; "),
//             cost: "N/A",
//           })
//         );

//         if (response.data.data) {
//           setTotal(Math.ceil(response.data.data.total / limit));
//         }
//         setTotal(Math.ceil(total / limit));
//         setRecords(mappedRecords);
//       } catch (err) {
//         console.error("Failed to fetch data:", err);
//         setError("Failed to load medical records");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, [location.state, userId, page, searchTerm, navigate]);

//   // const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
//   //   setSearchTerm(e.target.value);
//   //   setPage(1); // Reset to first page on search
//   // };

//   const handlePageChange = (newPage: number) => {
//     if (newPage >= 1 && newPage <= total) {
//       setPage(newPage);
//     }
//   };

//   const handleDeleteRecord = async (recordId: string) => {
//     try {
//       await doctorApi.delete(`/records/${recordId}`);
//       setRecords(records.filter((record) => record._id !== recordId));
//     } catch (err) {
//       console.error("Failed to delete record:", err);
//       setError("Failed to delete record");
//     }
//   };

//   if (loading) {
//     return <div className="flex min-h-screen bg-gray-50 p-6">Loading...</div>;
//   }

//   if (error) {
//     return (
//       <div className="flex min-h-screen bg-gray-50 p-6 text-red-500">
//         {error}
//       </div>
//     );
//   }

//   if (!patient) {
//     return (
//       <div className="flex min-h-screen bg-gray-50 p-6">Patient not found</div>
//     );
//   }

//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       {/* Sidebar */}
//       <div className="w-1/4">
//         <Card className="items-center text-center p-6 shadow-md border border-gray-200">
//           <img
//             src={patient.profilePicture || "/profile-placeholder.png"}
//             alt="Profile"
//             width={120}
//             height={120}
//             className="rounded-full mx-auto shadow-sm"
//           />
//           <p className="mt-4 text-lg font-semibold">{patient.name}</p>
//           <p className="text-sm text-gray-600">{patient.email}</p>
//           <p className="text-sm text-gray-600">{patient.mobile_no}</p>
//           <span className="inline-block bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm mt-3">
//             Age : {patient.age}
//           </span>
//           <div>
//             <Button
//               variant="outline"
//               className="w-full mt-4 bg-white hover:bg-gray-100 text-blue-600 border-blue-600 hover:border-blue-700 transition duration-200"
//               onClick={() => navigate(`/doctor/${doctorId}/patients`)}
//             >
//               Back
//             </Button>
//           </div>
//         </Card>
//       </div>
//       {/* Main Content */}
//       <div className="w-3/4 p-6">
//         <div className="flex justify-between items-center mb-6">
//           <h3 className="text-lg font-semibold">Medical Record</h3>
//           <div className="flex space-x-4">
//             {/* <input
//               type="text"
//               placeholder="Search prescriptions..."
//               value={searchTerm}
//               onChange={handleSearch}
//               className="border rounded-md p-2"
//             /> */}
//             <Button
//               onClick={() =>
//                 navigate(`/doctor/newRecords`, {
//                   state: {
//                     patient,
//                     appointment,
//                   },
//                 })
//               }
//             >
//               New Record +
//             </Button>
//           </div>
//         </div>

//         {records.length > 0 ? (
//           records.map((record) => (
//             <Card key={record._id} className="mb-4">
//               <CardContent className="p-4">
//                 <div className="flex justify-between items-start">
//                   <div>
//                     <p className="text-sm text-gray-500 mb-1">{record.date}</p>
//                     <p>
//                       <strong>Complaint:</strong> {record.complaint}
//                     </p>
//                     <p>
//                       <strong>Diagnosis:</strong> {record.diagnosis}
//                     </p>
//                     <p>
//                       <strong>Treatment:</strong> {record.treatment}
//                     </p>
//                     <p>
//                       <strong>Prescription:</strong> {record.prescription}
//                     </p>
//                   </div>
//                   <div className="text-right">
//                     <div className="flex space-x-2 justify-end mt-2">
//                       <Button variant="ghost">
//                         <Eye className="w-4 h-4" />
//                       </Button>
//                       <Button
//                         variant="ghost"
//                         onClick={() =>
//                           record._id && handleDeleteRecord(record._id)
//                         }
//                       >
//                         <Trash2 className="w-4 h-4 text-red-500" />
//                       </Button>
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           ))
//         ) : (
//           <Card>
//             <CardContent className="p-4 text-center text-gray-500">
//               No medical records found
//             </CardContent>
//           </Card>
//         )}
//         {total > 1 && (
//           <div className="mt-6 flex justify-center">
//             <Pagination
//               currentPage={page}
//               totalPages={total}
//               onPageChange={handlePageChange}
//             />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MedicalRecord;
