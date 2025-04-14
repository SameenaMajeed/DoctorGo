import React from "react";

const TextInput = React.forwardRef(({ label, value, onChange, type = "text", id, error }: any, ref) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      // ref={ref}
      id={id}
      type={type}
      className={`mt-1 w-full border ${error ? "border-red-500" : "border-gray-300"} rounded-md p-2`}
      value={value}
      onChange={onChange}
      aria-label={label}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
));

export default TextInput;
