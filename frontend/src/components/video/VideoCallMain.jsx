import React, { useEffect } from "react";
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
  // Debug effect to monitor stream changes
  useEffect(() => {
    console.log("=== VideoCallMain Debug ===");
    console.log("Local stream:", localStream);
    console.log("Remote stream:", remoteStream);
    console.log("Local video ref:", localVideoRef?.current);
    console.log("Remote video ref:", remoteVideoRef?.current);
    
    if (remoteStream) {
      console.log("Remote stream details:", {
        active: remoteStream.active,
        id: remoteStream.id,
        tracks: remoteStream.getTracks().map(track => ({
          kind: track.kind,
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState
        }))
      });
    }
  }, [localStream, remoteStream]);

  // Effect to handle remote video assignment
  useEffect(() => {
    if (remoteStream && remoteVideoRef?.current) {
      console.log("Setting remote stream to video element");
      const videoElement = remoteVideoRef.current;
      
      // Set the stream
      videoElement.srcObject = remoteStream;
      
      // Add event listeners for debugging
      videoElement.onloadedmetadata = () => {
        console.log("Remote video metadata loaded", {
          videoWidth: videoElement.videoWidth,
          videoHeight: videoElement.videoHeight
        });
      };
      
      videoElement.oncanplay = () => {
        console.log("Remote video can play");
        videoElement.play().catch(e => {
          console.error("Failed to play remote video:", e);
        });
      };
      
      videoElement.onplaying = () => {
        console.log("Remote video is now playing");
      };
      
      videoElement.onerror = (e) => {
        console.error("Remote video error:", e);
      };
      
      // Force play attempt
      videoElement.play().catch(e => {
        console.error("Initial play attempt failed:", e);
      });
    }
  }, [remoteStream, remoteVideoRef]);

  // Effect to handle local video assignment
  useEffect(() => {
    if (localStream && localVideoRef?.current) {
      console.log("Setting local stream to video element");
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(e => {
        console.error("Failed to play local video:", e);
      });
    }
  }, [localStream, localVideoRef]);

  return (
    <div className="flex-1 relative p-6 ms-90 z-10 max-w-200">
      {/* Remote Video (Main) */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-800/50 backdrop-blur-sm border border-white/10 shadow-2xl min-h-[400px]">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
          style={{ 
            minHeight: '400px',
            backgroundColor: '#1e293b' // Fallback background
          }}
          poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='100%25' height='100%25' fill='%23334155'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='20' fill='%23cbd5e1' text-anchor='middle' dy='.3em'%3EWaiting for connection...%3C/text%3E%3C/svg%3E"
        />
        
        {/* Show waiting message when no remote stream */}
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

        {/* Debug info overlay - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute top-2 right-2 bg-black/80 text-white text-xs p-2 rounded max-w-xs">
            <div>Remote Stream: {remoteStream ? '✅' : '❌'}</div>
            {remoteStream && (
              <>
                <div>Active: {remoteStream.active ? '✅' : '❌'}</div>
                <div>Video Tracks: {remoteStream.getVideoTracks().length}</div>
                <div>Audio Tracks: {remoteStream.getAudioTracks().length}</div>
              </>
            )}
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
          playsInline
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

        {/* Debug info for local video - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs p-1 rounded">
            Local: {localStream ? '✅' : '❌'}
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoCallMain;