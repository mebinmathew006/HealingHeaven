// components/chat/ChatHeader.js
import React from "react";
import { Menu, Video, Phone } from "lucide-react";
import { useNotifications } from "../../utils/NotificationContext";

const ChatHeader = ({
  activeUser,
  isOnline,
  setSidebarOpen,
  userType,
  handleSendMessage,
  setNewMessage,
}) => {
  // Show different user info based on chat type
  const displayUser =
    userType === "doctor" ? activeUser?.user : activeUser?.user;
  const { sendNotification } = useNotifications();
  const handleVideoCall = () => {
    sendNotification(
      activeUser.psychologist_id,
      "User wants to connect with you",
      "videocall"
    );
    setNewMessage("requested for a video call");
    handleSendMessage(); // Calls with no attachments
  };

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
            <div className="flex-1">
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

      {activeUser && userType == "user" && (
        <div className="flex items-center space-x-2">
          <button
            onClick={handleVideoCall}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors bg-green-200 hover:bg-green-300 text-white"
            }`}
          >
            <Video className="w-4 h-4" />
            <span className="hidden sm:inline">Video Call</span>
          </button>
        </div>
      )}
      {/* Video Call Button */}
    </div>
  );
};

export default ChatHeader;
