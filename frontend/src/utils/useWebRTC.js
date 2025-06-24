// hooks/useWebRTC.js
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../axiosconfig";

export const useWebRTC = ({ 
  userId, 
  userType, // 'doctor' or 'patient'
  signalingURL,
  onCallEnd 
}) => {
  const [targetUserId, setTargetUserId] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [remoteStream, setRemoteStream] = useState(null);
  const [consultationId, setConsultationId] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(
    userType === 'doctor' ? "Waiting for patient" : "Connecting to doctor"
  );
  const [isUsingFallbackVideo, setIsUsingFallbackVideo] = useState(false);

  const wsRef = useRef(null);
  const pcRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const callStartTime = useRef(null);
  const fallbackVideoElement = useRef(null);
  const callDurationInterval = useRef(null);

  // Media handling functions
  const createFallbackVideoStream = async () => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext("2d");

      let frame = 0;
      const animate = () => {
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, "#3b82f6");
        gradient.addColorStop(1, "#8b5cf6");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 50 + Math.sin(frame * 0.1) * 20;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.fill();

        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Camera Unavailable", centerX, centerY - 20);
        ctx.fillText("Using Default Stream", centerX, centerY + 20);

        frame++;
        requestAnimationFrame(animate);
      };

      animate();

      try {
        const stream = canvas.captureStream(30);
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);

        const dest = audioContext.createMediaStreamDestination();
        gainNode.connect(dest);
        oscillator.start();

        const audioTrack = dest.stream.getAudioTracks()[0];
        if (audioTrack) {
          stream.addTrack(audioTrack);
        }

        console.log("✅ Created fallback canvas stream with audio");
        resolve(stream);
      } catch (error) {
        console.error("Failed to create canvas stream:", error);
        reject(error);
      }
    });
  };

  const getUserMediaWithFallback = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true,
      });
      console.log("✅ Got user media stream");
      setIsUsingFallbackVideo(false);
      return stream;
    } catch (error) {
      console.warn("Camera/microphone not available:", error);
      toast.warning("Camera unavailable, using fallback video", {
        position: "bottom-center",
      });

      setIsUsingFallbackVideo(true);

      try {
        const fallbackStream = await createFallbackVideoStream();
        console.log("✅ Created fallback stream");
        return fallbackStream;
      } catch (fallbackError) {
        console.error("All media sources failed:", fallbackError);
        toast.error("Unable to create any video stream", {
          position: "bottom-center",
        });
        throw fallbackError;
      }
    }
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const callRecord = () => {
    console.log('record started.......................')
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const updateUserAvailability = async (userId, status) => {
    try {
      await axiosInstance.patch(`/users/update_availability/${userId}/${status}`);
    } catch (error) {
      console.error("Availability update failed:", error);
    }
  };

  const startCallDurationTimer = () => {
    callStartTime.current = Date.now();
    callDurationInterval.current = setInterval(() => {
      if (callStartTime.current) {
        setCallDuration(Math.floor((Date.now() - callStartTime.current) / 1000));
      }
    }, 1000);
  };

  const stopCallDurationTimer = () => {
    if (callDurationInterval.current) {
      clearInterval(callDurationInterval.current);
      callDurationInterval.current = null;
    }
  };

  const cleanup = () => {
    console.log("🧹 Cleaning up call resources...");

    stopCallDurationTimer();

    if (pcRef.current) {
      pcRef.current.ontrack = null;
      pcRef.current.onicecandidate = null;
      pcRef.current.onconnectionstatechange = null;
      pcRef.current.close();
      pcRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.onmessage = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.close();
      wsRef.current = null;
    }

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }

    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
      setRemoteStream(null);
    }

    if (fallbackVideoElement.current) {
      if (document.body.contains(fallbackVideoElement.current)) {
        document.body.removeChild(fallbackVideoElement.current);
      }
      fallbackVideoElement.current = null;
    }

    setCallDuration(0);
    setIsMuted(false);
    setIsVideoOff(false);
    setIsUsingFallbackVideo(false);
    callStartTime.current = null;
  };

  const endCall = () => {
    console.log("📞 Ending the call...");

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "call-end",
          senderId: userId,
          sender: userType,
          targetId: targetUserId,
        })
      );
    }

    cleanup();
    setConnectionStatus("Call ended");
    setIsConnected(false);

    if (userType === 'doctor') {
      updateUserAvailability(userId, true).catch(console.error);
    }

    if (onCallEnd) {
      onCallEnd({ consultationId, callDuration });
    }
  };

  return {
    // State
    targetUserId,
    isMuted,
    isVideoOff,
    isConnected,
    localStream,
    callDuration,
    remoteStream,
    consultationId,
    connectionStatus,
    isUsingFallbackVideo,
    
    // Refs
    localVideoRef,
    remoteVideoRef,
    wsRef,
    pcRef,
    
    // Functions
    toggleMute,
    toggleVideo,
    endCall,
    cleanup,
    getUserMediaWithFallback,
    startCallDurationTimer,
    updateUserAvailability,
    callRecord,
    
    // Setters for internal use
    setTargetUserId,
    setConsultationId,
    setConnectionStatus,
    setIsConnected,
    setLocalStream,
    setRemoteStream,
  };
};