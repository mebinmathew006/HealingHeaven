// DoctorNotificationsPage
import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, Filter, Search, RefreshCw } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNotifications } from '../../utils/NotificationContext';
import { useNotificationSound } from '../../utils/useNotificationSound';
import DoctorSidebar from '../../components/DoctorSidebar';

const DoctorNotificationsPage = () => {
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const userDetails = useSelector((state) => state.userDetails);

  // Get notification state and functions
  const { 
    notifications, 
    unreadCount, 
    connectionStatus, 
    markAsRead, 
    markAllAsRead, 
    removeNotification,
    sendNotification 
  } = useNotifications();

  // Enable notification sound
  useNotificationSound();

  // Filter notifications based on filter and search
  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || 
                         (filter === 'unread' && !notification.read) ||
                         (filter === 'read' && notification.read);
    
    const matchesSearch = notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Notification helper functions
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return date.toLocaleDateString();
  };

  const formatFullDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message': return '💬';
      case 'appointment': return '📅';
      case 'reminder': return '⏰';
      case 'system': return '🔔';
      default: return '🔔';
    };
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'message': return 'border-l-blue-500 bg-blue-50';
      case 'appointment': return 'border-l-green-500 bg-green-50';
      case 'reminder': return 'border-l-yellow-500 bg-yellow-50';
      case 'system': return 'border-l-purple-500 bg-purple-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  // Handle notification selection
  const toggleNotificationSelection = (notificationId) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId) 
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const selectAllNotifications = () => {
    setSelectedNotifications(filteredNotifications.map(n => n.id));
  };

  const clearSelection = () => {
    setSelectedNotifications([]);
  };

  // Bulk actions
  const markSelectedAsRead = () => {
    selectedNotifications.forEach(id => {
      const notification = notifications.find(n => n.id === id);
      if (notification && !notification.read) {
        markAsRead(id);
      }
    });
    clearSelection();
  };

  const deleteSelected = () => {
    selectedNotifications.forEach(id => {
      removeNotification(id);
    });
    clearSelection();
  };

//   // Test function (for development)
//   const handleSendTestNotification = () => {
//     if (userDetails.id) {
//       const types = ['message', 'appointment', 'reminder', 'system'];
//       const randomType = types[Math.floor(Math.random() * types.length)];
//       const messages = [
//         'New appointment scheduled',
//         'You have a new message',
//         'Reminder: Check your tasks',
//         'System maintenance completed'
//       ];
//       const randomMessage = messages[Math.floor(Math.random() * messages.length)];
//       sendNotification(userDetails.id, randomMessage, randomType);
//     }
//   };

  return (
    <div className="flex h-screen bg-gray-100">
        <div>
            <DoctorSidebar/>
        </div>
      {/* Header */}
    <div className="flex-1 bg-gray-50 overflow-auto">

      
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Bell className="w-8 h-8 text-blue-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600">
                {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
              </p>
            </div>
          </div>
          
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500' : 
              connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            <span className="text-sm text-gray-600 capitalize">{connectionStatus}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {/* Filter Buttons */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {['all', 'unread', 'read'].map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    filter === filterType
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                  {filterType === 'unread' && unreadCount > 0 && (
                    <span className="ml-1 bg-red-500 text-white text-xs px-1 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Mark all read</span>
              </button>
            )}

            {/* Test Button (Remove in production) */}
            {/* <button
              onClick={handleSendTestNotification}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Test</span>
            </button> */}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedNotifications.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedNotifications.length} notification{selectedNotifications.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={markSelectedAsRead}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                <Check className="w-3 h-3" />
                <span>Mark read</span>
              </button>
              <button
                onClick={deleteSelected}
                className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
              <button
                onClick={clearSelection}
                className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No matching notifications' : 
               filter === 'unread' ? 'No unread notifications' :
               filter === 'read' ? 'No read notifications' : 'No notifications yet'}
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 
               filter === 'unread' ? 'All notifications have been read' :
               'New notifications will appear here'}
            </p>
          </div>
        ) : (
          <>
            {/* Select All Button */}
            <div className="flex justify-between items-center">
              <button
                onClick={selectedNotifications.length === filteredNotifications.length ? clearSelection : selectAllNotifications}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {selectedNotifications.length === filteredNotifications.length ? 'Deselect all' : 'Select all'}
              </button>
              <span className="text-sm text-gray-500">
                {filteredNotifications.length} notification{filteredNotifications.length > 1 ? 's' : ''}
              </span>
            </div>

            {/* Notification Cards */}
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow-sm border-l-4 transition-all duration-200 hover:shadow-md ${
                  !notification.read ? getNotificationColor(notification.notification_type) : 'border-l-gray-300'
                } ${selectedNotifications.includes(notification.id) ? 'ring-2 ring-blue-500' : ''}`}
              >
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Selection Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={() => toggleNotificationSelection(notification.id)}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />

                    {/* Notification Icon */}
                    <div className="flex-shrink-0">
                      <span className="text-2xl">
                        {getNotificationIcon(notification.notification_type)}
                      </span>
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                            {notification.message}
                          </p>
                          <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                            <span className="capitalize">{notification.notification_type}</span>
                            <span>•</span>
                            <span>{formatTime(notification.created_at)}</span>
                            <span>•</span>
                            <span>{formatFullDate(notification.created_at)}</span>
                          </div>
                        </div>

                        {/* Status and Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.read && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              New
                            </span>
                          )}
                          
                          <div className="flex space-x-1">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Mark as read"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            
                            <button
                              onClick={() => removeNotification(notification.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete notification"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
      </div>
    </div>
  );
};

export default DoctorNotificationsPage;