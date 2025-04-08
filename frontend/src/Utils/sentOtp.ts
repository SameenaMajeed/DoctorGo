import api from '../axios/UserInstance';
import { setLoading, setError } from '../slice/user/userSlice';
import { setOtpSent } from '../slice/Otp/otpSlice';
import { Dispatch } from 'redux';

const sendOtp = async (email: string, dispatch: Dispatch): Promise<{ success: boolean; message: string }> => {
    try {
        dispatch(setLoading());
        const response = await api.post('/otp/send', { email });
        dispatch(setOtpSent(email));
        return { success: true, message: response.data.message || 'OTP sent successfully.' };
    } catch (error: any) {
        console.error('Error sending OTP:', error);
        const errorMessage = error.response?.data?.message || 'Failed to send OTP. Please try again.';
        dispatch(setError(errorMessage));
        return { success: false, message: errorMessage };
    }
};

export default sendOtp;
