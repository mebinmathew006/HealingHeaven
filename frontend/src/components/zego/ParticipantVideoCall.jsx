import React from 'react';
import { VideoCallProvider } from './VideoCallProvider';
import { VideoCallComponent } from './VideoCallComponent';

export const ParticipantVideoCall = ({ 
  userId, 
  roomId, 
  onCallEnd, 
  onRecordingComplete, 
  onError 
}) => {
  return (
    <VideoCallProvider 
      onCallEnd={onCallEnd} 
      onRecordingComplete={onRecordingComplete}
    >
      <VideoCallComponent
        userId={"user"+userId}
        roomId={"room"+roomId}
        userRole="Participant"
        enableRecording={false} // Usually only host records
        onError={onError}
      />
    </VideoCallProvider>
  );
};