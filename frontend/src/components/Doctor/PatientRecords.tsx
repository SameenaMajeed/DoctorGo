import React from 'react';
// import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { RecordCard } from '../CommonComponents/card';

const medicalRecords = [
  {
    date: '13, Jan 2021',
    complaint: 'Bleeding Gums, Toothache, bad breath',
    diagnosis: 'Gingivitis, Caries, Periodontitis',
    treatment: 'Filling, Post&Core, Implant, Extraction',
    prescription: 'Paracetamol, Amoxicillin, Ibuprofen, Aspirin',
    cost: 150000,
  },
  {
    date: '10, Feb 2022',
    complaint: 'Food impaction, Replacing Missing Teeth',
    diagnosis: 'Caries, Periodontitis, Malocclusion',
    treatment: 'Superficial Scaling, Root Planing, Extraction',
    prescription: 'Benzocaine, Lidocaine, Mepivacaine, Prilocaine',
    cost: 300000,
  },
  {
    date: '20, Mar 2022',
    complaint: 'Broken Teeth, Bridge, Cap in the front teeth',
    diagnosis: 'Unspecified Gingival Recession, Unspecified Periodontitis',
    treatment: 'Consultation, Scaling, Root Planing, Extraction',
    prescription: 'Gingival Gel, Chlorhexidine, Fluoride, Calcium',
    cost: 500000,
  },
];

const PatientProfile = () => {
  const handleViewRecord = (index: number) => {
    console.log('View record:', medicalRecords[index]);
  };

  const handleDeleteRecord = (index: number) => {
    console.log('Delete record:', medicalRecords[index]);
    // Add your delete logic here
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-1/4 p-6 bg-white border-r">
        <button className="mb-6 p-2 border rounded-xl">⬅️</button>
        <div className="flex flex-col items-center text-center">
          <img
            src="https://via.placeholder.com/100"
            alt="profile"
            className="w-24 h-24 rounded-full object-cover mb-4"
          />
          <h2 className="text-lg font-semibold">Amani Mmassy</h2>
          <p className="text-gray-500">amanimmassy@gmail.com</p>
          <p className="text-gray-600 mt-1">+254 712 345 678</p>
        </div>
        <div className="mt-10">
          <div className="p-3 bg-green-50 rounded-lg font-medium">Medical Records</div>
          <div className="mt-4 p-3 rounded-lg hover:bg-gray-100 cursor-pointer">
            Appointments
          </div>
        </div>
      </aside>

      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold">Medical Record</h1>
          {/* <Button className="flex gap-2 items-center bg-green-500 text-white">
            <Plus size={18} /> New Record
          </Button> */}
        </div>

        {medicalRecords.map((record, index) => (
          <RecordCard
            key={index}
            date={record.date}
            cost={`(Tsh) ${record.cost.toLocaleString()}`}
            complaint={record.complaint}
            diagnosis={record.diagnosis}
            treatment={record.treatment}
            prescription={record.prescription}
            onView={() => handleViewRecord(index)}
            onDelete={() => handleDeleteRecord(index)}
          />
        ))}
      </main>
    </div>
  );
};

export default PatientProfile;