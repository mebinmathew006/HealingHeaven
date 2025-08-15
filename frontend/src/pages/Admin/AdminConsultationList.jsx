import React, { useState, useEffect } from "react";
import {
  Calendar,
  User,
  Clock,
  FileText,
  TrendingUp,
  Filter,
  X,
} from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar";
import Pagination from "../../components/Pagination";
import { getConsultationRoute } from "../../services/consultationService";

const AdminConsultationList = () => {
  const [consultations, setConsultations] = useState([]);
  const [activeSection, setActiveSection] = useState("consultation");
  
  // Date filtering state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination handlers
  const [currentPage, setCurrentPage] = useState(1);
  const totalCount = consultations?.count || 0;
  const limit = 10;
  const hasNext = !!consultations?.next;
  const hasPrevious = !!consultations?.previous;
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    getConsultations(page);
  };

  const handleNextPage = () => {
    if (hasNext) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      getConsultations(nextPage);
    }
  };

  const handlePreviousPage = () => {
    if (hasPrevious) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      getConsultations(prevPage);
    }
  };

  const handleDateFilter = () => {
    setCurrentPage(1);
    getConsultations(1);
  };

  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
    getConsultations(1);
  };

  useEffect(() => {
    getConsultations();
  }, []);

  const getConsultations = async (page = 1) => {
    setLoadingMore(page !== 1);
    setLoading(page === 1);
    try {
      // Build query parameters
      let queryParams = `page=${page}&limit=${limit}`;
      
      // Add date filters if they exist
      if (startDate) {
        queryParams += `&start_date=${startDate}`;
      }
      if (endDate) {
        queryParams += `&end_date=${endDate}`;
      }
      const response = await getConsultationRoute(queryParams);
      setConsultations(response);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      completed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      scheduled: "bg-green-50 text-green-700 border border-green-200",
      in_progress: "bg-amber-50 text-amber-700 border border-amber-200",
      cancelled: "bg-red-50 text-red-700 border border-red-200",
      pending: "bg-orange-50 text-orange-700 border border-orange-200",
    };

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
          statusStyles[status] || "bg-gray-50 text-gray-700 border border-gray-200"
        }`}
      >
        {status.replace("_", " ").toUpperCase()}
      </span>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const statusStyles = {
      paid: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      pending: "bg-orange-50 text-orange-700 border border-orange-200",
      refunded: "bg-green-50 text-green-700 border border-green-200",
      failed: "bg-red-50 text-red-700 border border-red-200",
    };

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
          statusStyles[status] || "bg-gray-50 text-gray-700 border border-gray-200"
        }`}
      >
        {status.toUpperCase()}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  // Stats cards data
  const getStats = () => {
    const results = consultations?.results || [];
    const totalConsultations = consultations?.count || 0;
    const completedConsultations = results.filter(c => c.status === 'completed').length;
    const pendingConsultations = results.filter(c => c.status === 'pending').length;
    const totalRevenue = results.reduce((sum, c) => sum + (c.payments?.psychologist_fee || 0), 0);

    return [
      {
        title: "Total Consultations",
        value: totalConsultations,
        icon: FileText,
        color: "text-green-600",
        bgColor: "bg-green-50",
      },
      {
        title: "Completed",
        value: completedConsultations,
        icon: Calendar,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
      },
      {
        title: "Pending",
        value: pendingConsultations,
        icon: Clock,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
      },
      {
        title: "Revenue (Current Page)",
        value: formatCurrency(totalRevenue),
        icon: TrendingUp,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
      },
    ];
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar activeSection={activeSection} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading consultations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar activeSection={activeSection} />
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Consultation Management
            </h1>
            <p className="text-gray-600">
              Monitor and manage all consultation sessions across the platform
            </p>
          </div>

          {/* Date Filter Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filter by Date:</span>
              </div>
              
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">From:</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">To:</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <button
                  onClick={handleDateFilter}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Apply Filter
                </button>
                
                {(startDate || endDate) && (
                  <button
                    onClick={clearDateFilter}
                    disabled={loading}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Clear Filter
                  </button>
                )}
              </div>
              
              {(startDate || endDate) && (
                <div className="text-sm text-gray-600 bg-green-50 px-3 py-1 rounded-full">
                  Filtering: {startDate || 'Beginning'} to {endDate || 'Now'}
                </div>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {getStats().map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Consultations Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Consultations
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Consultation Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Participants
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timeline
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {consultations?.results?.map((consultation) => (
                    <tr key={consultation.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                              <Calendar className="h-6 w-6 text-white" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">
                              Consultation #{consultation.id}
                            </div>
                            <div className="text-sm text-gray-500">
                              Created {formatDate(consultation.created_at)}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-900">
                            <div className="flex-shrink-0 h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                              <User className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <span className="font-medium">User ID:</span> {consultation.user_id}
                            </div>
                          </div>
                          <div className="flex items-center text-sm text-gray-900">
                            <div className="flex-shrink-0 h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                              <User className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                              <span className="font-medium">Psychologist ID:</span> {consultation.psychologist_id}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(consultation.status)}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-2">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(consultation.payments?.psychologist_fee || 0)}
                          </div>
                          {consultation.payments && (
                            <div>
                              {getPaymentStatusBadge(consultation.payments.payment_status)}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-2 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                            <div>
                              <span className="font-medium">Created:</span><br />
                              {formatDate(consultation.created_at)}
                            </div>
                          </div>
                          {consultation.updated_at && consultation.updated_at !== consultation.created_at && (
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                              <div>
                                <span className="font-medium">Updated:</span><br />
                                {formatDate(consultation.updated_at)}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {(!consultations?.results || consultations.results.length === 0) && (
              <div className="text-center py-12">
                <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No consultations found
                </h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  There are currently no consultation records to display. New consultations will appear here.
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalCount > limit && (
            <div className="flex justify-center">
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
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminConsultationList;