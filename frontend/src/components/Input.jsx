import React from "react";

// Import the shared styles for the input fields.  These classes define
// consistent padding, border radii, colours and focus states.  Without
// this import the ``field``, ``label`` and ``input`` classes would have
// no styling and inputs would appear unstyled.
import "./Input.css";

export default function Input({ label, error, ...props }) {
  return (
    <label className="field">
      {label && <div className="label">{label}</div>}
      <input className={`input ${error ? "input-error" : ""}`} {...props} />
      {error && <div className="error">{error}</div>}
    </label>
  );
}
