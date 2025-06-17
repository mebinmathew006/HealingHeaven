import React, { useEffect, useState } from "react";
import {
  Edit3,
  Save,
  Phone,
  Calendar,
  User,
  Mail,
  Award,
  Briefcase,
  DollarSign,
  FileText,
  Eye,
  Camera,
} from "lucide-react";
import { useSelector } from "react-redux";
import axiosInstance from "../../axiosconfig";
import DoctorVerification from "./DoctorVerification";
import DoctorPendingPage from "./DoctorPendingPage";
import { toast } from "react-toastify";
import ProfileImageUploadModal from "../../components/ProfileImageUploadModal";
import Swal from 'sweetalert2';
import { useNavigate } from "react-router-dom";
import DoctorSidebar from "../../components/DoctorSidebar";

const DoctorProfile = () => {
  const [activeSection, setActiveSection] = useState("user_profile");
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const userId = useSelector((state) => state.userDetails.id);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate()
  useEffect(() => {
    fetchDoctor();
  }, []);
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };
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
      // here need a confirmation
    const result = await Swal.fire({
    title: "Go Available?",
    text: "Patients may start contacting you once you're available.",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes, go available",
    cancelButtonText: "Cancel",
  });

  if (!result.isConfirmed) return;

      const response = await axiosInstance.patch(
        `/users/update_availability/${userId}/${!isAvailable}`
      );
      setIsAvailable(response.data.status);
      
      if (response.data.status==true){
        await Swal.fire({
              title: "You're now available!",
              text: "Patients can now contact you for consultations.",
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
              customClass: {
                popup: 'rounded-2xl shadow-2xl',
                title: 'text-xl font-semibold text-gray-900',
                htmlContainer: 'text-gray-600',
                icon: 'border-4 border-green-100 text-green-500'
              },
              buttonsStyling: false,
              background: '#ffffff',
            });
       navigate('/doctor_video_call')
      //  navigate('/doctor_waiting_area')

      }
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
      setIsEditing(false);
      fetchDoctor()

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
      <DoctorSidebar activeSection={activeSection} />
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
                            ? "Stop Consultation"
                            : "Start Consultation"}
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
              <>
                {/* Personal Information Section */}
                <div className="bg-white rounded-xl shadow-sm p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900">
                      Personal Information
                    </h2>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="user.name"
                          value={formData.user.name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <div className="flex items-center space-x-2 text-gray-900">
                          <User className="w-4 h-4 text-gray-400" />
                          <span>{formData.user.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          name="user.mobile_number"
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

                    {/* Gender */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                      </label>
                      {isEditing ? (
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      ) : (
                        <div className="flex items-center space-x-2 text-gray-900">
                          <span className="capitalize">{formData.gender}</span>
                        </div>
                      )}
                    </div>

                    {/* Date of Birth */}
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
                          <span>{formatDate(formData.date_of_birth)}</span>
                        </div>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>

                      <div className="flex items-center space-x-2 text-gray-900">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{formData.user.email_address}</span>
                      </div>
                    </div>

                    {/* Role */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role
                      </label>
                      <div className="flex items-center space-x-2 text-gray-900">
                        <span className="capitalize bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                          {formData.user.role}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Information Section */}
                <div className="bg-white rounded-xl shadow-sm p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    Professional Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Qualification */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Qualification
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="qualification"
                          value={formData.qualification}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <div className="flex items-center space-x-2 text-gray-900">
                          <Award className="w-4 h-4 text-gray-400" />
                          <span>{formData.qualification}</span>
                        </div>
                      )}
                    </div>

                    {/* Specialization */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specialization
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="specialization"
                          value={formData.specialization}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <div className="flex items-center space-x-2 text-gray-900">
                          <Briefcase className="w-4 h-4 text-gray-400" />
                          <span>{formData.specialization}</span>
                        </div>
                      )}
                    </div>

                    {/* Experience */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Experience
                      </label>
                      {isEditing ? (
                        <textarea
                          name="experience"
                          value={formData.experience}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <div className="flex items-start space-x-2 text-gray-900">
                          <Briefcase className="w-4 h-4 text-gray-400 mt-1" />
                          <span>{formData.experience}</span>
                        </div>
                      )}
                    </div>

                    {/* Consultation Fees */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Consultation Fees (₹)
                      </label>
                      {isEditing ? (
                        <input
                          type="number"
                          name="fees"
                          value={formData.fees}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <div className="flex items-center space-x-2 text-gray-900">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span>₹{formData.fees}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* About Me */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      About Me
                    </label>
                    {isEditing ? (
                      <textarea
                        name="about_me"
                        value={formData.about_me}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Tell us about yourself..."
                      />
                    ) : (
                      <div className="flex items-start space-x-2 text-gray-900">
                        <FileText className="w-4 h-4 text-gray-400 mt-1" />
                        <span>
                          {formData.about_me || "No description provided"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status & Availability Section */}
                <div className="bg-white rounded-xl shadow-sm p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    Status & Availability
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Verification Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Verification Status
                      </label>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            formData.is_verified
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {formData.is_verified ? "Verified" : "Not Verified"}
                        </span>
                      </div>
                    </div>

                    {/* Availability */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Availability
                      </label>

                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            formData.is_available
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-500 text-black-800"
                          }`}
                        >
                          {formData.is_available ? "Available" : "Unavailable"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents Section */}
                <div className="bg-white rounded-xl shadow-sm p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    Documents & Certificates
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Identification Document */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Identification Document
                      </label>
                      <div className="space-y-2">
                        {formData.identification_doc && (
                          <a
                            href={formData.identification_doc}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View Document</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Education Certificate */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Education Certificate
                      </label>
                      <div className="space-y-2">
                        {formData.education_certificate && (
                          <a
                            href={formData.education_certificate}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View Certificate</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Experience Certificate */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Experience Certificate
                      </label>
                      <div className="space-y-2">
                        {formData.experience_certificate && (
                          <a
                            href={formData.experience_certificate}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View Certificate</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                {isEditing && (
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No user data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
