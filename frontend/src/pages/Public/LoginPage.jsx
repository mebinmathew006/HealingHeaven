import React, { useEffect, useState } from "react";
import { Eye, EyeOff, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserDetails } from "../../store/UserDetailsSlice";
import { toast } from "react-toastify";
import { loginRoute, passwordResetRoute } from "../../services/userService";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ***********************************************************

  const dispatch = useDispatch();

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const navigate = useNavigate();
  const [errorsFromBackend, setErrorsFromBackend] = useState({
    email: [],
    password: [],
    commonError: "",
  });

  useEffect(() => {
    // Load the Google Identity Services script
    const loadGoogleScript = () => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      script.onload = () => {
        // Initialize Google Identity Services
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
        });

        // Render the button
        window.google.accounts.id.renderButton(
          document.getElementById("googleSignInDiv"),
          { theme: "outline", size: "large", width: "100%" }
        );
      };
    };

    loadGoogleScript();

    // Cleanup
    return () => {
      // Remove the script tag when component unmounts
      const script = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleCredentialResponse = async (response) => {
    try {
      const backendResponse = await googleLoginRoute(response.credential)

      const userDetailsGoogle = backendResponse.data.user;
      dispatch(setUserDetails(userDetailsGoogle));
      toast.success("Login Successful.", {
        position: "bottom-center",
      });
      // Handle successful login (e.g., save token, redirect)
      if (backendResponse.data.user.role == "doctor") {
        navigate("/doctor_home_page");
      } else if (backendResponse.data.user.role == "admin") {
        navigate("/admin_home_page");
      } else {
        navigate("/user_home_page");
      }
    } catch (error) {
      toast.error("Unable to login.", {
        position: "bottom-center",
      });
      console.error("Error authenticating with backend:", error);
      setErrorsFromBackend({
        ...errorsFromBackend,
        commonError: "Google authentication failed. Please try again.",
      });
    }
  };

  const loginSubmitHandler = async (data) => {
    try {
      const response = await loginRoute(email,password)
      // setting the user details in redux store
      const userDetails = response.data.user;
      const userEmail = response.data.user.email;

      if (userDetails.is_verified && userDetails.is_active) {
        dispatch(setUserDetails(userDetails));

        toast.success("Login Successful.", {
          position: "bottom-center",
        });

        if (userDetails.role == "doctor") {
          navigate("/doctor_home_page");
        } else if (userDetails.role == "admin") {
          navigate("/admin_home_page");
        } else {
          navigate("/user_home_page");
        }
      } else if (!userDetails.is_active && !userDetails.is_verified) {
        toast.info("Verifiy your Email first ", {
          position: "bottom-center",
        });
        try {
          await passwordResetRoute(userEmail)
          navigate("/verify_otp", { state: userEmail });
        } catch (error) {
          toast.error("Unable to Verifiy your Email.", {
            position: "bottom-center",
          });
        }
      } else {
        toast.info("Your are blocked", { position: "bottom-center" });
        return;
      }
    } catch (error) {
      toast.error("Unable to login.", {
        position: "bottom-center",
      });
      if (error.response && error.response.data && error.response.data.error) {
        setErrorsFromBackend(error.response.data.error);
      } else {
        setErrorsFromBackend({
          email: [],
          password: [],
          commonError: "Something went wrong. Please try again later.",
        });
      }
    }
  };

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
        {/* Left Side - Medical Professional Image Placeholder */}
        <div className="flex-1 text-center lg:text-left">
          <div className="mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Welcome to Our
              <span className="text-green-800 block">Community</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto lg:mx-0">
              Connect with healthcare professionals or manage your health
              journey with our comprehensive platform.
            </p>
          </div>

          {/* Illustration */}
          <div className="hidden lg:block">
            <div className="w-96 h-96 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-2xl">
              <div className="text-center">
                <div className="w-32 h-32 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <img src="logo.png" className="rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md lg:max-w-lg">
          <div className="bg-green rounded-3xl shadow-2xl p-8 lg:p-10 backdrop-blur-sm bg-opacity-95">
            {/* Logo and Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <Home
                  className="font-bold text-green-950"
                  onClick={() => navigate("/")}
                />

                {/* <span className="text-2xl font-bold text-gray-800">OpenNest</span> */}
              </div>
              <h1 className="text-3xl font-bold text-blue-400 mb-2">Sign in</h1>
              <p className="text-gray-600">
                Or{" "}
                <button
                  onClick={() => navigate("/signup")}
                  className="font-sm text-[#2D777E] hover:text-green-900"
                >
                  create account
                </button>
              </p>
            </div>

            {/* Form */}
            <div className="space-y-6">
              <form>
                <div className="mb-6">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all duration-200"
                    placeholder="you@example.com"
                  />
                  {errorsFromBackend.email &&
                    errorsFromBackend.email.length > 0 && (
                      <p className="mt-1 text-sm text-red-600">
                        {errorsFromBackend.email[0]}
                      </p>
                    )}
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all duration-200"
                      placeholder="••••••••••••••••••"
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
                  {errorsFromBackend.password &&
                    errorsFromBackend.password.length > 0 && (
                      <p className="mt-1 text-sm text-red-600">
                        {errorsFromBackend.password[0]}
                      </p>
                    )}
                </div>
              </form>

              <div className="flex items-center justify-end mb-6">
                <div className="text-sm">
                  <button
                    onClick={() => navigate("/forgetpassword")}
                    className="font-medium text-[#2D777E] hover:text-indigo-500"
                  >
                    Forgot password ?
                  </button>
                </div>
              </div>

              {errorsFromBackend.commonError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">
                    {errorsFromBackend.commonError}
                  </p>
                </div>
              )}

              <div className="mb-6">
                <button
                  onClick={loginSubmitHandler}
                  className="w-full bg-gradient-to-r from-[#2D777E] to-green-700 hover:from-[#2D777E] hover:to-green-500 text-white py-4 px-6 rounded-xl font-semibold text-lg   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  Sign in
                </button>
              </div>

              <div className="mb-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-[#2D777E]">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <div id="googleSignInDiv" className="w-full">
                    {/* Google Sign In button will be rendered here by the Google script */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
