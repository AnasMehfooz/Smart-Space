//! Desktop extras: the quick-search widget (global shortcut), the tray icon, "Start with Windows",
//! and keeping the app running in the tray when the main window is closed.

use std::sync::Mutex;
use tauri::menu::{CheckMenuItem, Menu, MenuItem, PredefinedMenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{AppHandle, Emitter, LogicalSize, Manager, PhysicalPosition, WebviewUrl, WebviewWindowBuilder, Wry};
use tauri_plugin_autostart::ManagerExt as _;
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

pub const MAIN: &str = "main";
pub const QUICK: &str = "quick";
/// Passed by Windows autostart: start in the tray without opening the main window.
pub const HIDDEN_ARG: &str = "--hidden";

const QUICK_WIDTH: f64 = 640.0;

/// Shortcuts to try, in order; the first one Windows lets us register wins
/// (Alt+Space can already be taken, e.g. by PowerToys Run).
const SHORTCUTS: [(Modifiers, Code, &str); 2] = [
    (Modifiers::ALT, Code::Space, "Alt+Space"),
    (Modifiers::CONTROL.union(Modifiers::SHIFT), Code::Space, "Ctrl+Shift+Space"),
];

/// What the rest of the app needs to know about the desktop extras.
#[derive(Default)]
pub struct DesktopState {
    /// Label of the registered quick-search shortcut, None if none could be registered.
    pub shortcut: Mutex<Option<&'static str>>,
    /// The tray's "Start with Windows" item, kept in sync when the setting changes in the app.
    autostart_item: Mutex<Option<CheckMenuItem<Wry>>>,
}

/// Called once from `setup`.
pub fn setup(app: &AppHandle) -> tauri::Result<()> {
    app.manage(DesktopState::default());
    create_quick_window(app)?;
    register_shortcut(app);
    create_tray(app)?;

    // Normal start: show the main window. Autostart at login: stay in the tray.
    if !std::env::args().any(|a| a == HIDDEN_ARG) {
        show_main(app);
    }
    Ok(())
}

// ---------------------------------------------------------------- windows

/// Shows, restores and focuses the main window.
pub fn show_main(app: &AppHandle) {
    if let Some(w) = app.get_webview_window(MAIN) {
        let _ = w.unminimize();
        let _ = w.show();
        let _ = w.set_focus();
    }
}

/// The widget: a small borderless window, created hidden once and then only shown/hidden.
fn create_quick_window(app: &AppHandle) -> tauri::Result<()> {
    WebviewWindowBuilder::new(app, QUICK, WebviewUrl::App("quick".into()))
        .title("Smart Space quick search")
        .inner_size(QUICK_WIDTH, 64.0)
        .decorations(false)
        .resizable(false)
        .maximizable(false)
        .minimizable(false)
        .always_on_top(true)
        .skip_taskbar(true)
        .shadow(true) // Windows 11: rounded corners, thin border and a shadow
        .background_color(tauri::window::Color(0x1d, 0x20, 0x25, 0xff)) // Popover surface
        .visible(false)
        .build()?;
    Ok(())
}

/// Shortcut pressed: hide the widget if it is open, otherwise open it on the screen the mouse is on.
pub fn toggle_quick(app: &AppHandle) {
    let Some(w) = app.get_webview_window(QUICK) else { return };
    if w.is_visible().unwrap_or(false) {
        let _ = w.hide();
        return;
    }
    // Upper third of the monitor under the mouse, centred horizontally.
    let monitor = app
        .cursor_position()
        .ok()
        .and_then(|p| app.monitor_from_point(p.x, p.y).ok().flatten())
        .or_else(|| app.primary_monitor().ok().flatten());
    if let Some(m) = monitor {
        let (pos, size, scale) = (m.position(), m.size(), m.scale_factor());
        let width = (QUICK_WIDTH * scale) as i32;
        let x = pos.x + (size.width as i32 - width) / 2;
        let y = pos.y + (size.height as f64 * 0.22) as i32;
        let _ = w.set_position(PhysicalPosition::new(x, y));
    }
    let _ = w.show();
    let _ = w.set_focus();
}

fn register_shortcut(app: &AppHandle) {
    let gs = app.global_shortcut();
    for (mods, code, label) in SHORTCUTS {
        match gs.register(Shortcut::new(Some(mods), code)) {
            Ok(()) => {
                *app.state::<DesktopState>().shortcut.lock().unwrap() = Some(label);
                println!("[smart-space] quick search on {label}");
                return;
            }
            Err(e) => eprintln!("[smart-space] could not register {label}: {e}"),
        }
    }
}

/// The global-shortcut plugin; its handler opens or closes the widget.
pub fn shortcut_plugin() -> tauri::plugin::TauriPlugin<Wry> {
    tauri_plugin_global_shortcut::Builder::new()
        .with_handler(|app, _shortcut, event| {
            if event.state() == ShortcutState::Pressed {
                toggle_quick(app);
            }
        })
        .build()
}

/// Window events. Closing the main window is decided by the app: it asks once whether to keep running in the
/// tray (so quick search and folder watching keep working) or quit, then remembers the answer and calls
/// `hide_main` or `quit_app`. The widget hides as soon as it loses focus.
pub fn on_window_event(window: &tauri::Window, event: &tauri::WindowEvent) {
    match (window.label(), event) {
        (MAIN, tauri::WindowEvent::CloseRequested { api, .. }) => {
            api.prevent_close();
            let _ = window.emit_to(MAIN, "close-requested", ());
        }
        (QUICK, tauri::WindowEvent::Focused(false)) => {
            let _ = window.hide();
        }
        _ => {}
    }
}

// ---------------------------------------------------------------- tray

fn create_tray(app: &AppHandle) -> tauri::Result<()> {
    let shortcut = app.state::<DesktopState>().shortcut.lock().unwrap().unwrap_or("");
    let open = MenuItem::with_id(app, "open", "Open Smart Space", true, None::<&str>)?;
    let quick = MenuItem::with_id(app, "quick", format!("Quick search\t{shortcut}"), true, None::<&str>)?;
    let autostart = CheckMenuItem::with_id(
        app,
        "autostart",
        "Start with Windows",
        true,
        app.autolaunch().is_enabled().unwrap_or(false),
        None::<&str>,
    )?;
    let quit = MenuItem::with_id(app, "quit", "Quit Smart Space", true, None::<&str>)?;
    let sep = || PredefinedMenuItem::separator(app);
    let menu = Menu::with_items(app, &[&open, &quick, &sep()?, &autostart, &sep()?, &quit])?;
    *app.state::<DesktopState>().autostart_item.lock().unwrap() = Some(autostart);

    let mut tray = TrayIconBuilder::with_id("smart-space")
        .tooltip("Smart Space")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, e| match e.id().as_ref() {
            "open" => show_main(app),
            "quick" => toggle_quick(app),
            "autostart" => {
                // The check mark has already flipped; read it and apply it.
                let want = app
                    .state::<DesktopState>()
                    .autostart_item
                    .lock()
                    .unwrap()
                    .as_ref()
                    .and_then(|i| i.is_checked().ok())
                    .unwrap_or(false);
                let _ = set_autostart(app, want);
            }
            "quit" => app.exit(0),
            _ => {}
        })
        .on_tray_icon_event(|tray, e| {
            if let TrayIconEvent::Click { button: MouseButton::Left, button_state: MouseButtonState::Up, .. } = e {
                show_main(tray.app_handle());
            }
        });
    if let Some(icon) = app.default_window_icon() {
        tray = tray.icon(icon.clone());
    }
    tray.build(app)?;
    Ok(())
}

// ---------------------------------------------------------------- autostart

/// Turns "Start with Windows" on or off and updates the tray check mark. Returns the new state.
pub fn set_autostart(app: &AppHandle, enabled: bool) -> Result<bool, String> {
    let al = app.autolaunch();
    let res = if enabled { al.enable() } else { al.disable() };
    res.map_err(|e| format!("Could not change \"Start with Windows\": {e}"))?;
    let now = al.is_enabled().unwrap_or(enabled);
    if let Some(item) = app.state::<DesktopState>().autostart_item.lock().unwrap().as_ref() {
        let _ = item.set_checked(now);
    }
    let _ = app.emit_to(MAIN, "autostart-changed", now);
    Ok(now)
}

// ---------------------------------------------------------------- widget helpers used by commands

/// The widget's content changed height: fit the window to it.
pub fn resize_quick(app: &AppHandle, height: f64) {
    if let Some(w) = app.get_webview_window(QUICK) {
        let _ = w.set_size(LogicalSize::new(QUICK_WIDTH, height.clamp(56.0, 560.0)));
    }
}

pub fn hide_main(app: &AppHandle) {
    if let Some(w) = app.get_webview_window(MAIN) {
        let _ = w.hide();
    }
}

pub fn hide_quick(app: &AppHandle) {
    if let Some(w) = app.get_webview_window(QUICK) {
        let _ = w.hide();
    }
}
