export interface IEmailVerificationService {
    sendVerificationOTP(doctorId: string, newEmail: string): Promise<{ message: string }>;
    verifyOTPAndChangeEmail(doctorId: string , otp: string): Promise<{ message: string }>;
}