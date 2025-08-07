import React, { useEffect, useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import {
  User,
  Shield,
  ShieldOff,
  Mail,
  Calendar,
} from "lucide-react";
import axiosInstance from "../../axiosconfig";
import { toast } from "react-toastify";
import Pagination from "../../components/Pagination";

function AdminUser() {
  useEffect(() => {
    fetchUsers();
  }, []);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeSection, setActiveSection] = useState("account");

  // Pagination handlers
  const [currentPage, setCurrentPage] = useState(1);
  const totalCount = users?.count || 0;
  const limit = 8;
  const hasNext = !!users?.next;
  const hasPrevious = !!users?.previous;
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchUsers(page,searchTerm);
  };
  const handleNextPage = () => {
    if (hasNext) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchUsers(nextPage,searchTerm);
    }
  };
  const handlePreviousPage = () => {
    if (hasPrevious) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      fetchUsers(prevPage,searchTerm);
    }
  };
  // --------------------

  const fetchUsers = async (page = 1,searchTerm) => {
    setLoadingMore(page !== 1);
    setLoading(page === 1);
    const search = searchTerm || ''
    try {
      const response = await axiosInstance.get(
        `users/admin_view_users?page=${page}&limit=${limit}&search=${search}`
      );
      setUsers(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const searchUser = async (value,page = 1) => {
    setSearchTerm(value)
    fetchUsers(1, value); 
  };

  const handleBlockToggle = async (userId) => {
    try {
      const response = await axiosInstance.patch(
        `/users/toggle_user_status/${userId}`
      );
      fetchUsers();
      toast.success("User Status Changed Successfully", {
        position: "bottom-center",
      });
    } catch (error) {
      toast.error("User Status Change Failed", { position: "bottom-center" });
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    if (status) {
      return `${baseClasses} bg-green-100 text-green-800`;
    } else {
      return `${baseClasses} bg-red-100 text-red-800`;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar activeSection={activeSection} />
      <div className="flex-1 bg-gray-50 overflow-auto">
        <div className=" mx-auto p-6">
          <div className="space-y-8">
            <div className="p-6 bg-white rounded-lg shadow-lg">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  User Management
                </h2>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => searchUser(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        User
                      </th>

                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Email
                      </th>

                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Join Date
                      </th>

                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  {users.results && (
                    <tbody>
                      {users.results.map((user, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {user.name}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {user.email_address}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={getStatusBadge(user.is_active)}>
                              {user.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-gray-600 flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {user.created_at}
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleBlockToggle(user.id)}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                  user.is_active === true
                                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                                    : "bg-green-100 text-green-700 hover:bg-green-200"
                                }`}
                              >
                                {user.is_active === true ? (
                                  <>
                                    <ShieldOff className="w-4 h-4 inline mr-1" />
                                    Block
                                  </>
                                ) : (
                                  <>
                                    <Shield className="w-4 h-4 inline mr-1" />
                                    Unblock
                                  </>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  )}
                </table>
              </div>

              {/* Stats */}
              {Array.isArray(users.results) ? (
                <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-600">
                  <div>Total Users: {users.results.length}</div>
                  <div>
                    Active: {users.results.filter((u) => u.is_active == true).length}
                  </div>
                  <div>
                    Blocked: {users.results.filter((u) => u.is_active == false).length}
                  </div>
                  {users && <div>Showing:{users.results.length}</div>}
                </div>
              ) : (
                <div>
                  <div colSpan="6" className="text-center py-6 text-gray-500">
                    No users found.
                  </div>
                </div>
              )}
            </div>
            {totalCount > limit && (
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
      
    </div>
  );
}

export default AdminUser;
