import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Fonts self-host (không phụ thuộc Google Fonts CDN)
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";

import "./styles/index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
