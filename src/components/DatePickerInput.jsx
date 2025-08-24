import React from "react";

const DatePickerInput = ({ value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">תאריך</label>
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input"       // ← סטייל אחיד
    />
  </div>
);

export default DatePickerInput;
