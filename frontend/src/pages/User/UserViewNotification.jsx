import React, { useCallback, useEffect, useState } from "react";
import {
  Bell,
  BellRing,
  Clock,
  Mail,
  MailOpen,
  Trash2,
  Filter,
  Search,
  Calendar,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useSelector } from "react-redux";
import axiosInstance from "../../axiosconfig";
import UserSidebar from "../../components/UserSidebar";
import LoadingSpinner from "../../components/LoadingSpinner";
import Pagination from "../../components/Pagination";

const UserViewNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection] = useState("user_notifications");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [limit] = useState(10);
  const [loadingMore, setLoadingMore] = useState(false);

  const userId = useSelector((state) => state.userDetails.id);

  const getNotifications = useCallback(
  async (page = 1, showLoadingSpinner = true) => {
    try {
      if (showLoadingSpinner) setLoading(true);
      else setLoadingMore(true);

      const response = await axiosInstance.get(
        `/consultations/get_notifications/?page=${page}&limit=${limit}`
      );
      setNotifications(response.data.results || []);
      setTotalCount(response.data.count || 0);
      setHasNext(!!response.data.next);
      setHasPrevious(!!response.data.previous);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
      setTotalCount(0);
      setHasNext(false);
      setHasPrevious(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  },
  [limit] // include other dependencies if used inside
);

useEffect(() => {
  getNotifications(1);
}, [userId, getNotifications]);

 

  // Pagination handlers
  const handleNextPage = () => {
    if (hasNext && !loadingMore) {
      getNotifications(currentPage + 1, false);
    }
  };

  const handlePreviousPage = () => {
    if (hasPrevious && !loadingMore) {
      getNotifications(currentPage - 1, false);
    }
  };

  const handlePageChange = (page) => {
    if (page !== currentPage && !loadingMore) {
      getNotifications(page, false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getNotificationIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "info":
        return <Info className="w-5 h-5 text-green-500" />;
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

 



 

  if (loading) {
    return <LoadingSpinner />;
  }

  // Notification Detail Modal
  const NotificationModal = ({ notification, onClose }) => {
    if (!notification) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getNotificationIcon(notification.type)}
                <h2 className="text-xl font-semibold text-gray-900">
                  {notification.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-4 flex items-center text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-2" />
              {formatDate(notification.created_at)}
            </div>
            
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">
                {notification.message}
              </p>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              {/* <button
                onClick={() => deleteNotification(notification.id)}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                Delete
              </button> */}
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
        <div>
      <UserSidebar activeSection={activeSection} />

        </div>
      
      <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 p-6 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
              <p className="text-gray-600">Stay updated with your latest notifications</p>
            </div>
           
          </div>
        </div>

       

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-500">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-green-50 transition-colors cursor-pointer ${
                    !notification.is_read ? 'bg-white border-l-4 ' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex-shrink-0">
                        {!notification.is_read ? (
                          <Mail className="w-6 h-6 text-green-600" />
                        ) : (
                          <MailOpen className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={`text-sm font-medium truncate ${
                            !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h3>
                          <div className="flex items-center text-xs text-gray-500 ml-2">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDate(notification.created_at)}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                    
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
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

      {/* Notification Detail Modal */}
      <NotificationModal
        notification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
      />
    </div>
  );
};

export default UserViewNotification;