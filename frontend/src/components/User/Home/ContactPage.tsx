import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { assets } from '../../../assets/assets';

const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {/* Contact Us Section */}
      <section className="flex-1 py-24 px-6 md:px-8 bg-gray-50">
        <h2 className="text-4xl font-bold text-center mb-10 text-gray-800">CONTACT US</h2>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/3 w-full mb-6 md:mb-0">
            <img
              src={assets.contact_image}
              alt="DoctorGo"
              className="w-full h-auto rounded-xl shadow-lg object-cover"
            />
          </div>
          <div className="md:w-2/3 w-full md:pl-8 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">OUR OFFICE</h3>
              <p className="text-gray-600 leading-relaxed">
                64709 Willms Station<br />
                near college, Palakkad , Pattambi
              </p>
              <p className="text-gray-600 leading-relaxed mt-2">
                Tel: 8901234500<br />
                Email: <a href="doctorgo@gmail.com" className="text-blue-600 hover:underline">doctorgo@gmail.com</a>
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">CAREERS AT DOCTOR GO</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Learn more about our teams and job openings.
              </p>
              <a
                href="/careers" // Replace with actual careers page URL
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-300"
              >
                Explore Jobs
              </a>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default ContactPage;