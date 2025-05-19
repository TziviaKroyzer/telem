import React from "react";

const FileUploadInput = ({ onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">העלאת קובץ</label>
    <input
      type="file"
      onChange={(e) => onChange(e.target.files[0])}
      className="file-upload-input"
    />
    
    <style>{`
      .file-upload-input {
        margin-top: 0.25rem;
      }
      
      .file-upload-input:focus {
        outline: none;
        border-color: #3B82F6;
      }
    `}</style>
  </div>
);

export default FileUploadInput;
