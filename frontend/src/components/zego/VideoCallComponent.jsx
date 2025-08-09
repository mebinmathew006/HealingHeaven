import React, { useEffect, useRef, useState } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useVideoCall } from "./VideoCallProvider";
import {
  createVideoSig,
  postRecording,
} from "../../services/consultationService";

export const VideoCallComponent = ({
  userId,
  roomId,
  userRole = "Host",
  enableRecording = true,
  onError,
  className = "w-full h-screen",
}) => {
  const { setIsCallActive, endCall, handleRecordingUpdate } = useVideoCall();
  const zpRef = useRef(null);
  const containerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const [isRecording, setIsRecording] = useState(false);


  const startRecording = async () => {
  try {
    console.log("Starting recording with guaranteed audio capture...");

    // 1. Get the container and video elements
    const container = containerRef.current;
    const videoElements = Array.from(container.querySelectorAll('video'));
    
    if (videoElements.length === 0) {
      throw new Error("No video elements found in Zego container");
    }

    // 2. Create audio context and destination
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const audioDestination = audioContext.createMediaStreamDestination();

    // 3. Process each video element to capture audio
    const audioElements = [];
    for (const video of videoElements) {
      try {
        // Create audio element for each video
        const audioElement = document.createElement('audio');
        audioElement.srcObject = video.srcObject;
        audioElement.muted = false;
        audioElement.autoplay = true;
        audioElement.setAttribute('playsinline', '');
        document.body.appendChild(audioElement);

        // Connect to audio mixer
        const audioSource = audioContext.createMediaElementSource(audioElement);
        audioSource.connect(audioDestination);
        audioSource.connect(audioContext.destination); // Optional: monitor audio
        
        audioElements.push({ audioElement, audioSource });

        // Important: Resume audio context if suspended
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }

        // Play the audio element
        await audioElement.play().catch(e => 
          console.warn("Audio play warning:", e)
        );
      } catch (e) {
        console.error("Error setting up audio element:", e);
      }
    }

    // 4. Set up canvas for video capture
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    const videoStream = canvas.captureStream(25);

    // 5. Combine video and audio streams
    // Create the combined stream
    const combinedStream = new MediaStream([
      ...videoStream.getVideoTracks(),
      ...audioDestination.stream.getAudioTracks()
    ]);

    // System audio fallback setup
    let systemAudioFallback = null;
    const setupSystemAudioFallback = async () => {
      try {
        console.log("Attempting to get system audio...");
        systemAudioFallback = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
          }
        });
        
        systemAudioFallback.getAudioTracks().forEach(track => {
          console.log("Adding system audio track to stream");
          combinedStream.addTrack(track);
        });
      } catch (error) {
        console.error("System audio fallback failed:", error);
      }
    };

    // Start the fallback timer
    const fallbackTimer = setTimeout(async () => {
      if (combinedStream.getAudioTracks().length === 0) {
        console.warn("No audio detected after 3 seconds - activating fallback");
        await setupSystemAudioFallback();
        
        // Double check after fallback
        if (combinedStream.getAudioTracks().length === 0) {
          console.error("No audio tracks available even after fallback");
          onError?.(new Error("Could not capture any audio"));
        }
      }
    }, 3000);

    // MediaRecorder setup (as before)
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
      ? 'video/webm;codecs=vp9,opus'
      : 'video/webm';

    mediaRecorderRef.current = new MediaRecorder(combinedStream, {
      mimeType,
      audioBitsPerSecond: 128000,
      videoBitsPerSecond: 2500000
    });

  

    mediaRecorderRef.current = new MediaRecorder(combinedStream, {
      mimeType,
      audioBitsPerSecond: 128000,
      videoBitsPerSecond: 2500000
    });

    recordedChunksRef.current = [];

    // 7. Drawing loop for video
    let isDrawing = true;
    const drawFrame = () => {
      if (!isDrawing) return;
      
      try {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const gridSize = Math.ceil(Math.sqrt(videoElements.length));
        const cellWidth = canvas.width / gridSize;
        const cellHeight = canvas.height / gridSize;
        
        videoElements.forEach((video, i) => {
          try {
            if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
              ctx.drawImage(
                video,
                (i % gridSize) * cellWidth,
                Math.floor(i / gridSize) * cellHeight,
                cellWidth,
                cellHeight
              );
            }
          } catch (e) {
            console.warn(`Error drawing video ${i}:`, e);
          }
        });
        
        requestAnimationFrame(drawFrame);
      } catch (error) {
        console.error("Drawing error:", error);
      }
    };

    // 8. Start recording
    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
        console.log(`Chunk received: ${event.data.size} bytes`);
      }
    };
    
    mediaRecorderRef.current.start(1000);
    drawFrame();
    setIsRecording(true);
    console.log("Recording started with audio capture");

    // 9. Audio monitoring (temporary - remove in production)
    const audioMonitor = new Audio();
    audioMonitor.srcObject = audioDestination.stream;
    audioMonitor.play().then(() => 
      console.log("Audio monitor active")
    ).catch(e => 
      console.warn("Audio monitor failed:", e)
    );

    // 10. Cleanup function
    return () => {
       clearTimeout(fallbackTimer);
      if (systemAudioFallback) {
        systemAudioFallback.getTracks().forEach(track => track.stop());
      }
      isDrawing = false;
      audioMonitor.pause();
      audioContext.close();
      audioElements.forEach(({ audioElement, audioSource }) => {
        audioSource.disconnect();
        audioElement.pause();
        audioElement.srcObject = null;
        audioElement.remove();
      });
    };

  } catch (error) {
    console.error("Recording initialization failed:", error);
    onError?.(error);
  }
};

  // Enhanced stop function
  const stopRecording = async () => {
    if (!mediaRecorderRef.current) return;

    console.log("Stopping recording...");

    // 1. Stop the media recorder
    if (mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }

    // 2. Wait for final data
    await new Promise((resolve) => {
      const timeout = setTimeout(resolve, 2000);
      mediaRecorderRef.current.onstop = () => {
        clearTimeout(timeout);
        resolve();
      };
    });

    // 3. Process recorded data
    if (recordedChunksRef.current.length > 0) {
      const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
      console.log(`Final recording: ${blob.size} bytes`);
      await uploadRecording(blob, true);
    } else {
      console.error("No data recorded - saving blank video");
      await uploadRecording(new Blob([], { type: "video/webm" }), true);
    }

    setIsRecording(false);
  };

  const uploadRecording = async (blob, isFinal) => {
    try {
      // Validate the blob first
      if (!blob || blob.size === 0) {
        throw new Error("Recording blob is empty or invalid");
      }

      console.log(
        `Uploading ${isFinal ? "FINAL" : "partial"} recording (size: ${
          blob.size
        } bytes)`
      );

      const formData = new FormData();

      // Create a new File object from the blob with proper filename
      const filename = `recording_${roomId}_${Date.now()}.webm`;
      const recordingFile = new File([blob], filename, { type: "video/webm" });

      formData.append("file", recordingFile);
      formData.append("roomId", roomId);
      formData.append("userId", userId);
      formData.append("isFinal", isFinal.toString());

      // Debug: Log FormData contents
      console.log("FormData contents:");
      for (const [key, value] of formData.entries()) {
        console.log(
          key,
          value instanceof Blob ? `${value.name} (${value.size} bytes)` : value
        );
      }

      const response = await postRecording(formData);

      console.log("Upload successful:", response.data);
      return response.data;
    } catch (error) {
      console.error("Upload failed:", error);
      if (error.response) {
        console.error("Server response:", error.response.data);
      }
      throw error;
    }
  };

  useEffect(() => {
    const joinRoom = async () => {
      try {
        const response = await createVideoSig(roomId, userId);
        if (!response?.data?.token) {
          throw new Error("Invalid token response");
        }

        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
          response.data.app_id || YOUR_ZEGO_APP_ID,
          response.data.token,
          roomId,
          userId,
          userId
        );

        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zpRef.current = zp;

        const joinConfig = {
          container: containerRef.current,
          scenario: {
            mode: ZegoUIKitPrebuilt.VideoConference,
            config: {
              role: userRole,
            },
          },
          onJoinRoom: () => {
            console.log(`${userId} joined room ${roomId}`);
            setIsCallActive(true);

            if (userRole === "Host" && enableRecording) {
              // Wait for videos to render
              setTimeout(() => {
                startRecording();
              }, 3000);
            }
          },
          onLeaveRoom: () => {
            stopRecording();
            endCall();
          },
          // ... other event handlers ...
        };

        await zp.joinRoom(joinConfig);
      } catch (error) {
        console.error("Failed to join room:", error);
        onError?.(error);
      }
    };

    if (userId && roomId) {
      joinRoom();
    }

    return () => {
      stopRecording();
      if (zpRef.current) {
        zpRef.current.destroy();
      }
    };
  }, [roomId, userId]);

  return <div ref={containerRef} className={className} />;
};
