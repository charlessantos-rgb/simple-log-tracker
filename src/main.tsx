import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { loadConfig, applyTheme } from "./lib/rnc-types";

applyTheme(loadConfig().tema || "claro");

createRoot(document.getElementById("root")!).render(<App />);
