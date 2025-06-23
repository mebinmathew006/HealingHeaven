// components/chat/MessageBubble.js
import React from 'react';

const MessageBubble = React.memo(({ 
  message, 
  isCurrentUser, 
  senderName, 
  activeUser, 
  formatMessageTime 
}) => (
  <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
    <div
      className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
        isCurrentUser ? "flex-row-reverse space-x-reverse" : ""
      }`}
    >
      {!isCurrentUser && (
        <img
          src={
            activeUser?.user?.user_profile?.profile_image ||
            activeUser?.doctor?.profile_image ||
            "/powerpoint-template-icons-b.jpg"
          }
          alt="Avatar"
          className="w-8 h-8 rounded-full"
        />
      )}
      <div className="flex flex-col">
        <span className="text-xs text-gray-500 mb-1">{senderName}</span>
        <div
          className={`px-4 py-2 rounded-2xl ${
            isCurrentUser
              ? "bg-blue-500 text-white rounded-br-sm"
              : "bg-white text-gray-900 rounded-bl-sm shadow-sm border border-gray-200"
          }`}
        >
          <p className="text-sm">{message.message}</p>
        </div>
        <span
          className={`text-xs text-gray-500 mt-1 ${
            isCurrentUser ? "text-right" : "text-left"
          }`}
        >
          {formatMessageTime(message.created_at)}
        </span>
      </div>
    </div>
  </div>
));

export default MessageBubble;