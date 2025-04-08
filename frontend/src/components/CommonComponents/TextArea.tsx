// components/TextArea.tsx
import React from "react";

const TextArea = ({ label, value, onChange, id }: any) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
    <textarea
      id={id}
      className="mt-1 w-full border border-gray-300 rounded-md p-2"
      rows={2}
      value={value}
      onChange={onChange}
      aria-label={label}
    />
  </div>
);

export default TextArea;