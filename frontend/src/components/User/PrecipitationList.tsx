import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../../slice/Store/Store";
import api from "../../axios/UserInstance";
import { IDoctor, IMedicine } from "../../Types";
import { IUser } from "../../types/auth";


interface IPrescription {
  _id: string;
  userId: IUser;
  doctorId: IDoctor;
  medicines: IMedicine[];
  symptoms: string;
  disease: string;
  createdAt: string;
  followUpDate?: string;
}

const PrescriptionList: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<IPrescription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const prescriptionPerPage = 3;

  const token = useSelector((state: RootState) => state.user.user?.accessToken);
  const userId = useSelector((state: RootState) => state.user.user?.id);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get("/prescriptions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Fetched prescriptions:", response.data);
        setPrescriptions(response.data);
      } catch (error) {
        console.error("Error fetching prescriptions:", error);
        setError("Failed to fetch prescriptions");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchPrescriptions();
  }, [token]);

  const handleDownload = async (prescriptionId: string) => {
    try {
      setError(null);
      const response = await api.get(`/prescriptions/${prescriptionId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      console.log("response.data", response.data);

      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
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

  // Pagination logic
  const indexOfLastPrescription = currentPage * prescriptionPerPage;
  const indexOfFirstPrescription = indexOfLastPrescription - prescriptionPerPage;
  const currentPrescription = prescriptions.slice(indexOfFirstPrescription, indexOfLastPrescription);
  const totalPages = Math.ceil(prescriptions.length / prescriptionPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-extrabold text-blue-400 mb-6 text-center">
        MY PRESCRIPTIONS
      </h2>
      {error && (
        <p className="text-center text-red-500 text-lg mb-4">{error}</p>
      )}
      {loading ? (
        <p className="text-center text-gray-500 text-lg">Loading...</p>
      ) : prescriptions.length > 0 ? (
        <>
          <div className="overflow-x-auto shadow-lg rounded-lg">
            <table className="w-full table-auto bg-white border border-gray-200">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Doctor
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Medicines
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Symptoms
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Disease
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentPrescription.map((prescription) => ( // Use currentPrescription instead of prescriptions
                  <tr
                    key={prescription._id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-4 py-3 text-gray-700">
                      {prescription.doctorId.name}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {prescription.medicines.map((med) => (
                        <>
                          <div
                            key={med.name}
                            className="mb-1 bg-gray-100 p-2 rounded-md text-sm"
                          >
                            {`Medicine Name: ${med.name}`}
                          </div>
                          <div className="mb-1 bg-gray-100 p-2 rounded-md text-sm">
                            {`Dosage: ${med.dosage}`}
                          </div>
                          <div className="mb-1 bg-gray-100 p-2 rounded-md text-sm">
                            {`Duration: ${med.time_gap} (${med.quantity} tabs)`}
                          </div>
                        </>
                      ))}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {prescription.symptoms}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {prescription.disease}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {new Date(prescription.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDownload(prescription._id)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200 text-sm font-medium"
                      >
                        Download PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center mt-6 space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <p className="text-center text-gray-500">No Prescription found.</p>
      )}
    </div>
  );
};

export default PrescriptionList;

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useSelector } from "react-redux";
// import { RootState } from "../../slice/Store/Store";
// import api from "../../axios/UserInstance";
// import { Doctor } from "../../Types";
// import { User } from "../../types/auth";

// interface Medicine {
//   name: string;
//   quantity: number;
//   time_gap: string;
//   dosage: string;
// }

// interface Prescription {
//   _id: string;
//   userId: User;
//   doctorId: Doctor;
//   medicines: Medicine[];
//   symptoms: string;
//   disease: string;
//   createdAt: string;
//   followUpDate?: string;
// }

// const PrescriptionList: React.FC = () => {
//   const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const prescriptionPerPage = 2;

//   const token = useSelector((state: RootState) => state.user.user?.accessToken);
//   const userId = useSelector((state: RootState) => state.user.user?.id);

//   useEffect(() => {
//     const fetchPrescriptions = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const response = await api.get("/prescriptions", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         console.log("Fetched prescriptions:", response.data);
//         setPrescriptions(response.data);
//       } catch (error) {
//         console.error("Error fetching prescriptions:", error);
//         setError("Failed to fetch prescriptions");
//       } finally {
//         setLoading(false);
//       }
//     };
//     if (token) fetchPrescriptions();
//   }, [token]);

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

//   // Pagination logic
//   const indexOfLastPrescription = currentPage * prescriptionPerPage;
//   const indexOfFirstPrescription =
//     indexOfLastPrescription - prescriptionPerPage;
//   const currentPrescription = prescriptions.slice(
//     indexOfFirstPrescription,
//     indexOfLastPrescription
//   );
//   const totalPages = Math.ceil(prescriptions.length / prescriptionPerPage);

//   const handlePageChange = (page: number) => {
//     if (page >= 1 && page <= totalPages) {
//       setCurrentPage(page);
//     }
//   };

//   return (
//     <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
//       <h2 className="text-3xl font-extrabold text-blue-400 mb-6 text-center">
//         MY PRESCRIPTIONS
//       </h2>
//       {error && (
//         <p className="text-center text-red-500 text-lg mb-4">{error}</p>
//       )}
//       {loading ? (
//         <p className="text-center text-gray-500 text-lg">Loading...</p>
//       ) : currentPrescription.length > 0 ? (
//         <>
//           <div className="overflow-x-auto shadow-lg rounded-lg">
//             <table className="w-full table-auto bg-white border border-gray-200">
//               <thead className="bg-indigo-600 text-white">
//                 <tr>
//                   <th className="px-4 py-3 text-left text-sm font-semibold">
//                     Doctor
//                   </th>
//                   <th className="px-4 py-3 text-left text-sm font-semibold">
//                     Medicines
//                   </th>
//                   <th className="px-4 py-3 text-left text-sm font-semibold">
//                     Symptoms
//                   </th>
//                   <th className="px-4 py-3 text-left text-sm font-semibold">
//                     Disease
//                   </th>
//                   <th className="px-4 py-3 text-left text-sm font-semibold">
//                     Date
//                   </th>
//                   <th className="px-4 py-3 text-left text-sm font-semibold">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {prescriptions.map((prescription) => (
//                   <tr
//                     key={prescription._id}
//                     className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200"
//                   >
//                     <td className="px-4 py-3 text-gray-700">
//                       {prescription.doctorId.name}
//                     </td>
//                     <td className="px-4 py-3 text-gray-700">
//                       {prescription.medicines.map((med) => (
//                         <>
//                           <div
//                             key={med.name}
//                             className="mb-1 bg-gray-100 p-2 rounded-md text-sm"
//                           >
//                             {`Medicile Name: ${med.name}`}
//                           </div>
//                           <div className="mb-1 bg-gray-100 p-2 rounded-md text-sm">
//                             {`Dosage : ${med.dosage}`}
//                           </div>
//                           <div className="mb-1 bg-gray-100 p-2 rounded-md text-sm">
//                             {`Duration : ${med.time_gap}(${med.quantity} tabs)`}
//                           </div>
//                         </>
//                       ))}
//                     </td>
//                     <td className="px-4 py-3 text-gray-700">
//                       {prescription.symptoms}
//                     </td>
//                     <td className="px-4 py-3 text-gray-700">
//                       {prescription.disease}
//                     </td>
//                     <td className="px-4 py-3 text-gray-700">
//                       {new Date(prescription.createdAt).toLocaleDateString()}
//                     </td>
//                     <td className="px-4 py-3">
//                       <button
//                         onClick={() => handleDownload(prescription._id)}
//                         className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200 text-sm font-medium"
//                       >
//                         Download PDF
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//           <div className="flex justify-center mt-6 space-x-2">
//             <button
//               onClick={() => handlePageChange(currentPage - 1)}
//               disabled={currentPage === 1}
//               className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
//             >
//               Prev
//             </button>

//             {Array.from({ length: totalPages }, (_, i) => (
//               <button
//                 key={i}
//                 onClick={() => handlePageChange(i + 1)}
//                 className={`px-3 py-1 rounded ${
//                   currentPage === i + 1
//                     ? "bg-blue-500 text-white"
//                     : "bg-gray-100 hover:bg-gray-200"
//                 }`}
//               >
//                 {i + 1}
//               </button>
//             ))}

//             <button
//               onClick={() => handlePageChange(currentPage + 1)}
//               disabled={currentPage === totalPages}
//               className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
//             >
//               Next
//             </button>
//           </div>
//         </>
//         ): (
//           <p className="text-center text-gray-500">No Prescription found.</p>
//         )}
//     </div>
//   );
// };

// export default PrescriptionList;


