import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../CommonComponents/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../CommonComponents/dropdownmenu";
import doctorApi from "../../axios/DoctorInstance";
import { useNavigate, useParams } from "react-router-dom";
import { IAppointment } from "../../Types";
import { IUser } from "../../types/auth";
import Pagination from "../../Pagination/Pagination";
import { MoreHorizontal } from "lucide-react";

const PatientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { doctorId } = useParams<{ doctorId: string }>();

  const [patients, setPatients] = useState<IAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [gender, setGender] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [date, setDate] = useState(new Date());

  const [page, setPage] = useState(1);
  const limit = 5;
  const [totalPages, setTotalPages] = useState(1);
  const [totalPatients, setTotalPatients] = useState(0);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await doctorApi.get(`/${doctorId}/patients`, {
          params: {
            search: searchTerm,
            gender,
            sort: sortBy,
            date: date.toISOString().split("T")[0],
            page,
            limit
          },
        });
        console.log("API response:", response.data.data);

        const { patients, total } = response.data.data;

        setPatients(patients);
        setTotalPatients(total);
        setTotalPages(Math.ceil(total / limit));

      } catch (error) {
        console.error("Failed to fetch patients", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [doctorId, searchTerm, gender, sortBy, date, page, limit]);

  console.log('totalPatients:',totalPatients)

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // const formatDate = (dateString: string) => {
  //   try {
  //     const date = new Date(dateString);
  //     if (isNaN(date.getTime())) return "Invalid Date";
  //     return date.toLocaleDateString("en-US", {
  //       year: "numeric",
  //       month: "long",
  //       day: "numeric",
  //     });
  //   } catch (error) {
  //     console.error("Error formatting date:", error);
  //     return "Invalid Date";
  //   }
  // };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6 space-y-6">

      <div className="grid grid-cols-3 gap-6">
        {/* Today's Patients */}
        <Card className="border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-500 text-sm">Today's Patients</div>
                <div className="text-2xl font-semibold">10</div>
              </div>
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-sm text-green-500 mt-2 flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
              2 more than yesterday
            </div>
          </CardContent>
        </Card>

        {/* Monthly Patients */}
        <Card className="border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-500 text-sm">Monthly Patients</div>
                <div className="text-2xl font-semibold">230</div>
              </div>
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-sm text-green-500 mt-2 flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
              15% increase from last month
            </div>
          </CardContent>
        </Card>

        {/* Yearly Patients */}
        <Card className="border-l-4 border-green-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-500 text-sm">Yearly Patients</div>
                <div className="text-2xl font-semibold">1,500</div>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-sm text-green-500 mt-2 flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
              20% increase from last year
            </div>
          </CardContent>
        </Card>
      </div>
      {/* <div className="grid grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-gray-500 text-sm">Today Patients</div>
            <div className="text-2xl font-semibold">10</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-gray-500 text-sm">Monthly Patients</div>
            <div className="text-2xl font-semibold">230</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-gray-500 text-sm">Yearly Patients</div>
            <div className="text-2xl font-semibold">1500</div>
          </CardContent>
        </Card>
      </div> */}

      {/* <div className="flex gap-4 items-center flex-wrap">
        <TextInput
          placeholder="Search Patients"
          className="w-1/3 min-w-[200px]"
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchTerm(e.target.value)
          }
        />

        <select
          className="border rounded px-3 py-2 text-sm"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="">Sort by...</option>
          <option value="date">Date</option>
          <option value="name">Name</option>
        </select>

        <select
          className="border rounded px-3 py-2 text-sm"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
        >
          <option value="">Gender...</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <div className="flex items-center gap-2 border rounded px-3 py-2">
          <CalendarIcon className="h-4 w-4" />
          <span className="text-sm">{format(date, "MM/dd/yyyy")}</span>
        </div>
      </div> */}

      <div className="bg-white rounded-xl shadow">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3">Patient</th>
              <th className="p-3">Appointment Time and Date</th>
              <th className="p-3">Gender</th>
              <th className="p-3">Phone Number</th>
              <th className="p-3">Age</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((booking) => {
              const user = booking.user_id as IUser;
              const age = (user as any)?.age || "N/A";
              const mobile_no = (user as any)?.mobile_no || "N/A";
              const appointmentDate = new Date(booking.appointmentDate)
                .toISOString()
                .split("T")[0];

              return (
                <tr key={booking._id} className="border-t">
                  <td className="p-3 flex items-center gap-3">
                    <img
                      src={user?.profilePicture ?? ""}
                      className="w-10 h-10 rounded-full object-cover"
                      alt={user?.name ?? "Patient"}
                    />
                    <div>
                      <div className="font-medium text-gray-900">
                        {user?.name}
                      </div>
                      <div className="text-gray-500 text-xs">{user?.email}</div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div>
                      <div className="text-sm font-light">
                        Date : {appointmentDate}
                      </div>
                      <div className="text-sm font-light">
                        Time : {booking.appointmentTime}
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user?.gender === "Male"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {user?.gender}
                    </span>
                  </td>
                  <td className="p-3">{mobile_no}</td>
                  <td className="p-3">{age}</td>
                  <td className="p-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <MoreHorizontal className="w-5 h-5 cursor-pointer" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() =>
                            navigate(`/doctor/patient-records/${user._id}`, {
                              state: {
                                patient: user,
                                appointment: booking,
                              },
                            })
                          }
                        >
                          Patient Records
                        </DropdownMenuItem>
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default PatientDashboard;
