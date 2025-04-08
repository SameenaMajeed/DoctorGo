import React from "react";
import { Link } from "react-router-dom";

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ href, icon, label, active = false, collapsed = false, onClick }) => {
  return (
    <Link
      to={href}
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 
        ${active ? "bg-green-100 text-green-600 font-semibold border-l-4 border-green-500 shadow-sm" 
                : "text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"} 
        dark:text-gray-300`}
    >
      {icon}
      {!collapsed && <span>{label}</span>} {/* ✅ Hide label when collapsed */}
    </Link>
  );
};

export default SidebarItem;
