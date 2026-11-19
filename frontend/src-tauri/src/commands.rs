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
