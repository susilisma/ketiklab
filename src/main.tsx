import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./globals.css";
import "./vocabulary.css";
import Home from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Home />
  </StrictMode>,
);

// Register the service worker for offline use + installability (PWA).
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(import.meta.env.BASE_URL + "sw.js").catch(() => {});
  });
}
