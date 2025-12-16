import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="panel">
      <div className="panelHead">
        <div className="panelTitle">404</div>
      </div>
      <div className="invEmpty">
        Page not found. <Link to="/">Go back</Link>
      </div>
    </div>
  );
}
