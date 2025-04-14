import React from "react";

const SelectInput = React.forwardRef(({ label, value, onChange, options, id, error }: any, ref) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
    <select
      // ref={ref}
      id={id}
      className={`mt-1 w-full border ${error ? "border-red-500" : "border-gray-300"} rounded-md p-2`}
      value={value}
      onChange={onChange}
      aria-label={label}
    >
      {options.map((opt: string) => (
        <option key={opt}>{opt}</option>
      ))}
    </select>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
));

export default SelectInput;
