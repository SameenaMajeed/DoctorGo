import React, { useState, useEffect } from "react";
import { RecordCard } from "../CommonComponents/card";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "../CommonComponents/Button";
import { Card, CardContent } from "../CommonComponents/card";
import { Eye, Trash2 } from "lucide-react";
import { IUser } from "../../types/auth";
import { IAppointment, IPrescription } from "../../Types";
import doctorApi from "../../axios/DoctorInstance";
import Pagination from "../../Pagination/Pagination";
import { useSelector } from "react-redux";
import { RootState } from "../../slice/Store/Store";

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

const MedicalRecord: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const doctorId = useSelector((state: RootState) => state.doctor.doctor?._id);

  console.log(userId, doctorId);

  const location = useLocation();

  // State management
  const [patient, setPatient] = useState<IUser | null>(null);
  const [appointment, setAppointment] = useState<IAppointment | null>(null);
  const [records, setRecords] = useState<IMedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 4; 
  const [total, setTotal] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch patient data and prescriptions
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const state = location.state as ILocationState | undefined;
        let patientData = state?.patient;

        if (!patientData && userId) {
          // Fetch patient data if not in state
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

        console.log(response.data);


        const { prescriptions, total } = response.data.data;

        // Map prescriptions to MedicalRecord format
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
            cost: "N/A", // Backend doesn't provide cost; adjust if available
          })
        );

        if (response.data.data) {
          setTotal(Math.ceil(response.data.data.total / limit));
        }

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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page on search
  };

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

  if (loading) {
    return <div className="flex min-h-screen bg-gray-50 p-6">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50 p-6 text-red-500">
        {error}
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex min-h-screen bg-gray-50 p-6">Patient not found</div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-1/4">
        <Card className="items-center text-center p-6 shadow-md border border-gray-200">
          <img
            src={patient.profilePicture || "/profile-placeholder.png"}
            alt="Profile"
            width={120}
            height={120}
            className="rounded-full mx-auto shadow-sm"
          />
          <p className="mt-4 text-lg font-semibold">{patient.name}</p>
          <p className="text-sm text-gray-600">{patient.email}</p>
          <p className="text-sm text-gray-600">{patient.mobile_no}</p>
          <span className="inline-block bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm mt-3">
            Age : {patient.age}
          </span>
          <div>
            <Button
              variant="outline"
              className="w-full mt-4 bg-white hover:bg-gray-100 text-blue-600 border-blue-600 hover:border-blue-700 transition duration-200"
              onClick={() =>
                navigate(`/doctor/${doctorId}/patients`)
              }
            >
              Back
            </Button>
          </div>
        </Card>
      </div>
      {/* Main Content */}
      <div className="w-3/4 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Medical Record</h3>
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="Search prescriptions..."
              value={searchTerm}
              onChange={handleSearch}
              className="border rounded-md p-2"
            />
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
        </div>

        {records.length > 0 ? (
          records.map((record) => (
            <Card key={record._id} className="mb-4">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{record.date}</p>
                    <p>
                      <strong>Complaint:</strong> {record.complaint}
                    </p>
                    <p>
                      <strong>Diagnosis:</strong> {record.diagnosis}
                    </p>
                    <p>
                      <strong>Treatment:</strong> {record.treatment}
                    </p>
                    <p>
                      <strong>Prescription:</strong> {record.prescription}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex space-x-2 justify-end mt-2">
                      <Button variant="ghost">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() =>
                          record._id && handleDeleteRecord(record._id)
                        }
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
        {total > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination
              currentPage={page}
              totalPages={total}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalRecord;

