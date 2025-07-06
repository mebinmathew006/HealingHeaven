import React, { useState } from "react";
import { User, Settings, Bell, Shield, CreditCard, HelpCircle, LogOut, Wallet, Menu, X, ChartArea, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useLogout from "../utils/useLogout";
import { useSelector } from "react-redux";

const UserSidebar = ({ activeSection }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const logout = useLogout();

  const handleLogout = () => {
    logout();
  };

  const handleSectionClick = (id) => {
    navigate(`/${id}`);
    // Close mobile menu when item is clicked
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const userDetails = useSelector((state) => state.userDetails);
  
  const menuItems = [
    { id: 'user_profile', label: 'Profile', icon: User },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'user_notifications', label: 'Notifications', icon: Bell },
    { id: 'user_chat', label: 'Chat', icon: ChartArea },
    { id: 'user_consultations', label: 'Consultations', icon: Video },
    { id: 'user_complaint', label: 'Complaint', icon: HelpCircle },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-18 left- z-50 ">
        <button
          onClick={toggleMobileMenu}
          className="p-2 bg-white rounded-lg shadow-lg border border-gray-200"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-gray-700" />
          ) : (
            <Menu className="w-6 h-6 text-gray-700" />
          )}
        </button> 
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white shadow-lg h-screen flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-4 lg:p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-green-800 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-gray-900 text-sm lg:text-base truncate">
                {userDetails.name}
              </h2>
              <p className="text-xs lg:text-sm text-gray-500 truncate">
                {userDetails.email}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-3 lg:p-4 overflow-y-auto">
          <ul className="space-y-1 lg:space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleSectionClick(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg text-left transition-colors ${
                      activeSection === item.id
                        ? 'bg-blue-50 text-green-700 border-r-2 border-green-700'
                        : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                    <span className="font-medium text-sm lg:text-base truncate">
                      {item.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-3 lg:p-4 border-t border-gray-200">
          <button 
            className="w-full flex items-center space-x-3 px-3 lg:px-4 py-2.5 lg:py-3 text-red-600 hover:bg-red-50 active:bg-red-100 rounded-lg transition-colors" 
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
            <span className="font-medium text-sm lg:text-base">Logout</span>
          </button>
        </div>
      </div>

      {/* Spacer for desktop layout */}
      <div className="hidden lg:block w-64 flex-shrink-0"></div>
    </>
  );
};

export default UserSidebar;