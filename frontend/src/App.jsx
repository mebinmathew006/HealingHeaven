import React from "react";
import "./App.css";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./router/AppRoutes";
import { ToastContainer } from "react-toastify";
import { NotificationProvider } from "./utils/NotificationContext";
import { useSelector } from "react-redux";
function App() {
const userId =useSelector((state)=>state.userDetails.id)
  return (
    <>
      <NotificationProvider userId={userId}>
          <BrowserRouter>
            <ToastContainer />
            <AppRoutes />
          </BrowserRouter>
  </NotificationProvider>

    </>
  );
}

export default App;
