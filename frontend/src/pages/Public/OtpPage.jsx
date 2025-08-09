import React, { useState, useRef, useEffect } from "react";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import publicaxiosconfig from "../../Publicaxiosconfig";
import { toast } from "react-toastify";

function OtpPage() {
  const [timer, setTimer] = useState(60);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [errors, setErrors] = useState({
    otp: "",
  });
  const location = useLocation();
  const email = location.state;
  const navigate = useNavigate();
  const inputRefs = useRef([]);

const resendOtp = async (e) => {
    e.preventDefault();

    if (timer > 0) return; // Prevent resending if timer not expired

    try {
      const res = await publicaxiosconfig.post("/users/password-reset", {
        email,
      });
      if (res.status === 200) {
        toast.info("New OTP has been sent to your email",{position:'bottom-center'});
        setTimer(60); // ⬅ Reset the timer here
      }
    } catch (error) {
      toast.error("Failed to resend OTP",{position:'bottom-center'});
    }
  };

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Clear OTP error when typing
    if (errors.otp) {
      setErrors((prev) => ({ ...prev, otp: "" }));
    }

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace - focus previous input when current is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const pastedOtp = pastedData.replace(/\D/g, "").split("").slice(0, 6);

    if (pastedOtp.length) {
      const newOtp = [...otp];
      pastedOtp.forEach((digit, index) => {
        if (index < 6) newOtp[index] = digit;
      });
      setOtp(newOtp);

      // Focus on appropriate field after paste
      if (pastedOtp.length < 6) {
        inputRefs.current[pastedOtp.length].focus();
      }
    }
  };

  // Handle OTP verification
  const handleVerify = async (e) => {
    e.preventDefault();

    // Check if OTP is complete
    if (otp.some((digit) => digit === "")) {
      setErrors({ otp: "Please enter the complete verification code" });
      return;
    }

    // api verification
    try {
      const otpValue = otp.join("");
      await publicaxiosconfig.post("users/email-verification", {
        otp: otpValue,
        email: email,
      });
      navigate("/verificationsucess");
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
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center relative overflow-hidden">
      {/* Background Medical Image Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
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

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 flex items-center justify-between">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify Your Email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the verification code sent to your email and get verified
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10 backdrop-blur-sm ">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Email Verification
              </h1>
              <p className="text-gray-600 mt-2">
                We've sent a verification code to {email}
              </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-6">
              {/* OTP Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Verification Code
                </label>
                <div className="mt-1">
                  <div className="flex justify-between gap-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        maxLength={1}
                        autoComplete=""
                        value={digit}
                        onChange={(e) =>
                          handleOtpChange(index, e.target.value)
                        }
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        className={`w-12 h-12 text-center text-lg border ${
                          errors.otp ? "border-red-300" : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                      />
                    ))}
                  </div>
                  {errors.otp && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.otp}
                    </p>
                  )}
                </div>
                 <p className="mt-2 text-xs text-gray-500 flex justify-end">
                      <button
                        onClick={resendOtp}
                         className="font-medium text-indigo-600 hover:text-indigo-500 hover:cursor-pointer"
                        disabled={timer > 0}
                      >
                        {timer > 0
                          ? `Resend OTP in ${timer}s`
                          : "Resend OTP"}
                      </button>
                    </p>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#2D777E] to-green-700 hover:from-[#2D777E] hover:to-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Verify
                </button>
              </div>

              {/* Back to Signup Link */}
              <div className="pt-2">
                <Link
                  to={"/signup"}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft size={16} className="mr-1" />
                  Back to Signup
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OtpPage;