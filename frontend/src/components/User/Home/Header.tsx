import { assets } from "../../../assets/assets";

const Header: React.FC = () => {
  return (
    <div className="mt-16 flex flex-col lg:flex-row items-center justify-between px-6 lg:px-20 py-12 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-2xl shadow-xl mx-6 lg:mx-10 transition-all duration-300">
      {/* Left Side */}
      <div className="lg:w-1/2 text-center lg:text-left space-y-6">
        <h1 className="text-5xl font-extrabold leading-snug">
          Book Appointments <br />
          With <span className="text-yellow-300">Trusted Doctors</span>
        </h1>
        <div className="flex items-center justify-center lg:justify-start space-x-4">
          <img
            src={assets.group_profiles}
            alt="Group Profiles"
            className="w-14 h-14 rounded-full shadow-lg hover:scale-105 transition-all duration-300"
          />
          <p className="text-lg max-w-md leading-relaxed">
            Find top-rated doctors & schedule your appointment <br />
            hassle-free in just a few clicks.
          </p>
        </div>
        <a
          href="/login"
          className="inline-flex items-center bg-white text-blue-600 px-7 py-3 rounded-full text-lg font-semibold shadow-lg hover:bg-gray-200 transition-all duration-300"
        >
          Book Appointment
          <img src={assets.arrow_icon} alt="Arrow Icon" className="ml-3 w-6" />
        </a>
      </div>

      {/* Right Side */}
      <div className="lg:w-1/2 mt-10 lg:mt-0 flex justify-center">
        <img
          src={assets.header_img}
          alt="Header Illustration"
          className="w-full max-w-lg drop-shadow-2xl hover:scale-105 transition-all duration-300"
        />
      </div>
    </div>
  );
};

export default Header;
