import React, { useEffect, useRef, useState } from "react";
import { Camera, Save, Edit3, Phone, Calendar } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { useSelector } from "react-redux";
import axiosInstance from "../../axiosconfig";
import { Upload, X, User, Check, RotateCw } from "lucide-react";
import { toast } from "react-toastify";
import ProfileImageUploadModal from "../../components/ProfileImageUploadModal";
const UserProfile = () => {
  const [activeSection, setActiveSection] = useState("user_profile");
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const userId = useSelector((state) => state.userDetails.id);
  const [isOpen, setIsOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const fetchUser = async () => {
    try {
      const response = await axiosInstance.get(
        `/users/get_user_details/${userId}`
      );
      setFormData(response.data);
      setCurrentProfileImage(response.data.profile_image);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchUser();
  }, [userId]);

  const handleUpload = async (file) => {
    if (!file) return;

    // setIsUploading(true);
    const profileFormData = new FormData();
    profileFormData.append("profile_image", file);

    // upload process
    try {
      await axiosInstance.patch(
        `users/update_user_profile_image/${userId}`,
        profileFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Update profile image
      setCurrentProfileImage(previewUrl);
      toast.success("Profile image updated successfully!", {
        position: "bottom-center",
      });
    } catch (error) {
      toast.error("Upload failed. Please try again.", {
        position: "bottom-center",
      });
    } finally {
      // setIsUploading(false);
      fetchUser();
    }
  };

  const updateUserProfileImage = async () => {
    try {
      setIsOpen(true);
    } catch (error) {}
  };

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (["gender", "date_of_birth", "profile_image"].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        user_profile: {
          gender: name === "gender" ? value : prev.user_profile?.gender || "",
          date_of_birth:
            name === "date_of_birth"
              ? value
              : prev.user_profile?.date_of_birth || null,
          profile_image:
            name === "profile_image"
              ? value
              : prev.user_profile?.profile_image || null,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSave = async () => {
    try {
      console.log("Saving profile data:", formData);

      const response = await axiosInstance.put(
        `/users/update_user_details/${userId}`,
        formData
      );
      setIsEditing(false);
    } catch (error) {}
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div>
        <Sidebar activeSection={activeSection} />
      </div>
      <div className="flex-1 bg-gray-50 overflow-auto">
        <div className=" mx-auto p-6">
          <div className="space-y-8">
            {/* Profile Header */}
            {formData ? (
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-sm p-8">
                <div className="flex items-start space-x-6">
                  <div className="relative">
                    <div>
                      <img
                        src={
                          formData?.user_profile?.profile_image ||
                          "/powerpoint-template-icons-b.jpg"
                        }
                        className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                        alt="Image"
                      />
                    </div>
                    <button
                      title="Update Image"
                      className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50"
                      onClick={updateUserProfileImage}
                    >
                      <Camera className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div> </div>
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
            {formData ? (
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
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 text-gray-900">
                        <span>{formData.name}</span>
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
                        value={
                          formData.user_profile
                            ? formData.user_profile.gender
                            : ""
                        }
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 text-gray-900">
                        <span>
                          {formData.user_profile
                            ? formData.user_profile.gender
                            : " "}
                        </span>
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
                        value={formData.mobile_number}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 text-gray-900">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{formData.mobile_number}</span>
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
                        value={
                          formData.user_profile
                            ? formData.user_profile.date_of_birth
                            : ""
                        }
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 text-gray-900">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>
                          {new Date(
                            formData.user_profile
                              ? formData.user_profile.date_of_birth
                              : " "
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

export default UserProfile;
