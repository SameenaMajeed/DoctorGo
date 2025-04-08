import React, { useEffect, useState } from "react";
import Navbar from "../User/Home/Navbar";
import Footer from "../CommonComponents/Footer";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../axios/UserInstance";
import toast from "react-hot-toast";
import slotApi from "../../axios/SlotInstance";
import { Slot } from "../../types/Slot";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useSelector } from "react-redux";
import { RootState } from "../../slice/Store/Store";

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  experience: number;
  description: string;
  profilePicture: string;
  ticketPrice: number;
  extraCharge: number;
  bio: string;
}

const AppointmentPage: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const userId = useSelector((state: RootState) => state.user?.user?.id);

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [userBookedSlots, setUserBookedSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [isBooking, setIsBooking] = useState<boolean>(false);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const doctorResponse = await api.get(`/doctors/${doctorId}`);
        setDoctor(doctorResponse.data.data);
      } catch (error) {
        console.error("Error fetching doctor details:", error);
        toast.error("Failed to load doctor details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [doctorId]);

  useEffect(() => {
    if (selectedDate) {
      fetchAppointmentsAndSlots(selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    const fetchUserBookings = async () => {
      if (userId && doctorId) {
        try {
          const response = await api.get(`/bookings/user/${userId}?doctorId=${doctorId}`);
          const bookedSlotIds = response.data.data.map((booking: any) => booking.slot_id);
          setUserBookedSlots(bookedSlotIds);
        } catch (error) {
          console.error("Error fetching user bookings:", error);
        }
      }
    };
    
    fetchUserBookings();
  }, [userId, doctorId]);

  const isSameDate = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const fetchAppointmentsAndSlots = async (date: Date) => {
    try {
      setIsLoadingSlots(true);
      
      // Format date as YYYY-MM-DD in local time
      const formattedDate = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0')
      ].join('-');
  
      const slotsResponse = await slotApi.get(
        `/time-slots/${doctorId}/available?date=${formattedDate}`
      );
      
      setAvailableSlots(slotsResponse.data?.data?.slots || []);
    } catch (error) {
      console.error("Error fetching slots:", error);
      toast.error("Failed to load available slots");
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const formatTimeForDisplay = (timeString: string): string => {
    if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeString)) {
      return timeString;
    }
    
    try {
      const date = new Date(timeString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: false 
        });
      }
    } catch {
      console.warn("Invalid time format:", timeString);
    }
    
    return "Invalid Time";
  };

  const handleDateChange = (date: Date | null) => {
    if (date && !isNaN(date.getTime())) {
      const maxDate = new Date();
      maxDate.setMonth(maxDate.getMonth() + 3);
      
      if (date > maxDate) {
        toast.error("Appointments can only be booked up to 3 months in advance");
        return;
      }

      setSelectedDate(date);
    } else {
      setSelectedDate(null);
      setAvailableSlots([]);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      toast.error("Please select a time slot.");
      return;
    }

    if (userBookedSlots.includes(selectedSlot._id)) {
      toast.error("You already have an appointment in this time slot.");
      return;
    }

    try {
      setIsBooking(true);
      navigate("/appointment/verification", {
        state: {
          doctor,
          selectedSlot,
        },
      });
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to book appointment");
    } finally {
      setIsBooking(false);
    }
  };

  const formatTimeString = (timeString: string) => {
    // Handle HH:mm format
    if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeString)) {
      const [hours, minutes] = timeString.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const hours12 = hours % 12 || 12;
      return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
    }
    
    // Handle ISO date string format (legacy)
    try {
      const date = new Date(timeString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    } catch (error) {
      console.error("Error formatting time:", error);
    }
    
    return "Invalid Time";
  };

  if (loading) return <p className="text-center text-gray-600 mt-10">Loading doctor details...</p>;
  if (!doctor) return <p className="text-center text-red-500 mt-10">Doctor not found</p>;

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 mt-12">
        <section className="bg-white shadow-lg p-6 rounded-lg flex flex-col md:flex-row border border-gray-200">
          <div className="w-full md:w-1/3 bg-blue-50 flex justify-center items-center p-4 rounded-lg mb-4 md:mb-0 md:mr-4">
            <img 
              src={doctor.profilePicture} 
              alt={doctor.name} 
              className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-md" 
            />
          </div>
          <div className="w-full md:w-2/3 p-4">
            <h2 className="text-2xl font-bold text-gray-800">{doctor.name}</h2>
            <p className="text-gray-600 text-lg">{doctor.specialization}</p>
            <p className="text-gray-500 text-sm mt-1">{doctor.experience} Years Experience</p>
            <p className="mt-3 text-gray-700 font-medium">{doctor.bio}</p>
            <p className="text-gray-600 text-sm mt-2">{doctor.description}</p>
            <p className="mt-4 text-md font-semibold text-gray-800">
              Consultation Fee: <span className="text-blue-600">{doctor.ticketPrice} INR</span>
            </p>
          </div>
        </section>

        <section className="mt-8 bg-white shadow-lg p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Select a Date</h3>
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            className="border p-2 rounded w-full focus:ring-blue-500 focus:border-blue-500"
            minDate={new Date()}
            maxDate={new Date(new Date().setMonth(new Date().getMonth() + 3))}
            placeholderText="Select a date"
            dateFormat="MMMM d, yyyy"
          />

          {selectedDate && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Available Time Slots</h3>
              
              {isLoadingSlots ? (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  <p className="mt-2 text-gray-600">Loading available slots...</p>
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                  {availableSlots.map((slot) => {
                    const isBookedByUser = userBookedSlots.includes(slot._id);
                    return (
                      <button
                        key={slot._id}
                        onClick={() => !isBookedByUser && setSelectedSlot(slot)}
                        className={`px-4 py-3 rounded-md text-sm font-medium shadow-sm border transition-all w-full text-center ${
                          selectedSlot?._id === slot._id
                            ? "bg-blue-600 text-white border-blue-600"
                            : isBookedByUser
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                            : "bg-white text-gray-700 hover:bg-blue-50 border-gray-200 hover:border-blue-300"
                        }`}
                        disabled={isBookedByUser}
                        title={isBookedByUser ? "You already have an appointment in this slot" : ""}
                      >
                        {formatTimeString(slot.startTime)} - {formatTimeString(slot.endTime)}
                        {isBookedByUser && " (Booked)"}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No available slots for this date.</p>
                  <p className="text-sm text-gray-400 mt-1">Please try another date.</p>
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleBooking}
            disabled={!selectedSlot || userBookedSlots.includes(selectedSlot._id) || isBooking}
            className={`w-full mt-6 py-3 rounded-md text-lg font-semibold shadow-md transition ${
              selectedSlot && !userBookedSlots.includes(selectedSlot._id) && !isBooking
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isBooking ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : selectedSlot && userBookedSlots.includes(selectedSlot._id) ? (
              "Already Booked"
            ) : (
              "Book Appointment"
            )}
          </button>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default AppointmentPage;

// import React, { useEffect, useState } from "react";
// import Navbar from "../User/Home/Navbar";
// import Footer from "../CommonComponents/Footer";
// import { useNavigate, useParams } from "react-router-dom";
// import api from "../../axios/UserInstance";
// import toast from "react-hot-toast";
// import slotApi from "../../axios/SlotInstance";
// import { Slot } from "../../types/Slot";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import { useSelector } from "react-redux";
// import { RootState } from "../../slice/Store/Store";

// interface Doctor {
//   _id: string;
//   name: string;
//   specialization: string;
//   experience: number;
//   description: string;
//   profilePicture: string;
//   ticketPrice: number;
//   extraCharge: number;
//   bio: string;
// }

// const AppointmentPage: React.FC = () => {
//   const { doctorId } = useParams<{ doctorId: string }>();
//   const navigate = useNavigate();
//   const userId = useSelector((state: RootState) => state.user?.user?.id);

//   const [doctor, setDoctor] = useState<Doctor | null>(null);
//   const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
//   const [userBookedSlots, setUserBookedSlots] = useState<string[]>([]);
//   const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
//   const [selectedDate, setSelectedDate] = useState<Date | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);

//   useEffect(() => {
//     const fetchDoctor = async () => {
//       try {
//         const doctorResponse = await api.get(`/doctors/${doctorId}`);
//         setDoctor(doctorResponse.data.data);
//       } catch (error) {
//         console.error("Error fetching doctor details:", error);
//         toast.error("Failed to load doctor details.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDoctor();
//   }, [doctorId]);

//   useEffect(() => {
//     if (selectedDate) {
//       fetchAppointmentsAndSlots(selectedDate);
//     }
//   }, [selectedDate]);

//   useEffect(() => {
//     const fetchUserBookings = async () => {
//       if (userId && doctorId) {
//         try {
//           const response = await api.get(`/bookings/user/${userId}?doctorId=${doctorId}`);
//           const bookedSlotIds = response.data.data.map((booking: any) => booking.slot_id);
//           setUserBookedSlots(bookedSlotIds);
//         } catch (error) {
//           console.error("Error fetching user bookings:", error);
//         }
//       }
//     };
    
//     fetchUserBookings();
//   }, [userId, doctorId]);

//   const fetchAppointmentsAndSlots = async (date: Date) => {
//     try {
//       setIsLoadingSlots(true);
//       const formattedDate = date.toISOString().split("T")[0];
//       const slotsResponse = await slotApi.get(`/time-slots/${doctorId}/available?date=${formattedDate}`);
      
//       // Process slots to ensure proper time formatting
//       const processedSlots = slotsResponse.data?.data?.slots?.map((slot: Slot) => ({
//         ...slot,
//         startTime: formatTimeForDisplay(slot.startTime),
//         endTime: formatTimeForDisplay(slot.endTime)
//       })) || [];
      
//       setAvailableSlots(processedSlots);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//       toast.error("Failed to load appointments and slots.");
//     } finally {
//       setIsLoadingSlots(false);
//     }
//   };

//   const formatTimeForDisplay = (timeString: string): string => {
//     // Handle both ISO strings and "HH:mm" format
//     if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeString)) {
//       return timeString; // Already in correct format
//     }
    
//     try {
//       const date = new Date(timeString);
//       if (!isNaN(date.getTime())) {
//         return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
//       }
//     } catch {
//       console.warn("Invalid time format:", timeString);
//     }
    
//     return "Invalid Time";
//   };

//   const handleDateChange = (date: Date | null) => {
//     if (date && !isNaN(date.getTime())) {
//       setSelectedDate(date);
//     } else {
//       setSelectedDate(null);
//       setAvailableSlots([]);
//     }
//   };

//   const handleBooking = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!selectedSlot) {
//       toast.error("Please select a time slot.");
//       return;
//     }

//     if (userBookedSlots.includes(selectedSlot._id)) {
//       toast.error("You already have an appointment in this time slot.");
//       return;
//     }

//     navigate("/appointment/verification", {
//       state: {
//         doctor,
//         selectedSlot,
//       },
//     });
//   };

//   if (loading) return <p className="text-center text-gray-600 mt-10">Loading doctor details...</p>;
//   if (!doctor) return <p className="text-center text-red-500 mt-10">Doctor not found</p>;

//   return (
//     <div className="bg-gray-100 min-h-screen">
//       <Navbar />
//       <div className="max-w-4xl mx-auto p-6 mt-12">
//         <section className="bg-white shadow-lg p-6 rounded-lg flex flex-col md:flex-row border border-gray-200">
//           <div className="w-full md:w-1/3 bg-blue-50 flex justify-center items-center p-4 rounded-lg mb-4 md:mb-0 md:mr-4">
//             <img 
//               src={doctor.profilePicture} 
//               alt={doctor.name} 
//               className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-md" 
//             />
//           </div>
//           <div className="w-full md:w-2/3 p-4">
//             <h2 className="text-2xl font-bold text-gray-800">{doctor.name}</h2>
//             <p className="text-gray-600 text-lg">{doctor.specialization}</p>
//             <p className="text-gray-500 text-sm mt-1">{doctor.experience} Years Experience</p>
//             <p className="mt-3 text-gray-700 font-medium">{doctor.bio}</p>
//             <p className="text-gray-600 text-sm mt-2">{doctor.description}</p>
//             <p className="mt-4 text-md font-semibold text-gray-800">
//               Consultation Fee: <span className="text-blue-600">{doctor.ticketPrice} INR</span>
//             </p>
//           </div>
//         </section>

//         <section className="mt-8 bg-white shadow-lg p-6 rounded-lg border border-gray-200">
//           <h3 className="text-lg font-semibold mb-4 text-gray-800">Select a Date</h3>
//           <DatePicker
//             selected={selectedDate}
//             onChange={handleDateChange}
//             className="border p-2 rounded w-full focus:ring-blue-500 focus:border-blue-500"
//             minDate={new Date()}
//             placeholderText="Select a date"
//             dateFormat="MMMM d, yyyy"
//           />

//           {selectedDate && (
//             <div className="mt-6">
//               <h3 className="text-lg font-semibold mb-4 text-gray-800">Available Time Slots</h3>
              
//               {isLoadingSlots ? (
//                 <div className="text-center py-4">
//                   <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
//                   <p className="mt-2 text-gray-600">Loading available slots...</p>
//                 </div>
//               ) : availableSlots.length > 0 ? (
//                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4">
//                   {availableSlots.map((slot) => {
//                     const isBookedByUser = userBookedSlots.includes(slot._id);
//                     return (
//                       <button
//                         key={slot._id}
//                         onClick={() => !isBookedByUser && setSelectedSlot(slot)}
//                         className={`px-4 py-3 rounded-md text-sm font-medium shadow-sm border transition-all w-full text-center ${
//                           selectedSlot?._id === slot._id
//                             ? "bg-blue-600 text-white border-blue-600"
//                             : isBookedByUser
//                             ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
//                             : "bg-white text-gray-700 hover:bg-blue-50 border-gray-200 hover:border-blue-300"
//                         }`}
//                         disabled={isBookedByUser}
//                         title={isBookedByUser ? "You already have an appointment in this slot" : ""}
//                       >
//                         {`${slot.startTime} - ${slot.endTime}`}
//                         {isBookedByUser && " (Booked)"}
//                       </button>
//                     );
//                   })}
//                 </div>
//               ) : (
//                 <div className="text-center py-6 bg-gray-50 rounded-lg">
//                   <p className="text-gray-500">No available slots for this date.</p>
//                   <p className="text-sm text-gray-400 mt-1">Please try another date.</p>
//                 </div>
//               )}
//             </div>
//           )}

//           <button
//             onClick={handleBooking}
//             disabled={!selectedSlot || userBookedSlots.includes(selectedSlot._id)}
//             className={`w-full mt-6 py-3 rounded-md text-lg font-semibold shadow-md transition ${
//               selectedSlot && !userBookedSlots.includes(selectedSlot._id)
//                 ? "bg-blue-600 text-white hover:bg-blue-700"
//                 : "bg-gray-300 text-gray-500 cursor-not-allowed"
//             }`}
//           >
//             {selectedSlot && userBookedSlots.includes(selectedSlot._id)
//               ? "Already Booked"
//               : "Book Appointment"}
//           </button>
//         </section>
//       </div>
//       <Footer />
//     </div>
//   );
// };

// export default AppointmentPage;
