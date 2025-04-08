import React, { useState, useEffect } from 'react';
import { Clock, PlusCircle, Edit2, Trash2, Plus } from 'lucide-react';
import doctorApi from '../../../axios/DoctorInstance';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../../slice/Store/Store';

interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  maxPatients: number;
}

const TimeSlots: React.FC = () => {
  const doctor = useSelector((state: RootState) => state.doctor.doctor);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newSlot, setNewSlot] = useState({
    day: '',
    startTime: '',
    endTime: '',
    maxPatients: 1,
  });

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchTimeSlots();
  }, []);

  const fetchTimeSlots = async () => {
    try {
      const response = await doctorApi.get(`/slots/${doctor?._id}`);
      setSlots(response.data);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      setError('Failed to load time slots.');
    }
  };

  const handleAddSlot = async () => {
    // Validate start and end times
    if (newSlot.startTime >= newSlot.endTime) {
      setError('Start time must be before end time.');
      return;
    }
    try {
      await doctorApi.post('/slots/create', newSlot);
      fetchTimeSlots();
      setIsAddingSlot(false);
      setNewSlot({ day: '', startTime: '', endTime: '', maxPatients: 1 });
      setError(null);
    } catch (error) {
      console.error('Error adding time slot:', error);
      setError('Failed to add time slot.');
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (window.confirm('Are you sure you want to delete this time slot?')) {
      try {
        await doctorApi.delete(`/slots/${slotId}`);
        fetchTimeSlots();
      } catch (error) {
        console.error('Error deleting time slot:', error);
        setError('Failed to delete time slot.');
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold flex items-center">
          <Clock className="mr-2" /> Regular Time Slots
        </h2>
        {/* <Link
          to="/doctor/slots/create"
          className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
        >
          <PlusCircle size={20} className="mr-2" />
          Create New Slot
        </Link> */}
        <button
          onClick={() => setIsAddingSlot(true)}
          className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          <Plus size={20} className="mr-2" /> Add Time Slot
        </button>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {isAddingSlot && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={newSlot.day}
              onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}
              className="p-2 border rounded-md"
            >
              <option value="">Select Day</option>
              {weekDays.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
            <input
              type="time"
              value={newSlot.startTime}
              onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
              className="p-2 border rounded-md"
            />
            <input
              type="time"
              value={newSlot.endTime}
              onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
              className="p-2 border rounded-md"
            />
            <input
              type="number"
              value={newSlot.maxPatients}
              onChange={(e) => setNewSlot({ ...newSlot, maxPatients: Number(e.target.value) || 1 })}
              min="1"
              className="p-2 border rounded-md"
            />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button onClick={() => setIsAddingSlot(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
              Cancel
            </button>
            <button onClick={handleAddSlot} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
              Save
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {slots.map((slot) => (
          <div key={slot.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
            <div className="flex items-center gap-4">
              <div className="w-24 font-medium">{slot.day}</div>
              <div className="text-gray-600">
                {slot.startTime} - {slot.endTime}
              </div>
              <div className="text-gray-600">Max Patients: {slot.maxPatients}</div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-md">
                <Edit2 size={18} />
              </button>
              <button onClick={() => handleDeleteSlot(slot.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-md">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimeSlots;
