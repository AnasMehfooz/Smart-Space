// Small per-PC preferences of the window (not backend settings). Stored in the webview's localStorage; every
// read and write is guarded, so the app works the same when storage is unavailable.

const PREFIX = "smartspace.";

export const PREF = {
  tourSeen: "tour-seen.v1", // "1" once the first-time tour was finished or skipped
  closeAction: "close-action", // "tray" | "quit"; unset = ask the first time the window is closed
};

export function getPref(key) {
  try {
    return window.localStorage.getItem(PREFIX + key);
  } catch {
    return null;
  }
}

export function setPref(key, value) {
  try {
    if (value == null) window.localStorage.removeItem(PREFIX + key);
    else window.localStorage.setItem(PREFIX + key, value);
  } catch {
    /* storage unavailable: the preference lasts until the window closes */
  }
}
