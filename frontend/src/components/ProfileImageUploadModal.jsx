import React, { useState, useRef } from "react";
import { Upload, X, Check, RotateCw, User } from "lucide-react";
import { toast } from "react-toastify";

const ProfileImageUploadModal = ({
  isOpen,
  onClose,
  onUpload, // callback to handle upload (provided by parent)
}) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = async () => {
    if (!selectedImage) return;
    setIsUploading(true);
    try {
      await onUpload(selectedImage);
      handleClose();
    } catch (error) {
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClose();
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Update Profile Image</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600" disabled={isUploading}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="relative inline-block">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-32 h-32 rounded-full object-cover border-4 border-blue-200" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-gray-200 flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
              )}
              {previewUrl && (
                <button
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-lg"
                  disabled={isUploading}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* File Upload Area */}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" disabled={isUploading} />
          <div
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer transition-colors duration-200 ${
              isUploading ? "opacity-50 cursor-not-allowed" : "hover:border-blue-400 hover:bg-blue-50"
            }`}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">{selectedImage ? selectedImage.name : "Click to select an image"}</p>
            <p className="text-sm text-gray-500">Supported formats: JPG, PNG, GIF (Max 5MB)</p>
          </div>

          {/* File Info */}
          {selectedImage && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Selected File:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Name:</strong> {selectedImage.name}</p>
                <p><strong>Size:</strong> {(selectedImage.size / 1024 / 1024).toFixed(2)} MB</p>
                <p><strong>Type:</strong> {selectedImage.type}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button onClick={handleClose} className="flex-1 px-4 py-3 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg" disabled={isUploading}>
              Cancel
            </button>
            <button
              onClick={handleUploadClick}
              disabled={!selectedImage || isUploading}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 ${
                !selectedImage || isUploading ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isUploading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Update Image</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileImageUploadModal;
