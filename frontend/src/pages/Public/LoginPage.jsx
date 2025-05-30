import React, { useEffect, useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import publicaxiosconfig from "../../Publicaxiosconfig";
import { useDispatch, useSelector } from "react-redux";
import { setUserDetails } from "../../store/UserDetailsSlice";
import { toast } from "react-toastify";

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
      const backendResponse = await publicaxiosconfig.post("/google_login", {
        credential: response.credential, // Send the credential token to your backend
      });

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
      const response = await publicaxiosconfig.post("/users/login", {
        email: email,
        password: password,
      });

      // setting the user details in redux store
      const userDetails = response.data.user;
      const userEmail = response.data.user.email;
      console.log(response.data.user)
       if (!userDetails.is_active) {
        toast.info('Your are blocked',{position:'bottom-center'})
        return
      }

      if (userDetails.is_verified) {
     
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

      } else {
        toast.info("Verifiy your Email first ", {
          position: "bottom-center",
        });
        try {
          await publicaxiosconfig.post("/users/forgetpassword", { email: userEmail });
          navigate("/verify_otp", { state: userEmail });
        } catch (error) {
          toast.error("Unable to Verifiy your Email.", {
            position: "bottom-center",
          });
        }
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
  // ***********************************************************
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link
              to={"/signup"}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              create a new account
            </Link>
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <form>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockKeyhole className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                    placeholder="••••••••••••••••••••"
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
              </div>
            </form>

            <div className="flex items-center justify-end">
              <div className="text-sm">
                <Link
                  to={"/forgetpassword"}
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                onClick={loginSubmitHandler}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign in
              </button>
            </div>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6">
              <div>
                <a
                  href="#"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
