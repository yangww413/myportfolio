import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "./style.css";
import "./video.css";
import "./tosummer.css";
import "./opening-intro.css";
import "./editorial-home.css";
import "./portfolio-polish.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
