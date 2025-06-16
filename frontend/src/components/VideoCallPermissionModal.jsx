import React, { useEffect, useMemo, useState } from "react";

import {Mic,Camera,Wallet,CreditCard,User,Lock,Shield,Video,X,ArrowRight,UserPlus,  Mail,Phone,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../axiosconfig";
import { createSocket } from "../utils/createSocket";

const VideoCallPermissionModal = ({
  isOpen,
  onClose,
  onStartCall,
  doctor 
  
}) => {
  const [permissions, setPermissions] = useState({
    charges: false,
    privacy: false,
  });
  const navigate = useNavigate()
  const [walletBalance, setWalletBalance] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(1); // 1: permissions, 2: confirmation

  const handlePermissionChange = (type) => {
    setPermissions((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };
  const userId = useSelector((state) => state.userDetails.id);
  const allPermissionsGranted = Object.values(permissions).every(Boolean);

  
const [isRequestingPermissions, setIsRequestingPermissions] = useState(false);

const getWalletBalance = async ()=>{
try {
  if(userId){
    const response = await axiosInstance.get(`/payments/get_wallet_balance/${userId}`)
    setWalletBalance(response.data.balance)
  }
   
} catch (error) {
  
}
}
const handleContinue = async () => {

  if ((walletBalance - doctor.fees)<0) {
    toast.error('first Add Money To Wallet',{position:'bottom-center'})
    navigate('/wallet')
    return
  }


  if (step === 1) {
    setStep(2)
  } else if (step === 2) {
    setIsProcessing(true);
  const data = {
    user_id:userId,
    psychologist_id:doctor.id,
    psychologist_fee:doctor.fees
  }
  console.log(data)
  try {
    await axiosInstance.post('/consultations/create_consultation',data)
    
    
    toast.success('Video Call will Start Now',{position:'bottom-center'})
    navigate('/videocall', {state: { doctorId: doctor.id,psychologist_fee:doctor.fees}})
  } catch (error) {
    toast.error('Unable to Start Now',{position:'bottom-center'})
  }

  } 
};


// Check permissions on component mount
useEffect(() => {
  getWalletBalance()
}, []);

const onHandleLoginRedirect = () => {
    // setShowLoginModal(false);
    onClose();
    navigate('/login');
  };
  const handleSignupRedirect = () => {
    setShowLoginModal(false);
    onClose();
    navigate('/signup');
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  if (!isOpen) return null;

  if (!userId) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Login Required
              </h2>
              <p className="text-gray-600">
                Please login to start your video consultation
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Doctor Info */}
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg mb-6">
              <img
                src={doctor.image}
                alt={doctor.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                <p className="text-sm text-gray-600">{doctor.specialization}</p>
              </div>
            </div>

            {/* Why Login Required */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                Why login is required?
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Secure Identity Verification
                    </p>
                    <p className="text-sm text-gray-600">
                      Ensures secure consultation between you and the doctor
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      consultations Records Access
                    </p>
                    <p className="text-sm text-gray-600">
                      Access your previous consultations and session Details
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Payment & Wallet Integration
                    </p>
                    <p className="text-sm text-gray-600">
                      Seamless payment processing from your wallet
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Direct Chat with Doctor
                    </p>
                    <p className="text-sm text-gray-600">
                      Can chat with directly after first consultation
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 mb-1">
                    Secure & Private
                  </p>
                  <p className="text-sm text-amber-700">
                    Your personal information and consultation details are
                    protected and comply with medical
                    privacy standards.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Benefits */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">
                With your account, you can:
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-blue-600" />
                  Start video consultations instantly
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-green-600" />
                  Receive notifications regularly 
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-purple-600" />
                  Book follow-up appointments easily    
                </li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200">
            <div className="space-y-3">
              {/* Login Button */}
              <button
                onClick={onHandleLoginRedirect}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" />
                Login to Continue
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Signup Button */}
              <button
                onClick={handleSignupRedirect}
                className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Create New Account
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Help Text */}
            <div className="text-center mt-4">
              <p className="text-xs text-gray-500">
                Don't have an account? Sign up takes less than 2 minutes
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {step === 1 ? "Start Video Call" : "Confirm Payment"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              disabled={isProcessing}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 ? (
            // Step 1: Permissions
            <>
              {/* Doctor Info */}
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg mb-6">
                <img
                  src={doctor.image ||  "/powerpoint-template-icons-b.jpg"}
                  alt={doctor.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                  <p className="text-sm text-gray-600">Video Consultation</p>
                </div>
              </div>

              {/* Cost Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800">
                    Consultation Fee
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-green-700">
                    ₹{doctor.fees}
                  </span>
                  <div className="text-sm text-green-600">
                    <div>Wallet Balance: ₹{walletBalance}</div>
                    <div>Remaining: ₹{walletBalance - doctor.fees}</div>
                  </div>
                </div>
              </div>

              {/* Permissions */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Required Permissions
                </h4>

                {/* Camera Permission */}
                <div className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permissions.camera}
                        onChange={() => handlePermissionChange("camera")}
                        className="sr-only peer"
                      />
                      <div className="w-5 h-5 bg-white border-2 border-gray-300 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 flex items-center justify-center">
                        {permissions.camera && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </label>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Camera className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-gray-900">
                        Camera Access
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Allow access to your camera for video consultation
                    </p>
                  </div>
                </div>

                {/* Microphone Permission */}
                <div className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permissions.microphone}
                        onChange={() => handlePermissionChange("microphone")}
                        className="sr-only peer"
                      />
                      <div className="w-5 h-5 bg-white border-2 border-gray-300 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 flex items-center justify-center">
                        {permissions.microphone && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </label>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Mic className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-gray-900">
                        Microphone Access
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Allow access to your microphone for audio communication
                    </p>
                  </div>
                </div>

                {/* Payment Consent */}
                <div className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permissions.charges}
                        onChange={() => handlePermissionChange("charges")}
                        className="sr-only peer"
                      />
                      <div className="w-5 h-5 bg-white border-2 border-gray-300 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 flex items-center justify-center">
                        {permissions.charges && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </label>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CreditCard className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-gray-900">
                        Payment Consent
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      I agree to be charged ₹{doctor.fees} from my wallet for
                      this consultation
                    </p>
                  </div>
                </div>

                {/* Privacy Agreement */}
                <div className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permissions.privacy}
                        onChange={() => handlePermissionChange("privacy")}
                        className="sr-only peer"
                      />
                      <div className="w-5 h-5 bg-white border-2 border-gray-300 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 flex items-center justify-center">
                        {permissions.privacy && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </label>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="w-4 h-4 text-purple-600" />
                      <span className="font-medium text-gray-900">
                        Privacy & Terms
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      I agree to the privacy policy and terms of service for
                      video consultations
                    </p>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Important:</p>
                    <p>
                      The consultation fee will be charged immediately upon
                      connecting to the call. Please ensure your wallet has
                      sufficient balance.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // Step 2: Confirmation
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Ready to Start Call
                </h3>
                <p className="text-gray-600">
                  All permissions granted. Click confirm to begin your video
                  consultation.
                </p>
              </div>

              {/* Payment Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Payment Summary
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Consultation Fee</span>
                    <span className="font-semibold">₹{doctor.fees}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Current Wallet Balance
                    </span>
                    <span className="font-semibold">₹{walletBalance}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between">
                    <span className="text-gray-600">Balance After Payment</span>
                    <span className="font-semibold text-green-600">
                      ₹{walletBalance - doctor.fees}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Secure Connection</p>
                    <p>
                      Your video call will be encrypted and secure. This session
                      will not be recorded unless explicitly requested.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex gap-3">
            {step === 2 && (
              <button
                onClick={handleBack}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>
            )}
            <button
              onClick={handleContinue}
              disabled={step === 1 ? !allPermissionsGranted : isProcessing}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : step === 1 ? (
                "Continue"
              ) : (
                <>
                  <Phone className="w-4 h-4" />
                  Start Call (₹{doctor.fees})
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCallPermissionModal;
