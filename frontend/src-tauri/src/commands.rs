//! Commands the React app can call (through src/lib/tauri.js only).

use crate::sidecar::{BackendInfo, Supervisor};
use std::path::PathBuf;
use tauri_plugin_dialog::DialogExt;
use tauri_plugin_opener::OpenerExt;

/// The backend's port and token.
#[tauri::command]
pub fn get_backend_info(backend: tauri::State<'_, Supervisor>) -> BackendInfo {
    backend.info()
}

/// Opens the native Windows folder picker. Returns the chosen path, or None if the user cancels.
#[tauri::command]
pub async fn pick_folder(app: tauri::AppHandle) -> Option<String> {
    app.dialog()
        .file()
        .set_title("Choose the folder Smart Space should read")
        .blocking_pick_folder()
        .and_then(|p| p.into_path().ok())
        .map(|p| p.to_string_lossy().into_owned())
}

/// Opens a file with its default Windows app. Only files inside the Smart Space folder.
#[tauri::command]
pub async fn open_file(
    app: tauri::AppHandle,
    backend: tauri::State<'_, Supervisor>,
    path: String,
) -> Result<(), String> {
    inside_workspace(&backend, &path)?;
    app.opener()
        .open_path(path, None::<&str>)
        .map_err(|e| format!("Could not open the file: {e}"))
}

/// Opens Explorer with the file selected. Only files inside the Smart Space folder.
#[tauri::command]
pub async fn reveal_in_folder(
    app: tauri::AppHandle,
    backend: tauri::State<'_, Supervisor>,
    path: String,
) -> Result<(), String> {
    inside_workspace(&backend, &path)?;
    app.opener()
        .reveal_item_in_dir(&path)
        .map_err(|e| format!("Could not show the file: {e}"))
}

/// Security check: the path must exist and resolve to somewhere inside the workspace root
/// (canonicalized, so "..\" tricks and links pointing outside are rejected).
fn inside_workspace(backend: &Supervisor, path: &str) -> Result<PathBuf, String> {
    let root = backend.workspace_root().ok_or("No folder is set up in Smart Space.")?;
    let root = std::fs::canonicalize(root).map_err(|_| "The Smart Space folder is not available.")?;
    let file = std::fs::canonicalize(path).map_err(|_| "This file no longer exists.")?;
    if !file.starts_with(&root) {
        return Err("This file is outside the Smart Space folder.".into());
    }
    Ok(file)
}

// ---------------------------------------------------------------- quick search and autostart

/// Hides the quick-search widget (Esc, or after opening a file).
#[tauri::command]
pub fn quick_hide(app: tauri::AppHandle) {
    crate::desktop::hide_quick(&app);
}

/// Fits the widget window to its content height (logical pixels).
#[tauri::command]
pub fn quick_resize(app: tauri::AppHandle, height: f64) {
    crate::desktop::resize_quick(&app, height);
}

/// The registered quick-search shortcut, e.g. "Alt+Space"; None if Windows refused all of them.
#[tauri::command]
pub fn quick_shortcut(state: tauri::State<'_, crate::desktop::DesktopState>) -> Option<String> {
    state.shortcut.lock().unwrap().map(str::to_owned)
}

/// From the widget: hides it, brings up the main window and shows the file there.
#[tauri::command]
pub fn show_in_app(app: tauri::AppHandle, file_id: i64, rel_path: String) {
    use tauri::Emitter;
    crate::desktop::hide_quick(&app);
    crate::desktop::show_main(&app);
    let _ = app.emit_to(crate::desktop::MAIN, "show-file", serde_json::json!({ "file_id": file_id, "rel_path": rel_path }));
}

/// Whether Smart Space starts (in the tray) when the user signs in to Windows.
#[tauri::command]
pub fn get_autostart(app: tauri::AppHandle) -> bool {
    use tauri_plugin_autostart::ManagerExt;
    app.autolaunch().is_enabled().unwrap_or(false)
}

#[tauri::command]
pub fn set_autostart(app: tauri::AppHandle, enabled: bool) -> Result<bool, String> {
    crate::desktop::set_autostart(&app, enabled)
}

// ---------------------------------------------------------------- main window, data folder

/// Closing the window: keep Smart Space running in the tray.
#[tauri::command]
pub fn hide_main(app: tauri::AppHandle) {
    crate::desktop::hide_main(&app);
}

/// Closing the window: quit Smart Space (stops the backend).
#[tauri::command]
pub fn quit_app(app: tauri::AppHandle) {
    app.exit(0);
}

/// Opens (or closes) the quick-search widget, e.g. from the "Search  Alt+Space" button on Home.
#[tauri::command]
pub fn quick_toggle(app: tauri::AppHandle) {
    crate::desktop::toggle_quick(&app);
}

/// Opens the folder where Smart Space keeps its own data (index, models, logs) in Explorer, for the Privacy page.
#[tauri::command]
pub async fn open_data_folder(app: tauri::AppHandle, backend: tauri::State<'_, Supervisor>) -> Result<(), String> {
    let dir = backend.data_dir().ok_or("Smart Space could not find its data folder.")?;
    app.opener()
        .open_path(dir.to_string_lossy(), None::<&str>)
        .map_err(|e| format!("Could not open the folder: {e}"))
}
