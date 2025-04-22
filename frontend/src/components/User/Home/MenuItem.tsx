// MenuItem.tsx
import React from "react";
import { NavLink } from "react-router-dom";

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  className?: string;  // Add this
  isActive?: boolean; // Add this
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  label,
  to,
  className = "",
  isActive = false,
}) => {
  return (
    <NavLink
      to={to}
      className={({ isActive: navIsActive }) => 
        `flex items-center rounded-lg hover:bg-gray-100 transition ${className} ${
          (isActive || navIsActive) ? "bg-blue-50 text-blue-600" : "text-gray-700"
        }`
      }
    >
      <span className="flex items-center justify-center w-6">{icon}</span>
      {label && <span className="ml-3">{label}</span>}
    </NavLink>
  );
};

export default MenuItem;