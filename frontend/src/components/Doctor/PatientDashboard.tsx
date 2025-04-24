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
import { Appointment } from "../../Types";
import { User } from "../../types/auth";

const PatientDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [patients, setPatients] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const { doctorId } = useParams<{ doctorId: string }>();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await doctorApi.get(`/${doctorId}/patients`);
        console.log("API response:", response.data.data.patients);
        setPatients(response.data.data.patients);
      } catch (error) {
        console.error("Failed to fetch patients", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [doctorId]);

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

      <div className="flex gap-4 items-center">
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
      </div>

      <div className="bg-white rounded-xl shadow">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3">Patient</th>
              <th className="p-3">Created At</th>
              <th className="p-3">Gender</th>
              <th className="p-3">Phone Number</th>
              <th className="p-3">Age</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((booking) => {
              const user = booking.user_id as User;
              const createdAt = (booking as any)?.createdAt || "";
              const age = (user as any)?.age || "N/A";
              const mobile_no = (user as any)?.mobile_no || "N/A";

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
                    {format(new Date(createdAt), "dd/MM/yyyy")}
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
    </div>
  );
};

export default PatientDashboard;
