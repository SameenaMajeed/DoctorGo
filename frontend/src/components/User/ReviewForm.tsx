import { useState, FormEvent } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../../slice/Store/Store";
import { ReviewFormData } from "../../Types";
import { FaStar } from "react-icons/fa";
import api from "../../axios/UserInstance";

interface ReviewFormProps {
    doctorId:string;
  doctorName: string;
  appointmentDate: string;
  onClose: () => void;

}

const ReviewForm: React.FC<ReviewFormProps> = ({
    doctorId,
  doctorName,
  appointmentDate,
  onClose,
}) => {
//   const doctorId = useSelector((state: RootState) => state.doctor.doctor?._id);
  const user = useSelector((state: RootState) => state.user.user);
  const token = useSelector((state: RootState) => state.user.user?.accessToken);
  const [formData, setFormData] = useState<ReviewFormData>({
    doctor_id: doctorId,
    rating: 0,
    reviewText: "",
  });
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [hover, setHover] = useState<number | null>(null);

  console.log(formData)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post("/submitReview", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(response.data)
      setSuccess(response.data.message);
      setFormData({ doctor_id: doctorId, rating: 0, reviewText: "" });
      setTimeout(() => onClose(), 2000); // Close modal after success
    } catch (err: any) {
      setError(err.response.data.message);
    }
  };

  const formatReviewDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-labelledby="review-modal-title"
    >
      <div className="max-w-md w-full mx-auto p-6 bg-white rounded-xl shadow-2xl border border-gray-200 relative transform transition-all duration-300 ease-in-out">
        {/* Close Button (Optional) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Close modal"
        >
          &times;
        </button>

        {/* Header */}
        <h1
          id="review-modal-title"
          className="text-xl font-bold text-gray-800 text-center mb-4"
        >
          {user?.name}'s Review
        </h1>

        {/* Caregiver Info */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-gray-500 text-2xl">👤</span>
          </div>
          <p className="text-lg font-medium text-gray-900 mt-3">{doctorName}</p>
          <p className="text-sm text-gray-600">
            Rate the care provided {formatReviewDate(appointmentDate)}
          </p>
        </div>

        {/* Star Rating */}
        <div className="flex justify-center mb-6" role="radiogroup" aria-label="Rating">
          {[...Array(5)].map((_, index) => {
            const ratingValue = index + 1;
            return (
              <label key={index} className="cursor-pointer mx-1">
                <input
                  type="radio"
                  name="rating"
                  value={ratingValue}
                  onClick={() => setFormData({ ...formData, rating: ratingValue })}
                  className="hidden"
                  aria-label={`Rate ${ratingValue} stars`}
                />
                <FaStar
                  className="cursor-pointer transition-colors duration-200"
                  size={32}
                  color={
                    ratingValue <= (hover || formData.rating) ? "#FFD700" : "#e4e5e9"
                  }
                  onMouseEnter={() => setHover(ratingValue)}
                  onMouseLeave={() => setHover(null)}
                  title={`${ratingValue} star${ratingValue > 1 ? "s" : ""}`}
                />
              </label>
            );
          })}
        </div>

        {/* Comment Section */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Additional Comments...
          </label>
          <textarea
            value={formData.reviewText}
            onChange={(e) =>
              setFormData({ ...formData, reviewText: e.target.value })
            }
            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            // rows="4"
            placeholder="Write your comments here..."
            required
            aria-label="Additional comments"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4">
          <button
            type="button"
            className="px-6 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
            onClick={onClose}
            aria-label="Cancel review"
          >
            Not Now
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-md hover:shadow-lg"
            onClick={handleSubmit}
            aria-label="Submit review"
          >
            Submit Review
          </button>
        </div>

        {/* Error and Success Messages */}
        {(error || success) && (
          <p
            className={`text-center mt-4 ${
              error ? "text-red-500" : "text-green-500"
            }`}
          >
            {error || success}
          </p>
        )}
      </div>
    </div>
  );
};

export default ReviewForm;

// import { useState, FormEvent } from "react";
// import axios from "axios";
// import { useSelector } from "react-redux";
// import { RootState } from "../../slice/Store/Store";
// import { ReviewFormData } from "../../Types";


// const ReviewForm: React.FC = () => {
//   const doctorId = useSelector((state: RootState) => state.doctor.doctor?._id);
//   const token = useSelector((state: RootState) => state.user.user?.accessToken);
//   const [formData, setFormData] = useState<ReviewFormData>({
//     doctor_id : doctorId,
//     rating: 0,
//     reviewText: "",
//   });
//   const [error, setError] = useState<string>("");
//   const [success, setSuccess] = useState<string>("");

//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post("/reviews", formData, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setSuccess(response.data.message);
//       setFormData({ doctor_id : doctorId, rating: 0, reviewText: "" });
//     } catch (err: any) {
//       setError(err.response.data.message);
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
//       <h2 className="text-2xl font-bold mb-4">Add a Review</h2>
//       {error && <p className="text-red-500 mb-4">{error}</p>}
//       {success && <p className="text-green-500 mb-4">{success}</p>}
//       <form onSubmit={handleSubmit}>
//         <div className="mb-4">
//           <label className="block text-gray-700">Rating (1-5)</label>
//           <input
//             type="number"
//             min="1"
//             max="5"
//             value={formData.rating}
//             onChange={(e) =>
//               setFormData({ ...formData, rating: +e.target.value })
//             }
//             className="w-full p-2 border rounded"
//             required
//           />
//         </div>
//         <div className="mb-4">
//           <label className="block text-gray-700">Comment</label>
//           <textarea
//             value={formData.reviewText}
//             onChange={(e) =>
//               setFormData({ ...formData, reviewText: e.target.value })
//             }
//             className="w-full p-2 border rounded"
//             required
//           />
//         </div>
//         <button
//           type="submit"
//           className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
//         >
//           Submit Review
//         </button>
//       </form>
//     </div>
//   );
// };

// export default ReviewForm;
