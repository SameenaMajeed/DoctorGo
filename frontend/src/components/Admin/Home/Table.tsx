
"use client"

import type React from "react"
import { Loader2 } from "lucide-react"

interface Column<T> {
  header: string
  accessor?: keyof T | string
  render?: (item: T) => React.ReactNode
  className?: string
  sortable?: boolean
  sortKey?: keyof T
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  emptyIcon?: React.ReactNode
  onSort?: (key: keyof T, order: "asc" | "desc") => void
  sortBy?: keyof T
  sortOrder?: "asc" | "desc"
  className?: string
}

export function Table<T>({
  columns,
  data,
  loading,
  emptyMessage,
  emptyIcon,
  onSort,
  sortBy,
  sortOrder,
  className = "",
}: TableProps<T>) {
  const handleSort = (column: Column<T>) => {
    if (!column.sortable || !onSort || !column.sortKey) return

    const newOrder = sortBy === column.sortKey && sortOrder === "desc" ? "asc" : "desc"
    onSort(column.sortKey, newOrder)
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-gray-500 font-medium">Loading data...</p>
      </div>
    )
  }

  if (!data.length) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        {emptyIcon && (
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">{emptyIcon}</div>
        )}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No data found</h3>
          <p className="text-gray-500">{emptyMessage || "No data available at this time."}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
          <tr>
            {columns.map((col, i) => (
              <th
                key={i}
                className={`px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider ${
                  col.sortable ? "cursor-pointer hover:bg-gray-200 transition-colors" : ""
                } ${col.className ?? ""}`}
                onClick={() => handleSort(col)}
              >
                <div className="flex items-center gap-2">
                  {col.header}
                  {col.sortable && sortBy === col.sortKey && (
                    <span className="text-blue-600">{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {data.map((item, rowIndex) => (
            <tr
              key={rowIndex}
              className={`${
                rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50/50"
              } hover:bg-blue-50/50 transition-all duration-200 group`}
            >
              {columns.map((col, colIndex) => (
                <td key={colIndex} className={`px-6 py-4 whitespace-nowrap ${col.className ?? ""}`}>
                  {col.render ? col.render(item) : (item as any)[col.accessor as keyof T]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}



// import React from "react";

// interface Column<T> {
//   header: string;
//   accessor?: keyof T | string;
//   render?: (item: T) => React.ReactNode;
//   className?: string;
// }

// interface TableProps<T> {
//   columns: Column<T>[];
//   data: T[];
//   loading?: boolean;
//   emptyMessage?: string;
// }

// export function Table<T>({ columns, data, loading, emptyMessage }: TableProps<T>) {
//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-40 text-gray-500">Loading...</div>
//     );
//   }

//   if (!data.length) {
//     return (
//       <div className="flex justify-center items-center h-40 text-gray-500">
//         {emptyMessage || "No data available."}
//       </div>
//     );
//   }

//   return (
//     <div className="overflow-x-auto">
//       <table className="min-w-full divide-y divide-gray-200">
//         <thead className="bg-gray-50">
//           <tr>
//             {columns.map((col, i) => (
//               <th
//                 key={i}
//                 className={`px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider ${col.className ?? ""}`}
//               >
//                 {col.header}
//               </th>
//             ))}
//           </tr>
//         </thead>
//         <tbody className="bg-white divide-y divide-gray-100">
//           {data.map((item, rowIndex) => (
//             <tr key={rowIndex} className="hover:bg-blue-50/50 transition-all">
//               {columns.map((col, colIndex) => (
//                 <td key={colIndex} className={`px-6 py-4 whitespace-nowrap ${col.className ?? ""}`}>
//                   {col.render ? col.render(item) : (item as any)[col.accessor as keyof T]}
//                 </td>
//               ))}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }
