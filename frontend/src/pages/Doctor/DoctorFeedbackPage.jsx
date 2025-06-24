import React, { useState } from "react";
import { Star, Send, MessageSquare, Bug, Lightbulb, Heart } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosconfig";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";

export default function DoctorFeedbackPage() {
  const [formData, setFormData] = useState({
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const location = useLocation();
  const consultationId = location?.state?.consultationId;
  const callDuration = location?.state?.callDuration;
  const userId = useSelector((state) => state.userDetails.id);
  console.log(consultationId,callDuration,'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh')
  const navigate = useNavigate();
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.message.trim()) newErrors.message = "Message is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        console.log({ ...formData, consultation_id: consultationId ,duration:callDuration},'kkkkkkkkkkkkkkk');

        const response = await axiosInstance.put(
          "/consultations/set_analysis_from_doctor",
          { ...formData, consultation_id: consultationId,duration:callDuration }
        );
        console.log("Feedback submitted:", response.data);
        
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setFormData({
            message: "",
          });
        }, 3000);
        await Swal.fire({
          title: "Added Analysis",
          text: "If you want you can start another session from now",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: "rounded-2xl shadow-2xl",
            title: "text-xl font-semibold text-gray-900",
            htmlContainer: "text-gray-600",
            icon: "border-4 border-green-100 text-green-500",
          },
          buttonsStyling: false,
          background: "#ffffff",
        });
        await axiosInstance.patch(
          `/users/update_availability/${userId}/${false}`
        );
        navigate("/doctor_home_page", { state: { sample: "" } });
      } catch (error) {}
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600">
            Your feedback has been submitted successfully. We appreciate your
            input!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4"></h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
            <h2 className="text-2xl font-semibold text-white">
              Share Diagnostic Analysis
            </h2>
          </div>

          <div className="p-8 space-y-8">
            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diagnostic Analysis
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={6}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors resize-none ${
                  errors.message ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Please provide detailed information about your feedback..."
              />
              {errors.message && (
                <p className="text-red-500 text-sm mt-1">{errors.message}</p>
              )}
              <div className="text-right text-sm text-gray-500 mt-1">
                {formData.message.length}/500
              </div>
            </div>
            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSubmit}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <Send className="w-5 h-5" />
                <span>Submit Analysis</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500">
          <p>Your Analysis helps us create better experiences for the Users.</p>
        </div>
      </div>
    </div>
  );
}
