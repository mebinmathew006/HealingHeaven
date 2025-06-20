import React, { useState } from "react";
import "./App.css";
import { BrowserRouter, Route, Router } from "react-router-dom";
import AppRoutes from "./router/AppRoutes";
import store, { persistor } from "./store/store";
import { PersistGate } from "redux-persist/integration/react";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <BrowserRouter>
            <ToastContainer />
            <AppRoutes />
          </BrowserRouter>
        </PersistGate>
      </Provider>
    </>
  );
}

export default App;
