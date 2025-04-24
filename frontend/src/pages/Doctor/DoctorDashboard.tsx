import React from "react";
import Sidebar from "../../components/Doctor/Home/Sidebar";
import Header from "../../components/Doctor/Home/Header";
import Main from "../../components/Doctor/Home/Main";
import { useSelector } from "react-redux";
import { RootState } from "../../slice/Store/Store";
import { Navigate, useNavigate } from "react-router-dom";
import ApprovalBanner from "../../components/Doctor/Home/ApprovalBanner";
import toast from "react-hot-toast";

const DashboardLayout = () => {
  const { doctor, isAuthenticated } = useSelector(
    (state: RootState) => state.doctor
  );
  const navigate = useNavigate();

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/doctor/login" />;
  }

  // Function to handle restricted actions
  const handleRestrictedAction = () => {
    if (!doctor?.isApproved) {
      toast.error("Your account is pending approval by the admin.");
      navigate("/doctor/pending-approval", {
        state: { message: "Your account is pending approval by the admin." },
      });
    }
  };

  console.log("DashboardLayout is rendering");

  return (
    <div>
      {/* Show Approval Status Banner if not approved */}
      {!doctor?.isApproved && <ApprovalBanner />}

      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="h-full">
          <Sidebar onRestrictedAction={handleRestrictedAction} />
        </div>

        {/* Main Content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
            <Main onRestrictedAction={handleRestrictedAction} />
          </main>
        </div>
      </div>
    </div>
  );
};

{
  /* <div className="flex min-h-screen bg-black text-white">
        <Sidebar onRestrictedAction={handleRestrictedAction} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto bg-gray-50 text-black p-6">
            <Main onRestrictedAction={handleRestrictedAction} />
          </main>
        </div>
      </div> */
}

export default DashboardLayout;

// import React from "react";
// import Sidebar from "../../components/Doctor/Home/Sidebar";
// import Header from "../../components/Doctor/Home/Header";
// import Main from "../../components/Doctor/Home/Main";
// import { useSelector } from "react-redux";
// import { RootState } from "../../slice/Store/Store";
// import { Navigate } from "react-router-dom";
// import ApprovalBanner from '../../components/Doctor/Home/ApprovalBanner'

// const DashboardLayout = () => {
//   const { doctor, isAuthenticated } = useSelector((state: RootState) => state.doctor);

//   // Redirect if not authenticated
//   if (!isAuthenticated) {
//     return <Navigate to="/doctor/login" />;
//   }

//   return (
//     <div>
//       {/* Approval Status Banner */}
//       <ApprovalBanner />

//       <div className="flex h-screen bg-gray-50">
//         {/* Sidebar */}
//         <Sidebar />

//         {/* Main Content */}
//         <div className="flex flex-col flex-1 overflow-hidden">
//           <Header />
//           <main className="flex-1 p-6 overflow-auto">
//             <Main />
//           </main>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DashboardLayout;
