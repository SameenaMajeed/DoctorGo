"use client"

import type React from "react"

interface DataTableProps {
  columns: string[]
  data: any[]
  actions?: (item: any) => React.ReactNode
}

const DataTable: React.FC<DataTableProps> = ({ columns, data, actions }) => {
  const formatColumnName = (column: string) => {
    return column
      .split(/(?=[A-Z])/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const renderCellContent = (item: any, column: string) => {
    const value = item[column]

    if (column === "verificationStatus") {
      return (
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            value === "approved"
              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
              : value === "rejected"
                ? "bg-red-100 text-red-800 border border-red-200"
                : "bg-amber-100 text-amber-800 border border-amber-200"
          }`}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full mr-2 ${
              value === "approved" ? "bg-emerald-500" : value === "rejected" ? "bg-red-500" : "bg-amber-500"
            }`}
          />
          {value}
        </span>
      )
    }

    if (column === "email") {
      return <span className="text-blue-600 hover:text-blue-800 transition-colors duration-200">{value}</span>
    }

    if (column === "name") {
      return (
        <div className="flex items-center">
          {/* <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
            {value?.charAt(0)?.toUpperCase() || "?"}
          </div> */}
          <span className="font-medium text-gray-900">{value}</span>
        </div>
      )
    }

    return <span className="text-gray-700">{value}</span>
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
        <p className="text-gray-500">There are no records to display at this time.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  {formatColumnName(column)}
                </th>
              ))}
              {actions && (
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors duration-200 group">
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                    {renderCellContent(item, column)}
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">{actions(item)}</div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer with Row Count */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium">{data.length}</span> {data.length === 1 ? "result" : "results"}
          </p>
        </div>
      </div>
    </div>
  )
}

export default DataTable




// import React from "react";

// interface DataTableProps {
//   columns: string[];
//   data: any[];
//   actions?: (item: any) => React.ReactNode;
// }

// const DataTable: React.FC<DataTableProps> = ({ columns, data, actions }) => {
//   return (
//     <table className="w-full border-collapse border border-gray-300">
//       <thead>
//         <tr>
//           {columns.map((column, index) => (
//             <th key={index} className="p-2 border border-gray-300 bg-gray-200">
//               {column}
//             </th>
//           ))}
//           {actions && (
//             <th className="p-2 border border-gray-300 bg-gray-200">Actions</th>
//           )}
//         </tr>
//       </thead>
//       <tbody>
//         {data.map((item, index) => (
//           <tr key={index} className="hover:bg-gray-100">
//             {columns.map((column, colIndex) => (
//               <td key={colIndex} className="p-2 border border-gray-300">
//                 {column === "verificationStatus" ? (
//                   <span
//                     className={`px-2 py-1 rounded-full text-sm font-semibold ${
//                       item[column] === "approved"
//                         ? "bg-green-100 text-green-800"
//                         : item[column] === "rejected"
//                         ? "bg-red-100 text-red-800"
//                         : "bg-yellow-100 text-yellow-800"
//                     }`}
//                   >
//                     {item[column]}
//                   </span>
//                 ) : (
//                   item[column]
//                 )}
//               </td>
//             ))}
//             {actions && (
//               <td className="p-2 border border-gray-300">{actions(item)}</td>
//             )}
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   );
// };

// export default DataTable;