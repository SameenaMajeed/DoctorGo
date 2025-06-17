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
} from "react-icons/fa";
import { useSelector } from "react-redux";
import { RootState } from "../../slice/Store/Store";

const PrescriptionView: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const [prescription, setPrescription] = useState<IPrescription | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
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
      setError(null);
      const response = await api.get(
        `/prescriptions/${prescriptionId}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      console.log("response.data", response.data);

      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `prescription_${prescriptionId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Download failed:", error);
      setError("Failed to download PDF");
    }
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if(error) return <p className="text-center text-red-500 text-lg mb-4">{error}</p>

  if (!prescription) {
    return (
      <div className="p-4 text-center text-gray-600">
        Prescription not found.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-indigo-800">
          Prescription Details
        </h1>
        <button
          onClick={() => handleDownload(prescription._id)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200 text-sm font-medium"
        >
          <FaDownload /> Download PDF
        </button>
      </div>

      <div
        ref={prescriptionRef}
        className="bg-white rounded-xl shadow-lg p-8 space-y-8 border border-gray-200"
      >
        {/* Header */}
        <div className="text-center border-b pb-4">
          <h2 className="text-2xl font-bold text-indigo-700">
            MEDICAL PRESCRIPTION
          </h2>
          <p className="text-gray-500">Prescription ID: {appointmentId}</p>
          <p className="text-gray-500">
            Date: {new Date(prescription.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Doctor Details */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <FaUserMd className="text-blue-600 text-xl" />
              <h2 className="text-xl font-semibold text-gray-700">
                Doctor Details
              </h2>
            </div>
            <div className="space-y-2">
              <p>
                <strong className="text-gray-600">Name:</strong>{" "}
                {prescription.doctorId.name}
              </p>
              <p>
                <strong className="text-gray-600">Email:</strong>{" "}
                {prescription.doctorId.email}
              </p>
              <p>
                <strong className="text-gray-600">Phone:</strong>{" "}
                {prescription.doctorId.phone}
              </p>
              <p>
                <strong className="text-gray-600">Specialization:</strong>{" "}
                {prescription.doctorId.specialization}
              </p>
            </div>
          </div>

          {/* Patient Details */}
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <FaUserInjured className="text-green-600 text-xl" />
              <h2 className="text-xl font-semibold text-gray-700">
                Patient Details
              </h2>
            </div>
            <div className="space-y-2">
              <p>
                <strong className="text-gray-600">Name:</strong>{" "}
                {prescription.userId.name}
              </p>
              <p>
                <strong className="text-gray-600">Email:</strong>{" "}
                {prescription.userId.email}
              </p>
              <p>
                <strong className="text-gray-600">Gender:</strong>{" "}
                {prescription.userId.gender}
              </p>
              <p>
                <strong className="text-gray-600">Age:</strong>{" "}
                {prescription.userId.age}
              </p>
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            Medical Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p>
                <strong className="text-gray-600">Symptoms:</strong>
              </p>
              <p className="whitespace-pre-wrap">{prescription.symptoms}</p>
            </div>
            <div>
              <p>
                <strong className="text-gray-600">Diagnosis:</strong>
              </p>
              <p className="whitespace-pre-wrap">{prescription.disease}</p>
            </div>
            <div>
              <p>
                <strong className="text-gray-600">Vital Signs:</strong>
              </p>
              <p className="whitespace-pre-wrap">{prescription.vitalSigns}</p>
            </div>
          </div>
        </div>

        {/* Medicines */}
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <FaPills className="text-purple-600 text-xl" />
            <h2 className="text-xl font-semibold text-gray-700">Medicines</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prescription.medicines.map((med, index) => (
              <div
                key={index}
                className="bg-white p-3 rounded-lg border border-purple-200 shadow-sm"
              >
                <p className="font-medium text-purple-700">{med.name}</p>
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                  <p>
                    <strong>Dosage:</strong> {med.dosage}
                  </p>
                  <p>
                    <strong>Quantity:</strong> {med.quantity}
                  </p>
                  <p>
                    <strong>Frequency:</strong> {med.time_gap}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Test Reports */}
        {prescription.testReports?.length > 0 && (
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <FaFlask className="text-red-600 text-xl" />
              <h2 className="text-xl font-semibold text-gray-700">
                Test Reports
              </h2>
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              {prescription.testReports.map((report, index) => (
                <div key={index} className="text-center">
                  <img
                    src={report.img}
                    alt={`Test Report ${index + 1}`}
                    className="w-48 h-48 object-contain rounded border bg-white p-2 shadow"
                  />
                  <p className="mt-2 text-sm text-gray-600">
                    Report {index + 1}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrescriptionView;

// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { IPrescription } from "../../Types";
// import toast from "react-hot-toast";
// import api from "../../axios/UserInstance";

// const PrescriptionView: React.FC = () => {
//   const { appointmentId } = useParams<{ appointmentId: string }>();
//   const [prescription, setPrescription] = useState<IPrescription | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);

//   useEffect(() => {
//     const fetchPrescription = async () => {
//       try {
//         const res = await api.get(`/prescription/${appointmentId}`);
//         setPrescription(res.data.data.prescription);
//       } catch (error: any) {
//         toast.error(error.response?.data?.message || "Failed to load prescription");
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (appointmentId) {
//       fetchPrescription();
//     }
//   }, [appointmentId]);

//   if (loading) return <div className="p-4 text-center">Loading...</div>;

//   if (!prescription) {
//     return <div className="p-4 text-center text-gray-600">Prescription not found.</div>;
//   }

//   return (
//     <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg space-y-6">
//       <h1 className="text-3xl font-bold text-indigo-700">Prescription Details</h1>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div>
//           <h2 className="text-xl font-semibold text-gray-700 mb-2">Doctor Details</h2>
//           <p><strong>Name:</strong> {prescription.doctorId.name}</p>
//           <p><strong>Email:</strong> {prescription.doctorId.email}</p>
//           <p><strong>Phone:</strong> {prescription.doctorId.phone}</p>
//           <p><strong>Specialization:</strong> {prescription.doctorId.specialization}</p>
//         </div>

//         <div>
//           <h2 className="text-xl font-semibold text-gray-700 mb-2">Patient Details</h2>
//           <p><strong>Name:</strong> {prescription.userId.name}</p>
//           <p><strong>Email:</strong> {prescription.userId.email}</p>
//           <p><strong>Gender:</strong> {prescription.userId.gender}</p>
//           <p><strong>Age:</strong> {prescription.userId.age}</p>
//         </div>
//       </div>

//       <div className="border-t pt-4">
//         <h2 className="text-xl font-semibold text-gray-700 mb-2">Medical Information</h2>
//         <p><strong>Symptoms:</strong> {prescription.symptoms}</p>
//         <p><strong>Disease:</strong> {prescription.disease}</p>
//         <p><strong>Vital Signs:</strong> {prescription.vitalSigns}</p>
//       </div>

//       <div className="border-t pt-4">
//         <h2 className="text-xl font-semibold text-gray-700 mb-2">Medicines</h2>
//         <ul className="space-y-2">
//           {prescription.medicines.map((med, index) => (
//             <li key={index} className="bg-indigo-50 rounded p-3 border border-indigo-200">
//               <p><strong>Name:</strong> {med.name}</p>
//               <p><strong>Dosage:</strong> {med.dosage}</p>
//               <p><strong>Quantity:</strong> {med.quantity}</p>
//               <p><strong>Time Gap:</strong> {med.time_gap}</p>
//             </li>
//           ))}
//         </ul>
//       </div>

//       {prescription.testReports?.length > 0 && (
//         <div className="border-t pt-4">
//           <h2 className="text-xl font-semibold text-gray-700 mb-2">Test Reports</h2>
//           <div className="flex flex-wrap gap-4">
//             {prescription.testReports.map((report, index) => (
//               <img
//                 key={index}
//                 src={report.img}
//                 alt={`Test Report ${index + 1}`}
//                 className="w-32 h-32 object-cover rounded border"
//               />
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PrescriptionView;
