import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EmergencyBlock: React.FC = () => {
  const navigate = useNavigate();
  const [blockData, setBlockData] = useState({
    startDate: '',
    endDate: '',
    reason: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // API call to block slots
    navigate('/doctor/slots');
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Emergency Block</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2">Start Date</label>
          <input
            type="datetime-local"
            value={blockData.startDate}
            onChange={(e) => setBlockData({...blockData, startDate: e.target.value})}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-2">End Date</label>
          <input
            type="datetime-local"
            value={blockData.endDate}
            onChange={(e) => setBlockData({...blockData, endDate: e.target.value})}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-2">Reason</label>
          <textarea
            value={blockData.reason}
            onChange={(e) => setBlockData({...blockData, reason: e.target.value})}
            className="w-full p-2 border rounded"
            rows={4}
          />
        </div>
        <button type="submit" className="bg-red-500 text-white px-4 py-2 rounded">
          Block Slots
        </button>
      </form>
    </div>
  );
};

export default EmergencyBlock;