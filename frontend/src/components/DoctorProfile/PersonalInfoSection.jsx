import React from "react";
import { Edit3 } from "lucide-react";
import { User, Phone, Calendar, Mail } from "lucide-react";

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

const PersonalInfoSection = ({
  formData,
  isEditing,
  setIsEditing,
  handleInputChange,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Personal Information
        </h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Edit3 className="w-4 h-4" />
          <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          {isEditing ? (
            <input
              type="text"
              name="name"
              value={formData.user.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          ) : (
            <div className="flex items-center space-x-2 text-gray-900">
              <User className="w-4 h-4 text-gray-400" />
              <span>{formData.user.name}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          {isEditing ? (
            <input
              type="tel"
              name="mobile_number"
              value={formData.user.mobile_number}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          ) : (
            <div className="flex items-center space-x-2 text-gray-900">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{formData.user.mobile_number}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gender
          </label>
          {isEditing ? (
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          ) : (
            <div className="flex items-center space-x-2 text-gray-900">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>{formatDate(formData.date_of_birth)}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="flex items-center space-x-2 text-gray-900">
            <Mail className="w-4 h-4 text-gray-400" />
            <span>{formData.user.email_address}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role
          </label>
          <div className="flex items-center space-x-2 text-gray-900">
            <span className="capitalize bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
              {formData.user.role}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoSection;