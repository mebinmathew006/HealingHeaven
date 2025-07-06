import React, { useState } from "react";
import { Eye, Upload, X, Check, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

const DocumentsSection = ({ 
  formData, 
  onFileUpload,
  isEditing
}) => {
  const [currentFile, setCurrentFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (type) => (e) => {
    const file = e.target.files[0];
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (file) {
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only JPG, JPEG, PNG and PDF files are allowed.", {
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

      setCurrentFile(file);
      setFileType(type);
    }
  };

  const handleUpload = async () => {
    if (!currentFile || !fileType) return;
    
    setIsUploading(true);
    try {
      await onFileUpload(fileType, currentFile);
      setCurrentFile(null);
      setFileType(null);
    } finally {
      setIsUploading(false);
    }
  };

  const cancelSelection = () => {
    setCurrentFile(null);
    setFileType(null);
  };

  const documentTypes = [
    {
      type: "identification_doc",
      label: "Identification Document",
      currentFile: formData.identification_doc
    },
    {
      type: "education_certificate",
      label: "Education Certificate",
      currentFile: formData.education_certificate
    },
    {
      type: "experience_certificate",
      label: "Experience Certificate",
      currentFile: formData.experience_certificate
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        Documents & Certificates
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documentTypes.map((doc) => (
          <div key={doc.type}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {doc.label}
            </label>
            
            {/* Current file view */}
            {doc.currentFile && !(fileType === doc.type && currentFile) && (
              <div className="flex items-center justify-between mb-2">
                <a
                  href={doc.currentFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-green-600 hover:text-green-800"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Current</span>
                </a>
                {isEditing && (
                  <button
                    onClick={() => setFileType(doc.type)}
                    className="text-sm text-green-800 hover:text-green-900 xd"
                  >
                    Replace
                  </button>
                )}
              </div>
            )}

            {/* File selection area */}
            {isEditing && (fileType === doc.type || (!fileType && !doc.currentFile)) && (
              <div className="space-y-2">
                {currentFile && fileType === doc.type ? (
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between p-2 border rounded-lg">
                      <span className="truncate text-sm">{currentFile.name}</span>
                      <button 
                        onClick={cancelSelection}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="flex items-center justify-center w-full px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:bg-green-400"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Confirm Upload
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500">
                    <Upload className="w-5 h-5 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Click to upload</span>
                    <input 
                      type="file" 
                      onChange={handleFileSelect(doc.type)}
                      className="hidden" 
                      accept=".jpg,.jpeg,.png,.pdf"
                    />
                  </label>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentsSection;