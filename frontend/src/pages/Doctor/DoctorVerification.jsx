import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "../../axiosconfig";
import { toast } from "react-toastify";
import { Loader, LogOut, X, XCircle } from "lucide-react";
import useLogout from "../../utils/useLogout";


export default function DoctorVerification({ fetchDoctor, data }) {
  const [loading, setLoading] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [viewingDocument, setViewingDocument] = useState(null);
  const logout = useLogout();
  const [formData, setFormData] = useState({
    date_of_birth: "",
    experience: "",
    gender: "",
    fees: "",
    qualification: "",
    specialization: "",
    about_me: "",
    education_certificate: "",
    experience_certificate: "",
    identification_doc: "",
  });

  const userId = useSelector((state) => state.userDetails.id);
  const [files, setFiles] = useState({
    id: null,
    educationalCertificate: null,
    experienceCertificate: null,
  });

  const [errors, setErrors] = useState({});

  // Initialize form data when component mounts or data changes
  useEffect(() => {
    if (data) {
      setIsUpdateMode(true);
      setFormData({
        date_of_birth: data.date_of_birth || "",
        experience: data.experience || "",
        gender: data.gender || "",
        fees: data.fees || "",
        qualification: data.qualification || "",
        specialization: data.specialization || "",
        about_me: data.about_me || "",
        education_certificate: data.education_certificate || "",
        experience_certificate: data.experience_certificate || "",
        identification_doc: data.identification_doc || "",
        reason_block: data.reason_block || "",
      });
    } else {
      setIsUpdateMode(false);
      setFormData({
        date_of_birth: "",
        experience: "",
        gender: "",
        fees: "",
        qualification: "",
        specialization: "",
        about_me: "",
        education_certificate: "",
        experience_certificate: "",
        identification_doc: "",
        reason_block: "",
      });
    }
  }, [data]);

  // Validation functions
  const validatedate_of_birth = (date) => {
    if (!date) return "Date of birth is required";

    const birthDate = new Date(date);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    if (birthDate > today) {
      return "Date of birth cannot be in the future";
    }

    if (age < 22) {
      return "Doctor must be at least 22 years old";
    }

    if (age > 100) {
      return "Please enter a valid date of birth";
    }

    return null;
  };

  const validateExperience = (experience) => {
    if (!experience) return "Experience is required";

    const expNum = parseInt(experience);
    if (isNaN(expNum) || expNum < 0) {
      return "Experience must be a positive number";
    }

    if (expNum > 70) {
      return "Please enter a valid experience";
    }

    return null;
  };

  const validateFees = (fees) => {
    if (!fees) return "Consultation fees is required";

    const feesNum = parseFloat(fees);
    if (isNaN(feesNum) || feesNum <= 0) {
      return "Fees must be a positive number";
    }

    if (feesNum > 100000) {
      return "Please enter a reasonable consultation fee";
    }

    return null;
  };

  const validateText = (value, fieldName, minLength = 2, maxLength = 100) => {
    if (!value || value.trim() === "") {
      return `${fieldName} is required`;
    }

    if (value.trim().length < minLength) {
      return `${fieldName} must be at least ${minLength} characters`;
    }

    if (value.trim().length > maxLength) {
      return `${fieldName} must be less than ${maxLength} characters`;
    }

    // Check for valid characters (letters, spaces, and common punctuation)
    const validPattern = /^[a-zA-Z\s\-.,()]+$/;
    if (!validPattern.test(value.trim())) {
      return `${fieldName} contains invalid characters`;
    }

    return null;
  };

  const validateabout_me = (about_me) => {
    if (!about_me || about_me.trim() === "") {
      return "About Me is required";
    }

    if (about_me.trim().length < 10) {
      return "About Me must be at least 10 characters";
    }

    if (about_me.trim().length > 500) {
      return "About Me must be less than 500 characters";
    }

    return null;
  };

  const validateField = (name, value) => {
    let error = null;

    switch (name) {
      case "date_of_birth":
        error = validatedate_of_birth(value);
        break;
      case "experience":
        error = validateExperience(value);
        break;
      case "gender":
        error = !value ? "Gender is required" : null;
        break;
      case "fees":
        error = validateFees(value);
        break;
      case "qualification":
        error = validateText(value, "Qualification", 2, 100);
        break;
      case "specialization":
        error = validateText(value, "Specialization", 2, 100);
        break;
      case "about_me":
        error = validateabout_me(value);
        break;
      default:
        break;
    }

    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Update form data
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }

    // Real-time validation
    const error = validateField(name, value);
    if (error) {
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleFileUpload = (fileType) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".jpg,.jpeg,.png";
    input.onchange = (e) => {
      const file = e.target.files[0];
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (file) {
        if (!allowedTypes.includes(file.type)) {
          toast.error("Only JPG, JPEG, and PNG files are allowed.", {
            position: "bottom-center",
          });
          return;
        }

        if (file.size > maxSize) {
          toast.error("File size must be less than 5MB.", {
            position: "bottom-center",
          });
          return;
        }

        setFiles((prev) => ({
          ...prev,
          [fileType]: file,
        }));

        // Clear file error if it exists
        if (errors[fileType]) {
          setErrors((prev) => ({
            ...prev,
            [fileType]: null,
          }));
        }
      }
    };
    input.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate all fields
    const newErrors = {};

    // Validate form fields
    Object.keys(formData).forEach((field) => {
      // Skip file URL validation for form fields
      if (!field.includes("_certificate") && field !== "identification_doc") {
        const error = validateField(field, formData[field]);
        if (error) {
          newErrors[field] = error;
        }
      }
    });

    // Validate files only if not in update mode or if new files are being uploaded
    if (!isUpdateMode) {
      // For new entries, all files are required
      const requiredFiles = [
        "id",
        "educationalCertificate",
        "experienceCertificate",
      ];
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

      requiredFiles.forEach((fileType) => {
        if (!files[fileType]) {
          newErrors[fileType] = `${fileType
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()} is required`;
        } else if (!allowedTypes.includes(files[fileType].type)) {
          newErrors[
            fileType
          ] = `Invalid file type. Please upload a JPG or PNG image.`;
        }
      });
    } else {
      // For updates, validate only if new files are uploaded
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      Object.keys(files).forEach((fileType) => {
        if (files[fileType] && !allowedTypes.includes(files[fileType].type)) {
          newErrors[
            fileType
          ] = `Invalid file type. Please upload a JPG or PNG image.`;
        }
      });
    }

    // If there are errors, show them and return
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fix the errors in the form.", {
        position: "bottom-center",
      });
      setLoading(false);
      return;
    }

    // Create form payload
    const formPayload = new FormData();

    // Add form data
    for (const key in formData) {
      // Skip file URLs when creating FormData
      if (!key.includes("_certificate") && key !== "identification_doc") {
        formPayload.append(key, formData[key]);
      }
    }

    // Add files only if they exist (new files uploaded)
    if (files.id) {
      formPayload.append("id", files.id);
    }
    if (files.educationalCertificate) {
      formPayload.append(
        "educationalCertificate",
        files.educationalCertificate
      );
    }
    if (files.experienceCertificate) {
      formPayload.append("experienceCertificate", files.experienceCertificate);
    }

    try {
      let response;
      if (isUpdateMode) {
        // Update existing doctor data
        response = await axiosInstance.put(
          `users/doctor_verification_update/${userId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        // Create new doctor data
        response = await axiosInstance.post(
          `users/doctor_verification/${userId}`,
          formPayload,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      toast.success(
        isUpdateMode
          ? "Doctor data updated successfully!"
          : "Doctor verification submitted successfully!",
        {
          position: "bottom-center",
        }
      );

      if (fetchDoctor) {
        fetchDoctor();
      }
    } catch (error) {
      console.log(error);
      toast.error(
        isUpdateMode
          ? "Failed to update doctor data."
          : "Failed to submit form.",
        { position: "bottom-center" }
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get file display name
  const getFileDisplayName = (fileType) => {
    if (files[fileType]) {
      return files[fileType].name;
    }

    // Show existing file info in update mode
    if (isUpdateMode) {
      switch (fileType) {
        case "id":
          return formData.identification_doc
            ? "Current ID Document"
            : "No file selected";
        case "educationalCertificate":
          return formData.education_certificate
            ? "Current Education Certificate"
            : "No file selected";
        case "experienceCertificate":
          return formData.experience_certificate
            ? "Current Experience Certificate"
            : "No file selected";
        default:
          return "No file selected";
      }
    }

    return "No file selected";
  };

  {
    /* Document Viewer Modal */
  }
  {
    /* Render Document Viewer when viewingDocument exists */
  }
  

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="flex flex-col items-center space-y-6">
          {/* Animated Loader Icon */}
          <div className="relative">
            <Loader className="w-12 h-12 text-blue-600 animate-spin" />
            <div className="absolute inset-0 w-12 h-12 border-4 border-blue-200 rounded-full animate-ping opacity-30"></div>
            <div className="absolute inset-0 w-16 h-16 -m-2 border-2 border-t-blue-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {isUpdateMode
                ? "Updating your information"
                : "Processing your request"}
            </h3>
            <div className="flex items-center justify-center space-x-1">
              <span className="text-sm text-gray-600">Please wait</span>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>

          <div className="w-64 bg-[#E5F2FE] rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center relative overflow-hidden">
      {/* Background Medical Image Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23e3f2fd'/%3E%3Cstop offset='100%25' style='stop-color:%23bbdefb'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1200' height='800' fill='url(%23bg)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Abstract Medical Icons Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-32 h-32 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-32 left-16 w-24 h-24 bg-[#E5F2FE] rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-indigo-200 rounded-full opacity-20 animate-pulse delay-500"></div>
        <div className="absolute top-1/3 left-1/4 w-20 h-20 bg-pink-200 rounded-full opacity-20 animate-pulse delay-700"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 ">
        <div className="flex justify-between mt-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-8  text-center">
            {isUpdateMode
              ? "Update Your Informations"
              : "Submit the Details to get Verified and Listed"}
          </h1>
          <button
            onClick={() => logout()}
            className="rounded w-20 h-10 hover:bg-red-700 text-red-700 hover:text-white "
          >
            <span className="flex ">
              {" "}
              <LogOut />
              Logout
            </span>
          </button>
        </div>

        {/* Display details here */}
        {isUpdateMode && (
          <div className="max-w-xl mx-auto my-10 bg-red-100 border border-red-300 text-red-800 rounded-lg shadow-md p-5 flex items-start space-x-4">
            <div className="pt-1">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Application Rejected</h3>
              <p className="mt-1">
                Unfortunately, your application has been rejected.
              </p>
              {formData.reason_block && (
                <p className="mt-2 text-sm text-red-700">
                  <strong>Reason:</strong> {formData.reason_block}
                </p>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date of Birth and Experience Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-[#E5F2FE] rounded-lg border-0 focus:outline-none focus:ring-2 ${
                  errors.date_of_birth
                    ? "focus:ring-red-500 ring-2 ring-red-500"
                    : "focus:ring-blue-500"
                }`}
              />
              {errors.date_of_birth && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.date_of_birth}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience (Years) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                min="0"
                max="70"
                className={`w-full px-4 py-3 bg-[#E5F2FE] rounded-lg border-0 focus:outline-none focus:ring-2 ${
                  errors.experience
                    ? "focus:ring-red-500 ring-2 ring-red-500"
                    : "focus:ring-blue-500"
                }`}
                placeholder="Years of experience"
              />
              {errors.experience && (
                <p className="text-red-500 text-xs mt-1">{errors.experience}</p>
              )}
            </div>
          </div>

          {/* Gender and Fees Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-[#E5F2FE] rounded-lg border-0 focus:outline-none focus:ring-2 ${
                  errors.gender
                    ? "focus:ring-red-500 ring-2 ring-red-500"
                    : "focus:ring-blue-500"
                }`}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && (
                <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Consultation Fees (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="fees"
                value={formData.fees}
                onChange={handleInputChange}
                min="1"
                max="100000"
                step="0.01"
                className={`w-full px-4 py-3 bg-[#E5F2FE] rounded-lg border-0 focus:outline-none focus:ring-2 ${
                  errors.fees
                    ? "focus:ring-red-500 ring-2 ring-red-500"
                    : "focus:ring-blue-500"
                }`}
                placeholder="Enter consultation fees"
              />
              {errors.fees && (
                <p className="text-red-500 text-xs mt-1">{errors.fees}</p>
              )}
            </div>
          </div>

          {/* Qualification */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Qualification <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="qualification"
              value={formData.qualification}
              onChange={handleInputChange}
              maxLength="100"
              className={`w-full px-4 py-3 bg-[#E5F2FE] rounded-lg border-0 focus:outline-none focus:ring-2 ${
                errors.qualification
                  ? "focus:ring-red-500 ring-2 ring-red-500"
                  : "focus:ring-blue-500"
              }`}
              placeholder="Enter your qualification (e.g., MBBS, MD)"
            />
            {errors.qualification && (
              <p className="text-red-500 text-xs mt-1">
                {errors.qualification}
              </p>
            )}
          </div>

          {/* Specialization */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specialization <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleInputChange}
              maxLength="100"
              className={`w-full px-4 py-3 bg-[#E5F2FE] rounded-lg border-0 focus:outline-none focus:ring-2 ${
                errors.specialization
                  ? "focus:ring-red-500 ring-2 ring-red-500"
                  : "focus:ring-blue-500"
              }`}
              placeholder="Enter your specialization (e.g., Cardiology, Pediatrics)"
            />
            {errors.specialization && (
              <p className="text-red-500 text-xs mt-1">
                {errors.specialization}
              </p>
            )}
          </div>

          {/* About Me */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              About Me <span className="text-red-500">*</span>
            </label>
            <textarea
              name="about_me"
              value={formData.about_me}
              onChange={handleInputChange}
              rows="4"
              maxLength="500"
              className={`w-full px-4 py-3 bg-[#E5F2FE] rounded-lg border-0 focus:outline-none focus:ring-2 resize-none ${
                errors.about_me
                  ? "focus:ring-red-500 ring-2 ring-red-500"
                  : "focus:ring-blue-500"
              }`}
              placeholder="Tell us about yourself, your experience, and approach to patient care... (minimum 10 characters)"
            />
            <div className="flex justify-between items-center mt-1">
              {errors.about_me && (
                <p className="text-red-500 text-xs">{errors.about_me}</p>
              )}
              <p className="text-gray-500 text-xs ml-auto">
                {formData.about_me.length}/500 characters
              </p>
            </div>
          </div>

          {/* File Upload Sections */}
          <div className="space-y-4">
            <p className="text-red-600 text-sm font-medium">
              * Please upload only JPG, JPEG, or PNG files (max 5MB each)
              {isUpdateMode &&
                " (Upload new files only if you want to replace existing ones)"}
            </p>

            {/* Upload ID */}
            <div>
              <div className="flex ">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload ID{" "}
                  {!isUpdateMode && <span className="text-red-500">*</span>}
                  {isUpdateMode && (
                    <span className="text-gray-500 text-xs">
                      (Optional - only if updating)
                    </span>
                  )}
                </label>
              </div>
               {isUpdateMode && ( <img src={formData.identification_doc} alt="id" width={200} height={150} /> )}

              <div
                className={`flex items-center justify-between bg-[#E5F2FE] rounded-lg px-4 py-3 ${
                  errors.id ? "ring-2 ring-red-500" : ""
                }`}
              >
                <span className="text-gray-600 text-sm">
                  {getFileDisplayName("id")}
                </span>
                <button
                  type="button"
                  onClick={() => handleFileUpload("id")}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors"
                >
                  {isUpdateMode ? "Replace file" : "Add file"}
                </button>
              </div>
              {errors.id && (
                <p className="text-red-500 text-xs mt-1">{errors.id}</p>
              )}
            </div>

            {/* Upload Educational Certificate */}
            <div>
              <div className="flex justify-end">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Educational Certificate{" "}
                  {!isUpdateMode && <span className="text-red-500">*</span>}
                  {isUpdateMode && (
                    <span className="text-gray-500 text-xs">
                      (Optional - only if updating)
                    </span>
                  )}
                </label>
                
              </div>
              {isUpdateMode && ( <img src={formData.education_certificate} alt="education_certificate" width={200} height={150} /> )}
              <div
                className={`flex items-center justify-between bg-[#E5F2FE] rounded-lg px-4 py-3 ${
                  errors.educationalCertificate ? "ring-2 ring-red-500" : ""
                }`}
              >
                <span className="text-gray-600 text-sm">
                  {getFileDisplayName("educationalCertificate")}
                </span>
                <button
                  type="button"
                  onClick={() => handleFileUpload("educationalCertificate")}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors"
                >
                  {isUpdateMode ? "Replace file" : "Add file"}
                </button>
              </div>
              {errors.educationalCertificate && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.educationalCertificate}
                </p>
              )}
            </div>

            {/* Upload Experience Certificate */}
            <div>
              <div className="flex justify-end">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Experience Certificate{" "}
                  {!isUpdateMode && <span className="text-red-500">*</span>}
                  {isUpdateMode && (
                    <span className="text-gray-500 text-xs">
                      (Optional - only if updating)
                    </span>
                  )}
                </label>
               
              </div>
              {isUpdateMode && ( <img src={formData.experience_certificate} alt="experience_certificate" width={200} height={150} /> )}

              <div
                className={`flex items-center justify-between bg-[#E5F2FE] rounded-lg px-4 py-3 ${
                  errors.experienceCertificate ? "ring-2 ring-red-500" : ""
                }`}
              >
                <span className="text-gray-600 text-sm">
                  {getFileDisplayName("experienceCertificate")}
                </span>
                <button
                  type="button"
                  onClick={() => handleFileUpload("experienceCertificate")}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors"
                >
                  {isUpdateMode ? "Replace file" : "Add file"}
                </button>
              </div>
              {errors.experienceCertificate && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.experienceCertificate}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <button
              type="submit"
              className="bg-black text-white px-8 py-3 mb-5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              {isUpdateMode ? "Update Information" : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



