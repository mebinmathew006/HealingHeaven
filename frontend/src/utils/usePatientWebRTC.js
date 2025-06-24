// hooks/usePatientWebRTC.js
import { useEffect } from "react";
import { useWebRTC } from "./useWebrtc";

export const usePatientWebRTC = ({ patientId, doctorId, consultationId, onCallEnd }) => {
  const signalingURL = `ws://localhost/consultations/ws/create_signaling/${patientId}`;
  
  const webRTC = useWebRTC({
    userId: patientId,
    userType: 'patient',
    signalingURL,
    onCallEnd
  });

  const {
    wsRef,
    pcRef,
    localVideoRef,
    remoteVideoRef,
    getUserMediaWithFallback,
    startCallDurationTimer,
    setTargetUserId,
    setConsultationId,
    setConnectionStatus,
    setIsConnected,
    setLocalStream,
    setRemoteStream,
  } = webRTC;

  const initializeWebRTC = async () => {
    setConnectionStatus("Connecting...");

    wsRef.current = new WebSocket(signalingURL);

    await new Promise((resolve, reject) => {
      wsRef.current.onopen = () => {
        console.log("[Patient] WebSocket connected");
        resolve();
      };

      wsRef.current.onerror = (error) => {
        console.error("[Patient] WebSocket error:", error);
        setConnectionStatus("Connection failed");
        reject(error);
      };
    });

    wsRef.current.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      console.log("Incoming WebSocket message:", message);

      if (message.type === "call-answer") {
        await handleCallAnswer(message);
      }

      if (message.type === "ice-candidate" && pcRef.current) {
        await handleIceCandidate(message);
      }

      if (message.type === "call-end") {
        handleCallEnd();
      }
    };

    wsRef.current.onclose = (event) => {
      console.log("WebSocket closed:", event.code, event.reason);
      setConnectionStatus("Disconnected");
      setIsConnected(false);
    };

    // Patient initiates the call
    await initiateCall();
  };

  const initiateCall = async () => {
    try {
      setConnectionStatus("Starting call...");
      setTargetUserId(doctorId);
      setConsultationId(consultationId);
//   const fetchIceServers = async () => {
//     try {
//       const res = await axiosInstance.get("/consultations/turn-credentials");
//       return res.data.iceServers;
//     } catch (error) {
//       console.error("Failed to fetch ICE servers:", error);
//       return [
//         { urls: "stun:stun.l.google.com:19302" },
//         { urls: "stun:stun1.l.google.com:19302" },
//       ];
//     }
//   };
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });
      pcRef.current = pc;

      // Get media stream
      const stream = await getUserMediaWithFallback();
      setLocalStream(stream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Add tracks to peer connection
      stream.getTracks().forEach((track) => {
        console.log(`Adding ${track.kind} track to peer connection`);
        pc.addTrack(track, stream);
      });

      pc.ontrack = (event) => {
        console.log("✅ Remote stream received!", event.streams[0]);
        const remoteStream = event.streams[0];

        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }

        setRemoteStream(remoteStream);
        setIsConnected(true);
        setConnectionStatus("Call connected");
        startCallDurationTimer();
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          wsRef.current.send(
            JSON.stringify({
              type: "ice-candidate",
              targetId: doctorId,
              senderId: patientId,
              candidate: event.candidate,
            })
          );
        }
      };

      pc.onconnectionstatechange = () => {
        console.log("Connection state:", pc.connectionState);
        if (pc.connectionState === "failed") {
          setConnectionStatus("Connection failed");
        }
      };

      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      console.log("✅ Created and set local description");

      // Send call initiation
      wsRef.current.send(
        JSON.stringify({
          type: "call-initiate",
          targetId: doctorId,
          senderId: patientId,
          consultation_id: consultationId,
          offer: pc.localDescription,
        })
      );
      console.log("✅ Sent call initiation");
      setConnectionStatus("Waiting for doctor to accept...");
    } catch (error) {
      console.error("Error initiating call:", error);
      setConnectionStatus("Call initiation failed");
    }
  };

  const handleCallAnswer = async (message) => {
    try {
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(message.answer));
      console.log("✅ Set remote description from answer");
    } catch (error) {
      console.error("Error handling call answer:", error);
      setConnectionStatus("Call setup failed");
    }
  };

  const handleIceCandidate = async (message) => {
    try {
      await pcRef.current.addIceCandidate(new RTCIceCandidate(message.candidate));
      console.log("✅ Added ICE candidate");
    } catch (err) {
      console.error("[Patient] Failed to add ICE candidate:", err);
    }
  };

  const handleCallEnd = () => {
    setConnectionStatus("Call ended");
    setIsConnected(false);
    webRTC.endCall();
  };

  useEffect(() => {
    initializeWebRTC();
    return () => {
      webRTC.cleanup();
    };
  }, []);

  return webRTC;
};