import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./assets/styles/global.css";
import "./assets/styles/dashboard.css";
import "./assets/styles/calendar.css";
import "./assets/styles/buttons.css";
import "./assets/styles/tasks.css";
import "./assets/styles/modals.css";

import App from "./App.jsx";

createRoot(
  document.getElementById("root")
).render(
  <StrictMode>
    <App />
  </StrictMode>
);