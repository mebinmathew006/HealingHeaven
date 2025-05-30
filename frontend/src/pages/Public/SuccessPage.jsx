import { useNavigate } from "react-router-dom";
import React from "react";
import {
  Check,
} from "lucide-react";
function SuccessPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-96 flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 space-y-6">
    <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Check size={32} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Verification Successful!</h1>
        <p className="text-gray-600 mt-2">
          Welcome! Your email has been verified.
        </p>
      </div>
      
      <div className="space-y-4">
        <p className="text-gray-600 text-center">
          Your account is now active. You can now access all features.
        </p>
        
        <button
          onClick={() => navigate('/login')}
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Continue to Login
        </button>
        
        {/* <div className="text-center">
          <button 
            onClick={() => navigate('/login')}
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Back to Login
          </button>
        </div> */}
      </div>
    </div>
      </div>
    </div>
  );
}

export default SuccessPage;