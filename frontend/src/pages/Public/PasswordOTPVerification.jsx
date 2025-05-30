import React, { useState, useRef, useEffect } from "react";
import {
  CheckCircle,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import publicaxiosconfig from "../../Publicaxiosconfig";
import { toast } from "react-toastify";

export default function PasswordOTPVerification() {
  const location = useLocation();
  const email = location.state;
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const navigate = useNavigate()
  const [errors, setErrors] = useState({
    otp: "",
    password: "",
    confirmPassword: "",
    match: "",
  });

  const inputRefs = useRef([]);

  // Focus on first input on mount
  useEffect(() => {
  let timer;
  if (resendTimer > 0) {
    timer = setInterval(() => {
      setResendTimer(prev => prev - 1);
    }, 1000);
  }

  return () => clearInterval(timer); // ✅ Cleanup
}, [resendTimer]);


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

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    // Clear password errors when typing
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: "" }));
    }
    // Clear match error when editing either password
    if (errors.match && confirmPassword) {
      setErrors((prev) => ({ ...prev, match: "" }));
    }
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    // Clear confirm password errors when typing
    if (errors.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
    }
    // Clear match error when editing either password
    if (errors.match && password) {
      setErrors((prev) => ({ ...prev, match: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      otp: "",
      password: "",
      confirmPassword: "",
      match: "",
    };
    let isValid = true;

    // Check if OTP is complete
    if (otp.some((digit) => digit === "")) {
      newErrors.otp = "Please enter the complete verification code";
      isValid = false;
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    }

    // Password match validation
    if (password && confirmPassword && password !== confirmPassword) {
      newErrors.match = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const otpValue = Number(otp.join(""));
      console.log(email, password, otpValue);

      const response = await publicaxiosconfig.post(
        "/users/forget_password_otp_verify",
        { email: email, password: password, otp: otpValue }
      );

      setIsSubmitting(false);
      setIsSuccess(true);
    } catch (error) {
      toast.error("Something Happend", { position: "bottom-center" });
      setIsSubmitting(false);
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
      } else {
        // Focus on password field when OTP is complete
        document.getElementById("password").focus();
      }
    }
  };

  const resendOtp = async (e) => {
    e.preventDefault();

    if (resendTimer > 0) return; // Prevent resending if timer not expired

    try {
      const res = await publicaxiosconfig.post("/users/forgetpassword", {
        email,
      });
      if (res.status === 200) {
        toast.info("New OTP has been sent to your email",{position:'bottom-center'});
        setResendTimer(60); // ⬅ Reset the timer here
      }
    } catch (error) {
      toast.error("Failed to resend OTP",{position:'bottom-center'});
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verify and reset password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter the verification code sent to your email and create a new
          password
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {isSuccess ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                Password reset successful!
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Your password has been reset successfully. You can now log in
                with your new credentials.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => {
                    // Redirect to login in a real application
                    navigate('/login')
                  }}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Go to login
                </button>
              </div>
            </div>
          ) : (
            <form>
              <div className="space-y-6">
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
                    <p className="mt-2 text-xs text-gray-500 flex justify-end">
                      <button
                        onClick={resendOtp}
                         className="font-medium text-indigo-600 hover:text-indigo-500 hover:cursor-pointer"
                        disabled={resendTimer > 0}
                      >
                        {resendTimer > 0
                          ? `Resend OTP in ${resendTimer}s`
                          : "Resend OTP"}
                      </button>
                    </p>
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    New Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      autoComplete="new-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={handlePasswordChange}
                      className={`block w-full pl-10 pr-10 py-2 border ${
                        errors.password ? "border-red-300" : "border-gray-300"
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      placeholder="••••••••••••"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.password}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Password must be at least 8 characters
                  </p>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Confirm Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      autoComplete="new-password"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      className={`block w-full pl-10 pr-10 py-2 border ${
                        errors.confirmPassword || errors.match
                          ? "border-red-300"
                          : "border-gray-300"
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      placeholder="••••••••••••"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.confirmPassword}
                    </p>
                  )}
                  {errors.match && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.match}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Processing...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
