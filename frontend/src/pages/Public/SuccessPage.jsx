import { useNavigate } from "react-router-dom";
import React from "react";
import { Check } from "lucide-react";
function SuccessPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center relative overflow-hidden">
      {/* Background Medical Image Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23e3f2fd'/%3E%3Cstop offset='100%25' style='stop-color:%23bbdefb'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1200' height='800' fill='url(%23bg)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Abstract Medical Icons Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-32 h-32 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-32 left-16 w-24 h-24 bg-green-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-indigo-200 rounded-full opacity-20 animate-pulse delay-500"></div>
        <div className="absolute top-1/3 left-1/4 w-20 h-20 bg-pink-200 rounded-full opacity-20 animate-pulse delay-700"></div>
      </div>
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 space-y-6 z-2">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Check size={32} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Verification Successful!
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome! Your email has been verified.
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-gray-600 text-center">
            Your account is now active. You can now access all features.
          </p>

          <button
          onClick={()=>{
            navigate('/login')
          }}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md  shadow-sm text-base font-medium text-white bg-green-800 hover:bg-green-700 "
          >
            Continue to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default SuccessPage;
