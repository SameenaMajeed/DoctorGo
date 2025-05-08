import React from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface IMenuItemProps {
  icon: React.ReactNode;
  label: string;
  to?: string;
  onClick?: () => void;
}

const MenuItem: React.FC<IMenuItemProps> = ({ icon, label, to, onClick }) => {
  const content = (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-2 cursor-pointer hover:bg-blue-50 rounded-md transition-all"
    >
      <div className="flex items-center space-x-3">
        <span className="text-blue-600">{icon}</span>
        <span className="text-gray-700">{label}</span>
      </div>
      <ChevronRight size={16} className="text-blue-500" />
    </div>
  );

  return to ? <Link to={to}>{content}</Link> : content;
};

export default MenuItem;
