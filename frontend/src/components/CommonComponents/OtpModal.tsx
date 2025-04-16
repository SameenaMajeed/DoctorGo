import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import api from '../../axios/UserInstance';
import {
  setLoading,
  setError,
  setOtpSent,
  setOtpVerified,
  setOtpExpired,
} from '../../slice/Otp/otpSlice';
import { resendOtp, verifyOtp } from '../../Api/OtpApis';


interface OtpModalProps {
  show: boolean;
  email: string;
  onClose: () => void; 
  onSuccess: (message: string) => void;
}


const OtpModal: React.FC<OtpModalProps> = ({
  email,
  show,
  onClose,
  onSuccess,
}) => {
  const dispatch = useDispatch();

  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  // const { countdown2, startCountdown } = useOtpCountdown(60);
  const [countdown, setCountdown] = useState<number>(60);  

  // Countdown timer effect
  useEffect(() => {
    if (countdown === 0) return;  
    const timer = setInterval(() => {
      setCountdown((prevCountdown) => prevCountdown - 1);
    }, 1000);

    return () => clearInterval(timer);  
  }, [countdown]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

      const { success, message, expired } = await verifyOtp(email, otp, dispatch);
    
    if (success) {
      onSuccess(message);
      onClose();
    } else {
      setMessage(message);
    }

  };

  const handleResendOtp = async () => {
    setMessage('');
    setCountdown(60); // Start the countdown
    
    const { success, message } = await resendOtp(email, dispatch);
    
    setMessage(message);
    
    if (!success) {
      // Reset countdown if failed
      setCountdown(0);
    }
  };

  // const handleResendOtp = async () => {
  //   setMessage('');
  //   dispatch(setLoading());
  //   setCountdown(60);  

  //   try {
  //     await api.post('/otp/send', { email });
  //     dispatch(setOtpSent(email));
  //     setMessage('A new OTP has been sent to your email.');
  //   } catch (error: any) {
  //     console.error(error);
  //     dispatch(setError('Error resending OTP.'));
  //     setMessage('Error resending OTP. Please try again.');
  //   }
  // };

  // If the modal should not be shown, return null
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-xl font-bold text-center mb-4">Verify OTP</h3>
        <form onSubmit={handleVerifyOtp}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OTP
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-3 py-2 border border-gray-400 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-600"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-gray-800 text-white font-semibold rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
          >
            Verify OTP
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm font-medium text-red-700">
            OTP will expire in {countdown} seconds.
          </p>

          {countdown === 0 && (
            <button
              type="button"
              onClick={handleResendOtp}
              className="w-full mt-3 py-2 px-4 bg-blue-600 text-white font-semibold rounded hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Resend OTP
            </button>
          )}
        </div>

        {message && (
          <p className="mt-4 text-center text-sm font-medium text-red-700">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default OtpModal;