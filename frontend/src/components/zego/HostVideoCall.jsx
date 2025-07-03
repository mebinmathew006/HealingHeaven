import React from 'react';
import { VideoCallProvider } from './VideoCallProvider';
import { VideoCallComponent } from './VideoCallComponent';

export const HostVideoCall = ({ 
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
        userId={userId}
        roomId={roomId}
        userRole="Host"
        enableRecording={true}
        onError={onError}
      />
    </VideoCallProvider>
  );
};