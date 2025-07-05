import React from "react";

const StatusAvailabilitySection = ({ formData }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        Status & Availability
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
  );
};

export default StatusAvailabilitySection;