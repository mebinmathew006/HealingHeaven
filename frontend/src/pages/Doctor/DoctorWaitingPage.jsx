import React, { useState, useEffect, useMemo } from 'react';
import { Video, Users, Clock, Wifi, WifiOff, Phone } from 'lucide-react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { createSocket } from '../../utils/createSocket';
import { useWebRTCDoctor } from '../../utils/useWebRTCDoctor';

export default function DoctorWaitingPage() {
  const [sessionCount, setSessionCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [onlineTime, setOnlineTime] = useState('00:00');
    const [activeCall, setActiveCall] = useState(null);
  const [lastActivity, setLastActivity] = useState('--:--');
  const [showNotification, setShowNotification] = useState(false);
  const [startTime] = useState(new Date());
  const userId = useSelector((state) => state.userDetails.id);

const socket = useMemo(() => {
  if (userId) return createSocket(userId);
  return null;
}, [userId]);

const {
  localStream,
  remoteStream,
  connectionState,
  error
} = useWebRTCDoctor({ socket });
useEffect(() => {
  if (connectionState === "connecting") {
    toast.info("Incoming video call...", { position: "bottom-center" });
  }
}, [connectionState]);

  // Update online time every minute
  useEffect(() => {
    
    const interval = setInterval(() => {
      const now = new Date();
      const diff = now - startTime;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setOnlineTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
    }, 60000);

    return () => clearInterval(interval);
  }, [startTime]);

  // Update last activity time
  const updateLastActivity = () => {
    const now = new Date();
    setLastActivity(now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
  };

  // Simulate incoming call
  const simulateCall = () => {
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
      setSessionCount(prev => prev + 1);
      updateLastActivity();
    }, 3000);
  };

  // Toggle online status
  const toggleStatus = () => {
    setIsOnline(!isOnline);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 flex items-center justify-center p-6">
      {/* Notification */}
      {showNotification && (
        <div className="fixed top-6 right-6 bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl backdrop-blur-sm bg-opacity-95 animate-in slide-in-from-right-full duration-300 z-50">
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 animate-bounce" />
            <span className="font-semibold">Incoming video call request...</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="bg-white bg-opacity-95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-lg w-full border border-white border-opacity-20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse">
            <Video className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Dr. Portal</h1>
          <p className="text-gray-600">Professional Video Consultation Platform</p>
        </div>

        {/* Status Section */}
        <div className={`rounded-2xl p-5 mb-8 border-2 transition-all duration-300 ${
          isOnline 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center justify-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`}></div>
            <span className={`font-semibold text-lg ${
              isOnline ? 'text-green-700' : 'text-red-700'
            }`}>
              {isOnline ? 'Available for Consultations' : 'Currently Offline'}
            </span>
          </div>
        </div>

        {/* Video Streams */}
<div className="flex justify-center gap-6 mb-8">
  {/* Local video (doctor's own) */}
  <video
    autoPlay
    muted
    playsInline
    ref={(el) => {
      if (el && localStream) {
        el.srcObject = localStream;
      }
    }}
    className="w-48 h-36 rounded-lg border border-gray-300"
  />

  {/* Remote video (patient's stream) */}
  <video
    autoPlay
    playsInline
    ref={(el) => {
      if (el && remoteStream) {
        el.srcObject = remoteStream;
      }
    }}
    className="w-72 h-48 rounded-lg border border-gray-300"
  />
</div>

        {/* Waiting Animation */}
        {isOnline && (
          <div className="text-center mb-8">
            <p className="text-gray-600 mb-4">Waiting for patient connections</p>
            <div className="flex justify-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
            </div>
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-50 bg-opacity-80 rounded-xl p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Today's Sessions</div>
            <div className="text-xl font-bold text-gray-800">{sessionCount}</div>
          </div>
          <div className="bg-gray-50 bg-opacity-80 rounded-xl p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Queue Status</div>
            <div className="text-xl font-bold text-gray-800">{sessionCount > 0 ? 'Active' : 'Empty'}</div>
          </div>
          <div className="bg-gray-50 bg-opacity-80 rounded-xl p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Last Activity</div>
            <div className="text-xl font-bold text-gray-800">{lastActivity}</div>
          </div>
          <div className="bg-gray-50 bg-opacity-80 rounded-xl p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Online Since</div>
            <div className="text-xl font-bold text-gray-800">{onlineTime}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={simulateCall}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 flex items-center gap-2"
          >
            <Video className="w-4 h-4" />
            Test Connection
          </button>
          <button
            onClick={toggleStatus}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
              isOnline
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                : 'bg-green-500 text-white hover:bg-green-600 shadow-lg'
            }`}
          >
            {isOnline ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
            {isOnline ? 'Go Offline' : 'Go Online'}
          </button>
        </div>

        {/* Additional Stats */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Connected Patients: {sessionCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Uptime: {onlineTime}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}