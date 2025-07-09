import type React from "react"
import { Link } from "react-router-dom"

interface MenuItemProps {
  icon: React.ReactNode
  label: string
  to: string
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, to }) => {
  return (
    <Link to={to} className="flex items-center w-full text-inherit no-underline">
      <span className="flex items-center justify-center">{icon}</span>
      {label && <span className="ml-3 font-medium text-sm truncate">{label}</span>}
    </Link>
  )
}

export default MenuItem

// import React from "react";
// import { ChevronRight } from "lucide-react";
// import { Link } from "react-router-dom";

// interface IMenuItemProps {
//   icon: React.ReactNode;
//   label: string;
//   to?: string;
//   onClick?: () => void;
//   isActive?: boolean; // ✅ Add this line
// }


// const MenuItem: React.FC<IMenuItemProps> = ({ icon, label, to, onClick, isActive }) => {
//   const content = (
//     <div
//       onClick={onClick}
//       className={`flex items-center justify-between p-2 cursor-pointer rounded-md transition-all
//         ${isActive ? 'bg-blue-100 text-blue-700' : 'hover:bg-blue-50'}`}
//     >
//       <div className="flex items-center space-x-3">
//         <span className="text-blue-600">{icon}</span>
//         <span className="text-gray-700">{label}</span>
//       </div>
//       <ChevronRight size={16} className="text-blue-500" />
//     </div>
//   );

//   return to ? <Link to={to}>{content}</Link> : content;
// };


// export default MenuItem;
