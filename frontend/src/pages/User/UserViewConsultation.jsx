import React, { useEffect, useState } from "react";
import {
  Calendar,
  User,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Eye,
  ArrowLeft,
  Users,
  Loader2,
} from "lucide-react";
import { useSelector } from "react-redux";
import axiosInstance from "../../axiosconfig";
import UserSidebar from "../../components/UserSidebar";
import LoadingSpinner from "../../components/LoadingSpinner";
import ConsultationsList from "./ConsultationsList";
import ConsultationDetail from "./ConsultationDetail";
import Pagination from "../../components/Pagination"; // Import the reusable component
import { consultationDetailsUser } from "../../services/consultationService";

const UserViewConsultation = () => {
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [consultationData, setConsultationData] = useState([]);
  const [activeSection] = useState("user_consultations");
  const [loading, setLoading] = useState(true);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [limit] = useState(10); // Items per page
  const [loadingMore, setLoadingMore] = useState(false);
  
  const userId = useSelector((state) => state.userDetails.id);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getConsultations = async (page = 1, showLoadingSpinner = true) => {
    try {
      if (showLoadingSpinner) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const response = await consultationDetailsUser(userId,page,limit)
      //  axiosInstance.get(
      //   `/consultations/get_consultation_for_user/${userId}?page=${page}&limit=${limit}`
      // );
      
      console.log("Consultation response:", response.data);
      
      // Update state with paginated data
      setConsultationData(response.data.results || []);
      setTotalCount(response.data.count || 0);
      setHasNext(!!response.data.next);
      setHasPrevious(!!response.data.previous);
      setCurrentPage(page);
      
    } catch (error) {
      console.error("Error fetching consultations:", error);
      // Reset data on error
      setConsultationData([]);
      setTotalCount(0);
      setHasNext(false);
      setHasPrevious(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    getConsultations(1);
  }, [userId]);

  // Pagination handlers
  const handleNextPage = () => {
    if (hasNext && !loadingMore) {
      getConsultations(currentPage + 1, false);
    }
  };

  const handlePreviousPage = () => {
    if (hasPrevious && !loadingMore) {
      getConsultations(currentPage - 1, false);
    }
  };

  const handlePageChange = (page) => {
    if (page !== currentPage && !loadingMore) {
      getConsultations(page, false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateText = (text, maxLength = 200) => {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // Main render logic
  return selectedConsultation ? (
    <div className="flex h-screen bg-gray-100">
      <div>
        <UserSidebar activeSection={activeSection} />
      </div>
      <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 p-6 overflow-auto">
        <ConsultationDetail 
          consultation={selectedConsultation} 
          getStatusColor={getStatusColor} 
          truncateText={truncateText}  
          getStatusIcon={getStatusIcon} 
          formatDate={formatDate} 
          setSelectedConsultation={setSelectedConsultation}
        />
      </div>
    </div>
  ) : (
    <div className="flex h-screen bg-gray-100">
      <div>
        <UserSidebar activeSection={activeSection} />
      </div>
      <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 p-6 overflow-auto">
        <ConsultationsList 
          consultationData={consultationData} 
          getStatusColor={getStatusColor} 
          truncateText={truncateText}  
          getStatusIcon={getStatusIcon} 
          formatDate={formatDate} 
          setSelectedConsultation={setSelectedConsultation}
        />
        
        {/* Reusable Pagination Component */}
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
        
        {/* Loading indicator for pagination */}
        {loadingMore && (
          <div className="flex justify-center mt-4">
            <div className="flex items-center text-sm text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Loading more consultations...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserViewConsultation;