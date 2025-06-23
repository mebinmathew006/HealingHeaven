// components/chat/ChatHeader.js
import React from 'react';
import { Menu } from 'lucide-react';

const ChatHeader = ({ 
  activeUser, 
  isOnline, 
  setSidebarOpen,
  userType 
}) => {
  // Show different user info based on chat type
  const displayUser = userType === 'doctor' ? activeUser?.user : activeUser?.user;
  
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-full"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        {activeUser && (
          <>
            <div className="relative">
              <img
                src={
                  displayUser?.user_profile?.profile_image ||
                  displayUser?.profile_image ||
                  "/powerpoint-template-icons-b.jpg"
                }
                alt={displayUser?.name}
                className="w-10 h-10 rounded-full"
              />
              {activeUser.online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">
                {displayUser?.name}
              </h1>
              <p
                className={`text-sm ${
                  activeUser.online ? "text-green-500" : "text-gray-500"
                }`}
              >
                {isOnline ? "Online" : "Offline"}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;