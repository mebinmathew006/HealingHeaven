// hooks/useChat.js
import { useState, useRef, useEffect, useCallback } from 'react';
import axiosInstance from '../axiosconfig';

export const useChat = (userId, userType) => {
  const [activeChat, setActiveChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const [activeUser, setActiveUser] = useState(null);
  const [activeConsultationId, setActiveConsultationId] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("select ...");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);
  const activeConsultationIdRef = useRef(null); // Add ref to track current consultation ID

  // Update ref whenever activeConsultationId changes
  useEffect(() => {
    activeConsultationIdRef.current = activeConsultationId;
  }, [activeConsultationId]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const fetchUsers = useCallback(async () => {
    if (!userId) return;

    try {
      const endpoint = userType === 'doctor' 
        ? `/consultations/get_consultation_mapping_for_chat/${userId}`
        : `/consultations/get_consultation_mapping_for_user_chat/${userId}`;
      
      const response = await axiosInstance.get(endpoint);
      setUsers(response.data);
      console.log(response.data)
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, [userId, userType]);

  const handleWebSocketMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("[RECEIVED MESSAGE]", data);
      
      // Handle status updates (online/offline)
      if (data.type === "status") {
        const { status, user_id } = data;
        if (user_id !== userId) {
          setIsOnline(status === "online");
          
          // Update user online status in users list
          setUsers(prevUsers => 
            prevUsers.map(user => 
              (userType === 'doctor' ? user.user_id : user.doctor_id) === user_id
                ? { ...user, online: status === "online" }
                : user
            )
          );
        }
      }

      // Handle typing indicators
      if (data.type === "typing") {
        const { sender_id, is_typing } = data;
        const currentConsultationId = activeConsultationIdRef.current;
        if (sender_id !== userId && data.consultation_id === currentConsultationId) {
          setIsTyping(is_typing);
        }
      }

      // Handle regular messages - IMPROVED LOGIC
      if (data.type === "message") {
        const currentConsultationId = activeConsultationIdRef.current;
        
        console.log("[MESSAGE RECEIVED]", {
          dataConsultationId: data.consultation_id,
          currentConsultationId: currentConsultationId,
          matches: data.consultation_id === currentConsultationId
        });

        // Only add message if it's for the active consultation
        if (data.consultation_id === currentConsultationId) {
          const receivedMessage = {
            id: data.id || `${data.sender_id}-${Date.now()}`, // Use server ID if available
            message: data.message,
            created_at: data.created_at || new Date().toISOString(),
            sender: data.sender_type,
            sender_id: data.sender_id,
            consultation_id: data.consultation_id
          };

          console.log("[ADDING MESSAGE TO STATE]", receivedMessage);

          setMessages((prevMessages) => {
            // Check for duplicate messages
            const isDuplicate = prevMessages.some(
              (msg) =>
                (msg.id === receivedMessage.id) || // Same ID
                (msg.message === receivedMessage.message &&
                 msg.sender_id === receivedMessage.sender_id &&
                 Math.abs(new Date(msg.created_at) - new Date(receivedMessage.created_at)) < 2000)
            );

            if (isDuplicate) {
              console.log("[DUPLICATE MESSAGE DETECTED]", receivedMessage);
              return prevMessages;
            }

            const newMessages = [...prevMessages, receivedMessage];
            console.log("[MESSAGES UPDATED]", newMessages);
            return newMessages;
          });

          // Auto-scroll to bottom when new message arrives
          setTimeout(() => {
            scrollToBottom();
          }, 100);
        }
      }
    } catch (error) {
      console.error("Failed to parse WebSocket message:", error);
    }
  }, [userId, userType, scrollToBottom]);

  const initializeChat = useCallback(async (consultationId) => {
    console.log("[INITIALIZING CHAT]", consultationId);
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
    setConnectionStatus("Connecting...");

    try {
      const ws = new WebSocket(
        `ws://localhost/consultations/ws/chat/${consultationId}`
      );
      wsRef.current = ws;

      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Connection timeout"));
        }, 10000);

        ws.onopen = () => {
          console.log("[WEBSOCKET CONNECTED]");
          clearTimeout(timeout);
          setIsConnected(true);
          setConnectionStatus("Connected");
          
          const initPayload = {
            type: "join",
            sender_id: userId,
            sender_type: userType,
            consultation_id: consultationId,
          };
          
          console.log("[SENDING JOIN PAYLOAD]", initPayload);
          ws.send(JSON.stringify(initPayload));
          resolve();
        };

        ws.onerror = (error) => {
          console.error("[WEBSOCKET ERROR]", error);
          clearTimeout(timeout);
          setIsConnected(false);
          setConnectionStatus("Connection failed");
          reject(error);
        };
      });

      ws.onclose = (event) => {
        console.log("[WEBSOCKET CLOSED]", event);
        setConnectionStatus("Disconnected");
        setIsConnected(false);
      };

      ws.onmessage = handleWebSocketMessage;
    } catch (error) {
      console.error("Failed to initialize chat:", error);
      setConnectionStatus("Connection failed");
      setIsConnected(false);
    }
  }, [userId, userType, handleWebSocketMessage]);

  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim() || !wsRef.current || !activeConsultationId || !isConnected) {
      console.log("[SEND MESSAGE BLOCKED]", {
        hasMessage: !!newMessage.trim(),
        hasWebSocket: !!wsRef.current,
        hasConsultationId: !!activeConsultationId,
        isConnected: isConnected
      });
      return;
    }

    const messageToSend = newMessage.trim();
    const messageData = {
      type: "message",
      message: messageToSend,
      consultation_id: activeConsultationId,
      sender_id: userId,
      sender_type: userType,
      message_type: "chat",
      created_at: new Date().toISOString()
    };

    try {
      wsRef.current.send(JSON.stringify(messageData));
      console.log("[MESSAGE SENT]", messageData);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }, [newMessage, activeConsultationId, userId, userType, isConnected]);

  const handleUserSelect = useCallback(async (selectedUserId, consultationId) => {
    console.log("[USER SELECTED]", { selectedUserId, consultationId });
    
    if (activeConsultationId === consultationId) return;

    try {
      setIsLoadingMessages(true);
      setMessages([]);

      // SET CONSULTATION ID FIRST - This is crucial!
      setActiveConsultationId(consultationId);
      setActiveChat(selectedUserId);

      const user = users.find((u) => 
        userType === 'doctor' ? u.user_id === selectedUserId : u.doctor_id === selectedUserId
      );
      setActiveUser(user);

      // Initialize WebSocket connection
      await initializeChat(consultationId);

      // Fetch chat history
      const response = await axiosInstance.get(
        `/consultations/get_chat_messages/${consultationId}`
      );

      console.log("[CHAT HISTORY LOADED]", response.data);
      setMessages(response.data || []);

      // Scroll to bottom after messages load
      setTimeout(() => {
        scrollToBottom();
      }, 100);

    } catch (error) {
      console.error("Error fetching chat messages:", error);
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [activeConsultationId, users, initializeChat, userType, scrollToBottom]);

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Auto-scroll when messages change
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  return {
    // State
    activeChat,
    activeUser,
    newMessage,
    setNewMessage,
    messages,
    users,
    isOnline,
    isConnected,
    connectionStatus,
    isLoadingMessages,
    isTyping,
    messagesEndRef,
    
    // Actions
    handleSendMessage,
    handleUserSelect,
    
    // Utils
    scrollToBottom
  };
};