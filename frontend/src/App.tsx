import { FC } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

// User Pages
import UserProtected from "./components/User/UserProtected";
import LoginForm from "./components/User/LoginForm";
import UserHomePage from "./pages/user/UserHomePage";
import SignupForm from "./components/User/SignupForm";
import AdminDashBoard from "./pages/Admin/AdminDashBoard";
import AdminLogin from "./components/Admin/AdminLogin";
import AdminLanding from "./pages/Admin/AdminLanding";
import DoctorLogin from "./components/Doctor/DoctorLogin";
import DoctorSignupForm from "./components/Doctor/DoctorSignup";
import DoctorLanding from "./pages/Doctor/DocterLanding";
import AdminProtected from "./components/Admin/AdminProtected";
import DoctorProtected from "./components/Doctor/DoctorProtected";
import ApproveDoctor from "./components/Admin/ApproveDoctor";
import UserList from "./components/Admin/UserList";
import PendingApprovel from "./components/Doctor/PendingApprovel";
import DoctorList from "./components/Admin/DoctorList";
import DoctorDashboard from "./pages/Doctor/DoctorDashboard";
import Layout from "./components/Doctor/Home/Layout";
import Profile from "./components/Doctor/Profile";

const App: FC = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route element={<UserProtected />}>
            <Route path="/" Component={UserHomePage} />
            <Route path="/signup" element={<SignupForm />} />
            <Route path="/login" element={<LoginForm />} />
          </Route>

          {/* Doctor route */}
          <Route path="/doctor" element={<DoctorLanding />} />
          <Route path="/doctor/login" element={<DoctorLogin />} />
          <Route path="/doctor/signup" element={<DoctorSignupForm />} />
          <Route
            path="/doctor/pending-approval"
            element={<PendingApprovel />}
          />
          <Route element={<DoctorProtected />}>
            <Route path="/doctor/home" element={<DoctorDashboard />} />
            <Route element={<Layout/>}>
            <Route path="/doctor/profile" element={<Profile/>}/>
            </Route>
          </Route>

          {/* Admin Route */}
          <Route path="/admin" element={<AdminLanding />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<AdminProtected />}>
            <Route path="/admin/dashboard" element={<AdminDashBoard />} />
            <Route path="/admin/approvals" element={<ApproveDoctor />} />
            <Route path="/admin/Doctors" element={<DoctorList />} />
            <Route path="/admin/users" element={<UserList />} />
          </Route>
        </Routes>
      </Router>
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default App;
