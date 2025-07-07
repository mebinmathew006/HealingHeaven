import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  User,
  FileText,
  Clock,
  CheckCircle,
  Eye,
  Users,
  Video,
  Star,
  Play,
  X,
} from "lucide-react";
import { toast } from "react-toastify";

// Consultation List View
export default function ConsultationsList({
  consultationData,
  getStatusColor,
  getStatusIcon,
  formatDate,
  truncateText,
  setSelectedConsultation,
}) {
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_BASE_URL;

  // Video modal state
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);

  // Video modal handlers
  const handleViewVideo = (consultation) => {
    if (consultation.video) {
      setCurrentVideo({
        url: `${baseUrl}/consultations${consultation.video}`,
        title: `Session with ${consultation.user?.name || "Psychologist"}`,
        date: consultation.created_at,
        psychologist: consultation.user?.name || "Unknown Psychologist",
        specialization: consultation.user?.psychologist_profile?.specialization || "General Practice"
      });
      setShowVideoModal(true);
    }
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
    setCurrentVideo(null);
  };

  const handleRejoinConsultation = async (consultation) => {
    try {
      // Navigate to videocall page with required state
      console.log(consultation);

      navigate("/videocall_user", {
        state: {
          doctorId: consultation.user.id,
          consultationId: consultation.id,
        },
      });
    } catch (error) {
      console.log(error);
      toast.error("Sorry unable to start !!");
    }
  };

  const handleFeedback = async (consultationId) => {
    try {
      navigate("/user_feedback_page", {
        state: { consultation_id: consultationId },
      });
    } catch (error) {
      console.log(error);
    }
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeVideoModal();
      }
    };

    if (showVideoModal) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [showVideoModal]);

  return (
    <>
      <div className="flex-1 bg-gradient-to-br from-green-50 to-indigo-100 p-6 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">My Consultations</h1>
          </div>
          <p className="text-gray-600">View and manage your therapy sessions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">
                  Total Sessions
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {consultationData.length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-900">
                  {
                    consultationData.filter((c) => c.status === "completed")
                      .length
                  }
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {consultationData.filter((c) => c.status === "pending").length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Consultations List */}
        <div className="space-y-4">
          {consultationData.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No consultations yet
              </h3>
              <p className="text-gray-500">
                Your consultation history will appear here
              </p>
            </div>
          ) : (
            consultationData.map((consultation, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-indigo-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {consultation.user?.name || "Unknown Psychologist"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {consultation.user?.psychologist_profile
                            ?.specialization || "General Practice"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div
                        className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(
                          consultation.status
                        )}`}
                      >
                        {getStatusIcon(consultation.status)}
                        <span className="text-sm font-medium capitalize">
                          {consultation.status}
                        </span>
                      </div>

                      {/* Rejoin button for pending consultations */}
                      {consultation.status === "Pending" && (
                        <button
                          onClick={() => handleRejoinConsultation(consultation)}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors"
                        >
                          <Video className="w-4 h-4" />
                          <span className="text-sm font-medium">Rejoin</span>
                        </button>
                      )}

                      {/* View Recording button */}
                      {consultation.video && (
                        <button
                          onClick={() => handleViewVideo(consultation)}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-900 text-white hover:bg-green-800 rounded-lg transition-colors"
                        >
                          <Play className="w-4 h-4" />
                          <span className="text-sm font-medium">View Recording</span>
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedConsultation(consultation)}
                        className="flex items-center space-x-2 px-4 py-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-sm font-medium">View Details</span>
                      </button>

                      <button
                        onClick={() => handleFeedback(consultation.id)}
                        className="flex items-center space-x-2 px-4 py-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <Star className="w-4 h-4" />
                        <span className="text-sm font-medium">Feedback</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(consultation.created_at)}</span>
                    </div>
                  </div>

                  {consultation.analysis && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        {truncateText(consultation.analysis, 150)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Video Modal */}
      {showVideoModal && currentVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {currentVideo.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {currentVideo.psychologist} • {currentVideo.specialization} • {formatDate(currentVideo.date)}
                </p>
              </div>
              <button
                onClick={closeVideoModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  src={currentVideo.url}
                  controls
                  className="w-full h-auto max-h-[60vh]"
                  controlsList="nodownload"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}