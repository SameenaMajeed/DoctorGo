import { Route } from "react-router-dom";

// User Pages
import UserProtected from "../components/User/UserProtected";
// import LoginForm from "../components/User/LoginForm";
import UserHomePage from "../pages/user/UserHomePage";
import SignupForm from "../components/User/SignupForm";
import AdminDashBoard from "../pages/Admin/AdminDashBoard";
import AdminLogin from "../components/Admin/AdminLogin";
import AdminLanding from "../pages/Admin/AdminLanding";
import DoctorLogin from "../components/Doctor/DoctorLogin";
import DoctorSignupForm from "../components/Doctor/DoctorSignup";
import DoctorLanding from "../pages/Doctor/DocterLanding";
import AdminProtected from "../components/Admin/AdminProtected";
import DoctorProtected from "../components/Doctor/DoctorProtected";
import ApproveDoctor from "../components/Admin/ApproveDoctor";
import UserList from "../components/Admin/UserList";
import PendingApprovel from "../components/Doctor/PendingApprovel";
import DoctorList from "../components/Admin/DoctorList";
import DoctorDashboard from "../pages/Doctor/DoctorDashboard";
import Layout from "../components/Doctor/Home/Layout";
import Profile from "../components/Doctor/Profile";
import AppointmentPage from "../components/User/AppointmentPage";
import AppointmentVerification from "../components/User/AppointmentVerification";
import PaymentSuccess from "../components/User/PaymentSuccess.tsx";
import CreateSlot from "../components/Doctor/Slot/CreateSlot.tsx";
import ManageSlots from "../components/Doctor/Slot/ManageSlots.tsx";
// import SlotCalendar from "../components/Doctor/Slot/SlotCalendar.tsx";
// import EmergencyBlock from "../components/Doctor/Slot/EmergencyBlock.tsx";
// import TimeSlots from "../components/Doctor/Slot/TimeSlot.tsx";
import AppointmentsList from "../components/User/AppointmentList.tsx";
import Appointments from "../components/Doctor/Appointments.tsx";
import EditSlot from "../components/Doctor/Slot/EditSlot.tsx";
import UserProfile from "../components/User/UserProfile.tsx";
import ProtectedLogin from "../components/User/LoginProtected.tsx";
import UserLayout from "../components/User/Home/UserLayout.tsx";
import Chat from "../components/User/Chat.tsx";
import MedicalRecord from "../components/Doctor/PatientRecords.tsx";
import PatientDashboard from "../components/Doctor/PatientDashboard.tsx";
import Page404 from "../pages/Page404.tsx";
import NewRecord from "../components/Doctor/NewRecord.tsx";
import ChatPage from "../components/Doctor/ChatPage.tsx";
import DoctorReviews from "../components/Doctor/DoctorReviews.tsx";
import AboutPage from "../components/User/Home/AboutPage.tsx";
import ContactPage from "../components/User/Home/ContactPage.tsx";
import DoctorsList from "../components/User/Home/DoctorsList.tsx";
import VideoCall from "../components/VideoCall/VideoCallRoom.tsx";
import BookingsPage from "../components/Admin/BookingsPage.tsx";
import PaymentsPage from "../components/Admin/PaymentsPage.tsx";
import PrescriptionView from "../components/User/PrescriptionView.tsx";
import WalletPage from "../components/User/WalletPage.tsx";
import PaymentHistory from "../components/User/PaymentHistory.tsx";
import PaymentDetails from "../components/Doctor/PaymentDetails.tsx";

export const routes = (
  <>
    {/* Public Routes */}
    <Route path="/signup" element={<SignupForm />} />
    <Route path="/login" element={<ProtectedLogin />} />

    <Route path="/doctor/login" element={<DoctorLogin />} />
    <Route path="/doctor/signup" element={<DoctorSignupForm />} />
    <Route path="/doctor/pending-approval" element={<PendingApprovel />} />

    <Route path="/admin" element={<AdminLanding />} />
    <Route path="/admin/login" element={<AdminLogin />} />
    <Route path="/doctor" element={<DoctorLanding />} />

    {/* User Routes */}

    <Route element={<UserProtected />}>
      <Route path="/" element={<UserHomePage />} />
      <Route path="/doctors/:doctorId" element={<AppointmentPage />} />
      <Route
        path="/appointment/verification"
        element={<AppointmentVerification />}
      />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/doctorsList" element={<DoctorsList />} />
      <Route path="/appointment/success" element={<PaymentSuccess />} />
      <Route element={<UserLayout />}>
        <Route path="/my-profile" element={<UserProfile />} />
        <Route path="/my-appointments" element={<AppointmentsList />} />
        <Route path="/user/video-call" element={<VideoCall />} />
        <Route path="/my-chats" element={<Chat />} />
        <Route path="/prescription/:appointmentId" element={<PrescriptionView />} />
        <Route path="/wallet" element={<WalletPage/>}/>
        <Route path='/paymentHistory' element={<PaymentHistory/>}/>
      </Route>
    </Route>

    {/* Doctor route */}
    <Route element={<DoctorProtected />}>
      <Route path="/doctor/home" element={<DoctorDashboard />} />
      <Route element={<Layout />}>
        <Route path="/doctor/profile" element={<Profile />} />
        {/* <Route path="/doctor/time-slots" element={<TimeSlots />} /> */}
        <Route path="/doctor/slots" element={<ManageSlots />} />
        <Route path="/doctor/video-call" element={<VideoCall />} />

        <Route path="/doctor/slots/create" element={<CreateSlot />} />
        <Route path="/doctor/time-slots/:slotId" element={<EditSlot />} />
        {/* <Route path="/doctor/slots/calendar" element={<SlotCalendar />} /> */}
        <Route
          path="/doctor/patient-records/:userId"
          element={<MedicalRecord />}
        />
        <Route path="/doctor/newRecords" element={<NewRecord />} />
        <Route
          path="/doctor/:doctorId/patients"
          element={<PatientDashboard />}
        />
        <Route path="/myChats" element={<ChatPage />} />
        <Route path="/payment" element={<PaymentDetails />} />
        <Route path="/doctor/reviews/:doctorId" element={<DoctorReviews />} />
        {/* <Route
          path="/doctor/slots/emergency-block"
          element={<EmergencyBlock />}
        /> */}
        <Route
          path="/doctor/:doctorId/appointments"
          element={<Appointments />}
        />
      </Route>
    </Route>

    {/* Admin Route */}
    <Route element={<AdminProtected />}>
      <Route path="/admin/dashboard" element={<AdminDashBoard />} />
      <Route path="/admin/approvals" element={<ApproveDoctor />} />
      <Route path="/admin/Doctors" element={<DoctorList />} />
      <Route path="/admin/users" element={<UserList />} />
      <Route path="/admin/appointments" element={<BookingsPage />} />
      <Route path="/admin/payments" element={<PaymentsPage />} />
    </Route>

    <Route path="*" element={<Page404 />} />
  </>
);
