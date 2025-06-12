import React, { useEffect, useRef, useState } from "react";

export function useWebRTC({ socket, userId, remoteUserId, isCaller }) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [connectionState, setConnectionState] = useState("disconnected");
  const [error, setError] = useState(null);

  const peerRef = useRef(null);
  const socketRef = useRef(socket);
  const userIdRef = useRef(userId);
  const remoteUserIdRef = useRef(remoteUserId);
  const isCallerRef = useRef(isCaller);

  useEffect(() => {
    socketRef.current = socket;
    userIdRef.current = userId;
    remoteUserIdRef.current = remoteUserId;
    isCallerRef.current = isCaller;
  }, [socket, userId, remoteUserId, isCaller]);

  useEffect(() => {
    if (!socketRef.current || !remoteUserIdRef.current) return;

    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    peerRef.current = peer;
    setConnectionState("connecting");

    peer.onicecandidate = (event) => {
      if (event.candidate && socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          from: userIdRef.current,
          to: remoteUserIdRef.current,
          type: "ice-candidate",
          payload: event.candidate
        }));
      }
    };

    peer.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      setConnectionState("connected");
    };

    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });

        stream.getTracks().forEach(track => peer.addTrack(track, stream));
        setLocalStream(stream);

        if (isCallerRef.current) {
          const offer = await peer.createOffer();
          await peer.setLocalDescription(offer);
          socketRef.current?.send(JSON.stringify({
            from: userIdRef.current,
            to: remoteUserIdRef.current,
            type: "offer",
            payload: offer
          }));
        }
      } catch (err) {
        setError(err);
        setConnectionState("failed");
        toast.error("Media device error");
      }
    };

    init();

    return () => {
      peer.onicecandidate = null;
      peer.ontrack = null;
      peer.close();
      localStream?.getTracks().forEach(track => track.stop());
      setLocalStream(null);
      setRemoteStream(null);
      setConnectionState("disconnected");
    };
  }, [remoteUserId, isCaller]);

  useEffect(() => {
    if (!socketRef.current) return;

    const handleMessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        const peer = peerRef.current;

        if (!peer || data.to !== userIdRef.current) return;

        switch (data.type) {
          case "offer":
            await peer.setRemoteDescription(data.payload);
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);
            socketRef.current.send(JSON.stringify({
              from: userIdRef.current,
              to: data.from,
              type: "answer",
              payload: answer
            }));
            break;
          case "answer":
            await peer.setRemoteDescription(data.payload);
            break;
          case "ice-candidate":
            await peer.addIceCandidate(new RTCIceCandidate(data.payload));
            break;
        }
      } catch (err) {
        console.error("WebRTC message error:", err);
        setError(err);
      }
    };

    socketRef.current.addEventListener("message", handleMessage);
    return () => {
      socketRef.current?.removeEventListener("message", handleMessage);
    };
  }, []);

  return { localStream, remoteStream, connectionState, error };
}




// export function useWebRTC({ socket, remoteUserId, isCaller }) {
//   const [localStream, setLocalStream] = useState(null);
//   const [remoteStream, setRemoteStream] = useState(null);
//   const [connectionState, setConnectionState] = useState("disconnected");
//   const [error, setError] = useState(null);
//   const peerRef = useRef(null);
  
//   // Use refs for stable references
//   const socketRef = useRef(socket);
//   const remoteUserIdRef = useRef(remoteUserId);
//   const isCallerRef = useRef(isCaller);

//   useEffect(() => {
//     socketRef.current = socket;
//     remoteUserIdRef.current = remoteUserId;
//     isCallerRef.current = isCaller;
//   }, [socket, remoteUserId, isCaller]);

//   useEffect(() => {
//     if (!socketRef.current || !remoteUserIdRef.current) return;

//     console.log('Setting up WebRTC connection');
//     const peer = new RTCPeerConnection({
//       iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
//     });

//     peerRef.current = peer;
//     setConnectionState("connecting");


//     const handleIceCandidate = (event) => {
//       if (event.candidate && socketRef.current?.readyState === WebSocket.OPEN) {
//         socketRef.current.send(JSON.stringify({
//           from: userIdRef.current,
//           to: remoteUserId,
//           type: "ice-candidate",
//           payload: event.candidate
//         }));
//       }
//     };

//     const handleTrack = (event) => {
//       setRemoteStream(event.streams[0]);
//       setConnectionState("connected");
//     };

//     peer.onicecandidate = handleIceCandidate;
//     peer.ontrack = handleTrack;

//     const init = async () => {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: true,
//           audio: true
//         });

//         stream.getTracks().forEach(track => peer.addTrack(track, stream));
//         setLocalStream(stream);

//         if (isCaller) {
//           const offer = await peer.createOffer();
//           await peer.setLocalDescription(offer);
//           socketRef.current?.send(JSON.stringify({
//             from: userIdRef.current,
//             to: remoteUserId,
//             type: "offer",
//             payload: offer
//           }));
//         }
//       } catch (err) {
//         setError(err);
//         setConnectionState("failed");
//         toast.error("Media device error");
//       }
//     };

//     init();

//     return () => {
//       console.log('Cleaning up WebRTC connection');
//       peer.onicecandidate = null;
//       peer.ontrack = null;
//       peer.close();
//       localStream?.getTracks().forEach(track => track.stop());
//       setLocalStream(null);
//       setRemoteStream(null);
//       setConnectionState("disconnected");
//     };
//   }, [remoteUserId, isCaller]); // Only these dependencies

//   // Message handler effect
//   useEffect(() => {
//     if (!socketRef.current) return;

//     const handleMessage = async (event) => {
//       try {
//         const data = JSON.parse(event.data);
//         const peer = peerRef.current;

//         if (!peer || data.to !== userIdRef.current) return;

//         switch (data.type) {
//           case "offer":
//             await peer.setRemoteDescription(data.payload);
//             const answer = await peer.createAnswer();
//             await peer.setLocalDescription(answer);
//             socketRef.current.send(JSON.stringify({
//               from: userIdRef.current,
//               to: data.from,
//               type: "answer",
//               payload: answer
//             }));
//             break;
//           case "answer":
//             await peer.setRemoteDescription(data.payload);
//             break;
//           case "ice-candidate":
//             await peer.addIceCandidate(new RTCIceCandidate(data.payload));
//             break;
//         }
//       } catch (err) {
//         console.error("WebRTC message error:", err);
//         setError(err);
//       }
//     };

//     socketRef.current.addEventListener("message", handleMessage);
//     return () => {
//       socketRef.current?.removeEventListener("message", handleMessage);
//     };
//   }, []);

//   return { localStream, remoteStream, connectionState, error };
// }