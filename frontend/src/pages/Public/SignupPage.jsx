import React, { useState } from "react";
import {
  AlertCircle,
  Mail,
  Lock,
  User,
  ChevronRight,
  Phone,
} from "lucide-react";
import { toast } from "react-toastify";

import publicaxiosconfig from "../../Publicaxiosconfig";
import { Link, useNavigate } from "react-router-dom";

// Main App Component
export default function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email_address: "",
    password: "",
    confirmPassword: "",
    role: "",
    mobile_number: "",
  });

  // Handle page navigation

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Update form data
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    // Validate field on change if it's been touched
    if (touched[name]) {
      validateField(name, value);
    }
  };

  // Mark field as touched on blur
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({
      ...touched,
      [name]: true,
    });
    validateField(name, value);
  };

  // Validate individual field
  const validateField = (name, value) => {
    let newErrors = { ...errors };

    switch (name) {
      case "name":
        if (!value.trim()) {
          newErrors.name = "Full name is required";
        } else if (value.trim().length < 3) {
          newErrors.name = "Full name must be at least 3 characters";
        } else {
          delete newErrors.name;
        }
        break;

      case "mobile_number":
        if (!value.trim()) {
          newErrors.mobile_number = "Mobile Number is required";
        } else if (value.trim().length !== 10) {
          newErrors.mobile_number = "Mobile number must be exactly 10 digits";
        } else if (!/^\d{10}$/.test(value.trim())) {
          newErrors.mobile_number =
            "Mobile number must contain exactly 10 digits";
        } else {
          delete newErrors.mobile_number;
        }
        break;

      case "role":
        if (!value.trim()) {
          newErrors.role = "Role is required";
        } else if (!["doctor", "patient"].includes(value)) {
          newErrors.role = "Select a valid role";
        } else {
          delete newErrors.role;
        }
        break;

      case "email_address":
        const email_addressRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          newErrors.email_address = "email_address is required";
        } else if (!email_addressRegex.test(value)) {
          newErrors.email_address =
            "Please enter a valid email_address address";
        } else {
          delete newErrors.email_address;
        }
        break;

      case "password":
        if (!value) {
          newErrors.password = "Password is required";
        } else if (value.length < 8) {
          newErrors.password = "Password must be at least 8 characters";
        }
        // else if (!/\d/.test(value) || !/[a-zA-Z]/.test(value)) {
        //   newErrors.password = "Password must contain both letters and numbers";
        // }
        else {
          delete newErrors.password;
        }

        // Also check confirm password if it exists
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match";
        } else if (formData.confirmPassword) {
          delete newErrors.confirmPassword;
        }
        break;

      case "confirmPassword":
        if (!value) {
          newErrors.confirmPassword = "Please confirm your password";
        } else if (value !== formData.password) {
          newErrors.confirmPassword = "Passwords do not match";
        } else {
          delete newErrors.confirmPassword;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  // Validate all fields
  const validateForm = () => {
  const newErrors = {};

  Object.entries(formData).forEach(([name, value]) => {
    switch (name) {
      case "name":
        if (!value.trim()) {
          newErrors.name = "Full name is required";
        } else if (value.trim().length < 3) {
          newErrors.name = "Full name must be at least 3 characters";
        }
        break;

      case "mobile_number":
        if (!value.trim()) {
          newErrors.mobile_number = "Mobile Number is required";
        } else if (!/^\d{10}$/.test(value.trim())) {
          newErrors.mobile_number = "Mobile number must contain exactly 10 digits";
        }
        break;

      case "role":
        if (!value.trim()) {
          newErrors.role = "Role is required";
        } else if (!["doctor", "patient"].includes(value)) {
          newErrors.role = "Select a valid role";
        }
        break;

      case "email_address":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          newErrors.email_address = "Email address is required";
        } else if (!emailRegex.test(value)) {
          newErrors.email_address = "Please enter a valid email address";
        }
        break;

      case "password":
        if (!value) {
          newErrors.password = "Password is required";
        } else if (value.length < 8) {
          newErrors.password = "Password must be at least 8 characters";
        }
        // optional: add more password complexity checks here
        break;

      case "confirmPassword":
        if (!value) {
          newErrors.confirmPassword = "Please confirm your password";
        } else if (value !== formData.password) {
          newErrors.confirmPassword = "Passwords do not match";
        }
        break;

      default:
        break;
    }
  });

  setErrors(newErrors);

  // Mark all fields as touched to show errors on submit
  const touchedFields = {};
  Object.keys(formData).forEach((key) => {
    touchedFields[key] = true;
  });
  setTouched(touchedFields);

  // Return true if no errors
  return Object.keys(newErrors).length === 0;
};


  // Handle form submission
  const handleSubmit = async (e) => {
  e.preventDefault();

  if (validateForm()) {
    try {
      const response = await publicaxiosconfig.post("users/signup", formData);
      toast.success('Singup Successfull Please verify your Email Now!!',{position:'bottom-center'})
      navigate("/verify_otp", { state: formData.email_address });
      
    } catch (error) {
      console.error("Signup error:", error.response?.data || error.message);
      toast.error('Something Happend !!',{position:'bottom-center'})
    }
  }
};


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Create an Account
          </h1>
          <p className="text-gray-600 mt-2">Sign up to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name Field */}
          <div className="space-y-1">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-gray-400" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`block w-full pl-10 pr-3 py-2 border ${
                  errors.name ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="John Doe"
              />
            </div>
            {errors.name && touched.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.name}
              </p>
            )}
          </div>
          {/* Mobile Number */}
          <div className="space-y-1">
            <label
              htmlFor="mobile_number"
              className="block text-sm font-medium text-gray-700"
            >
              Phone
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone size={18} className="text-gray-400" />
              </div>
              <input
                id="mobile_number"
                name="mobile_number"
                type="text"
                value={formData.mobile_number}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`block w-full pl-10 pr-3 py-2 border ${
                  errors.name ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="9876543210"
              />
            </div>
            {errors.mobile_number && touched.mobile_number && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.mobile_number}
              </p>
            )}
          </div>

          {/* email_address Field */}
          <div className="space-y-1">
            <label
              htmlFor="email_address"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-400" />
              </div>
              <input
                id="email_address"
                autoComplete="username"
                name="email_address"
                type="email"
                value={formData.email_address}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`block w-full pl-10 pr-3 py-2 border ${
                  errors.email_address ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="you@example.com"
              />
            </div>
            {errors.email_address && touched.email_address && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.email_address}
              </p>
            )}
          </div>

          {/* role Field */}
          <div className="space-y-1">
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700"
            >
              Role
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-gray-400" />
              </div>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`block w-full pl-10 pr-3 py-2 border ${
                  errors.role ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="you@example.com"
              >
                <option value="" disabled>
                  Select
                </option>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>
            {errors.role && touched.role && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.role}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                autoComplete="new-password"
                onChange={handleChange}
                onBlur={handleBlur}
                className={`block w-full pl-10 pr-3 py-2 border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="••••••••"
              />
            </div>
            {errors.password && touched.password && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-1">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                autoComplete="new-password"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`block w-full pl-10 pr-3 py-2 border ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="••••••••"
              />
            </div>
            {errors.confirmPassword && touched.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600  hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Account
            <ChevronRight size={18} className="ml-1" />
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to={"/login"}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
