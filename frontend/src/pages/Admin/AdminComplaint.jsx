import React, { useState, useEffect } from "react";
import { Edit2, Save, X, Filter, Search } from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar";
import axiosInstance from "../../axiosconfig";
import Pagination from "../../components/Pagination";

const AdminComplaint = () => {
  const [complaints, setComplaints] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingStatus, setEditingStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("admin_complaints");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [limit] = useState(10); // Items per page
  const [loadingMore, setLoadingMore] = useState(false);

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
  useEffect(() => {
    fetchComplaints();
  }, []);
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
      setComplaints(response.data.results);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };
  const statusOptions = [
    "Pending",
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
    } catch (error) {
      console.error("Error updating complaint status:", error);
      alert("Failed to update complaint status");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingStatus("");
  };

  const filteredComplaints = complaints.filter((complaint) => {
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
        {/* <div className="min-h-screen bg-gray-50 p-6"> */}
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search complaints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Statuses</option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
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
              const count = complaints.filter(
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
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Consultation ID
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
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredComplaints.map((complaint) => (
                    <tr key={complaint.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{complaint.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {complaint.consultation_id}
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === complaint.id ? (
                          <select
                            value={editingStatus}
                            onChange={(e) => setEditingStatus(e.target.value)}
                            className="text-sm px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEdit(complaint)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
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
            Showing {filteredComplaints.length} of {complaints.length}{" "}
            complaints
          </div>
        </div>
      </div>
      {/* Loading indicator for pagination */}
        {loadingMore && (
          <div className="flex justify-center mt-4">
            <div className="flex items-center text-sm text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Loading more Complainat...
            </div>
          </div>
        )}
    </div>
  );
};

export default AdminComplaint;
