import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';

const NotificationContext = createContext();

// Notification reducer remains the same
const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1
      };
    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notif => 
          notif.id === action.payload ? { ...notif, read: true } : notif
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };
    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notif => ({ ...notif, read: true })),
        unreadCount: 0
      };
    case 'REMOVE_NOTIFICATION':
      const notification = state.notifications.find(n => n.id === action.payload);
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
        unreadCount: notification && !notification.read ? state.unreadCount - 1 : state.unreadCount
      };
    case 'SET_CONNECTION_STATUS':
      return {
        ...state,
        connectionStatus: action.payload
      };
    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
        unreadCount: 0
      };
    default:
      return state;
  }
};

const initialState = {
  notifications: [],
  unreadCount: 0,
  connectionStatus: 'disconnected' // 'connected', 'connecting', 'disconnected'
};

export const NotificationProvider = ({ children, userId }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);

  const connectWebSocket = () => {
    if (!userId) {
      // No user ID, don't attempt to connect
      return;
    }

    // Clear any existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connecting' });
    
    const wsUrl = `ws://localhost/consultations/ws/notifications/${userId}`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connected' });
      reconnectAttempts.current = 0;
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'notification') {
          const notification = {
            id: Date.now() + Math.random(), // Generate unique ID
            sender_id: data.sender_id,
            notification_type: data.notification_type,
            message: data.message,
            timestamp: data.timestamp,
            read: false
          };
          
          dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
          
          // Show browser notification if permission granted
          if (Notification.permission === 'granted') {
            new Notification(`New ${data.notification_type}`, {
              body: data.message,
              icon: '/favicon.ico'
            });
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'disconnected' });
      
      // Only attempt to reconnect if we still have a userId
      if (userId && reconnectAttempts.current < 5) {
        const delay = Math.pow(2, reconnectAttempts.current) * 1000;
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttempts.current++;
          connectWebSocket();
        }, delay);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  const cleanupWebSocket = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    reconnectAttempts.current = 0;
    dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'disconnected' });
  };

  useEffect(() => {
    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission().then().catch(err => {
        console.error('Notification permission error:', err);
      });
    }

    return () => {
      cleanupWebSocket();
    };
  }, []);

  useEffect(() => {
    if (userId) {
      // User is logged in, connect to WebSocket
      connectWebSocket();
    } else {
      // User logged out, clean up
      cleanupWebSocket();
      dispatch({ type: 'CLEAR_NOTIFICATIONS' });
    }

    return () => {
      // Clean up on userId change
      cleanupWebSocket();
    };
  }, [userId]);

  const sendNotification = (receiverId, message, notificationType) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'notification',
        receiver_id: receiverId,
        message,
        notification_type: notificationType,
        sender_type: 'user'
      }));
    }
  };

  const markAsRead = (notificationId) => {
    dispatch({ type: 'MARK_AS_READ', payload: notificationId });
  };

  const markAllAsRead = () => {
    dispatch({ type: 'MARK_ALL_AS_READ' });
  };

  const removeNotification = (notificationId) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: notificationId });
  };

  const value = {
    ...state,
    sendNotification,
    markAsRead,
    markAllAsRead,
    removeNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};