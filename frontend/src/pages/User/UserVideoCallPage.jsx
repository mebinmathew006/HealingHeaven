import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Monitor, Settings, MessageCircle } from 'lucide-react';
import axiosInstance from '../../axiosconfig';

function UserVideoCallPage() {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  
  const userId = useSelector((state) => state.userDetails.id);
  const location = useLocation();
  const doctorId = location?.state?.doctorId;
  const wsRef = useRef(null);
  const pcRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);


  const signalingURL = `ws://localhost/consultations/ws/create_signaling/${userId}`;
  const type = 'development';


const fetchIceServers = async () => {
  try {
    const res = await axiosInstance.get('/consultations/turn-credentials');
    return res.data.iceServers; // Make sure the backend responds with this structure
  } catch (error) {
    console.error('Failed to fetch ICE servers:', error);
    return [
      { urls: 'stun:stun.l.google.com:19302' } // fallback to public STUN
    ];
  }
};

  useEffect(() => {


    initializeWebRTC();

    return () => {
      if (pcRef.current) pcRef.current.close();
      if (wsRef.current) wsRef.current.close();
      if (localStream) localStream.getTracks().forEach(track => track.stop());
    };
  }, []);

  const initializeWebRTC = async () => {
    setConnectionStatus('Connecting...');
    
    wsRef.current = new WebSocket(signalingURL);

    await new Promise((resolve) => {
      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setConnectionStatus('Connected');
        resolve();
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('Connection failed');
      };
    });

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('Connection error');
    };

    wsRef.current.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      setConnectionStatus('Disconnected');
      setIsConnected(false);
    };

    wsRef.current.onmessage = async (event) => {
      const message = JSON.parse(event.data);

      if (message.type === 'call-answer') {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(message.answer));
        setIsConnected(true);
        setConnectionStatus('Call connected');
      }

      if (message.type === 'ice-candidate') {
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(message.candidate));
        } catch (err) {
          console.error('Error adding remote ICE candidate', err);
        }
      }
    };
  const iceServers = await fetchIceServers();
  // pcRef.current = new RTCPeerConnection({ iceServers });
  const pc = new RTCPeerConnection({ iceServers });
  //   const pc = new RTCPeerConnection({
  //     iceServers:  [
  //   {
  //     urls: 'stun:stun.l.google.com:19302' 
  //   },
  //   {
  //     urls: 'turn:global.turn.twilio.com:3478?transport=udp',
  //     username: 'YOUR_USERNAME',
  //     credential: 'YOUR_CREDENTIAL'
  //   }
  // ]
  //   });
    pcRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        wsRef.current.send(JSON.stringify({
          type: 'ice-candidate',
          targetId: doctorId,
          senderId: userId,
          candidate: event.candidate
        }));
      }
    };

    pc.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
      setRemoteStream(event.streams[0]);
    };

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch (err) {
      console.warn('Camera unavailable, using default video');
      stream = await createVideoStream('/default.mp4');
    }

    setLocalStream(stream);
    localVideoRef.current.srcObject = stream;

    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    console.log("Sending SDP offer", offer);
    sendOffer(offer);
  };

  const sendOffer = async (offer) => {
    const message = {
      type: 'call-initiate',
      offer,
      senderId: userId,
      targetId: doctorId
    };

    const sendWithRetry = async (attempt = 0) => {
      try {
        if (wsRef.current.readyState !== WebSocket.OPEN) {
          throw new Error('WebSocket not open');
        }
        wsRef.current.send(JSON.stringify(message));
      } catch (err) {
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
          return sendWithRetry(attempt + 1);
        }
        console.error('Failed to send offer after 3 attempts', err);
      }
    };

    await sendWithRetry();
  };

  const createVideoStream = async (videoSrc) => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.src = videoSrc;
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;

      video.addEventListener('loadeddata', () => {
        const stream = video.captureStream();
        resolve(stream);
      });

      video.style.display = 'none';
      document.body.appendChild(video);
      video.play();
    });
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
    if (pcRef.current) pcRef.current.close();
    if (wsRef.current) wsRef.current.close();
    if (localStream) localStream.getTracks().forEach(track => track.stop());
    setConnectionStatus('Call ended');
    setIsConnected(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center space-x-4">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
          <h1 className="text-white text-xl font-semibold">Video Consultation</h1>
          <span className={`text-sm px-3 py-1 rounded-full ${
            isConnected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
          }`}>
            {connectionStatus}
          </span>
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
            className="w-full h-full object-cover"
            poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='100%25' height='100%25' fill='%23334155'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='20' fill='%23cbd5e1' text-anchor='middle' dy='.3em'%3EWaiting for remote video...%3C/text%3E%3C/svg%3E"
          />
          {!remoteStream && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4 mx-auto">
                  <Video size={40} className="text-white" />
                </div>
                <p className="text-white/70 text-lg">Waiting for doctor to join...</p>
              </div>
            </div>
          )}
          
          {/* Remote Video Overlay */}
          <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2">
            <p className="text-white text-sm font-medium">Dr. Smith</p>
          </div>
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
            <p className="text-white text-xs">You</p>
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
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25' 
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>

          {/* Video Button */}
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-2xl transition-all duration-200 ${
              isVideoOff 
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25' 
                : 'bg-white/10 hover:bg-white/20 text-white'
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

export default UserVideoCallPage;