import React from "react";

const FileUploadInput = ({ onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">העלאת קובץ</label>
    <input
      type="file"
      onChange={(e) => onChange(e.target.files[0])}
      className="input"       // ← סטייל אחיד
    />
  </div>
);

export default FileUploadInput;
