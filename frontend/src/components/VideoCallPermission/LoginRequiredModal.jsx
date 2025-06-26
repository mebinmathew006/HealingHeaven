import React from "react";
import {
  User,
  X,
  ArrowRight,
  UserPlus,
  CheckCircle,
  Shield,
  Video,
  Mail,
  Phone,
} from "lucide-react";

const LoginRequiredModal = ({ onClose, doctor, navigate }) => {
  const handleLoginRedirect = () => {
    onClose();
    navigate("/login");
  };

  const handleSignupRedirect = () => {
    onClose();
    navigate("/signup");
  };

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

          {/* Benefits */}
          <LoginBenefits />

          {/* Security Notice */}
          <SecurityNotice />

          {/* Quick Benefits */}
          <QuickBenefits />
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="space-y-3">
            <button
              onClick={handleLoginRedirect}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4" />
              Login to Continue
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleSignupRedirect}
              className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Create New Account
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center mt-4">
            <p className="text-xs text-gray-500">
              Don't have an account? Sign up takes less than 2 minutes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};






// components/VideoCallPermissionModal/LoginBenefits.js
 export const LoginBenefits = () => {
  const benefits = [
    {
      title: "Secure Identity Verification",
      description: "Ensures secure consultation between you and the doctor"
    },
    {
      title: "Consultations Records Access",
      description: "Access your previous consultations and session Details"
    },
    {
      title: "Payment & Wallet Integration",
      description: "Seamless payment processing from your wallet"
    },
    {
      title: "Direct Chat with Doctor",
      description: "Can chat with directly after first consultation"
    }
  ];

  return (
    <div className="mb-6">
      <h3 className="font-semibold text-gray-900 mb-3">
        Why login is required?
      </h3>
      <div className="space-y-3">
        {benefits.map((benefit, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle className="w-3 h-3 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{benefit.title}</p>
              <p className="text-sm text-gray-600">{benefit.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// components/VideoCallPermissionModal/SecurityNotice.js
export const SecurityNotice = () => (
  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
    <div className="flex items-start gap-3">
      <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <div>
        <p className="font-medium text-amber-800 mb-1">Secure & Private</p>
        <p className="text-sm text-amber-700">
          Your personal information and consultation details are protected and 
          comply with medical privacy standards.
        </p>
      </div>
    </div>
  </div>
);

// components/VideoCallPermissionModal/QuickBenefits.js
export const QuickBenefits = () => {
  const benefits = [
    { icon: Video, text: "Start video consultations instantly", color: "text-blue-600" },
    { icon: Mail, text: "Receive notifications regularly", color: "text-green-600" },
    { icon: Phone, text: "Book follow-up appointments easily", color: "text-purple-600" }
  ];

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-6">
      <h4 className="font-semibold text-gray-900 mb-3">
        With your account, you can:
      </h4>
      <ul className="space-y-2 text-sm text-gray-700">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-center gap-2">
            <benefit.icon className={`w-4 h-4 ${benefit.color}`} />
            {benefit.text}
          </li>
        ))}
      </ul>
    </div>
  );
};

// components/VideoCallPermissionModal/ModalHeader.js
export const ModalHeader = ({ step, onClose, isProcessing }) => (
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
);

// components/VideoCallPermissionModal/PermissionsStep.js
import { 
  Wallet, 
  Camera, 
  Mic, 
  CreditCard, 
  AlertCircle 
} from "lucide-react";

export const PermissionsStep = ({
  doctor,
  permissions,
  isRecording,
  walletBalance,
  onPermissionChange,
  onRecordPermissionChange,
}) => (
  <>
    {/* Doctor Info */}
    <DoctorInfo doctor={doctor} />

    {/* Cost Info */}
    <CostInfo doctor={doctor} walletBalance={walletBalance} />

    {/* Permissions */}
    <PermissionsList
      permissions={permissions}
      isRecording={isRecording}
      doctor={doctor}
      onPermissionChange={onPermissionChange}
      onRecordPermissionChange={onRecordPermissionChange}
    />

    {/* Warning */}
    <PaymentWarning />
  </>
);

// components/VideoCallPermissionModal/DoctorInfo.js
export const DoctorInfo = ({ doctor }) => (
  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg mb-6">
    <img
      src={doctor.image || "/powerpoint-template-icons-b.jpg"}
      alt={doctor.name}
      className="w-12 h-12 rounded-full object-cover"
    />
    <div>
      <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
      <p className="text-sm text-gray-600">Video Consultation</p>
    </div>
  </div>
);

// components/VideoCallPermissionModal/CostInfo.js
export const CostInfo = ({ doctor, walletBalance }) => (
  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
    <div className="flex items-center gap-2 mb-2">
      <Wallet className="w-5 h-5 text-green-600" />
      <span className="font-semibold text-green-800">Consultation Fee</span>
    </div>
    <div className="flex justify-between items-center">
      <span className="text-2xl font-bold text-green-700">₹{doctor.fees}</span>
      <div className="text-sm text-green-600">
        <div>Wallet Balance: ₹{walletBalance}</div>
        <div>Remaining: ₹{walletBalance - doctor.fees}</div>
      </div>
    </div>
  </div>
);

// components/VideoCallPermissionModal/PermissionsList.js
export const PermissionsList = ({
  permissions,
  isRecording,
  doctor,
  onPermissionChange,
  onRecordPermissionChange,
}) => {
  const permissionItems = [
    {
      key: "camera",
      icon: Camera,
      title: "Camera Access",
      description: "Allow access to your camera for video consultation",
      color: "text-blue-600",
      checked: permissions.camera,
    },
    {
      key: "microphone",
      icon: Mic,
      title: "Microphone Access",
      description: "Allow access to your microphone for audio communication",
      color: "text-blue-600",
      checked: permissions.microphone,
    },
    {
      key: "charges",
      icon: CreditCard,
      title: "Payment Consent",
      description: `I agree to be charged ₹${doctor.fees} from my wallet for this consultation`,
      color: "text-green-600",
      checked: permissions.charges,
    },
    {
      key: "privacy",
      icon: Shield,
      title: "Privacy & Terms",
      description: "I agree to the privacy policy and terms of service for video consultations",
      color: "text-purple-600",
      checked: permissions.privacy,
    },
  ];

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-900 mb-3">Required Permissions</h4>

      {permissionItems.map((item) => (
        <PermissionItem
          key={item.key}
          {...item}
          onChange={() => onPermissionChange(item.key)}
        />
      ))}

      {/* Recording Permission */}
      <div className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
        <div className="flex-shrink-0 mt-1">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              onChange={onRecordPermissionChange}
              className="sr-only peer"
            />
            <div className="w-5 h-5 bg-white border-2 border-gray-300 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 flex items-center justify-center">
              {isRecording && <CheckCircle className="w-3 h-3 text-white" />}
            </div>
          </label>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Video className="w-4 h-4 text-red-600" />
            <span className="font-medium text-gray-900">Record Video</span>
          </div>
          <p className="text-sm text-gray-600">
            I agree to Record the Video and keep it for further Consultations
          </p>
        </div>
      </div>
    </div>
  );
};

// components/VideoCallPermissionModal/PermissionItem.js
export const PermissionItem = ({ icon: Icon, title, description, color, checked, onChange }) => (
  <div className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
    <div className="flex-shrink-0 mt-1">
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="w-5 h-5 bg-white border-2 border-gray-300 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 flex items-center justify-center">
          {checked && <CheckCircle className="w-3 h-3 text-white" />}
        </div>
      </label>
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="font-medium text-gray-900">{title}</span>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </div>
);

// components/VideoCallPermissionModal/PaymentWarning.js
export const PaymentWarning = () => (
  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
    <div className="flex items-start gap-2">
      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
      <div className="text-sm text-yellow-800">
        <p className="font-medium mb-1">Important:</p>
        <p>
          The consultation fee will be charged immediately upon connecting to the call. 
          Please ensure your wallet has sufficient balance.
        </p>
      </div>
    </div>
  </div>
);

// components/VideoCallPermissionModal/ConfirmationStep.js
import {Lock } from "lucide-react";

export const ConfirmationStep = ({ doctor, walletBalance }) => (
  <>
    <div className="text-center mb-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Phone className="w-8 h-8 text-green-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Ready to Start Call
      </h3>
      <p className="text-gray-600">
        All permissions granted. Click confirm to begin your video consultation.
      </p>
    </div>

    {/* Payment Summary */}
    <PaymentSummary doctor={doctor} walletBalance={walletBalance} />

    {/* Security Notice */}
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
      <div className="flex items-start gap-2">
        <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">Secure Connection</p>
          <p>
            Your video call will be encrypted and secure. This session will not 
            be recorded unless explicitly requested.
          </p>
        </div>
      </div>
    </div>
  </>
);

// components/VideoCallPermissionModal/PaymentSummary.js
export const PaymentSummary = ({ doctor, walletBalance }) => (
  <div className="bg-gray-50 rounded-lg p-4 mb-6">
    <h4 className="font-semibold text-gray-900 mb-3">Payment Summary</h4>
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-gray-600">Consultation Fee</span>
        <span className="font-semibold">₹{doctor.fees}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Current Wallet Balance</span>
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
);

// components/VideoCallPermissionModal/ModalFooter.js
export  const  ModalFooter = ({
  step,
  isProcessing,
  allPermissionsGranted,
  doctorFees,
  onBack,
  onContinue,
}) => (
  <div className="p-6 border-t border-gray-200">
    <div className="flex gap-3">
      {step === 2 && (
        <button
          onClick={onBack}
          disabled={isProcessing}
          className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>
      )}
      <button
        onClick={onContinue}
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
            Start Call (₹{doctorFees})
          </>
        )}
      </button>
    </div>
  </div>
);

export default LoginRequiredModal;