import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import QuickApp from "./app/QuickApp";
import { windowLabel } from "./lib/tauri";
import "./index.css";

// One bundle, two windows: the main app and the quick-search widget (Alt+Space).
const quick = windowLabel() === "quick";
if (quick) document.documentElement.classList.add("is-quick");
const Root = quick ? QuickApp : App;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
