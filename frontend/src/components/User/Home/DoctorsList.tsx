import React, { useEffect, useState } from "react";
import { IDoctor } from "../../../Types";
import Navbar from "./Navbar";
import Footer from "./Footer";
import api from "../../../axios/UserInstance";
import { useNavigate } from "react-router-dom";

const DoctorsList: React.FC = () => {
  const [doctors, setDoctors] = useState<IDoctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<IDoctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Filter states
  const [specializationFilter, setSpecializationFilter] = useState<string>("");
  const [availabilityFilter, setAvailabilityFilter] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get<{ data: IDoctor[]; message: string; success: boolean }>("/doctors");
        
        if (response.data.success) {
          setDoctors(response.data.data);
          setFilteredDoctors(response.data.data);
        } else {
          setError(response.data.message);
        }
      } catch (error) {
        setError("Failed to fetch doctors. Please try again later.");
        console.error("Error fetching doctors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Apply filters whenever filter states change
//   useEffect(() => {
//     let result = [...doctors];
//     console.log('result:',result)
    
//     if (specializationFilter) {
//       result = result.filter(doctor => 
//         doctor.specialization.toLowerCase().includes(specializationFilter.toLowerCase())
//       );
//     }
    
//     // if (availabilityFilter) {
//     //   result = result.filter(doctor => doctor.isAvailable);
//     // }
    
//     if (searchQuery) {
//       result = result.filter(doctor =>
//         doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         doctor.qualification.toLowerCase().includes(searchQuery.toLowerCase())
//       );
//     }
    
//     setFilteredDoctors(result);
//   }, [doctors, specializationFilter, availabilityFilter, searchQuery]);

  const handleAppointment = async (doctorId: string) => {
    console.log("Doctor ID:", doctorId);
    try {
      navigate(`/doctors/${doctorId}`)
    } catch (error) {
      setError("Doctor appointment failed");
    }
  };

  // Get unique specializations for filter options
  const specializations = [...new Set(doctors.map(doctor => doctor.specialization))];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-md p-4">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Filters</h2>
          
          {/* Search Input */}
          <div className="mb-6">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search doctors..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Specialization Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specialization
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
            >
              <option value="">All Specializations</option>
              {specializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>
          
          {/* Availability Filter */}
          <div className="mb-6">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded text-blue-600"
                checked={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.checked)}
              />
              <span className="text-sm font-medium text-gray-700">
                Available Now
              </span>
            </label>
          </div>
          
          {/* Reset Filters */}
          <button
            onClick={() => {
              setSpecializationFilter("");
              setAvailabilityFilter(false);
              setSearchQuery("");
            }}
            className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
          >
            Reset Filters
          </button>
        </div>
        
        {/* Main Content */}
        <main className="flex-1 container mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold text-gray-800 text-center mb-12">
            Meet Our Expert Doctors
          </h1>

          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-sm animate-pulse"
                >
                  <div className="h-56 bg-gray-200 rounded-xl mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-24 mx-auto mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-500 text-lg">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && filteredDoctors.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600 text-lg">No doctors found matching your criteria.</p>
              <button
                onClick={() => {
                  setSpecializationFilter("");
                  setAvailabilityFilter(false);
                  setSearchQuery("");
                }}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}

          {!loading && !error && filteredDoctors.length > 0 && (
            <>
              <div className="mb-4 text-gray-600">
                Showing {filteredDoctors.length} of {doctors.length} doctors
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredDoctors.map((doctor) => (
                  <div
                    onClick={() => handleAppointment(doctor._id)}
                    key={doctor._id}
                    className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    <div className="relative mb-4">
                      <img
                        src={doctor.profilePicture || "profile.png"}
                        alt={doctor.name}
                        className="w-full h-56 object-cover rounded-xl"
                        loading="lazy"
                      />
                      {/* {doctor.isAvailable && (
                        <span className="absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Available
                        </span>
                      )} */}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-1">
                      {doctor.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-1">
                      {doctor.specialization}
                    </p>
                    <p className="text-gray-500 text-sm">{doctor.qualification}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default DoctorsList;