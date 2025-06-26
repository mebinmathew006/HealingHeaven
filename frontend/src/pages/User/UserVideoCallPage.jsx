// pages/PatientVideoCallPage.js
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { usePatientWebRTC } from "../../utils/usePatientWebRTC";
import { useNotifications } from "../../utils/NotificationContext";
import VideoCallContainer from "../../components/video/VideoCallContainer";
import NotificationDropdown from "../../components/NotificationDropdown";

function UserVideoCallPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get doctor ID and consultation ID from route state or props
  const patientId = useSelector((state) => state.userDetails.id);
  const { doctorId, psychologist_fee, consultationId ,isRecordingtoggle} = location?.state || {};

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotifications();

  const handleCallEnd = ({ consultationId }) => {
    setTimeout(() => {
      navigate("/user_feedback_page", {
        state: { consultation_id: consultationId },
      });
    }, 500);
  };

  const {
    isMuted,
    isVideoOff,
    isConnected,
    localStream,
    callDuration,
    remoteStream,
    connectionStatus,
    isUsingFallbackVideo,
    localVideoRef,
    remoteVideoRef,
    callRecord,
    toggleMute,
    toggleVideo,
    endCall,
  } = usePatientWebRTC({
    patientId,
    doctorId,
    consultationId,
    onCallEnd: handleCallEnd,
    isRecordingtoggle,
  });
 

  return (
    <VideoCallContainer
      localStream={localStream}
      remoteStream={remoteStream}
      isConnected={isConnected}
      connectionStatus={connectionStatus}
      callDuration={callDuration}
      isUsingFallbackVideo={isUsingFallbackVideo}
      localVideoRef={localVideoRef}
      remoteVideoRef={remoteVideoRef}
      isVideoOff={isVideoOff}
      callRecord={callRecord}
      toggleMute={toggleMute}
      toggleVideo={toggleVideo}
      endCall={endCall}
      isMuted={isMuted}
      userType="patient"
      isRecordingtoggle={isRecordingtoggle}
    >
      <NotificationDropdown
        notifications={notifications}
        unreadCount={unreadCount}
        markAsRead={markAsRead}
        markAllAsRead={markAllAsRead}
        removeNotification={removeNotification}
      />
    </VideoCallContainer>
  );
}

export default UserVideoCallPage;
