import React from "react";

const TextAreaInput = ({ value, onChange }) => (
  <div>
    <label>תוכן הערה</label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={4}
      className="textarea-input"
    />
    
  
  </div>
);

export default TextAreaInput;
