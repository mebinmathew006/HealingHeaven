import React from "react";
import { Award, Briefcase, DollarSign, FileText } from "lucide-react";

const ProfessionalInfoSection = ({ formData, isEditing, handleInputChange }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        Professional Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          ) : (
            <div className="flex items-center space-x-2 text-gray-900">
              <Award className="w-4 h-4 text-gray-400" />
              <span>{formData.qualification}</span>
            </div>
          )}
        </div>

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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          ) : (
            <div className="flex items-center space-x-2 text-gray-900">
              <Briefcase className="w-4 h-4 text-gray-400" />
              <span>{formData.specialization}</span>
            </div>
          )}
        </div>

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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          ) : (
            <div className="flex items-start space-x-2 text-gray-900">
              <Briefcase className="w-4 h-4 text-gray-400 mt-1" />
              <span>{formData.experience}</span>
            </div>
          )}
        </div>

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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          ) : (
            <div className="flex items-center space-x-2 text-gray-900">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <span>₹{formData.fees}</span>
            </div>
          )}
        </div>
      </div>

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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Tell us about yourself..."
          />
        ) : (
          <div className="flex items-start space-x-2 text-gray-900">
            <FileText className="w-4 h-4 text-gray-400 mt-1" />
            <span>{formData.about_me || "No description provided"}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalInfoSection;