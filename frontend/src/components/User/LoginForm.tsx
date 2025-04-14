import React, { FormEvent, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setError, setLoading, setUser } from "../../slice/user/userSlice";
import api from "../../axios/UserInstance";
import { assets } from "../../assets/assets";
import Navbar from "../CommonComponents/Navbar";
import Footer from "../CommonComponents/Footer";
import ForgotPasswordModel from "../CommonComponents/ForgotPasswordModel";
import {getAuth , signInWithPopup , GoogleAuthProvider} from "firebase/auth"
import App from "../../FirebaseAuthentication/config";
import { toast } from "react-hot-toast";
import { GoogleSignInResponse, LoginResponse } from "../../types/auth";

const LoginForm: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });

  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const validateForm = () => {
    let valid = true;
    const newErrors = { email: "", password: "" };

    if (!email) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
      valid = false;
    }

    if (!password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    if (!validateForm()) return;

    dispatch(setLoading());
    try {
      const response = await api.post<LoginResponse>(
        "/login",
        { email, password },
        { withCredentials: true }
      );
      console.log('User : ',response.data)
      const { user , accessToken , refreshToken } = response.data.data;
      console.log('User : ',user)
      dispatch(setUser({
        id: user._id || "", // fallback to empty string
        name: user.name || "",
        email: user.email || "",
        mobile_no: user.mobile_no || "",
        accessToken, // Store accessToken
        refreshToken,
      }));
      toast.success('Login successful!');
      navigate("/");
    } catch (error: any) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message ||
        "An unexpected error occurred. Please try again.";
      setMessage(errorMessage);
      dispatch(setError("Login failed."));
    }
  };

  const handleGoogleSignIn = async () => {
    const auth = getAuth(App);
    const provider = new GoogleAuthProvider();
  
    try {
      dispatch(setLoading());
  
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
  
      const response : any = await api.post<GoogleSignInResponse>('/google', { idToken }, { withCredentials: true });
  
      console.log('Full API response:', response.data);
  
      // Extract user correctly
      const {user , accessToken, refreshToken } = response.data?.data; 
      console.log('Extracted user:', user);
  
      if (user) {
        dispatch(setUser({
          id: user._id || "", // fallback to empty string
          name: user.name || "",
          email: user.email || "",
          mobile_no: user.mobile_no || "",
          accessToken, // Store accessToken
          refreshToken,
        })); 
        toast.success('Google Sign-In successful!');
        navigate("/");
      } else {
        throw new Error("Invalid user data received");
      }
  
    } catch (error : any) {
      console.error('Google Sign-In Error:', error);
      const errorMessage = error.response?.data?.message || "Google Sign-In failed. Please try again.";
      dispatch(setError(errorMessage));
      toast.error(errorMessage);
    }
  };
  

  // const handleGoogleSignIn = async () => {
  //   const auth = getAuth(App)
  //   const provider = new GoogleAuthProvider()

  //   try {

  //     dispatch(setLoading())
  //     const result = await signInWithPopup(auth , provider)
  //     const idToken = await result.user.getIdToken()

  //     const response : any = await api.post<GoogleSignInResponse>('/google' , {idToken} , {withCredentials : true})
  //     console.log('Full API response:', response.data); // Debug API response

  //     // Ensure correct data extraction
  //     const user = response.data?.data || response.data; 
  //     console.log('Extracted user:', user);
  //     // const user  = response.data.data
  //     // console.log('user' ,user)

  //     dispatch(setUser(user))
  //     toast.success('Google Sign-In successful!')
     
  //     navigate("/")

  //   } catch (error: any) {
  //     console.error(error)
  //     const errorMessage = error.response?.data?.message || "Google Sign-In failed. Please try again."
  //     dispatch(setError(errorMessage))
  //   }

  // }

  return (
    <div>
      <Navbar />
      <div className="w-full min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex w-3/4 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="w-1/2 hidden md:block">
            <img
              src={assets.logoImg}
              alt="DoctorGo"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
            <h1 className="text-3xl font-semibold text-gray-800 text-center mb-2">
              Login
            </h1>
            <p className="text-gray-600 text-center mb-6">
              Please login to book an appointment
            </p>

            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <input
                autoComplete="off"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your Email"
                  className={`w-full px-4 py-2 border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
                )}

                <input
                autoComplete="new-password"
                  type="password"
                  placeholder="Enter your Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-2 border ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400`}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password}</p>
                )}
              </div>
              <div className="mt-6 flex flex-col space-y-3">
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Login
              </button>
              </div>
            </form>

            <div className="flex justify-between items-center mt-4 text-sm">
              <label className="flex items-center space-x-2 text-gray-600">
                <input type="checkbox" className="accent-blue-500" />
                <span>Remember Me</span>
              </label>
              <button
                onClick={() => setShowForgotPassword(true)}
                className="text-blue-500 cursor-pointer hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <ForgotPasswordModel
              show={showForgotPassword}
              onClose={() => setShowForgotPassword(false)}
              role={"user"}
            />

            <div className="mt-6 flex flex-col space-y-3">
            <p className="font-serif text-sepia-700 mb-2">Or sign in with:</p>
              <button
                onClick={handleGoogleSignIn}
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Sign in with Google
              </button>
              <button
                type="button"
                onClick={()=>navigate('/signup')}
                className="w-full border border-blue-500 text-blue-500 py-2 rounded-lg hover:bg-blue-500 hover:text-white transition"
              >
                Register
              </button>
            </div>

            {message && (
              <p className="text-center text-red-500 mt-4">{message}</p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LoginForm;
