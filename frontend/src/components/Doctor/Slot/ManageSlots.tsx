"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  PlusCircle,
  Edit,
  Trash2,
  Search,
  Filter,
  Calendar,
  Clock,
  Users,
  RefreshCw,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react"
import { useSelector } from "react-redux"
import type { RootState } from "../../../slice/Store/Store"
// import slotApi from "../../../Api/SlotApis"
import toast from "react-hot-toast"
import useFetchData from "../../../Hooks/useFetchData"
import Pagination from "../../../Pagination/Pagination"
import type { ISlot } from "../../../types/Slot"
import { createApiInstance } from "../../../axios/apiService"

const slotApi = createApiInstance("slot");

const ManageSlots: React.FC = () => {
  const [slots, setSlots] = useState<ISlot[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedSlots, setSelectedSlots] = useState<string[]>([])
  const [refreshing, setRefreshing] = useState(false)
  // const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const limit = 5

  const doctor = useSelector((state: RootState) => state.doctor.doctor)

  const fetchSlots = async () => {
    try {
      const response = await slotApi.get(`/time-slots/${doctor?._id}`, {
        params: { page, limit, searchTerm, _: new Date().getTime() },
      })

      if (response.data.data) {
        const currentDate = new Date().toISOString().split('T')[0];
      const currentTime = new Date().toTimeString().split(' ')[0].substring(0, 5);
      
      const filteredSlots = response.data.data.slots.filter((slot: ISlot) => {
        const slotDate = new Date(slot.date).toISOString().split('T')[0];
        return slotDate > currentDate || 
               (slotDate === currentDate && slot.startTime >= currentTime);
      });

        setSlots(filteredSlots || [])
        setTotalPages(Math.ceil(response.data.data.total / limit))
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch slots")
    }
  }

  const fetchDoctorCallback = useCallback(fetchSlots, [page, searchTerm])
  const { loading} = useFetchData(fetchDoctorCallback)

  useEffect(() => {
    if (doctor?._id) {
      fetchSlots()
    }
  }, [doctor?._id, page, searchTerm])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchSlots()
    setRefreshing(false)
    toast.success("Slots refreshed successfully")
  }

  const handleDelete = async (slotId: string) => {
    if (window.confirm("Are you sure you want to delete this slot?")) {
      try {
        await slotApi.delete(`/time-slots/${slotId}`)
        toast.success("Slot deleted successfully")
        fetchSlots()
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to delete slot")
      }
    }
  }

  const handleBulkDelete = async () => {
    if (selectedSlots.length === 0) {
      toast.error("No slots selected")
      return
    }

    if (window.confirm(`Are you sure you want to delete ${selectedSlots.length} selected slots?`)) {
      try {
        await Promise.all(selectedSlots.map((slotId) => slotApi.delete(`/time-slots/${slotId}`)))
        toast.success(`${selectedSlots.length} slots deleted successfully`)
        setSelectedSlots([])
        fetchSlots()
      } catch (error: any) {
        toast.error("Failed to delete some slots")
      }
    }
  }

  const handleSelectSlot = (slotId: string) => {
    setSelectedSlots((prev) => (prev.includes(slotId) ? prev.filter((id) => id !== slotId) : [...prev, slotId]))
  }

  const handleSelectAll = () => {
    if (selectedSlots.length === filteredSlots.length) {
      setSelectedSlots([])
    } else {
      setSelectedSlots(filteredSlots.map((slot) => slot._id))
    }
  }

  const getSlotStatus = (slot: ISlot) => {
    if (slot.isBlocked) return "blocked"
    if (slot.bookedCount >= slot.maxPatients) return "booked"
    if (slot.bookedCount > 0) return "partially-booked"
    return "available"
  }

  const getStatusConfig = (status: string) => {
    const configs = {
      available: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
        label: "Available",
      },
      "partially-booked": {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: AlertCircle,
        label: "Partially Booked",
      },
      booked: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: Users,
        label: "Fully Booked",
      },
      blocked: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle,
        label: "Blocked",
      },
    }
    return configs[status as keyof typeof configs] || configs.available
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "Invalid Date"
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Invalid Date"
    }
  }

  const formatTimeString = (timeString: string) => {
    if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeString)) {
      const [hours, minutes] = timeString.split(":").map(Number)
      const period = hours >= 12 ? "PM" : "AM"
      const hours12 = hours % 12 || 12
      return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`
    }

    try {
      const date = new Date(timeString)
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      }
    } catch (error) {
      console.error("Error formatting time:", error)
    }

    return "Invalid Time"
  }

  const filteredSlots = slots.filter((slot) => {
    const status = getSlotStatus(slot)
    const slotDate = formatDate(slot.date)
    const startTime = formatTimeString(slot.startTime)
    const endTime = formatTimeString(slot.endTime)

    return (
      (searchTerm === "" ||
        slotDate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        startTime.toLowerCase().includes(searchTerm.toLowerCase()) ||
        endTime.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filter === "all" || status === filter)
    )
  })

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }

  const getSlotStats = () => {
    return {
      total: slots.length,
      available: slots.filter((slot) => getSlotStatus(slot) === "available").length,
      booked: slots.filter((slot) => getSlotStatus(slot) === "booked").length,
      blocked: slots.filter((slot) => getSlotStatus(slot) === "blocked").length,
    }
  }

  const stats = getSlotStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

      <div className="relative z-10 p-6 space-y-8">
        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-3">
            Manage Appointment Slots
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create, edit, and manage your appointment time slots efficiently
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Slots</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-3xl font-bold text-green-600">{stats.available}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Booked</p>
                <p className="text-3xl font-bold text-blue-600">{stats.booked}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Blocked</p>
                <p className="text-3xl font-bold text-red-600">{stats.blocked}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </motion.div>
        </div>

        {/* Controls Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Left side - Search and Filters */}
            <div className="flex flex-1 gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search slots by date or time..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                <Filter className="w-5 h-5" />
                Filters
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </button>

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[160px]"
              >
                <option value="all">All Slots</option>
                <option value="available">Available</option>
                <option value="partially-booked">Partially Booked</option>
                <option value="booked">Fully Booked</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>

              {selectedSlots.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete Selected ({selectedSlots.length})
                </button>
              )}

              <Link
                to="/doctor/slots/create"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                <PlusCircle className="w-5 h-5" />
                Create New Slot
              </Link>
            </div>
          </div>

          {/* Expandable Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input
                    type="date"
                    className="px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="From Date"
                  />
                  <input
                    type="date"
                    className="px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="To Date"
                  />
                  <select className="px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">All Times</option>
                    <option value="morning">Morning (6AM - 12PM)</option>
                    <option value="afternoon">Afternoon (12PM - 6PM)</option>
                    <option value="evening">Evening (6PM - 10PM)</option>
                  </select>
                  <button
                    onClick={() => {
                      setSearchTerm("")
                      setFilter("all")
                      setShowFilters(false)
                    }}
                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Content Section */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
              <p className="text-gray-600 font-medium">Loading slots...</p>
            </motion.div>
          ) : filteredSlots.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No slots found</h3>
              <p className="text-gray-600 mb-6">Create new slots to get started with appointment management</p>
              <Link
                to="/doctor/slots/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                <PlusCircle className="w-5 h-5" />
                Create Your First Slot
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg overflow-hidden"
            >
              {/* Table Container */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  {/* Table Header */}
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedSlots.length === filteredSlots.length && filteredSlots.length > 0}
                            onChange={handleSelectAll}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm font-semibold text-gray-700">Select</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-semibold text-gray-700">Date</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-semibold text-gray-700">Time</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <span className="text-sm font-semibold text-gray-700">Status</span>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-semibold text-gray-700">Patients</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <span className="text-sm font-semibold text-gray-700">Progress</span>
                      </th>
                      <th className="px-6 py-4 text-center">
                        <span className="text-sm font-semibold text-gray-700">Actions</span>
                      </th>
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody className="divide-y divide-gray-100">
                    {filteredSlots.map((slot, index) => {
                      const status = getSlotStatus(slot)
                      const statusConfig = getStatusConfig(status)
                      const StatusIcon = statusConfig.icon
                      const progressPercentage = (slot.bookedCount / slot.maxPatients) * 100

                      return (
                        <motion.tr
                          key={slot._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-blue-50/50 transition-all duration-200 group"
                        >
                          {/* Select Checkbox */}
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedSlots.includes(slot._id)}
                              onChange={() => handleSelectSlot(slot._id)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                          </td>

                          {/* Date */}
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                              {formatDate(slot.date)}
                            </div>
                            <div className="text-sm text-gray-500">Appointment Slot</div>
                          </td>

                          {/* Time */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="font-medium text-gray-700">
                                {formatTimeString(slot.startTime)} - {formatTimeString(slot.endTime)}
                              </span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            <div
                              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${statusConfig.color}`}
                            >
                              <StatusIcon className="w-4 h-4" />
                              {statusConfig.label}
                            </div>
                          </td>

                          {/* Patients Count */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                                  <Users className="w-4 h-4 text-green-600" />
                                </div>
                                <span className="font-semibold text-gray-900">
                                  {slot.bookedCount}/{slot.maxPatients}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Progress Bar */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[80px]">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${progressPercentage}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-600 min-w-[40px]">
                                {Math.round(progressPercentage)}%
                              </span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <Link
                                to={`/doctor/time-slots/${slot._id}`}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                                Edit
                              </Link>
                              <button
                                onClick={() => handleDelete(slot._id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bulk Actions Footer */}
              {selectedSlots.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-blue-50 border-t border-blue-100 px-6 py-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-blue-900">
                        {selectedSlots.length} slot{selectedSlots.length > 1 ? "s" : ""} selected
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedSlots([])}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors"
                      >
                        Clear Selection
                      </button>
                      <button
                        onClick={handleBulkDelete}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                      >
                        Delete Selected
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default ManageSlots



// import React, { useState, useEffect, useCallback } from "react";
// import { Link } from "react-router-dom";
// import { PlusCircle, Edit, Trash2, Search } from "lucide-react";
// import { useSelector } from "react-redux";
// import { RootState } from "../../../slice/Store/Store";
// import slotApi from "../../../Api/SlotApis";
// import toast from "react-hot-toast";
// import useFetchData from "../../../Hooks/useFetchData";
// import Pagination from "../../../Pagination/Pagination";
// import { ISlot } from "../../../types/Slot";

// const ManageSlots: React.FC = () => {
//   const [slots, setSlots] = useState<ISlot[]>([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filter, setFilter] = useState("all");
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const limit = 6;

//   const doctor = useSelector((state: RootState) => state.doctor.doctor);

//   const fetchSlots = async () => {
//     try {
//       const response = await slotApi.get(`/time-slots/${doctor?._id}`, {
//         params: { page, limit, searchTerm, _: new Date().getTime() },
//       });
//       console.log('slots',response.data.data)
  
//       if (response.data.data) {
//         setSlots(response.data.data.slots || []);
//         setTotalPages(Math.ceil(response.data.data.total / limit));
//       }
//     } catch (error: any) {
//       toast.error(error.response?.data?.message || "Failed to fetch slots");
//     }
//   };

//   const fetchDoctorCallback = useCallback(fetchSlots, [page, searchTerm]);

//   const { data, loading, error, refetch } = useFetchData(fetchDoctorCallback);

//   useEffect(() => {
//     if (doctor?._id) {
//       fetchSlots();
//     }
//   }, [doctor?._id, page, searchTerm]); 

//   const handleDelete = async (slotId: string) => {
//     if (window.confirm("Are you sure you want to delete this slot?")) {
//       try {
//         await slotApi.delete(`/time-slots/${slotId}`);
//         toast.success("Slot deleted successfully");
//         fetchSlots();
//       } catch (error: any) {
//         toast.error(error.response?.data?.message || "Failed to delete slot");
//       }
//     }
//   };

//   const getSlotStatus = (slot: ISlot) => {
//     if (slot.isBlocked) return "blocked";
//     if (slot.bookedCount >= slot.maxPatients) return "booked";
//     if (slot.bookedCount > 0) return "partially-booked";
//     return "available";
//   };

//   const getStatusColor = (status: string) => {
//     const colors: Record<string, string> = {
//       available: "bg-green-100 text-green-700",
//       "partially-booked": "bg-yellow-100 text-yellow-700",
//       booked: "bg-blue-100 text-blue-700",
//       blocked: "bg-red-100 text-red-700",
//     };
//     return colors[status] || "bg-gray-100 text-gray-700";
//   };

//   const formatDate = (dateString: string) => {
//     try {
//       const date = new Date(dateString);
//       if (isNaN(date.getTime())) return "Invalid Date";
//       return date.toLocaleDateString("en-US", {
//         year: "numeric",
//         month: "long",
//         day: "numeric",
//       });
//     } catch (error) {
//       console.error("Error formatting date:", error);
//       return "Invalid Date";
//     }
//   };

//   const formatTimeString = (timeString: string) => {
//     // Handle HH:mm format
//     if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeString)) {
//       const [hours, minutes] = timeString.split(':').map(Number);
//       const period = hours >= 12 ? 'PM' : 'AM';
//       const hours12 = hours % 12 || 12;
//       return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
//     }
    
//     // Handle ISO date string format (legacy)
//     try {
//       const date = new Date(timeString);
//       if (!isNaN(date.getTime())) {
//         return date.toLocaleTimeString("en-US", {
//           hour: "2-digit",
//           minute: "2-digit",
//         });
//       }
//     } catch (error) {
//       console.error("Error formatting time:", error);
//     }
    
//     return "Invalid Time";
//   };

//   const filteredSlots = slots.filter((slot) => {
//     const status = getSlotStatus(slot);
//     const slotDate = formatDate(slot.date);
//     const startTime = formatTimeString(slot.startTime);
//     const endTime = formatTimeString(slot.endTime);
    
//     return (
//       (searchTerm === "" ||
//         slotDate.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         startTime.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         endTime.toLowerCase().includes(searchTerm.toLowerCase())) &&
//       (filter === "all" || status === filter)
//     );
//   });

//   const handlePageChange = (newPage: number) => {
//     if (newPage >= 1 && newPage <= totalPages) {
//       setPage(newPage);
//     }
//   };

//   return (
//     <div className="p-6">
//       <div className="bg-white rounded-lg shadow-md p-6">
//         <div className="flex flex-col md:flex-row justify-between items-center mb-4">
//           <h1 className="text-2xl font-bold text-gray-800">
//             Manage Appointment Slots
//           </h1>
//           <Link
//             to="/doctor/slots/create"
//             className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
//           >
//             <PlusCircle size={20} className="mr-2" />
//             Create New Slot
//           </Link>
//         </div>

//         <div className="flex flex-col md:flex-row gap-4 mb-4">
//           <div className="relative flex-1">
//             <Search
//               className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//               size={20}
//             />
//             <input
//               type="text"
//               placeholder="Search slots by date or time..."
//               className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-green-300"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </div>
//           <select
//             className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-300"
//             value={filter}
//             onChange={(e) => setFilter(e.target.value)}
//           >
//             <option value="all">All Slots</option>
//             <option value="available">Available</option>
//             <option value="partially-booked">Partially Booked</option>
//             <option value="booked">Fully Booked</option>
//             <option value="blocked">Blocked</option>
//           </select>
//         </div>

//         {loading ? (
//           <div className="text-center py-8">Loading slots...</div>
//         ) : filteredSlots.length === 0 ? (
//           <div className="text-center py-8 text-gray-500">
//             No slots found. Create new slots to get started.
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full border-collapse border rounded-lg">
//               <thead className="bg-gray-100">
//                 <tr>
//                   <th className="border p-3 text-left">Date</th>
//                   <th className="border p-3 text-left">Time</th>
//                   <th className="border p-3 text-left">Status</th>
//                   <th className="border p-3 text-left">Booked</th>
//                   <th className="border p-3 text-left">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredSlots.map((slot) => (
//                   <tr key={slot._id} className="hover:bg-gray-50">
//                     <td className="border p-3">{formatDate(slot.date)}</td>
//                     <td className="border p-3">
//                       {formatTimeString(slot.startTime)} - {formatTimeString(slot.endTime)}
//                     </td>
//                     <td className={`border p-3 ${getStatusColor(getSlotStatus(slot))}`}>
//                       {getSlotStatus(slot)}
//                     </td>
//                     <td className="border p-3">
//                       {slot.bookedCount}/{slot.maxPatients}
//                     </td>
//                     <td className="border p-3">
//                       <Link
//                         to={`/doctor/time-slots/${slot._id}`}
//                         className="text-blue-600"
//                       >
//                         Edit
//                       </Link>
//                       <button
//                         onClick={() => handleDelete(slot._id)}
//                         className="text-red-600 ml-3"
//                       >
//                         Delete
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//       {totalPages > 1 && (
//         <div className="mt-6 flex justify-center">
//           <Pagination
//             currentPage={page}
//             totalPages={totalPages}
//             onPageChange={handlePageChange}
//           />
//         </div>
//       )}
//     </div>
//   );
// };

// export default ManageSlots;