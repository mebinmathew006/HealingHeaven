import React, { useState } from "react";
import { X, User, Calendar, Video, FileText, Play, Download, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

const ConsultationDetailsModal = ({ 
  isOpen, 
  onClose, 
  consultationData, 
  loading = false,
  baseUrl ='',
}) => {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);

  if (!isOpen) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

 

  const getStatusColor = (status) => {
    const colors = {
      'completed': 'bg-green-100 text-green-800',
      'in_progress': 'bg-yellow-100 text-yellow-800',
      'scheduled': 'bg-blue-100 text-blue-800',
      'cancelled': 'bg-red-100 text-red-800',
      'pending': 'bg-gray-100 text-gray-800'
    };
    return colors[String(status)?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const handleViewVideo = () => {
    if (!consultationData?.video) {
      toast.error("No video available for this consultation");
      return;
    }
    setVideoLoading(true);
    setShowVideoModal(true);
    setVideoLoading(false);
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
  };

  const hasVideo = () => {
    return consultationData?.video && consultationData.video.trim() !== '';
  };

  // Helper function to get profile image URL
  const getProfileImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http')) return imageUrl;
    // Otherwise, prepend baseUrl
    return `${baseUrl}${imageUrl}`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-green-600 mr-3" />
            <span className="text-lg text-gray-700">Loading consultation details...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Consultation Details
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                ID: #{consultationData?.id || 'N/A'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="space-y-6">
              {/* Status and Basic Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date & Time</p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(consultationData?.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  
                  
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(consultationData?.status)}`}>
                        {consultationData?.status || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Participants */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Patient Info */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <User className="w-5 h-5 text-green-600 mr-2" />
                    Patient Information
                  </h3>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                      {consultationData?.user?.user_profile?.profile_image ? (
                        <img
                          src={getProfileImageUrl(consultationData.user.user_profile.profile_image)}
                          alt={consultationData.user.name || 'Patient'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : (
                        <User className="w-8 h-8 text-gray-400" />
                      )}
                      <div className="w-8 h-8 hidden items-center justify-center">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {consultationData?.user?.name || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">Patient</p>
                    </div>
                  </div>
                </div>

                {/* Doctor Info */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <User className="w-5 h-5 text-blue-600 mr-2" />
                    Doctor Information
                  </h3>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                      {consultationData?.doctor?.psychologist_profile?.profile_image ? (
                        <img
                          src={getProfileImageUrl(consultationData.doctor.psychologist_profile.profile_image)}
                          alt={consultationData.doctor.name || 'Doctor'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : (
                        <User className="w-8 h-8 text-gray-400" />
                      )}
                      <div className="w-8 h-8 hidden items-center justify-center">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {consultationData?.doctor?.name || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {consultationData?.doctor?.psychologist_profile?.specialization || 'Psychologist'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analysis Section */}
              {consultationData?.analysis && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <FileText className="w-5 h-5 text-purple-600 mr-2" />
                    Analysis & Notes
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {consultationData.analysis}
                    </p>
                  </div>
                </div>
              )}

              {/* Video Section */}
              {hasVideo() && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Video className="w-5 h-5 text-red-600 mr-2" />
                    Consultation Video
                  </h3>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handleViewVideo}
                      className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      <span>View Video</span>
                    </button>
                    <a
                      href={`${baseUrl}/consultations${consultationData.video}`}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>
              )}

              {/* No Video Message */}
              {!hasVideo() && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Video className="w-5 h-5 text-gray-400 mr-2" />
                    Consultation Video
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No video available for this consultation</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Video Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Consultation Video - #{consultationData?.id || 'N/A'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {consultationData?.user?.name || 'Patient'} & {consultationData?.doctor?.name || 'Doctor'}
                </p>
              </div>
              <button
                onClick={closeVideoModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Video Modal Body */}
            <div className="p-4">
              {videoLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="flex items-center text-gray-600">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    Loading video...
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <video
                    controls
                    className="w-full max-h-[60vh] rounded-lg"
                    preload="metadata"
                    onError={(e) => {
                      console.error("Video load error:", e);
                      toast.error("Error loading video. Please try again or download the file.");
                    }}
                  >
                    <source src={`${baseUrl}/consultations${consultationData.video}`} type="video/mp4" />
                    <source src={`${baseUrl}/consultations${consultationData.video}`} type="video/webm" />
                    <source src={`${baseUrl}/consultations${consultationData.video}`} type="video/ogg" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
            </div>

            {/* Video Modal Footer */}
            <div className="px-4 pb-4">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeVideoModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                <a
                  href={`${baseUrl}/consultations${consultationData.video}`}
                  download
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Download Video
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConsultationDetailsModal;