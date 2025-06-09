import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

export function useWebRTC({ socket, remoteUserId, isCaller }) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [connectionState, setConnectionState] = useState("disconnected");
  const [error, setError] = useState(null);
  const peerRef = useRef(null);
  console.log('✅ useWebRTC HOOK CALLED');

useEffect(() => {
  console.log('✅ useEffect inside useWebRTC triggered');
}, []);

  const socketRef = useRef(socket);
    useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  useEffect(() => {
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        // Add TURN server if needed here
      ],
    });

    peerRef.current = peer;
    setConnectionState("connecting");

    const handleIceCandidate = (event) => {
      if (event.candidate) {
          console.log("Sending offer to:", event.candidate); // 👈 ADD THIS

        socketRef.current?.send(
          JSON.stringify({
            from: socketRef.current.userId,
            to: remoteUserId,
            type: "ice-candidate",
            payload: event.candidate,
          })
        );
      }
    };

    const handleTrack = (event) => {
      setRemoteStream(event.streams[0]);
      setConnectionState("connected");
    };

    peer.onicecandidate = handleIceCandidate;
    peer.ontrack = handleTrack;

    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        stream.getTracks().forEach((track) => peer.addTrack(track, stream));
        setLocalStream(stream);

        if (isCaller) {
          const offer = await peer.createOffer();
          await peer.setLocalDescription(offer);
          console.log("Sending offer to:", remoteUserId, offer); // 👈 ADD THIS
          socketRef.current?.send(
            JSON.stringify({
              from: socketRef.current.userId,
              to: remoteUserId,
              type: "offer",
              payload: offer,
            })
          );
        }
      } catch (err) {
        setError(err);
        setConnectionState("failed");
        toast.error("Media device not found", { position: "bottom-center" });
      }
    };

    init();

    return () => {
      peer.removeEventListener("icecandidate", handleIceCandidate);
      peer.removeEventListener("track", handleTrack);
      peer.close();
      localStream?.getTracks().forEach((t) => t.stop());
    };
  }, [remoteUserId, isCaller]);

  useEffect(() => {
    const handleMessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        const peer = peerRef.current;

        if (!peer || data.to !== socketRef.current?.userId) return;

        switch (data.type) {
          case "offer":
            await peer.setRemoteDescription(data.payload);
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);
            socketRef.current?.send(
              JSON.stringify({
                from: socketRef.current.userId,
                to: data.from,
                type: "answer",
                payload: answer,
              })
            );
            break;

          case "answer":
            await peer.setRemoteDescription(data.payload);
            break;

          case "ice-candidate":
            try {
              await peer.addIceCandidate(new RTCIceCandidate(data.payload));
            } catch (err) {
              console.error("Error adding ICE candidate:", err);
            }
            break;

          default:
            break;
        }
      } catch (err) {
        setError(err);
        console.error("Error handling message:", err);
      }
    };

    socketRef.current?.addEventListener("message", handleMessage);

    return () => {
      socketRef.current?.removeEventListener("message", handleMessage);
    };
  }, []);

  return { localStream, remoteStream, connectionState, error };
}
