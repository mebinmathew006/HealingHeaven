import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // Remove socket from state - manage it externally
  status: 'disconnected',
  url: null,
  readyState: null,
  error: null,
  lastConnectedAt: null
};

const socketSlice = createSlice({
  name: "socketDetails",
  initialState,
  reducers: {
    socketConnecting: (state, action) => {
      state.status = 'connecting';
      state.url = action.payload.url;
      state.error = null;
    },
    socketConnected: (state, action) => {
      // Don't store the socket - just the metadata
      state.status = 'connected';
      state.url = action.payload.url;
      state.readyState = action.payload.readyState;
      state.lastConnectedAt = new Date().toISOString();
    },
    socketDisconnected: (state) => {
      state.status = 'disconnected';
      state.readyState = WebSocket.CLOSED;
      state.url = null;
    },
    socketError: (state, action) => {
      state.status = 'error';
      state.error = action.payload;
      state.readyState = WebSocket.CLOSED;
    }
  }
});

export const { socketConnecting, socketConnected, socketDisconnected, socketError } =
  socketSlice.actions;
export default socketSlice.reducer;