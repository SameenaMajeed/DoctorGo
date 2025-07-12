import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { IPrescription } from "../../Types";
import toast from "react-hot-toast";
import api from "../../axios/UserInstance";
import {
  FaDownload,
  FaUserMd,
  FaUserInjured,
  FaFlask,
  FaPills,
  FaCalendarAlt,
  FaFileMedical,
  FaNotesMedical,
  FaHeartbeat,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import { RootState } from "../../slice/Store/Store";
import { Button } from "../CommonComponents/Button";
import { Card, CardHeader } from "../CommonComponents/card";
import { Skeleton } from "../CommonComponents/UI/skeleton";
import { Badge } from "../CommonComponents/UI/badge";
import { CardContent, CardTitle } from "../CommonComponents/UI/card";

const PrescriptionView: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const [prescription, setPrescription] = useState<IPrescription | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [downloading, setDownloading] = useState<boolean>(false);
  const prescriptionRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const token = useSelector((state: RootState) => state.user.user?.accessToken);

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        const res = await api.get(`/prescription/${appointmentId}`);
        setPrescription(res.data.data.prescription);
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "Failed to load prescription"
        );
        setError(
          error.response?.data?.message || "Failed to load prescription"
        );
      } finally {
        setLoading(false);
      }
    };

    if (appointmentId) {
      fetchPrescription();
    }
  }, [appointmentId]);

  const handleDownload = async (prescriptionId: string) => {
    try {
      setDownloading(true);
      setError(null);
      const response = await api.get(
        `/prescriptions/${prescriptionId}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `prescription_${prescriptionId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Prescription downloaded successfully");
    } catch (error: any) {
      console.error("Download failed:", error);
      setError("Failed to download PDF");
      toast.error("Failed to download prescription");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Error Loading Prescription
          </h2>
          <p className="text-red-500 mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-blue-600 mb-2">
            Prescription Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The requested prescription does not exist or you don't have access
            to it.
          </p>
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const generateShortBookingId = (id: string): string => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = (hash << 5) - hash + id.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    // Convert to base36 (0-9, a-z), remove negatives and slice first 6
    return Math.abs(hash).toString(36).slice(0, 6).toUpperCase();
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-indigo-800">
            Prescription Details
          </h1>
        </div>
        <Button
          onClick={() => handleDownload(prescription._id)}
          disabled={downloading}
          className="gap-2"
        >
          <FaDownload />
          {downloading ? "Downloading..." : "Download PDF"}
        </Button>
      </div>

      <div
        ref={prescriptionRef}
        className="bg-white rounded-xl shadow-lg p-6 md:p-8 space-y-8 border border-gray-200"
      >
        {/* Header */}
        <div className="text-center border-b pb-6">
          <div className="flex items-center justify-center gap-3">
            <FaFileMedical className="text-indigo-600 text-3xl" />
            <h2 className="text-3xl font-bold text-indigo-700">
              MEDICAL PRESCRIPTION
            </h2>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Booking ID:{" "}
            <span className="font-medium text-indigo-700">
              {generateShortBookingId(prescription._id)}
            </span>
          </p>
          <Badge
            variant="outline"
            className="mt-4 text-indigo-600 border-indigo-600"
          >
            <FaCalendarAlt />
            <span>
              {new Date(prescription.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Doctor Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FaUserMd className="text-blue-600 text-xl" />
                <span>Doctor Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{prescription.doctorId.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Specialization</p>
                <p className="font-medium">
                  {prescription.doctorId.specialization}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contact</p>
                <p className="font-medium">{prescription.doctorId.email}</p>
                <p className="font-medium">{prescription.doctorId.phone}</p>
              </div>
            </CardContent>
          </Card>

          {/* Patient Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FaUserInjured className="text-green-600 text-xl" />
                <span>Patient Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{prescription.userId.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Demographics</p>
                <p className="font-medium">
                  {prescription.userId.gender}, {prescription.userId.age} years
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contact</p>
                <p className="font-medium">{prescription.userId.email}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Medical Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <FaNotesMedical className="text-yellow-600 text-xl" />
              <span>Medical Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <FaHeartbeat className="text-red-500" />
                Symptoms
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                {prescription.symptoms || "No symptoms recorded"}
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Diagnosis</h3>
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                {prescription.disease || "No diagnosis recorded"}
              </div>
            </div>
            {prescription.vitalSigns && (
              <div className="md:col-span-2">
                <h3 className="font-medium mb-2">Vital Signs</h3>
                <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                  {prescription.vitalSigns}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Medicines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <FaPills className="text-purple-600 text-xl" />
              <span>Prescribed Medicines</span>
              <Badge className="ml-auto">
                {prescription.medicines.length} items
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prescription.medicines.map((med, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-lg text-purple-700">
                      {med.name}
                    </h3>
                    <Badge>
                      {med.quantity} {med.quantity > 1 ? "units" : "unit"}
                    </Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Dosage</p>
                      <p>{med.dosage}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Frequency</p>
                      <p>{med.time_gap}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Test Reports */}
        {prescription.testReports?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FaFlask className="text-red-600 text-xl" />
                <span>Test Reports</span>
                <Badge className="ml-auto">
                  {prescription.testReports.length} reports
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                {prescription.testReports.map((report, index) => (
                  <div key={index} className="text-center group">
                    <div className="relative overflow-hidden rounded-lg border bg-white p-2 shadow-sm w-48 h-48 flex items-center justify-center">
                      <img
                        src={report.img}
                        alt={`Test Report ${index + 1}`}
                        className="object-contain max-w-full max-h-full"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          variant="ghost"
                          // size="sm"
                          className="text-white hover:text-white hover:bg-black/20"
                          onClick={() => window.open(report.img, "_blank")}
                        >
                          View Fullscreen
                        </Button>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      Report {index + 1}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PrescriptionView;

// import React, { useEffect, useState, useRef } from "react";
// import { useParams } from "react-router-dom";
// import { IPrescription } from "../../Types";
// import toast from "react-hot-toast";
// import api from "../../axios/UserInstance";
// import {
//   FaDownload,
//   FaUserMd,
//   FaUserInjured,
//   FaFlask,
//   FaPills,
// } from "react-icons/fa";
// import { useSelector } from "react-redux";
// import { RootState } from "../../slice/Store/Store";

// const PrescriptionView: React.FC = () => {
//   const { appointmentId } = useParams<{ appointmentId: string }>();
//   const [prescription, setPrescription] = useState<IPrescription | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const prescriptionRef = useRef<HTMLDivElement>(null);
//   const [error, setError] = useState<string | null>(null);
//   const token = useSelector((state: RootState) => state.user.user?.accessToken);

//   useEffect(() => {
//     const fetchPrescription = async () => {
//       try {
//         const res = await api.get(`/prescription/${appointmentId}`);
//         setPrescription(res.data.data.prescription);
//       } catch (error: any) {
//         toast.error(
//           error.response?.data?.message || "Failed to load prescription"
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (appointmentId) {
//       fetchPrescription();
//     }
//   }, [appointmentId]);

//   const handleDownload = async (prescriptionId: string) => {
//     try {
//       setError(null);
//       const response = await api.get(
//         `/prescriptions/${prescriptionId}/download`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//           responseType: "blob",
//         }
//       );

//       console.log("response.data", response.data);

//       const url = window.URL.createObjectURL(
//         new Blob([response.data], { type: "application/pdf" })
//       );
//       const link = document.createElement("a");
//       link.href = url;
//       link.download = `prescription_${prescriptionId}.pdf`;
//       link.click();
//       window.URL.revokeObjectURL(url);
//     } catch (error: any) {
//       console.error("Download failed:", error);
//       setError("Failed to download PDF");
//     }
//   };

//   if (loading) return <div className="p-4 text-center">Loading...</div>;
//   if(error) return <p className="text-center text-red-500 text-lg mb-4">{error}</p>

//   if (!prescription) {
//     return (
//       <div className="p-4 text-center text-gray-600">
//         Prescription not found.
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-4xl mx-auto p-4">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold text-indigo-800">
//           Prescription Details
//         </h1>
//         <button
//           onClick={() => handleDownload(prescription._id)}
//           className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200 text-sm font-medium"
//         >
//           <FaDownload /> Download PDF
//         </button>
//       </div>

//       <div
//         ref={prescriptionRef}
//         className="bg-white rounded-xl shadow-lg p-8 space-y-8 border border-gray-200"
//       >
//         {/* Header */}
//         <div className="text-center border-b pb-4">
//           <h2 className="text-2xl font-bold text-indigo-700">
//             MEDICAL PRESCRIPTION
//           </h2>
//           <p className="text-gray-500">
//             Date: {new Date(prescription.createdAt).toLocaleDateString()}
//           </p>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//           {/* Doctor Details */}
//           <div className="bg-blue-50 p-4 rounded-lg">
//             <div className="flex items-center gap-3 mb-3">
//               <FaUserMd className="text-blue-600 text-xl" />
//               <h2 className="text-xl font-semibold text-gray-700">
//                 Doctor Details
//               </h2>
//             </div>
//             <div className="space-y-2">
//               <p>
//                 <strong className="text-gray-600">Name:</strong>{" "}
//                 {prescription.doctorId.name}
//               </p>
//               <p>
//                 <strong className="text-gray-600">Email:</strong>{" "}
//                 {prescription.doctorId.email}
//               </p>
//               <p>
//                 <strong className="text-gray-600">Phone:</strong>{" "}
//                 {prescription.doctorId.phone}
//               </p>
//               <p>
//                 <strong className="text-gray-600">Specialization:</strong>{" "}
//                 {prescription.doctorId.specialization}
//               </p>
//             </div>
//           </div>

//           {/* Patient Details */}
//           <div className="bg-green-50 p-4 rounded-lg">
//             <div className="flex items-center gap-3 mb-3">
//               <FaUserInjured className="text-green-600 text-xl" />
//               <h2 className="text-xl font-semibold text-gray-700">
//                 Patient Details
//               </h2>
//             </div>
//             <div className="space-y-2">
//               <p>
//                 <strong className="text-gray-600">Name:</strong>{" "}
//                 {prescription.userId.name}
//               </p>
//               <p>
//                 <strong className="text-gray-600">Email:</strong>{" "}
//                 {prescription.userId.email}
//               </p>
//               <p>
//                 <strong className="text-gray-600">Gender:</strong>{" "}
//                 {prescription.userId.gender}
//               </p>
//               <p>
//                 <strong className="text-gray-600">Age:</strong>{" "}
//                 {prescription.userId.age}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Medical Information */}
//         <div className="bg-yellow-50 p-4 rounded-lg">
//           <h2 className="text-xl font-semibold text-gray-700 mb-3">
//             Medical Information
//           </h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <p>
//                 <strong className="text-gray-600">Symptoms:</strong>
//               </p>
//               <p className="whitespace-pre-wrap">{prescription.symptoms}</p>
//             </div>
//             <div>
//               <p>
//                 <strong className="text-gray-600">Diagnosis:</strong>
//               </p>
//               <p className="whitespace-pre-wrap">{prescription.disease}</p>
//             </div>
//             <div>
//               <p>
//                 <strong className="text-gray-600">Vital Signs:</strong>
//               </p>
//               <p className="whitespace-pre-wrap">{prescription.vitalSigns}</p>
//             </div>
//           </div>
//         </div>

//         {/* Medicines */}
//         <div className="bg-purple-50 p-4 rounded-lg">
//           <div className="flex items-center gap-3 mb-3">
//             <FaPills className="text-purple-600 text-xl" />
//             <h2 className="text-xl font-semibold text-gray-700">Medicines</h2>
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {prescription.medicines.map((med, index) => (
//               <div
//                 key={index}
//                 className="bg-white p-3 rounded-lg border border-purple-200 shadow-sm"
//               >
//                 <p className="font-medium text-purple-700">{med.name}</p>
//                 <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
//                   <p>
//                     <strong>Dosage:</strong> {med.dosage}
//                   </p>
//                   <p>
//                     <strong>Quantity:</strong> {med.quantity}
//                   </p>
//                   <p>
//                     <strong>Frequency:</strong> {med.time_gap}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Test Reports */}
//         {prescription.testReports?.length > 0 && (
//           <div className="bg-red-50 p-4 rounded-lg">
//             <div className="flex items-center gap-3 mb-3">
//               <FaFlask className="text-red-600 text-xl" />
//               <h2 className="text-xl font-semibold text-gray-700">
//                 Test Reports
//               </h2>
//             </div>
//             <div className="flex flex-wrap gap-4 justify-center">
//               {prescription.testReports.map((report, index) => (
//                 <div key={index} className="text-center">
//                   <img
//                     src={report.img}
//                     alt={`Test Report ${index + 1}`}
//                     className="w-48 h-48 object-contain rounded border bg-white p-2 shadow"
//                   />
//                   <p className="mt-2 text-sm text-gray-600">
//                     Report {index + 1}
//                   </p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PrescriptionView;
