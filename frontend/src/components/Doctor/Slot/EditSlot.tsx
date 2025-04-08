import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";
import { RootState } from "../../../slice/Store/Store";
import { setError } from "../../../slice/Doctor/doctorSlice";
import slotApi from "../../../Api/SlotApis";

const EditSlot: React.FC = () => {
  const dispatch = useDispatch();
  const { slotId } = useParams();
  const navigate = useNavigate();
  console.log('slotId :',slotId)

  const { doctor, isAuthenticated, loading: reduxLoading } = useSelector(
    (state: RootState) => state.doctor
  );

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [recurringEndDate, setRecurringEndDate] = useState<Date | null>(null);
  const [maxPatients, setMaxPatients] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchSlotDetails = async () => {
      try {
        const response = await slotApi.get(`/time-slots/edit/${slotId}`);
        const data = response.data.data;
        console.log(data)

        const dateObj = new Date(data.date);
        const [startHour, startMinute] = data.startTime.split(":").map(Number);
        const [endHour, endMinute] = data.endTime.split(":").map(Number);

        setSelectedDate(dateObj);
        setStartTime(new Date(dateObj.setHours(startHour, startMinute)));
        setEndTime(new Date(new Date(data.date).setHours(endHour, endMinute)));
        setMaxPatients(data.maxPatients);

        if (data.recurring?.isRecurring) {
          setIsRecurring(true);
          setFrequency(data.recurring.frequency);
          setRecurringEndDate(data.recurring.endDate ? new Date(data.recurring.endDate) : null);
        }
      } catch (error: any) {
        console.error("Failed to fetch slot:", error);
        toast.error("Failed to load slot details.");
      }
    };

    if (slotId) fetchSlotDetails();
  }, [slotId]);

  if (!isAuthenticated || !doctor) {
    return (
      <div className="max-w-lg mx-auto my-10 p-6 bg-white rounded-xl shadow-md text-center">
        <h2 className="text-2xl font-semibold text-red-600">
          Please log in as a doctor to edit slots.
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
      const start = startTime.getHours() * 60 + startTime.getMinutes();
      const end = endTime.getHours() * 60 + endTime.getMinutes();
      if (start >= end) {
        newErrors.endTime = "End time must be after start time.";
      }
    }

    if (maxPatients < 1) newErrors.maxPatients = "At least 1 patient is required.";

    if (isRecurring && recurringEndDate && selectedDate && recurringEndDate <= selectedDate) {
      newErrors.recurringEndDate = "Recurring end date must be after the start date.";
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
      date: selectedDate?.toISOString().split("T")[0],
      startTime: formatTime(startTime),
      endTime: formatTime(endTime),
      maxPatients,
      ...(isRecurring && {
        recurring: {
          isRecurring: true,
          frequency,
          endDate: recurringEndDate?.toISOString().split("T")[0],
        },
      }),
    };

    try {
      setIsLoading(true);
      const response = await slotApi.put(`/time-slots/${slotId}`, slotData);

      toast.success("Slot updated successfully!");
      navigate("/doctor/slots");
    } catch (error: any) {
      console.error("Slot update error:", error);
      let errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update slot.";

      if (errorMessage.includes("overlaps")) {
        errorMessage = "Time slot overlaps with another. Choose a different time.";
      }

      toast.error(errorMessage);
      dispatch(setError(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto my-10 p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold text-teal-700 text-center mb-6">
        Edit Appointment Slot
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
          <DatePicker
            selected={selectedDate}
            onChange={setSelectedDate}
            dateFormat="MMMM d, yyyy"
            className="w-full p-2 border border-gray-300 rounded-md"
            minDate={new Date()}
          />
          {errors.selectedDate && <p className="text-red-500 text-sm">{errors.selectedDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
          <DatePicker
            selected={startTime}
            onChange={setStartTime}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            dateFormat="h:mm aa"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          {errors.startTime && <p className="text-red-500 text-sm">{errors.startTime}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
          <DatePicker
            selected={endTime}
            onChange={setEndTime}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            dateFormat="h:mm aa"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          {errors.endTime && <p className="text-red-500 text-sm">{errors.endTime}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Patients</label>
          <input
            type="number"
            min="1"
            value={maxPatients}
            onChange={(e) => setMaxPatients(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          {errors.maxPatients && <p className="text-red-500 text-sm">{errors.maxPatients}</p>}
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="h-4 w-4 text-teal-600"
          />
          <label className="ml-2 text-sm font-medium text-gray-700">Recurring Slot</label>
        </div>

        {isRecurring && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as "daily" | "weekly" | "monthly")}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <DatePicker
                selected={recurringEndDate}
                onChange={(date) => setRecurringEndDate(date)}
                dateFormat="MMMM d, yyyy"
                minDate={selectedDate ? new Date(selectedDate.getTime() + 86400000) : new Date()}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              {errors.recurringEndDate && (
                <p className="text-red-500 text-sm">{errors.recurringEndDate}</p>
              )}
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={isLoading || reduxLoading}
          className="w-full py-3 px-4 bg-teal-600 text-white font-semibold rounded-md hover:bg-teal-700 disabled:opacity-50"
        >
          {isLoading || reduxLoading ? "Updating..." : "Update Slot"}
        </button>
      </form>
    </div>
  );
};

export default EditSlot;
