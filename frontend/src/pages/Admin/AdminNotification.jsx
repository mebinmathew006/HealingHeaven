import React, { useEffect, useState } from "react";
import { Plus, Bell, Send, AlertCircle, CheckCircle, X } from "lucide-react";

import AdminSidebar from "../../components/AdminSidebar";
import axiosInstance from "../../axiosconfig";

const AdminNotification = () => {
  const [activeSection, setActiveSection] = useState("notifications");
  const [formData, setFormData] = useState({
    title: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });

  useEffect(() => {

    fetchNotifications()
  }, []);

  const fetchNotifications = async () => {
   const response = await axiosInstance.get('/consultations/get_all_notifications')
    setNotifications(response.data)
    console.log(response.data)
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: "", message: "" }), 3000);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      showAlert("error", "Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axiosInstance.post(
        "/consultations/create_new_notification",
        formData
      );

      const newNotification = {
        id: Date.now(),
        title: formData.title,
        message: formData.message,
        created_at: new Date().toISOString(),
      };

      setNotifications((prev) => [newNotification, ...prev]);
      setFormData({ title: "", message: "" });
      setShowForm(false);
      showAlert("success", "Notification created successfully!");
    } catch (error) {
      console.log(error);
      showAlert("error", "Failed to create notification. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    showAlert("success", "Notification deleted successfully!");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar activeSection={activeSection} />
      <div className="flex-1 bg-gray-50 overflow-auto">
        <div className="max-w-4xl mx-auto p-6">
          <div className="space-y-8">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-500 rounded-xl">
                      <Bell className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-slate-800">
                        Notification Manager
                      </h1>
                      <p className="text-slate-600">
                        Create and manage system notifications
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Notification</span>
                  </button>
                </div>
              </div>

              {/* Alert */}
              {alert.show && (
                <div
                  className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
                    alert.type === "success"
                      ? "bg-green-50 border border-green-200 text-green-800"
                      : "bg-red-50 border border-red-200 text-red-800"
                  }`}
                >
                  {alert.type === "success" ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="font-medium">{alert.message}</span>
                </div>
              )}

              {/* Add Notification Form */}
              {showForm && (
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden mb-6">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
                    <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                      <Plus className="h-5 w-5" />
                      <span>Create New Notification</span>
                    </h2>
                  </div>

                  <div className="p-6 space-y-6">
                    <div>
                      <label
                        htmlFor="title"
                        className="block text-sm font-semibold text-slate-700 mb-2"
                      >
                        Notification Title
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter notification title..."
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-semibold text-slate-700 mb-2"
                      >
                        Notification Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Enter detailed message..."
                        rows="4"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white resize-none"
                        required
                      />
                    </div>

                    <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="px-6 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            <span>Creating...</span>
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            <span>Create Notification</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications List */}
              <div className="bg-white rounded-2xl shadow-lg border border-slate-100">
                <div className="p-6 border-b border-slate-100">
                  <h2 className="text-xl font-semibold text-slate-800">
                    Recent Notifications
                  </h2>
                  <p className="text-slate-600 mt-1">
                    {notifications.length} notification
                    {notifications.length !== 1 ? "s" : ""} total
                  </p>
                </div>

                <div className="divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="p-4 bg-slate-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Bell className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-600 mb-2">
                        No notifications yet
                      </h3>
                      <p className="text-slate-500">
                        Create your first notification to get started
                      </p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="p-6 hover:bg-slate-50 transition-colors duration-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Bell className="h-4 w-4 text-blue-600" />
                              </div>
                              <h3 className="text-lg font-semibold text-slate-800">
                                {notification.title}
                              </h3>
                            </div>
                            <p className="text-slate-600 mb-3 leading-relaxed">
                              {notification.message}
                            </p>
                            <p className="text-sm text-slate-500">
                              Created: {formatDate(notification.created_at)}
                            </p>
                          </div>
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 ml-4"
                            title="Delete notification"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotification;
