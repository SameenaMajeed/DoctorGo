import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";
import { RootState } from "../../../slice/Store/Store";
import { setError } from "../../../slice/Doctor/doctorSlice";
import slotApi from "../../../Api/SlotApis";
import { useNavigate } from "react-router-dom";

const CreateSlot: React.FC = () => {
  const dispatch = useDispatch();
  const {
    doctor,
    isAuthenticated,
    loading: reduxLoading,
  } = useSelector((state: RootState) => state.doctor);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [recurringEndDate, setRecurringEndDate] = useState<Date | null>(null);
  const [maxPatients, setMaxPatients] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();

  if (!isAuthenticated || !doctor) {
    return (
      <div className="max-w-lg mx-auto my-10 p-6 bg-white rounded-xl shadow-md text-center">
        <h2 className="text-2xl font-semibold text-red-600">
          Please log in as a doctor to create slots.
        </h2>
      </div>
    );
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!selectedDate) {
      newErrors.selectedDate = "Date is required.";
    } else if (selectedDate < today) {
      newErrors.selectedDate = "You cannot select a past date.";
    }

    if (!startTime) newErrors.startTime = "Start time is required.";
    if (!endTime) newErrors.endTime = "End time is required.";

    if (startTime && endTime) {
      const startHours = startTime.getHours();
      const startMinutes = startTime.getMinutes();
      const endHours = endTime.getHours();
      const endMinutes = endTime.getMinutes();

      if (
        startHours > endHours ||
        (startHours === endHours && startMinutes >= endMinutes)
      ) {
        newErrors.endTime = "End time must be after start time.";
      }
    }

    if (maxPatients < 1)
      newErrors.maxPatients = "At least 1 patient is required.";

    if (isRecurring) {
      if (!frequency) newErrors.frequency = "Please select a frequency.";

      if (
        recurringEndDate &&
        selectedDate &&
        recurringEndDate <= selectedDate
      ) {
        newErrors.recurringEndDate =
          "Recurring end date must be after the start date.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatTime = (date: Date | null) => {
    if (!date) return "";
    return `${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes()
    ).padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const slotData = {
      doctorId: doctor._id || "",
      date: selectedDate
        ? new Date(
            selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000
          )
            .toISOString()
            .split("T")[0]
        : null,
      startTime: formatTime(startTime),
      endTime: formatTime(endTime),
      maxPatients,
      bookedCount: 0,
      ...(isRecurring && {
        recurring: {
          isRecurring: true,
          frequency,
          endDate: recurringEndDate
            ? new Date(
                recurringEndDate.getTime() -
                  recurringEndDate.getTimezoneOffset() * 60000
              )
                .toISOString()
                .split("T")[0]
            : null,
        },
      }),
    };

    try {
      setIsLoading(true);
      const response = await slotApi.post("/time-slots/create", slotData);

      if (response) {
        toast.success("Slot created successfully!");
        setSelectedDate(null);
        setStartTime(null);
        setEndTime(null);
        setIsRecurring(false);
        setFrequency("weekly");
        setRecurringEndDate(null);
        setMaxPatients(1);
        navigate("/doctor/slots");
      }
    } catch (error: any) {
      console.error("Slot creation error:", error);
      let errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create slot.";
      
      // Handle specific error cases
      if (errorMessage.includes("overlaps with existing slot")) {
        errorMessage = "This time slot overlaps with an existing appointment. Please choose a different time.";
      } else if (errorMessage.includes("Start time must be before end time")) {
        errorMessage = "End time must be after start time.";
      } else if (errorMessage.includes("Invalid time format")) {
        errorMessage = "Please enter valid time format (HH:mm).";
      }

      toast.error(errorMessage);
      dispatch(setError(errorMessage));
      
      // Update form errors if needed
      if (errorMessage.includes("time")) {
        setErrors(prev => ({
          ...prev,
          startTime: errorMessage.includes("start") ? errorMessage : "",
          endTime: errorMessage.includes("end") ? errorMessage : ""
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto my-10 p-6 bg-gray-100 rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold text-teal-700 text-center mb-6">
        Create Appointment Slot
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Date
          </label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dateFormat="MMMM d, yyyy"
            placeholderText="Select a date"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            minDate={new Date()}
          />
          {errors.selectedDate && (
            <p className="text-red-500 text-sm mt-1">{errors.selectedDate}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Time
          </label>
          <DatePicker
            selected={startTime}
            onChange={(time) => setStartTime(time)}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeCaption="Time"
            dateFormat="h:mm aa"
            timeFormat="h:mm aa"
            placeholderText="Select start time"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          {errors.startTime && (
            <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Time
          </label>
          <DatePicker
            selected={endTime}
            onChange={(time) => setEndTime(time)}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeCaption="Time"
            dateFormat="h:mm aa"
            timeFormat="h:mm aa"
            placeholderText="Select end time"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          {errors.endTime && (
            <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Maximum Patients
          </label>
          <input
            type="number"
            min="1"
            value={maxPatients}
            onChange={(e) =>
              setMaxPatients(Math.max(1, parseInt(e.target.value) || 1))
            }
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          {errors.maxPatients && (
            <p className="text-red-500 text-sm mt-1">{errors.maxPatients}</p>
          )}
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
          />
          <label className="ml-2 text-sm font-medium text-gray-700">
            Recurring Slot
          </label>
        </div>

        {isRecurring && (
          <div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) =>
                  setFrequency(e.target.value as "daily" | "weekly" | "monthly")
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              {errors.frequency && (
                <p className="text-red-500 text-sm mt-1">{errors.frequency}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date (Optional)
              </label>
              <DatePicker
                selected={recurringEndDate}
                onChange={(date: Date | null) => setRecurringEndDate(date)}
                dateFormat="MMMM d, yyyy"
                placeholderText="Select end date"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                minDate={selectedDate ? new Date(selectedDate.getTime() + 86400000) : new Date()}
                disabled={isLoading || reduxLoading}
              />
              {errors.recurringEndDate && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.recurringEndDate}
                </p>
              )}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || reduxLoading}
          className="w-full py-3 px-4 bg-teal-600 text-white font-semibold rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading || reduxLoading ? "Creating..." : "Create Slot"}
        </button>
      </form>
    </div>
  );
};

export default CreateSlot;

// import React, { useState } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import toast from "react-hot-toast";
// import { RootState } from "../../../slice/Store/Store";
// import { setError } from "../../../slice/Doctor/doctorSlice";
// import slotApi from "../../../Api/SlotApis";
// import { useNavigate } from "react-router-dom";

// const CreateSlot: React.FC = () => {
//   const dispatch = useDispatch();
//   const {
//     doctor,
//     isAuthenticated,
//     loading: reduxLoading,
//   } = useSelector((state: RootState) => state.doctor);

//   const [selectedDate, setSelectedDate] = useState<Date | null>(null);
//   const [startTime, setStartTime] = useState<Date | null>(null);
//   const [endTime, setEndTime] = useState<Date | null>(null);

//   const [isRecurring, setIsRecurring] = useState(false);
//   const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">(
//     "weekly"
//   );
//   const [recurringEndDate, setRecurringEndDate] = useState<Date | null>(null);
//   const [maxPatients, setMaxPatients] = useState<number>(1);
//   const [isLoading, setIsLoading] = useState(false);
//   const [errors, setErrors] = useState<{ [key: string]: string }>({});
//   const navigate = useNavigate();

//   if (!isAuthenticated || !doctor) {
//     return (
//       <div className="max-w-lg mx-auto my-10 p-6 bg-white rounded-xl shadow-md text-center">
//         <h2 className="text-2xl font-semibold text-red-600">
//           Please log in as a doctor to create slots.
//         </h2>
//       </div>
//     );
//   }

//   const validateForm = () => {
//     const newErrors: { [key: string]: string } = {};
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     if (!selectedDate) {
//       newErrors.selectedDate = "Date is required.";
//     } else if (selectedDate < today) {
//       newErrors.selectedDate = "You cannot select a past date.";
//     }

//     if (!startTime) newErrors.startTime = "Start time is required.";
//     if (!endTime) newErrors.endTime = "End time is required.";

//     if (startTime && endTime) {
//       const startHours = startTime.getHours();
//       const startMinutes = startTime.getMinutes();
//       const endHours = endTime.getHours();
//       const endMinutes = endTime.getMinutes();

//       if (
//         startHours > endHours ||
//         (startHours === endHours && startMinutes >= endMinutes)
//       ) {
//         newErrors.endTime = "End time must be after start time.";
//       }
//     }

//     if (maxPatients < 1)
//       newErrors.maxPatients = "At least 1 patient is required.";

//     if (isRecurring) {
//       if (!frequency) newErrors.frequency = "Please select a frequency.";

//       if (
//         recurringEndDate &&
//         selectedDate &&
//         recurringEndDate <= selectedDate
//       ) {
//         newErrors.recurringEndDate =
//           "Recurring end date must be after the start date.";
//       }
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const formatTime = (date: Date | null) => {
//     if (!date) return "";
//     return `${String(date.getHours()).padStart(2, "0")}:${String(
//       date.getMinutes()
//     ).padStart(2, "0")}`;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!validateForm()) return;

//     const slotData = {
//       doctorId: doctor._id || "123",
//       date: selectedDate
//         ? new Date(
//             selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000
//           )
//             .toISOString()
//             .split("T")[0]
//         : null,
//       startTime: formatTime(startTime),
//       endTime: formatTime(endTime),
//       maxPatients,
//       bookedCount: 0,
//       ...(isRecurring && {
//         recurring: {
//           isRecurring: true,
//           frequency,
//           endDate: recurringEndDate
//             ? new Date(
//                 recurringEndDate.getTime() -
//                   recurringEndDate.getTimezoneOffset() * 60000
//               )
//                 .toISOString()
//                 .split("T")[0]
//             : null,
//         },
//       }),
//     };

//     try {
//       setIsLoading(true);
//       console.log("Submitting slot data:", slotData);
//       const response = await slotApi.post("/time-slots/create", slotData);

//       console.log(response);

//       if (response) {
//         toast.success("Slot created successfully!");
//         setSelectedDate(null);
//         setStartTime(null);
//         setEndTime(null);
//         setIsRecurring(false);
//         setFrequency("weekly");
//         setRecurringEndDate(null);
//         setMaxPatients(1);
//         navigate("/doctor/slots");
//       }
//     } catch (error: any) {
//       console.error("Slot creation error:", error);
//       const errorMessage =
//         error.response?.data?.message ||
//         error.message ||
//         "Failed to create slot.";
//       toast.error(errorMessage);
//       dispatch(setError(errorMessage));
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-lg mx-auto my-10 p-6 bg-white rounded-xl shadow-md">
//       <h2 className="text-2xl font-semibold text-teal-700 text-center mb-6">
//         Create Appointment Slot
//       </h2>
//       <form onSubmit={handleSubmit} className="space-y-6">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Select Date
//           </label>
//           <DatePicker
//             selected={selectedDate}
//             onChange={(date) => setSelectedDate(date)}
//             dateFormat="MMMM d, yyyy"
//             placeholderText="Select a date"
//             className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
//           />
//           {errors.selectedDate && (
//             <p className="text-red-500 text-sm mt-1">{errors.selectedDate}</p>
//           )}
//         </div>

//         {/* Start Time */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Start Time
//           </label>
//           <DatePicker
//             selected={startTime}
//             onChange={(time) => setStartTime(time)}
//             showTimeSelect
//             showTimeSelectOnly
//             timeIntervals={15}
//             timeCaption="Time"
//             dateFormat="h:mm aa"
//             timeFormat="h:mm aa"
//             placeholderText="Select start time"
//             className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
//           />
//           {errors.startTime && (
//             <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>
//           )}
//         </div>

//         {/* End Time */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             End Time
//           </label>
//           <DatePicker
//             selected={endTime}
//             onChange={(time) => setEndTime(time)}
//             showTimeSelect
//             showTimeSelectOnly
//             timeIntervals={15}
//             timeCaption="Time"
//             dateFormat="h:mm aa"
//             timeFormat="h:mm aa"
//             placeholderText="Select end time"
//             className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
//           />
//           {errors.endTime && (
//             <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>
//           )}
//         </div>

//         {/* Max Patients */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Maximum Patients
//           </label>
//           <input
//             type="number"
//             min="1"
//             value={maxPatients}
//             onChange={(e) =>
//               setMaxPatients(Math.max(1, parseInt(e.target.value) || 1))
//             }
//             className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
//           />
//           {errors.maxPatients && (
//             <p className="text-red-500 text-sm mt-1">{errors.maxPatients}</p>
//           )}
//         </div>

//         {/* Recurring Slot */}
//         <div className="flex items-center">
//           <input
//             type="checkbox"
//             checked={isRecurring}
//             onChange={(e) => setIsRecurring(e.target.checked)}
//             className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
//           />
//           <label className="ml-2 text-sm font-medium text-gray-700">
//             Recurring Slot
//           </label>
//         </div>

//         {/* Recurring Options */}
//         {isRecurring && (
//           <div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Frequency
//               </label>
//               <select
//                 value={frequency}
//                 onChange={(e) =>
//                   setFrequency(e.target.value as "daily" | "weekly" | "monthly")
//                 }
//                 className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
//               >
//                 <option value="daily">Daily</option>
//                 <option value="weekly">Weekly</option>
//                 <option value="monthly">Monthly</option>
//               </select>
//               {errors.frequency && (
//                 <p className="text-red-500 text-sm mt-1">{errors.frequency}</p>
//               )}
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 End Date (Optional)
//               </label>
//               <DatePicker
//                 selected={recurringEndDate}
//                 onChange={(date: Date | null) => setRecurringEndDate(date)}
//                 dateFormat="MMMM d, yyyy"
//                 placeholderText="Select end date"
//                 className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
//                 disabled={isLoading || reduxLoading}
//               />
//               {errors.recurringEndDate && (
//                 <p className="text-red-500 text-sm mt-1">
//                   {errors.recurringEndDate}
//                 </p>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Submit Button */}
//         <button
//           type="submit"
//           disabled={isLoading || reduxLoading}
//           className="w-full py-3 px-4 bg-teal-600 text-white font-semibold rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           {isLoading || reduxLoading ? "Creating..." : "Create Slot"}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default CreateSlot;
