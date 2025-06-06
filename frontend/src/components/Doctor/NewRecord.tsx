import React, { useState } from "react";
import { Card, CardContent } from "../CommonComponents/card";
import { Button } from "../CommonComponents/Button";
import TextArea from "../CommonComponents/TextArea";
import { Plus, Trash2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { IUser } from "../../types/auth";
import { IAppointment } from "../../Types";
import { useSelector } from "react-redux";
import { RootState } from "../../slice/Store/Store";
import doctorApi from "../../axios/DoctorInstance";
import toast from "react-hot-toast";

interface IMedicine {
  name: string;
  dosage: string;
  instruction: string;
  quantity: number;
}

interface FormErrors {
  [key: string]: string;
}

const NewRecord: React.FC = () => {
  const [complaints, setComplaints] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [vitalSigns, setVitalSigns] = useState("");
  const [medicines, setMedicines] = useState<IMedicine[]>([]);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validationForm = (
    complaints: string,
    diagnosis: string,
    vitalSigns: string,
    medicines: IMedicine[],
    attachments: string[]
  ): FormErrors => {
    const newErrors: FormErrors = {};

    // Validate complaints
    if (!complaints || !complaints.trim()) {
      newErrors.complaints = "Complaints are required";
    } else if (complaints.trim().length < 5) {
      newErrors.complaints = "Complaints must be at least 5 characters";
    }

    // Validate diagnosis
    if (!diagnosis || !diagnosis.trim()) {
      newErrors.diagnosis = "Diagnosis is required";
    } else if (diagnosis.trim().length < 10) {
      newErrors.diagnosis = "Diagnosis must be at least 10 characters";
    }

    // Validate medicines
    if (medicines.length === 0) {
      newErrors.medicines = "At least one medicine is required";
    } else {
      medicines.forEach((medicine, index) => {
        const medicineErrors: { [key: string]: string } = {};

        // Validate medicine name
        if (!medicine.name || !medicine.name.trim()) {
          medicineErrors.name = "Medicine name is required";
        } else if (medicine.name.trim().length < 2) {
          medicineErrors.name = "Medicine name must be at least 2 characters";
        }

        // Validate dosage
        if (!medicine.dosage || !medicine.dosage.trim()) {
          medicineErrors.dosage = "Dosage is required";
        } else if (medicine.dosage.trim().length < 2) {
          medicineErrors.dosage = "Dosage must be at least 2 characters";
        }

        // Validate instruction
        if (!medicine.instruction || !medicine.instruction.trim()) {
          medicineErrors.instruction = "Instruction is required";
        } else if (medicine.instruction.trim().length < 2) {
          medicineErrors.instruction =
            "Instruction must be at least 2 characters";
        }

        // Validate quantity
        if (medicine.quantity < 1) {
          medicineErrors.quantity = "Quantity must be at least 1";
        }

        // If there are errors for this medicine, add them to newErrors with the index
        if (Object.keys(medicineErrors).length > 0) {
          newErrors[`medicines[${index}]`] = JSON.stringify(medicineErrors);
        }
      });
    }

    return newErrors;
  };

  const {
    doctor,
    isAuthenticated,
    loading: reduxLoading,
  } = useSelector((state: RootState) => state.doctor);
  console.log("doctor data fetched:", doctor);

  if (!isAuthenticated || !doctor) {
    return (
      <div className="max-w-lg mx-auto my-10 p-6 bg-white rounded-xl shadow-md text-center">
        <h2 className="text-2xl font-semibold text-red-600">
          Please log in as a doctor to create slots.
        </h2>
      </div>
    );
  }

  const navigate = useNavigate();

  // const doctor = useSelector((state: RootState) => state.doctor);

  const location = useLocation();
  const { patient, appointment } = location.state as {
    patient: IUser;
    appointment: IAppointment;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate the form
    const validationErrors = validationForm(
      complaints,
      diagnosis,
      vitalSigns,
      medicines,
      attachments
    );
    setErrors(validationErrors);

    // If there are errors, stop submission
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsLoading(true);

    try {
      // Prepare the data according to your backend model
      const prescriptionData = {
        doctorId: doctor._id,
        userId: patient._id,
        appointmentId:appointment._id,
        symptoms: complaints,
        disease: diagnosis,
        vitalSigns: vitalSigns,
        medicines: medicines.map((med) => ({
          name: med.name,
          dosage: med.dosage,
          quantity: med.quantity,
          time_gap: med.instruction,
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
      toast.success("Prescription created successfully");
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
        dosage: "",
        instruction: "",
        quantity: 1,
      },
    ]);
  };

  // const removeMedicine = (index: number) => {
  //   const updatedMedicines = [...medicines];
  //   updatedMedicines.splice(index, 1);
  //   setMedicines(updatedMedicines);
  // };

  const removeMedicine = (index: number) => {
    const updatedMedicines = [...medicines];
    updatedMedicines.splice(index, 1);
    setMedicines(updatedMedicines);

    const updatedErrors = { ...errors };
    delete updatedErrors[`medicines[${index}]`];
    setErrors(updatedErrors);
  };

  const updateMedicine = (
    index: number,
    field: keyof IMedicine,
    value: any
  ) => {
    const updatedMedicines = [...medicines];
    updatedMedicines[index] = {
      ...updatedMedicines[index],
      [field]: value,
    };

    setMedicines(updatedMedicines);

    const validationErrors = validationForm(
      complaints,
      diagnosis,
      vitalSigns,
      updatedMedicines,
      attachments
    );
    setErrors(validationErrors);
  };

  // const updateMedicine = (index: number, field: keyof Medicine, value: any) => {
  //   const updatedMedicines = [...medicines];
  //   updatedMedicines[index] = {
  //     ...updatedMedicines[index],
  //     [field]: value,
  //   };

  //   // Calculate amount if price or quantity changes
  //   if (field === "price" || field === "quantity") {
  //     updatedMedicines[index].amount =
  //       updatedMedicines[index].price * updatedMedicines[index].quantity;
  //   }

  //   setMedicines(updatedMedicines);
  // };

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
                <Button
                  variant="outline"
                  className="w-full mt-4 bg-white hover:bg-gray-100 text-blue-600 border-blue-600 hover:border-blue-700 transition duration-200"
                  onClick={() =>
                    navigate(`/doctor/patient-records/${patient._id}`, {
                      state: {
                        patient,
                        appointment,
                      },
                    })
                  }
                >
                  Back
                </Button>
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
                defaultValue={doctor.name}
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
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setComplaints(e.target.value)
                }
                placeholder="Complaints (e.g. Bad breath, toothache...)"
              />
              {errors.complaints && (
                <p className="text-red-500 text-sm mt-1">{errors.complaints}</p>
              )}
            </div>

            {/* Diagnosis */}
            <div>
              <TextArea
                id="diagnosis"
                label="Diagnosis"
                value={diagnosis}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setDiagnosis(e.target.value)
                }
                placeholder="Diagnosis (e.g. Gingivitis, Periodontitis...)"
              />
              {errors.diagnosis && (
                <p className="text-red-500 text-sm mt-1">{errors.diagnosis}</p>
              )}
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
              {errors.medicines && !errors.medicines.startsWith("{") && (
                <p className="text-red-500 text-sm mb-2">{errors.medicines}</p>
              )}
              <div className="overflow-auto rounded-md border border-gray-200 shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-600">
                    <tr>
                      <th className="p-3">Item</th>
                      <th className="p-3">Medicine Name</th>
                      <th className="p-3">Duration</th>
                      <th className="p-3">Dosage</th>
                      <th className="p-3">Quantity</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    {medicines.length > 0 ? (
                      medicines.map((medicine, index) => {
                        const medicineErrors = errors[`medicines[${index}]`]
                          ? JSON.parse(errors[`medicines[${index}]`])
                          : {};

                        return (
                          <tr key={index} className="border-t hover:bg-gray-50">
                            <td className="p-3">{index + 1}</td>
                            <td className="p-3">
                              <input
                                type="text"
                                value={medicine.name}
                                onChange={(e) =>
                                  updateMedicine(index, "name", e.target.value)
                                }
                                className="w-full border-b border-gray-300 focus:outline-none"
                              />
                              {medicineErrors.name && (
                                <p className="text-red-500 text-xs">
                                  {medicineErrors.name}
                                </p>
                              )}
                            </td>
                            <td className="p-3">
                              <input
                                type="text"
                                value={medicine.instruction}
                                onChange={(e) =>
                                  updateMedicine(
                                    index,
                                    "instruction",
                                    e.target.value
                                  )
                                }
                                className="w-full border-b border-gray-300 focus:outline-none"
                              />
                              {medicineErrors.instruction && (
                                <p className="text-red-500 text-xs">
                                  {medicineErrors.instruction}
                                </p>
                              )}
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
                              />
                              {medicineErrors.dosage && (
                                <p className="text-red-500 text-xs">
                                  {medicineErrors.dosage}
                                </p>
                              )}
                            </td>
                            <td className="p-3">
                              <input
                                type="number"
                                value={medicine.quantity}
                                onChange={(e) =>
                                  updateMedicine(
                                    index,
                                    "quantity",
                                    parseInt(e.target.value) || 1
                                  )
                                }
                                className="w-full border-b border-gray-300 focus:outline-none"
                                min="1"
                              />
                              {medicineErrors.quantity && (
                                <p className="text-red-500 text-xs">
                                  {medicineErrors.quantity}
                                </p>
                              )}
                            </td>
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
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={8}
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
