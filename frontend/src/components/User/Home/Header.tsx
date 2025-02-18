import { assets } from '../../../assets/assets';

const Header : React.FC = () => {

  return (
    <div className="mt-16 flex flex-col lg:flex-row items-center justify-between px-6 lg:px-20 py-10 bg-blue-600 text-white rounded-xl shadow-lg m-6 lg:m-10">
      {/* Left Side */}
      <div className="lg:w-1/2 text-center lg:text-left space-y-6">
        <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
          Book Appointment <br /> With Trusted Doctors
        </h1>
        <div className="flex items-center justify-center lg:justify-start space-x-4">
          <img src={assets.group_profiles} alt="Group Profiles" className="w-12 h-12 rounded-full shadow-lg" />
          <p className="text-lg max-w-md">
            Simply browse through our extensive list of trusted doctors, <br /> schedule your appointment hassle-free.
          </p>
        </div>
        <a
          href="/login"
          className="inline-flex items-center bg-white text-blue-600 px-6 py-3 rounded-full text-lg font-semibold shadow-md hover:bg-gray-200 transition duration-300"
        >
          Book Appointment
          <img src={assets.arrow_icon} alt="Arrow Icon" className="ml-2 w-5" />
        </a>
      </div>
      
      {/* Right Side */}
      <div className="lg:w-1/2 mt-8 lg:mt-0 flex justify-center">
        <img
          src={assets.header_img}
          alt="Header Illustration"
          className="w-full max-w-lg drop-shadow-xl"
        />
      </div>
    </div>
  );
};

export default Header;
