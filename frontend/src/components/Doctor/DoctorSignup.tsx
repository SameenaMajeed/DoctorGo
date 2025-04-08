import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  setError,
  setLoading,
  setDoctor,
} from "../../slice/Doctor/doctorSlice";
import sendOtp from "../../Utils/sentOtp";
import OtpModal from "../../components/CommonComponents/OtpModal";
import Navbar from "../CommonComponents/Navbar";
import Footer from "../CommonComponents/Footer";
import { RootState } from "../../slice/Store/Store";
import doctorApi from "../../axios/DoctorInstance";

const validationSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  password: yup.string().required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match")
    .required("Confirm Password is required"),
  phone: yup.string().required("Mobile number is required"),
  qualification: yup.string().required("Qualification is required"),
  specialization: yup.string().required("Specialization is required"),
  registrationNumber: yup
    .string()
    .required("Medical registration number is required"),
    certificationFile: yup
    .mixed<File>()
    .required("Certificate is required")
    .test(
      "fileFormat",
      "Unsupported file format. Only PDF, PNG, and JPG are allowed.",
      (value: File | undefined) => {
        if (value) {
          const supportedFormats = ["application/pdf", "image/png", "image/jpeg"];
          return supportedFormats.includes(value.type);
        }
        return false;
      }
    ),
});

type FormData = yup.InferType<typeof validationSchema>;

const DoctorSignupForm: React.FC = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema),
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.doctor);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);

  useEffect(() => {
    return () => {
      dispatch(setError(""));
    };
  }, [dispatch]);

  const onSubmit = async (data: FormData) => {
  
    setFormData(data);
  
    const result = await sendOtp(data.email, dispatch);
    if (result.success) {
      setShowOtpModal(true);
    }
  };

  const completeSingUp = async () => {
    if (!formData || !formData.certificationFile) return;
  
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "confirmPassword") {
        if (value instanceof File) {
          formDataToSend.append(key, value);
        } else {
          formDataToSend.append(key, value.toString());
        }
      }
    });

    // // // Add file (ensure it's a Blob)
    // // if (formData.certificationFile) {
    //   formDataToSend.append("certificationFile", formData.certificationFile);
    // // }
  
    // Set initial approval status to pending
    formDataToSend.append("isApproved", "false");
    formDataToSend.append("approvalStatus", "pending");
  
    try {
      dispatch(setLoading());
      const response: any = await doctorApi.post("/signup", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log('response',response )
  
      dispatch(
        setDoctor({
          ...response.data.doctor,
          isApproved: false,
          approvalStatus: "pending",
        })
      );
  
      setShowOtpModal(false);
  
      // Redirect to doctor home page
      navigate("/doctor/login");
    } catch (err: any) {
      dispatch(setError(err.response?.data?.error || "Signup failed"));
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-col md:flex-row items-center justify-center flex-grow p-6 mt-20">
        <div className="hidden md:block w-1/2">
          <img
            src="/registration.jpg"
            alt="Signup Illustration"
            className="max-w-full"
          />
        </div>
        <div className="w-full md:w-1/3 bg-white shadow-lg rounded-lg p-8">
          <p className="text-gray-500 text-sm mb-4">Join 125,000+ doctors</p>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Create Account
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                    type="text"
                    {...field}
                    placeholder="Enter your name"
                    className="w-full px-3 py-2 border rounded mb-3"
                  />
                )}
              />
              {errors.name && (
                <p className="text-red-600 text-sm">{errors.name.message}</p>
              )}
            </div>

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

            <div>
              <label className="block text-gray-700 font-medium">
                Qualification
              </label>
              <Controller
                name="qualification"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Enter your qualification"
                    className="w-full px-3 py-2 border rounded"
                  />
                )}
              />
              {errors.qualification && (
                <p className="text-red-600 text-sm">
                  {errors.qualification.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 font-medium">
                Specialization
              </label>
              <Controller
                name="specialization"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Enter your specialization"
                    className="w-full px-3 py-2 border rounded"
                  />
                )}
              />
              {errors.specialization && (
                <p className="text-red-600 text-sm">
                  {errors.specialization.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 font-medium">
                Medical Registration Number
              </label>
              <Controller
                name="registrationNumber"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Enter your registration number"
                    className="w-full px-3 py-2 border rounded"
                  />
                )}
              />
              {errors.registrationNumber && (
                <p className="text-red-600 text-sm">
                  {errors.registrationNumber.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 font-medium">
                Medical Certification Document
              </label>
              <Controller
                name="certificationFile"
                control={control}
                render={({ field }) => (
                  <input
                    type="file"
                    id="certificate"
                    onChange={(e) => {field.onChange(e.target.files?.[0])}
                    }
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="w-full px-3 py-2 border rounded"
                  />
                )}
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload your medical license or certification (PDF, JPG, JPEG,
                PNG)
              </p>
              {errors.certificationFile && (
                <p className="text-red-600 text-sm">
                  {errors.certificationFile.message?.toString()}
                </p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 font-medium">
                Phone No
              </label>
              <Controller
                name="phone"
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
              {errors.phone && (
                <p className="text-red-600 text-sm">{errors.phone.message}</p>
              )}
            </div>

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
              className="w-full bg-blue-600 text-white py-2 rounded-lg"
            >
              Create account
            </button>

            <div className="text-center text-gray-500 text-sm my-4">OR</div>

            <p className="text-sm text-gray-500 text-center mt-4">
              Already have an account?{" "}
              <a href="/doctor/login" className="text-blue-600">
                Login here
              </a>
            </p>
          </form>

          {error && (
            <p className="text-red-500 text-sm mb-4">
              {error.split(", ").map((msg, i) => (
                <span key={i}>
                  • {msg}
                  <br />
                </span>
              ))}
            </p>
          )}
        </div>
      </div>
      <Footer />
      {showOtpModal && formData && (
        <OtpModal
          email={formData.email}
          show={showOtpModal}
          onClose={() => setShowOtpModal(false)}
          onSuccess={completeSingUp}
        />
      )}
    </div>
  );
};

export default DoctorSignupForm;

// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { data, useNavigate } from "react-router-dom";
// import { useForm, Controller } from "react-hook-form";
// import * as yup from "yup";
// import { yupResolver } from "@hookform/resolvers/yup";
// import {
//   setError,
//   setLoading,
//   setDoctor,
// } from "../../slice/Doctor/doctorSlice";
// import { assets } from "../../assets/assets";
// import sendOtp from "../../Utils/sentOtp";
// import OtpModal from "../../components/CommonComponents/OtpModal";
// import Navbar from "../CommonComponents/Navbar";
// import Footer from "../CommonComponents/Footer";
// import { RootState } from "../../slice/Store/Store";
// import doctorApi from "../../axios/DoctorInstance";

// const validationSchema = yup.object().shape({
//   name: yup
//     .string()
//     .matches(/^[A-Za-z ]+$/, "Only alphabets and spaces are allowed")
//     .min(3, "Name must be at least 3 characters")
//     .required("Name is required"),
//   email: yup
//     .string()
//     .email("Invalid email format")
//     .required("Email is required"),
//   password: yup
//     .string()
//     .min(8, "Password must be at least 8 characters")
//     .matches(/[A-Z]/, "Must contain at least one uppercase letter")
//     .matches(/[a-z]/, "Must contain at least one lowercase letter")
//     .matches(/[0-9]/, "Must contain at least one number")
//     .matches(
//       /[!@#$%^&*(),.?":{}|<>]/,
//       "Must contain at least one special character"
//     )
//     .required("Password is required"),
//   confirmPassword: yup
//     .string()
//     .oneOf([yup.ref("password")], "Passwords do not match")
//     .required("Confirm Password is required"),
//   phone : yup
//     .string()
//     .matches(/^\d{10}$/, "Mobile number must be 10 digits")
//     .required("Mobile number is required"),
//   qualification: yup.string().required("Qualification is required"),
//   specialization: yup.string().required("Specialization is required"),
// });

// type FormData = yup.InferType<typeof validationSchema>;

// const DoctorSignupForm: React.FC = () => {
//   const {
//     control,
//     handleSubmit,
//     // doctor,
//     formState: { errors },
//   } = useForm<FormData>({
//     resolver: yupResolver(validationSchema),
//   });

//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { loading, error } = useSelector((state: RootState) => state.doctor);
//   // const [message, setMessage] = useState("");
//   const [showOtpModal, setShowOtpModal] = useState(false);

//   useEffect(() => {
//     return () => {
//       dispatch(setError(""));
//     };
//   }, [dispatch]);

//   const [formData, setFormData] = useState<FormData | null>(null); // Store form data

//   const onSubmit = async (data: FormData) => {
//     setFormData(data); // Store data for later use

//     const result = await sendOtp(data.email, dispatch);
//     if (result.success) {
//       setShowOtpModal(true);
//     }
//   };

//   const completeSingUp = async () => {
//     if (!formData) return; // Ensure formData is available

//     console.log('formData' , formData)
//     const formDataToSend = new FormData();
//     Object.entries(formData).forEach(([key, value]) => {
//       formDataToSend.append(key, value.toString());
//     })
//     console.log('formDataToSend : ' ,formDataToSend);

//     try {
//       dispatch(setLoading());
//       const response: any = await doctorApi.post("/signup", formDataToSend, {
//         headers: { "Content-Type": "application/json" },
//       });

//       dispatch(setDoctor(response.data.doctor));
//       setShowOtpModal(false);
//       navigate("/doctor/login");
//     } catch (err: any) {
//       dispatch(setError(err.response?.data?.error || "Signup failed"));
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 flex flex-col">
//       <Navbar />
//       <div className="flex flex-col md:flex-row items-center justify-center flex-grow p-6 mt-20">
//         <div className="hidden md:block w-1/2">
//           <img
//             src="/registration.jpg"
//             alt="Signup Illustration"
//             className="max-w-full"
//           />
//         </div>
//         <div className="w-full md:w-1/3 bg-white shadow-lg rounded-lg p-8">
//           <p className="text-gray-500 text-sm mb-4">Join 125,000+ doctors</p>
//           <h2 className="text-2xl font-bold text-gray-800 mb-4">
//             Create Account
//           </h2>
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//             <div>
//               <label className="block text-gray-700 font-medium">
//                 Full Name
//               </label>
//               <Controller
//                 name="name"
//                 control={control}
//                 defaultValue=""
//                 render={({ field }) => (
//                   <input
//                     type="text"
//                     {...field}
//                     placeholder="Enter your name"
//                     className="w-full px-3 py-2 border rounded mb-3"
//                   />
//                 )}
//               />
//               {errors.name && (
//                 <p className="text-red-600 text-sm">{errors.name.message}</p>
//               )}
//             </div>
//             <div>
//               <label className="block text-gray-700 font-medium">Email</label>
//               <Controller
//                 name="email"
//                 control={control}
//                 defaultValue=""
//                 render={({ field }) => (
//                   <input
//                     {...field}
//                     type="email"
//                     placeholder="Enter your email"
//                     className="w-full px-3 py-2 border rounded"
//                   />
//                 )}
//               />
//               {errors.email && (
//                 <p className="text-red-600 text-sm">{errors.email.message}</p>
//               )}
//             </div>
//             <div>
//               <label className="block text-gray-700 font-medium">
//                 Qualification
//               </label>
//               <Controller
//                 name="qualification"
//                 control={control}
//                 defaultValue=""
//                 render={({ field }) => (
//                   <input
//                     {...field}
//                     type="text"
//                     placeholder="Enter your qualification"
//                     className="w-full px-3 py-2 border rounded"
//                   />
//                 )}
//               />
//               {errors.name && (
//                 <p className="text-red-600 text-sm">{errors.name.message}</p>
//               )}
//             </div>
//             <div>
//               <label className="block text-gray-700 font-medium">
//                 Specialization
//               </label>
//               <Controller
//                 name="specialization"
//                 control={control}
//                 defaultValue=""
//                 render={({ field }) => (
//                   <input
//                     {...field}
//                     type="text"
//                     placeholder="Enter your specialization"
//                     className="w-full px-3 py-2 border rounded"
//                   />
//                 )}
//               />
//               {errors.name && (
//                 <p className="text-red-600 text-sm">{errors.name.message}</p>
//               )}
//             </div>

//             {/* Mobile No */}
//             <div>
//               <label className="block text-gray-700 font-medium">
//                 Phone No
//               </label>
//               <Controller
//                 name="phone"
//                 control={control}
//                 defaultValue=""
//                 render={({ field }) => (
//                   <input
//                     {...field}
//                     type="text"
//                     placeholder="Enter your mobile number"
//                     className="w-full px-3 py-2 border rounded"
//                   />
//                 )}
//               />
//               {errors.phone && (
//                 <p className="text-red-600 text-sm">
//                   {errors.phone.message}
//                 </p>
//               )}
//             </div>

//             {/* Password */}
//             <div>
//               <label className="block text-gray-700 font-medium">
//                 Password
//               </label>
//               <Controller
//                 name="password"
//                 control={control}
//                 defaultValue=""
//                 render={({ field }) => (
//                   <input
//                     {...field}
//                     type="password"
//                     placeholder="Enter your password"
//                     className="w-full px-3 py-2 border rounded"
//                   />
//                 )}
//               />
//               {errors.password && (
//                 <p className="text-red-600 text-sm">
//                   {errors.password.message}
//                 </p>
//               )}
//             </div>

//             {/* Confirm Password */}
//             <div>
//               <label className="block text-gray-700 font-medium">
//                 Confirm Password
//               </label>
//               <Controller
//                 name="confirmPassword"
//                 control={control}
//                 defaultValue=""
//                 render={({ field }) => (
//                   <input
//                     {...field}
//                     type="password"
//                     placeholder="Confirm your password"
//                     className="w-full px-3 py-2 border rounded"
//                   />
//                 )}
//               />
//               {errors.confirmPassword && (
//                 <p className="text-red-600 text-sm">
//                   {errors.confirmPassword.message}
//                 </p>
//               )}
//             </div>

//             <button
//               type="submit"
//               className="w-full bg-blue-600 text-white py-2 rounded-lg"
//             >
//               Create account
//             </button>
//             <div className="text-center text-gray-500 text-sm my-4">OR</div>

//             <p className="text-sm text-gray-500 text-center mt-4">
//               Already have an account?{" "}
//               <a href="/doctor/login" className="text-blue-600">
//                 Login here
//               </a>
//             </p>
//           </form>
//           {error && (
//             <p className="text-red-500 text-sm mb-4">
//               {error.split(", ").map((msg, i) => (
//                 <span key={i}>
//                   • {msg}
//                   <br />
//                 </span>
//               ))}
//             </p>
//           )}
//         </div>
//       </div>
//       <Footer />
//       {showOtpModal && formData && (
//         <OtpModal
//           email={formData.email}
//           show={showOtpModal}
//           onClose={() => setShowOtpModal(false)}
//           onSuccess={completeSingUp}
//         />
//       )}
//     </div>
//   );
// };

// export default DoctorSignupForm;
