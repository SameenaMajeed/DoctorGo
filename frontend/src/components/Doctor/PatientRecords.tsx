import React, { useState, useEffect } from "react";
import { RecordCard } from "../CommonComponents/card";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "../CommonComponents/Button";
import { Card, CardContent } from "../CommonComponents/card";
import { Eye, Trash2 } from "lucide-react";
import { User } from "../../types/auth";
import { Appointment } from "../../Types";
import doctorApi from "../../axios/DoctorInstance";

interface MedicalRecord {
  date: string;
  complaint: string;
  diagnosis: string;
  treatment: string;
  prescription: string;
  cost: string;
  _id?: string;
}

interface LocationState {
  patient?: User;
  appointment?: Appointment;
}

const MedicalRecord: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const location = useLocation();

  // State management
  const [patient, setPatient] = useState<User | null>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch patient data and records
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check for state first
        const state = location.state as LocationState | undefined;
        
        if (state?.patient) {
          setPatient(state.patient);
          setAppointment(state.appointment || null);
        } else if (userId) {
          // Fallback to API if no state
          const [patientRes, recordsRes] = await Promise.all([
            doctorApi.get(`/patient-records/${userId}`),
            doctorApi.get(`/records/${userId}`)
          ]);
          setPatient(patientRes.data);
          setRecords(recordsRes.data || []);
        } else {
          throw new Error("No patient identifier available");
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load medical records");
        navigate(`patient-records/${userId}`); // Redirect to patients list
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location.state, userId, navigate]);

  const handleDeleteRecord = async (recordId: string) => {
    try {
      await doctorApi.delete(`/records/${recordId}`);
      setRecords(records.filter(record => record._id !== recordId));
    } catch (err) {
      console.error("Failed to delete record:", err);
      setError("Failed to delete record");
    }
  };

  if (loading) {
    return <div className="flex min-h-screen bg-gray-50 p-6">Loading...</div>;
  }

  if (error) {
    return <div className="flex min-h-screen bg-gray-50 p-6 text-red-500">{error}</div>;
  }

  if (!patient) {
    return <div className="flex min-h-screen bg-gray-50 p-6">Patient not found</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-1/4 bg-white shadow-md p-4">
        <button 
          className="mb-4"
          onClick={() => navigate(-1)}
        >
          <div className="border p-2 rounded-md">←</div>
        </button>
        
        <div className="text-center">
          <img
            src={patient.profilePicture || "/profile-placeholder.png"}
            alt={patient.name}
            className="w-24 h-24 rounded-full mx-auto mb-2"
          />
          <h2 className="text-lg font-semibold">{patient.name}</h2>
          <p className="text-sm text-gray-500">{patient.email}</p>
          <p className="text-sm text-gray-500">{patient.mobile_no || "N/A"}</p>
        </div>
        
        <div className="mt-6">
          <Button variant="outline" className="w-full mb-2">
            Medical Records
          </Button>
          <Button variant="outline" className="w-full">
            Appointments
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-3/4 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Medical Record</h3>
          <Button
            onClick={() =>
              navigate(`/doctor/newRecords`, {
                state: {
                  patient,
                  appointment,
                },
              })
            }
          >
            New Record +
          </Button>
        </div>

        {records.length > 0 ? (
          records.map((record, index) => (
            <Card key={record._id || index} className="mb-4">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{record.date}</p>
                    <p><strong>Complaint:</strong> {record.complaint}</p>
                    <p><strong>Diagnosis:</strong> {record.diagnosis}</p>
                    <p><strong>Treatment:</strong> {record.treatment}</p>
                    <p><strong>Prescription:</strong> {record.prescription}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-600 font-semibold">
                      (Tsh) {record.cost}
                    </p>
                    <div className="flex space-x-2 justify-end mt-2">
                      <Button variant="ghost">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost"
                        onClick={() => record._id && handleDeleteRecord(record._id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-4 text-center text-gray-500">
              No medical records found
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MedicalRecord;

// import React from "react";
// import { RecordCard } from "../CommonComponents/card";
// import { useLocation, useNavigate, useParams } from "react-router-dom";
// import { Button } from "../CommonComponents/Button";
// import { Card, CardContent } from "../CommonComponents/card";
// import { Eye, Trash2 } from "lucide-react";
// import { User } from "../../types/auth";
// import { Appointment } from "../../Types";

// const records = [
//   {
//     date: "13, Jan 2021",
//     complaint: "Bleeding Gums, Toothache, bad breath",
//     diagnosis: "Gingivitis, Caries, Periodontitis",
//     treatment: "Filling, Post&Core, Implant, Extraction",
//     prescription: "Paracetamol, Amoxicillin, Ibuprofen, Aspirin",
//     cost: "150000",
//   },
//   {
//     date: "10, Feb 2022",
//     complaint: "Food impaction, Replacing Missing Teeth",
//     diagnosis: "Caries, Periodontitis, Malocclusion",
//     treatment: "Superficial Scaling, Root Planing, Extraction",
//     prescription: "Benzocaine, Lidocaine, Mepivacaine, Prilocaine",
//     cost: "300000",
//   },
//   {
//     date: "20, Mar 2022",
//     complaint: "Broken Teeth, Bridge, Cap in the front tooth",
//     diagnosis: "Unspecified Gingival Recession, Gingivitis",
//     treatment: "Consultation, Scaling, Root Planing, Extraction",
//     prescription: "Gingival Gel, Chlorhexidine, Fluoride, Calcium",
//     cost: "500000",
//   },
// ];

// const MedicalRecord: React.FC = () => {
//   const navigate = useNavigate();

//   const { userId } = useParams<{ userId: string }>();
//   console.log("Extracted User ID:", userId);

//   const location = useLocation();
//   const { patient, appointment } = location.state as {
//     patient: User;
//     appointment: Appointment;
//   };

//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       <div className="w-1/4 bg-white shadow-md p-4">
//         <button className="mb-4">
//           <div className="border p-2 rounded-md">←</div>
//         </button>
//         <div className="text-center">
//           <img
//             src={patient.profilePicture || "/profile-placeholder.png"}
//             alt="Amani Mmasy"
//             className="w-24 h-24 rounded-full mx-auto mb-2"
//           />
//           <h2 className="text-lg font-semibold">{patient.name}</h2>
//           <p className="text-sm text-gray-500">{patient.email}</p>
//           <p className="text-sm text-gray-500">{patient.mobile_no}</p>
//         </div>
//         <div className="mt-6">
//           <Button variant="outline" className="w-full mb-2">
//             Medical Records
//           </Button>
//           <Button variant="outline" className="w-full">
//             Appointments
//           </Button>
//         </div>
//       </div>

//       <div className="w-3/4 p-6">
//         <div className="flex justify-between items-center mb-6">
//           <h3 className="text-lg font-semibold">Medical Record</h3>
//           <Button
//             onClick={() =>
//               navigate(`/doctor/newRecords`, {
//                 state: {
//                   patient,
//                   appointment,
//                 },
//               })
//             }
//           >
//             New Record +
//           </Button>
//         </div>

//         {records.map((record, index) => (
//           <Card key={index} className="mb-4">
//             <CardContent className="p-4">
//               <div className="flex justify-between items-start">
//                 <div>
//                   <p className="text-sm text-gray-500 mb-1">{record.date}</p>
//                   <p>
//                     <strong>Complaint:</strong> {record.complaint}
//                   </p>
//                   <p>
//                     <strong>Diagnosis:</strong> {record.diagnosis}
//                   </p>
//                   <p>
//                     <strong>Treatment:</strong> {record.treatment}
//                   </p>
//                   <p>
//                     <strong>Prescription:</strong> {record.prescription}
//                   </p>
//                 </div>
//                 <div className="text-right">
//                   <p className="text-green-600 font-semibold">
//                     (Tsh) {record.cost}
//                   </p>
//                   <div className="flex space-x-2 justify-end mt-2">
//                     <Button variant="ghost">
//                       <Eye className="w-4 h-4" />
//                     </Button>
//                     <Button variant="ghost">
//                       <Trash2 className="w-4 h-4 text-red-500" />
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default MedicalRecord;
