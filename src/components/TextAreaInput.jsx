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
    
    <style>{`
      .textarea-input {
        width: 100%;
        margin-top: 0.25rem;
        padding: 0.5rem;
        border-radius: 0.375rem;
        border: 1px solid #D1D5DB;
      }

      .textarea-input:focus {
        outline: none;
        border-color: #3B82F6;
      }
    `}</style>
  </div>
);

export default TextAreaInput;
