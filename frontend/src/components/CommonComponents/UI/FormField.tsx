"use client"

import type React from "react"
import { Controller, type Control } from "react-hook-form"
import { motion } from "framer-motion"

interface FormFieldProps {
  name: string
  control: Control<any>
  label: string
  icon?: React.ReactNode
  type?: "text" | "email" | "number" | "textarea"
  placeholder?: string
  disabled?: boolean
  error?: any
  rows?: number
  className?: string
}

export const FormField: React.FC<FormFieldProps> = ({
  name,
  control,
  label,
  icon,
  type = "text",
  placeholder,
  disabled = false,
  error,
  rows = 4,
  className = "",
}) => {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {icon && <span className="inline-block w-4 h-4 mr-2">{icon}</span>}
        {label}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const baseClasses =
            "w-full p-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"

          if (type === "textarea") {
            return (
              <textarea
                {...field}
                className={`${baseClasses} resize-none`}
                placeholder={placeholder}
                disabled={disabled}
                rows={rows}
              />
            )
          }

          return <input {...field} type={type} className={baseClasses} placeholder={placeholder} disabled={disabled} />
        }}
      />
      {error && (
        <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-sm mt-1">
          {error.message || error}
        </motion.p>
      )}
    </div>
  )
}
