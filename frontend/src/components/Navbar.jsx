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

  return (
    <nav className="bg-gradient-to-r from-white via-blue-50 to-green-50 backdrop-blur-md border-b border-gray-200/50 py-4 px-6 flex items-center justify-between shadow-lg shadow-blue-100/50 relative">
      {/* Logo Section */}
      <div className="flex items-center">
        <div className="relative">
          <img src="/logo.png" alt="Logo" onClick={()=>{userDetails.id ? navigate('/dfd') : ''}} className="w-35 h-20 drop-shadow-md"/>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-100/20 rounded-lg"></div>
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex space-x-8">
        <Link className="relative text-gray-700 hover:text-green-600 font-medium transition-all duration-300 hover:scale-105 group" to={"/"}>
          Home
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-300 group-hover:w-full"></span>
        </Link>
        <Link className="relative text-gray-700 hover:text-green-600 font-medium transition-all duration-300 hover:scale-105 group" to={"/services"}>
          Services
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-300 group-hover:w-full"></span>
        </Link>
        <Link to={userDetails.id ? "/user_view_psychologist" : "/therapists"} className="relative text-gray-700 hover:text-green-600 font-medium transition-all duration-300 hover:scale-105 group">
          Therapists
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-300 group-hover:w-full"></span>
        </Link>
        <Link className="relative text-gray-700 hover:text-green-600 font-medium transition-all duration-300 hover:scale-105 group" to={"/aboutus"}>
          About Us
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-300 group-hover:w-full"></span>
        </Link>
        <Link className="relative text-gray-700 hover:text-green-600 font-medium transition-all duration-300 hover:scale-105 group" to={"/contactus"}>
          Contact
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-300 group-hover:w-full"></span>
        </Link>
        {userDetails.role=='patient' && (
          <Link className="relative text-gray-700 hover:text-green-600 font-medium transition-all duration-300 hover:scale-105 group" to={"/user_chat"}>
            Chat
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-300 group-hover:w-full"></span>
          </Link>
        )}
      </div>

      {/* Right side icons - Notifications and Profile */}
      <div className="flex items-center space-x-4">
        {/* Notification Bell - Only show when logged in */}
        {isLoggedIn && userDetails.id && (
          <div className="relative" ref={notificationDropdownRef}>
            <button
              onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
              className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 text-green-700 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
            >
              <Bell size={20} />
              
              {/* Notification Badge */}
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg animate-pulse">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
              
              {/* Connection Status Indicator */}
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                connectionStatus === 'connected' ? 'bg-green-500' : 
                connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
            </button>

            {/* Notification Dropdown */}
            {isNotificationDropdownOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200/50 z-50 overflow-hidden">
                <div className="p-4 border-b border-gray-200/50 bg-gradient-to-r from-green-50 to-blue-50">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-sm text-green-600 hover:text-green-800 font-semibold hover:underline transition-colors"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <Bell size={32} className="mx-auto mb-3 text-gray-400" />
                      <p className="font-medium">No new notifications</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 cursor-pointer transition-all duration-200 ${
                          !notification.read ? 'bg-gradient-to-r from-green-50/70 to-blue-50/70 border-l-4 border-l-green-500' : ''
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
                              <span className="text-xl mr-3 drop-shadow-sm">
                                {getNotificationIcon(notification.notification_type)}
                              </span>
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-900">
                                  {notification.message}
                                </p>
                                <div className="flex items-center mt-1">
                                  <span className="text-xs text-gray-500 font-medium">
                                    {formatTime(notification.timestamp)}
                                  </span>
                                  {!notification.read && (
                                    <span className="ml-2 w-2 h-2 bg-green-500 rounded-full shadow-sm"></span>
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
                            className="text-gray-400 hover:text-red-500 ml-2 p-1 rounded-full hover:bg-red-50 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {notifications.length > 0 && (
                  <div className="p-3 border-t border-gray-200/50 bg-gradient-to-r from-gray-50 to-blue-50">
                    <Link 
                      to="/notifications" 
                      className="text-sm text-green-600 hover:text-green-800 font-bold hover:underline"
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
                className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 text-green-700 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
              >
                <User size={20} />
              </button>

              {/* Profile Dropdown */}
              {isProfileDropdownOpen &&
                (userDetails.id ? (
                  <div className="absolute right-0 mt-3 w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200/50 py-2 z-50 overflow-hidden">
                    <Link
                      to={"/user_profile"}
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 hover:text-green-700 transition-all duration-200 font-medium"
                      onClick={handleProfileClick}
                    >
                      <User size={16} className="mr-3" />
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-600 transition-all duration-200 font-medium"
                    >
                      <LogOut size={16} className="mr-3" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="absolute right-0 mt-3 w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200/50 py-2 z-50 overflow-hidden">
                    <Link
                      to={"/login"}
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 hover:text-green-700 transition-all duration-200 font-medium"
                    >
                      <User size={16} className="mr-3" />
                      Sign In
                    </Link>
                  </div>
                ))}
            </>
          ) : (
            <Link
              onClick={handleSignupClick}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 text-green-700 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
            >
              <User size={20} />
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-gray-700 ml-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md shadow-xl border-t border-gray-200/50 z-40 md:hidden">
          <div className="flex flex-col p-4 space-y-3">
            <Link className="text-gray-800 hover:text-green-600 py-3 px-2 rounded-lg hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 transition-all font-medium" to={"/"}>
              Home
            </Link>
            <Link
              className="text-gray-800 hover:text-green-600 py-3 px-2 rounded-lg hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 transition-all font-medium"
              to={"/services"}
            >
              Services
            </Link>
            <Link
              className="text-gray-800 hover:text-green-600 py-3 px-2 rounded-lg hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 transition-all font-medium"
              to={userDetails.id ? "/user_view_psychologist" : "/therapists"}
            >
              Therapists
            </Link>
            <Link
              to={"/aboutus"}
              className="text-gray-800 hover:text-green-600 py-3 px-2 rounded-lg hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 transition-all font-medium"
            >
              About Us
            </Link>
            <Link
              className="text-gray-800 hover:text-green-600 py-3 px-2 rounded-lg hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 transition-all font-medium"
              to={"/contactus"}
            >
              Contact
            </Link>
            
            {/* Mobile Notifications */}
            {isLoggedIn && userDetails.id && (
              <div className="py-3 px-2 border-t border-gray-200/50 bg-gradient-to-r from-green-50/50 to-blue-50/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-gray-800 font-semibold">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full px-2 py-1 font-bold shadow-sm">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <Link
                  to="/notifications"
                  className="text-sm text-green-600 hover:text-green-800 mt-1 block font-medium hover:underline"
                  onClick={() => setIsMenuOpen(false)}
                >
                  View all notifications
                </Link>
              </div>
            )}
            
            {isLoggedIn ? (
              <div className="flex flex-col space-y-2 pt-3 border-t border-gray-200/50">
                <Link
                  to={"/user_profile"}
                  className="flex items-center text-gray-800 hover:text-green-600 py-3 px-2 rounded-lg hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 transition-all font-medium"
                  onClick={() => {
                    handleProfileClick();
                    setIsMenuOpen(false);
                  }}
                >
                  <User size={16} className="mr-3" />
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center text-left text-gray-800 hover:text-red-600 py-3 px-2 rounded-lg hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all font-medium"
                >
                  <LogOut size={16} className="mr-3" />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                className="flex items-center text-gray-800 hover:text-green-600 py-3 px-2 rounded-lg hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 transition-all font-medium"
                onClick={() => {
                  handleSignupClick();
                  setIsMenuOpen(false);
                }}
              >
                <User size={16} className="mr-3" />
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