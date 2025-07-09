import React from "react";

const TextArea = React.forwardRef(({ label, value, onChange, id, error, placeholder }: any) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
    <textarea
      // ref={ref}
      id={id}
      className={`mt-1 w-full border ${error ? "border-red-500" : "border-gray-300"} rounded-md p-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400`}
      rows={2}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      aria-label={label}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
));

export default TextArea;


// import React from "react";

// const TextArea = React.forwardRef(({ label, value, onChange, id, error }: any, ref) => (
//   <div>
//     <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
//     <textarea
//       // ref={ref}
//       id={id}
//       className={`mt-1 w-full border ${error ? "border-red-500" : "border-gray-300"} rounded-md p-2`}
//       rows={2}
//       value={value}
//       onChange={onChange}
//       aria-label={label}
//     />
//     {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
//   </div>
// ));

// export default TextArea;
