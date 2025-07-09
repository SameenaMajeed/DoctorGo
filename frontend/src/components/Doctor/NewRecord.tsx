"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Trash2,
  Upload,
  X,
  Save,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Stethoscope,
  // FileText,
  Pill,
  Activity,
  AlertCircle,
  // CheckCircle,
  Camera,
  Loader2,
} from "lucide-react"
import { Card, CardContent } from "../CommonComponents/card"
import { Button } from "../CommonComponents/Button"
import TextArea from "../CommonComponents/TextArea"
import { useLocation, useNavigate } from "react-router-dom"
import type { IUser } from "../../types/auth"
import type { IAppointment } from "../../Types"
import { useSelector } from "react-redux"
import type { RootState } from "../../slice/Store/Store"
import doctorApi from "../../axios/DoctorInstance"
import toast from "react-hot-toast"

interface IMedicine {
  name: string
  dosage: string
  instruction: string
  quantity: number
}

interface FormErrors {
  [key: string]: string
}

const NewRecord: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { doctor, isAuthenticated } = useSelector((state: RootState) => state.doctor)
  const { patient, appointment } = location.state as {
    patient: IUser
    appointment: IAppointment
  }

  const [complaints, setComplaints] = useState("")
  const [diagnosis, setDiagnosis] = useState("")
  const [vitalSigns, setVitalSigns] = useState("")
  const [medicines, setMedicines] = useState<IMedicine[]>([])
  const [attachments, setAttachments] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  // const [currentStep, setCurrentStep] = useState(1)

  const validationForm = (
    complaints: string,
    diagnosis: string,
    // vitalSigns: string,
    medicines: IMedicine[],
    // attachments: string[],
  ): FormErrors => {
    const newErrors: FormErrors = {}

    if (!complaints || !complaints.trim()) {
      newErrors.complaints = "Complaints are required"
    } else if (complaints.trim().length < 5) {
      newErrors.complaints = "Complaints must be at least 5 characters"
    }

    if (!diagnosis || !diagnosis.trim()) {
      newErrors.diagnosis = "Diagnosis is required"
    } else if (diagnosis.trim().length < 10) {
      newErrors.diagnosis = "Diagnosis must be at least 10 characters"
    }

    if (medicines.length === 0) {
      newErrors.medicines = "At least one medicine is required"
    } else {
      medicines.forEach((medicine, index) => {
        const medicineErrors: { [key: string]: string } = {}

        if (!medicine.name || !medicine.name.trim()) {
          medicineErrors.name = "Medicine name is required"
        } else if (medicine.name.trim().length < 2) {
          medicineErrors.name = "Medicine name must be at least 2 characters"
        }

        if (!medicine.dosage || !medicine.dosage.trim()) {
          medicineErrors.dosage = "Dosage is required"
        } else if (medicine.dosage.trim().length < 2) {
          medicineErrors.dosage = "Dosage must be at least 2 characters"
        }

        if (!medicine.instruction || !medicine.instruction.trim()) {
          medicineErrors.instruction = "Instruction is required"
        } else if (medicine.instruction.trim().length < 2) {
          medicineErrors.instruction = "Instruction must be at least 2 characters"
        }

        if (medicine.quantity < 1) {
          medicineErrors.quantity = "Quantity must be at least 1"
        }

        if (Object.keys(medicineErrors).length > 0) {
          newErrors[`medicines[${index}]`] = JSON.stringify(medicineErrors)
        }
      })
    }

    return newErrors
  }

  if (!isAuthenticated || !doctor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-lg p-8 text-center bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-red-600 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in as a doctor to create medical records.</p>
        </Card>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationErrors = validationForm(complaints, diagnosis, medicines)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setIsLoading(true)
    try {
      const prescriptionData = {
        doctorId: doctor._id,
        userId: patient._id,
        appointmentId: appointment._id,
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
      }

      const response = await doctorApi.post("/createPrescription", prescriptionData)
      console.log("Prescription created:", response.data)
      toast.success("Medical record created successfully!")
      navigate(`/doctor/patient-records/${patient._id}`, {
        state: { patient, appointment },
      })
    } catch (error) {
      console.error("Error creating prescription:", error)
      toast.error("Failed to create medical record")
    } finally {
      setIsLoading(false)
    }
  }

  const addMedicine = () => {
    setMedicines([
      ...medicines,
      {
        name: "",
        dosage: "",
        instruction: "",
        quantity: 1,
      },
    ])
  }

  const removeMedicine = (index: number) => {
    const updatedMedicines = [...medicines]
    updatedMedicines.splice(index, 1)
    setMedicines(updatedMedicines)
    const updatedErrors = { ...errors }
    delete updatedErrors[`medicines[${index}]`]
    setErrors(updatedErrors)
  }

  const updateMedicine = (index: number, field: keyof IMedicine, value: any) => {
    const updatedMedicines = [...medicines]
    updatedMedicines[index] = {
      ...updatedMedicines[index],
      [field]: value,
    }
    setMedicines(updatedMedicines)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      const newAttachments = files.map((file) => URL.createObjectURL(file))
      setAttachments([...attachments, ...newAttachments])
    }
  }

  const removeAttachment = (index: number) => {
    const updatedAttachments = [...attachments]
    updatedAttachments.splice(index, 1)
    setAttachments(updatedAttachments)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  New Medical Record
                </h1>
                <p className="text-gray-600 mt-2">Create a comprehensive medical record for {patient.name}</p>
              </div>
              <Button
                variant="outline"
                onClick={() =>
                  navigate(`/doctor/patient-records/${patient._id}`, {
                    state: { patient, appointment },
                  })
                }
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Records
              </Button>
            </div>

          </motion.div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Enhanced Patient Sidebar */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
                <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl overflow-hidden sticky top-6">
                  {/* Patient Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                    <div className="text-center">
                      <div className="relative inline-block">
                        <img
                          src={patient.profilePicture || "/placeholder.svg?height=80&width=80"}
                          alt="Profile"
                          className="w-20 h-20 rounded-full mx-auto border-4 border-white shadow-lg object-cover"
                        />
                        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white" />
                      </div>
                      <h3 className="mt-3 text-lg font-bold">{patient.name}</h3>
                      <p className="text-blue-100 text-sm">Patient ID: #{patient._id?.slice(-6)}</p>
                    </div>
                  </div>

                  {/* Patient Details */}
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Mail className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                          <p className="text-sm font-medium text-gray-900">{patient.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <Phone className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
                          <p className="text-sm font-medium text-gray-900">{patient.mobile_no}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <User className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Age & Gender</p>
                          <p className="text-sm font-medium text-gray-900">
                            {patient.age} years • {patient.gender}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Doctor Info */}
                    <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Attending Doctor</p>
                      <p className="text-sm font-semibold text-gray-900">{doctor.name}</p>
                      <p className="text-xs text-gray-600">{doctor.specialization}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Enhanced Form Section */}
              <div className="lg:col-span-3 space-y-8">
                {/* Complaints Section */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Chief Complaints</h3>
                          <p className="text-sm text-gray-600">Patient's primary symptoms and concerns</p>
                        </div>
                      </div>
                      <TextArea
                        id="complaints"
                        label=""
                        value={complaints}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComplaints(e.target.value)}
                        placeholder="Describe the patient's main complaints and symptoms..."
                        className="min-h-[120px]"
                      />
                      {errors.complaints && <p className="text-red-500 text-sm mt-2">{errors.complaints}</p>}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Diagnosis Section */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Stethoscope className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Diagnosis</h3>
                          <p className="text-sm text-gray-600">Medical diagnosis and assessment</p>
                        </div>
                      </div>
                      <TextArea
                        id="diagnosis"
                        label=""
                        value={diagnosis}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDiagnosis(e.target.value)}
                        placeholder="Provide detailed diagnosis and medical assessment..."
                        className="min-h-[120px]"
                      />
                      {errors.diagnosis && <p className="text-red-500 text-sm mt-2">{errors.diagnosis}</p>}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Vital Signs Section */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Activity className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Vital Signs</h3>
                          <p className="text-sm text-gray-600">Patient's vital signs and measurements</p>
                        </div>
                      </div>
                      <TextArea
                        id="vitalSigns"
                        label=""
                        value={vitalSigns}
                        onChange={(e: any) => setVitalSigns(e.target.value)}
                        placeholder="Record vital signs: blood pressure, pulse, temperature, etc..."
                        className="min-h-[100px]"
                      />
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Enhanced Medicine Section */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Pill className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Prescribed Medicines</h3>
                            <p className="text-sm text-gray-600">Add medications and dosage instructions</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          onClick={addMedicine}
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Medicine
                        </Button>
                      </div>

                      {errors.medicines && !errors.medicines.startsWith("{") && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-red-600 text-sm">{errors.medicines}</p>
                        </div>
                      )}

                      <div className="space-y-4">
                        <AnimatePresence>
                          {medicines.map((medicine, index) => {
                            const medicineErrors = errors[`medicines[${index}]`]
                              ? JSON.parse(errors[`medicines[${index}]`])
                              : {}

                            return (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                              >
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="font-medium text-gray-900">Medicine #{index + 1}</h4>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => removeMedicine(index)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Medicine Name
                                    </label>
                                    <input
                                      type="text"
                                      value={medicine.name}
                                      onChange={(e) => updateMedicine(index, "name", e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      placeholder="Enter medicine name"
                                    />
                                    {medicineErrors.name && (
                                      <p className="text-red-500 text-xs mt-1">{medicineErrors.name}</p>
                                    )}
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Dosage</label>
                                    <input
                                      type="text"
                                      value={medicine.dosage}
                                      onChange={(e) => updateMedicine(index, "dosage", e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      placeholder="e.g., 500mg"
                                    />
                                    {medicineErrors.dosage && (
                                      <p className="text-red-500 text-xs mt-1">{medicineErrors.dosage}</p>
                                    )}
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
                                    <input
                                      type="text"
                                      value={medicine.instruction}
                                      onChange={(e) => updateMedicine(index, "instruction", e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      placeholder="e.g., After meals"
                                    />
                                    {medicineErrors.instruction && (
                                      <p className="text-red-500 text-xs mt-1">{medicineErrors.instruction}</p>
                                    )}
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                                    <input
                                      type="number"
                                      value={medicine.quantity}
                                      onChange={(e) =>
                                        updateMedicine(index, "quantity", Number.parseInt(e.target.value) || 1)
                                      }
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      min="1"
                                      placeholder="1"
                                    />
                                    {medicineErrors.quantity && (
                                      <p className="text-red-500 text-xs mt-1">{medicineErrors.quantity}</p>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            )
                          })}
                        </AnimatePresence>

                        {medicines.length === 0 && (
                          <div className="text-center py-12 text-gray-500">
                            <Pill className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-medium mb-2">No medicines added yet</p>
                            <p className="text-sm">Click "Add Medicine" to start prescribing medications</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Enhanced Attachments Section */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                  <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <Camera className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Medical Attachments</h3>
                          <p className="text-sm text-gray-600">
                            Upload test reports, X-rays, or other medical documents
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        <AnimatePresence>
                          {attachments.map((img, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="relative group aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-sm"
                            >
                              <img
                                src={img || "/placeholder.svg"}
                                alt={`Attachment ${index}`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  onClick={() => removeAttachment(index)}
                                  className="text-white hover:text-red-300 hover:bg-red-500/20"
                                >
                                  <X className="w-5 h-5" />
                                </Button>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>

                        {/* Upload Area */}
                        <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 bg-gray-50 rounded-xl text-center cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition-colors">
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="text-xs text-gray-500 font-medium">Upload Image</p>
                          <p className="text-xs text-gray-400">JPEG, PNG</p>
                          <input
                            type="file"
                            multiple
                            accept="image/jpeg, image/png"
                            className="hidden"
                            onChange={handleFileUpload}
                          />
                        </label>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Submit Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex justify-end"
                >
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Saving Record...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Save Medical Record
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default NewRecord


// import React, { useState } from "react";
// import { Card, CardContent } from "../CommonComponents/card";
// import { Button } from "../CommonComponents/Button";
// import TextArea from "../CommonComponents/TextArea";
// import { Plus, Trash2 } from "lucide-react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { IUser } from "../../types/auth";
// import { IAppointment } from "../../Types";
// import { useSelector } from "react-redux";
// import { RootState } from "../../slice/Store/Store";
// import doctorApi from "../../axios/DoctorInstance";
// import toast from "react-hot-toast";

// interface IMedicine {
//   name: string;
//   dosage: string;
//   instruction: string;
//   quantity: number;
// }

// interface FormErrors {
//   [key: string]: string;
// }

// const NewRecord: React.FC = () => {
//   const [complaints, setComplaints] = useState("");
//   const [diagnosis, setDiagnosis] = useState("");
//   const [vitalSigns, setVitalSigns] = useState("");
//   const [medicines, setMedicines] = useState<IMedicine[]>([]);
//   const [attachments, setAttachments] = useState<string[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [errors, setErrors] = useState<{ [key: string]: string }>({});

//   const validationForm = (
//     complaints: string,
//     diagnosis: string,
//     vitalSigns: string,
//     medicines: IMedicine[],
//     attachments: string[]
//   ): FormErrors => {
//     const newErrors: FormErrors = {};

//     // Validate complaints
//     if (!complaints || !complaints.trim()) {
//       newErrors.complaints = "Complaints are required";
//     } else if (complaints.trim().length < 5) {
//       newErrors.complaints = "Complaints must be at least 5 characters";
//     }

//     // Validate diagnosis
//     if (!diagnosis || !diagnosis.trim()) {
//       newErrors.diagnosis = "Diagnosis is required";
//     } else if (diagnosis.trim().length < 10) {
//       newErrors.diagnosis = "Diagnosis must be at least 10 characters";
//     }

//     // Validate medicines
//     if (medicines.length === 0) {
//       newErrors.medicines = "At least one medicine is required";
//     } else {
//       medicines.forEach((medicine, index) => {
//         const medicineErrors: { [key: string]: string } = {};

//         // Validate medicine name
//         if (!medicine.name || !medicine.name.trim()) {
//           medicineErrors.name = "Medicine name is required";
//         } else if (medicine.name.trim().length < 2) {
//           medicineErrors.name = "Medicine name must be at least 2 characters";
//         }

//         // Validate dosage
//         if (!medicine.dosage || !medicine.dosage.trim()) {
//           medicineErrors.dosage = "Dosage is required";
//         } else if (medicine.dosage.trim().length < 2) {
//           medicineErrors.dosage = "Dosage must be at least 2 characters";
//         }

//         // Validate instruction
//         if (!medicine.instruction || !medicine.instruction.trim()) {
//           medicineErrors.instruction = "Instruction is required";
//         } else if (medicine.instruction.trim().length < 2) {
//           medicineErrors.instruction =
//             "Instruction must be at least 2 characters";
//         }

//         // Validate quantity
//         if (medicine.quantity < 1) {
//           medicineErrors.quantity = "Quantity must be at least 1";
//         }

//         // If there are errors for this medicine, add them to newErrors with the index
//         if (Object.keys(medicineErrors).length > 0) {
//           newErrors[`medicines[${index}]`] = JSON.stringify(medicineErrors);
//         }
//       });
//     }

//     return newErrors;
//   };

//   const {
//     doctor,
//     isAuthenticated,
//     // loading: reduxLoading,
//   } = useSelector((state: RootState) => state.doctor);
//   console.log("doctor data fetched:", doctor);

//   if (!isAuthenticated || !doctor) {
//     return (
//       <div className="max-w-lg mx-auto my-10 p-6 bg-white rounded-xl shadow-md text-center">
//         <h2 className="text-2xl font-semibold text-red-600">
//           Please log in as a doctor to create slots.
//         </h2>
//       </div>
//     );
//   }

//   const navigate = useNavigate();

//   // const doctor = useSelector((state: RootState) => state.doctor);

//   const location = useLocation();
//   const { patient, appointment } = location.state as {
//     patient: IUser;
//     appointment: IAppointment;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     // Validate the form
//     const validationErrors = validationForm(
//       complaints,
//       diagnosis,
//       vitalSigns,
//       medicines,
//       attachments
//     );
//     setErrors(validationErrors);

//     // If there are errors, stop submission
//     if (Object.keys(validationErrors).length > 0) {
//       return;
//     }

//     setIsLoading(true);

//     try {
//       // Prepare the data according to your backend model
//       const prescriptionData = {
//         doctorId: doctor._id,
//         userId: patient._id,
//         appointmentId:appointment._id,
//         symptoms: complaints,
//         disease: diagnosis,
//         vitalSigns: vitalSigns,
//         medicines: medicines.map((med) => ({
//           name: med.name,
//           dosage: med.dosage,
//           quantity: med.quantity,
//           time_gap: med.instruction,
//         })),
//         testReports: attachments.map((img) => ({ img })),
//         // You'll need to add userId and doctorId from your auth context
//       };

//       const response = await doctorApi.post(
//         "/createPrescription",
//         prescriptionData
//       );

//       // Handle success
//       console.log("Prescription created:", response.data);
//       toast.success("Prescription created successfully");
//       navigate(`/doctor/patient-records/${patient._id}`, {
//         state: {
//           patient,
//           appointment,
//         },
//       });
//     } catch (error) {
//       console.error("Error creating prescription:", error);
//       // Handle error (show error message to user)
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const addMedicine = () => {
//     setMedicines([
//       ...medicines,
//       {
//         name: "",
//         dosage: "",
//         instruction: "",
//         quantity: 1,
//       },
//     ]);
//   };

//   // const removeMedicine = (index: number) => {
//   //   const updatedMedicines = [...medicines];
//   //   updatedMedicines.splice(index, 1);
//   //   setMedicines(updatedMedicines);
//   // };

//   const removeMedicine = (index: number) => {
//     const updatedMedicines = [...medicines];
//     updatedMedicines.splice(index, 1);
//     setMedicines(updatedMedicines);

//     const updatedErrors = { ...errors };
//     delete updatedErrors[`medicines[${index}]`];
//     setErrors(updatedErrors);
//   };

//   const updateMedicine = (
//     index: number,
//     field: keyof IMedicine,
//     value: any
//   ) => {
//     const updatedMedicines = [...medicines];
//     updatedMedicines[index] = {
//       ...updatedMedicines[index],
//       [field]: value,
//     };

//     setMedicines(updatedMedicines);

//     const validationErrors = validationForm(
//       complaints,
//       diagnosis,
//       vitalSigns,
//       updatedMedicines,
//       attachments
//     );
//     setErrors(validationErrors);
//   };

//   // const updateMedicine = (index: number, field: keyof Medicine, value: any) => {
//   //   const updatedMedicines = [...medicines];
//   //   updatedMedicines[index] = {
//   //     ...updatedMedicines[index],
//   //     [field]: value,
//   //   };

//   //   // Calculate amount if price or quantity changes
//   //   if (field === "price" || field === "quantity") {
//   //     updatedMedicines[index].amount =
//   //       updatedMedicines[index].price * updatedMedicines[index].quantity;
//   //   }

//   //   setMedicines(updatedMedicines);
//   // };

//   const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       const files = Array.from(e.target.files);
//       const newAttachments = files.map((file) => URL.createObjectURL(file));
//       setAttachments([...attachments, ...newAttachments]);
//     }
//   };

//   return (
//     <div className="p-6 max-w-7xl mx-auto">
//       <h2 className="text-3xl font-bold mb-8 text-gray-800">
//         New Medical Record
//       </h2>
//       <form onSubmit={handleSubmit}>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//           {/* Sidebar Card (unchanged) */}

//           <div>
//             <Card className="items-center text-center p-6 shadow-md border border-gray-200">
//               <img
//                 src={patient.profilePicture || "/profile-placeholder.png"}
//                 alt="Profile"
//                 width={120}
//                 height={120}
//                 className="rounded-full mx-auto shadow-sm"
//               />
//               <p className="mt-4 text-lg font-semibold">{patient.name}</p>
//               <p className="text-sm text-gray-600">{patient.email}</p>
//               <p className="text-sm text-gray-600">{patient.mobile_no}</p>
//               <span className="inline-block bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm mt-3">
//                 Age : {patient.age}
//               </span>
//               <div>
//                 <Button
//                   variant="outline"
//                   className="w-full mt-4 bg-white hover:bg-gray-100 text-blue-600 border-blue-600 hover:border-blue-700 transition duration-200"
//                   onClick={() =>
//                     navigate(`/doctor/patient-records/${patient._id}`, {
//                       state: {
//                         patient,
//                         appointment,
//                       },
//                     })
//                   }
//                 >
//                   Back
//                 </Button>
//               </div>
//             </Card>
//           </div>

//           {/* Form Section */}
//           <div className="md:col-span-2 space-y-6">
//             {/* Doctor Name */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Doctor Name
//               </label>
//               <input
//                 type="text"
//                 defaultValue={doctor.name}
//                 className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-green-400"
//                 readOnly
//               />
//             </div>

//             {/* Complaints */}
//             <div>
//               <TextArea
//                 id="complaints"
//                 label="Complaints"
//                 value={complaints}
//                 onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
//                   setComplaints(e.target.value)
//                 }
//                 placeholder="Complaints (e.g. Bad breath, toothache...)"
//               />
//               {errors.complaints && (
//                 <p className="text-red-500 text-sm mt-1">{errors.complaints}</p>
//               )}
//             </div>

//             {/* Diagnosis */}
//             <div>
//               <TextArea
//                 id="diagnosis"
//                 label="Diagnosis"
//                 value={diagnosis}
//                 onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
//                   setDiagnosis(e.target.value)
//                 }
//                 placeholder="Diagnosis (e.g. Gingivitis, Periodontitis...)"
//               />
//               {errors.diagnosis && (
//                 <p className="text-red-500 text-sm mt-1">{errors.diagnosis}</p>
//               )}
//             </div>

//             {/* Vital Signs */}
//             <div>
//               <TextArea
//                 id="vitalSigns"
//                 label="Vital Signs"
//                 value={vitalSigns}
//                 onChange={(e: any) => setVitalSigns(e.target.value)}
//                 placeholder="Vital Signs (e.g. Blood pressure, Pulse...)"
//               />
//             </div>

//             {/* Medicine Table */}
//             <div>
//               <h3 className="text-lg font-semibold text-gray-700 mb-3">
//                 Prescribed Medicines
//               </h3>
//               {errors.medicines && !errors.medicines.startsWith("{") && (
//                 <p className="text-red-500 text-sm mb-2">{errors.medicines}</p>
//               )}
//               <div className="overflow-auto rounded-md border border-gray-200 shadow-sm">
//                 <table className="w-full text-sm text-left">
//                   <thead className="bg-gray-100 text-gray-600">
//                     <tr>
//                       <th className="p-3">Item</th>
//                       <th className="p-3">Medicine Name</th>
//                       <th className="p-3">Duration</th>
//                       <th className="p-3">Dosage</th>
//                       <th className="p-3">Quantity</th>
//                       <th className="p-3">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody className="text-gray-700">
//                     {medicines.length > 0 ? (
//                       medicines.map((medicine, index) => {
//                         const medicineErrors = errors[`medicines[${index}]`]
//                           ? JSON.parse(errors[`medicines[${index}]`])
//                           : {};

//                         return (
//                           <tr key={index} className="border-t hover:bg-gray-50">
//                             <td className="p-3">{index + 1}</td>
//                             <td className="p-3">
//                               <input
//                                 type="text"
//                                 value={medicine.name}
//                                 onChange={(e) =>
//                                   updateMedicine(index, "name", e.target.value)
//                                 }
//                                 className="w-full border-b border-gray-300 focus:outline-none"
//                               />
//                               {medicineErrors.name && (
//                                 <p className="text-red-500 text-xs">
//                                   {medicineErrors.name}
//                                 </p>
//                               )}
//                             </td>
//                             <td className="p-3">
//                               <input
//                                 type="text"
//                                 value={medicine.instruction}
//                                 onChange={(e) =>
//                                   updateMedicine(
//                                     index,
//                                     "instruction",
//                                     e.target.value
//                                   )
//                                 }
//                                 className="w-full border-b border-gray-300 focus:outline-none"
//                               />
//                               {medicineErrors.instruction && (
//                                 <p className="text-red-500 text-xs">
//                                   {medicineErrors.instruction}
//                                 </p>
//                               )}
//                             </td>
//                             <td className="p-3">
//                               <input
//                                 type="text"
//                                 value={medicine.dosage}
//                                 onChange={(e) =>
//                                   updateMedicine(
//                                     index,
//                                     "dosage",
//                                     e.target.value
//                                   )
//                                 }
//                                 className="w-full border-b border-gray-300 focus:outline-none"
//                               />
//                               {medicineErrors.dosage && (
//                                 <p className="text-red-500 text-xs">
//                                   {medicineErrors.dosage}
//                                 </p>
//                               )}
//                             </td>
//                             <td className="p-3">
//                               <input
//                                 type="number"
//                                 value={medicine.quantity}
//                                 onChange={(e) =>
//                                   updateMedicine(
//                                     index,
//                                     "quantity",
//                                     parseInt(e.target.value) || 1
//                                   )
//                                 }
//                                 className="w-full border-b border-gray-300 focus:outline-none"
//                                 min="1"
//                               />
//                               {medicineErrors.quantity && (
//                                 <p className="text-red-500 text-xs">
//                                   {medicineErrors.quantity}
//                                 </p>
//                               )}
//                             </td>
//                             <td className="p-3">
//                               <Button
//                                 variant="ghost"
//                                 type="button"
//                                 onClick={() => removeMedicine(index)}
//                               >
//                                 <Trash2 className="w-4 h-4 text-red-500" />
//                               </Button>
//                             </td>
//                           </tr>
//                         );
//                       })
//                     ) : (
//                       <tr>
//                         <td
//                           colSpan={8}
//                           className="p-3 text-center text-gray-500"
//                         >
//                           No medicines added
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//               <Button
//                 variant="outline"
//                 className="mt-3 flex items-center"
//                 type="button"
//                 onClick={addMedicine}
//               >
//                 <Plus className="w-4 h-4 mr-2" /> Add Medicine
//               </Button>
//             </div>

//             {/* Attachments */}
//             <div className="mt-6">
//               <h3 className="text-lg font-semibold text-gray-700 mb-3">
//                 Attachments
//               </h3>
//               <div className="grid grid-cols-5 gap-3">
//                 {attachments.map((img, id) => (
//                   <div
//                     key={id}
//                     className="h-32 bg-gray-100 rounded-md relative shadow-sm flex items-center justify-center"
//                   >
//                     <img
//                       src={img}
//                       alt={`Attachment ${id}`}
//                       className="h-full w-full object-cover rounded-md"
//                     />
//                     <button
//                       className="absolute top-1 right-1 text-red-500 text-lg font-bold"
//                       type="button"
//                       onClick={() => {
//                         const updatedAttachments = [...attachments];
//                         updatedAttachments.splice(id, 1);
//                         setAttachments(updatedAttachments);
//                       }}
//                     >
//                       ×
//                     </button>
//                   </div>
//                 ))}
//                 <label
//                   htmlFor="file-upload"
//                   className="col-span-2 h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-400 bg-white rounded-md text-center p-2 text-sm text-gray-500 cursor-pointer hover:bg-gray-50"
//                 >
//                   <p>Drag your image here or click to browse</p>
//                   <p className="text-xs text-gray-400">
//                     (Only *.jpeg and *.png images will be accepted)
//                   </p>
//                   <input
//                     id="file-upload"
//                     type="file"
//                     multiple
//                     accept="image/jpeg, image/png"
//                     className="hidden"
//                     onChange={handleFileUpload}
//                   />
//                 </label>
//               </div>
//             </div>

//             {/* Save Button */}
//             <Button
//               className="mt-8 w-full py-3 text-base"
//               type="submit"
//               disabled={isLoading}
//             >
//               {isLoading ? "Saving..." : "Save Medical Record"}
//             </Button>
//           </div>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default NewRecord;
