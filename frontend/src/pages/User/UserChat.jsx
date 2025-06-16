import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Send,
  Phone,
  Video,
  Search,
  Menu,
  X,
  MessageCircle,
} from "lucide-react";
import axiosInstance from "../../axiosconfig";
import { useSelector } from "react-redux";

export default function UserChat() {
  const [activeChat, setActiveChat] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const userId = useSelector((state) => state.userDetails.id);
  const [doctors, setDoctors] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeDoctor, setActiveDoctor] = useState(null);
  const [activeConsultationId, setActiveConsultationId] = useState(null);
  const wsRef = useRef(null);
  const [connectionStatus, setConnectionStatus] = useState("Select doctor...");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Memoize scroll function to prevent unnecessary re-creations
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Memoize fetch doctors function
  const fetchDoctors = useCallback(async () => {
    if (!userId) return;
    
    try {
      const response = await axiosInstance.get(
        `/consultations/get_consultation_mapping_for_user_chat/${userId}`
      );
      setDoctors(response.data);
      console.log("Doctors:", response.data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  }, [userId]);

  // Fetch doctors on component mount and when userId changes
  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // Optimized WebSocket message handler with useCallback
  const handleWebSocketMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("[RECEIVED MESSAGE]", data);

      if (data.message && data.consultation_id === activeConsultationId) {
        const receivedMessage = {
          id: data.id || Date.now(),
          message: data.message,
          created_at: data.created_at || new Date().toISOString(),
          sender: data.sender_type,
        };
     
        // Use functional update to prevent stale closures
        setMessages((prev) => {
          // Check for duplicate messages
          const isDuplicate = prev.some(msg => 
            msg.id === receivedMessage.id || 
            (msg.message === receivedMessage.message && 
             Math.abs(new Date(msg.created_at) - new Date(receivedMessage.created_at)) < 1000)
          );
          
          if (isDuplicate) return prev;
          return [...prev, receivedMessage];
        });
      }

      // Handle typing indicator
      if (data.type === "typing") {
        setIsTyping(data.is_typing);
      }
    } catch (error) {
      console.error("Failed to parse WebSocket message:", error);
    }
  }, [activeConsultationId]);

  // WebSocket setup with proper cleanup
  useEffect(() => {
    if (!wsRef.current) return;

    wsRef.current.onmessage = handleWebSocketMessage;

    return () => {
      if (wsRef.current) {
        wsRef.current.onmessage = null;
      }
    };
  }, [handleWebSocketMessage]);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  // Optimized send message handler
  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim() || !wsRef.current || !activeConsultationId || !isConnected) return;

    const messageToSend = newMessage.trim();
    const messageData = {
      message: messageToSend,
      consultation_id: activeConsultationId,
      sender_id: userId,
      sender_type: "user",
    };

    // Send via WebSocket
    wsRef.current.send(JSON.stringify(messageData));

    // Add to local state immediately for better UX
    const localMessage = {
      id: `temp-${Date.now()}`, // Temporary ID with prefix
      message: messageToSend,
      created_at: new Date().toISOString(),
      sender: "user",
    };

    // setMessages((prev) => [...prev, localMessage]);
    setNewMessage("");
  }, [newMessage, activeConsultationId, userId, isConnected]);

  // Optimized WebSocket initialization
  const initializeChat = useCallback(async (consultationId) => {
    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
    setConnectionStatus("Connecting...");

    try {
      const ws = new WebSocket(`ws://localhost/consultations/ws/chat/${consultationId}`);
      wsRef.current = ws;

      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Connection timeout"));
        }, 10000); // 10 second timeout

        ws.onopen = () => {
          clearTimeout(timeout);
          console.log("[User] WebSocket connected to room:", consultationId);
          setIsConnected(true);
          setConnectionStatus("Connected");
          resolve();
        };

        ws.onerror = (error) => {
          clearTimeout(timeout);
          console.error("[User] WebSocket error:", error);
          setIsConnected(false);
          setConnectionStatus("Connection failed");
          reject(error);
        };
      });

      ws.onclose = (event) => {
        console.log("WebSocket closed:", event.code, event.reason);
        setConnectionStatus("Disconnected");
        setIsConnected(false);
      };

    } catch (error) {
      console.error("Failed to initialize chat:", error);
      setConnectionStatus("Connection failed");
      setIsConnected(false);
    }
  }, []);

  // Optimized key press handler
  const handleKeyPress = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Optimized doctor selection handler
  const handleDoctorSelect = useCallback(async (doctorId, consultationId) => {
    if (activeConsultationId === consultationId) return; // Already selected

    try {
      setIsLoadingMessages(true);
      setMessages([]);
      
      await initializeChat(consultationId);
      
      const response = await axiosInstance.get(
        `/consultations/get_chat_messages/${consultationId}`
      );
      
      setMessages(response.data || []);
      console.log("Chat messages:", response.data);

      setActiveChat(doctorId);
      setActiveConsultationId(consultationId);

      // Find and set active doctor
      const doctor = doctors.find((d) => d.psychologist_id === doctorId);
      setActiveDoctor(doctor);

      setSidebarOpen(false);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [activeConsultationId, doctors, initializeChat]);

  // Memoize time formatting functions
  const formatTime = useCallback((dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  }, []);

  const formatMessageTime = useCallback((dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }, []);

  // Memoized filtered doctors
  const filteredDoctors = useMemo(() => {
    if (!searchQuery) return doctors;
    return doctors.filter(doctor =>
      doctor.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.user?.psychologist_profile?.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [doctors, searchQuery]);

  // Memoized message components to prevent unnecessary re-renders
  const MessageBubble = React.memo(({ message, isUser, senderName, activeDoctor, formatMessageTime }) => (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
        isUser ? "flex-row-reverse space-x-reverse" : ""
      }`}>
        {!isUser && (
          <img
            src={activeDoctor?.user?.psychologist_profile?.profile_image || "/powerpoint-template-icons-b.jpg"}
            alt="Avatar"
            className="w-8 h-8 rounded-full"
          />
        )}
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 mb-1">{senderName}</span>
          <div className={`px-4 py-2 rounded-2xl ${
            isUser
              ? "bg-blue-500 text-white rounded-br-sm"
              : "bg-white text-gray-900 rounded-bl-sm shadow-sm border border-gray-200"
          }`}>
            <p className="text-sm">{message.message}</p>
          </div>
          <span className={`text-xs text-gray-500 mt-1 ${
            isUser ? "text-right" : "text-left"
          }`}>
            {formatMessageTime(message.created_at)}
          </span>
        </div>
      </div>
    </div>
  ));

  // Memoized doctor list item
  const DoctorListItem = React.memo(({ doctor, activeChat, handleDoctorSelect, formatTime }) => (
    <div
      key={doctor.id}
      onClick={() => handleDoctorSelect(doctor.psychologist_id, doctor.id)}
      className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors ${
        activeChat === doctor.psychologist_id ? "bg-blue-50 border-r-2 border-r-blue-500" : ""
      }`}
    >
      <div className="relative">
        <img
          src={doctor.user?.psychologist_profile?.profile_image || "/powerpoint-template-icons-b.jpg"}
          alt=""
          className="w-12 h-12 rounded-full"
        />
        {doctor.online && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
        )}
      </div>
      <div className="ml-3 flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900 truncate">Dr. {doctor.user?.name}</p>
          <p className="text-xs text-gray-500">{formatTime(doctor.last_message_time)}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 truncate">
            {doctor.user?.psychologist_profile?.specialization || "General"}
          </p>
          {doctor.unread > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-500 rounded-full">
              {doctor.unread}
            </span>
          )}
        </div>
      </div>
    </div>
  ));

  // Memoized rendered messages
  const renderedMessages = useMemo(() => {
    return messages.map((message) => {
      const isUser = message.sender ? message.sender === "user" : false;
      const senderName = isUser ? "You" : activeDoctor?.user?.name || "Doctor";

      return (
        <MessageBubble
          key={`${message.id}-${message.created_at}`}
          message={message}
          isUser={isUser}
          senderName={senderName}
          activeDoctor={activeDoctor}
          formatMessageTime={formatMessageTime}
        />
      );
    });
  }, [messages, activeDoctor, formatMessageTime]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">My Doctors</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="mt-2">
              <span className={`text-sm ${isConnected ? "text-green-500" : "text-red-500"}`}>
                {connectionStatus}
              </span>
            </div>
          </div>

          {/* Search */}
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search doctors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Doctors List */}
          {filteredDoctors.length > 0 && (
            <div className="flex-1 overflow-y-auto">
              {filteredDoctors.map((doctor) => (
                <DoctorListItem
                  key={doctor.id}
                  doctor={doctor}
                  activeChat={activeChat}
                  handleDoctorSelect={handleDoctorSelect}
                  formatTime={formatTime}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-full"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            {activeDoctor && (
              <>
                <div className="relative">
                  <img
                    src={activeDoctor.user?.psychologist_profile?.profile_image || "/powerpoint-template-icons-b.jpg"}
                    alt={activeDoctor.user?.name}
                    className="w-10 h-10 rounded-full"
                  />
                  {activeDoctor.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div>
                  <h1 className="font-semibold text-gray-900">Dr. {activeDoctor.user?.name}</h1>
                  <p className={`text-sm ${activeDoctor.online ? "text-green-500" : "text-gray-500"}`}>
                    {activeDoctor.user?.psychologist_profile?.specialization || "General"}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Messages Area */}
        {activeChat ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoadingMessages ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                renderedMessages
              )}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-end space-x-2 max-w-xs">
                    <img
                      src={activeDoctor?.user?.psychologist_profile?.profile_image || "/powerpoint-template-icons-b.jpg"}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="bg-white px-4 py-2 rounded-2xl rounded-bl-sm shadow-sm border border-gray-200">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="w-full px-4 py-3 pr-12 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!isConnected}
                    maxLength={1000}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || !isConnected}
                  className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a doctor</h3>
              <p className="text-gray-500">Choose a doctor to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}