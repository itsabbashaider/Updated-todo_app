import { StrictMode } from "react";
import { createRoot } from "react-dom/client";


import "./styles/achievements.css"
import "./styles/global.css";
import "./styles/buttons.css";
import "./styles/analytics.css";
import "./styles/calendar.css";
import "./styles/home.css";
import "./styles/modal.css";
import "./styles/sidebar.css";
import "./styles/task-card.css";
import "./styles/task-list.css";
import "./styles/tasks.css";

import App from "./App.jsx";

createRoot(
  document.getElementById("root")
).render(
  <StrictMode>
    <App />
  </StrictMode>
);