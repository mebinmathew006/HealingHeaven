import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  Settings,
  MessageCircle,
  Users,
  Clock,
} from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosconfig";

function DoctorVideoCallPage() {
  const [userId, setUserId] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [remoteStream, setRemoteStream] = useState(null);
  const [consultationId, setConsultationId] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Waiting for patient");
  const [isUsingFallbackVideo, setIsUsingFallbackVideo] = useState(false);
  const navigate = useNavigate();
  const wsRef = useRef(null);
  const pcRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const callStartTime = useRef(null);
  const fallbackVideoElement = useRef(null);

  const doctorId = useSelector((state) => state.userDetails.id);
  const signalingURL = `ws://localhost/consultations/ws/create_signaling/${doctorId}`;
  const type = "development";

  useEffect(() => {
    initializeWebRTC();

    return () => {
      cleanup();
    };
  }, []);

  // Call duration timer
  useEffect(() => {
    let interval;
    if (isConnected && callStartTime.current) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - callStartTime.current) / 1000);
        setCallDuration(elapsed);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  const cleanup = () => {
    console.log("🧹 Cleaning up call resources...");

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
      document.body.removeChild(fallbackVideoElement.current);
      fallbackVideoElement.current = null;
    }

    setCallDuration(0);
    setIsMuted(false);
    setIsVideoOff(false);
    setIsUsingFallbackVideo(false);
    callStartTime.current = null;
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Improved fallback video creation with better error handling
  const createFallbackVideoStream = async () => {
    return new Promise((resolve, reject) => {
      // Create a canvas-based stream as primary fallback
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext("2d");

      // Create animated placeholder
      let frame = 0;
      const animate = () => {
        // Clear canvas
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw animated background
        const gradient = ctx.createLinearGradient(
          0,
          0,
          canvas.width,
          canvas.height
        );
        gradient.addColorStop(0, "#3b82f6");
        gradient.addColorStop(1, "#8b5cf6");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw pulsing circle
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 50 + Math.sin(frame * 0.1) * 20;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.fill();

        // Draw text
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Camera Unavailable", centerX, centerY - 20);
        ctx.fillText("Using Default Stream", centerX, centerY + 20);

        frame++;
        requestAnimationFrame(animate);
      };

      animate();

      // Try to create stream from canvas
      try {
        const stream = canvas.captureStream(30); // 30 FPS

        // Add a silent audio track
        const audioContext = new (window.AudioContext || window.AudioContext)();
        // window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        gainNode.gain.setValueAtTime(0, audioContext.currentTime); // Silent

        const dest = audioContext.createMediaStreamDestination();
        gainNode.connect(dest);
        oscillator.start();

        // Add audio track to video stream
        const audioTrack = dest.stream.getAudioTracks()[0];
        if (audioTrack) {
          stream.addTrack(audioTrack);
        }

        console.log("✅ Created fallback canvas stream with audio");
        resolve(stream);
      } catch (error) {
        console.error("Failed to create canvas stream:", error);

        // Fallback to video file approach
        createVideoFileStream().then(resolve).catch(reject);
      }
    });
  };

  const createVideoFileStream = async () => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");

      // Try multiple video sources
      const videoSources = [
        "/default.mp4",
        "data:video/mp4;base64,", // You could embed a small base64 video here
        // Fallback to a simple pattern
      ];

      let currentSourceIndex = 0;

      const tryNextSource = () => {
        if (currentSourceIndex >= videoSources.length) {
          reject(new Error("All video sources failed"));
          return;
        }

        video.src = videoSources[currentSourceIndex];
        currentSourceIndex++;
      };

      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.style.display = "none";
      video.width = 640;
      video.height = 480;

      fallbackVideoElement.current = video;
      document.body.appendChild(video);

      video.addEventListener("loadeddata", () => {
        try {
          const stream = video.captureStream(30);

          // Verify stream has tracks
          const videoTracks = stream.getVideoTracks();
          if (videoTracks.length > 0) {
            console.log("✅ Created video file stream");
            resolve(stream);
          } else {
            tryNextSource();
          }
        } catch (error) {
          console.error("Failed to capture stream from video:", error);
          tryNextSource();
        }
      });

      video.addEventListener("error", (e) => {
        console.error("Video loading error:", e);
        tryNextSource();
      });

      // Start with first source
      tryNextSource();

      // Try to play
      video.play().catch((err) => {
        console.warn("Auto-play issue with fallback video:", err);
        // Still try to create stream even if autoplay fails
        setTimeout(() => {
          try {
            const stream = video.captureStream(30);
            if (stream.getVideoTracks().length > 0) {
              resolve(stream);
            }
          } catch (e) {
            tryNextSource();
          }
        }, 1000);
      });
    });
  };

  const getUserMediaWithFallback = async () => {
    try {
      // First try to get camera and microphone
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
        // Try fallback video stream
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

  const updateUserAvailability = async (doctorId, status) => {
    try {
      await axiosInstance.patch(
        `/users/update_availability/${doctorId}/${status}`
      );
    } catch (error) {
      console.error("Availability update failed:", error);
      // Consider retry logic here if important
    }
  };

  const initializeWebRTC = async () => {
    setConnectionStatus("Connecting...");

    wsRef.current = new WebSocket(signalingURL);

    await new Promise((resolve, reject) => {
      wsRef.current.onopen = () => {
        console.log("[Doctor] WebSocket connected");
        setConnectionStatus("Waiting for patient...");
        resolve();
      };

      wsRef.current.onerror = (error) => {
        console.error("[Doctor] WebSocket error:", error);
        setConnectionStatus("Connection failed");
        reject(error);
      };
    });

    try {
      wsRef.current.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        console.log("Incoming WebSocket message:", message);

        if (message.type === "call-initiate") {
          updateUserAvailability(doctorId, false).catch(console.error);
          const incomingUserId = message.senderId;
          setConsultationId(message.consultation_id);
          setUserId(incomingUserId);
          setConnectionStatus("Patient connecting...");

          const pc = new RTCPeerConnection({
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:stun1.l.google.com:19302" },
            ],
          });
          pcRef.current = pc;

          try {
            const stream = await getUserMediaWithFallback();
            setLocalStream(stream);

            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
            }

            // Add tracks to peer connection
            stream.getTracks().forEach((track) => {
              console.log(`Adding ${track.kind} track to peer connection`);
              pc.addTrack(track, stream);
            });
          } catch (error) {
            console.error("Failed to get media stream:", error);
            setConnectionStatus("Media setup failed");
            return;
          }

          pc.ontrack = (event) => {
            console.log("✅ Remote stream received!", event.streams[0]);
            const remoteStream = event.streams[0];

            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
            }

            setRemoteStream(remoteStream);
            setIsConnected(true);
            setConnectionStatus("Call connected");
            callStartTime.current = Date.now();
          };

          pc.onicecandidate = (event) => {
            if (event.candidate) {
              wsRef.current.send(
                JSON.stringify({
                  type: "ice-candidate",
                  targetId: incomingUserId,
                  senderId: doctorId,
                  candidate: event.candidate,
                })
              );
            }
          };

          // Add connection state monitoring
          pc.onconnectionstatechange = () => {
            console.log("Connection state:", pc.connectionState);
            if (pc.connectionState === "failed") {
              setConnectionStatus("Connection failed");
            }
          };

          try {
            await pc.setRemoteDescription(
              new RTCSessionDescription(message.offer)
            );
            console.log("✅ Set remote description");

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            console.log("✅ Created and set local description");

            wsRef.current.send(
              JSON.stringify({
                type: "call-answer",
                targetId: incomingUserId,
                senderId: doctorId,
                answer: pc.localDescription,
              })
            );
            console.log("✅ Sent answer");
          } catch (error) {
            console.error("Error in offer/answer exchange:", error);
            setConnectionStatus("Call setup failed");
          }
        }

        if (message.type === "ice-candidate" && pcRef.current) {
          try {
            await pcRef.current.addIceCandidate(
              new RTCIceCandidate(message.candidate)
            );
            console.log("✅ Added ICE candidate");
          } catch (err) {
            console.error("[Doctor] Failed to add ICE candidate:", err);
          }
        }

        if (message.type === "call-end") {
          // cleanup();
          setConnectionStatus("Call ended by other user");
          setIsConnected(false);
          toast.info("Call ended by other user");
          endCall();
        }
      };
    } catch (error) {
      console.error("WebSocket message handling error:", error);
      setConnectionStatus("Connection error");
    }

    wsRef.current.onclose = (event) => {
      console.log("WebSocket closed:", event.code, event.reason);
      setConnectionStatus("Disconnected");
      setIsConnected(false);
    };
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

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const endCall = () => {
    console.log("📞 Ending the call...");

    // Notify the other user if still connected
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "call-end",
          senderId: doctorId,
          sender: "doctor",
          targetId: userId,
        })
      );
    }

    // Cleanup all resources
    cleanup();

    // Update state
    setConnectionStatus("Call ended");
    setIsConnected(false);
    updateUserAvailability(doctorId, true).catch(console.error);
    // Navigate after slight delay to ensure cleanup is complete
    setTimeout(() => {
      navigate("/doctor_feedback_page", {
        state: { consultationId: consultationId ,callDuration:callDuration},
      });
    }, 500); // 500ms is typically enough
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected
                  ? "bg-emerald-400 animate-pulse"
                  : "bg-amber-400 animate-pulse"
              }`}
            ></div>
            <h1 className="text-white text-xl font-semibold">Doctor Console</h1>
          </div>

          <span
            className={`text-sm px-3 py-1 rounded-full ${
              isConnected
                ? "bg-emerald-500/20 text-emerald-300"
                : "bg-amber-500/20 text-amber-300"
            }`}
          >
            {connectionStatus}
          </span>

          {isUsingFallbackVideo && (
            <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-300 rounded-full">
              Fallback Video
            </span>
          )}

          {isConnected && (
            <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-1">
              <Clock size={16} className="text-white/70" />
              <span className="text-white text-sm font-mono">
                {formatDuration(callDuration)}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2">
            <Users size={16} className="text-white/70" />
            <span className="text-white/70 text-sm">
              Patient ID: {userId || "Waiting..."}
            </span>
          </div>

          <button className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 text-white/70 hover:text-white">
            <MessageCircle size={20} />
          </button>
          <button className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 text-white/70 hover:text-white">
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative p-6">
        {/* Remote Video (Main) */}
        <div className="relative w-full h-full rounded-2xl overflow-hidden bg-slate-800/50 backdrop-blur-sm border border-white/10 shadow-2xl">
          <video
            ref={remoteVideoRef}
            autoPlay
            className="w-full h-full object-cover"
            poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='100%25' height='100%25' fill='%23334155'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='20' fill='%23cbd5e1' text-anchor='middle' dy='.3em'%3EWaiting for patient...%3C/text%3E%3C/svg%3E"
          />
          {!remoteStream && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mb-4 mx-auto animate-pulse">
                  <Users size={40} className="text-white" />
                </div>
                <p className="text-white/70 text-lg">
                  Waiting for patient to join...
                </p>
                <p className="text-white/50 text-sm mt-2">
                  Share the consultation link with your patient
                </p>
              </div>
            </div>
          )}

          {/* Remote Video Overlay */}
          {remoteStream && (
            <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2">
              <p className="text-white text-sm font-medium">Patient</p>
            </div>
          )}
        </div>

        {/* Local Video (Picture-in-Picture) */}
        <div className="absolute bottom-6 right-6 w-64 h-48 rounded-xl overflow-hidden bg-slate-800 border-2 border-white/20 shadow-2xl group hover:scale-105 transition-transform duration-200">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            className="w-full h-full object-cover"
          />
          {isVideoOff && (
            <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <VideoOff size={24} className="text-white" />
              </div>
            </div>
          )}

          <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm rounded px-2 py-1">
            <p className="text-white text-xs">
              Dr. You {isUsingFallbackVideo && "(Fallback)"}
            </p>
          </div>

          {/* Local video controls overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
              <Monitor size={16} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="p-6 bg-black/30 backdrop-blur-sm border-t border-white/10">
        <div className="flex items-center justify-center space-x-4">
          {/* Mute Button */}
          <button
            onClick={toggleMute}
            className={`p-4 rounded-2xl transition-all duration-200 ${
              isMuted
                ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>

          {/* Video Button */}
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-2xl transition-all duration-200 ${
              isVideoOff
                ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
          </button>

          {/* End Call Button */}
          <button
            onClick={endCall}
            className="p-4 rounded-2xl bg-red-500 hover:bg-red-600 text-white transition-all duration-200 shadow-lg shadow-red-500/25 hover:shadow-red-500/40"
          >
            <PhoneOff size={24} />
          </button>

          {/* Screen Share Button */}
          <button className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all duration-200">
            <Monitor size={24} />
          </button>

          {/* More Options */}
          <button className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all duration-200">
            <Settings size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default DoctorVideoCallPage;
