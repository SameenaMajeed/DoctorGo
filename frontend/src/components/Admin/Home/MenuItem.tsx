import React from "react"
import { Link } from "react-router-dom"

interface MenuItemProps {
  icon: React.ReactNode
  label: string
  to: string
  isCollapsed: boolean
  isActive: boolean
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, to, isCollapsed, isActive }) => {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 transition-all duration-200 ${
        isCollapsed ? "justify-center p-3 rounded-xl" : "px-4 py-3 rounded-xl"
      } ${
        isActive
          ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
      } hover:shadow-md group cursor-pointer`}
    >
      {React.cloneElement(icon as React.ReactElement, {
        className: `transition-colors duration-200 ${
          isActive ? "text-white" : "text-slate-600 group-hover:text-slate-800"
        }`,
      })}
      {!isCollapsed && <span className="font-medium">{label}</span>}
    </Link>
  )
}

export default MenuItem
