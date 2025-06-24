// pages/DoctorVideoCallPage.js
import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
// import { useNotifications } from "../utils/NotificationContext";
// import VideoCallContainer from "../components/video/VideoCallContainer";
// import NotificationDropdown from "../components/NotificationDropdown";
import { useDoctorWebRTC } from "../../utils/useDoctorWebRTC";
import { useNotifications } from "../../utils/NotificationContext";
import VideoCallContainer from "../../components/video/VideoCallContainer";
import NotificationDropdown from "../../components/NotificationDropdown";

function DoctorVideoCallPage() {
  const navigate = useNavigate();
  const doctorId = useSelector((state) => state.userDetails.id);
  
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotifications();

  const handleCallEnd = ({ consultationId, callDuration }) => {
    setTimeout(() => {
      navigate("/doctor_feedback_page", {
        state: { consultationId, callDuration },
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
    toggleMute,
    toggleVideo,
    endCall,
  } = useDoctorWebRTC({
    doctorId,
    onCallEnd: handleCallEnd,
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
      toggleMute={toggleMute}
      toggleVideo={toggleVideo}
      endCall={endCall}
      isMuted={isMuted}
      userType="doctor"
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

export default DoctorVideoCallPage;