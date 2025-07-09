import { FaStethoscope } from "react-icons/fa";

const Page404 = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#f0f4f8] text-center px-6">
      <FaStethoscope className="text-primaryColor text-6xl mb-4" />
      <h1 className="text-5xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-6">
        Oops! The page you're looking for isn't available.
      </p>
      <p className="text-gray-500 mb-8">
        It might have been moved or deleted. Let’s get you back to care.
      </p>
    </div>
  );
};

export default Page404;
