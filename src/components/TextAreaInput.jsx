import React from "react";

const TextAreaInput = ({ value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">תוכן הערה</label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={4}
      className="textarea-input"
    />
    
  
  </div>
);

export default TextAreaInput;
