import React from 'react';
import { Star, User } from 'lucide-react';

const FeedbackCard = ({ feedback, showPatientInfo = true }) => {
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          {showPatientInfo && (
            <>
              <div className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center flex-shrink-0 mr-3">
                {feedback.user?.user_profile?.profile_image ? (
                  <img 
                    className="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover" 
                    src={feedback.user.user_profile.profile_image} 
                    alt="profile_img" 
                  />
                ) : (
                  <User className="rounded-full bg-blue-500 w-8 h-8 lg:w-10 lg:h-10 text-white p-2" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {feedback.user?.name || feedback.patient_name || 'Anonymous'}
                </h3>
                <p className="text-sm text-gray-500">
                  {formatDate(feedback.created_at)}
                </p>
              </div>
            </>
          )}
          {!showPatientInfo && (
            <div>
              <p className="text-sm text-gray-500">
                {formatDate(feedback.created_at)}
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center">
          <div className="flex mr-2">
            {renderStars(feedback.rating)}
          </div>
          <span className="text-sm font-medium text-gray-700">
            {feedback.rating}/5
          </span>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-gray-700 leading-relaxed">{feedback.message}</p>
      </div>
      
      {/* Additional content can be added here via children or props */}
    </div>
  );
};

export default FeedbackCard;