import React, { useState, useRef, useEffect } from "react";
import { Menu, X, User, LogOut } from "lucide-react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import useLogout from "../utils/useLogout";

// Simplified version that works without react-router-dom and redux
function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const userDetails = useSelector((state) => state.userDetails);
  const logout = useLogout();
  const [isLoggedIn, setIsLoggedIn] = useState(true); // For demonstration - toggle between logged in/out
  const dropdownRef = useRef(null);
  // Close dropdown when clicking outside

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    // Add your logout logic here
    console.log("Logging out");
    setIsLoggedIn(false);
    setIsProfileDropdownOpen(false);
    logout();
  };

  const handleLogin = () => {
    // For demonstration purposes
    setIsLoggedIn(true);
  };

  const handleProfileClick = () => {
    console.log("Navigate to profile");
    setIsProfileDropdownOpen(false);
  };

  const handleSignupClick = () => {
    console.log("Navigate to signup");
  };

  return (
    <nav className="bg-white py-4 px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center">
        <h1 className="text-green-700 font-bold text-xl">HealingHavens</h1>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex space-x-6">
        <Link className="text-gray-800 hover:text-green-600">Home</Link>
        <Link className="text-gray-800 hover:text-green-600" to={"/services"}>Services</Link>
        <Link to={userDetails.id ? "/user_view_psychologist" : "/therapists"} className="text-gray-800 hover:text-green-600">Therapists</Link>
        <Link className="text-gray-800 hover:text-green-600" to={"/aboutus"}>About Us</Link>
        <Link className="text-gray-800 hover:text-green-600" to={"/contactus"}>Contact</Link>
      </div>

      {/* User Profile Icon or Sign Up Icon */}
      <div className="relative" ref={dropdownRef}>
        {isLoggedIn ? (
          <>
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 hover:bg-green-200 text-green-700"
            >
              <User size={20} />
            </button>

            {/* Profile Dropdown */}
            {isProfileDropdownOpen &&
              (userDetails.id ? (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <Link
                    to={"/user_profile"}
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={handleProfileClick}
                  >
                    <User size={16} className="mr-2" />
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <Link
                    to={"/login"}
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <User size={16} className="mr-2" />
                    Sign In
                  </Link>
                </div>
              ))}
          </>
        ) : (
          <Link
            onClick={handleSignupClick}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 hover:bg-green-200 text-green-700"
          >
            <User size={20} />
          </Link>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-gray-700 ml-4"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white shadow-md z-40 md:hidden">
          <div className="flex flex-col p-4 space-y-3">
            <Link className="text-gray-800 hover:text-green-600 py-2">
              Home
            </Link>
            <Link
              className="text-gray-800 hover:text-green-600 py-2"
              to={"/services"}
            >
              Services
            </Link>
            <Link
              className="text-gray-800 hover:text-green-600 py-2"
              to={userDetails.id ? "/user_view_psychologist" : "/therapists"}
            >
              Therapists
            </Link>
            <Link
              to={"/aboutus"}
              className="text-gray-800 hover:text-green-600 py-2"
            >
              About Us
            </Link>
            <Link
              className="text-gray-800 hover:text-green-600 py-2"
              to={"/contactus"}
            >
              Contact
            </Link>
            {isLoggedIn ? (
              <div className="flex flex-col space-y-2 pt-2 border-t border-gray-200">
                <Link
                  to={"/user_profile"}
                  className="flex items-center text-gray-800 hover:text-green-600 py-2"
                  onClick={() => {
                    handleProfileClick();
                    setIsMenuOpen(false);
                  }}
                >
                  <User size={16} className="mr-2" />
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center  bg-amber-800 text-gray-800 hover:text-green-600 py-2"
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                className="flex items-center text-gray-800 hover:text-green-600 py-2"
                onClick={() => {
                  handleSignupClick();
                  setIsMenuOpen(false);
                }}
              >
                <User size={16} className="mr-2" />
                Sign Up
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
