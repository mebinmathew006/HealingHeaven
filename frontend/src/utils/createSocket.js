export const createSocket = (userId) => {
  
  const socket = new WebSocket(`ws://localhost/consultations/ws/create_socket/${userId}`);

  socket.userId = userId;

  socket.onopen = () => {
    console.log("WebSocket connected!");
  };

  socket.onclose = () => {
    console.log("WebSocket disconnected.");
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  return socket;
};
