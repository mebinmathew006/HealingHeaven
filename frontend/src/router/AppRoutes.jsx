// src/router/index.jsx
import { Routes, Route } from "react-router-dom";
import React from "react";
import MainLayout from "../layouts/MainLayout";
import IndexPage from "../pages/Public/IndexPage";
import SignupPage from "../pages/Public/SignupPage";
import OtpPage from "../pages/Public/OtpPage";
import SuccessPage from "../pages/Public/SuccessPage";
import LoginPage from "../pages/Public/LoginPage";
import UserHomePage from "../pages/User/UserHomePage";
import UserProfile from "../pages/User/UserProfile";
import ForgotPassword from "../pages/Public/ForgetPassword";
import PasswordOTPVerification from "../pages/Public/PasswordOTPVerification";
import ViewPsychologists from "../pages/User/ViewPsychologists";
import DoctorProfile from "../pages/Doctor/DoctorProfile";
import AdminProfile from "../pages/Admin/AdminProfile";
import AdminUser from "../pages/Admin/AdminUser";
import AdminPsychologist from "../pages/Admin/AdminPsychologist";
import AdminPsychoPending from "../pages/Admin/AdminPsychoPending";
import UserProtectedRoute from "./UserProtectedRoute";
import DoctorProtectedRoute from "./DoctorProtectedRoute";
import AdminProtectedRoute from "./AdminProtectedRoute";
import ServicesPage from "../pages/Public/ServicesPage";
import AboutUsPage from "../pages/Public/AboutUsPage";
import ContactUsPage from "../pages/Public/ContactUsPage";
import PsychologistsDirectory from "../pages/Public/PsychologistsDirectory";
import UserViewDoctorDetails from "../pages/User/UserViewDoctorDetails";
import DoctorDetailsPage from "../pages/Public/DoctorDetailsPage";
import WalletPage from "../pages/User/WalletPage";
import UserVideoCallPage from "../pages/User/UserVideoCallPage";
import AdminConsultationList from "../pages/Admin/AdminConsultationList";
import PublicProtectedRoute from "./PublicProtectedRoute copy";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Routes with MainLayout */}
      <Route element={<MainLayout />}>
      {/* public */}
        <Route path="/" element={<IndexPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify_otp" element={<OtpPage />} />
        <Route path="/verificationsucess" element={<SuccessPage />} />
        <Route path="/forgetpassword" element={<ForgotPassword />} />
        <Route path="/verify_otp_password" element={<PasswordOTPVerification />} />
        <Route path="/therapists" element={<PsychologistsDirectory />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/aboutus" element={<AboutUsPage />} />
        <Route path="/contactus" element={<ContactUsPage />} />
        <Route path="/public_view_psychologist_details" element={<DoctorDetailsPage />} />


        {/* user */}
        <Route path="/user_home_page" element={<UserProtectedRoute><UserHomePage /></UserProtectedRoute>} />
        <Route path="/user_profile" element={<UserProtectedRoute><UserProfile /></UserProtectedRoute>} />
        <Route path="/user_view_psychologist" element={<UserProtectedRoute><ViewPsychologists /></UserProtectedRoute>} />
        <Route path="/user_view_psychologist_details" element={<UserProtectedRoute><UserViewDoctorDetails /></UserProtectedRoute>} />
        <Route path="/wallet" element={<UserProtectedRoute><WalletPage/></UserProtectedRoute>} />
        <Route path="/videocall" element={<UserProtectedRoute><UserVideoCallPage/></UserProtectedRoute>} />
      </Route>


       {/* Doctor */}
        <Route path="/doctor_home_page" element={<DoctorProtectedRoute><DoctorProfile /></DoctorProtectedRoute>} />


        {/* Admin */}
        <Route path="/admin_home_page" element={<AdminProtectedRoute><AdminProfile /></AdminProtectedRoute>} />
        <Route path="/admin_user_page" element={<AdminProtectedRoute><AdminUser /></AdminProtectedRoute>} />
        <Route path="/admin_psychologists_page" element={<AdminProtectedRoute><AdminPsychologist /></AdminProtectedRoute>} />
        <Route path="/pending_psychologist/:userId" element={<AdminProtectedRoute><AdminPsychoPending /></AdminProtectedRoute>} />
        <Route path="/admin_consultation_page" element={<AdminProtectedRoute><AdminConsultationList/></AdminProtectedRoute>} />
    </Routes>
  );
};

export default AppRoutes;
