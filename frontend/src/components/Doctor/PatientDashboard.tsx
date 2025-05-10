import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../CommonComponents/card";
import { Button } from "../CommonComponents/Button";
import TextInput from "../CommonComponents/TextInput";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../CommonComponents/dropdownmenu";
import { CalendarIcon, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import doctorApi from "../../axios/DoctorInstance";
import { useNavigate, useParams } from "react-router-dom";
import { IAppointment } from "../../Types";
import { IUser } from "../../types/auth";
import Pagination from "../../Pagination/Pagination";

const PatientDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [patients, setPatients] = useState<IAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [gender, setGender] = useState("");
  const [sortBy, setSortBy] = useState("");

  const date = new Date();

   // Pagination state
   const [currentPage, setCurrentPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1);
  //  const [totalPatients, setTotalPatients] = useState(0);
   const patientsPerPage = 10;

  const { doctorId } = useParams<{ doctorId: string }>();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await doctorApi.get(`/${doctorId}/patients`, {
          params: {
            page: currentPage,
            limit: patientsPerPage,
            search: searchTerm,
            gender,
            sort: sortBy,
            date: date.toISOString().split('T')[0] // Format as YYYY-MM-DD
          }
        })
        console.log("API response:", response.data.data.patients);
        setPatients(response.data.data.patients);
        // setTotalPatients(response.data.data.total || response.data.data.patients.length);
        setTotalPages(Math.ceil(response.data.data.total / patientsPerPage));
      } catch (error) {
        console.error("Failed to fetch patients", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [doctorId , currentPage, searchTerm, gender, sortBy, date]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, gender, sortBy, date]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  // const handleFilter = patients.filter((patient)=>{
  //   const appointmentDate = formatDate(patient.appointmentDate); 
  //   const name = formatDate(patient.); 
  //   const appointmentDate = formatDate(patient.appointmentDate); 
  //   const appointmentDate = formatDate(patient.appointmentDate); 
  // })

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-3 gap-6">
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
      </div>

      <div className="flex gap-4 items-center flex-wrap">
      <TextInput
        placeholder="Search Patients"
        className="w-1/3 min-w-[200px]"
        value={searchTerm}
        onChange={(e : any) => setSearchTerm(e.target.value)}
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

      {/* <Button className="ml-auto" onClick={handleFilter}>
        Filter
      </Button> */}
    </div>

      {/* <div className="flex gap-4 items-center">
        <TextInput placeholder="Search Patients" className="w-1/3" />
        <select className="border rounded px-3 py-2">
          <option>Sort by...</option>
        </select>
        <select className="border rounded px-3 py-2">
          <option>Gender...</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <div className="flex items-center gap-2 border rounded px-3 py-2">
          <CalendarIcon className="h-4 w-4" />
          <span>{format(new Date(), "MM/dd/yyyy")}</span>
        </div>
        <Button className="ml-auto">Filter</Button>
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
              const createdAt = (booking as any)?.createdAt || "";
              const age = (user as any)?.age || "N/A";
              const mobile_no = (user as any)?.mobile_no || "N/A";
              const appoDate = booking.appointmentDate;
              const appointmentDate = new Date(appoDate)
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
        {/* Pagination component */}
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default PatientDashboard;
