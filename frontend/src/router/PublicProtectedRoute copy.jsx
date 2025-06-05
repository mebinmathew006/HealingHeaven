import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const PublicProtectedRoute = ({ children }) => {
 const user = useSelector((state) => state.userDetails.id);
 const role = useSelector((state) => state.userDetails.role);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Redirect authenticated users trying to access public pages
      navigate(-1);
    }
  }, [user, navigate]);

  if (user) {
    return null; // Avoid rendering the public page during redirect
  }

  return children;
};

export default PublicProtectedRoute;
