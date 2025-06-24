import React from "react";
import { Users, VideoOff } from "lucide-react";

function VideoCallMain({
  localStream,
  remoteStream,
  localVideoRef,
  remoteVideoRef,
  isVideoOff,
  isUsingFallbackVideo,
  userType,
}) {
  return (
    <div className="flex-1 relative p-6 z-10">
      {/* Remote Video (Main) */}
      <div className="relative w-full h-full rounded-2xl overflow-hidden bg-slate-800/50 backdrop-blur-sm border border-white/10 shadow-2xl">
        <video
          ref={remoteVideoRef}
          autoPlay
          className="w-full h-full object-cover"
          poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='100%25' height='100%25' fill='%23334155'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='20' fill='%23cbd5e1' text-anchor='middle' dy='.3em'%3EWaiting for connection...%3C/text%3E%3C/svg%3E"
        />
        {!remoteStream && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mb-4 mx-auto animate-pulse">
                <Users size={40} className="text-white" />
              </div>
              <p className="text-white/70 text-lg">
                Waiting for {userType === "doctor" ? "patient" : "doctor"} to join...
              </p>
            </div>
          </div>
        )}

        {/* Remote Video Overlay */}
        {remoteStream && (
          <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2">
            <p className="text-white text-sm font-medium">
              {userType === "doctor" ? "Patient" : "Doctor"}
            </p>
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
            {userType === "doctor" ? "Dr. You" : "You"} {isUsingFallbackVideo && "(Fallback)"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default VideoCallMain;