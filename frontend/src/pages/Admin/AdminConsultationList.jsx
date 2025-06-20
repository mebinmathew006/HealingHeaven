import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Eye,
  Calendar,
  DollarSign,
  User,
  Clock,
} from "lucide-react";
import axiosInstance from "../../axiosconfig";
import AdminSidebar from "../../components/AdminSidebar";

const AdminConsultationList = () => {
  const [consultations, setConsultations] = useState([]);
  const [filteredConsultations, setFilteredConsultations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [activeSection, setActiveSection] = useState("consultation");

  // Mock data - replace with actual API call
  useEffect(() => {
    getConsultations();
   
  }, []);

  const getConsultations = async () => {
    try {
      const response = await axiosInstance.get(
        "/consultations/get_consultation"
      );
      console.log(response.data);
      
      setConsultations(response.data);
      setFilteredConsultations(response.data);
    } catch (error) {}
  };

  // Filter consultations based on search and filter criteria
  useEffect(() => {
    let filtered = consultations.filter((consultation) => {
      const matchesSearch =
        consultation.id.toString().includes(searchTerm) ||
        consultation.user_id.toString().includes(searchTerm) ||
        consultation.psychologist_id.toString().includes(searchTerm);

      const matchesStatus =
        statusFilter === "all" || consultation.status === statusFilter;
      const matchesPaymentStatus =
        paymentStatusFilter === "all" ||
        consultation.payments?.payment_status === paymentStatusFilter;

      return matchesSearch && matchesStatus && matchesPaymentStatus;
    });

    setFilteredConsultations(filtered);
  }, [searchTerm, statusFilter, paymentStatusFilter, consultations]);

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
      completed: "bg-green-100 text-green-800",
      scheduled: "bg-blue-100 text-blue-800",
      in_progress: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          statusStyles[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status.replace("_", " ").toUpperCase()}
      </span>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const statusStyles = {
      paid: "bg-green-100 text-green-800",
      pending: "bg-orange-100 text-orange-800",
      refunded: "bg-blue-100 text-blue-800",
      failed: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          statusStyles[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar activeSection={activeSection} />
      <div className="p-6 bg-gray-50 min-h-screen w-full">
        <div className="max-w-7xl mx-auto ">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Consultation Records
            </h1>
            <p className="text-gray-600">
              Manage and view all consultation sessions
            </p>
          </div>

          

          {/* Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Consultation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Participants
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th> */}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredConsultations.map((consultation) => (
                    <tr key={consultation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <Calendar className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              Consultation #{consultation.id}
                            </div>
                            <div className="text-sm text-gray-500">
                              Created {formatDate(consultation.created_at)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center mb-1">
                            <User className="h-4 w-4 text-gray-400 mr-1" />
                            User: {consultation.user_id}
                          </div>
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-1" />
                            Psychologist: {consultation.psychologist_id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(consultation.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="font-medium mb-1">
                           
                              {consultation.payments?.psychologist_fee || 0
                            }
                          </div>
                          {consultation.payments &&
                            getPaymentStatusBadge(
                              consultation.payments.payment_status
                            )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center mb-1">
                          <Clock className="h-4 w-4 text-gray-400 mr-1" />
                          Created: {formatDate(consultation.created_at)}
                        </div>
                        {consultation.updated_at !==
                          consultation.created_at && (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-400 mr-1" />
                            Updated: {formatDate(consultation.updated_at)}
                          </div>
                        )}
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </button>
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredConsultations.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No consultations found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            )}
          </div>

          {/* Pagination would go here in a real application */}
          {filteredConsultations.length > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {filteredConsultations.length} results
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  Previous
                </button>
                <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminConsultationList;
