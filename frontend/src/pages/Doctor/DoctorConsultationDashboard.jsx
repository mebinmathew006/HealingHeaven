import React, { useState, useEffect, useMemo } from "react";
import {
  Video,
  VideoOff,
  Phone,
  PhoneOff,
  MessageCircle,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Mic,
  MicOff,
  Camera,
  CameraOff,
} from "lucide-react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axiosInstance from "../../axiosconfig";
import { createSocket } from "../../utils/createSocket";
import { useWebRTCDoctor } from "../../utils/useWebRTCDoctor";
import { toast } from "react-toastify";

const DoctorConsultationDashboard = () => {

  const [isAvailable, setIsAvailable] = useState(true);
  const [activeCall, setActiveCall] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const userId = useSelector((state) => state.userDetails.id);
  const navigate = useNavigate();
  const remoteUserIdRef=16
 
  const [isModalOpen,setIsModalOpen]=useState(false);
 const handleStartCall = ()=>{
 
 }


const socket = useMemo(() => {
  if (userId) return createSocket(userId);
  return null;
}, [userId]);

const {
  localStream,
  remoteStream,
  connectionState,
  error
} = useWebRTCDoctor({ socket });
  // Mock patient data
  const [patients] = useState();
useEffect(() => {
  if (connectionState === "connecting") {
    toast.info("Incoming video call...", { position: "bottom-center" });
    setActiveCall({ name: "Patient", id: remoteUserIdRef }); // Optional
  }
}, [connectionState]);

  useEffect(() => {
     if (socket) {
    console.log('Socket ready:', socket);
  }
    const initialMessages = {};
    patients.forEach((patient) => {
      initialMessages[patient.id] = [
        {
          id: 1,
          text: patient.lastMessage,
          sender: "patient",
          timestamp: new Date(Date.now() - Math.random() * 3600000),
        },
      ];
    });
    setMessages(initialMessages);
  }, []);

  const toggleAvailability = async () => {
    const result = await Swal.fire({
      title: "Go Unavailable?",
      text: "Patients can not contact you once you're unavailable.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, go unavailable",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "rounded-2xl shadow-2xl backdrop-blur-sm",
        header: "border-b-0 pb-2",
        title: "text-2xl font-bold text-gray-900 mb-2",
        htmlContainer: "text-gray-600 leading-relaxed text-base",
        actions: "gap-3 mt-6",
        confirmButton:
          "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium px-8 py-3 rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 border-0",
        cancelButton:
          "bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-8 py-3 rounded-xl transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-300 border-0",
        icon: "border-4 border-blue-100 text-blue-500",
      },

      // Enhanced button styling
      buttonsStyling: false, // Disable default styling to use custom classes

      // Animation and backdrop
      backdrop: `
      rgba(0,0,0,0.5)
      left top
      no-repeat
    `,
      showClass: {
        popup: "animate-fade-in-up",
      },
      hideClass: {
        popup: "animate-fade-out",
      },

      // Width and padding
      width: "28rem",
      padding: "2rem",

      // Color scheme
      color: "#1f2937",
      background: "#ffffff",
    });
    if (!result.isConfirmed) return;

    try {
      const response = await axiosInstance.patch(
        `/users/psychologists/${userId}/availability`,
       
      );

      await Swal.fire({
        title: "You're now Unavailable!",
        text: "Patients can not contact you for consultations.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: "rounded-2xl shadow-2xl",
          title: "text-xl font-semibold text-gray-900",
          htmlContainer: "text-gray-600",
          icon: "border-4 border-green-100 text-green-500",
        },
        buttonsStyling: false,
        background: "#ffffff",
      });

      await navigate("/doctor_home_page");
    } catch (error) {}
    if (activeCall) {
      setActiveCall(null);
    }
  };

  const startVideoCall = (patient) => {
    if (!isAvailable) return;
    setActiveCall(patient);
    setSelectedPatient(patient);
  };

  const endCall = () => {
    setActiveCall(null);
    setIsMuted(false);
    setIsVideoOn(true);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedPatient) return;

    const message = {
      id: Date.now(),
      text: newMessage,
      sender: "doctor",
      timestamp: new Date(),
    };

    setMessages((prev) => ({
      ...prev,
      [selectedPatient.id]: [...(prev[selectedPatient.id] || []), message],
    }));

    setNewMessage("");
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  {activeCall && (
  <VideoCallUI
    localStream={localStream}
    remoteStream={remoteStream}
    patient={activeCall}
    onEndCall={endCall}
    isMuted={isMuted}
    isVideoOn={isVideoOn}
    setIsMuted={setIsMuted}
    setIsVideoOn={setIsVideoOn}
  />
)}

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Patient List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">
              Dr. Dashboard
            </h1>
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isAvailable ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <span className="text-sm text-gray-600">
                {isAvailable ? "Available" : "Unavailable"}
              </span>
            </div>
          </div>

          {/* Availability Toggle */}
          <button
            onClick={toggleAvailability}
            className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
              isAvailable
                ? "bg-red-100 text-red-700 hover:bg-red-200"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
          >
            {isAvailable ? (
              <div className="flex items-center justify-center space-x-2">
                <XCircle className="w-4 h-4" />
                <span>Go Unavailable</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Go Available</span>
              </div>
            )}
          </button>
        </div>

        {/* Patient List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-sm font-medium text-gray-500 mb-3">
              Patients ({patients.length})
            </h2>
            <div className="space-y-2">
              {patients.map((patient) => (
                <div
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedPatient?.id === patient.id
                      ? "bg-blue-50 border border-blue-200"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                        {patient.avatar}
                      </div>
                      {patient.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {patient.name}
                        </h3>
                        <div className="flex items-center space-x-1">
                          {patient.requestingCall && (
                            <Video className="w-4 h-4 text-blue-500 animate-pulse" />
                          )}
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {patient.waitTime}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {patient.lastMessage}
                      </p>
                      {patient.requestingCall && (
                        <div className="mt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startVideoCall(patient);
                            }}
                            disabled={!isAvailable}
                            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Join Video Call
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {activeCall ? (
          /* Video Call Interface */
          <div className="flex-1 bg-gray-900 relative">
            {/* Video Area */}
            <div className="h-full flex items-center justify-center">
              <div className="bg-gray-800 rounded-lg p-8 text-center">
                <div className="w-32 h-32 bg-blue-500 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4">
                  {activeCall.avatar}
                </div>
                <h2 className="text-2xl font-semibold text-white mb-2">
                  {activeCall.name}
                </h2>
                <p className="text-gray-300">Video call in progress...</p>
              </div>
            </div>

            {/* Video Controls */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
              <div className="flex items-center space-x-4 bg-gray-800 rounded-full px-6 py-3">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-3 rounded-full transition-colors ${
                    isMuted
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-gray-600 hover:bg-gray-700"
                  }`}
                >
                  {isMuted ? (
                    <MicOff className="w-5 h-5 text-white" />
                  ) : (
                    <Mic className="w-5 h-5 text-white" />
                  )}
                </button>

                <button
                  onClick={() => setIsVideoOn(!isVideoOn)}
                  className={`p-3 rounded-full transition-colors ${
                    !isVideoOn
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-gray-600 hover:bg-gray-700"
                  }`}
                >
                  {isVideoOn ? (
                    <Camera className="w-5 h-5 text-white" />
                  ) : (
                    <CameraOff className="w-5 h-5 text-white" />
                  )}
                </button>

                <button
                  onClick={endCall}
                  className="p-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
                >
                  <PhoneOff className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Doctor's Video (Picture-in-Picture) */}
            <div className="absolute top-4 right-4 w-48 h-36 bg-gray-700 rounded-lg overflow-hidden">
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-300">You</p>
                </div>
              </div>
            </div>
          </div>
        ) : selectedPatient ? (
          /* Chat Interface */
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                      {selectedPatient.avatar}
                    </div>
                    {selectedPatient.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedPatient.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {selectedPatient.isOnline ? "Online" : "Offline"} •
                      Waiting {selectedPatient.waitTime}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => startVideoCall(selectedPatient)}
                  disabled={!isAvailable}
                  className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Video className="w-4 h-4" />
                  <span>Start Video Call</span>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {(messages[selectedPatient.id] || []).map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "doctor"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === "doctor"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-900"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender === "doctor"
                          ? "text-blue-100"
                          : "text-gray-500"
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={sendMessage}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Welcome Screen */
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Welcome, Doctor
              </h2>
              <p className="text-gray-600 mb-4">
                {isAvailable
                  ? "You are available for consultations. Select a patient to start chatting or wait for video call requests."
                  : "Set yourself as available to start receiving patient consultations."}
              </p>
              {!isAvailable && (
                <button
                  onClick={toggleAvailability}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Go Available
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorConsultationDashboard;



// //////////////////////////////////////////////





const VideoCallUI = ({
  localStream,
  remoteStream,
  patient,
  onEndCall,
  isMuted,
  isVideoOn,
  setIsMuted,
  setIsVideoOn,
}) => {
  const [callDuration, setCallDuration] = useState(0);

  // Start call timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col items-center justify-center px-4">
      {/* Patient Info */}
      <div className="text-white mb-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <User className="w-5 h-5" />
          <span className="text-xl font-semibold">{patient?.name || "Patient"}</span>
        </div>
        <p className="text-sm mt-1">Call Duration: {formatTime(callDuration)}</p>
      </div>

      {/* Video Streams */}
      <div className="relative w-full max-w-4xl aspect-video bg-gray-800 rounded-xl overflow-hidden shadow-xl">
        {/* Remote stream */}
        <video
          className="w-full h-full object-cover"
          ref={(video) => {
            if (video && remoteStream) {
              video.srcObject = remoteStream;
              video.play().catch(() => {});
            }
          }}
          autoPlay
          playsInline
        />

        {/* Local stream (small preview) */}
        <video
          className="absolute bottom-4 right-4 w-40 h-32 rounded-lg border border-white shadow-lg"
          muted
          ref={(video) => {
            if (video && localStream) {
              video.srcObject = localStream;
              video.play().catch(() => {});
            }
          }}
          autoPlay
          playsInline
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6 mt-6">
        {/* Mute */}
        <button
          onClick={() => setIsMuted((prev) => !prev)}
          className="bg-white p-4 rounded-full shadow-md hover:scale-105 transition"
        >
          {isMuted ? <MicOff className="text-red-600" /> : <Mic className="text-green-600" />}
        </button>

        {/* Video toggle */}
        <button
          onClick={() => setIsVideoOn((prev) => !prev)}
          className="bg-white p-4 rounded-full shadow-md hover:scale-105 transition"
        >
          {isVideoOn ? <Video className="text-green-600" /> : <VideoOff className="text-red-600" />}
        </button>

        {/* End Call */}
        <button
          onClick={onEndCall}
          className="bg-red-600 hover:bg-red-700 p-4 rounded-full shadow-lg transition"
        >
          <PhoneOff className="text-white" />
        </button>
      </div>
    </div>
  );
};

