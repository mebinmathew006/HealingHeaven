import React, { useState } from "react";
import { Calendar, User, FileText, Clock, ArrowLeft } from "lucide-react";
import ComplaintModal from "./ComplaintModal";

export default function ConsultationDetail({
  consultation,
  getStatusColor,
  getStatusIcon,
  formatDate,
  truncateText,
  setSelectedConsultation,
  ComplaintModalOpen,
}) {
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      {isModalOpen && (
        <ComplaintModal
          consultationId={consultation.id}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      <div className="bg-gradient-to-r from-green-50 to-indigo-50 rounded-lg border border-green-100 overflow-hidden">
        {/* Header with Back Button */}
        <div className="px-6 py-4 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setSelectedConsultation(null)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back to Consultations</span>
            </button>

            <div
              className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(
                consultation.status
              )}`}
            >
              {getStatusIcon(consultation.status)}
              <span className="text-sm font-medium capitalize">
                {consultation.status}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Consultation Details
              </h1>
              <p className="text-gray-600 text-sm">
                Session with {consultation.user?.name || "Unknown Psychologist"}
              </p>
            </div>
          </div>
        </div>

        {/* Session Information */}
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Psychologist</p>
                  <p className="font-semibold text-gray-900">
                    {consultation.user?.name || "Unknown Psychologist"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Specialization</p>
                  <p className="font-semibold text-gray-900">
                    {consultation.user?.psychologist_profile?.specialization ||
                      "General Practice"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Session Date</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(consultation.created_at)}
                  </p>
                </div>
              </div>

              {/* {consultation.duration && (
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-semibold text-gray-900">
                      {consultation.duration}
                    </p>
                  </div>
                </div>
              )} */}
            </div>
          </div>
        </div>

        {/* Analysis Section */}
        {consultation.analysis ? (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Professional Analysis
              </h2>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {showFullAnalysis
                      ? consultation.analysis
                      : truncateText(consultation.analysis)}
                  </p>

                  {consultation.analysis.length > 200 && (
                    <button
                      onClick={() => setShowFullAnalysis(!showFullAnalysis)}
                      className="mt-3 text-green-600 hover:text-green-800 font-medium text-sm focus:outline-none focus:underline"
                    >
                      {showFullAnalysis ? "Show Less" : "Read More"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Analysis Pending
              </h3>
              <p className="text-gray-500">
                {consultation.status === "pending"
                  ? "Your session analysis will be available after completion"
                  : "No analysis available for this session"}
              </p>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-white border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              <p>Session Date: {formatDate(consultation.created_at)}</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              >
                Raise Compliant
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
