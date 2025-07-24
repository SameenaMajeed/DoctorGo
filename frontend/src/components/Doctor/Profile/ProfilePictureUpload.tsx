"use client"

import type React from "react"
import { useState, type ChangeEvent } from "react"
import { Camera, User } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ActionButton } from "../../CommonComponents/UI/ActionButton"

interface ProfilePictureUploadProps {
  currentPicture?: string | null // Allow null values
  onUpload: (file: File) => Promise<void>
  loading?: boolean
}

export const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentPicture,
  onUpload,
  loading = false,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    setSelectedFile(file)
    if (file) {
      const previewURL = URL.createObjectURL(file)
      setPreview(previewURL)
    }
  }

  const handleUpload = async () => {
    if (selectedFile) {
      await onUpload(selectedFile)
      setSelectedFile(null)
      setPreview(null)
    }
  }

  return (
    <div className="text-center">
      <div className="relative inline-block">
        <motion.div whileHover={{ scale: 1.05 }} className="relative w-32 h-32 mx-auto">
          {(currentPicture || preview) && currentPicture !== null ? (
            <img
              src={preview || currentPicture || ""}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-700 object-cover shadow-xl"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center border-4 border-white dark:border-slate-700 shadow-xl">
              <User size={48} className="text-white" />
            </div>
          )}
          <motion.label
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            htmlFor="file-upload"
            className="absolute bottom-2 right-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-full cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
          >
            <Camera size={16} />
          </motion.label>
          <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mt-4"
          >
            <ActionButton onClick={handleUpload} variant="success" loading={loading} className="max-w-xs">
              {loading ? "Uploading..." : "Upload Picture"}
            </ActionButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
