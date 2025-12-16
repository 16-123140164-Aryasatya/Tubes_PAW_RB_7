import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./styles/base.css";
import AppLayout from "./components/AppLayout";

import { AuthProvider } from "./auth/AuthContext";
import { LibraryProvider } from "./store/LibraryStore";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LibraryProvider>
          <AppLayout />
        </LibraryProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
