import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Eye,
  Check,
  X,
  User,
  FileText,
  Award,
  Briefcase,
  Shield,
  Loader,
  IndianRupee,
  AlertTriangle,
} from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar";
import { toast } from "react-toastify";
import { changePsychologistVerificationRoute, getPsycholgistDetailsRoute, revokePsychologistVerificationRoute } from "../../services/userService";

// Move RevokeModal outside of main component to prevent re-renders
const RevokeModal = ({ 
  showRevokeModal, 
  revokeReason, 
  setRevokeReason, 
  revokeReasonError, 
  setRevokeReasonError, 
  updating, 
  handleCloseRevokeModal, 
  handleRevokeVerification 
}) => {
  if (!showRevokeModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">
              Revoke Verification
            </h3>
          </div>

          {/* Warning Message */}
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              This action will revoke the psychologist's verification status. 
              Please provide a clear reason for this action.
            </p>
          </div>

          {/* Reason Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Revoking Verification *
            </label>
            <textarea
              value={revokeReason}
              onChange={(e) => {
                setRevokeReason(e.target.value);
                setRevokeReasonError("");
              }}
              placeholder="Please provide a detailed reason for revoking verification..."
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none ${
                revokeReasonError ? 'border-red-300' : 'border-gray-300'
              }`}
              rows="4"
              maxLength="500"
            />
            {revokeReasonError && (
              <p className="mt-1 text-sm text-red-600">{revokeReasonError}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {revokeReason.length}/500 characters
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleCloseRevokeModal}
              disabled={updating}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleRevokeVerification}
              disabled={updating || !revokeReason.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {updating && <Loader className="w-4 h-4 animate-spin" />}
              <span>{updating ? "Revoking..." : "Revoke Verification"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminPsychoPending = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [psychologist, setPsychologist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewingDocument, setViewingDocument] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [revokeReason, setRevokeReason] = useState("");
  const [revokeReasonError, setRevokeReasonError] = useState("");

  // Fetch psychologist data from server
  useEffect(() => {
    if (userId) {
      fetchPsychologistData();
    }
  }, [userId]);

  const fetchPsychologistData = async () => {
    try {
      setLoading(true);
      const response = await getPsycholgistDetailsRoute(userId)
      setPsychologist(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationToggle = async (status) => {
    try {
      const response = await changePsychologistVerificationRoute(userId,status);
      setUpdating(true);
      toast.success('Status Updated Successfully',{position:'bottom-center'})
      fetchPsychologistData();
    } catch (err) {
      setError(err.message);
      toast.error('Status Updation Failed',{position:'bottom-center'})
    } finally {
      setUpdating(false);
    }
  };

  const handleRevokeVerification = async () => {
    // Validate reason
    if (!revokeReason.trim()) {
      setRevokeReasonError("Please provide a reason for revoking verification");
      return;
    }

    if (revokeReason.trim().length < 10) {
      setRevokeReasonError("Reason must be at least 10 characters long");
      return;
    }

    try {
      setUpdating(true);
      await revokePsychologistVerificationRoute (userId,revokeReason,"blocked");
      toast.success('Verification Revoked Successfully', {position:'bottom-center'});
      setShowRevokeModal(false);
      setRevokeReason("");
      setRevokeReasonError("");
      fetchPsychologistData();
    } catch (err) {
      setError(err.message);
      toast.error('Failed to Revoke Verification', {position:'bottom-center'});
    } finally {
      setUpdating(false);
    }
  };

  const handleCloseRevokeModal = () => {
    setShowRevokeModal(false);
    setRevokeReason("");
    setRevokeReasonError("");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not provided";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const DocumentViewer = ({ document, title, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-4">
          <img src={document} alt={title} className="max-w-full h-auto" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading psychologist profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar activeSection="psychologists" />
        <div className="flex-1 bg-gray-50 overflow-auto">
          <div className=" mx-auto p-6">
            <div className="space-y-8">
              <div className="p-6 bg-white rounded-lg shadow-lg">
                <div className="mb-6"></div>
                <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      Pshychologist has not Registered Yet for Approval
                    </h2>
                    <button
                      onClick={() => navigate(-1)}
                      className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      Back
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!psychologist) {
    return (
      <NoDoctorFound/>
    );
  }

   

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar activeSection="psychologists" />
      <div className="flex-1 bg-gray-50 overflow-auto">
        <div className=" mx-auto p-6">
          <div className="space-y-8">
            <div className="p-6 bg-white rounded-lg shadow-lg">
              <div className="mb-6"></div>
              <div className="min-h-screen bg-gray-100 p-6">
                <div className="max-w-6xl mx-auto">
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Profile Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                      <div className="flex items-start space-x-6">
                        <div className="relative">
                          <img
                            src={
                              psychologist.profile_image ||
                              "/powerpoint-template-icons-b.jpg"
                            }
                            alt="Profile"
                            className="w-32 h-32 rounded-lg object-cover border-4 border-white"
                          />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold mb-2">
                            Psychologist Profile
                          </h2>
                          <div className=" ">
                            <div
                              className={`px-1 py-1 w-25 mb-3 rounded-full text-sm font-medium ${
                                psychologist.is_verified=='verified'
                                  ? "bg-green-500 text-white"
                                  : "bg-red-500 text-white"
                              }`}
                            >
                              {psychologist.is_verified=='verified'
                                ? "✓ Verified"
                                : "✗ Not Verified"}
                            </div>

                            <div
                              className={`px-2 py-1 w-25 rounded-full text-sm font-medium ${
                                psychologist.is_available
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-500 text-white"
                              }`}
                            >
                              {psychologist.is_available
                                ? "Available"
                                : "Unavailable"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Profile Information */}
                    <div className="p-6 space-y-8">
                      {/* Personal Information */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <User className="w-5 h-5 mr-2 text-blue-500" />
                          Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Date of Birth
                            </label>
                            <p className="text-gray-900">
                              {formatDate(psychologist.date_of_birth)}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Gender
                            </label>
                            <p className="text-gray-900">
                              {psychologist.gender || "Not specified"}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Profile Created
                            </label>
                            <p className="text-gray-900">
                              {formatDate(psychologist.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Professional Information */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <Briefcase className="w-5 h-5 mr-2 text-green-500" />
                          Professional Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Qualification
                            </label>
                            <div className="flex items-center space-x-2">
                              <Award className="w-4 h-4 text-blue-500" />
                              <p className="text-gray-900">
                                {psychologist.qualification || "Not provided"}
                              </p>
                            </div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Experience
                            </label>
                            <div className="flex items-center space-x-2">
                              <Briefcase className="w-4 h-4 text-green-500" />
                              <p className="text-gray-900">
                                {psychologist.experience || "Not provided"}
                              </p>
                            </div>
                          </div>
                          <div className="col-span-1 md:col-span-2 bg-gray-50 p-4 rounded-lg">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Specialization
                            </label>
                            <p className="text-gray-900">
                              {psychologist.specialization || "Not provided"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Fees */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <IndianRupee className="w-5 h-5 mr-1 text-red-800" />
                          Consultation Fees
                        </h3>
                        <div className=" p-2 rounded-lg">
                          <div>
                            <p className="  text-gray-900">
                              ₹{psychologist.fees || "Not set"}
                              <span className="text-lg font-normal text-gray-600">
                                /session
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* About Me */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">About</h3>
                        <div className="bg-gray-50 p-6 rounded-lg">
                          <p className="text-gray-900 leading-relaxed">
                            {psychologist.about_me || "No description provided"}
                          </p>
                        </div>
                      </div>

                      {/* Documents */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <FileText className="w-5 h-5 mr-2 text-purple-500" />
                          Verification Documents
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                            <Shield className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                            <h4 className="font-medium mb-2">
                              Identification Document
                            </h4>
                            {psychologist.identification_doc ? (
                              <button
                                onClick={() =>
                                  setViewingDocument({
                                    url: psychologist.identification_doc,
                                    title: "Identification Document",
                                  })
                                }
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center space-x-2 mx-auto"
                              >
                                <Eye className="w-4 h-4" />
                                <span>View Document</span>
                              </button>
                            ) : (
                              <p className="text-gray-500 text-sm">
                                Not uploaded
                              </p>
                            )}
                          </div>

                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                            <Award className="w-12 h-12 text-green-500 mx-auto mb-4" />
                            <h4 className="font-medium mb-2">
                              Education Certificate
                            </h4>
                            {psychologist.education_certificate ? (
                              <button
                                onClick={() =>
                                  setViewingDocument({
                                    url: psychologist.education_certificate,
                                    title: "Education Certificate",
                                  })
                                }
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center space-x-2 mx-auto"
                              >
                                <Eye className="w-4 h-4" />
                                <span>View Certificate</span>
                              </button>
                            ) : (
                              <p className="text-gray-500 text-sm">
                                Not uploaded
                              </p>
                            )}
                          </div>

                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-yellow-500 transition-colors">
                            <Briefcase className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                            <h4 className="font-medium mb-2">
                              Experience Certificate
                            </h4>
                            {psychologist.experience_certificate ? (
                              <button
                                onClick={() =>
                                  setViewingDocument({
                                    url: psychologist.experience_certificate,
                                    title: "Experience Certificate",
                                  })
                                }
                                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 flex items-center space-x-2 mx-auto"
                              >
                                <Eye className="w-4 h-4" />
                                <span>View Certificate</span>
                              </button>
                            ) : (
                              <p className="text-gray-500 text-sm">
                                Not uploaded
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold mb-4">
                          Admin Action
                        </h3>
                        <div className="flex flex-wrap gap-4">

                          {(psychologist.is_verified === 'verified' || psychologist.is_verified === 'pending') && 
                          <button
                            onClick={() => setShowRevokeModal(true)}
                            disabled={updating}
                            className={`px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors bg-red-500 text-white hover:bg-red-700 disabled:bg-red-300`}
                          >
                            <AlertTriangle className="w-4 h-4" />
                            <span>
                              {updating ? "Updating..." : "Revoke Verification"}
                            </span>
                          </button>}
                            {(psychologist.is_verified=='blocked' || psychologist.is_verified=='pending') && 
                          <button
                            onClick={() => {
                              handleVerificationToggle("verified");
                            }}
                            disabled={updating}
                            className={`px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors bg-green-500 text-white hover:bg-green-600 disabled:bg-green-300`}
                          >
                            <Check className="w-4 h-4" />
                            <span>
                              {updating ? "Updating..." : "Verify Profile"}
                            </span>
                          </button>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Document Viewer Modal */}
                  {viewingDocument && (
                    <DocumentViewer
                      document={viewingDocument.url}
                      title={viewingDocument.title}
                      onClose={() => setViewingDocument(null)}
                    />
                  )}

                  {/* Revoke Modal */}
                  <RevokeModal
                    showRevokeModal={showRevokeModal}
                    revokeReason={revokeReason}
                    setRevokeReason={setRevokeReason}
                    revokeReasonError={revokeReasonError}
                    setRevokeReasonError={setRevokeReasonError}
                    updating={updating}
                    handleCloseRevokeModal={handleCloseRevokeModal}
                    handleRevokeVerification={handleRevokeVerification}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPsychoPending;


export const NoDoctorFound = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Psychologist Not Found
        </h2>
        <p className="text-gray-600">
          No profile  
        </p>
      </div>
    </div>
  );
};