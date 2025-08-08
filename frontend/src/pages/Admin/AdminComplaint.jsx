import React, { useEffect, useState } from "react";
import { Edit2, Save, X as CloseIcon, Filter, Search, Play as PlayIcon, Eye, Loader2, X, Calendar, Clock, FileText, User } from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar";
import axiosInstance from "../../axiosconfig";
import Pagination from "../../components/Pagination";
import { toast } from "react-toastify";
import { getCompliantConsultation } from "../../services/consultationService";
import ConsultationDetailsModal from "../../components/Consultaion/ConsultationDetailsModal";


// Main AdminComplaint Component
const AdminComplaint = () => {
  const baseurl = import.meta.env.VITE_BASE_URL;
  const [complaints, setComplaints] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingStatus, setEditingStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [activeSection] = useState("admin_complaints");
  
  // Video modal state
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);

  // Consultation modal state
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [consultationData, setConsultationData] = useState(null);
  const [consultationLoading, setConsultationLoading] = useState(false);

  // Pagination handlers
    const [currentPage, setCurrentPage] = useState(1);
    const totalCount = complaints?.count || 0;
    const limit = 10;
    const hasNext = !!complaints?.next;
    const hasPrevious = !!complaints?.previous;
    const [loadingMore, setLoadingMore] = useState(false);
    const handlePageChange = (page) => {
      setCurrentPage(page);
      fetchComplaints(page);
    };
    const handleNextPage = () => {
      if (hasNext) {
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        fetchComplaints(page=nextPage);
      }
    };
    const handlePreviousPage = () => {
      if (hasPrevious) {
        const prevPage = currentPage - 1;
        setCurrentPage(prevPage);
        fetchComplaints(page=prevPage);
      }
    };
    // --------------------

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleConsultationView = async (consultationId) => {
    setConsultationLoading(true);
    setShowConsultationModal(true);
    try {
      const data = await getCompliantConsultation(consultationId);
      setConsultationData(data);
    } catch (error) {
      console.error("Error fetching consultation:", error);
      toast.error("Failed to fetch consultation details", {position: 'bottom-center'});
      setShowConsultationModal(false);
    } finally {
      setConsultationLoading(false);
    }
  };

  const closeConsultationModal = () => {
    setShowConsultationModal(false);
    setConsultationData(null);
  };

  const fetchComplaints = async (page = 1, showLoadingSpinner = true) => {
    if (showLoadingSpinner) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
    try {
      const response = await axiosInstance.get(
        `/consultations/get_compliants?page=${page}&limit=${limit}`
      );
      console.log(response.data.results)
      setComplaints(response.data);
      setLoading(false);
      setLoadingMore(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const statusOptions = [
    "pending",
    "In Progress",
    "Resolved",
    "Rejected",
  ];

  const getStatusColor = (status) => {
    const colors = {
      Open: "bg-red-100 text-red-800",
      "In Progress": "bg-yellow-100 text-yellow-800",
      Resolved: "bg-green-100 text-green-800",
      Closed: "bg-gray-100 text-gray-800",
      Rejected: "bg-purple-100 text-purple-800",
      Pending: "bg-green-100 text-green-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const handleEdit = (complaint) => {
    setEditingId(complaint.id);
    setEditingStatus(complaint.status);
  };

  const handleSave = async (id) => {
    try {
        console.log(id,editingStatus)
      // Here you would make an API call to update the complaint status
      await axiosInstance.patch(`/consultations/update_complaints/${id}`, {editingStatus});

      setEditingId(null);
      setEditingStatus("");
      fetchComplaints();
      toast.success(" Updated complaint status",{position:'bottom-center'});
    } catch (error) {
      console.error("Error updating complaint status:", error);
      toast.error("Failed to update complaint status",{position:'bottom-center'});
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingStatus("");
  };

  
  const closeVideoModal = () => {
    setShowVideoModal(false);
    setSelectedVideo(null);
  };


  const filteredComplaints = complaints.results && complaints.results.filter((complaint) => {
    const matchesSearch =
      complaint.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || complaint.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading complaints...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar activeSection={activeSection} />
      <div className="p-6 bg-gray-50 min-h-screen w-full">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Complaint Management
            </h1>
            <p className="text-gray-600">
              Manage and update complaint statuses
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow mb-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="all">All Statuses</option>
                  {statusOptions.map((status) => (
                    <option  key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            {statusOptions.map((status) => {
              const count = complaints.results.filter(
                (c) => c.status === status
              ).length;
              return (
                <div key={status} className="bg-white rounded-lg shadow p-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {count}
                  </div>
                  <div className="text-sm text-gray-600">{status}</div>
                </div>
              );
            })}
          </div>

          {/* Complaints Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sl.No
                    </th>
                   
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Consultaion
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredComplaints.map((complaint,index) => (
                    <tr key={complaint.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{index+1}
                      </td>
                     
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {complaint.type}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {complaint.subject}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-sm truncate">
                        {complaint.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button 
                          onClick={() => handleConsultationView(complaint.consultation_id)}
                          className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                        >
                          View
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === complaint.id ? (
                          <select
                            value={editingStatus}
                            onChange={(e) => setEditingStatus(e.target.value)}
                            className="text-sm px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          >
                            {statusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              complaint.status
                            )}`}
                          >
                            {complaint.status}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {editingId === complaint.id ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleSave(complaint.id)}
                              className="text-green-600 hover:text-green-800 transition-colors"
                              title="Save"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleCancel}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="Cancel"
                            >
                              <CloseIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEdit(complaint)}
                            className="text-green-600 hover:text-green-800 transition-colors"
                            title="Edit Status"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredComplaints.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">
                  No complaints found matching your criteria
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-500">
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
            
          </div>
        </div>

        {/* Loading indicator for pagination */}
        {loadingMore && (
          <div className="flex justify-center mt-4">
            <div className="flex items-center text-sm text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Loading more Complaints...
            </div>
          </div>
        )}
      </div>

      {/* Consultation Details Modal */}
      <ConsultationDetailsModal
        isOpen={showConsultationModal}
        onClose={closeConsultationModal}
        consultationData={consultationData}
        loading={consultationLoading}
        baseUrl={baseurl}
      />

      {/* Video Modal */}
      {showVideoModal && selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Complaint Video - #{selectedVideo.id}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedVideo.subject} | {selectedVideo.type}
                </p>
              </div>
              <button
                onClick={closeVideoModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
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
                      // toast.error("Error loading video. Please check if the video file exists and is accessible.");
                    }}
                  >
                    <source src={selectedVideo.video_url} type="video/mp4" />
                    <source src={selectedVideo.video_url} type="video/webm" />
                    <source src={selectedVideo.video_url} type="video/ogg" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-4 pb-4">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeVideoModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                {selectedVideo.video_url && (
                  <a
                    href={selectedVideo.video_url}
                    download
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Download Video
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminComplaint;


