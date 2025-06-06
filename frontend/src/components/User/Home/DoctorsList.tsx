import React, { useEffect, useState, useMemo } from "react";
import { IDoctor } from "../../../Types";
import Navbar from "./Navbar";
import Footer from "./Footer";
import api from "../../../axios/UserInstance";
import { useNavigate } from "react-router-dom";
import {
  StarIcon,
  CalendarIcon,
  ClockIcon,
  CurrencyRupeeIcon,
} from "@heroicons/react/24/outline";

const DoctorsList: React.FC = () => {
  const [doctors, setDoctors] = useState<IDoctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Filter states
  const [specializationFilter, setSpecializationFilter] = useState<string>("");
  const [availabilityFilter, setAvailabilityFilter] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("recommended");
  const [currentPage, setCurrentPage] = useState(1);
  const doctorsPerPage = 8;

  // Fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get<{
          data: IDoctor[];
          message: string;
          success: boolean;
        }>("/doctors");

        console.log(response.data)

        if (response.data.success) {
          setDoctors(response.data.data);
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

  // Filter and sort doctors
  const filteredDoctors = useMemo(() => {
    let result = [...doctors];

    if (specializationFilter) {
      result = result.filter(
        (doctor) =>
          doctor.specialization &&
          doctor.specialization.toLowerCase() ===
            specializationFilter.toLowerCase()
      );
    }

    if (availabilityFilter) {
      result = result.filter((doctor) => doctor.isOnline === true);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (doctor) =>
          (doctor.name && doctor.name.toLowerCase().includes(query)) ||
          (doctor.specialization &&
            doctor.specialization.toLowerCase().includes(query)) ||
          (doctor.qualification &&
            doctor.qualification.toLowerCase().includes(query)) ||
          (doctor.bio && doctor.bio.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    if (sortOption === "rating") {
      result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    } else if (sortOption === "priceLowToHigh") {
      result.sort((a, b) => (a.ticketPrice ?? 0) - (b.ticketPrice ?? 0));
    } else if (sortOption === "priceHighToLow") {
      result.sort((a, b) => (b.ticketPrice ?? 0) - (a.ticketPrice ?? 0));
    } else if (sortOption === "experience") {
      result.sort((a, b) => (b.experience ?? 0) - (a.experience ?? 0));
    }

    return result;
  }, [
    doctors,
    specializationFilter,
    availabilityFilter,
    searchQuery,
    sortOption,
  ]);

  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = filteredDoctors.slice(
    indexOfFirstDoctor,
    indexOfLastDoctor
  );
  const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);

  const handleAppointment = (doctorId: string) => {
    navigate(`/doctors/${doctorId}`);
  };

  // Get unique specializations for filter options
  const specializations = [
    ...new Set(doctors.map((doctor) => doctor.specialization)),
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 py-16 text-white">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">Find Your Perfect Doctor</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Book appointments with certified specialists for personalized
            healthcare
          </p>
          <div className="max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search doctors by name, specialty..."
                className="w-full px-5 py-3 rounded-full text-gray-800 focus:outline-none shadow-lg"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <button className="absolute right-2 top-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 container mx-auto px-4 sm:px-6 py-8">
        {/* Sidebar Filters */}
        <div className="lg:w-64 w-full bg-white shadow-md rounded-lg p-6 mb-6 lg:mb-0 lg:mr-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Filters</h2>

          {/* Specialization Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specialization
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={specializationFilter}
              onChange={(e) => {
                setSpecializationFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Specializations</option>
              {specializations.map((spec, index) => (
                <option key={`${spec}-${index}`} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          {/* Availability Filter */}
          <div className="mb-6">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500"
                checked={availabilityFilter}
                onChange={(e) => {
                  setAvailabilityFilter(e.target.checked);
                  setCurrentPage(1);
                }}
              />
              <span className="text-sm font-medium text-gray-700">
                Available Today
              </span>
            </label>
          </div>

          {/* Sort Options */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="recommended">Recommended</option>
              <option value="rating">Highest Rating</option>
              <option value="priceLowToHigh">Price: Low to High</option>
              <option value="priceHighToLow">Price: High to Low</option>
              <option value="experience">Most Experienced</option>
            </select>
          </div>

          {/* Reset Filters */}
          <button
            onClick={() => {
              setSpecializationFilter("");
              setAvailabilityFilter(false);
              setSearchQuery("");
              setSortOption("recommended");
              setCurrentPage(1);
            }}
            className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors font-medium"
          >
            Reset All Filters
          </button>
        </div>

        {/* Main Content */}
        <main className="flex-1">
          {/* Quick Filters */}
          {/* <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => {
                setSpecializationFilter("Cardiologist");
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                specializationFilter === "Cardiologist"
                  ? "bg-blue-100 text-blue-800 border border-blue-300"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              Cardiologists
            </button>
            <button
              onClick={() => {
                setSpecializationFilter("Dermatologist");
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                specializationFilter === "Dermatologist"
                  ? "bg-blue-100 text-blue-800 border border-blue-300"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              Dermatologists
            </button>
            <button
              onClick={() => {
                setAvailabilityFilter(true);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                availabilityFilter
                  ? "bg-blue-100 text-blue-800 border border-blue-300"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              Available Today
            </button>
            <button
              onClick={() => {
                setSortOption("rating");
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                sortOption === "rating"
                  ? "bg-blue-100 text-blue-800 border border-blue-300"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              Top Rated
            </button>
          </div> */}

          {/* Results Count */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-gray-600">
              Showing{" "}
              <span className="font-semibold">{currentDoctors.length}</span> of{" "}
              <span className="font-semibold">{filteredDoctors.length}</span>{" "}
              doctors
            </div>
            <div className="text-sm text-gray-500">
              Page <span className="font-semibold">{currentPage}</span> of{" "}
              <span className="font-semibold">{totalPages}</span>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse"
                >
                  <div className="relative h-48 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="flex items-center mb-4">
                      <div className="h-4 bg-gray-200 rounded w-16 mr-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-4"></div>
                    </div>
                    <div className="flex justify-between">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <div className="mx-auto h-24 w-24 text-red-500 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Unable to load doctors
              </h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredDoctors.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No doctors found
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Try adjusting your search or filters to find what you're looking
                for
              </p>
              <button
                onClick={() => {
                  setSpecializationFilter("");
                  setAvailabilityFilter(false);
                  setSearchQuery("");
                  setSortOption("recommended");
                  setCurrentPage(1);
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Doctors Grid */}
          {!loading && !error && currentDoctors.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentDoctors.map((doctor) => (
                  <div
                    key={doctor._id}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100"
                  >
                    <div className="relative h-48">
                      <img
                        src={doctor.profilePicture || "profile.png"}
                        alt={doctor.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        // onError={(e) => {
                        //   e.currentTarget.src = "/default-doctor.jpg";
                        // }}
                      />
                      {doctor.isOnline && (
                        <span className="absolute top-3 right-3 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                          Available
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">
                        {doctor.name}
                      </h3>
                      <p className="text-blue-600 text-sm font-medium mb-1">
                        {doctor.specialization}
                      </p>
                      <p className="text-gray-500 text-xs mb-3">
                        {doctor.qualification}
                      </p>

                      <div className="flex items-center mb-3">
                        <div className="flex items-center mr-4">
                          <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
                          <span className="text-sm text-gray-600">
                            {doctor.rating || "4.5"}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <CalendarIcon className="w-4 h-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-600">
                            {doctor.experience || "5"} yrs
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <CurrencyRupeeIcon className="w-4 h-4 text-gray-700" />
                          <span className="text-sm font-medium text-gray-900 ml-1">
                            {doctor.ticketPrice || "500"}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAppointment(doctor._id);
                          }}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
                        >
                          <ClockIcon className="w-4 h-4 mr-1" />
                          Book
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {filteredDoctors.length > doctorsPerPage && (
                <div className="flex justify-center mt-8">
                  <nav className="inline-flex rounded-md shadow-sm">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Previous
                    </button>
                    {Array.from({ length: Math.min(totalPages, 5) }).map(
                      (_, index) => {
                        // Show first, last, and nearby pages for better UX with many pages
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = index + 1;
                        } else if (currentPage <= 3) {
                          pageNum = index + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + index;
                        } else {
                          pageNum = currentPage - 2 + index;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-4 py-2 border-t border-b border-gray-300 text-sm font-medium ${
                              currentPage === pageNum
                                ? "bg-blue-50 text-blue-600 border-blue-200"
                                : "bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                    )}
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 flex items-center"
                    >
                      Next
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 ml-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default DoctorsList;

// import React, { useEffect, useState } from "react";
// import { IDoctor } from "../../../Types";
// import Navbar from "./Navbar";
// import Footer from "./Footer";
// import api from "../../../axios/UserInstance";
// import { useNavigate } from "react-router-dom";

// const DoctorsList: React.FC = () => {
//   const [doctors, setDoctors] = useState<IDoctor[]>([]);
//   const [filteredDoctors, setFilteredDoctors] = useState<IDoctor[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const navigate = useNavigate();

//   // Filter states
//   const [specializationFilter, setSpecializationFilter] = useState<string>("");
//   const [availabilityFilter, setAvailabilityFilter] = useState<boolean>(false);
//   const [searchQuery, setSearchQuery] = useState<string>("");

//   useEffect(() => {
//     const fetchDoctors = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const response = await api.get<{ data: IDoctor[]; message: string; success: boolean }>("/doctors");

//         if (response.data.success) {
//           setDoctors(response.data.data);
//           setFilteredDoctors(response.data.data);
//         } else {
//           setError(response.data.message);
//         }
//       } catch (error) {
//         setError("Failed to fetch doctors. Please try again later.");
//         console.error("Error fetching doctors:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDoctors();
//   }, []);

//   // Apply filters whenever filter states change
// //   useEffect(() => {
// //     let result = [...doctors];
// //     console.log('result:',result)

// //     if (specializationFilter) {
// //       result = result.filter(doctor =>
// //         doctor.specialization.toLowerCase().includes(specializationFilter.toLowerCase())
// //       );
// //     }

// //     // if (availabilityFilter) {
// //     //   result = result.filter(doctor => doctor.isAvailable);
// //     // }

// //     if (searchQuery) {
// //       result = result.filter(doctor =>
// //         doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
// //         doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
// //         doctor.qualification.toLowerCase().includes(searchQuery.toLowerCase())
// //       );
// //     }

// //     setFilteredDoctors(result);
// //   }, [doctors, specializationFilter, availabilityFilter, searchQuery]);

//   const handleAppointment = async (doctorId: string) => {
//     console.log("Doctor ID:", doctorId);
//     try {
//       navigate(`/doctors/${doctorId}`)
//     } catch (error) {
//       setError("Doctor appointment failed");
//     }
//   };

//   // Get unique specializations for filter options
//   const specializations = [...new Set(doctors.map(doctor => doctor.specialization))];

//   return (
//     <div className="min-h-screen flex flex-col bg-gray-50">
//       <Navbar />
//       <div className="flex flex-1">
//         {/* Sidebar */}
//         <div className="w-64 bg-white shadow-md p-4">
//           <h2 className="text-xl font-bold text-gray-800 mb-4">Filters</h2>

//           {/* Search Input */}
//           <div className="mb-6">
//             <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
//               Search
//             </label>
//             <input
//               type="text"
//               id="search"
//               placeholder="Search doctors..."
//               className="w-full px-3 py-2 border border-gray-300 rounded-md"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//           </div>

//           {/* Specialization Filter */}
//           <div className="mb-6">
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Specialization
//             </label>
//             <select
//               className="w-full px-3 py-2 border border-gray-300 rounded-md"
//               value={specializationFilter}
//               onChange={(e) => setSpecializationFilter(e.target.value)}
//             >
//               <option value="">All Specializations</option>
//               {specializations.map((spec) => (
//                 <option key={spec} value={spec}>
//                   {spec}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Availability Filter */}
//           <div className="mb-6">
//             <label className="flex items-center space-x-2">
//               <input
//                 type="checkbox"
//                 className="rounded text-blue-600"
//                 checked={availabilityFilter}
//                 onChange={(e) => setAvailabilityFilter(e.target.checked)}
//               />
//               <span className="text-sm font-medium text-gray-700">
//                 Available Now
//               </span>
//             </label>
//           </div>

//           {/* Reset Filters */}
//           <button
//             onClick={() => {
//               setSpecializationFilter("");
//               setAvailabilityFilter(false);
//               setSearchQuery("");
//             }}
//             className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
//           >
//             Reset Filters
//           </button>
//         </div>

//         {/* Main Content */}
//         <main className="flex-1 container mx-auto px-6 py-12">
//           <h1 className="text-4xl font-bold text-gray-800 text-center mb-12">
//             Meet Our Expert Doctors
//           </h1>

//           {loading && (
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//               {[...Array(8)].map((_, index) => (
//                 <div
//                   key={index}
//                   className="bg-white p-6 rounded-xl shadow-sm animate-pulse"
//                 >
//                   <div className="h-56 bg-gray-200 rounded-xl mb-4"></div>
//                   <div className="h-4 bg-gray-200 rounded w-24 mx-auto mb-2"></div>
//                   <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
//                   <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
//                 </div>
//               ))}
//             </div>
//           )}

//           {error && (
//             <div className="text-center py-8">
//               <p className="text-red-500 text-lg">{error}</p>
//               <button
//                 onClick={() => window.location.reload()}
//                 className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//               >
//                 Retry
//               </button>
//             </div>
//           )}

//           {!loading && !error && filteredDoctors.length === 0 && (
//             <div className="text-center py-8">
//               <p className="text-gray-600 text-lg">No doctors found matching your criteria.</p>
//               <button
//                 onClick={() => {
//                   setSpecializationFilter("");
//                   setAvailabilityFilter(false);
//                   setSearchQuery("");
//                 }}
//                 className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//               >
//                 Clear Filters
//               </button>
//             </div>
//           )}

//           {!loading && !error && filteredDoctors.length > 0 && (
//             <>
//               <div className="mb-4 text-gray-600">
//                 Showing {filteredDoctors.length} of {doctors.length} doctors
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//                 {filteredDoctors.map((doctor) => (
//                   <div
//                     onClick={() => handleAppointment(doctor._id)}
//                     key={doctor._id}
//                     className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
//                   >
//                     <div className="relative mb-4">
//                       <img
//                         src={doctor.profilePicture || "profile.png"}
//                         alt={doctor.name}
//                         className="w-full h-56 object-cover rounded-xl"
//                         loading="lazy"
//                       />
//                       {/* {doctor.isAvailable && (
//                         <span className="absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
//                           Available
//                         </span>
//                       )} */}
//                     </div>
//                     <h3 className="text-xl font-semibold text-gray-800 mb-1">
//                       {doctor.name}
//                     </h3>
//                     <p className="text-gray-600 text-sm mb-1">
//                       {doctor.specialization}
//                     </p>
//                     <p className="text-gray-500 text-sm">{doctor.qualification}</p>
//                   </div>
//                 ))}
//               </div>
//             </>
//           )}
//         </main>
//       </div>
//       <Footer />
//     </div>
//   );
// };

// export default DoctorsList;
