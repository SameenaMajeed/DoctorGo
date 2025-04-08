import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../slice/Store/Store";

const ApprovedDoctorRoute: React.FC = () => {
  const { isAuthenticated, doctor } = useSelector((state: RootState) => state.doctor);

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/doctor/login" />;
  }

  // If authenticated and approved, render the child routes
  return <Outlet />;
};

export default ApprovedDoctorRoute;
