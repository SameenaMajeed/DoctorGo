import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input: React.FC<InputProps> = ({ label, className, ...props }) => {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <input
        {...props}
        className={`rounded-md border px-3 py-2 text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none ${className}`}
      />
    </div>
  );
};

export default Input;
