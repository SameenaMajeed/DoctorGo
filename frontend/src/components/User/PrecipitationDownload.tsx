// import { useState } from 'react';
// import { Prescription, Medication } from '../../Types';

// const PrescriptionDownloadPage = () => {
//   const [prescription] = useState<Prescription>({
//     id: 'rx-12345',
//     patientName: 'John Doe',
//     age: 32,
//     gender: 'Male',
//     appointmentId: 'apt-7890',
//     date: '2023-11-15',
//     doctorName: 'Dr. Sarah Smith',
//     specialization: 'Cardiology',
//     clinicName: 'City Health Clinic',
//     diagnosis: 'Hypertension Stage 1',
//     medications: [
//       { name: 'Lisinopril', dosage: '10mg', duration: 'Once daily - 30 days' },
//       { name: 'Amlodipine', dosage: '5mg', duration: 'Once daily - 30 days' },
//     ],
//     notes: 'Monitor blood pressure weekly. Reduce sodium intake. Follow up in 4 weeks.',
//   });

//   const [downloadFormat, setDownloadFormat] = useState<'pdf' | 'png' | 'text'>('pdf');

//   const handleDownload = () => {
//     // Implement actual download logic (e.g., API call or PDF generation)
//     console.log(`Downloading as ${downloadFormat}`);
//     alert(`Prescription downloaded as ${downloadFormat.toUpperCase()}`);
//   };

//   const handleShare = (method: string) => {
//     console.log(`Sharing via ${method}`);
//     alert(`Prescription shared via ${method}`);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-8">
//       {/* Header */}
//       <header className="mb-6 flex items-center justify-between">
//         <div className="flex items-center space-x-2">
//           <button className="rounded-lg p-2 hover:bg-gray-200">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//             </svg>
//           </button>
//           <h1 className="text-2xl font-bold text-gray-800">Download Prescription</h1>
//         </div>
//         <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
//           <span className="text-blue-600 font-medium">JD</span>
//         </div>
//       </header>

//       {/* Prescription Card */}
//       <div className="mb-8 bg-white rounded-xl shadow-md overflow-hidden">
//         <div className="p-6">
//           {/* Patient & Doctor Info */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//             <div>
//               <h2 className="text-lg font-semibold text-gray-700 mb-2">Patient Information</h2>
//               <div className="space-y-1 text-gray-600">
//                 <p><span className="font-medium">Name:</span> {prescription.patientName}</p>
//                 <p><span className="font-medium">Age/Gender:</span> {prescription.age}/{prescription.gender}</p>
//                 <p><span className="font-medium">Appointment ID:</span> {prescription.appointmentId}</p>
//                 <p><span className="font-medium">Date:</span> {new Date(prescription.date).toLocaleDateString()}</p>
//               </div>
//             </div>

//             <div>
//               <h2 className="text-lg font-semibold text-gray-700 mb-2">Doctor Information</h2>
//               <div className="space-y-1 text-gray-600">
//                 <p><span className="font-medium">Doctor:</span> {prescription.doctorName}</p>
//                 <p><span className="font-medium">Specialization:</span> {prescription.specialization}</p>
//                 <p><span className="font-medium">Clinic:</span> {prescription.clinicName}</p>
//               </div>
//             </div>
//           </div>

//           {/* Prescription Content */}
//           <div className="border-t pt-4">
//             <h2 className="text-lg font-semibold text-gray-700 mb-2">Prescription Details</h2>
//             <div className="mb-4">
//               <p className="font-medium text-gray-700">Diagnosis:</p>
//               <p className="text-gray-600">{prescription.diagnosis}</p>
//             </div>

//             <div className="mb-4">
//               <p className="font-medium text-gray-700">Medications:</p>
//               <ul className="list-disc pl-5 text-gray-600 space-y-1">
//                 {prescription.medications.map((med, index) => (
//                   <li key={index}>
//                     <span className="font-medium">{med.name}</span> - {med.dosage} - {med.duration}
//                   </li>
//                 ))}
//               </ul>
//             </div>

//             <div>
//               <p className="font-medium text-gray-700">Additional Notes:</p>
//               <p className="text-gray-600">{prescription.notes}</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Download Options */}
//       <div className="bg-white rounded-xl shadow-md p-6 mb-6">
//         <h2 className="text-lg font-semibold text-gray-700 mb-4">Download Options</h2>
        
//         <div className="flex flex-wrap gap-4 mb-6">
//           {(['pdf', 'png', 'text'] as const).map((format) => (
//             <button
//               key={format}
//               onClick={() => setDownloadFormat(format)}
//               className={`px-4 py-2 rounded-lg border ${
//                 downloadFormat === format
//                   ? 'bg-blue-600 text-white border-blue-600'
//                   : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
//               }`}
//             >
//               {format.toUpperCase()}
//             </button>
//           ))}
//         </div>

//         <div className="flex flex-wrap gap-4">
//           <button
//             onClick={handleDownload}
//             className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//           >
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
//             </svg>
//             Download Prescription
//           </button>

//           <div className="flex items-center space-x-2">
//             <span className="text-gray-600">Share:</span>
//             {['Email', 'WhatsApp', 'Print'].map((method) => (
//               <button
//                 key={method}
//                 onClick={() => handleShare(method.toLowerCase())}
//                 className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
//               >
//                 {method === 'Email' && <span>✉️</span>}
//                 {method === 'WhatsApp' && <span>💬</span>}
//                 {method === 'Print' && <span>🖨️</span>}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Footer */}
//       <footer className="text-center text-sm text-gray-500">
//         <p className="mb-2">Consult your doctor before following this prescription.</p>
//         <p>Need help? Contact support@healthapp.com</p>
//       </footer>
//     </div>
//   );
// };

// export default PrescriptionDownloadPage;


import { useState } from 'react';
import { Prescription, Medication } from '../../Types';

const MedicalPrescription = () => {
  const [prescription] = useState<Prescription>({
    doctorName: "Dr. Akshara",
    qualification: "M.S.",
    regNo: "MMC 2018",
    hospital: "SMS hospital",
    address: "B/503, Business Center, MG Road, Pune - 411000.",
    contact: "Ph: 5465647658, Timing: 09:00 AM - 01:00 PM, 06:00 PM - 08:00 PM | Closed: Sunday",
    patientId: "ID: 11 - OPD6",
    patientDetails: "PATIENT (M) / 13 Y",
    patientMobile: "Mob. No.: 9423380390",
    patientAddress: "Address: PUNE",
    vitals: "Weight (Kg): 80, Height (Cm): 200 (B.M.I. = 20.00), BP: 120/80 mmHg",
    date: "Date: 30-Aug-2023",
    complaints: [
      "FEVER WITH CHILLS (4 DAYS)",
      "HEADACHE (2 DAYS)"
    ],
    findings: [
      "THESE ARE TEST FINDINGS FOR A TEST PATIENT",
      "ENTERING SAMPLE DIAGNOSIS AND SAMPLE PRESCRIPTION"
    ],
    diagnosis: ["MALARIA"],
    medications: [
      {
        id: 1,
        name: "TAB. ABCIXIMAB",
        dosage: "1 Morning",
        duration: "8 Days (Tot:8 Tab)"
      },
      {
        id: 2,
        name: "TAB. VOMILAST",
        dosage: "1 Morning, 1 Night (After Food)",
        duration: "8 Days (Tot:16 Tab)",
        composition: "DOXYLAMINE 10MG + PYRIDOXINE 10 MG + FOLIC ACID 2.5 MG"
      },
      {
        id: 3,
        name: "CAP. ZOCLAR 500",
        dosage: "1 Morning",
        duration: "3 Days (Tot:3 Cap)",
        composition: "CLARITHROMYCIN IP 500MG"
      },
      {
        id: 4,
        name: "TAB. GESTAKIND 10/SR",
        dosage: "1 Night",
        duration: "4 Days (Tot:4 Tab)",
        composition: "ISOXSUPRINE 10 MG"
      }
    ],
    advice: [
      "TAKE BED REST",
      "DO NOT EAT OUTSIDE FOOD",
      "EAT EASY TO DIGEST FOOD LIKE BOILED RICE WITH DAAL"
    ],
    followUp: "Follow Up: 04-09-2023",
    note: "Substitute with equivalent Generics as required."
  });

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white font-sans">
      {/* Doctor & Hospital Header */}
      <div className="text-center border-b-2 border-black pb-2 mb-4">
        <h1 className="text-xl font-bold">{prescription.doctorName}</h1>
        <p className="text-sm">{prescription.qualification}</p>
        <p className="text-xs">Reg. No: {prescription.regNo}</p>
        
        <h2 className="font-semibold mt-2">{prescription.hospital}</h2>
        <p className="text-xs">{prescription.address}</p>
        <p className="text-xs">{prescription.contact}</p>
      </div>

      {/* Patient Details */}
      <div className="grid grid-cols-2 text-xs mb-4">
        <div>
          <p>{prescription.patientId} {prescription.patientDetails}</p>
          <p>{prescription.patientMobile}</p>
          <p>{prescription.patientAddress}</p>
        </div>
        <div className="text-right">
          <p>{prescription.vitals}</p>
          <p>{prescription.date}</p>
        </div>
      </div>

      {/* Horizontal Rule */}
      <hr className="border-black my-2" />

      {/* Chief Complaints */}
      <div className="mb-3">
        <h3 className="font-bold underline">Chief Complaints</h3>
        <ul className="list-disc pl-5">
          {prescription.complaints.map((item, index) => (
            <li key={index} className="text-sm">* {item}</li>
          ))}
        </ul>
      </div>

      {/* Clinical Findings */}
      <div className="mb-3">
        <h3 className="font-bold underline">Clinical Findings</h3>
        <ul className="list-disc pl-5">
          {prescription.findings.map((item, index) => (
            <li key={index} className="text-sm">* {item}</li>
          ))}
        </ul>
      </div>

      {/* Diagnosis */}
      <div className="mb-3">
        <h3 className="font-bold underline">Diagnosis:</h3>
        <ul className="list-disc pl-5">
          {prescription.diagnosis.map((item, index) => (
            <li key={index} className="text-sm">* {item}</li>
          ))}
        </ul>
      </div>

      {/* Medications Table */}
      <div className="mb-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-black">
              <th className="text-left py-1">Medicine Name</th>
              <th className="text-left py-1">Dosage</th>
              <th className="text-left py-1">Duration</th>
            </tr>
          </thead>
          <tbody>
            {prescription.medications.map((med) => (
              <tr key={med.id} className="border-b border-gray-200">
                <td className="py-1 align-top">
                  <p className="text-sm">{med.id}) {med.name}</p>
                  {med.composition && (
                    <p className="text-xs text-gray-600">{med.composition}</p>
                  )}
                </td>
                <td className="py-1 text-sm">{med.dosage}</td>
                <td className="py-1 text-sm">{med.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Advice */}
      <div className="mb-3">
        <h3 className="font-bold underline">Advice:</h3>
        <ul className="list-disc pl-5">
          {prescription.advice.map((item, index) => (
            <li key={index} className="text-sm">* {item}</li>
          ))}
        </ul>
      </div>

      {/* Follow Up */}
      <p className="font-semibold text-sm">{prescription.followUp}</p>

      {/* Horizontal Rule */}
      <hr className="border-black my-2" />

      {/* Note */}
      {prescription.note && (
        <p className="text-xs italic text-center mt-2">{prescription.note}</p>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 mt-6">
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
          Print Prescription
        </button>
        <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 text-sm">
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default MedicalPrescription;