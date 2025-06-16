import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
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
  Wifi,
  WifiOff,
} from "lucide-react";
import axiosInstance from "../../axiosconfig";
import { toast } from "react-toastify";

function UserVideoCallPage() {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [usingFallback, setUsingFallback] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState("good");
  const [retryCount, setRetryCount] = useState(0);
  
  const userId = useSelector((state) => state.userDetails.id);
  const location = useLocation();           
  const navigate = useNavigate();           
  const {doctorId,psychologist_fee} = location?.state;
  
  const wsRef = useRef(null);
  const pcRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const fallbackCanvasRef = useRef(null);
  const fallbackAnimationRef = useRef(null);
  const connectionStatsRef = useRef(null);
  let attempt = 1
  const signalingURL = `ws://localhost/consultations/ws/create_signaling/${userId}`;

  const fetchIceServers = async () => {
    try {
      const res = await axiosInstance.get("/consultations/turn-credentials");
      return res.data.iceServers;
    } catch (error) {
      console.error("Failed to fetch ICE servers:", error);
      return [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ];
    }
  };

  // Enhanced Canvas-based fallback stream
  const createCanvasFallbackStream = () => {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        
        fallbackCanvasRef.current = canvas;
        canvas.style.display = 'none';
        document.body.appendChild(canvas);

        let animationFrame = 0;
        const animate = () => {
          // Clear canvas with gradient background
          const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          gradient.addColorStop(0, '#1e293b');
          gradient.addColorStop(1, '#334155');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Animated pulsing circle
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const radius = 50 + Math.sin(animationFrame * 0.05) * 20;
          
          const circleGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
          circleGradient.addColorStop(0, 'rgba(99, 102, 241, 0.8)');
          circleGradient.addColorStop(1, 'rgba(99, 102, 241, 0.2)');
          
          ctx.fillStyle = circleGradient;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
          ctx.fill();

          // User icon in center
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 32px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('👤', centerX, centerY + 10);

          // Status text
          ctx.fillStyle = '#94a3b8';
          ctx.font = '16px Arial';
          ctx.fillText('Fallback Video Active', centerX, centerY + 60);
          ctx.fillText('Camera unavailable', centerX, centerY + 80);

          animationFrame++;
          fallbackAnimationRef.current = requestAnimationFrame(animate);
        };

        animate();

        // Create video stream from canvas at 30 FPS
        const videoStream = canvas.captureStream(30);
        
        // Create silent audio track
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        gainNode.gain.value = 0; // Silent
        oscillator.frequency.value = 440;
        oscillator.start();

        // Get audio stream from audio context
        const audioDestination = audioContext.createMediaStreamDestination();
        gainNode.connect(audioDestination);
        const audioStream = audioDestination.stream;

        // Combine video and audio streams
        const combinedStream = new MediaStream([
          ...videoStream.getVideoTracks(),
          ...audioStream.getAudioTracks()
        ]);

        console.log("✅ Canvas fallback stream created successfully");
        setUsingFallback(true);
        resolve(combinedStream);
      } catch (error) {
        console.error("❌ Canvas fallback failed:", error);
        reject(error);
      }
    });
  };

  // Enhanced video file fallback with multiple sources
  const createVideoFileFallbackStream = async () => {
    const videoSources = ['/default.mp4', '/fallback.mp4', '/placeholder.webm'];
    
    for (const videoSrc of videoSources) {
      try {
        const stream = await new Promise((resolve, reject) => {
          const video = document.createElement("video");
          video.src = videoSrc;
          video.autoplay = true;
          video.muted = true;
          video.loop = true;
          video.playsInline = true;
          video.crossOrigin = "anonymous";

          const timeout = setTimeout(() => {
            reject(new Error(`Video load timeout: ${videoSrc}`));
          }, 5000);

          video.addEventListener("loadeddata", () => {
            clearTimeout(timeout);
            try {
              const stream = video.captureStream(30);
              if (stream && stream.getVideoTracks().length > 0) {
                video.style.display = "none";
                document.body.appendChild(video);
                video.play();
                console.log(`✅ Video fallback stream created from: ${videoSrc}`);
                setUsingFallback(true);
                resolve(stream);
              } else {
                reject(new Error("No video tracks in stream"));
              }
            } catch (err) {
              reject(err);
            }
          });

          video.addEventListener("error", (e) => {
            clearTimeout(timeout);
            reject(new Error(`Video load error: ${e.message}`));
          });
        });

        return stream;
      } catch (error) {
        console.warn(`Failed to load video source ${videoSrc}:`, error);
        continue;
      }
    }
    
    throw new Error("All video sources failed");
  };

  // Enhanced media stream acquisition with robust fallback
  const getMediaStream = async () => {
    if (!navigator.mediaDevices) {
    throw new Error("Media devices not available");
  }
    const constraints = {
      video: {
        width: { ideal: 1280, min: 640 },
        height: { ideal: 720, min: 480 },
        frameRate: { ideal: 30, min: 15 }
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    };

    try {
      // Primary: Try to get user media
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("✅ Primary camera stream acquired");
      setUsingFallback(false);
      return stream;
    } catch (primaryError) {
      console.warn("Primary camera failed:", primaryError);
      toast.warn("Camera unavailable, switching to fallback video", { position: 'bottom-center' });

      try {
        // Secondary: Try canvas-based fallback
        const canvasStream = await createCanvasFallbackStream();
        return canvasStream;
      } catch (canvasError) {
        console.warn("Canvas fallback failed:", canvasError);

        try {
          // Tertiary: Try video file fallback
          const videoStream = await createVideoFileFallbackStream();
          return videoStream;
        } catch (videoError) {
          console.error("All fallback methods failed:", videoError);
          
          // Final fallback: Audio only
          try {
            const audioOnlyStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            toast.error("Video unavailable, audio-only mode", { position: 'bottom-center' });
            return audioOnlyStream;
          } catch (audioError) {
            throw new Error("No media devices available");
          }
        }
      }
    }
  };

  // Connection quality monitoring
  const monitorConnectionQuality = () => {
    if (!pcRef.current) return;

    const checkStats = async () => {
      try {
        const stats = await pcRef.current.getStats();
        let inboundRtp = null;
        
        stats.forEach(report => {
          if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
            inboundRtp = report;
          }
        });

        if (inboundRtp) {
          const packetsLost = inboundRtp.packetsLost || 0;
          const packetsReceived = inboundRtp.packetsReceived || 0;
          const lossRate = packetsReceived > 0 ? packetsLost / packetsReceived : 0;

          if (lossRate > 0.05) {
            setConnectionQuality("poor");
          } else if (lossRate > 0.02) {
            setConnectionQuality("fair");
          } else {
            setConnectionQuality("good");
          }
        }
      } catch (error) {
        console.warn("Failed to get connection stats:", error);
      }
    };

    connectionStatsRef.current = setInterval(checkStats, 5000);
  };

  // Enhanced WebRTC initialization with retry logic
  const initializeWebRTC = async (attempt) => {
     if (!window.RTCPeerConnection) {
    throw new Error("WebRTC not supported");
  }
    const maxAttempts = 3;
    
    try {
      setConnectionStatus(`Connecting... (Attempt ${attempt})`);
      setRetryCount(attempt - 1);

      // WebSocket connection with timeout
      const wsPromise = new Promise((resolve, reject) => {
        const ws = new WebSocket(signalingURL);
        const timeout = setTimeout(() => {
          ws.close();
          reject(new Error("WebSocket connection timeout"));
        }, 10000);

        ws.onopen = () => {
          clearTimeout(timeout);
          console.log("✅ WebSocket connected");
          setConnectionStatus("Connected");
          wsRef.current = ws;
          resolve(ws);
        };

        ws.onerror = (error) => {
          clearTimeout(timeout);
          console.error("❌ WebSocket error:", error);
          reject(error);
        };
      });

      const ws = await wsPromise;

      ws.onclose = (event) => {
        console.log("WebSocket closed:", event.code, event.reason);
        setConnectionStatus("Disconnected");
        setIsConnected(false);
        
        // Auto-reconnect logic
        if (event.code !== 1000 && attempt < maxAttempts) {
          setTimeout(() => {
            initializeWebRTC(attempt + 1);
          }, 2000 * attempt);
        }
      };

      ws.onmessage = async (event) => {
        try {
          const message = JSON.parse(event.data);

          switch (message.type) {
            case "call-answer":
              await pcRef.current.setRemoteDescription(
                new RTCSessionDescription(message.answer)
              );
              setIsConnected(true);
              setConnectionStatus("Call connected");
              monitorConnectionQuality();
              break;

            case "ice-candidate":
              if (message.candidate) {
                await pcRef.current.addIceCandidate(
                  new RTCIceCandidate(message.candidate)
                );
              }
              break;

            case "call-ended":
            case "peer-disconnected":
              console.log("📞 Remote peer ended the call");
              handleCallEnded();
              break;

            default:
              console.log("Unknown message type:", message.type);
          }
        } catch (error) {
          console.error("Error handling WebSocket message:", error);
        }
      };

      // Enhanced RTCPeerConnection setup
      const iceServers = await fetchIceServers();
      const pc = new RTCPeerConnection({ 
        iceServers,
        iceCandidatePoolSize: 10,
        iceTransportPolicy: 'all'
      });
      
      pcRef.current = pc;

      // Enhanced ICE candidate handling
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          ws.send(JSON.stringify({
            type: "ice-candidate",
            targetId: doctorId,
            senderId: userId,
            candidate: event.candidate,
          }));
        }
      };

      // Connection state monitoring
      pc.onconnectionstatechange = () => {
        console.log("Connection state:", pc.connectionState);
        switch (pc.connectionState) {
          case 'connected':
            setConnectionStatus("Connected");
            setIsConnected(true);
            break;
          case 'disconnected':
            setConnectionStatus("Reconnecting...");
            break;
          case 'failed':
            setConnectionStatus("Connection failed");
            if (attempt < maxAttempts) {
              setTimeout(() => {
                initializeWebRTC(attempt + 1);
              }, 2000);
            } else {
              // If all attempts failed, cleanup and stop camera
              console.log("❌ Connection failed permanently - stopping camera");
              cleanup();
            }
            break;
          case 'closed':
            console.log("🔌 Connection closed - stopping camera");
            cleanup();
            break;
        }
      };

      // Enhanced remote stream handling
      pc.ontrack = (event) => {
        console.log("✅ Remote stream received!", event.streams[0]);
        const remoteStream = event.streams[0];
        
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
        
        setRemoteStream(remoteStream);
        setIsConnected(true);
        setConnectionStatus("Call connected");
        
      };

      // Get local media stream with fallback
      const stream = await getMediaStream();
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Add tracks to peer connection
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Create and send offer
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
      await pc.setLocalDescription(offer);
      console.log("📤 Sending SDP offer");
      await sendOffer(offer);

    } catch (error) {
      console.error(`❌ WebRTC initialization failed (attempt ${attempt}):`, error);
      
      if (attempt < maxAttempts) {
        setConnectionStatus(`Retrying... (${attempt}/${maxAttempts})`);
        setTimeout(() => {
          initializeWebRTC(attempt + 1);
        }, 2000 * attempt);
      } else {
        setConnectionStatus("Connection failed");
        toast.error("Failed to establish connection after multiple attempts", {
          position: 'bottom-center'
        });
      }
    }
  };

  // Enhanced offer sending with retry logic
  const sendOffer = async (offer) => {
    const message = {
      type: "call-initiate",
      offer,
      senderId: userId,
      targetId: doctorId,
    };

    const sendWithRetry = async (attempt = 0) => {
      const maxRetries = 5;
      
      try {
        if (wsRef.current?.readyState !== WebSocket.OPEN) {
          throw new Error("WebSocket not open");
        }
        
        wsRef.current.send(JSON.stringify(message));
        console.log("✅ Offer sent successfully");
      } catch (err) {
        console.warn(`Failed to send offer (attempt ${attempt + 1}):`, err);
        
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000); // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
          return sendWithRetry(attempt + 1);
        }
        
        console.error("❌ Failed to send offer after all attempts");
        throw new Error("Failed to send offer after multiple attempts");
      }
    };

    await sendWithRetry();
  };

const cleanup = async () => {
  console.log("🧹 Starting cleanup process...");

  // Stop connection monitoring
  if (connectionStatsRef.current) {
    clearInterval(connectionStatsRef.current);
    connectionStatsRef.current = null;
  }

  // Stop animation
  if (fallbackAnimationRef.current) {
    cancelAnimationFrame(fallbackAnimationRef.current);
    fallbackAnimationRef.current = null;
  }

  // Clean up canvas
  if (fallbackCanvasRef.current) {
    fallbackCanvasRef.current.remove();
    fallbackCanvasRef.current = null;
  }

  // Stop ALL tracks from local stream
  if (localStream) {
    console.log("📷 Stopping camera and microphone...");
    localStream.getTracks().forEach((track) => {
      console.log(`Stopping ${track.kind} track:`, track.label);
      track.stop(); // This is synchronous
    });
    
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  }

  // Stop remote stream tracks
  if (remoteStream) {
    console.log("🎥 Stopping remote stream...");
    remoteStream.getTracks().forEach((track) => {
      track.stop();
    });
    
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  }

  // Close peer connection
  if (pcRef.current) {
    console.log("🔌 Closing peer connection...");
    pcRef.current.close();
    pcRef.current = null;
  }

  // Close WebSocket with small delay to ensure messages are sent
  if (wsRef.current) {
    console.log("🌐 Closing WebSocket connection...");
    // Give a small time for any pending messages to send
    await new Promise(resolve => setTimeout(resolve, 100));
    wsRef.current.close();
    wsRef.current = null;
  }

  // Reset all states
  setIsConnected(false);
  setUsingFallback(false);
  setConnectionStatus("Disconnected");
  setIsMuted(false);
  setIsVideoOff(false);
  setConnectionQuality("good");
  attempt =3
  console.log("✅ Cleanup completed");
};

  // Handle call ended
  const handleCallEnded = () => {
    console.log("📞 Call ended - initiating cleanup");
    cleanup();
    toast.info("Call ended", { position: 'bottom-center' });
    
    // Optional: Navigate back to previous page or dashboard
    // navigate(-1); // if using react-router navigate
  };

  // Handle component unmount or page close
  const handleBeforeUnload = (event) => {
    console.log("🚪 Page closing - stopping camera");
    cleanup();
  };

  // Handle browser tab visibility change
  const handleVisibilityChange = () => {
    if (document.hidden) {
      console.log("👁️ Tab hidden - pausing video");
      // Optionally pause video when tab is hidden
      if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = false;
        }
      }
    } else {
      console.log("👁️ Tab visible - resuming video");
      // Resume video when tab is visible again
      if (localStream && !isVideoOff) {
        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = true;
        }
      }
    }
  };

  // Enhanced control functions
  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        
        // Send mute status to remote peer
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: "audio-toggle",
            targetId: doctorId,
            senderId: userId,
            muted: !audioTrack.enabled
          }));
        }
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
        
        // Send video status to remote peer
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: "video-toggle",
            targetId: doctorId,
            senderId: userId,
            videoOff: !videoTrack.enabled
          }));
        }
      }
    }
  };

 const endCall = async () => {
  setIsConnected(false);
  console.log("📞 User ended the call");

  // Notify remote peer first
  if (wsRef.current?.readyState === WebSocket.OPEN) {
    try {
      wsRef.current.send(JSON.stringify({
        type: "call-end",
        targetId: doctorId,
        senderId: userId
      }));
      // Small delay to ensure message is sent
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (err) {
      console.error("Error sending call-end message:", err);
    }
  }

  // Perform cleanup
  await cleanup();

  // Navigate after cleanup is complete
  navigate('/user_feedback_page');
};


  // Connection quality indicator
  const getConnectionIcon = () => {
    switch (connectionQuality) {
      case 'good':
        return <Wifi className="text-green-400" size={16} />;
      case 'fair':
        return <Wifi className="text-yellow-400" size={16} />;
      case 'poor':
        return <WifiOff className="text-red-400" size={16} />;
      default:
        return <Wifi className="text-gray-400" size={16} />;
    }
  };

 useEffect(() => {
  let isMounted = true;
  
  const initialize = async () => {
    if (isMounted) {
      await initializeWebRTC();
    }
  };
  
  initialize();

  // Add event listeners
  window.addEventListener('beforeunload', handleBeforeUnload);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    console.log("🧹 Component unmounting - cleaning up");
    isMounted = false;
    
    // Remove event listeners
    window.removeEventListener('beforeunload', handleBeforeUnload);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    
    // Perform cleanup
    cleanup().catch(err => {
      console.error("Cleanup error:", err);
    });
  };
}, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between p-6 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center space-x-4">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`}></div>
          <h1 className="text-white text-xl font-semibold">
            Video Consultation
          </h1>
          <span
            className={`text-sm px-3 py-1 rounded-full flex items-center space-x-2 ${
              isConnected
                ? "bg-emerald-500/20 text-emerald-300"
                : "bg-amber-500/20 text-amber-300"
            }`}
          >
            <span>{connectionStatus}</span>
            {isConnected && getConnectionIcon()}
          </span>
          {retryCount > 0 && (
            <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-300">
              Retry #{retryCount}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3">
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
            playsInline
            className="w-full h-full object-cover"
            poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='100%25' height='100%25' fill='%23334155'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='20' fill='%23cbd5e1' text-anchor='middle' dy='.3em'%3EWaiting for remote video...%3C/text%3E%3C/svg%3E"
          />
          {!remoteStream && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4 mx-auto animate-pulse">
                  <Video size={40} className="text-white" />
                </div>
                <p className="text-white/70 text-lg">
                  Waiting for doctor to join...
                </p>
                {retryCount > 0 && (
                  <p className="text-white/50 text-sm mt-2">
                    Connection attempt #{retryCount + 1}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Remote Video Overlay */}
          <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2">
            <p className="text-white text-sm font-medium">Dr. Smith</p>
          </div>
        </div>

        {/* Enhanced Local Video (Picture-in-Picture) */}
        <div className="absolute bottom-6 right-6 w-64 h-48 rounded-xl overflow-hidden bg-slate-800 border-2 border-white/20 shadow-2xl group hover:scale-105 transition-transform duration-200">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
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
            <div className="flex items-center space-x-1">
              <p className="text-white text-xs">You</p>
              {usingFallback && (
                <span className="text-yellow-300 text-xs bg-yellow-500/20 px-1 rounded">
                  Fallback
                </span>
              )}
            </div>
          </div>

          {/* Local video controls overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
              <Monitor size={16} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Control Bar */}
      <div className="p-6 bg-black/30 backdrop-blur-sm border-t border-white/10">
        <div className="flex items-center justify-center space-x-4">
          {/* Mute Button */}
          <button
            onClick={toggleMute}
            className={`p-4 rounded-2xl transition-all duration-200 transform hover:scale-105 ${
              isMuted
                ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>

          {/* Video Button */}
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-2xl transition-all duration-200 transform hover:scale-105 ${
              isVideoOff
                ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
            title={isVideoOff ? "Turn on video" : "Turn off video"}
          >
            {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
          </button>

          {/* End Call Button */}
          <button
            onClick={endCall}
            className="p-4 rounded-2xl bg-red-500 hover:bg-red-600 text-white transition-all duration-200 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transform hover:scale-105"
            title="End call"
          >
            <PhoneOff size={24} />
          </button>

          {/* Screen Share Button */}
          <button 
            className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all duration-200 transform hover:scale-105"
            title="Share screen"
          >
            <Monitor size={24} />
          </button>

          {/* More Options */}
          <button 
            className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all duration-200 transform hover:scale-105"
            title="Settings"
          >
            <Settings size={24} />
          </button>
        </div>

        {/* Connection Quality Indicator */}
        {isConnected && (
          <div className="mt-4 flex justify-center">
            <div className="flex items-center space-x-2 text-sm text-white/60">
              {getConnectionIcon()}
              <span>Connection: {connectionQuality}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserVideoCallPage;