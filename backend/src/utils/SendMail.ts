import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const sentMail = async (
  email: string,
  subject: string,
  body: string,
): Promise<boolean> => {
  try {
    // smtp server set up

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: process.env.AUTH_EMAIL,
            pass: process.env.AUTH_PASS,
        }
    })


    const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: subject,
            html: body,
        };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error: any) {
    console.log(error.message);
    return false;
  }
};