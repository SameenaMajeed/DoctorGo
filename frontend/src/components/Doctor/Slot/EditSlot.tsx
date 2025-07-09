"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useParams, useNavigate, Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import toast from "react-hot-toast"
import {
  Calendar,
  Clock,
  Users,
  Repeat,
  Save,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Loader2,
  CalendarDays,
  Timer,
  UserPlus,
  Settings,
  Info,
  Edit3,
  History,
} from "lucide-react"
import type { RootState } from "../../../slice/Store/Store"
import { setError } from "../../../slice/Doctor/doctorSlice"
import slotApi from "../../../Api/SlotApis"

const EditSlot: React.FC = () => {
  const dispatch = useDispatch()
  const { slotId } = useParams()
  const navigate = useNavigate()
  const { doctor, isAuthenticated, loading: reduxLoading } = useSelector((state: RootState) => state.doctor)

  // Form state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [endTime, setEndTime] = useState<Date | null>(null)
  const [isRecurring, setIsRecurring] = useState(false)
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">("weekly")
  const [recurringEndDate, setRecurringEndDate] = useState<Date | null>(null)
  const [maxPatients, setMaxPatients] = useState<number>(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [currentStep, setCurrentStep] = useState(1)
  const [originalData, setOriginalData] = useState<any>(null)

  useEffect(() => {
    const fetchSlotDetails = async () => {
      try {
        setIsFetching(true)
        const response = await slotApi.get(`/time-slots/edit/${slotId}`)
        const data = response.data.data
        console.log(data)

        // Store original data for comparison
        setOriginalData(data)

        const dateObj = new Date(data.date)
        const [startHour, startMinute] = data.startTime.split(":").map(Number)
        const [endHour, endMinute] = data.endTime.split(":").map(Number)

        setSelectedDate(dateObj)
        setStartTime(new Date(dateObj.setHours(startHour, startMinute)))
        setEndTime(new Date(new Date(data.date).setHours(endHour, endMinute)))
        setMaxPatients(data.maxPatients)

        if (data.recurring?.isRecurring) {
          setIsRecurring(true)
          setFrequency(data.recurring.frequency)
          setRecurringEndDate(data.recurring.endDate ? new Date(data.recurring.endDate) : null)
        }
      } catch (error: any) {
        console.error("Failed to fetch slot:", error)
        toast.error("Failed to load slot details.")
        navigate("/doctor/slots")
      } finally {
        setIsFetching(false)
      }
    }

    if (slotId) fetchSlotDetails()
  }, [slotId, navigate])

  if (!isAuthenticated || !doctor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-red-600 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in as a doctor to edit appointment slots.</p>
        </motion.div>
      </div>
    )
  }

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Loading Slot Details</h2>
          <p className="text-gray-600">Please wait while we fetch the appointment slot information...</p>
        </motion.div>
      </div>
    )
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (!selectedDate) {
      newErrors.selectedDate = "Date is required."
    } else if (selectedDate < today) {
      newErrors.selectedDate = "You cannot select a past date."
    }

    if (!startTime) newErrors.startTime = "Start time is required."
    if (!endTime) newErrors.endTime = "End time is required."

    if (startTime && endTime) {
      const start = startTime.getHours() * 60 + startTime.getMinutes()
      const end = endTime.getHours() * 60 + endTime.getMinutes()
      if (start >= end) {
        newErrors.endTime = "End time must be after start time."
      }
    }

    if (maxPatients < 1) newErrors.maxPatients = "At least 1 patient is required."

    if (isRecurring && recurringEndDate && selectedDate && recurringEndDate <= selectedDate) {
      newErrors.recurringEndDate = "Recurring end date must be after the start date."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // const formatTime = (date: Date | null) => {
  //   if (!date) return ""
  //   return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
  // }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    // const slotData = {
    //   doctorId: doctor._id || "",
    //   date: selectedDate?.toISOString().split("T")[0],
    //   startTime: formatTime(startTime),
    //   endTime: formatTime(endTime),
    //   maxPatients,
    //   ...(isRecurring && {
    //     recurring: {
    //       isRecurring: true,
    //       frequency,
    //       endDate: recurringEndDate?.toISOString().split("T")[0],
    //     },
    //   }),
    // }

    try {
      setIsLoading(true)
      // const response = await slotApi.put(`/time-slots/${slotId}`, slotData)
      toast.success("Slot updated successfully!")
      navigate("/doctor/slots")
    } catch (error: any) {
      console.error("Slot update error:", error)
      let errorMessage = error.response?.data?.message || error.message || "Failed to update slot."

      if (errorMessage.includes("overlaps")) {
        errorMessage = "Time slot overlaps with another. Choose a different time."
      }

      toast.error(errorMessage)
      dispatch(setError(errorMessage))

      // Update form errors if needed
      if (errorMessage.includes("time")) {
        setErrors((prev) => ({
          ...prev,
          startTime: errorMessage.includes("start") ? errorMessage : "",
          endTime: errorMessage.includes("end") ? errorMessage : "",
        }))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const steps = [
    { id: 1, title: "Date & Time", icon: Calendar },
    { id: 2, title: "Capacity", icon: Users },
    { id: 3, title: "Recurring", icon: Repeat },
    { id: 4, title: "Review", icon: CheckCircle },
  ]

  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Date Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Update Date</h3>
                  <p className="text-sm text-gray-600">Modify the date for your appointment slot</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Date</label>
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  dateFormat="MMMM d, yyyy"
                  placeholderText="Select a date"
                  className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  minDate={new Date()}
                />
                {errors.selectedDate && <p className="text-red-500 text-sm mt-2">{errors.selectedDate}</p>}
              </div>
            </div>

            {/* Time Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Timer className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Update Time</h3>
                  <p className="text-sm text-gray-600">Modify the start and end time for appointments</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
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
                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  {errors.startTime && <p className="text-red-500 text-sm mt-2">{errors.startTime}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
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
                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  {errors.endTime && <p className="text-red-500 text-sm mt-2">{errors.endTime}</p>}
                </div>
              </div>
            </div>
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Update Patient Capacity</h3>
                <p className="text-sm text-gray-600">Modify the maximum number of patients for this slot</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Patients</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={maxPatients}
                  onChange={(e) => setMaxPatients(Math.max(1, Number.parseInt(e.target.value) || 1))}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <Users className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              {errors.maxPatients && <p className="text-red-500 text-sm mt-2">{errors.maxPatients}</p>}

              {originalData && (
                <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="flex items-start gap-3">
                    <History className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-900">Original Capacity</p>
                      <p className="text-sm text-amber-700 mt-1">
                        Previously set to {originalData.maxPatients} patients. Current bookings:{" "}
                        {originalData.bookedCount || 0}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Update Recurring Options</h3>
                <p className="text-sm text-gray-600">Modify recurring appointment settings</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Repeat className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Make this a recurring slot</p>
                    <p className="text-sm text-gray-600">Create multiple slots with the same settings</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <AnimatePresence>
                {isRecurring && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                      <select
                        value={frequency}
                        onChange={(e) => setFrequency(e.target.value as "daily" | "weekly" | "monthly")}
                        className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Date (Optional)</label>
                      <DatePicker
                        selected={recurringEndDate}
                        onChange={(date: Date | null) => setRecurringEndDate(date)}
                        dateFormat="MMMM d, yyyy"
                        placeholderText="Select end date"
                        className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        minDate={selectedDate ? new Date(selectedDate.getTime() + 86400000) : new Date()}
                        disabled={isLoading || reduxLoading}
                      />
                      {errors.recurringEndDate && (
                        <p className="text-red-500 text-sm mt-2">{errors.recurringEndDate}</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Review Changes</h3>
                <p className="text-sm text-gray-600">Please review your updates before saving</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium text-gray-900">
                      {selectedDate
                        ? selectedDate.toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "Not selected"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="font-medium text-gray-900">
                      {startTime && endTime
                        ? `${startTime.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })} - ${endTime.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}`
                        : "Not selected"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Max Patients</p>
                    <p className="font-medium text-gray-900">{maxPatients} patients</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Repeat className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="text-sm text-gray-600">Recurring</p>
                    <p className="font-medium text-gray-900">
                      {isRecurring ? `${frequency.charAt(0).toUpperCase() + frequency.slice(1)}` : "No"}
                    </p>
                  </div>
                </div>
              </div>

              {isRecurring && recurringEndDate && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">Recurring until: {recurringEndDate.toLocaleDateString()}</p>
                </div>
              )}
            </div>

            {originalData && (
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Current Bookings</p>
                    <p className="text-sm text-blue-700 mt-1">
                      This slot currently has {originalData.bookedCount || 0} booking(s).
                      {originalData.bookedCount > 0 &&
                        " Please ensure changes don't conflict with existing appointments."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

      <div className="relative z-10 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl mb-4 shadow-lg">
              <Edit3 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-3">
              Edit Appointment Slot
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Update your appointment slot details with flexible scheduling options
            </p>
          </motion.div>

          {/* Progress Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20 shadow-lg"
          >
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const StepIcon = step.icon
                const isActive = currentStep === step.id
                const isCompleted = currentStep > step.id

                return (
                  <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isCompleted
                            ? "bg-green-500 text-white"
                            : isActive
                              ? "bg-amber-500 text-white"
                              : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {isCompleted ? <CheckCircle className="w-6 h-6" /> : <StepIcon className="w-6 h-6" />}
                      </div>
                      <span
                        className={`text-sm font-medium mt-2 ${
                          isActive ? "text-amber-600" : isCompleted ? "text-green-600" : "text-gray-500"
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`flex-1 h-1 mx-4 rounded-full transition-all duration-300 ${
                          isCompleted ? "bg-green-500" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Form Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg overflow-hidden"
          >
            <form onSubmit={handleSubmit}>
              <div className="p-8">
                <AnimatePresence mode="wait">{getStepContent()}</AnimatePresence>
              </div>

              {/* Navigation */}
              <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Link
                    to="/doctor/slots"
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Slots
                  </Link>
                </div>

                <div className="flex items-center gap-3">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="px-6 py-3 text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl transition-colors"
                    >
                      Previous
                    </button>
                  )}

                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(currentStep + 1)}
                      className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl"
                    >
                      Next Step
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isLoading || reduxLoading}
                      className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading || reduxLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Update Slot
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default EditSlot



// import React, { useState, useEffect } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { useParams, useNavigate } from "react-router-dom";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import toast from "react-hot-toast";
// import { RootState } from "../../../slice/Store/Store";
// import { setError } from "../../../slice/Doctor/doctorSlice";
// import slotApi from "../../../Api/SlotApis";

// const EditSlot: React.FC = () => {
//   const dispatch = useDispatch();
//   const { slotId } = useParams();
//   const navigate = useNavigate();
//   console.log('slotId :',slotId)

//   const { doctor, isAuthenticated, loading: reduxLoading } = useSelector(
//     (state: RootState) => state.doctor
//   );

//   const [selectedDate, setSelectedDate] = useState<Date | null>(null);
//   const [startTime, setStartTime] = useState<Date | null>(null);
//   const [endTime, setEndTime] = useState<Date | null>(null);
//   const [isRecurring, setIsRecurring] = useState(false);
//   const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">("weekly");
//   const [recurringEndDate, setRecurringEndDate] = useState<Date | null>(null);
//   const [maxPatients, setMaxPatients] = useState<number>(1);
//   const [isLoading, setIsLoading] = useState(false);
//   const [errors, setErrors] = useState<{ [key: string]: string }>({});

//   useEffect(() => {
//     const fetchSlotDetails = async () => {
//       try {
//         const response = await slotApi.get(`/time-slots/edit/${slotId}`);
//         const data = response.data.data;
//         console.log(data)

//         const dateObj = new Date(data.date);
//         const [startHour, startMinute] = data.startTime.split(":").map(Number);
//         const [endHour, endMinute] = data.endTime.split(":").map(Number);

//         setSelectedDate(dateObj);
//         setStartTime(new Date(dateObj.setHours(startHour, startMinute)));
//         setEndTime(new Date(new Date(data.date).setHours(endHour, endMinute)));
//         setMaxPatients(data.maxPatients);

//         if (data.recurring?.isRecurring) {
//           setIsRecurring(true);
//           setFrequency(data.recurring.frequency);
//           setRecurringEndDate(data.recurring.endDate ? new Date(data.recurring.endDate) : null);
//         }
//       } catch (error: any) {
//         console.error("Failed to fetch slot:", error);
//         toast.error("Failed to load slot details.");
//       }
//     };

//     if (slotId) fetchSlotDetails();
//   }, [slotId]);

//   if (!isAuthenticated || !doctor) {
//     return (
//       <div className="max-w-lg mx-auto my-10 p-6 bg-white rounded-xl shadow-md text-center">
//         <h2 className="text-2xl font-semibold text-red-600">
//           Please log in as a doctor to edit slots.
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
//       const start = startTime.getHours() * 60 + startTime.getMinutes();
//       const end = endTime.getHours() * 60 + endTime.getMinutes();
//       if (start >= end) {
//         newErrors.endTime = "End time must be after start time.";
//       }
//     }

//     if (maxPatients < 1) newErrors.maxPatients = "At least 1 patient is required.";

//     if (isRecurring && recurringEndDate && selectedDate && recurringEndDate <= selectedDate) {
//       newErrors.recurringEndDate = "Recurring end date must be after the start date.";
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
//       doctorId: doctor._id || "",
//       date: selectedDate?.toISOString().split("T")[0],
//       startTime: formatTime(startTime),
//       endTime: formatTime(endTime),
//       maxPatients,
//       ...(isRecurring && {
//         recurring: {
//           isRecurring: true,
//           frequency,
//           endDate: recurringEndDate?.toISOString().split("T")[0],
//         },
//       }),
//     };

//     try {
//       setIsLoading(true);
//       const response = await slotApi.put(`/time-slots/${slotId}`, slotData);

//       toast.success("Slot updated successfully!");
//       navigate("/doctor/slots");
//     } catch (error: any) {
//       console.error("Slot update error:", error);
//       let errorMessage =
//         error.response?.data?.message ||
//         error.message ||
//         "Failed to update slot.";

//       if (errorMessage.includes("overlaps")) {
//         errorMessage = "Time slot overlaps with another. Choose a different time.";
//       }

//       toast.error(errorMessage);
//       dispatch(setError(errorMessage));
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-lg mx-auto my-10 p-6 bg-white rounded-xl shadow-md">
//       <h2 className="text-2xl font-semibold text-teal-700 text-center mb-6">
//         Edit Appointment Slot
//       </h2>
//       <form onSubmit={handleSubmit} className="space-y-6">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
//           <DatePicker
//             selected={selectedDate}
//             onChange={setSelectedDate}
//             dateFormat="MMMM d, yyyy"
//             className="w-full p-2 border border-gray-300 rounded-md"
//             minDate={new Date()}
//           />
//           {errors.selectedDate && <p className="text-red-500 text-sm">{errors.selectedDate}</p>}
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
//           <DatePicker
//             selected={startTime}
//             onChange={setStartTime}
//             showTimeSelect
//             showTimeSelectOnly
//             timeIntervals={15}
//             dateFormat="h:mm aa"
//             className="w-full p-2 border border-gray-300 rounded-md"
//           />
//           {errors.startTime && <p className="text-red-500 text-sm">{errors.startTime}</p>}
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
//           <DatePicker
//             selected={endTime}
//             onChange={setEndTime}
//             showTimeSelect
//             showTimeSelectOnly
//             timeIntervals={15}
//             dateFormat="h:mm aa"
//             className="w-full p-2 border border-gray-300 rounded-md"
//           />
//           {errors.endTime && <p className="text-red-500 text-sm">{errors.endTime}</p>}
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Max Patients</label>
//           <input
//             type="number"
//             min="1"
//             value={maxPatients}
//             onChange={(e) => setMaxPatients(Math.max(1, parseInt(e.target.value) || 1))}
//             className="w-full p-2 border border-gray-300 rounded-md"
//           />
//           {errors.maxPatients && <p className="text-red-500 text-sm">{errors.maxPatients}</p>}
//         </div>

//         <div className="flex items-center">
//           <input
//             type="checkbox"
//             checked={isRecurring}
//             onChange={(e) => setIsRecurring(e.target.checked)}
//             className="h-4 w-4 text-teal-600"
//           />
//           <label className="ml-2 text-sm font-medium text-gray-700">Recurring Slot</label>
//         </div>

//         {isRecurring && (
//           <>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
//               <select
//                 value={frequency}
//                 onChange={(e) => setFrequency(e.target.value as "daily" | "weekly" | "monthly")}
//                 className="w-full p-2 border border-gray-300 rounded-md"
//               >
//                 <option value="daily">Daily</option>
//                 <option value="weekly">Weekly</option>
//                 <option value="monthly">Monthly</option>
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
//               <DatePicker
//                 selected={recurringEndDate}
//                 onChange={(date) => setRecurringEndDate(date)}
//                 dateFormat="MMMM d, yyyy"
//                 minDate={selectedDate ? new Date(selectedDate.getTime() + 86400000) : new Date()}
//                 className="w-full p-2 border border-gray-300 rounded-md"
//               />
//               {errors.recurringEndDate && (
//                 <p className="text-red-500 text-sm">{errors.recurringEndDate}</p>
//               )}
//             </div>
//           </>
//         )}

//         <button
//           type="submit"
//           disabled={isLoading || reduxLoading}
//           className="w-full py-3 px-4 bg-teal-600 text-white font-semibold rounded-md hover:bg-teal-700 disabled:opacity-50"
//         >
//           {isLoading || reduxLoading ? "Updating..." : "Update Slot"}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default EditSlot;
