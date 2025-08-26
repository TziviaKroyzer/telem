import React from "react";

const FileUploadInput = ({ onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">
      העלאת קובץ
    </label>
    <input
      id="fileInput"
      type="file"
      onChange={(e) => onChange(e.target.files[0])}
      className=" input hidden"
    />

    <label htmlFor="fileInput" className="input">
      📎
    </label>
  </div>
);

export default FileUploadInput;
