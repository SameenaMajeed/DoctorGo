
import React from "react";
import { UserCheck } from "lucide-react";
import { IPatient } from "../../../Types";


interface Props {
  topPatients: IPatient[];
  isDarkMode: boolean;
}

const TopPatientsCard: React.FC<Props> = ({ topPatients, isDarkMode }) => {
  return (
    <div className={`rounded-xl shadow-md p-4 ${isDarkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"}`}>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <UserCheck className="w-5 h-5" /> Top Patients
      </h3>
      <ul className="space-y-3">
        {topPatients.length > 0 ? (
          topPatients.map((patient) => (
            <li key={patient._id} className="flex justify-between items-center">
              <span className="truncate max-w-[60%]">{patient.name}</span>
              <span className={`text-sm font-medium ${isDarkMode ? "text-blue-300" : "text-blue-700"}`}>{patient.totalBookings} bookings</span>
            </li>
          ))
        ) : (
          <li className="text-gray-500 text-sm">No top patients data</li>
        )}
      </ul>
    </div>
  );
};

export default TopPatientsCard;
