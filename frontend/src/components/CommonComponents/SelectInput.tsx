import React from "react";

const SelectInput =  React.forwardRef(({ label, value, onChange, options, id }: any,ref) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
    <select
      id={id}
      className="mt-1 w-full border border-gray-300 rounded-md p-2"
      value={value}
      onChange={onChange}
      aria-label={label}
    >
      {options.map((opt: string) => (
        <option key={opt}>{opt}</option>
      ))}
    </select>
  </div>
))

export default SelectInput;