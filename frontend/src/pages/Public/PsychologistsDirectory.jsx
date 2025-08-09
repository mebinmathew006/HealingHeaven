import React, { useEffect, useState } from "react";
import axiosInstance from "../../axiosconfig";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  SquareUser,
  Star,
} from "lucide-react";
import Pagination from "../../components/Pagination";

const PsychologistCard = ({ psychologistsData }) => {
  const id = psychologistsData.user.id;
  const rating = psychologistsData.rating;
  const name = psychologistsData.user.name;
  const specialty = psychologistsData.specialization;
  const limitedSpecialty =
    specialty?.split(" ").slice(0, 2).join(" ") +
    (specialty?.split(" ").length > 2 ? "..." : "");
  const availability = psychologistsData.is_available;
  const imageSrc = psychologistsData.profile_image;

  // Mock data for demonstration
  const userId = useSelector((state) => state.userDetails.id);
  const navigate = useNavigate();

  // Function to render star rating
  const renderStarRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      );
    }

    // Half star
    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className="w-4 h-4 text-gray-300" />
          <Star
            className="w-4 h-4 fill-yellow-400 text-yellow-400 absolute top-0 left-0"
            style={{ clipPath: "inset(0 50% 0 0)" }}
          />
        </div>
      );
    }

    // Empty stars
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }

    return stars;
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl ps-16 pe-16 pt-7 pb-7 flex flex-col items-center hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 max-w-sm mx-auto border border-gray-100">
      {/* Availability Status */}
      <div className="w-full mb-4">
        {availability ? (
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-center space-x-1 bg-blue-50 text-green-700 px-3 py-2 rounded-full border border-green-200">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Available Now</span>
            </div>
            <div className="flex items-center justify-center space-x-1 text-green-600">
              <Clock className="w-3 h-3" />
              <span className="text-xs">Ready for consultation</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-center space-x-1 bg-red-50 text-red-700 px-3 py-2 rounded-full border border-red-200">
              <XCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Unavailable Now</span>
            </div>
            <div className="flex items-center justify-center space-x-1 text-red-600">
              <Calendar className="w-3 h-3" />
              <span className="text-xs">Please check back later</span>
            </div>
          </div>
        )}
      </div>

      {/* Profile Image */}
      <div className="relative w-32 h-32 mb-4 overflow-hidden rounded-full border-4 border-gray-100 shadow-lg">
        <img
          src={imageSrc || "/powerpoint-template-icons-b.jpg"}
          className="w-full h-full object-cover"
          alt={name || "Psychologist"}
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "flex";
          }}
        />
        <div className="hidden w-full h-full items-center justify-center bg-gray-100">
          <SquareUser className="w-16 h-16 text-gray-400" />
        </div>
      </div>

      {/* Psychologist Details */}
      <div className="text-center w-full">
        <h3 className="font-bold text-xl text-gray-800 mb-2 leading-tight">
          {name}
        </h3>

        {/* Specialty */}
        <div className="mb-3">
          <p className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full inline-block border max-w-full">
            {limitedSpecialty}
          </p>
        </div>

        {/* Rating */}
        <div className="mb-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="flex items-center space-x-1">
              {renderStarRating(rating)}
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {rating?.toFixed(1) || "0.0"}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          className="bg-green-800 hover:bg-green-700 text-white px-8 py-3 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          onClick={() =>
            userId
              ? navigate("/user_view_psychologist_details", {
                  state: { psychologistsData },
                })
              : navigate("/public_view_psychologist_details", {
                  state: { psychologistsData },
                })
          }
        >
          View Profile
        </button>
      </div>
    </div>
  );
};

export default function PsychologistsDirectory() {
  const userDetails = useSelector((state) => state.userDetails);
  const [psychologists, setpsychologists] = useState([]);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const totalCount = psychologists?.count || 0;
  const limit = 8;
  const hasNext = !!psychologists?.next;
  const hasPrevious = !!psychologists?.previous;
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  useEffect(() => {
    getpsychos();
  }, []);

  const getpsychos = async (page = 1) => {
    setLoadingMore(page !== 1);
    setLoading(page === 1);
    try {
      const response = await axiosInstance.get(`users/psychologists?page=${page}&limit=${limit}`);

      setpsychologists(response.data);
      console.log(response.data);
    } catch (error) {
      console.log(error);
    }finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };
  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    getpsychos(page);
  };

  const handleNextPage = () => {
    if (hasNext) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      getpsychos(nextPage);
      
    }
  };

  const handlePreviousPage = () => {
    if (hasPrevious) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      getpsychos(prevPage);
    }
  };

  return (
    <div className="h-fit mx-auto p-6 bg-gradient-to-br from-blue-50  to-green-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Explore Our Licensed Psychologists
        </h1>

        {!userDetails.name ? (
          <button
            onClick={() => navigate("/signup")}
            className="bg-green-800 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer"
          >
            Register as a Psychologist
          </button>
        ) : (
          <div></div>
        )}
      </div>

      <p className="text-gray-700 mb-8 max-w-4xl">
        Our team of licensed psychologists is dedicated to providing
        personalized mental health support. Each therapist brings unique
        expertise and a compassionate approach to help you on your journey to
        better mental health.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {psychologists.results && psychologists.results.length > 0 ? (
          psychologists.results.map((psych) => (
            <PsychologistCard key={psych.id} psychologistsData={psych} />
          ))
        ) : (
          <p>No Psychologists available</p>
        )}
      </div>
      {totalCount > limit && (
              <Pagination
                currentPage={currentPage}
                totalCount={totalCount}
                limit={limit}
                hasNext={hasNext}
                hasPrevious={hasPrevious}
                loading={loadingMore}
                onPageChange={handlePageChange}
                onNextPage={handleNextPage}
                onPreviousPage={handlePreviousPage}
              />
            )}
    </div>
  );
}
