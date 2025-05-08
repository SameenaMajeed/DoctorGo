import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../axios/UserInstance";
import toast from "react-hot-toast";

interface IReview {
  _id: string;
  doctor_id: string;
  user_id: { name: string; profilePicture?: string };
  reviewText: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const DoctorReviews: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await api.get(`/reviews/doctor/${doctorId}`);
        setReviews(response.data.data || []);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        toast.error("Failed to load reviews.");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [doctorId]);

  if (loading) {
    return <p className="text-center text-gray-600">Loading reviews...</p>;
  }

  return (
    <section className="bg-white p-6 rounded-lg shadow-lg mt-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Patient Reviews</h2>
      {reviews.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="py-3 px-4 text-left font-semibold">Reviewer</th>
                <th className="py-3 px-4 text-left font-semibold">Rating</th>
                <th className="py-3 px-4 text-left font-semibold">Review</th>
                <th className="py-3 px-4 text-left font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr
                  key={review._id}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4 flex items-center">
                    <img
                      src={
                        review.user_id.profilePicture ||
                        "https://via.placeholder.com/40?text=User"
                      }
                      alt={review.user_id.name}
                      className="w-8 h-8 rounded-full mr-2"
                      onError={(e) =>
                        (e.currentTarget.src =
                          "https://via.placeholder.com/40?text=User")
                      }
                    />
                    <span className="text-gray-800">{review.user_id.name}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex text-yellow-400">
                      {[...Array(Math.round(review.rating))].map((_, i) => (
                        <svg
                          key={i}
                          className="w-4 h-4 fill-current"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.5 3 1-5.5L2 8l5.5-1L10 2l2.5 5 5.5 1-3.5 4.5 1 5.5z" />
                        </svg>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-sm max-w-xs truncate">
                    "{review.reviewText}"
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-sm">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500">No reviews available.</p>
      )}
    </section>
  );
};

export default DoctorReviews;