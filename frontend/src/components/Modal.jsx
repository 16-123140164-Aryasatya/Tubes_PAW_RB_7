import React, { useEffect } from "react";

export default function Modal({ open, title, children, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  // Render the modal using the shared modal styles from base.css.  The
  // surrounding backdrop uses ``mBackdrop`` to create a dimmed overlay
  // and center the modal, while ``mModal`` defines the panel styling.
  // The header row provides a title and a close button using ``mHead``,
  // ``mTitle`` and ``mClose`` classes.  The modal body wraps the
  // provided children.  Clicking outside the modal or pressing Escape
  // triggers ``onClose``.
  return (
    <div className="mBackdrop" onMouseDown={onClose}>
      <div className="mModal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="mHead">
          <div className="mTitle">{title}</div>
          <button className="mClose" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="mBody">{children}</div>
      </div>
    </div>
  );
}
