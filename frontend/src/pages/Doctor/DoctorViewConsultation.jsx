import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  FileText,
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Plus,
  Video,
  Play,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Assuming these are your actual imports - replace as needed
import Pagination from "../../components/Pagination";
import axiosInstance from "../../axiosconfig";
import DoctorSidebar from "../../components/DoctorSidebar";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const DoctorViewConsultation = () => {
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_BASE_URL;
  
  // State management
  const [consultationData, setConsultationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeSection] = useState("doctor_view_consultations");
  const [error, setError] = useState(null);

  // Video modal state
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);

  // Sorting state
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  
  const doctorId = useSelector((state) => state.userDetails.id);

  // Pagination state derived from API response
  const totalCount = consultationData?.count || 0;
  const limit = 10;
  const hasNext = !!consultationData?.next;
  const hasPrevious = !!consultationData?.previous;

  // Sort options
  const sortOptions = [
    { value: "created_at", label: "Date Created", apiField: "created_at" },
    { value: "status", label: "Status", apiField: "status" },
  ];

  // Video modal handlers
  const handleViewVideo = (consultation) => {
    if (consultation.video) {
      setCurrentVideo({
        url: `${baseUrl}/consultations${consultation.video}`,
        title: `Consultation #${consultation.id}`,
        date: consultation.created_at,
        patient: consultation.user?.name || "Unknown Patient"
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
      navigate("/videocall_doctor", {
        state: {
          consultationId: consultation.id,
        },
      });
    } catch (error) {
      console.log(error);
      toast.error("Sorry unable to start !!");
    }
  };

  // API call function with sorting
  const fetchConsultations = async (
    page = 1,
    sort = sortBy,
    order = sortOrder
  ) => {
    try {
      setLoadingMore(page !== 1);
      setLoading(page === 1);

      const sortOption = sortOptions.find((option) => option.value === sort);
      const orderingParam =
        order === "desc" ? `-${sortOption.apiField}` : sortOption.apiField;

      const response = await axiosInstance.get(
        `/consultations/doctor_get_consulations/${doctorId}?page=${page}&limit=${limit}&ordering=${orderingParam}`
      );
      setConsultationData(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch consultations");
      console.error("Error fetching consultations:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchConsultations(page, sortBy, sortOrder);
  };

  const handleNextPage = () => {
    if (hasNext) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchConsultations(nextPage, sortBy, sortOrder);
    }
  };

  const handlePreviousPage = () => {
    if (hasPrevious) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      fetchConsultations(prevPage, sortBy, sortOrder);
    }
  };

  // Sorting handlers
  const handleSortChange = (newSortBy) => {
    let newSortOrder = "desc";

    if (newSortBy === sortBy) {
      newSortOrder = sortOrder === "desc" ? "asc" : "desc";
    }

    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1);
    setShowSortDropdown(false);
    fetchConsultations(1, newSortBy, newSortOrder);
  };

  // Navigate to add analysis page
  const handleAddAnalysis = (consultationId, callDuration = 0) => {
    navigate("/doctor_feedback_page", {
      state: { consultationId, callDuration },
    });
  };

  // Get sort icon
  const getSortIcon = (field) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortOrder === "desc" ? (
      <ArrowDown className="h-4 w-4 text-green-600" />
    ) : (
      <ArrowUp className="h-4 w-4 text-green-600" />
    );
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchConsultations(currentPage, sortBy, sortOrder);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSortDropdown && !event.target.closest(".sort-dropdown")) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSortDropdown]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading consultations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error}</p>
          <button
            onClick={() => fetchConsultations(currentPage, sortBy, sortOrder)}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const currentSortOption = sortOptions.find(
    (option) => option.value === sortBy
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <div>
        <DoctorSidebar activeSection={activeSection} />
      </div>
      <div className="flex-1 bg-gray-50 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Consultation History
            </h1>
            <p className="mt-2 text-gray-600">
              View and manage your consultation records
            </p>
          </div>

          {/* Sort Controls */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">
                Sort by:
              </span>

              {/* Mobile Dropdown */}
              <div className="relative sort-dropdown sm:hidden">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center justify-between w-48 px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <span>{currentSortOption?.label}</span>
                  <div className="flex items-center space-x-1">
                    {getSortIcon(sortBy)}
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </button>

                {showSortDropdown && (
                  <div className="absolute z-10 mt-1 w-48 bg-white border border-gray-300 rounded-lg shadow-lg">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleSortChange(option.value)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                          sortBy === option.value
                            ? "bg-green-50 text-green-700"
                            : "text-gray-700"
                        }`}
                      >
                        <span>{option.label}</span>
                        {getSortIcon(option.value)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Desktop Buttons */}
              <div className="hidden sm:flex items-center space-x-2">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      sortBy === option.value
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <span>{option.label}</span>
                    {getSortIcon(option.value)}
                  </button>
                ))}
              </div>
            </div>

            {/* Results count */}
            <div className="text-sm text-gray-500">
              {totalCount > 0 && (
                <span>
                  Showing {(currentPage - 1) * limit + 1} to{" "}
                  {Math.min(currentPage * limit, totalCount)} of {totalCount}{" "}
                  consultations
                </span>
              )}
            </div>
          </div>

          {/* Consultations List */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            {consultationData?.results?.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No consultations found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {consultationData?.results?.map((consultation, index) => (
                  <div
                    key={consultation.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        {/* Doctor Profile Image */}
                        <div className="flex-shrink-0">
                          {consultation.user?.psychologist_profile
                            ?.profile_image ? (
                            <img
                              src={
                                consultation.user.psychologist_profile
                                  .profile_image
                              }
                              alt={consultation.user?.name || "Doctor"}
                              className="h-12 w-12 rounded-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center"
                            style={{
                              display: consultation.user?.psychologist_profile
                                ?.profile_image
                                ? "none"
                                : "flex",
                            }}
                          >
                            <User className="h-6 w-6 text-gray-400" />
                          </div>
                        </div>

                        {/* Consultation Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Consultation #{index + 1}
                            </h3>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                consultation.status
                              )}`}
                            >
                              {consultation.status || "Unknown"}
                            </span>
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              {consultation.user?.name || "Unknown Patient"}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDate(consultation.created_at)}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-3 mb-4">
                            {/* Rejoin button for pending consultations */}
                            {consultation.status === "Pending" && (
                              <button
                                onClick={() =>
                                  handleRejoinConsultation(consultation)
                                }
                                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors"
                              >
                                <Video className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                  Rejoin
                                </span>
                              </button>
                            )}

                            {/* View Recording button */}
                            {consultation.video && (
                              <button
                                onClick={() => handleViewVideo(consultation)}
                                className="flex items-center space-x-2 px-4 py-2 bg-green-800 text-white hover:bg-green-900 rounded-lg transition-colors"
                              >
                                <Play className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                  View Recording
                                </span>
                              </button>
                            )}
                          </div>

                          {/* Analysis Section */}
                          {consultation.analysis ? (
                            <div className="bg-gray-50 rounded-lg p-4">
                              <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                                <FileText className="h-4 w-4 mr-1" />
                                Analysis
                              </h4>
                              <p className="text-sm text-gray-700 leading-relaxed">
                                {consultation.analysis}
                              </p>
                            </div>
                          ) : (
                            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="text-sm font-medium text-green-900 mb-1 flex items-center">
                                    <FileText className="h-4 w-4 mr-1" />
                                    Analysis Required
                                  </h4>
                                  <p className="text-sm text-green-700">
                                    Add your analysis for this consultation
                                  </p>
                                </div>
                                <button
                                  onClick={() =>
                                    handleAddAnalysis(
                                      consultation.id,
                                      consultation.duration || 0
                                    )
                                  }
                                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                                >
                                  <Plus className="h-4 w-4" />
                                  <span>Add Analysis</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {consultationData?.results?.length > 0 && (
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
                  {currentVideo.patient} • {formatDate(currentVideo.date)}
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
    </div>
  );
};

export default DoctorViewConsultation;