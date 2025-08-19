import React, { useEffect, useState } from "react";
import {
  Search,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";
import UserSidebar from "../../components/UserSidebar";
import { useSelector } from "react-redux";
import { getComplaintsRoute } from "../../services/consultationService";

const UserComplaintView = () => {
  // Sample complaint data based on your schema
  const [activeSection] = useState("user_complaint");
  const [complaints, setComplaints] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const userId =useSelector((state)=>state.userDetails.id)
  
  const fetchComplaint = async ()=>{
    try {
        const response =await getComplaintsRoute(userId);
        setComplaints(response.data)
    } catch (error) {
        console.log(error)
    }
  }
  useEffect(() => {

   fetchComplaint();
  }, []);
  
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in_progress":
        return "bg-green-100 text-green-800 border-green-200";
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "in_progress":
        return <AlertCircle className="w-4 h-4" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4" />;
      case "closed":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "Service Issue":
        return "bg-purple-100 text-purple-800";
      case "Technical Issue":
        return "bg-red-100 text-red-800";
      case "Quality Concern":
        return "bg-orange-100 text-orange-800";
      case "Billing Issue":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || complaint.status === statusFilter;
    const matchesType = typeFilter === "all" || complaint.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const uniqueTypes = [...new Set(complaints.map((c) => c.type))];

  return (
    <div className="flex h-screen bg-gray-100">
      <div>
        <UserSidebar activeSection={activeSection} />
      </div>
      <div className="flex-1 bg-gradient-to-br from-blue-50 to-green-100 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Complaints
            </h1>
            <p className="text-gray-600">
              Track and manage your submitted complaints
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search complaints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                {uniqueTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Complaints List */}
          <div className="space-y-4">
            {filteredComplaints.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No complaints found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              filteredComplaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              complaint.status
                            )} flex items-center gap-1`}
                          >
                            {getStatusIcon(complaint.status)}
                            {complaint.status.replace("_", " ")}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                              complaint.type
                            )}`}
                          >
                            {complaint.type}
                          </span>
                          <span className="text-sm text-gray-500">
                            #{complaint.id}
                          </span>
                        </div>

                        {/* Subject */}
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {complaint.subject}
                        </h3>

                        {/* Description Preview */}
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {complaint.description}
                        </p>

                        {/* Metadata */}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(complaint.created_at)}
                          </div>
                          <div>
                            Consultation ID: {complaint.consultation_id}
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => setSelectedComplaint(complaint)}
                        className="ml-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal for Complaint Details */}
        {selectedComplaint && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Complaint Details
                  </h2>
                  <button
                    onClick={() => setSelectedComplaint(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                {/* Complaint Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                        selectedComplaint.status
                      )} flex items-center gap-2`}
                    >
                      {getStatusIcon(selectedComplaint.status)}
                      {selectedComplaint.status.replace("_", " ")}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(
                        selectedComplaint.type
                      )}`}
                    >
                      {selectedComplaint.type}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Subject
                    </h3>
                    <p className="text-gray-700">{selectedComplaint.subject}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Description
                    </h3>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selectedComplaint.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Complaint ID
                      </h3>
                      <p className="text-gray-700">#{selectedComplaint.id}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Consultation ID
                      </h3>
                      <p className="text-gray-700">
                        {selectedComplaint.consultation_id}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Created At
                      </h3>
                      <p className="text-gray-700">
                        {formatDate(selectedComplaint.created_at)}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Type</h3>
                      <p className="text-gray-700">{selectedComplaint.type}</p>
                    </div>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                  <button
                    onClick={() => setSelectedComplaint(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserComplaintView;
