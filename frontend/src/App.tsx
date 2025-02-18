import { FC } from "react";
import { BrowserRouter as Router ,Routes , Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

// User Pages
import UserProtected from "./components/User/UserProtected";
import LoginForm from "./components/User/LoginForm";
import UserHomePage from "./pages/user/UserHomePage";
import SignupForm from "./components/User/SignupForm";
// import Login from "./pages/user/Login";
// import Signup from "./pages/user/Signup";

const App : FC = () => {
  return (
    <div>
      <Router>
        <Routes>
        <Route element={<UserProtected/>}>
          <Route path="/" Component={UserHomePage} />
        </Route>
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/login" element={<LoginForm/>} />

        </Routes>
      </Router>
      <ToastContainer position="bottom-right" />
    </div>
  )
}

export default App;