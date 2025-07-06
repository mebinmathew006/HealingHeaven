
import React, { useEffect } from 'react'
import { Clock, Shield, Mail } from 'lucide-react';
import useLogout from '../../utils/useLogout';

function DoctorPendingPage() {
 const logout = useLogout();
 
    
    return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Icon */}
        <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6">
          <Clock className="w-8 h-8 text-amber-600" />
        </div>
        
        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Verification Pending
        </h1>
        
        {/* Message */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          Thank you for registering as a psychiatrist. Your account is currently under review by our administrative team for verification and approval.
        </p>
        
        {/* Status indicators */}
        <div className="space-y-3 mb-8">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Credentials Review</span>
            </div>
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
              In Progress
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Admin Approval</span>
            </div>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              Waiting
            </span>
          </div>
        </div>
        
        {/* Information box */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-green-900 mb-2">What happens next?</h3>
          <p className="text-sm text-green-800">
            Our team will verify your credentials and professional qualifications. You'll receive an email notification once your account has been approved and activated.
          </p>
        </div>
        
        {/* Timeline */}
        <p className="text-sm text-gray-500 mb-6">
          This process typically takes 2-3 business days
        </p>
        
        {/* Contact info */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">
            Questions about your verification?
          </p>
          <button
            onClick={logout}
            className="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
  
}

export default DoctorPendingPage
