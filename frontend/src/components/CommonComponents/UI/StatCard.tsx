"use client"

import type React from "react"

interface StatCardProps {
  icon: React.ReactNode
  value: string | number
  label: string
  bgColor: string
  textColor: string
}

export const StatCard: React.FC<StatCardProps> = ({ icon, value, label, bgColor, textColor }) => {
  return (
    <div className={`${bgColor} rounded-2xl p-4`}>
      <div className="flex items-center justify-center mb-2">{icon}</div>
      <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
      <p className="text-xs text-gray-600 dark:text-gray-400">{label}</p>
    </div>
  )
}
