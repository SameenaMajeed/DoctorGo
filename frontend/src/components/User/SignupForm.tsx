import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import api from "../../axios/UserInstance";
import { setError, setLoading } from "../../slice/user/userSlice";
import { assets } from "../../assets/assets";
import sendOtp from "../../Utils/sentOtp";
import OtpModal from "../../components/CommonComponents/OtpModal";
import Navbar from "../CommonComponents/Navbar";
import Footer from "../CommonComponents/Footer";

interface SignupFormInputs {
  name: string;
  email: string;
  gender: string;
  password: string;
  confirmPassword: string;
  mobileNo: string;
}

const validationSchema = yup.object({
  name: yup
    .string()
    .matches(/^[A-Za-z ]+$/, "Only alphabets and spaces are allowed")
    .min(3, "Name must be at least 3 characters")
    .required("Name is required"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Must contain at least one uppercase letter")
    .matches(/[a-z]/, "Must contain at least one lowercase letter")
    .matches(/[0-9]/, "Must contain at least one number")
    .matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Must contain at least one special character"
    )
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match")
    .required("Confirm Password is required"),
  mobileNo: yup
    .string()
    .matches(/^\d{10}$/, "Mobile number must be 10 digits")
    .required("Mobile number is required"),
  gender: yup.string().required("Gender is required"),
});

const SignupForm: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<SignupFormInputs>({
    resolver: yupResolver(validationSchema),
  });

  const onSubmit = async (data: SignupFormInputs) => {
    setMessage("");
    try {
      const { success, message: otpMessage } = await sendOtp(
        data.email,
        dispatch
      );
      setMessage(otpMessage);
      if (success) setShowOtpModal(true);
    } catch (error) {
      console.error("Error sending OTP:", error);
      setMessage("Failed to send OTP. Please try again.");
    }
  };

  const handleOtpSuccess = async (successMessage: string) => {
    setMessage(successMessage);
    setShowOtpModal(false);
    const data = getValues();

    try {
      dispatch(setLoading());
      await api.post("/register", {
        name: data.name,
        email: data.email,
        password: data.password,
        mobile_no: data.mobileNo,
        gender: data.gender,
      });
      setMessage("User registered successfully!");
      navigate("/login");
    } catch (error) {
      console.error("Error registering user:", error);
      dispatch(setError("Error registering user."));
      setMessage("Error registering user. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

       {/* Main Content */}
       <div className="flex flex-col md:flex-row items-center justify-center flex-grow p-6 mt-8">
        {/* Illustration */}
        <div className="hidden md:block w-1/2">
          <img
            src="/registration.jpg"
            alt="Signup Illustration"
            className="max-w-full"
          />
        </div>

        <div className="w-full md:w-1/3 bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-extrabold text-gray-800 mb-2">
            Create Account
          </h1>
          <p className="text-gray-500 mb-6">
            Please sign up to book an appointment
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-gray-700 font-medium">
                Full Name
              </label>
              <Controller
                name="name"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Enter your name"
                    className="w-full px-3 py-2 border rounded"
                  />
                )}
              />
              {errors.name && (
                <p className="text-red-600 text-sm">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-700 font-medium">Email</label>
              <Controller
                name="email"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <input
                    {...field}
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 border rounded"
                  />
                )}
              />
              {errors.email && (
                <p className="text-red-600 text-sm">{errors.email.message}</p>
              )}
            </div>

            {/* Mobile No */}
            <div>
              <label className="block text-gray-700 font-medium">
                Phone No
              </label>
              <Controller
                name="mobileNo"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Enter your mobile number"
                    className="w-full px-3 py-2 border rounded"
                  />
                )}
              />
              {errors.mobileNo && (
                <p className="text-red-600 text-sm">
                  {errors.mobileNo.message}
                </p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-gray-700 font-medium">Gender</label>
              <Controller
                name="gender"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                )}
              />
              {errors.gender && (
                <p className="text-red-600 text-sm">{errors.gender.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 font-medium">
                Password
              </label>
              <Controller
                name="password"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <input
                    {...field}
                    type="password"
                    placeholder="Enter your password"
                    className="w-full px-3 py-2 border rounded"
                  />
                )}
              />
              {errors.password && (
                <p className="text-red-600 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-gray-700 font-medium">
                Confirm Password
              </label>
              <Controller
                name="confirmPassword"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <input
                    {...field}
                    type="password"
                    placeholder="Confirm your password"
                    className="w-full px-3 py-2 border rounded"
                  />
                )}
              />
              {errors.confirmPassword && (
                <p className="text-red-600 text-sm">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 mt-5 rounded-lg text-lg font-semibold"
            >
              Create Account
            </button>
          </form>
          {message && (
            <p className="mt-4 text-center text-sm font-medium text-[#8b5d3b]">
              {message}
            </p>
          )}
        </div>
      </div>

      <Footer/>
      {showOtpModal && (
        <OtpModal
          email={getValues("email")}
          onClose={() => setShowOtpModal(false)}
          onSuccess={handleOtpSuccess}
          show={showOtpModal}
        />
      )}
    </div>
  );
};

export default SignupForm;
