// import React, { useState, useRef, useEffect } from 'react';
// import { Bell } from 'lucide-react';
// import { useSelector } from 'react-redux';
// import { useNotifications } from '../utils/NotificationContext';
// import { useNotificationSound } from '../utils/useNotificationSound';


// const NotificationDropdown = ({ className = "" }) => {
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const dropdownRef = useRef(null);
//   const userDetails = useSelector((state) => state.userDetails);

//   // Get notification state and functions
//   const { 
//     notifications, 
//     unreadCount, 
//     connectionStatus, 
//     markAsRead, 
//     markAllAsRead, 
//     removeNotification,
//     sendNotification 
//   } = useNotifications();

//   // Enable notification sound
//   useNotificationSound();

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     function handleClickOutside(event) {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsDropdownOpen(false);
//       }
//     }
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   // Notification helper functions
//   const formatTime = (timestamp) => {
//     const date = new Date(timestamp);
//     const now = new Date();
//     const diff = now - date;
    
//     if (diff < 60000) return 'Just now';
//     if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
//     if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
//     return `${Math.floor(diff / 86400000)}d ago`;
//   };

//   const getNotificationIcon = (type) => {
//     switch (type) {
//       case 'message': return '💬';
//       case 'appointment': return '📅';
//       case 'reminder': return '⏰';
//       case 'system': return '🔔';
//       default: return '🔔';
//     }
//   };

//   // Test function to send a notification (for development)
//   // const handleSendTestNotification = () => {
//   //   if (userDetails.id) {
//   //     sendNotification(userDetails.id, 'Test notification from sidebar!', 'system');
//   //   }
//   // };

//   return (
//     <div className={`relative ${className}`} ref={dropdownRef}>
//       <button
//         onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//         className="w-full flex items-center space-x-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg text-left transition-colors text-gray-700 hover:bg-gray-50 active:bg-gray-100 relative"
//       >
//         <div className="relative">
//           <Bell className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
          
//           {/* Notification Badge */}
//           {unreadCount > 0 && (
//             <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium text-[10px]">
//               {unreadCount > 99 ? '99+' : unreadCount}
//             </span>
//           )}
          
//           {/* Connection Status Indicator */}
//           <div className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full border border-white ${
//             connectionStatus === 'connected' ? 'bg-green-500' : 
//             connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
//           }`} />
//         </div>
        
//         <span className="font-medium text-sm lg:text-base truncate">
//           Notifications
//           {unreadCount > 0 && (
//             <span className="ml-2 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
//               {unreadCount}
//             </span>
//           )}
//         </span>
//       </button>

//       {/* Notification Dropdown */}
//       {isDropdownOpen && (
//         <div className="absolute left-full top-0 ml-2 w-80 bg-white rounded-lg shadow-lg border z-50">
//           <div className="p-4 border-b">
//             <div className="flex justify-between items-center">
//               <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
//               {unreadCount > 0 && (
//                 <button
//                   onClick={markAllAsRead}
//                   className="text-sm text-blue-600 hover:text-blue-800 font-medium"
//                 >
//                   Mark all as read
//                 </button>
//               )}
//             </div>
//             {/* Test notification button - Remove in production */}
//             {/* <button
//               onClick={handleSendTestNotification}
//               className="mt-2 text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 hover:bg-gray-200"
//             >
//               Test Notification
//             </button> */}
//           </div>
          
//           <div className="max-h-96 overflow-y-auto">
//             {notifications.length === 0 ? (
//               <div className="p-4 text-center text-gray-500">
//                 <Bell size={24} className="mx-auto mb-2 text-gray-400" />
//                 <p>No new notifications</p>
//               </div>
//             ) : (
//               notifications.map((notification) => (
//                 <div
//                   key={notification.id}
//                   className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
//                     !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
//                   }`}
//                   onClick={() => {
//                     if (!notification.read) {
//                       markAsRead(notification.id);
//                     }
//                   }}
//                 >
//                   <div className="flex items-start justify-between">
//                     <div className="flex-1">
//                       <div className="flex items-center">
//                         <span className="text-lg mr-3">
//                           {getNotificationIcon(notification.notification_type)}
//                         </span>
//                         <div className="flex-1 min-w-0">
//                           <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
//                             {notification.message}
//                           </p>
//                           <p className="text-xs text-gray-500 mt-1">
//                             {formatTime(notification.created_at)}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
                    
//                     {/* Remove notification button */}
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         removeNotification(notification.id);
//                       }}
//                       className="ml-2 text-gray-400 hover:text-red-600 transition-colors"
//                     >
//                       ×
//                     </button>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default NotificationDropdown;


import React, { useRef } from "react";
import { Bell, X } from "lucide-react";

function NotificationDropdown({
  notifications = [],
  unreadCount = 0,
  markAsRead,
  markAllAsRead,
  removeNotification
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = useRef(null);

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "message": return "💬";
      case "appointment": return "📅";
      case "reminder": return "⏰";
      case "system": return "🔔";
      default: return "🔔";
    }
  };

  const getPriorityStyles = (priority) => {
    const styles = {
      critical: 'border-l-red-500 bg-red-50',
      high: 'border-l-orange-500 bg-orange-50',
      medium: 'border-l-yellow-500 bg-yellow-50',
      low: 'border-l-gray-500 bg-gray-50'
    };
    return styles[priority] || styles.low;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 text-white/70 hover:text-white group"
      >
        <Bell size={20} className={unreadCount > 0 ? 'animate-pulse' : ''} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                <p className="text-sm text-gray-600">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                </p>
              </div>
              <div className="flex space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={removeNotification}
                    className="text-sm text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded hover:bg-red-100 transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell size={24} className="text-gray-400" />
                </div>
                <p className="text-lg font-medium text-gray-600 mb-2">No notifications</p>
                <p className="text-sm">You're all caught up! New notifications will appear here.</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-all duration-200 ${
                    !notification.read
                      ? `border-l-4 ${getPriorityStyles(notification.priority)}`
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </p>
                        <div className="flex items-center space-x-2">
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                            className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-200 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {formatTime(notification.timestamp)}
                        </span>
                        {notification.priority === 'critical' && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                            Urgent
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 bg-gray-50 border-t border-gray-200">
              <button
                className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium py-2 rounded-lg hover:bg-blue-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                View all notifications →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationDropdown;