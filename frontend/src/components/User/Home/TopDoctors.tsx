import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../axios/UserInstance";
import { IDoctor } from "../../../Types";

// // Define TypeScript interface for doctors
// interface Doctor {
//   _id: string;
//   name: string;
//   image: string;
//   specialization: string;
// }

const TopDoctors :React.FC = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<IDoctor[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await api.get<{ data: IDoctor[], message: string, success: boolean }>("/doctors");
        console.log("response:", response);

        if (response.data.success) {
          setDoctors(response.data.data);
        } else {
          console.error("Failed to fetch doctors:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    fetchDoctors();
  }, []);

  const handleAppointment = async (doctorId: string) => {
    console.log("Doctor ID:", doctorId);
    try {
      navigate(`/doctors/${doctorId}`)
    } catch (error) {
      setMessage("Doctor appointment failed");
    }
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen py-12">
      <div className="max-w-screen-xl mx-auto px-8 lg:px-16 text-center">
        {/* Title */}
        <h1 className="text-4xl font-extrabold text-gray-800">Top Doctors to Book</h1>
        <p className="text-gray-500 mt-3 text-lg">
          Simply browse through our extensive list of trusted doctors.
        </p>

        {/* Doctors Grid */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {Array.isArray(doctors) && doctors.length > 0 ? (
            doctors.slice(0, 10).map((item) => (
              <div
                onClick={() => handleAppointment(item._id)} // ✅ Corrected this line
                key={item._id}
                className="bg-white/70 backdrop-blur-lg border border-gray-200 p-5 rounded-2xl shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <img
                  src={item.profilePicture || "profile.png"}
                  alt={item.name}
                  className="w-full h-56 object-cover rounded-xl"
                />
                <div className="mt-4 text-left">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                    <p className="text-green-600 text-sm font-semibold">Available</p>
                  </div>
                  <p className="text-xl font-semibold text-gray-800 mt-1">{item.name}</p>
                  <p className="text-gray-500 text-sm">{item.specialization}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600 text-center">No doctors available at the moment.</p>
          )}
        </div>

        {/* More Button */}
        <button
          onClick={() => {
            navigate("/doctors");
            scrollTo(0, 0);
          }}
          className="mt-12 px-6 py-3 bg-blue-600 text-white rounded-full text-lg font-semibold shadow-md hover:bg-blue-700 transition-transform transform hover:scale-105"
        >
          Load More
        </button>
      </div>
    </div>
  );
};

export default TopDoctors;
