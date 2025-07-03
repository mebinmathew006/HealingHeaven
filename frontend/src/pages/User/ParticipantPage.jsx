import React from 'react';
import { ParticipantVideoCall } from "../../components/zego/ParticipantVideoCall";
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { updateStatusConsultation } from '../../services/consultationService';

export const ParticipantPage = () => {
  const userId = useSelector((state)=>state.userDetails.id)
  const location = useLocation();
  const navigate =useNavigate()
  const { doctorId, psychologist_fee, consultationId } = location?.state || {};
  const handleCallEnd = async () => {
    console.log('Call ended');
    await updateStatusConsultation('ended',consultationId)
    navigate("/user_consultations");
  };

  const handleError = (error) => {
    console.error('Video call error:', error);
    // Show error message to user
  };

  return (
    <ParticipantVideoCall
      userId={userId}
      roomId={consultationId}
      onCallEnd={handleCallEnd}
      onError={handleError}
    />
  );
};