import React, { useState, useRef, useEffect } from "react";
import { Menu, X, User, LogOut, Bell } from "lucide-react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import useLogout from "../utils/useLogout";
import { useNotifications } from "../utils/NotificationContext";
import { useNotificationSound } from "../utils/useNotificationSound";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  
  const userDetails = useSelector((state) => state.userDetails);
  const logout = useLogout();
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);

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

  // Enable notification sound for the navbar
  useNotificationSound();

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
        setIsNotificationDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    console.log("Logging out");
    setIsLoggedIn(false);
    setIsProfileDropdownOpen(false);
    logout();
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleProfileClick = () => {
    console.log("Navigate to profile");
    setIsProfileDropdownOpen(false);
  };

  const handleSignupClick = () => {
    console.log("Navigate to signup");
  };

  // Notification helper functions
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message': return '💬';
      case 'appointment': return '📅';
      case 'reminder': return '⏰';
      case 'system': return '🔔';
      default: return '🔔';
    }
  };

  // Test function to send a notification (for development)
  // const handleSendTestNotification = () => {
  //   if (userDetails.id) {
  //     sendNotification(16, 'Test kjkjkjkj;jkjkj from navbar!', 'system');
  //   }
  // };

  return (
    <nav className="bg-white py-4 px-6 flex items-center justify-between shadow-sm relative">
      <div className="flex items-center">
        <img src="/logo.png" alt="" className="w-35 h-20"/>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex space-x-6">
        <Link className="text-gray-800 hover:text-green-600" to={"/"}>Home</Link>
        <Link className="text-gray-800 hover:text-green-600" to={"/services"}>Services</Link>
        <Link to={userDetails.id ? "/user_view_psychologist" : "/therapists"} className="text-gray-800 hover:text-green-600">Therapists</Link>
        <Link className="text-gray-800 hover:text-green-600" to={"/aboutus"}>About Us</Link>
        <Link className="text-gray-800 hover:text-green-600" to={"/contactus"}>Contact</Link>
        {userDetails.role=='patient' && <Link className="text-gray-800 hover:text-green-600" to={"/user_chat"}>Chat</Link>}
      </div>

      {/* Right side icons - Notifications and Profile */}
      <div className="flex items-center space-x-4">
        {/* Notification Bell - Only show when logged in */}
        {isLoggedIn && userDetails.id && (
          <div className="relative" ref={notificationDropdownRef}>
            <button
              onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
              className="relative flex items-center justify-center w-10 h-10 rounded-full bg-green-100 hover:bg-green-200 text-green-700 transition-colors"
            >
              <Bell size={20} />
              
              {/* Notification Badge */}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
              
              {/* Connection Status Indicator */}
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                connectionStatus === 'connected' ? 'bg-green-500' : 
                connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
            </button>

            {/* Notification Dropdown */}
            {isNotificationDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                <div className="p-4 border-b">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-sm text-green-600 hover:text-green-800 font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  {/* Test notification button - Remove in production */}
                  {/* <button
                    onClick={handleSendTestNotification}
                    className="mt-2 text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 hover:bg-gray-200"
                  >
                    Test Notification
                  </button> */}
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <Bell size={24} className="mx-auto mb-2 text-gray-400" />
                      <p>No new notifications </p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                          !notification.read ? 'bg-green-50 border-l-4 border-l-green-500' : ''
                        }`}
                        onClick={() => {
                          if (!notification.read) {
                            markAsRead(notification.id);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className="text-lg mr-3">
                                {getNotificationIcon(notification.notification_type)}
                              </span>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {notification.message}
                                </p>
                                <div className="flex items-center mt-1">
                                  <span className="text-xs text-gray-500">
                                    {formatTime(notification.timestamp)}
                                  </span>
                                  {!notification.read && (
                                    <span className="ml-2 w-2 h-2 bg-green-500 rounded-full"></span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                            className="text-gray-400 hover:text-gray-600 ml-2 p-1"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {notifications.length > 0 && (
                  <div className="p-3 border-t bg-gray-50">
                    <Link 
                      to="/notifications" 
                      className="text-sm text-green-600 hover:text-green-800 font-medium"
                      onClick={() => setIsNotificationDropdownOpen(false)}
                    >
                      View all notifications →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* User Profile Icon */}
        <div className="relative" ref={dropdownRef}>
          {isLoggedIn ? (
            <>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 hover:bg-green-200 text-green-700"
              >
                <User size={20} />
              </button>

              {/* Profile Dropdown */}
              {isProfileDropdownOpen &&
                (userDetails.id ? (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      to={"/user_profile"}
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={handleProfileClick}
                    >
                      <User size={16} className="mr-2" />
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      to={"/login"}
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      <User size={16} className="mr-2" />
                      Sign In
                    </Link>
                  </div>
                ))}
            </>
          ) : (
            <Link
              onClick={handleSignupClick}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 hover:bg-green-200 text-green-700"
            >
              <User size={20} />
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-gray-700 ml-4"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-md z-40 md:hidden">
          <div className="flex flex-col p-4 space-y-3">
            <Link className="text-gray-800 hover:text-green-600 py-2" to={"/"}>
              Home
            </Link>
            <Link
              className="text-gray-800 hover:text-green-600 py-2"
              to={"/services"}
            >
              Services
            </Link>
            <Link
              className="text-gray-800 hover:text-green-600 py-2"
              to={userDetails.id ? "/user_view_psychologist" : "/therapists"}
            >
              Therapists
            </Link>
            <Link
              to={"/aboutus"}
              className="text-gray-800 hover:text-green-600 py-2"
            >
              About Us
            </Link>
            <Link
              className="text-gray-800 hover:text-green-600 py-2"
              to={"/contactus"}
            >
              Contact
            </Link>
            
            {/* Mobile Notifications */}
            {isLoggedIn && userDetails.id && (
              <div className="py-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-800 font-medium">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <Link
                  to="/notifications"
                  className="text-sm text-green-600 hover:text-green-800 mt-1 block"
                  onClick={() => setIsMenuOpen(false)}
                >
                  View all notifications
                </Link>
              </div>
            )}
            
            {isLoggedIn ? (
              <div className="flex flex-col space-y-2 pt-2 border-t border-gray-200">
                <Link
                  to={"/user_profile"}
                  className="flex items-center text-gray-800 hover:text-green-600 py-2"
                  onClick={() => {
                    handleProfileClick();
                    setIsMenuOpen(false);
                  }}
                >
                  <User size={16} className="mr-2" />
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center text-left text-gray-800 hover:text-green-600 py-2"
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                className="flex items-center text-gray-800 hover:text-green-600 py-2"
                onClick={() => {
                  handleSignupClick();
                  setIsMenuOpen(false);
                }}
              >
                <User size={16} className="mr-2" />
                Sign Up
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;