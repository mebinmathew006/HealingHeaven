import { useState, useRef, useCallback, useEffect } from 'react';

export const useZegoStreamInterceptor = ({
  onStreamRecorded,
  onRecordingError,
  onChunkReady,
  uploadEndpoint = '/api/upload-stream',
  mimeType = 'video/webm;codecs=vp9',
  videoBitsPerSecond = 2500000,
  audioBitsPerSecond = 128000,
  chunkDuration = 5000, // 5 seconds
  autoUpload = true
} = {}) => {
  const [activeRecordings, setActiveRecordings] = useState(new Map());
  const [isIntercepting, setIsIntercepting] = useState(false);
  const [error, setError] = useState(null);

  const recordersRef = useRef(new Map()); // streamId -> MediaRecorder
  const chunksRef = useRef(new Map()); // streamId -> chunks[]
  const streamsRef = useRef(new Map()); // streamId -> MediaStream

  // Initialize Zego stream interception
  const initializeInterception = useCallback(async (zegoExpressEngine) => {
    try {
      setError(null);
      setIsIntercepting(true);

      // Method 1: Hook into Zego's stream callbacks
      const originalOnRemoteStreamAdd = zegoExpressEngine.onRemoteStreamAdd;
      const originalOnRemoteStreamRemove = zegoExpressEngine.onRemoteStreamRemove;
      const originalOnLocalStreamAdd = zegoExpressEngine.onLocalStreamAdd;

      // Intercept remote streams
      zegoExpressEngine.onRemoteStreamAdd = (roomID, streamList) => {
        console.log('Remote streams added:', streamList);
        
        streamList.forEach(async (stream) => {
          try {
            // Get the actual MediaStream from Zego
            const mediaStream = await zegoExpressEngine.startPlayingStream(stream.streamID, {
              video: true,
              audio: true
            });
            
            if (mediaStream) {
              await startRecordingStream(stream.streamID, mediaStream, 'remote', stream.user);
            }
          } catch (err) {
            console.error('Failed to start recording remote stream:', err);
          }
        });

        // Call original callback
        if (originalOnRemoteStreamAdd) {
          originalOnRemoteStreamAdd(roomID, streamList);
        }
      };

      // Intercept local stream
      zegoExpressEngine.onLocalStreamAdd = (stream) => {
        console.log('Local stream added:', stream);
        
        // Record local stream
        if (stream) {
          startRecordingStream('local', stream, 'local', { userID: 'self' });
        }

        if (originalOnLocalStreamAdd) {
          originalOnLocalStreamAdd(stream);
        }
      };

      // Handle stream removal
      zegoExpressEngine.onRemoteStreamRemove = (roomID, streamList) => {
        streamList.forEach(stream => {
          stopRecordingStream(stream.streamID);
        });

        if (originalOnRemoteStreamRemove) {
          originalOnRemoteStreamRemove(roomID, streamList);
        }
      };

      return true;

    } catch (err) {
      const error = new Error(`Failed to initialize stream interception: ${err.message}`);
      setError(error);
      onRecordingError?.(error);
      return false;
    }
  }, [onRecordingError]);

  // Alternative method: Hook into getUserMedia and getDisplayMedia
  const interceptMediaAPIs = useCallback(() => {
    const originalGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia.bind(navigator.mediaDevices);

    // Intercept getUserMedia (for camera/mic streams)
    navigator.mediaDevices.getUserMedia = async function(constraints) {
      const stream = await originalGetUserMedia(constraints);
      
      // Record this stream if it's likely from Zego
      const streamId = `user-media-${Date.now()}`;
      await startRecordingStream(streamId, stream, 'user-media');
      
      return stream;
    };

    // Intercept getDisplayMedia (for screen sharing)
    navigator.mediaDevices.getDisplayMedia = async function(constraints) {
      const stream = await originalGetDisplayMedia(constraints);
      
      const streamId = `display-media-${Date.now()}`;
      await startRecordingStream(streamId, stream, 'display-media');
      
      return stream;
    };

    return () => {
      // Restore original methods
      navigator.mediaDevices.getUserMedia = originalGetUserMedia;
      navigator.mediaDevices.getDisplayMedia = originalGetDisplayMedia;
    };
  }, []);

  // Start recording a specific stream
  const startRecordingStream = useCallback(async (streamId, mediaStream, streamType, userInfo = {}) => {
    try {
      if (!mediaStream || recordersRef.current.has(streamId)) {
        return; // Already recording this stream
      }

      console.log(`Starting recording for stream: ${streamId} (${streamType})`);

      // Clone the stream to avoid affecting original
      const recordingStream = mediaStream.clone();
      streamsRef.current.set(streamId, recordingStream);

      // Initialize chunks array
      chunksRef.current.set(streamId, []);

      // Create MediaRecorder
      const recorder = new MediaRecorder(recordingStream, {
        mimeType,
        videoBitsPerSecond,
        audioBitsPerSecond
      });

      recordersRef.current.set(streamId, recorder);

      // Handle data availability
      recorder.ondataavailable = async (event) => {
        if (event.data && event.data.size > 0) {
          const chunks = chunksRef.current.get(streamId) || [];
          chunks.push(event.data);
          chunksRef.current.set(streamId, chunks);

          // Create chunk info
          const chunkInfo = {
            streamId,
            streamType,
            userInfo,
            chunkIndex: chunks.length - 1,
            timestamp: Date.now(),
            size: event.data.size,
            blob: event.data
          };

          onChunkReady?.(chunkInfo);

          // Auto-upload if enabled
          if (autoUpload) {
            await uploadChunk(chunkInfo);
          }
        }
      };

      recorder.onstop = () => {
        console.log(`Recording stopped for stream: ${streamId}`);
        
        const chunks = chunksRef.current.get(streamId) || [];
        const finalBlob = new Blob(chunks, { type: mimeType });
        
        const recordingInfo = {
          streamId,
          streamType,
          userInfo,
          blob: finalBlob,
          duration: Date.now() - startTime,
          chunks: chunks.length
        };

        onStreamRecorded?.(recordingInfo);

        // Cleanup
        recordersRef.current.delete(streamId);
        chunksRef.current.delete(streamId);
        streamsRef.current.delete(streamId);
        
        setActiveRecordings(prev => {
          const updated = new Map(prev);
          updated.delete(streamId);
          return updated;
        });
      };

      recorder.onerror = (event) => {
        console.error(`Recording error for stream ${streamId}:`, event.error);
        const error = new Error(`Recording failed for stream ${streamId}: ${event.error}`);
        onRecordingError?.(error);
      };

      // Start recording
      const startTime = Date.now();
      recorder.start(chunkDuration);

      // Update active recordings
      setActiveRecordings(prev => {
        const updated = new Map(prev);
        updated.set(streamId, {
          streamType,
          userInfo,
          startTime,
          status: 'recording'
        });
        return updated;
      });

    } catch (err) {
      console.error(`Failed to start recording stream ${streamId}:`, err);
      onRecordingError?.(new Error(`Failed to record stream: ${err.message}`));
    }
  }, [mimeType, videoBitsPerSecond, audioBitsPerSecond, chunkDuration, onChunkReady, onStreamRecorded, onRecordingError, autoUpload]);

  // Stop recording a specific stream
  const stopRecordingStream = useCallback((streamId) => {
    const recorder = recordersRef.current.get(streamId);
    if (recorder && recorder.state === 'recording') {
      recorder.stop();
    }
  }, []);

  // Upload chunk to server
  const uploadChunk = useCallback(async (chunkInfo) => {
    try {
      const formData = new FormData();
      formData.append('chunk', chunkInfo.blob);
      formData.append('streamId', chunkInfo.streamId);
      formData.append('streamType', chunkInfo.streamType);
      formData.append('chunkIndex', chunkInfo.chunkIndex.toString());
      formData.append('timestamp', chunkInfo.timestamp.toString());
      formData.append('userInfo', JSON.stringify(chunkInfo.userInfo));

      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`Chunk uploaded successfully for stream ${chunkInfo.streamId}:`, result);
      
      return result;

    } catch (error) {
      console.error('Failed to upload chunk:', error);
      // Store failed chunks for retry
      storeFailedChunk(chunkInfo);
      throw error;
    }
  }, [uploadEndpoint]);

  // Store failed chunks for retry
  const storeFailedChunk = useCallback((chunkInfo) => {
    const failedChunks = JSON.parse(localStorage.getItem('failed_chunks') || '[]');
    failedChunks.push({
      ...chunkInfo,
      blob: null, // Can't serialize blob
      failedAt: Date.now()
    });
    localStorage.setItem('failed_chunks', JSON.stringify(failedChunks));
  }, []);

  // Method to hook directly into Zego video elements
  const interceptVideoElements = useCallback(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Look for video elements that might be from Zego
            const videoElements = node.tagName === 'VIDEO' ? [node] : node.querySelectorAll?.('video') || [];
            
            videoElements.forEach(async (video) => {
              if (video.srcObject && video.srcObject instanceof MediaStream) {
                const streamId = `video-element-${Date.now()}-${Math.random()}`;
                await startRecordingStream(streamId, video.srcObject, 'video-element', {
                  videoId: video.id,
                  className: video.className
                });
              }
            });
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, [startRecordingStream]);

  // Stop all recordings
  const stopAllRecordings = useCallback(() => {
    recordersRef.current.forEach((recorder, streamId) => {
      if (recorder.state === 'recording') {
        recorder.stop();
      }
    });
  }, []);

  // Get recording statistics
  const getRecordingStats = useCallback(() => {
    const stats = {
      totalStreams: activeRecordings.size,
      streams: Array.from(activeRecordings.entries()).map(([streamId, info]) => ({
        streamId,
        ...info,
        duration: Date.now() - info.startTime
      }))
    };
    
    return stats;
  }, [activeRecordings]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllRecordings();
      
      // Clean up streams
      streamsRef.current.forEach(stream => {
        stream.getTracks().forEach(track => track.stop());
      });
    };
  }, [stopAllRecordings]);

  return {
    // State
    isIntercepting,
    activeRecordings: Array.from(activeRecordings.entries()),
    recordingCount: activeRecordings.size,
    error,

    // Methods
    initializeInterception,
    interceptMediaAPIs,
    interceptVideoElements,
    startRecordingStream,
    stopRecordingStream,
    stopAllRecordings,
    uploadChunk,
    getRecordingStats,

    // Utilities
    isSupported: typeof MediaRecorder !== 'undefined'
  };
};