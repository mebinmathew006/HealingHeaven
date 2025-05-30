import React, { useState } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "../../axiosconfig";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import DoctorProfile from "./DoctorProfile";

export default function DoctorVerification() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
  dateOfBirth: "",
  experience: "",
  gender: "",
  fees: "",
  qualification: "",
  specialization: "",
  aboutMe: "",
});

  const userId = useSelector((state)=>state.userDetails.id)
  const [files, setFiles] = useState({
    id: null,
    educationalCertificate: null,
    experienceCertificate: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = (fileType) => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".jpg,.jpeg,.png";
  input.onchange = (e) => {
    const file = e.target.files[0];
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

    if (file) {
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only JPG, JPEG, and PNG files are allowed.", { position: "bottom-center" });
        return;
      }

      setFiles((prev) => ({
        ...prev,
        [fileType]: file,
      }));
    }
  };
  input.click();
};


  const handleSubmit = async (e) => {
  e.preventDefault();

  // Basic validation
  const requiredFields = [
    "dateOfBirth",
    "experience",
    "gender",
    "fees",
    "qualification",
    "specialization",
    "aboutMe",
  ];

  for (const field of requiredFields) {
    if (!formData[field]) {
      toast.error(`Please fill the ${field} field.`, { position: "bottom-center" });
      return;
    }
  }

  // File validations
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  for (const [key, file] of Object.entries(files)) {
    if (!file) {
      toast.error(`Please upload the ${key} file.`, { position: "bottom-center" });
      return;
    }
    if (!allowedTypes.includes(file.type)) {
      toast.error(`Invalid file type for ${key}. Please upload a JPG or PNG image.`, {
        position: "bottom-center",
      });
      return;
    }
  }

  const formPayload = new FormData();
  for (const key in formData) {
    formPayload.append(key, formData[key]);
  }

  formPayload.append("id", files.id);
  formPayload.append("educationalCertificate", files.educationalCertificate);
  formPayload.append("experienceCertificate", files.experienceCertificate);

  try {
    const response = await axiosInstance.post(
      `users/doctor_verification/${userId}`,
      formPayload,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    toast.success("Form submitted successfully!", { position: "bottom-center" });
    navigate("/doctor_home_page", { state: { forceRefresh: true } }); // Redirect to profile
  } catch (error) {
    console.log(error);
    
    toast.error("Failed to submit form.", { position: "bottom-center" });
  }
};



  return (
    <div className="max-w-2xl mx-auto p-6 bg-white">
      <h1 className="text-2xl font-bold text-gray-800 mb-8 text-center">
        Submit the Details to get Verified and Listed
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name and Email Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-200 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experience
            </label>
            <input
              type="text"
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-200 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Years of experience"
            />
          </div>
        </div>

        {/* Gender and Fees Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-200 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fees
            </label>
            <input
              type="text"
              name="fees"
              value={formData.fees}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-200 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter consultation fees"
            />
          </div>
        </div>

        {/* Qualification and Experience Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Qualification
            </label>
            <input
              type="text"
              name="qualification"
              value={formData.qualification}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-200 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your qualification"
            />
          </div>
        </div>

        {/* Specialization */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Specialization
          </label>
          <input
            type="text"
            name="specialization"
            value={formData.specialization}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-gray-200 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your specialization"
          />
        </div>

        {/* About Me */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            About Me
          </label>
          <textarea
            name="aboutMe"
            value={formData.aboutMe}
            onChange={handleInputChange}
            rows="4"
            className="w-full px-4 py-3 bg-gray-200 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Tell us about yourself..."
          />
        </div>

        {/* File Upload Sections */}
        <div className="space-y-4 text-red-700">
          <p>Only Add .jpg,.jpeg,.png these type files</p>
          {/* Upload ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload ID
            </label>
            <div className="flex items-center justify-between bg-gray-200 rounded-lg px-4 py-3">
              <span className="text-gray-600 text-sm">
                {files.id ? files.id.name : "No file selected"}
              </span>
              <button
                type="button"
                onClick={() => handleFileUpload("id")}
                className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors"
              >
                Add file
              </button>
            </div>
          </div>

          {/* Upload Educational Certificate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Educational Certificate
            </label>
            <div className="flex items-center justify-between bg-gray-200 rounded-lg px-4 py-3">
              <span className="text-gray-600 text-sm">
                {files.educationalCertificate
                  ? files.educationalCertificate.name
                  : "No file selected"}
              </span>
              <button
                type="button"
                onClick={() => handleFileUpload("educationalCertificate")}
                className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors"
              >
                Add file
              </button>
            </div>
          </div>

          {/* Upload Experience Certificate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Experience Certificate
            </label>
            <div className="flex items-center justify-between bg-gray-200 rounded-lg px-4 py-3">
              <span className="text-gray-600 text-sm">
                {files.experienceCertificate
                  ? files.experienceCertificate.name
                  : "No file selected"}
              </span>
              <button
                type="button"
                onClick={() => handleFileUpload("experienceCertificate")}
                className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors"
              >
                Add file
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-6">
          <button
            type="submit"
            className="bg-black text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
