import React from 'react';

import { HostVideoCall } from "../../components/zego/HostVideoCall";
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { updateStatusConsultation } from '../../services/consultationService';

export const HostPage = () => {
  const navigate = useNavigate()
  const location = useLocation();
  const doctorId =useSelector((state)=>state.userDetails.id)
  const { consultationId} = location?.state || {};
  const handleCallEnd = async() => {
    console.log('Call ended');
    await updateStatusConsultation('ended',consultationId)
    navigate("/doctor_view_consultations");

  };

  const handleRecordingComplete = (recordingUrl) => {
    console.log('Recording saved:', recordingUrl);
    // Save recording URL to your database
    // The recording is automatically stored in ZegoCloud
  };

  const handleError = (error) => {
    console.error('Video call error:', error);
    // Show error message to user
  };

  return (
    <HostVideoCall
      userId={"doctor"+doctorId}
    roomId={"room"+consultationId}
      onCallEnd={handleCallEnd}
      onRecordingComplete={handleRecordingComplete}
      onError={handleError}
    />
  );
};