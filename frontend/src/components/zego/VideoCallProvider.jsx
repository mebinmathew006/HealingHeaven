import React, { createContext, useContext, useState, useCallback } from 'react';

const VideoCallContext = createContext();

export const useVideoCall = () => {
  const context = useContext(VideoCallContext);
  if (!context) {
    throw new Error('useVideoCall must be used within a VideoCallProvider');
  }
  return context;
};

export const VideoCallProvider = ({ children, onCallEnd, onRecordingComplete }) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState(null);
  const [participants, setParticipants] = useState([]);

  const endCall = useCallback(() => {
    setIsCallActive(false);
    setParticipants([]);
    onCallEnd?.();
  }, [onCallEnd]);

  const handleRecordingUpdate = useCallback((state) => {
    if (state.url) {
      setRecordingUrl(state.url);
      onRecordingComplete?.(state.url);
    }
  }, [onRecordingComplete]);

  const value = {
    isCallActive,
    setIsCallActive,
    recordingUrl,
    participants,
    setParticipants,
    endCall,
    handleRecordingUpdate,
  };

  return (
    <VideoCallContext.Provider value={value}>
      {children}
    </VideoCallContext.Provider>
  );
};