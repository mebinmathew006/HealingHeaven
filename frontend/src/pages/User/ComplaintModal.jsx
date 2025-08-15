import React, { useState } from "react";
import { X, AlertTriangle, Send } from "lucide-react";
import { toast } from "react-toastify";

const ComplaintModal = ({ consultationId, isOpen, onClose }) => {
  const [complaintData, setComplaintData] = useState({
    type: "",
    subject: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      await registerComplaintRoute(complaintData,consultationId);

      // Reset form
      setComplaintData({
        type: "",
        subject: "",
        description: "",
      });
      onClose();
      
      // Show success message
      toast.success('Complaint submitted successfully!', {position:'bottom-center'});
      
    } catch (error) {
      console.error("Error submitting complaint:", error);
      
      if (error.response) {
        console.error("Server responded with error:", error.response.data);
        toast.error(`Error submitting complaint: ${error.response.data.message || 'Please try again.'}`, {position:'bottom-center'});
      } else if (error.request) {
        console.error("Network error:", error.request);
        toast.error('Network error. Please check your connection and try again.', {position:'bottom-center'});
      } else {
        console.error("Error:", error.message);
        toast.error('Error submitting complaint. Please try again.', {position:'bottom-center'});
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form validation
  const isFormValid =
    complaintData.type &&
    complaintData.subject.trim() &&
    complaintData.description.trim();

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
                  <span>Submit Complaint</span>
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