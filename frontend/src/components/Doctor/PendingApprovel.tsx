import { useLocation } from "react-router-dom";

const PendingApprovel = () => {
  const location = useLocation();
  const { status, blockReason } = location.state || {};

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full text-center">
        {status === "blocked" ? (
          // Blocked state with reason
          <>
            <div className="text-red-600 mb-6">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-4 text-red-600">Account Blocked</h1>
            <p className="text-gray-600 mb-6">
              Your account has been blocked by the administrator. Please contact support to resolve this issue.
            </p>
            <div className="bg-red-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-red-800">Block Reason:</h3>
              <p className="mt-1 text-sm text-red-700">{blockReason || "No reason provided"}</p>
            </div>
          </>
        ) : (
          // Pending approval state
          <>
            <div className="text-blue-600 mb-6">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-4 text-gray-800">Approval Pending</h1>
            <p className="text-gray-600 mb-6">
              Your account is currently under review. Once approved, you'll be able to:
            </p>
            <ul className="text-left list-disc list-inside space-y-2 text-gray-600">
              <li>Accept patient appointments</li>
              <li>View and update patient records</li>
              <li>Access full platform features</li>
            </ul>
            <p className="text-gray-500 mt-6 text-sm">
              If you have any questions, please contact the support team.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default PendingApprovel;
