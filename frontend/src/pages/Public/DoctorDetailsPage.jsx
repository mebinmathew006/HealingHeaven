import React, { useEffect, useState } from "react";
import {
  Star,
  Award,
  GraduationCap,
  CheckCircle,
  MessageSquare,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import VideoCallPermissionModal from "../../components/VideoCallPermissionModal";
import FeedbackCard from "../../components/FeedbackCard";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getFeedbacksRoute } from "../../services/consultationService";

const DoctorDetailsPage = ({}) => {
  const [showModal, setShowModal] = useState(false);
  const [doctor, setDoctor] = useState({});
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbacksLoading, setFeedbacksLoading] = useState(true);
  const location = useLocation();
  const { psychologistsData } = location.state;
  const rating = psychologistsData.rating;
  const id = psychologistsData.user.id;
  const userid = useSelector((state)=>state.userDetails.id)
  useEffect(() => {
    setDoctor(psychologistsData);
    fetchDoctorFeedbacks();
  }, []);
  async function fetchDoctorFeedbacks() {
    try {
      setFeedbacksLoading(true);
      const response = await getFeedbacksRoute(id);
      const feedbackData = Array.isArray(response.data) ? response.data : [];
      setFeedbacks(feedbackData);
    } catch (error) {
      console.error("Error fetching doctor feedback:", error);
      setFeedbacks([]);
    } finally {
      setFeedbacksLoading(false);
    }
  }
  const handleStartCall = () => {
    console.log("Starting call...");
    setShowModal(false);
  };
  // const handleChatOption = () => {
  //   if (!userid){
  //     toast.error('Please Login first',{position:'bottom-center'})
  //     return
  //   }

  // };

  const handleVideoCall = () => {
    setShowModal(true);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getAverageRating = () => {
    if (!Array.isArray(feedbacks) || feedbacks.length === 0) return 0;
    const sum = feedbacks.reduce((acc, feedback) => acc + (feedback.rating || 0), 0);
    return (sum / feedbacks.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (!Array.isArray(feedbacks)) return distribution;
    
    feedbacks.forEach(feedback => {
      const rating = feedback.rating;
      if (rating >= 1 && rating <= 5) {
        distribution[rating]++;
      }
    });
    return distribution;
  };

  const ratingDistribution = getRatingDistribution();
  const totalFeedbacks = Array.isArray(feedbacks) ? feedbacks.length : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 ">
      {/* Header */}
      {doctor && (
        <>
          <div className="shadow-sm">
            <div className="max-w-6xl mx-auto px-4 py-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Doctor Image */}
                <div className="flex-shrink-0">
                  <img
                    src={
                      doctor.profile_image || "/powerpoint-template-icons-b.jpg"
                    }
                    alt={doctor?.user?.name}
                    className="w-48 h-48 rounded-2xl object-cover shadow-lg"
                  />
                </div>

                {/* Doctor Info */}
                <div className="flex-1">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {doctor?.user?.name}
                      </h1>
                      <p className="text-xl text-green-900 mb-3">
                        {doctor.specialization}
                      </p>

                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 text-yellow-400 fill-current" />
                          <span className="font-semibold">{parseFloat(rating).toFixed(1)}</span>
                          <span className="text-gray-600">({totalFeedbacks} reviews)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="w-5 h-5 text-green-600" />
                          <span className="text-gray-700">
                            {doctor.experience} Years experience
                          </span>
                        </div>
                      </div>

                      
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* About */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold mb-4">
                    About Dr.{" "}
                    {doctor.user?.name ? doctor.user.name.split(" ")[1] : ""}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {doctor.about_me}
                  </p>
                </div>

                {/* Education */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-green-600" />
                    Education & Training
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">
                        {doctor.qualification}
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Specializations */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold mb-4">
                    Specializations
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="bg-green-50 text-green-800 px-4 py-2 rounded-lg">
                      {doctor.specialization}
                    </div>
                  </div>
                </div>

                {/* Fees */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-semibold mb-4">
                    Consultation Fee
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-green-600">
                      ₹{doctor.fees}
                    </span>
                    <span className="text-gray-600">per consultation</span>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Quick Book */}
                {doctor.is_available &&
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-xl font-semibold mb-4">Consultation</h3>
                    <div className="space-y-4">
                      <button
                        onClick={handleVideoCall}
                        className="w-full bg-green-700 hover:bg-green-900 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors"
                      >
                        Consult Now
                      </button>
                    </div>
                  </div>
                }
                {/* Conditionally render modal here */}
                {showModal && (
                  <VideoCallPermissionModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onStartCall={handleStartCall}
                    doctor={{
                      id : id,
                      name: doctor.user?.name ,
                      fees: doctor?.fees,
                      image:doctor?.profile_image,
                    }}
                    
                  />
                )}
              </div>
            </div>

            {/* Feedback Section */}
            <div className="mt-12 space-y-8">
              {/* Feedback Statistics */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold mb-6">Patient Reviews</h3>
                
                {/* Overall Rating */}
                <div className="flex items-center gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900">{getAverageRating()}</div>
                    <div className="flex justify-center mt-1 mb-2">
                      {renderStars(Math.round(parseFloat(getAverageRating())))}
                    </div>
                    <div className="text-sm text-gray-600">{totalFeedbacks} review{totalFeedbacks !== 1 ? 's' : ''}</div>
                  </div>
                  
                  {/* Rating Distribution */}
                  <div className="flex-1 max-w-md">
                    {[5, 4, 3, 2, 1].map(rating => (
                      <div key={rating} className="flex items-center mb-2">
                        <div className="flex items-center w-12">
                          <span className="text-sm font-medium text-gray-700 mr-1">{rating}</span>
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        </div>
                        <div className="flex-1 mx-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full"
                              style={{
                                width: totalFeedbacks > 0 ? `${(ratingDistribution[rating] / totalFeedbacks) * 100}%` : '0%'
                              }}
                            ></div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-600 w-8 text-right">
                          {ratingDistribution[rating]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Individual Feedback Cards */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Patient Feedback</h3>
                
                {feedbacksLoading ? (
                  <div className="bg-white rounded-xl p-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                    <p className="text-gray-500 mt-4">Loading feedback...</p>
                  </div>
                ) : feedbacks.length === 0 ? (
                  <div className="bg-white rounded-xl p-12 text-center">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                    <p className="text-gray-500">Be the first to leave a review for this doctor.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {feedbacks.slice(0, 5).map((feedback) => (
                      <FeedbackCard 
                        key={feedback.id} 
                        feedback={feedback} 
                        showPatientInfo={true}
                      />
                    ))}
                    {feedbacks.length > 5 && (
                      <div className="text-center mt-6">
                        <button className="text-green-600 hover:text-green-700 font-medium">
                          View all {feedbacks.length} reviews
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DoctorDetailsPage;