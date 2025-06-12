// socketSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  socket: null,
  status: 'disconnected', // 'connecting', 'connected', 'error'
  error: null
};

const socketSlice = createSlice({
  name: "socketDetails",
  initialState,
  reducers: {
    socketConnecting: (state) => {
      state.status = 'connecting';
    },
    socketConnected: (state, action) => {
      state.socket = action.payload;
      state.status = 'connected';
      state.error = null;
    },
    socketDisconnected: (state) => {
      if (state.socket?.readyState === WebSocket.OPEN) {
        state.socket.close();
      }
      state.socket = null;
      state.status = 'disconnected';
    },
    socketError: (state, action) => {
      state.error = action.payload;
      state.status = 'error';
    }
  }
});

export const { socketConnecting, socketConnected, socketDisconnected, socketError } = socketSlice.actions;
export default socketSlice.reducer;