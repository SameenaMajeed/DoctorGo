"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useDispatch } from "react-redux"
import { X, Mail, Clock, RefreshCw } from "lucide-react"
import { resendOtp, verifyOtp } from "../../Api/OtpApis"

interface OtpModalProps {
  show: boolean
  email: string
  onClose: () => void
  onSuccess: (message: string) => void
}

const OtpModal: React.FC<OtpModalProps> = ({ email, show, onClose, onSuccess }) => {
  const dispatch = useDispatch()
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [message, setMessage] = useState("")
  const [countdown, setCountdown] = useState<number>(60)
  const [isResending, setIsResending] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Countdown timer effect
  useEffect(() => {
    if (countdown === 0) return

    const timer = setInterval(() => {
      setCountdown((prevCountdown) => prevCountdown - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown])

  // Focus first input when modal opens
  useEffect(() => {
    if (show && inputRefs.current[0]) {
      inputRefs.current[0]?.focus()
    }
  }, [show])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return // Prevent multiple characters

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").slice(0, 6)
    const newOtp = [...otp]

    for (let i = 0; i < pastedData.length && i < 6; i++) {
      if (/^\d$/.test(pastedData[i])) {
        newOtp[i] = pastedData[i]
      }
    }

    setOtp(newOtp)

    // Focus the next empty input or the last one
    const nextEmptyIndex = newOtp.findIndex((digit, idx) => !digit && idx < 6)
    const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : 5
    inputRefs.current[focusIndex]?.focus()
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpString = otp.join("")

    if (otpString.length !== 6) {
      setMessage("Please enter all 6 digits")
      return
    }

    const { success, message } = await verifyOtp(email, otpString, dispatch)

    if (success) {
      onSuccess(message)
      onClose()
    } else {
      setMessage(message)
    }
  }

  const handleResendOtp = async () => {
    setMessage("")
    setIsResending(true)
    setCountdown(60)

    const { success, message } = await resendOtp(email, dispatch)

    setMessage(message)
    setIsResending(false)

    if (!success) {
      setCountdown(0)
    } else {
      // Clear OTP inputs and focus first one
      setOtp(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // If the modal should not be shown, return null
  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="relative p-6 pb-4">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Email</h3>
            <p className="text-gray-600 text-sm">
              We've sent a 6-digit code to
              <br />
              <span className="font-semibold text-gray-800">{email}</span>
            </p>
          </div>
        </div>

        {/* OTP Input Form */}
        <div className="px-6 pb-6">
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            {/* OTP Input Boxes */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700 text-center">Enter Verification Code</label>
              <div className="flex justify-center gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  />
                ))}
              </div>
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={otp.some((digit) => !digit)}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              Verify Code
            </button>
          </form>

          {/* Timer and Resend */}
          <div className="mt-6 text-center space-y-3">
            {countdown > 0 ? (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Code expires in {formatTime(countdown)}</span>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-red-600 font-medium">Code has expired</p>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResending}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Resend Code
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Message Display */}
          {message && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-center text-sm font-medium text-red-700">{message}</p>
            </div>
          )}

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Didn't receive the code? Check your spam folder or{" "}
              <button
                onClick={countdown === 0 ? handleResendOtp : undefined}
                className={`font-semibold ${
                  countdown === 0
                    ? "text-blue-600 hover:text-blue-700 cursor-pointer"
                    : "text-gray-400 cursor-not-allowed"
                }`}
                disabled={countdown > 0 || isResending}
              >
                request a new one
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OtpModal


// import React, { useState, useEffect } from 'react';
// import { useDispatch } from 'react-redux';
// import { resendOtp, verifyOtp } from '../../Api/OtpApis';


// interface OtpModalProps {
//   show: boolean;
//   email: string;
//   onClose: () => void; 
//   onSuccess: (message: string) => void;
// }


// const OtpModal: React.FC<OtpModalProps> = ({
//   email,
//   show,
//   onClose,
//   onSuccess,
// }) => {
//   const dispatch = useDispatch();

//   const [otp, setOtp] = useState('');
//   const [message, setMessage] = useState('');
//   // const { countdown2, startCountdown } = useOtpCountdown(60);
//   const [countdown, setCountdown] = useState<number>(60);  

//   // Countdown timer effect
//   useEffect(() => {
//     if (countdown === 0) return;  
//     const timer = setInterval(() => {
//       setCountdown((prevCountdown) => prevCountdown - 1);
//     }, 1000);

//     return () => clearInterval(timer);  
//   }, [countdown]);

//   const handleVerifyOtp = async (e: React.FormEvent) => {
//     e.preventDefault();

//       const { success, message} = await verifyOtp(email, otp, dispatch);
    
//     if (success) {
//       onSuccess(message);
//       onClose();
//     } else {
//       setMessage(message);
//     }

//   };

//   const handleResendOtp = async () => {
//     setMessage('');
//     setCountdown(60); // Start the countdown
    
//     const { success, message } = await resendOtp(email, dispatch);
    
//     setMessage(message);
    
//     if (!success) {
//       // Reset countdown if failed
//       setCountdown(0);
//     }
//   };

//   // const handleResendOtp = async () => {
//   //   setMessage('');
//   //   dispatch(setLoading());
//   //   setCountdown(60);  

//   //   try {
//   //     await api.post('/otp/send', { email });
//   //     dispatch(setOtpSent(email));
//   //     setMessage('A new OTP has been sent to your email.');
//   //   } catch (error: any) {
//   //     console.error(error);
//   //     dispatch(setError('Error resending OTP.'));
//   //     setMessage('Error resending OTP. Please try again.');
//   //   }
//   // };

//   // If the modal should not be shown, return null
//   if (!show) return null;

//   return (
//     <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
//       <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
//         <h3 className="text-xl font-bold text-center mb-4">Verify OTP</h3>
//         <form onSubmit={handleVerifyOtp}>
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               OTP
//             </label>
//             <input
//               type="text"
//               value={otp}
//               onChange={(e) => setOtp(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-400 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-600"
//               required
//             />
//           </div>
//           <button
//             type="submit"
//             className="w-full py-2 px-4 bg-gray-800 text-white font-semibold rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
//           >
//             Verify OTP
//           </button>
//         </form>

//         <div className="mt-4 text-center">
//           <p className="text-sm font-medium text-red-700">
//             OTP will expire in {countdown} seconds.
//           </p>

//           {countdown === 0 && (
//             <button
//               type="button"
//               onClick={handleResendOtp}
//               className="w-full mt-3 py-2 px-4 bg-blue-600 text-white font-semibold rounded hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
//             >
//               Resend OTP
//             </button>
//           )}
//         </div>

//         {message && (
//           <p className="mt-4 text-center text-sm font-medium text-red-700">
//             {message}
//           </p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default OtpModal;