import React, { useState } from "react";
import { Paperclip } from "lucide-react";

const FileUploadInput = ({ onChange }) => {
  const [fileName, setFileName] = useState("");

  const handleChange = (file) => {
    setFileName(file ? file.name : "");
    onChange(file);
  };

  return (
    <div>
      <label>העלאת קובץ</label>
      <input
        id="fileInput"
        type="file"
        onChange={(e) => handleChange(e.target.files[0])}
        className="input hidden"
      />
      <label
        htmlFor="fileInput"
        className={"file-upload" + (fileName ? " has-file" : "")}
      >
        <Paperclip size={16} strokeWidth={2} />
        <span>{fileName || "בחירת קובץ (לא חובה)"}</span>
      </label>
    </div>
  );
};

export default FileUploadInput;
