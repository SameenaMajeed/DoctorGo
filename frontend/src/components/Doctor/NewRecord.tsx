import React, { useState } from "react";
import { Card, CardContent } from "../CommonComponents/card";
import { Button } from "../CommonComponents/Button";
import TextArea from "../CommonComponents/TextArea";
import { Plus, Trash2 } from "lucide-react";
import axios from "axios"; // Make sure to install axios
import { useLocation, useNavigate } from "react-router-dom";
import  {User } from "../../types/auth";
import { Appointment } from "../../Types";
import { useSelector } from "react-redux";
import { RootState } from "../../slice/Store/Store";
import doctorApi from "../../axios/DoctorInstance";
import toast from "react-hot-toast";

interface Medicine {
  name: string;
  price: number;
  dosage: string;
  instruction: string;
  quantity: number;
  amount: number;
}

const NewRecord: React.FC = () => {
  const [complaints, setComplaints] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [vitalSigns, setVitalSigns] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const doctor = useSelector((state: RootState) => state.doctor);

  const location = useLocation();
  const { patient, appointment } = location.state as {
    patient: User;
    appointment: Appointment;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Prepare the data according to your backend model
      const prescriptionData = {
        doctorId: doctor.doctor?._id,
        userId: patient._id,
        symptoms: complaints,
        disease: diagnosis,
        vitalSigns: vitalSigns,
        medicines: medicines.map((med) => ({
          name: med.name,
          dosage : med.dosage,
          quantity: med.quantity,
          time_gap: med.instruction,
          amount : med.amount
        })),
        testReports: attachments.map((img) => ({ img })),
        // You'll need to add userId and doctorId from your auth context
      };

      const response = await doctorApi.post(
        "/createPrescription",
        prescriptionData
      );

      // Handle success
      console.log("Prescription created:", response.data);
      toast.success('Prescription created successfully');
      navigate(`/doctor/patient-records/${patient._id}`, {
          state: {
            patient,
            appointment,
          },
        });
    } catch (error) {
      console.error("Error creating prescription:", error);
      // Handle error (show error message to user)
    } finally {
      setIsLoading(false);
    }
  };

  const addMedicine = () => {
    setMedicines([
      ...medicines,
      {
        name: "",
        price: 0,
        dosage: "",
        instruction: "",
        quantity: 1,
        amount: 0,
      },
    ]);
  };

  const removeMedicine = (index: number) => {
    const updatedMedicines = [...medicines];
    updatedMedicines.splice(index, 1);
    setMedicines(updatedMedicines);
  };

  const updateMedicine = (index: number, field: keyof Medicine, value: any) => {
    const updatedMedicines = [...medicines];
    updatedMedicines[index] = {
      ...updatedMedicines[index],
      [field]: value,
    };

    // Calculate amount if price or quantity changes
    if (field === "price" || field === "quantity") {
      updatedMedicines[index].amount =
        updatedMedicines[index].price * updatedMedicines[index].quantity;
    }

    setMedicines(updatedMedicines);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newAttachments = files.map((file) => URL.createObjectURL(file));
      setAttachments([...attachments, ...newAttachments]);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">
        New Medical Record
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar Card (unchanged) */}
          
          <div>
            <Card className="items-center text-center p-6 shadow-md border border-gray-200">
              <img
                src={patient.profilePicture || "/profile-placeholder.png"}
                alt="Profile"
                width={120}
                height={120}
                className="rounded-full mx-auto shadow-sm"
              />
              <p className="mt-4 text-lg font-semibold">{patient.name}</p>
              <p className="text-sm text-gray-600">{patient.email}</p>
              <p className="text-sm text-gray-600">{patient.mobile_no}</p>
              <span className="inline-block bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm mt-3">
                Age : {patient.age}
              </span>
               <div>
               <Button variant="outline"  
                  className="w-full mt-4 bg-white hover:bg-gray-100 text-blue-600 border-blue-600 hover:border-blue-700 transition duration-200" onClick={()=>navigate(`/doctor/patient-records/${patient._id}`, {
          state: {
            patient,
            appointment,
          },
        })}>Back</Button>
               </div>
            </Card>
          </div>

          {/* Form Section */}
          <div className="md:col-span-2 space-y-6">
            {/* Doctor Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Doctor Name
              </label>
              <input
                type="text"
                defaultValue={doctor.doctor?.name}
                className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                readOnly
              />
            </div>

            {/* Complaints */}
            <div>
              <TextArea
                id="complaints"
                label="Complaints"
                value={complaints}
                onChange={(e: any) => setComplaints(e.target.value)}
                placeholder="Complaints (e.g. Bad breath, toothache...)"
                required
              />
            </div>

            {/* Diagnosis */}
            <div>
              <TextArea
                id="diagnosis"
                label="Diagnosis"
                value={diagnosis}
                onChange={(e: any) => setDiagnosis(e.target.value)}
                placeholder="Diagnosis (e.g. Gingivitis, Periodontitis...)"
                required
              />
            </div>

            {/* Vital Signs */}
            <div>
              <TextArea
                id="vitalSigns"
                label="Vital Signs"
                value={vitalSigns}
                onChange={(e: any) => setVitalSigns(e.target.value)}
                placeholder="Vital Signs (e.g. Blood pressure, Pulse...)"
              />
            </div>

            {/* Medicine Table */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Prescribed Medicines
              </h3>
              <div className="overflow-auto rounded-md border border-gray-200 shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-600">
                    <tr>
                      <th className="p-3">Item</th>
                      <th className="p-3">Price (INR)</th>
                      <th className="p-3">Medicine Name</th>
                      <th className="p-3">Duration</th>
                      <th className="p-3">Dosage</th>
                      <th className="p-3">Quantity</th>
                      <th className="p-3">Amount (INR)</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    {medicines.length > 0 ? (
                      medicines.map((medicine, index) => (
                        <tr key={index} className="border-t hover:bg-gray-50">
                          <td className="p-3">{index + 1}</td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={medicine.price}
                              onChange={(e) =>
                                updateMedicine(
                                  index,
                                  "price",
                                  parseInt(e.target.value)
                                )
                              }
                              className="w-full border-b border-gray-300 focus:outline-none"
                              required
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={medicine.name}
                              onChange={(e) =>
                                updateMedicine(index, "name", e.target.value)
                              }
                              className="w-full border-b border-gray-300 focus:outline-none"
                              required
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={medicine.instruction}
                              onChange={(e) =>
                                updateMedicine(index, "instruction", e.target.value)
                              }
                              className="w-full border-b border-gray-300 focus:outline-none"
                              required
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={medicine.dosage}
                              onChange={(e) =>
                                updateMedicine(
                                  index,
                                  "dosage",
                                  e.target.value
                                )
                              }
                              className="w-full border-b border-gray-300 focus:outline-none"
                              required
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={medicine.quantity}
                              onChange={(e) =>
                                updateMedicine(
                                  index,
                                  "quantity",
                                  parseInt(e.target.value)
                                )
                              }
                              className="w-full border-b border-gray-300 focus:outline-none"
                              min="1"
                              required
                            />
                          </td>
                          <td className="p-3">{medicine.amount}</td>
                          <td className="p-3">
                            <Button
                              variant="ghost"
                              type="button"
                              onClick={() => removeMedicine(index)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="p-3 text-center text-gray-500"
                        >
                          No medicines added
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <Button
                variant="outline"
                className="mt-3 flex items-center"
                type="button"
                onClick={addMedicine}
              >
                <Plus className="w-4 h-4 mr-2" /> Add Medicine
              </Button>
            </div>

            {/* Attachments */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Attachments
              </h3>
              <div className="grid grid-cols-5 gap-3">
                {attachments.map((img, id) => (
                  <div
                    key={id}
                    className="h-32 bg-gray-100 rounded-md relative shadow-sm flex items-center justify-center"
                  >
                    <img
                      src={img}
                      alt={`Attachment ${id}`}
                      className="h-full w-full object-cover rounded-md"
                    />
                    <button
                      className="absolute top-1 right-1 text-red-500 text-lg font-bold"
                      type="button"
                      onClick={() => {
                        const updatedAttachments = [...attachments];
                        updatedAttachments.splice(id, 1);
                        setAttachments(updatedAttachments);
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <label
                  htmlFor="file-upload"
                  className="col-span-2 h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-400 bg-white rounded-md text-center p-2 text-sm text-gray-500 cursor-pointer hover:bg-gray-50"
                >
                  <p>Drag your image here or click to browse</p>
                  <p className="text-xs text-gray-400">
                    (Only *.jpeg and *.png images will be accepted)
                  </p>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept="image/jpeg, image/png"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
            </div>

            {/* Save Button */}
            <Button
              className="mt-8 w-full py-3 text-base"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Medical Record"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewRecord;

// import React, { useState } from "react";
// import { Card, CardContent } from "../CommonComponents/card";
// import { Button } from "../CommonComponents/Button";
// import TextInput from "../CommonComponents/TextInput";
// import Textarea from "../CommonComponents/TextArea";
// import SelectInput from "../CommonComponents/SelectInput";
// // import { Select, SelectItem } from "../CommonComponents/SelectInput";
// import { Plus, Trash2 } from "lucide-react";
// import TextArea from "../CommonComponents/TextArea";

// const NewRecord : React.FC = () => {

//   const [complaints, setComplaints] = useState("");
//   const [diagnosis, setDiagnosis] = useState("");
//   const [vitalSigns, setVitalSigns] = useState("");

//   const [complaintsError, setComplaintsError] = useState("");
//   const [diagnosisError, setDiagnosisError] = useState("");
//   const [vitalSignsError, setVitalSignsError] = useState("");

//   return (
//     <div className="p-6 max-w-7xl mx-auto">
//       <h2 className="text-3xl font-bold mb-8 text-gray-800">
//         New Medical Record
//       </h2>
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//         {/* Sidebar Card */}
//         <div>
//           <Card className="items-center text-center p-6 shadow-md border border-gray-200">
//             <img
//               src="/profile-placeholder.png"
//               alt="Profile"
//               width={120}
//               height={120}
//               className="rounded-full mx-auto shadow-sm"
//             />
//             <p className="mt-4 text-lg font-semibold">Amani Mnassy</p>
//             <p className="text-sm text-gray-600">amanimnassy@gmail.com</p>
//             <p className="text-sm text-gray-600">+254 712 345 678</p>
//             <span className="inline-block bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm mt-3">
//               45 yrs
//             </span>
//           </Card>
//         </div>

//         {/* Form Section */}
//         <div className="md:col-span-2 space-y-6">
//           <div>
//             {/* Doctor Name */}
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Doctor Name
//             </label>
//             <input
//               type="text"
//               defaultValue="Doctor: Hugo Lloris"
//               className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-green-400"
//             />
//           </div>

//           {/* Complaints */}
//           <div>
//             <TextArea
//               id="complaints"
//               label="Complaints"
//               value={complaints}
//               onChange={(e : any) => setComplaints(e.target.value)}
//               placeholder="Complaints (e.g. Bad breath, toothache...)"
//               error={complaintsError}
//             />
//           </div>

//           {/* Diagnosis */}
//           <div>
//             <TextArea
//               id="diagnosis"
//               label="Diagnosis"
//               value={diagnosis}
//               onChange={(e: any) => setDiagnosis(e.target.value)}
//               placeholder="Diagnosis (e.g. Gingivitis, Periodontitis...)"
//               error={diagnosisError}
//             />
//           </div>

//           {/* Vital Signs */}
//           <div>
//             <TextArea
//               id="vitalSigns"
//               label="Vital Signs"
//               value={vitalSigns}
//               onChange={(e: any) => setVitalSigns(e.target.value)}
//               placeholder="Vital Signs (e.g. Blood pressure, Pulse...)"
//               error={vitalSignsError}
//             />
//           </div>

//           {/* Medicine Table */}
//           <div>
//             <h3 className="text-lg font-semibold text-gray-700 mb-3">
//               Prescribed Medicines
//             </h3>
//             <div className="overflow-auto rounded-md border border-gray-200 shadow-sm">
//               <table className="w-full text-sm text-left">
//                 <thead className="bg-gray-100 text-gray-600">
//                   <tr>
//                     <th className="p-3">Item</th>
//                     <th className="p-3">Price (tsh)</th>
//                     <th className="p-3">Dosage</th>
//                     <th className="p-3">Instruction</th>
//                     <th className="p-3">Quantity</th>
//                     <th className="p-3">Amount (tsh)</th>
//                     <th className="p-3">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="text-gray-700">
//                   {["Paracetamol", "Amoxicillin", "Ibuprofen"].map(
//                     (item, index) => (
//                       <tr key={index} className="border-t hover:bg-gray-50">
//                         <td className="p-3">{item}</td>
//                         <td className="p-3">{[1000, 2300, 5000][index]}</td>
//                         <td className="p-3">{`${index + 1} - M/A/E`}</td>
//                         <td className="p-3">
//                           {index === 2 ? "Before meal" : "After meal"}
//                         </td>
//                         <td className="p-3">{index + 1}</td>
//                         <td className="p-3">{[1000, 4600, 15000][index]}</td>
//                         <td className="p-3">
//                           <Button variant="ghost">
//                             <Trash2 className="w-4 h-4 text-red-500" />
//                           </Button>
//                         </td>
//                       </tr>
//                     )
//                   )}
//                 </tbody>
//               </table>
//             </div>
//             <Button variant="outline" className="mt-3 flex items-center">
//               <Plus className="w-4 h-4 mr-2" /> Add Medicine
//             </Button>
//           </div>

//           {/* Attachments */}
//           <div className="mt-6">
//             <h3 className="text-lg font-semibold text-gray-700 mb-3">
//               Attachments
//             </h3>
//             <div className="grid grid-cols-5 gap-3">
//               {[0, 1, 2, 3].map((id) => (
//                 <div
//                   key={id}
//                   className="h-32 bg-gray-100 rounded-md relative shadow-sm flex items-center justify-center text-gray-600 text-lg font-medium"
//                 >
//                   <button className="absolute top-1 right-1 text-red-500 text-lg font-bold">
//                     ×
//                   </button>
//                   {id}
//                 </div>
//               ))}
//               <div className="col-span-2 h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-400 bg-white rounded-md text-center p-2 text-sm text-gray-500">
//                 <p>Drag your image here</p>
//                 <p className="text-xs text-gray-400">
//                   (Only *.jpeg and *.png images will be accepted)
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Save Button */}
//           <Button className="mt-8 w-full py-3 text-base">
//             Save Medical Record
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default NewRecord;
