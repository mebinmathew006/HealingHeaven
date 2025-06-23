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
import DoctorVideoCallPage from "../pages/Doctor/DoctorVideoCallPage";
import DoctorChat from "../pages/Doctor/DoctorChat";
import UserChat from "../pages/User/UserChat";
import DoctorFeedbackPage from "../pages/Doctor/DoctorFeedbackPage";
import UserFeedbackPage from "../pages/User/UserFeedbackPage";
import AdminNotification from "../pages/Admin/AdminNotification";
import UserViewConsultation from "../pages/User/UserViewConsultation";
import UserComplaintView from "../pages/User/UserComplaintView";
import UserViewNotification from "../pages/User/UserViewNotification";
import AdminComplaint from "../pages/Admin/AdminComplaint";
import DoctorViewFeedback from "../pages/Doctor/DoctorViewFeedback";
import DoctorViewConsultation from "../pages/Doctor/DoctorViewConsultation";
import DoctorDashboard from "../pages/Doctor/DoctorDashboard";

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
        <Route path="/user_chat" element={<UserProtectedRoute><UserChat/></UserProtectedRoute>} />
        <Route path="/user_consultations" element={<UserProtectedRoute><UserViewConsultation/></UserProtectedRoute>} />
        <Route path="/user_feedback_page" element={<UserProtectedRoute><UserFeedbackPage/></UserProtectedRoute>} />
        <Route path="/user_complaint" element={<UserProtectedRoute><UserComplaintView/></UserProtectedRoute>} />
        <Route path="/user_notifications" element={<UserProtectedRoute><UserViewNotification/></UserProtectedRoute>} />
      </Route>


       {/* Doctor */}
        <Route path="/doctor_home_page" element={<DoctorProtectedRoute><DoctorProfile /></DoctorProtectedRoute>} />
        <Route path="/doctor_video_call" element={<DoctorProtectedRoute><DoctorVideoCallPage /></DoctorProtectedRoute>} />
        <Route path="/doctor_chat" element={<DoctorProtectedRoute><DoctorChat/></DoctorProtectedRoute>} />
        <Route path="/doctor_feedback_page" element={<DoctorProtectedRoute><DoctorFeedbackPage/></DoctorProtectedRoute>} />
        <Route path="/doctor_view_feedback" element={<DoctorProtectedRoute><DoctorViewFeedback/></DoctorProtectedRoute>} />
        <Route path="/doctor_view_consultations" element={<DoctorProtectedRoute><DoctorViewConsultation/></DoctorProtectedRoute>} />
        <Route path="/doctor_dashboard" element={<DoctorProtectedRoute><DoctorDashboard/></DoctorProtectedRoute>} />


        {/* Admin */}
        <Route path="/admin_home_page" element={<AdminProtectedRoute><AdminProfile /></AdminProtectedRoute>} />
        <Route path="/admin_user_page" element={<AdminProtectedRoute><AdminUser /></AdminProtectedRoute>} />
        <Route path="/admin_psychologists_page" element={<AdminProtectedRoute><AdminPsychologist /></AdminProtectedRoute>} />
        <Route path="/pending_psychologist/:userId" element={<AdminProtectedRoute><AdminPsychoPending /></AdminProtectedRoute>} />
        <Route path="/admin_consultation_page" element={<AdminProtectedRoute><AdminConsultationList/></AdminProtectedRoute>} />
        <Route path="/admin_notification_page" element={<AdminProtectedRoute><AdminNotification/></AdminProtectedRoute>} />
        <Route path="/admin_complaints" element={<AdminProtectedRoute><AdminComplaint/></AdminProtectedRoute>} />
    </Routes>
  );
};

export default AppRoutes;
