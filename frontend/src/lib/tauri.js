// The ONLY place that talks to Rust. Components call these functions, never invoke() directly.
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";

/** True inside the Tauri window, false in a normal browser tab (npm run dev). */
export const inTauri = () => typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

/** @returns {Promise<{port: number, token: string}>} */
export async function getBackendInfo() {
  if (!inTauri()) return { port: 8765, token: "dev" }; // browser dev: the dev backend
  return invoke("get_backend_info");
}

/** Native folder dialog. @returns {Promise<string|null>} the chosen path, or null if cancelled */
export async function pickFolder() {
  if (!inTauri()) return null; // no native dialog in a browser tab
  return invoke("pick_folder");
}

const DESKTOP_ONLY = "Opening files works in the desktop app (npm run tauri dev).";

/** Opens a file with its default app. Rust checks it is inside the workspace. Throws Error(message). */
export async function openFile(absPath) {
  if (!inTauri()) throw new Error(DESKTOP_ONLY);
  try {
    await invoke("open_file", { path: absPath });
  } catch (e) {
    throw new Error(String(e));
  }
}

/** Opens Explorer with the file selected. Throws Error(message). */
export async function revealInFolder(absPath) {
  if (!inTauri()) throw new Error(DESKTOP_ONLY);
  try {
    await invoke("reveal_in_folder", { path: absPath });
  } catch (e) {
    throw new Error(String(e));
  }
}

/** "main" or "quick" (the quick-search widget). In a browser tab, /quick shows the widget. */
export function windowLabel() {
  if (inTauri()) return getCurrentWindow().label;
  return window.location.pathname === "/quick" ? "quick" : "main";
}

/** Runs `cb` whenever this window gets focus (the widget is shown). @returns unsubscribe */
export function onWindowFocus(cb) {
  const onFocus = () => cb();
  window.addEventListener("focus", onFocus);
  const un = inTauri() ? getCurrentWindow().onFocusChanged(({ payload }) => payload && cb()) : null;
  return () => {
    window.removeEventListener("focus", onFocus);
    un?.then((f) => f());
  };
}

/** Listens to an event Rust sends to this window ("show-file", "autostart-changed"). @returns unsubscribe */
export function onAppEvent(name, cb) {
  if (!inTauri()) return () => {};
  const un = listen(name, (e) => cb(e.payload));
  return () => un.then((f) => f());
}

// ---- quick-search widget

export async function hideQuick() {
  if (inTauri()) await invoke("quick_hide");
}

/** Fits the widget window to its content (CSS pixels). */
export async function resizeQuick(height) {
  if (inTauri()) await invoke("quick_resize", { height });
}

/** @returns {Promise<string|null>} e.g. "Alt+Space"; null if no shortcut could be registered */
export async function getQuickShortcut() {
  return inTauri() ? invoke("quick_shortcut") : "Alt+Space";
}

/** Brings up the main window and shows the file there (folder opened, file selected). */
export async function showInApp(fileId, relPath) {
  if (inTauri()) await invoke("show_in_app", { fileId, relPath });
}

// ---- Start with Windows

/** @returns {Promise<boolean>} */
export async function getAutostart() {
  return inTauri() ? invoke("get_autostart") : false;
}

/** @returns {Promise<boolean>} the new state. Throws Error(message). */
export async function setAutostart(enabled) {
  if (!inTauri()) throw new Error("Start with Windows works in the desktop app.");
  try {
    return await invoke("set_autostart", { enabled });
  } catch (e) {
    throw new Error(String(e));
  }
}

// ---- main window

/** Closing the window: keep running in the tray. */
export async function hideMain() {
  if (inTauri()) await invoke("hide_main");
}

/** Closing the window: quit Smart Space (the backend stops too). */
export async function quitApp() {
  if (inTauri()) await invoke("quit_app");
}

/** Opens the quick-search widget (same as Alt+Space). */
export async function openQuickSearch() {
  if (inTauri()) await invoke("quick_toggle");
  else window.open("/quick", "_blank", "width=640,height=420");
}

/** Opens Smart Space's own data folder (index, models, logs) in Explorer. Throws Error(message). */
export async function openDataFolder() {
  if (!inTauri()) throw new Error(DESKTOP_ONLY);
  try {
    await invoke("open_data_folder");
  } catch (e) {
    throw new Error(String(e));
  }
}
