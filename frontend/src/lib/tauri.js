// The ONLY place that talks to Rust. Components call these functions, never invoke() directly.
import { invoke } from "@tauri-apps/api/core";

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
