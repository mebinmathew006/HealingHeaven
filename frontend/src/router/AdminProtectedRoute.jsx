import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const AdminProtectedRoute = ({ children, allowedRoles = [] }) => {
  const user = useSelector((state) => state.userDetails.id);
  const role = useSelector((state) => state.userDetails.role);
  // const isAuthenticated = Boolean(user?.access_token);

  if (!user) {
    // Not logged in
    toast.error('Please Login', { position: 'bottom-center' });
    return <Navigate to="/login" replace />;
  }

  if (role=='admin') {
    return children;
    
  }
return <Navigate to="/login" replace />;
};

export default AdminProtectedRoute;
