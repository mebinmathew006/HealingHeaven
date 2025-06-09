import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

export function useWebRTCDoctor({ socket }) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [connectionState, setConnectionState] = useState("disconnected");
  const [error, setError] = useState(null);

  const peerRef = useRef(null);
  const socketRef = useRef(socket);
  const remoteUserIdRef = useRef(null);

  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  useEffect(() => {
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        // Optional: add TURN servers here for production
      ],
    });

    peerRef.current = peer;
    setConnectionState("connecting");

    const handleIceCandidate = (event) => {
      if (event.candidate && remoteUserIdRef.current) {
        socketRef.current?.send(
          JSON.stringify({
            to: remoteUserIdRef.current,
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
      } catch (err) {
        setError(err);
        setConnectionState("failed");
        toast.error("Media device not found", { position: "bottom-center" });
      }
    };

    init();

    const handleMessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        const peer = peerRef.current;

        if (!peer) return;

        switch (data.type) {
          case "offer":
            remoteUserIdRef.current = data.from;
            await peer.setRemoteDescription(data.payload);
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);
            socketRef.current?.send(
              JSON.stringify({
                to: remoteUserIdRef.current,
                type: "answer",
                payload: answer,
              })
            );
            break;

          case "answer":
            // unlikely doctor will receive an answer, but added for completeness
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
        console.error("Error handling socket message:", err);
      }
    };

    socketRef.current?.addEventListener("message", handleMessage);

    return () => {
      peer.close();
      localStream?.getTracks().forEach((t) => t.stop());
      socketRef.current?.removeEventListener("message", handleMessage);
    };
  }, []);

  return { localStream, remoteStream, connectionState, error };
}
