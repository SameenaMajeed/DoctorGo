"use client"

import React from "react"
import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"

interface Tab {
  id: string
  label: string
  icon: LucideIcon
}

interface TabNavigationProps {
  tabs: readonly Tab[] 
  activeTab: string
  onTabChange: (tabId: string) => void
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="border-b border-gray-200 dark:border-slate-700">
      <div className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <Icon size={18} />
              <span className="hidden sm:inline">{tab.label}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
