import React, { useEffect, useState } from "react";
import { Camera, Save, Edit3, Phone, Calendar,Briefcase } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { useSelector } from "react-redux";
import axiosInstance from "../../axiosconfig";
import DoctorVerification from "./DoctorVerification";
import DoctorPendingPage from "./DoctorPendingPage";
import { toast } from "react-toastify";
import ProfileImageUploadModal from "../../components/ProfileImageUploadModal";

const DoctorProfile = () => {
  const [activeSection, setActiveSection] = useState("user_profile");
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingProfession, setIsEditingProfession] = useState(false);
  const userId = useSelector((state) => state.userDetails.id);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchDoctor();
  }, []);

  const updateDoctorProfileImage = async () => {
    try {
      setIsOpen(true);
    } catch (error) {}
  };

  const fetchDoctor = async () => {
    try {
      const response = await axiosInstance.get(
        `/users/get_psycholgist_details/${userId}`
      );

      setIsAvailable(response.data.is_available);
      console.log(response.data);

      setFormData(response.data);
    } catch (error) {
      setFormData({});
    }
  };

  const handleUpload = async (file) => {
    if (!file) return;

    // setIsUploading(true);
    const profileFormData = new FormData();
    profileFormData.append("profile_image", file);

    // upload process
    try {
      await axiosInstance.patch(
        `users/update_psychologist_profile_image/${userId}`,
        profileFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Update profile image
      // setCurrentProfileImage(previewUrl);
      toast.success("Profile image updated successfully!", {
        position: "bottom-center",
      });
    } catch (error) {
      toast.error("Upload failed. Please try again.", {
        position: "bottom-center",
      });
    } finally {
      // setIsUploading(false);
      fetchDoctor();
    }
  };

  const toggleAvailability = async () => {
    setIsLoading(true);
    const newStatus = !isAvailable;

    try {
      // Make API request
      const response = await axiosInstance.patch(
        `/users/update_availability/${userId}`
      );
      setIsAvailable(response.data.status);
    } catch (error) {
      toast.error(`Error updating availability:`, {
        position: "bottom-center",
      });
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
    return <DoctorVerification doctorDetails={formData} />;
  }

  if (formData.is_verified === false) {
    return <DoctorPendingPage />;
  }

  if (isOpen) {
    return (
      <>
        <button onClick={() => setIsOpen(true)}>Change Profile Picture</button>
        <ProfileImageUploadModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onUpload={handleUpload}
        />
      </>
    );
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
                    <button
                      className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50"
                      onClick={updateDoctorProfileImage}
                    >
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
                <div className="flex justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Personal Information
                </h2> 

                  <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="flex items-center space-x-2 px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
                      </button>
                </div>
                
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


{/* Professional Details */}
            <div className="bg-white rounded-xl shadow-sm p-8">
             <div className="flex justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Professional Details
                </h2> 
                  <button
                        onClick={() => setIsEditingProfession(!isEditingProfession)}
                        className="flex items-center space-x-2 px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>{isEditingProfession ? "Cancel" : "Edit Details"}</span>
                      </button>
                </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title
                  </label>
                  {isEditingProfession ? (
                    <input
                      type="text"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center space-x-2 text-gray-900">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <span>{formData.jobTitle}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center space-x-2 text-gray-900">
                      <span>{formData.company}</span>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  {isEditingProfession ? (
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="text-gray-900">
                      <a
                        href={formData.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {formData.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
