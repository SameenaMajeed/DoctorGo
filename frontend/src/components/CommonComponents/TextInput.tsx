import React from "react";

const TextInput = React.forwardRef(({ label, value, onChange, type = "text", id }: any , ref)  => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      id={id}
      type={type}
      className="mt-1 w-full border border-gray-300 rounded-md p-2"
      value={value}
      onChange={onChange}
      aria-label={label}
    />
  </div>
));

export default TextInput;