import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, Edit, Trash2, Search } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "../../../slice/Store/Store";
import slotApi from "../../../Api/SlotApis";
import toast from "react-hot-toast";
import useFetchData from "../../../Hooks/useFetchData";
import Pagination from "../../../Pagination/Pagination";
import { ISlot } from "../../../types/Slot";

const ManageSlots: React.FC = () => {
  const [slots, setSlots] = useState<ISlot[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 6;

  const doctor = useSelector((state: RootState) => state.doctor.doctor);

  const fetchSlots = async () => {
    try {
      const response = await slotApi.get(`/time-slots/${doctor?._id}`, {
        params: { page, limit, searchTerm, _: new Date().getTime() },
      });
      console.log('slots',response.data.data)
  
      if (response.data.data) {
        setSlots(response.data.data.slots || []);
        setTotalPages(Math.ceil(response.data.data.total / limit));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch slots");
    }
  };

  const fetchDoctorCallback = useCallback(fetchSlots, [page, searchTerm]);

  const { data, loading, error, refetch } = useFetchData(fetchDoctorCallback);

  useEffect(() => {
    if (doctor?._id) {
      fetchSlots();
    }
  }, [doctor?._id, page, searchTerm]); 

  const handleDelete = async (slotId: string) => {
    if (window.confirm("Are you sure you want to delete this slot?")) {
      try {
        await slotApi.delete(`/time-slots/${slotId}`);
        toast.success("Slot deleted successfully");
        fetchSlots();
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to delete slot");
      }
    }
  };

  const getSlotStatus = (slot: ISlot) => {
    if (slot.isBlocked) return "blocked";
    if (slot.bookedCount >= slot.maxPatients) return "booked";
    if (slot.bookedCount > 0) return "partially-booked";
    return "available";
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: "bg-green-100 text-green-700",
      "partially-booked": "bg-yellow-100 text-yellow-700",
      booked: "bg-blue-100 text-blue-700",
      blocked: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

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

  const filteredSlots = slots.filter((slot) => {
    const status = getSlotStatus(slot);
    const slotDate = formatDate(slot.date);
    const startTime = formatTimeString(slot.startTime);
    const endTime = formatTimeString(slot.endTime);
    
    return (
      (searchTerm === "" ||
        slotDate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        startTime.toLowerCase().includes(searchTerm.toLowerCase()) ||
        endTime.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filter === "all" || status === filter)
    );
  });

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Manage Appointment Slots
          </h1>
          <Link
            to="/doctor/slots/create"
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
          >
            <PlusCircle size={20} className="mr-2" />
            Create New Slot
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search slots by date or time..."
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-green-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-300"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Slots</option>
            <option value="available">Available</option>
            <option value="partially-booked">Partially Booked</option>
            <option value="booked">Fully Booked</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading slots...</div>
        ) : filteredSlots.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No slots found. Create new slots to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-3 text-left">Date</th>
                  <th className="border p-3 text-left">Time</th>
                  <th className="border p-3 text-left">Status</th>
                  <th className="border p-3 text-left">Booked</th>
                  <th className="border p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSlots.map((slot) => (
                  <tr key={slot._id} className="hover:bg-gray-50">
                    <td className="border p-3">{formatDate(slot.date)}</td>
                    <td className="border p-3">
                      {formatTimeString(slot.startTime)} - {formatTimeString(slot.endTime)}
                    </td>
                    <td className={`border p-3 ${getStatusColor(getSlotStatus(slot))}`}>
                      {getSlotStatus(slot)}
                    </td>
                    <td className="border p-3">
                      {slot.bookedCount}/{slot.maxPatients}
                    </td>
                    <td className="border p-3">
                      <Link
                        to={`/doctor/time-slots/${slot._id}`}
                        className="text-blue-600"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(slot._id)}
                        className="text-red-600 ml-3"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default ManageSlots;