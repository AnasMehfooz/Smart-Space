mod commands;
mod desktop;
mod sidecar;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // Must be first: a second start (e.g. clicking the shortcut while Smart Space already runs in the tray)
        // only brings up the existing window instead of starting a second app and backend.
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| desktop::show_main(app)))
        // Plugins are used from Rust only; the webview gets no plugin permissions.
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_autostart::Builder::new().args([desktop::HIDDEN_ARG]).build())
        .plugin(desktop::shortcut_plugin())
        .setup(|app| {
            // Start the backend first so it is already loading while the window opens. The installed app runs the
            // packaged backend from its resources; `tauri dev` runs the Python sources with uv (SS_USE_BUNDLED=1
            // tries the packaged one in dev too).
            let bundled = app
                .path()
                .resource_dir()
                .ok()
                .map(|d| d.join("backend").join("smartspace-backend.exe"))
                .filter(|exe| exe.exists());
            let want_bundled = !cfg!(debug_assertions) || std::env::var_os("SS_USE_BUNDLED").is_some();
            let (info, launch) = match bundled {
                Some(exe) if want_bundled => (sidecar::BackendInfo::bundled(), sidecar::Launch::Bundled(exe)),
                _ => (sidecar::BackendInfo::dev(), sidecar::Launch::Dev),
            };
            app.manage(sidecar::Supervisor::start(info, launch));
            desktop::setup(app.handle())?;
            Ok(())
        })
        .on_window_event(desktop::on_window_event)
        .invoke_handler(tauri::generate_handler![
            commands::get_backend_info,
            commands::pick_folder,
            commands::open_file,
            commands::reveal_in_folder,
            commands::quick_hide,
            commands::quick_resize,
            commands::quick_shortcut,
            commands::show_in_app,
            commands::get_autostart,
            commands::set_autostart,
            commands::hide_main,
            commands::quit_app,
            commands::quick_toggle,
            commands::open_data_folder
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app, event| {
            if let tauri::RunEvent::Exit = event {
                if let Some(backend) = app.try_state::<sidecar::Supervisor>() {
                    backend.stop();
                }
            }
        });
}
