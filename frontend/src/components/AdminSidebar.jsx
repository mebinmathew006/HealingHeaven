import React from "react";
import { User,Home, Hospital, Bell, LogOut, Video } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { destroyDetails } from "../store/UserDetailsSlice";

const AdminSidebar = ({ activeSection, onSectionChange }) => {
  const userDetails = useSelector((state) => state.userDetails);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(destroyDetails());
    navigate("/login"); 
  };
  const menuItems = [
    { id: "profile", label: "Dashboard", icon: Home, path: "/admin_home_page" },
    { id: "account", label: "Users", icon: User, path: "/admin_user_page" },
    { id: "consultation", label: "Consultation", icon: Video, path: "/admin_consultation_page" },
    { id: "psychologists",label: "Psychologists",icon: Hospital,path: "/admin_psychologists_page"},
    { id: "notifications",label: "Notification",icon: Bell,path: "/admin_notification_page"},
  ];

  const handleNavigation = (item) => {
   
    navigate(item.path); // route to the new page
  };

  return (
    <div className="w-64 bg-white shadow-cyan-50 h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{userDetails.name}</h2>
            <p className="text-sm text-gray-500">{userDetails.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeSection === item.id
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors" onClick={handleLogout}>
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
