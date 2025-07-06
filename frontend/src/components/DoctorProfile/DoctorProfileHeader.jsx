import React, { useState } from "react";
import { Camera } from "lucide-react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import ProfileImageUploadModal from "../../components/ProfileImageUploadModal";
import axiosInstance from "../../axiosconfig";
import { useSelector } from "react-redux";

const DoctorProfileHeader = ({
  formData,
  isAvailable,
  setIsAvailable,
  isLoading,
  setIsLoading,
  fetchDoctor,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const userId = useSelector((state)=>state.userDetails.id)
  const updateDoctorProfileImage = () => {
    setIsOpen(true);
  };

  const handleUpload = async (file) => {
    if (!file) return;
    const profileFormData = new FormData();
    profileFormData.append("profile_image", file);

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
      toast.success("Profile image updated successfully!", {
        position: "bottom-center",
      });
    } catch (error) {
      toast.error("Upload failed. Please try again.", {
        position: "bottom-center",
      });
    } finally {
      fetchDoctor();
    }
  };

  const toggleAvailability = async () => {
    setIsLoading(true);
    try {
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

      if (response.data.status) {
        await Swal.fire({
          title: "You're now available!",
          text: "Patients can now contact you for consultations.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      toast.error(`Error updating availability:`, {
        position: "bottom-center",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-8">
      <div className="flex items-start space-x-6">
        <div className="relative">
          <img
            src={formData.profile_image}
            className="w-24 h-24 bg-gradient-to-br from-green-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold"
            alt="Profile"
          />
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

      {isOpen && (
        <ProfileImageUploadModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onUpload={handleUpload}
        />
      )}
    </div>
  );
};

export default DoctorProfileHeader;