import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  socket: null,
};

const SocketSlice = createSlice({
  name: "socketDetailsSlice",
  initialState: initialState,
  reducers: {
    setSocket: (state, action) => {
      state.socket = action.payload.socket;
    },
    clearSocket: (state, action) => {
      if (state.socket) {
        state.socket.disconnect();
      }
      state.socket = null;
    },
  },
});

export const {setSocket,clearSocket} =SocketSlice.actions;
export default SocketSlice.reducer