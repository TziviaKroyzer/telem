import React from "react";

const SelectInput = ({ label, options, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="select-input"
    >
      <option disabled value="">
        בחר...
      </option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>

    <style>{`
      .select-input {
        width: 100%;
        margin-top: 0.25rem;
        padding: 0.5rem;
        border-radius: 0.375rem;
        border: 1px solid #D1D5DB;
      }

      .select-input:focus {
        outline: none;
        border-color: #3B82F6;
      }
    `}</style>
  </div>
);

export default SelectInput;
