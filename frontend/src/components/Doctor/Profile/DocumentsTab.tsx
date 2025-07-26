"use client"

import React, { useState, ChangeEvent } from "react"
import { Upload, File, Award, Download, Trash2 } from "lucide-react"
// import { motion } from "framer-motion"
import toast from "react-hot-toast"
import { ActionButton } from "../../CommonComponents/UI/ActionButton"

interface Certificate {
  url: string
  name: string
  uploadedAt?: string
}

interface DocumentsTabProps {
  certificate: Certificate | null
  onUpload: (file: File) => Promise<void>
  onDelete: () => Promise<void>
  uploading?: boolean
}

export const DocumentsTab: React.FC<DocumentsTabProps> = ({
  certificate,
  onUpload,
  onDelete,
  uploading = false,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    if (file) {
      // Validate file type
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload PDF, JPEG, or PNG files only")
        return
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB")
        return
      }
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (selectedFile) {
      await onUpload(selectedFile)
      setSelectedFile(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Medical Certificate
        </h4>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label
              htmlFor="certificate-upload"
              className="flex-1 flex items-center justify-center gap-2 p-4 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-xl cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
            >
              <File className="w-5 h-5 text-blue-500" />
              <span className="text-blue-600 dark:text-blue-400">
                {selectedFile ? selectedFile.name : "Choose new certificate file"}
              </span>
            </label>
            <input
              id="certificate-upload"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {selectedFile && (
            <ActionButton 
              onClick={handleUpload} 
              variant="success" 
              loading={uploading} 
              icon={<Upload size={18} />}
            >
              {uploading ? "Uploading..." : "Update Certificate"}
            </ActionButton>
          )}

          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>Supported formats: PDF, JPEG, PNG (Max 5MB)</p>
          </div>
        </div>
      </div>

      {/* Current Certificate Display */}
      {certificate && (
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Current Certificate
          </h4>
          <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <File className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Medical Certificate</p>
                  {certificate.uploadedAt && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Uploaded on {new Date(certificate.uploadedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a 
                  href={certificate.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  title="View Certificate"
                >
                  <Download size={16} />
                </a>
                <button
                  onClick={onDelete}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  title="Delete Certificate"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


// "use client"

// import type React from "react"
// import { useState, type ChangeEvent } from "react"
// import { Upload, File, Award, Download, Trash2 } from "lucide-react"
// import { motion, AnimatePresence } from "framer-motion"
// import toast from "react-hot-toast"
// import { ActionButton } from "../../CommonComponents/UI/ActionButton"


// interface Certificate {
//   _id: string;
//   name: string;
//   url: string;
//   uploadedAt: string;
//   type: string;
// }


// interface DocumentsTabProps {
//   certificate: Certificate | null; 
//   onUpload: (file: File) => Promise<void>
//   onDelete: () => Promise<void>
//   onDownload: (url: string, name: string) => void
//   uploading?: boolean
// }

// export const DocumentsTab: React.FC<DocumentsTabProps> = ({
//   certificate,
//   onUpload,
//   onDelete,
//   onDownload,
//   uploading = false,
// }) => {
//   const [selectedFile, setSelectedFile] = useState<File | null>(null)

//   const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0] || null
//     if (file) {
//       // Validate file type
//       const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
//       if (!allowedTypes.includes(file.type)) {
//         toast.error("Please upload PDF, JPEG, or PNG files only")
//         return
//       }
//       // Validate file size (5MB max)
//       if (file.size > 5 * 1024 * 1024) {
//         toast.error("File size should be less than 5MB")
//         return
//       }
//       setSelectedFile(file)
//     }
//   }

//   const handleUpload = async () => {
//     if (selectedFile) {
//       await onUpload(selectedFile)
//       setSelectedFile(null)
//     }
//   }

//   return (
//     <motion.div
//       key="documents"
//       initial={{ opacity: 0, x: 20 }}
//       animate={{ opacity: 1, x: 0 }}
//       exit={{ opacity: 0, x: -20 }}
//       className="space-y-6"
//     >
//       {/* Upload Section */}
//       <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6">
//         <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
//           <Upload className="w-5 h-5" />
//           Upload Medical Certificates
//         </h4>
//        {!certificate ? (
//           <div className="text-center py-8 text-gray-500 dark:text-gray-400">
//             <File size={48} className="mx-auto mb-4 opacity-50" />
//             <p>No certificate uploaded yet</p>
//           </div>
//         ) : (
//           <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
//             <div className="flex items-center gap-3">
//               <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
//                 <File className="w-5 h-5 text-blue-600 dark:text-blue-400" />
//               </div>
//               <div>
//                 <p className="font-medium text-gray-900 dark:text-white">{certificate.name}</p>
//                 <p className="text-sm text-gray-500 dark:text-gray-400">
//                   Uploaded on {new Date(certificate.uploadedAt).toLocaleDateString()}
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-center gap-2">
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={() => onDownload(certificate.url, certificate.name)}
//                 className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
//                 title="Download"
//               >
//                 <Download size={16} />
//               </motion.button>
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={onDelete}
//                 className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
//                 title="Delete"
//               >
//                 <Trash2 size={16} />
//               </motion.button>
//             </div>
//           </div>
//         )}
//       </div>
//     </motion.div>
//   )
// }
