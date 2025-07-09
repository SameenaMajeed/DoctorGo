import { useState, FormEvent } from "react";
// import { useSelector } from "react-redux";
// import { RootState } from "../../slice/Store/Store";
import { IReviewFormData } from "../../Types";
import { FaStar } from "react-icons/fa";
import api from "../../axios/UserInstance";

interface IReviewFormProps {
  doctorId: string;
  doctorName: string;
  appointmentDate: string;
  appointmentId: string;
  onClose: () => void;
  existingReview?: {
    rating: number;
    reviewText: string;
    _id?: string;
  };
}

const ReviewForm: React.FC<IReviewFormProps> = ({
  doctorId,
  doctorName,
  appointmentDate,
  appointmentId,
  onClose,
  existingReview,
}) => {
  // const user = useSelector((state: RootState) => state.user.user);
  // const token = useSelector((state: RootState) => state.user.user?.accessToken);
  const [formData, setFormData] = useState<IReviewFormData>({
    doctor_id: doctorId,
    rating: existingReview?.rating || 0,
    reviewText: existingReview?.reviewText || "",
    reviewId: existingReview?._id || undefined,
  });
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [hover, setHover] = useState<number | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      console.log('Submitting review with:', {
        doctor_id: formData.doctor_id,
        appointment_id: appointmentId,
        reviewText: formData.reviewText,
        rating: formData.rating
      });

      let response;

      if (formData.reviewId) {
        // Update existing review
        response = await api.put(`/updateReview/${formData.reviewId}`, formData)
      } else {
        // Create new review
        response = await api.post("/submitReview", {
          ...formData,
          appointment_id: appointmentId
        });
      }

      console.log(response.data);
      setSuccess(response.data.message);
      setTimeout(() => onClose(), 2000);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to submit review. Please try again.";
      setError(errorMessage);

      // If it's a duplicate review error, close the form after 3 seconds
      if (errorMessage.includes("already reviewed")) {
        setTimeout(() => onClose(), 3000);
      }
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
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Close modal"
        >
          &times;
        </button>

        <h1
          id="review-modal-title"
          className="text-xl font-bold text-gray-800 text-center mb-4"
        >
          {existingReview ? "Edit Your Review" : "Add Your Review"}
        </h1>

        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-gray-500 text-2xl">👤</span>
          </div>
          <p className="text-lg font-medium text-gray-900 mt-3">{doctorName}</p>
          <p className="text-sm text-gray-600">
            {existingReview
              ? "Update your review for"
              : "Rate the care provided"}{" "}
            {formatReviewDate(appointmentDate)}
          </p>
        </div>

        <div
          className="flex justify-center mb-6"
          role="radiogroup"
          aria-label="Rating"
        >
          {[...Array(5)].map((_, index) => {
            const ratingValue = index + 1;
            return (
              <label key={index} className="cursor-pointer mx-1">
                <input
                  type="radio"
                  name="rating"
                  value={ratingValue}
                  onClick={() =>
                    setFormData({ ...formData, rating: ratingValue })
                  }
                  className="hidden"
                  aria-label={`Rate ${ratingValue} stars`}
                />
                <FaStar
                  className="cursor-pointer transition-colors duration-200"
                  size={32}
                  color={
                    ratingValue <= (hover || formData.rating)
                      ? "#FFD700"
                      : "#e4e5e9"
                  }
                  onMouseEnter={() => setHover(ratingValue)}
                  onMouseLeave={() => setHover(null)}
                  title={`${ratingValue} star${ratingValue > 1 ? "s" : ""}`}
                />
              </label>
            );
          })}
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            {existingReview ? "Update your comments" : "Additional Comments..."}
          </label>
          <textarea
            value={formData.reviewText}
            onChange={(e) =>
              setFormData({ ...formData, reviewText: e.target.value })
            }
            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder={
              existingReview
                ? "Update your comments..."
                : "Write your comments here..."
            }
            required
            aria-label="Additional comments"
          />
        </div>

        <div className="flex justify-center gap-4">
          <button
            type="button"
            className="px-6 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
            onClick={onClose}
            aria-label="Cancel review"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-md hover:shadow-lg"
            onClick={handleSubmit}
            aria-label="Submit review"
          >
            {existingReview ? "Update Review" : "Submit Review"}
          </button>
        </div>

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
