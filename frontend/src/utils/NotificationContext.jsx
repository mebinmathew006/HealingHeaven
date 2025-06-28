// hooks/useNotifications.js
import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';

const NotificationContext = createContext();

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
  connectionStatus: 'disconnected'
};

export const NotificationProvider = ({ children, userId }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const keepAliveIntervalRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const isConnecting = useRef(false);
  const shouldReconnect = useRef(true);

  const cleanup = useCallback(() => {
    console.log('Cleaning up WebSocket connection');
    
    // Clear intervals and timeouts
    if (keepAliveIntervalRef.current) {
      clearInterval(keepAliveIntervalRef.current);
      keepAliveIntervalRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    // Close WebSocket if it exists and is open
    if (wsRef.current) {
      const ws = wsRef.current;
      wsRef.current = null; // Clear reference first to prevent reconnection
      
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close(1000, 'Component cleanup');
      }
    }
    
    isConnecting.current = false;
  }, []);

  const connect = useCallback(() => {
    // Prevent multiple simultaneous connection attempts
    if (isConnecting.current || !shouldReconnect.current || !userId) {
      return;
    }

    // Don't reconnect if we already have an open connection
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    isConnecting.current = true;
    dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connecting' });
    
    console.log(`Attempting to connect WebSocket for user ${userId}`);
    
    const wsUrl = `ws://localhost/consultations/ws/notifications/${userId}`;
    const newWs = new WebSocket(wsUrl);
    
    // Set up event handlers before assigning to ref
    newWs.onopen = () => {
      console.log('WebSocket connected successfully');
      wsRef.current = newWs; // Only assign after successful connection
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connected' });
      reconnectAttempts.current = 0;
      isConnecting.current = false;
      
      // Start keep-alive ping
      keepAliveIntervalRef.current = setInterval(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'ping' }));
        }
      }, 20000); // 20 seconds
    };

    newWs.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle pong responses
        if (data.type === 'pong') {
          console.log('Received pong from server');
          return;
        }
        
        if (data.type === 'notification') {
          const notification = {
            id: `${data.timestamp}_${Math.random().toString(36).substr(2, 9)}`,
            ...data,
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
        console.error('Error processing WebSocket message:', error);
      }
    };

    newWs.onclose = (event) => {
      console.log(`WebSocket closed: code=${event.code}, reason="${event.reason}"`);
      
      // Clear references and intervals
      if (wsRef.current === newWs) {
        wsRef.current = null;
      }
      
      if (keepAliveIntervalRef.current) {
        clearInterval(keepAliveIntervalRef.current);
        keepAliveIntervalRef.current = null;
      }
      
      isConnecting.current = false;
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'disconnected' });
      
      // Only attempt reconnection for unexpected closures
      if (shouldReconnect.current && event.code !== 1000 && reconnectAttempts.current < 5) {
        const delay = Math.min(
          1000 * Math.pow(2, reconnectAttempts.current), // Exponential backoff
          30000 // Max 30 seconds
        );
        
        console.log(`Scheduling reconnection attempt ${reconnectAttempts.current + 1} in ${delay}ms`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          if (shouldReconnect.current) {
            reconnectAttempts.current++;
            connect();
          }
        }, delay);
      }
    };

    newWs.onerror = (error) => {
      console.error('WebSocket error:', error);
      isConnecting.current = false;
    };

  }, [userId]);

  // Request notification permissions
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(console.error);
    }
  }, []);

  // Handle network status changes
  useEffect(() => {
    const handleOnline = () => {
      console.log('Network came back online');
      if (state.connectionStatus === 'disconnected' && shouldReconnect.current) {
        // Reset reconnection attempts when network comes back
        reconnectAttempts.current = 0;
        connect();
      }
    };

    const handleOffline = () => {
      console.log('Network went offline');
      cleanup();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [connect, cleanup, state.connectionStatus]);

  // Main connection effect
  useEffect(() => {
    if (userId) {
      shouldReconnect.current = true;
      connect();
    }

    // Cleanup function
    return () => {
      console.log('NotificationProvider unmounting, cleaning up...');
      shouldReconnect.current = false;
      cleanup();
    };
  }, [userId, connect, cleanup]);

  const sendNotification = useCallback((receiverId, message, notificationType) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const payload = {
        type: 'notification',
        receiver_id: receiverId,
        message,
        notification_type: notificationType,
        timestamp: new Date().toISOString()
      };
      
      wsRef.current.send(JSON.stringify(payload));
      console.log('Notification sent:', payload);
    } else {
      console.warn('Cannot send notification: WebSocket not connected');
    }
  }, []);

  const markAsRead = useCallback((notificationId) => {
    dispatch({ type: 'MARK_AS_READ', payload: notificationId });
  }, []);

  const markAllAsRead = useCallback(() => {
    dispatch({ type: 'MARK_ALL_AS_READ' });
  }, []);

  const value = {
    ...state,
    sendNotification,
    markAsRead,
    markAllAsRead
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