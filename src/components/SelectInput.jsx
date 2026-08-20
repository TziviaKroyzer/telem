import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export default function SelectInput({
  label,
  options = [],
  value,
  onChange,
  placeholder = "בחרי...",
  allowEmpty = false,
  compact = false,
  invalid = false,
  error = "",
  hint = "",
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const selected = options.find((o) => String(o.value) === String(value));
  const display = selected?.label || placeholder;

  useEffect(() => {
    const onDoc = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const pick = (next) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <div
      className={"nice-select" + (compact ? " nice-select--compact" : "")}
      ref={rootRef}
    >
      {label ? <label>{label}</label> : null}
      <button
        type="button"
        className={"nice-select-btn" + (!selected ? " is-placeholder" : "") + (invalid ? " is-invalid" : "")}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{display}</span>
        <ChevronDown size={16} strokeWidth={2.2} className={open ? "is-open" : ""} />
      </button>
      {open && (
        <ul className="nice-select-menu" role="listbox">
          {allowEmpty && (
            <li>
              <button
                type="button"
                className={!value ? "is-active" : ""}
                onClick={() => pick("")}
              >
                {placeholder}
              </button>
            </li>
          )}
          {options.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                className={String(opt.value) === String(value) ? "is-active" : ""}
                onClick={() => pick(opt.value)}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
      {hint ? <div className="field-hint">{hint}</div> : null}
      {error ? <div className="field-error">{error}</div> : null}
    </div>
  );
}
