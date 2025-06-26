import React from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Monitor,
  Settings,
  Mic2Icon,
  Circle,
  StopCircle,
} from "lucide-react";

function VideoCallControls({
  toggleMute,
  toggleVideo,
  endCall,
  isMuted,
  isVideoOff,
  userType,
  callRecord,
  isRecordingtoggle,
}) {
  const { startRecording, stopRecording, isRecording } = callRecord();

  return (
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

        {/* Record video Options */}
        {userType == "patient" ? (
          <button
            onClick={isRecordingtoggle ? '' : startRecording}
            className={`p-4 rounded-2xl transition-all duration-200 ${
              isRecordingtoggle
                ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            {!isRecordingtoggle && (
              <>
                <Circle size={24} />
              </>
            )}
          </button>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}

export default VideoCallControls;
