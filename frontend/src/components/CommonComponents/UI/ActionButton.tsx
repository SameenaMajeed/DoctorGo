"use client"

import type React from "react"
import { motion } from "framer-motion"

interface ActionButtonProps {
  onClick?: () => void
  type?: "button" | "submit"
  variant?: "primary" | "secondary" | "success" | "danger"
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  loading = false,
  icon,
  children,
  className = "",
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "primary":
        return "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
      case "secondary":
        return "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
      case "success":
        return "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
      case "danger":
        return "bg-gradient-to-r from-red-500 to-red-600 text-white"
      default:
        return "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
    }
  }

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      type={type}
      disabled={disabled || loading}
      className={`w-full py-3 px-4 font-medium rounded-xl shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed ${getVariantClasses()} ${className}`}
    >
      <div className="flex items-center justify-center gap-2">
        {loading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          icon
        )}
        {children}
      </div>
    </motion.button>
  )
}
