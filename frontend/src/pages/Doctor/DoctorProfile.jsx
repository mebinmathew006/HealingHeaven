import React, { useEffect, useState } from "react";
import { Camera, Save, Edit3, Phone, Calendar } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { useSelector } from "react-redux";
import axiosInstance from "../../axiosconfig";
import DoctorVerification from "./DoctorVerification";
import DoctorPendingPage from "./DoctorPendingPage";
import { toast } from "react-toastify";

const DoctorProfile = () => {
  const [activeSection, setActiveSection] = useState("user_profile");
  const [userStatus, setUserStatus] = useState(false);
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const userId = useSelector((state) => state.userDetails.id);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchdoctor();
  }, []);

  const fetchdoctor = async () => {
    try {
      
      const response = await axiosInstance.get(
        `/users/get_psycholgist_details/${userId}`
      );
      console.log('ddddddddddddddddd',response.data);

      setUserStatus(response.data);
      setFormData(response.data);
    } catch (error) {
      setFormData({}); 
    }
  };

  const toggleAvailability = async () => {
    setIsLoading(true);
    const newStatus = !isAvailable;

    try {
      // Make API request
      const response = await axiosInstance.patch(`/users/update_availability/${userId}`)
      setIsAvailable(response.data.status);
    } catch (error) {
      toast.error(`Error updating availability:`,{position:"bottom-center"});
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // If the field is part of the nested `user` object
    if (["name", "mobile_number", "email_address", "role"].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          [name]: value,
        },
      }));
    } else {
      // For top-level fields like gender, date_of_birth
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSave = async () => {
    console.log('ddddddddddddddddddddddddddddddddddddddddddddddd',formData);
    
    try {
      const response = await axiosInstance.put(
        `/users/update_psychologist_details/${userId}`,
        formData
      );
      console.log("Saving profile data:", formData);
      setIsEditing(false);
    } catch (error) {}
  };
if (!formData.date_of_birth) {
  // No doctor data returned
  return <DoctorVerification doctorDetails={formData} />;
}

if (formData.is_verified === false) {
  return <DoctorPendingPage />;
}
  

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeSection={activeSection} />
      <div className="flex-1 bg-gray-50 overflow-auto">
        <div className="max-w-4xl mx-auto p-6">
          <div className="space-y-8">
            {/* Profile Header */}
            {formData.user ? (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <div className="flex items-start space-x-6">
                  <div className="relative">
                    <div>
                      <img
                        src={formData.profile_image}
                        className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                        alt="Image"
                      />
                    </div>
                    <button className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50">
                      <Camera className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={toggleAvailability}
                          disabled={isLoading}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                            isAvailable
                              ? "bg-green-600 focus:ring-green-500"
                              : "bg-gray-300 focus:ring-gray-500"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                              isAvailable ? "translate-x-6" : "translate-x-1"
                            }`}
                          >
                            {isLoading && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-2 h-2 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                              </div>
                            )}
                          </span>
                        </button>

                        <span
                          className={`text-sm font-medium ${
                            isAvailable ? "text-green-600" : "text-gray-500"
                          }`}
                        >
                          {isLoading
                            ? "Updating..."
                            : isAvailable
                            ? "Available"
                            : "Not Available"}
                        </span>
                      </div>
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}

            {/* Profile Details */}
            {formData.user ? (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.user.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 text-gray-900">
                        <span>{formData.user.name}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 text-gray-900">
                        <span>{formData.gender}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="mobile_number"
                        value={formData.user.mobile_number}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 text-gray-900">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{formData.user.mobile_number}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 text-gray-900">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>
                          {new Date(
                            formData.date_of_birth
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
