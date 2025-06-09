import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  MessageSquare, 
  Settings, 
  Send,
  X,
  Maximize,
  Minimize,
  Clock,
} from 'lucide-react';
import { useWebRTC } from '../../utils/useWebrtc';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { createSocket } from '../../utils/createSocket';
import { useWebRTCDoctor } from '../../utils/useWebRTCDoctor';
const DoctorVideoCallPage = () => {
  const userId = useSelector((state)=>state.userDetails.id)
  const socket = useMemo(()=>createSocket(userId),[userId])

  const location = useLocation();
  const { remoteUserId, isCaller } = location.state || {};

  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isCallActive, setIsCallActive] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'Dr. Sarah Johnson',
      message: 'Hello! How are you feeling today?',
      time: '10:30 AM',
      isDoctor: true
    }
  ]);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const doctor = {
    name: 'Dr. Sarah Johnson',
    specialization: 'Cardiologist',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face'
  };

  const {
    localStream,
    remoteStream,
    connectionState,
    error
  } = useWebRTCDoctor({ socket});

  useEffect(() => {
    let interval;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [localStream, remoteStream]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    localStream?.getVideoTracks().forEach(track => (track.enabled = !track.enabled));
  };

  const toggleAudio = () => {
    setIsAudioOn(!isAudioOn);
    localStream?.getAudioTracks().forEach(track => (track.enabled = !track.enabled));
  };

  const endCall = () => {
    setIsCallActive(false);
    localStream?.getTracks().forEach(track => track.stop());
    alert('Call ended. Redirecting to summary...');
  };

  const sendMessage = () => {
    if (chatMessage.trim()) {
      const newMessage = {
        id: chatMessages.length + 1,
        sender: 'You',
        message: chatMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isDoctor: false
      };
      setChatMessages([...chatMessages, newMessage]);
      setChatMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className={`h-screen bg-gray-900 text-white flex flex-col ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <img 
              src={doctor.image} 
              alt={doctor.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h2 className="font-semibold">{doctor.name}</h2>
              <p className="text-sm text-gray-400">{doctor.specialization}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Connected</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-300">
            <Clock className="w-4 h-4" />
            <span className="font-mono">{formatTime(callDuration)}</span>
          </div>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full gap-1">
          {/* Doctor's Video */}
          <div className="relative bg-gray-800 flex items-center justify-center">
            <div 
              ref={remoteVideoRef}
              className="w-full h-full flex items-center justify-center rounded-lg"
            >
              <div className="text-center">
                <img 
                  src={doctor.image} 
                  alt={doctor.name}
                  className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-white/20"
                />
                <p className="text-xl font-semibold">{doctor.name}</p>
                <p className="text-gray-400">Video is on</p>
              </div>
            </div>
          </div>

          {/* Your Video */}
          <div className="relative bg-gray-700 flex items-center justify-center">
            <div 
              ref={localVideoRef}
              className="w-full h-full flex items-center justify-center rounded-lg"
            >
              {isVideoOn ? (
                <div className="text-center">
                  <div className="w-32 h-32 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-4xl font-bold">You</span>
                  </div>
                  <p className="text-xl font-semibold">Your Video</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-32 h-32 bg-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <VideoOff className="w-16 h-16 text-gray-400" />
                  </div>
                  <p className="text-xl font-semibold">Camera Off</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="bg-gray-800/90 backdrop-blur-md rounded-2xl px-6 py-4 flex items-center gap-4">
            <button
              onClick={toggleAudio}
              className={`p-4 rounded-full transition-all ${
                isAudioOn 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {isAudioOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </button>

            <button
              onClick={toggleVideo}
              className={`p-4 rounded-full transition-all ${
                isVideoOn 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </button>

            <button
              onClick={() => setShowChat(!showChat)}
              className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-all relative"
            >
              <MessageSquare className="w-6 h-6" />
              {chatMessages.length > 1 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-xs">
                  {chatMessages.length - 1}
                </div>
              )}
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-all"
            >
              <Settings className="w-6 h-6" />
            </button>

            <button
              onClick={endCall}
              className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Panel */}
      {showChat && (
        <div className="fixed right-0 top-0 h-full w-80 bg-gray-800 border-l border-gray-700 flex flex-col z-40">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold">Chat</h3>
            <button
              onClick={() => setShowChat(false)}
              className="p-1 hover:bg-gray-700 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isDoctor ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-xs p-3 rounded-lg ${
                  msg.isDoctor 
                    ? 'bg-gray-700 text-white' 
                    : 'bg-blue-600 text-white'
                }`}>
                  <p className="text-sm font-medium mb-1">{msg.sender}</p>
                  <p className="text-sm">{msg.message}</p>
                  <p className="text-xs text-gray-300 mt-1">{msg.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={sendMessage}
                className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-96 max-w-[90vw]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 hover:bg-gray-700 rounded"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Camera</label>
                <select className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Default Camera</option>
                  <option>External Camera</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Microphone</label>
                <select className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Default Microphone</option>
                  <option>External Microphone</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Speaker</label>
                <select className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Default Speaker</option>
                  <option>Headphones</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Background Blur</span>
                <button className="w-12 h-6 bg-blue-600 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorVideoCallPage;