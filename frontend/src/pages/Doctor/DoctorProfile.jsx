import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import DoctorVerification from "./DoctorVerification";
import DoctorPendingPage from "./DoctorPendingPage";
import DoctorSidebar from "../../components/DoctorSidebar";
import DoctorProfileHeader from "../../components/DoctorProfile/DoctorProfileHeader";
import PersonalInfoSection from "../../components/DoctorProfile/PersonalInfoSection";
import ProfessionalInfoSection from "../../components/DoctorProfile/ProfessionalInfoSection";
import StatusAvailabilitySection from "../../components/DoctorProfile/StatusAvailabilitySection";
import DocumentsSection from "../../components/DoctorProfile/DocumentsSection";
import { toast } from "react-toastify";
import {
  getPsycholgistDetailsRoute,
  updatePsychologistDetailsRoute,
  updatePsychologistDocumentsRoute,
} from "../../services/userService";

const DoctorProfile = () => {
  const [activeSection] = useState("doctor_home_page");
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const userId = useSelector((state) => state.userDetails.id);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    fetchDoctor();
  }, []);
  const fetchDoctor = async () => {
    try {
      const response = await getPsycholgistDetailsRoute(userId);
      setIsAvailable(response.is_available);
      setFormData(response);
    } catch (error) {
      setFormData({});
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (["name", "mobile_number", "email_address", "role"].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          [name]: value,
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
      await updatePsychologistDetailsRoute(userId, formData);
      setIsEditing(false);
      fetchDoctor();
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };
  const [files, setFiles] = useState({
    id: null,
    educationalCertificate: null,
    experienceCertificate: null,
  });

  const handleFileChange = (fileType, file) => {
    setFiles((prev) => ({
      ...prev,
      [fileType]: file,
    }));
  };

  const handleFileUpload = async (fileType, file) => {
    const formData = new FormData();
    formData.append(fileType, file);

    try {
      await updatePsychologistDocumentsRoute(userId, formData);
      toast.success(`${fileType.replace(/_/g, " ")} updated successfully!`, {
        position: "bottom-center",
      });
      fetchDoctor(); // Refresh data
    } catch (error) {
      toast.error(`Error uploading ${fileType.replace(/_/g, " ")}`, {
        position: "bottom-center",
      });
      throw error; // Re-throw to handle in DocumentsSection
    }
  };

  if (formData.is_verified === "pending") {
    return <DoctorPendingPage fetchDoctor={fetchDoctor} />;
  }

  if (formData.is_verified === "blocked") {
    return <DoctorVerification fetchDoctor={fetchDoctor} data={formData} />;
  }

  if (!formData.date_of_birth) {
    return <DoctorVerification fetchDoctor={fetchDoctor} />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div>
        <DoctorSidebar activeSection={activeSection} />
      </div>
      <div className="flex-1 bg-gray-50 overflow-auto">
        <div className="max-w-4xl mx-auto p-6">
          <div className="space-y-8">
            <DoctorProfileHeader
              formData={formData}
              isAvailable={isAvailable}
              setIsAvailable={setIsAvailable}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              fetchDoctor={fetchDoctor}
            />

            {formData.user ? (
              <>
                <PersonalInfoSection
                  formData={formData}
                  isEditing={isEditing}
                  setIsEditing={setIsEditing}
                  handleInputChange={handleInputChange}
                />

                <ProfessionalInfoSection
                  formData={formData}
                  isEditing={isEditing}
                  handleInputChange={handleInputChange}
                />

                <StatusAvailabilitySection formData={formData} />

                <DocumentsSection
                  formData={formData}
                  onFileUpload={handleFileUpload}
                  isEditing={isEditing}
                />

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
