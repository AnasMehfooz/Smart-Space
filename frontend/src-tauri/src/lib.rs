mod commands;
mod sidecar;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Start the backend first so it is already loading while the window opens.
    let backend = sidecar::Supervisor::start(sidecar::BackendInfo::dev());

    tauri::Builder::default()
        // Plugins are used from Rust only; the webview gets no plugin permissions.
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(backend)
        .invoke_handler(tauri::generate_handler![
            commands::get_backend_info,
            commands::pick_folder,
            commands::open_file,
            commands::reveal_in_folder
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app, event| {
            if let tauri::RunEvent::Exit = event {
                app.state::<sidecar::Supervisor>().stop();
            }
        });
}
