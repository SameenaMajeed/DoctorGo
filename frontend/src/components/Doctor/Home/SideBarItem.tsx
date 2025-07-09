"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"

interface SidebarItemProps {
  href: string
  icon: React.ReactNode
  label: string
  collapsed: boolean
  active?: boolean
  onClick?: (e: React.MouseEvent) => void
  badge?: number
  children?: React.ReactNode
  isExpandable?: boolean
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  href,
  icon,
  label,
  collapsed,
  active = false,
  onClick,
  badge,
  // children,
  isExpandable = false,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false)

  const handleClick = (e: React.MouseEvent) => {
    if (isExpandable) {
      e.preventDefault()
      setIsExpanded(!isExpanded)
    }
    onClick?.(e)
  }

  return (
    <div className="relative group">
      <motion.div whileHover={{ x: collapsed ? 0 : 4 }} whileTap={{ scale: 0.98 }} className="relative">
        <Link
          to={href}
          onClick={handleClick}
          className={`
            flex items-center px-4 py-3 mx-2 rounded-xl transition-all duration-200 relative overflow-hidden
            ${
              active
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600"
            }
          `}
        >
          {/* Background glow effect for active item */}
          {active && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-xl blur-xl"
            />
          )}

          <div className="relative z-10 flex items-center w-full">
            <div
              className={`
                flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200
                ${
                  active
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                }
              `}
            >
              {icon}
            </div>

            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex items-center justify-between flex-1 ml-3"
                >
                  <span className="font-medium text-sm">{label}</span>
                  {badge && badge > 0 && (
                    <span
                      className={`
                        inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full
                        ${active ? "bg-white/20 text-white" : "bg-red-500 text-white"}
                      `}
                    >
                      {badge}
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Link>
      </motion.div>

      {/* Tooltip for collapsed state */}
      {collapsed && (
        <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          {label}
          {badge && badge > 0 && (
            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-red-500 text-white rounded-full">
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default SidebarItem


// import React from "react";
// import { Link } from "react-router-dom";

// interface SidebarItemProps {
//   href: string;
//   icon: React.ReactNode;
//   label: string;
//   active?: boolean;
//   collapsed?: boolean;
//   onClick?: (e: React.MouseEvent) => void;
// }

// const SidebarItem: React.FC<SidebarItemProps> = ({ href, icon, label, active = false, collapsed = false, onClick }) => {
//   return (
//     <Link
//       to={href}
//       onClick={onClick}
//       className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 
//         ${active ? "bg-green-100 text-green-600 font-semibold border-l-4 border-green-500 shadow-sm" 
//                 : "text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"} 
//         dark:text-gray-300`}
//     >
//       {icon}
//       {!collapsed && <span>{label}</span>} {/* ✅ Hide label when collapsed */}
//     </Link>
//   );
// };

// export default SidebarItem;
