import React from "react";

const DatePickerInput = ({ value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">תאריך</label>
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="date-picker-input"
    />

    <style>{`
      .date-picker-input {
        width: 100%;
        margin-top: 0.25rem;
        padding: 0.5rem;
        border-radius: 0.375rem;
        border: 1px solid #d1d5db;
      }

      .date-picker-input:focus {
        outline: none;
        border-color: #3B82F6;
      }
    `}</style>
  </div>
);

export default DatePickerInput;
