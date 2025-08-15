import React, { useState, useEffect } from 'react';
import { Star,MessageSquare, TrendingUp, Users, BarChart3 } from 'lucide-react';
import { useSelector } from 'react-redux';
import DoctorSidebar from '../../components/DoctorSidebar';
import FeedbackCard from '../../components/FeedbackCard'; // Import the new component
import { getFeedbacksRoute } from '../../services/consultationService';

const DoctorViewFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [ratingFilter] = useState('all');
  const [searchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortBy] = useState('newest');
  const doctorId = useSelector((state) => state.userDetails.id);
  const [activeSection] = useState("doctor_view_feedback");
  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await getFeedbacksRoute(doctorId)
      const feedbackData = Array.isArray(response.data) ? response.data : [];
      setFeedbacks(feedbackData);
      setFilteredFeedbacks(feedbackData);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      // Set empty array on error
      setFeedbacks([]);
      setFilteredFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchFeedback();
  }, []);
  useEffect(() => {
    if (!Array.isArray(feedbacks)) return;
    let filtered = feedbacks;
    // Filter by rating
    if (ratingFilter !== 'all') {
      filtered = filtered.filter(feedback => feedback.rating === parseInt(ratingFilter));
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(feedback =>
        feedback.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.patient_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort feedbacks
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'highest_rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest_rating':
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      default:
        break;
    }

    setFilteredFeedbacks(filtered);
  }, [ratingFilter, searchTerm, sortBy, feedbacks]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div>
        <DoctorSidebar activeSection={activeSection} />
      </div>
      <div className="flex-1 bg-gray-50 overflow-auto m-5">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            
          </div>

          {/* Statistics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Feedback</p>
                  <p className="text-2xl font-bold text-gray-900">{totalFeedbacks}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <div className="flex items-center">
                    <p className="text-2xl font-bold text-gray-900 mr-2">{getAverageRating()}</p>
                    <div className="flex">
                      {renderStars(Math.round(parseFloat(getAverageRating())))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">5-Star Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">{ratingDistribution[5]}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Satisfaction Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalFeedbacks > 0 ? Math.round(((ratingDistribution[4] + ratingDistribution[5]) / totalFeedbacks) * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map(rating => (
                <div key={rating} className="flex items-center">
                  <div className="flex items-center w-20">
                    <span className="text-sm font-medium text-gray-700 mr-2">{rating}</span>
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{
                          width: totalFeedbacks > 0 ? `${(ratingDistribution[rating] / totalFeedbacks) * 100}%` : '0%'
                        }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {ratingDistribution[rating]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h1>Feedbacks</h1>
          </div>

          {/* Feedback Cards */}
          <div className="space-y-6">
            {filteredFeedbacks.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback found</h3>
                <p className="text-gray-500">No feedback matches your current filters.</p>
              </div>
            ) : (
              filteredFeedbacks.map((feedback) => (
                <FeedbackCard 
                  key={feedback.id} 
                  feedback={feedback} 
                  showPatientInfo={true}
                />
              ))
            )}
          </div>

          {/* Show results count */}
          {filteredFeedbacks.length > 0 && (
            <div className="mt-6 text-center text-sm text-gray-500">
              Showing {filteredFeedbacks.length} of {totalFeedbacks} feedback{totalFeedbacks !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorViewFeedback;