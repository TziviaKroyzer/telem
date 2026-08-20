import React from "react";

const TextAreaInput = ({
  value,
  onChange,
  placeholder = "כתבי כאן את תוכן ההערה…",
  hint = "עד 500 תווים",
  error = "",
}) => (
  <div>
    <label>תוכן הערה</label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={4}
      maxLength={500}
      placeholder={placeholder}
      className={"textarea-input" + (error ? " is-invalid" : "")}
    />
    {hint ? <div className="field-hint">{hint}</div> : null}
    {error ? <div className="field-error">{error}</div> : null}
  </div>
);

export default TextAreaInput;
