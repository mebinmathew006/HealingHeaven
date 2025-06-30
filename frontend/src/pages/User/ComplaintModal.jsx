import React, { useState, useRef } from "react";
import { X, AlertTriangle, Send, Upload, Video, Trash2, Play } from "lucide-react";
import axiosInstance from "../../axiosconfig";
import { toast } from "react-toastify";


const ComplaintModal = ({ consultationId, isOpen, onClose }) => {
  const [complaintData, setComplaintData] = useState({
    type: "",
    subject: "",
    description: "",
  });
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState("");
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  const complaintTypes = [
    { value: "unprofessional_behavior", label: "Unprofessional Behavior" },
    { value: "inadequate_service", label: "Inadequate Service" },
    { value: "billing_issue", label: "Billing Issue" },
    { value: "appointment_issue", label: "Appointment Issue" },
    { value: "communication_problem", label: "Communication Problem" },
    { value: "technical_issue", label: "Technical Issue" },
    { value: "other", label: "Other" },
  ];

  const handleInputChange = (field, value) => {
    setComplaintData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    setUploadError("");

    if (!file) return;

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/mov', 'video/avi', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Please upload a valid video file (MP4, WebM, MOV, AVI, QuickTime)");
      return;
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      setUploadError("Video file size must be less than 50MB");
      return;
    }

    setVideoFile(file);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setVideoPreview(previewUrl);
  };

  const removeVideo = () => {
    setVideoFile(null);
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
      setVideoPreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setUploadError("");
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Create FormData to handle file upload
      const formData = new FormData();
      formData.append('type', complaintData.type);
      formData.append('subject', complaintData.subject);
      formData.append('description', complaintData.description);
      formData.append('consultation_id', consultationId);
      
      // Only append video if one is selected
      if (videoFile) {
        formData.append('video', videoFile);
      }

      console.log('Submitting complaint with data:', {
        ...complaintData,
        consultation_id: consultationId,
        hasVideo: !!videoFile,
        videoName: videoFile?.name || 'No video',
        videoSize: videoFile?.size || 0
      });

      const response = await axiosInstance.post(
        "/consultations/register_complaint",
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Complaint submitted successfully:', response.data);

      // Reset form
      setComplaintData({
        type: "",
        subject: "",
        description: "",
      });
      removeVideo();
      onClose();
      
      // Show success message
      toast.success('Complaint submitted successfully!');
      
    } catch (error) {
      console.error("Error submitting complaint:", error);
      
      // More detailed error handling
      if (error.response) {
        console.error("Server responded with error:", error.response.data);
        toast.error(`Error submitting complaint: ${error.response.data.message || 'Please try again.'}`);
      } else if (error.request) {
        console.error("Network error:", error.request);
        toast.error('Network error. Please check your connection and try again.');
      } else {
        console.error("Error:", error.message);
        toast.error('Error submitting complaint. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form validation - video is completely optional
  const isFormValid =
    complaintData.type &&
    complaintData.subject.trim() &&
    complaintData.description.trim();

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                File a Complaint
              </h2>
              <p className="text-sm text-gray-600">
                Report an issue with your consultation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Complaint Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Complaint Type *
            </label>
            <select
              value={complaintData.type}
              onChange={(e) => handleInputChange("type", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
            >
              <option value="">Select complaint type</option>
              {complaintTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <input
              type="text"
              value={complaintData.subject}
              onChange={(e) => handleInputChange("subject", e.target.value)}
              placeholder="Brief summary of your complaint"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={complaintData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Please provide detailed information about your complaint..."
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-vertical"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {complaintData.description.length}/1000 characters
            </p>
          </div>

          {/* Video Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Video Evidence (Optional)
            </label>
            <p className="text-xs text-gray-500 mb-3">
              You can submit your complaint with or without video evidence. Video is completely optional.
            </p>
            
            {!videoFile ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
                <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  Click to upload a video file or drag and drop
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Supported formats: MP4, WebM, MOV, AVI, QuickTime (Max 50MB)
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Choose Video File</span>
                </button>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Video className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {videoFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(videoFile.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeVideo}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    title="Remove video"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
                
                {videoPreview && (
                  <div className="mt-3">
                    <video
                      ref={videoRef}
                      src={videoPreview}
                      controls
                      className="w-full max-h-48 rounded-lg border"
                    />
                  </div>
                )}
              </div>
            )}

            {uploadError && (
              <div className="mt-2 p-2 bg-red-100 border border-red-300 text-red-700 rounded text-sm">
                {uploadError}
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Important Notice</p>
                <p>
                  Your complaint will be reviewed by our quality assurance team.
                  We take all complaints seriously and will respond within 48
                  hours. False or malicious complaints may result in account
                  restrictions.
                </p>
                {videoFile && (
                  <p className="mt-2">
                    <strong>Video Upload:</strong> Your video will be securely stored and only accessed by authorized personnel for complaint review purposes.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-colors ${
                isFormValid && !isSubmitting
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Complaint{videoFile ? ' (with Video)' : ''}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintModal;