// components/VideoCallPermissionModal/index.js
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../utils/NotificationContext";
import { useNotificationSound } from "../utils/useNotificationSound";
import LoginRequiredModal, { ConfirmationStep, ModalFooter, ModalHeader, PermissionsStep } from "./VideoCallPermission/LoginRequiredModal";
import { getWalletBalanceRoute } from "../services/paymentService";
import { CreateConsultaionRoute } from "../services/consultationService";

const VideoCallPermissionModal = ({ isOpen, onClose, onStartCall, doctor }) => {
  const [permissions, setPermissions] = useState({
    camera: false,
    microphone: false,
    charges: false,
    privacy: false,
  });
  const [isRecording, setIsRecording] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(1);
  
  const navigate = useNavigate();
  const userId = useSelector((state) => state.userDetails.id);
  const { sendNotification } = useNotifications();
  
  useNotificationSound();

  const allPermissionsGranted = Object.values(permissions).every(Boolean);

  const handlePermissionChange = (type) => {
    setPermissions((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleRecordPermission = (e) => {
    setIsRecording(e.target.checked);
  };

  const getWalletBalance = async () => {
    try {
      if (userId) {
        const response = await getWalletBalanceRoute(userId)
        setWalletBalance(response);
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    }
  };

  const handleContinue = async () => {
    if (walletBalance - doctor.fees < 0) {
      toast.error("First Add Money To Wallet", { position: "bottom-center" });
      navigate("/wallet");
      return;
    }

    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      await startVideoCall();
    }
  };

  const startVideoCall = async () => {
    setIsProcessing(true);
    const data = {
      user_id: userId,
      psychologist_id: doctor.id
    };

    try {
      const response = await CreateConsultaionRoute(data);
     
      const consultation_id = response.data.consultation_id;

      toast.success("Video Call will Start Now", {
        position: "bottom-center",
      });
      
      sendNotification(doctor.id, "You have a call from user", "appointment",consultation_id);
      
      setTimeout(() => {
        navigate("/videocall_user", {
          state: {
            doctorId: doctor.id,
            psychologist_fee: doctor.fees,
            consultationId: consultation_id,
            // isRecordingtoggle: isRecording
          },
        });
      }, 4000);
    } catch (error) {
      toast.error("Unable to Start Now", { position: "bottom-center" });
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  useEffect(() => {
    getWalletBalance();
  }, []);

  if (!isOpen) return null;

  if (!userId) {
    return (
      <LoginRequiredModal
        onClose={onClose} 
        doctor={doctor} 
        navigate={navigate} 
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <ModalHeader 
          step={step} 
          onClose={onClose} 
          isProcessing={isProcessing} 
        />

        <div className="p-6">
          {step === 1 ? (
            <PermissionsStep
              doctor={doctor}
              permissions={permissions}
              isRecording={isRecording}
              walletBalance={walletBalance}
              onPermissionChange={handlePermissionChange}
              onRecordPermissionChange={handleRecordPermission}
            />
          ) : (
            <ConfirmationStep
              doctor={doctor}
              walletBalance={walletBalance}
            />
          )}
        </div>

        <ModalFooter
          step={step}
          isProcessing={isProcessing}
          allPermissionsGranted={allPermissionsGranted}
          doctorFees={doctor.fees}
          onBack={handleBack}
          onContinue={handleContinue}
        />
      </div>
    </div>
  );
};

export default VideoCallPermissionModal;