import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { BooksProvider } from "./contexts/BooksContext";
import "./styles.css";

const rootElement = document.getElementById("root");

if (!rootElement) throw new Error("Cannot find root element.");

createRoot(rootElement).render(
  <StrictMode>
    <BooksProvider>
      <App />
    </BooksProvider>
  </StrictMode>,
);
