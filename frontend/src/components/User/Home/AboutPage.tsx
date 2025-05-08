import React from 'react';
import { assets } from '../../../assets/assets';
import Navbar from './Navbar';
import Footer from './Footer';

const AboutPage : React.FC = () => {
  return (
    <div className="container mx-auto p-6">
        <Navbar/>
      {/* About Us Section */}
      <section  className="flex-1 py-24 px-6 md:px-8 bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-6">ABOUT US</h2>
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/3 mb-6 md:mb-0">
            <img
              src={assets.about_image} 
              alt="DoctorGo"
              className="w-full h-auto rounded-lg shadow-md"
            />
         </div>
          <div className="md:w-2/3 md:pl-6">
            <p className="text-gray-700 mb-4">
              Welcome to DoctorGo, Your Trusted Partner in Managing Your Healthcare Needs Conveniently and Efficiently.
            </p>
            <p className="text-gray-700 mb-4">
              At DoctorGo, We Understand The Challenges Individuals Face When It Comes To Scheduling Doctor Appointments And Managing Their Health Records.
            </p>
            <p className="text-gray-700 mb-4">
            DoctorGo is Committed To Excellence in Healthcare Technology. We Continuously Strive To Enhance Our Platform, Integrating The Latest Advancements To Improve User Experience And Deliver Superior Service.
            </p>
            <p className="text-gray-700 mb-4">
              Whether You're Booking Your First Appointment Or Managing Ongoing Care, DoctorGo is Here To Support You Every Step Of The Way.
            </p>
            <p className="text-gray-700 mb-4">
              <strong>Our Vision</strong> At DoctorGo is To Create A Seamless Healthcare Experience For Every User. We Aim To Bridge The Gap Between Patients And Healthcare Providers, Making It Easier For You To Access The Care You Need, When You Need It.
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-6">WHY CHOOSE US</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">EFFICIENCY:</h3>
            <p className="text-gray-700">
              Streamlined Appointment Scheduling That Fits Into Your Busy Lifestyle.
            </p>
          </div>
          <div className="border p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">CONVENIENCE:</h3>
            <p className="text-gray-700">
              Access To A Network Of Trusted Healthcare Professionals In Your Area.
            </p>
          </div>
          <div className="border p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">PERSONALIZATION:</h3>
            <p className="text-gray-700">
              Tailored Recommendations And Reminders To Help You Stay On Top Of Your Health.
            </p>
          </div>
        </div>
      </section>
      <Footer/>
    </div>
  );
};

export default AboutPage;