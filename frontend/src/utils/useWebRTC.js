// hooks/useWebRTC.js
import { useCallback, useEffect, useRef, useState } from "react";
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

const callRecord =() => {
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = async () => {
    try {
      // Combine both video and audio streams
      const combinedStream = new MediaStream();
      
      // Add tracks from remote stream (other participant)
      if (remoteStream) {
        remoteStream.getTracks().forEach(track => {
          combinedStream.addTrack(track);
        });
      }
      
      // Add tracks from local stream (if you want to include local video too)
      if (localStream) {
        localStream.getTracks().forEach(track => {
          combinedStream.addTrack(track);
        });
      }

      // Check if we have any tracks to record
      if (combinedStream.getTracks().length === 0) {
        throw new Error("No media tracks available for recording");
      }

      // Create media recorder
      mediaRecorderRef.current = new MediaRecorder(combinedStream, {
        mimeType: 'video/webm;codecs=vp9,opus',
        bitsPerSecond: 2500000 // 2.5 Mbps
      });

      // Handle data available event
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorderRef.current.onstop = () => {
        saveRecording();
      };

      // Start recording
      recordedChunksRef.current = [];
      mediaRecorderRef.current.start(1000); // Collect data every 1 second
      setIsRecording(true);
      
      toast.success("Recording started", { position: "bottom-center" });
    } catch (error) {
      console.error("Failed to start recording:", error);
      toast.error("Failed to start recording", { position: "bottom-center" });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all tracks to release resources
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const saveRecording = () => {
    try {
      const blob = new Blob(recordedChunksRef.current, {
        type: 'video/webm'
      });

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const participantType = userType === 'doctor' ? 'doctor' : 'patient';
      a.download = `video-call-${participantType}-${timestamp}.webm`;
      
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      toast.success("Recording saved", { position: "bottom-center" });
    } catch (error) {
      console.error("Failed to save recording:", error);
      toast.error("Failed to save recording", { position: "bottom-center" });
    }
  };

  // Auto-stop recording when call ends
  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecording();
      }
    };
  }, [isRecording]);

  return {
    startRecording,
    stopRecording,
    isRecording,
    saveRecording
  };
}



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
    stopRecording()
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