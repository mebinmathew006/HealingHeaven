import React, { useState, useRef, useEffect } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Circle,
  StopCircle,
  Download,
  Play,
  Pause,
} from "lucide-react";

function VideoCallControls({
  toggleMute = () => {},
  toggleVideo = () => {},
  endCall = () => {},
  isMuted = false,
  isVideoOff = false,
  userType = "patient",
  consultationId = "demo",
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const videoRef = useRef(null);
  const playbackRef = useRef(null);

  // Mock toast function
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  useEffect(() => {
    // Initialize camera stream for demo
    initializeStream();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const initializeStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing media devices:", error);
      showToast("Failed to access camera/microphone");
    }
  };

  const startRecording = async () => {
    try {
      if (!streamRef.current) {
        showToast("No media stream available");
        return;
      }

      const options = {
        mimeType: 'video/webm;codecs=vp8,opus',
        videoBitsPerSecond: 2500000,
        audioBitsPerSecond: 128000
      };

      // Check if the browser supports the preferred format
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm';
      }

      mediaRecorderRef.current = new MediaRecorder(streamRef.current, options);
      const chunks = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        setRecordedChunks(chunks);
        showToast("Recording saved successfully!");
      };

      mediaRecorderRef.current.start(1000); // Collect data every second
      setIsRecording(true);
      showToast("Recording started...");
    } catch (error) {
      console.error("Error starting recording:", error);
      showToast("Failed to start recording");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      showToast("Recording stopped");
    }
  };

  const handleEndCall = () => {
    if (isRecording) {
      stopRecording();
    }
    endCall();
  };

  const handleStopRecording = () => {
    showToast("Sorry you can't stop recording");
  };

  const downloadRecording = () => {
    if (recordedVideoUrl) {
      const a = document.createElement('a');
      a.href = recordedVideoUrl;
      a.download = `video-call-${consultationId}-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast("Recording downloaded!");
    }
  };

  const togglePlayback = () => {
    if (playbackRef.current) {
      if (isPlaying) {
        playbackRef.current.pause();
      } else {
        playbackRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 bg-black/80 text-white px-4 py-2 rounded-lg z-50">
          {toastMessage}
        </div>
      )}

      {/* Video Display Area */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="relative w-full max-w-4xl">
          {/* Live Video Feed */}
          <div className="relative bg-black/50 rounded-2xl overflow-hidden mb-4">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-64 object-cover"
            />
            {isRecording && (
              <div className="absolute top-4 right-4 flex items-center space-x-2 bg-red-500 text-white px-3 py-1 rounded-full">
                <Circle className="w-3 h-3 fill-current animate-pulse" />
                <span className="text-sm font-medium">REC</span>
              </div>
            )}
          </div>

          {/* Recorded Video Playback */}
          {recordedVideoUrl && (
            <div className="bg-black/50 rounded-2xl overflow-hidden">
              <div className="p-4">
                <h3 className="text-white text-lg font-semibold mb-2">Recorded Video</h3>
                <video
                  ref={playbackRef}
                  src={recordedVideoUrl}
                  className="w-full h-48 object-cover rounded-lg"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  controls
                />
                <div className="flex items-center justify-center space-x-4 mt-4">
                  <button
                    onClick={togglePlayback}
                    className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    <span>{isPlaying ? "Pause" : "Play"}</span>
                  </button>
                  <button
                    onClick={downloadRecording}
                    className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Download size={20} />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Call Controls */}
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
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>

          {/* Video Toggle */}
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-2xl transition-all duration-200 ${
              isVideoOff
                ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
            title={isVideoOff ? "Turn on camera" : "Turn off camera"}
          >
            {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
          </button>

          {/* Recording Button */}
          {userType === "patient" && (
            <button
              onClick={isRecording ? handleStopRecording : startRecording}
              className={`p-4 rounded-2xl transition-all duration-200 ${
                isRecording
                  ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25 animate-pulse"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
              title={isRecording ? "Stop recording" : "Start recording"}
            >
              {isRecording ? <StopCircle size={24} /> : <Circle size={24} />}
            </button>
          )}

          {/* End Call */}
          <button
            onClick={handleEndCall}
            className="p-4 rounded-2xl bg-red-500 hover:bg-red-600 text-white transition-all duration-200 shadow-lg shadow-red-500/25 hover:shadow-red-500/40"
            title="End call"
          >
            <PhoneOff size={24} />
          </button>
        </div>

        {/* Recording Status */}
        {isRecording && (
          <div className="mt-4 text-center">
            <p className="text-white/80 text-sm">
              Recording in progress... Click the record button to stop (restricted for patients)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoCallControls;