import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../slice/Store/Store";


const ApprovalBanner: React.FC = () => {
  const { doctor } = useSelector((state: RootState) => state.doctor);

  console.log('Approved : ',doctor?.isApproved)
  console.log("Doctor object:", doctor);

  if (!doctor || doctor.isApproved) {
    return null; // No banner if the doctor is approved
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            Your account is pending approval. You'll have limited access until an administrator verifies your credentials.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApprovalBanner;

// import React from "react";
// import { useSelector } from "react-redux";
// import { RootState } from "../../../slice/Store/Store";

// type ApprovalStatus = "pending" | "approved" | "rejected" | "blocked";

// const ApprovalBanner: React.FC = () => {
//   const { doctor } = useSelector((state: RootState) => state.doctor);

//   console.log('status :' ,doctor)

//   // Don't show banner if no doctor or if approved with no special status
//   if (!doctor || (doctor.isApproved && (!doctor.approvalStatus || doctor.approvalStatus === "approved"))) {
//     return null;
//   }

//   // Determine status and message
//   let status: ApprovalStatus = "pending";
//   let message = "Your account is pending approval. You'll have limited access until an administrator verifies your credentials.";
//   let borderColor = "border-yellow-400";
//   let textColor = "text-yellow-700";
//   let bgColor = "bg-yellow-50";
//   let iconColor = "text-yellow-400";

//   if (doctor.approvalStatus === "rejected") {
//     status = "rejected";
//     message = "Your application was rejected. Please contact support for more information.";
//     borderColor = "border-red-400";
//     textColor = "text-red-700";
//     bgColor = "bg-red-50";
//     iconColor = "text-red-400";
//   } else if (doctor.isBlocked) {
//     status = "blocked";
//     message = "Your account has been blocked. Please contact the administrator.";
//     borderColor = "border-red-600";
//     textColor = "text-red-800";
//     bgColor = "bg-red-100";
//     iconColor = "text-red-600";
//   } else if (doctor.isApproved) {
//     status = "approved";
//     // You might want to show a temporary success message
//     return (
//       <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
//         <div className="flex">
//           <div className="flex-shrink-0">
//             <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
//               <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//             </svg>
//           </div>
//           <div className="ml-3">
//             <p className="text-sm text-green-700">
//               Your account has been approved! Full access granted.
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={`${bgColor} border-l-4 ${borderColor} p-4 mb-6`}>
//       <div className="flex">
//         <div className="flex-shrink-0">
//           <svg className={`h-5 w-5 ${iconColor}`} viewBox="0 0 20 20" fill="currentColor">
//             {status === "pending" && (
//               <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//             )}
//             {status === "rejected" && (
//               <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//             )}
//             {status === "blocked" && (
//               <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
//             )}
//           </svg>
//         </div>
//         <div className="ml-3">
//           <p className={`text-sm ${textColor}`}>
//             {message}
//             {status === "rejected" && (
//               <button className="ml-2 text-sm font-medium underline">
//                 Contact Support
//               </button>
//             )}
//             {status === "blocked" && (
//               <button className="ml-2 text-sm font-medium underline">
//                 Learn More
//               </button>
//             )}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ApprovalBanner;