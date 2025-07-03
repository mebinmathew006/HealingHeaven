import { useCallback } from 'react';
import { useVideoCall } from './VideoCallProvider';

export const useVideoCallActions = () => {
  const { endCall, isCallActive, recordingUrl } = useVideoCall();

  const leaveCall = useCallback(() => {
    endCall();
  }, [endCall]);

  const getRecordingUrl = useCallback(() => {
    return recordingUrl;
  }, [recordingUrl]);

  return {
    leaveCall,
    getRecordingUrl,
    isCallActive
  };
};