import React, { useState } from "react";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import publicaxiosconfig from "../../Publicaxiosconfig";
import { toast } from "react-toastify";

function OtpPage() {
  const [timer, setTimer] = useState(30);
  const [otp, setOtp] = useState();
  const location = useLocation();
  const email = location.state;
  const navigate = useNavigate()
  // Handle OTP verification
  const handleVerify = async (e) => {
    e.preventDefault();

    // Check if OTP is complete
    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit verification code");
      return;
    }

    // api verification
    try {
       await publicaxiosconfig.post("users/email_otp_verify", {
      otp: otp,
      email: email,
    });
    navigate('/verificationsucess')
    } catch (error) {
      console.log(error);
      toast.error("OTP Verification Failed", {
                position: "bottom-center",
              });
    }
    // Simulate API verification (replace with actual API call)
    setTimeout(() => {}, 1500);
  };

  
  // Decrease timer every second
  useState(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  return (
    <div className="min-h-96 flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Email Verification
          </h1>
          <p className="text-gray-600 mt-2">
            We've sent a verification code to {email}
          </p>
        </div>

        <form
          onSubmit={handleVerify}
          className="flex w-full items-center gap-x-4"
        >
          <input
            type="text"
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            placeholder="Enter otp"
            className="flex-grow text-center text-xl border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-1"
          />

          <button
            type="submit"
            className="px-4 py-2 rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            Verify
          </button>
        </form>
        <div className="pt-2">
          <Link
            to={"/signup"}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to Signup
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OtpPage;
