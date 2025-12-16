import React from "react";

export default function Input({ label, error, ...props }) {
  return (
    <label className="field">
      {label && <div className="label">{label}</div>}
      <input className={`input ${error ? "input-error" : ""}`} {...props} />
      {error && <div className="error">{error}</div>}
    </label>
  );
}
