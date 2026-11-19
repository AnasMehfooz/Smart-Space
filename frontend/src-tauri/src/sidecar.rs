//! Starts the backend when the app opens and stops it when the app closes.
//!
//! Now (development): runs the Python backend from ../../backend with `uv`, like scripts\dev_backend.ps1.
//! Later (installer): this file spawns the packaged backend instead. React does not change either way,
//! because it only ever asks get_backend_info() where the backend is.
//!
//! If a backend already answers on the port (e.g. started by hand with dev_backend.ps1), the app uses it
//! and leaves it running when it closes.

use serde::Serialize;
use std::io::{Read, Write};
use std::net::{SocketAddr, TcpStream};
use std::path::PathBuf;
use std::process::{Child, Command};
use std::sync::Mutex;
use std::time::{Duration, Instant};

#[derive(Clone, Serialize)]
pub struct BackendInfo {
    pub port: u16,
    pub token: String,
}

impl BackendInfo {
    /// Dev values: port 8765 and token "dev", unless SS_PORT / SS_TOKEN are set.
    pub fn dev() -> Self {
        let port = std::env::var("SS_PORT")
            .ok()
            .and_then(|p| p.parse().ok())
            .unwrap_or(8765);
        let token = std::env::var("SS_TOKEN").unwrap_or_else(|_| "dev".to_string());
        Self { port, token }
    }
}

/// Owns the backend process we started (None if we are using one that was already running).
pub struct Supervisor {
    info: BackendInfo,
    child: Mutex<Option<Child>>,
    #[cfg(windows)]
    job: Mutex<Option<job::Job>>,
}

impl Supervisor {
    pub fn start(info: BackendInfo) -> Self {
        let sup = Self {
            info,
            child: Mutex::new(None),
            #[cfg(windows)]
            job: Mutex::new(None),
        };

        if is_up(sup.info.port) {
            log(&format!("using the backend that is already running on port {}", sup.info.port));
            return sup;
        }

        match spawn(&sup.info) {
            Ok(child) => {
                log(&format!("started the backend (pid {})", child.id()));
                // Everything the backend starts (python, llama-server) ends with this job, even if the app crashes.
                #[cfg(windows)]
                {
                    *sup.job.lock().unwrap() = job::Job::for_child(&child);
                }
                *sup.child.lock().unwrap() = Some(child);
            }
            Err(e) => log(&format!("could not start the backend: {e}. Is uv installed and on PATH?")),
        }
        sup
    }

    pub fn info(&self) -> BackendInfo {
        self.info.clone()
    }

    /// The workspace folder, asked from the backend (GET /workspace), so there is one source of truth.
    pub fn workspace_root(&self) -> Option<PathBuf> {
        let req = format!(
            "GET /api/v1/workspace HTTP/1.0\r\nHost: 127.0.0.1\r\nAuthorization: Bearer {}\r\n\r\n",
            self.info.token
        );
        let res = http(self.info.port, &req, Duration::from_secs(3))?;
        let body = res.split_once("\r\n\r\n")?.1;
        let json: serde_json::Value = serde_json::from_str(body).ok()?;
        json.get("root_path")?.as_str().map(PathBuf::from)
    }

    /// Graceful stop: ask the backend to shut down (flushes the database, stops llama-server), wait up to 3 s,
    /// then end whatever is left.
    pub fn stop(&self) {
        let Some(mut child) = self.child.lock().unwrap().take() else {
            return; // not ours
        };
        log("stopping the backend");
        let req = format!(
            "POST /api/v1/system/shutdown HTTP/1.0\r\nHost: 127.0.0.1\r\nAuthorization: Bearer {}\r\nContent-Length: 0\r\n\r\n",
            self.info.token
        );
        let _ = http(self.info.port, &req, Duration::from_secs(3));

        let deadline = Instant::now() + Duration::from_secs(3);
        while Instant::now() < deadline {
            if let Ok(Some(_)) = child.try_wait() {
                break;
            }
            std::thread::sleep(Duration::from_millis(100));
        }
        #[cfg(windows)]
        if let Some(job) = self.job.lock().unwrap().take() {
            job.terminate();
        }
        let _ = child.kill();
        let _ = child.wait();
        log("backend stopped");
    }
}

fn spawn(info: &BackendInfo) -> std::io::Result<Child> {
    let backend_dir = std::env::var_os("SS_BACKEND_DIR")
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("..").join("..").join("backend"));
    let data_dir = std::env::var("SS_DATA_DIR").unwrap_or_else(|_| r"C:\SmartSpaceDemo".to_string());

    let mut cmd = Command::new("uv");
    cmd.args(["run", "--python", "3.11", "python", "-m", "app"])
        .current_dir(backend_dir)
        .env("SS_PORT", info.port.to_string())
        .env("SS_TOKEN", &info.token)
        .env("SS_DEV", "1")
        .env("SS_DATA_DIR", data_dir);

    // Release builds have no console: hide the backend's window (its log is in <data dir>\logs\backend.log).
    #[cfg(all(windows, not(debug_assertions)))]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x0800_0000;
        cmd.creation_flags(CREATE_NO_WINDOW)
            .stdout(std::process::Stdio::null())
            .stderr(std::process::Stdio::null());
    }
    cmd.spawn()
}

/// True if something answers GET /health with 200.
fn is_up(port: u16) -> bool {
    http(port, "GET /api/v1/health HTTP/1.0\r\nHost: 127.0.0.1\r\n\r\n", Duration::from_millis(800))
        .is_some_and(|r| r.starts_with("HTTP/1.1 200") || r.starts_with("HTTP/1.0 200"))
}

/// Tiny HTTP/1.0 request to the local backend (no HTTP client crate needed for two calls).
fn http(port: u16, request: &str, timeout: Duration) -> Option<String> {
    let addr = SocketAddr::from(([127, 0, 0, 1], port));
    let mut s = TcpStream::connect_timeout(&addr, timeout).ok()?;
    s.set_read_timeout(Some(timeout)).ok()?;
    s.set_write_timeout(Some(timeout)).ok()?;
    s.write_all(request.as_bytes()).ok()?;
    let mut out = String::new();
    s.read_to_string(&mut out).ok()?;
    Some(out)
}

fn log(msg: &str) {
    eprintln!("[smart-space] {msg}");
}

#[cfg(windows)]
mod job {
    //! Windows Job Object: when the app exits or crashes, Windows ends every process in the job.
    use std::os::windows::io::AsRawHandle;
    use windows_sys::Win32::Foundation::{CloseHandle, HANDLE};
    use windows_sys::Win32::System::JobObjects::{
        AssignProcessToJobObject, CreateJobObjectW, JobObjectExtendedLimitInformation, SetInformationJobObject,
        TerminateJobObject, JOBOBJECT_EXTENDED_LIMIT_INFORMATION, JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE,
    };

    pub struct Job(isize); // HANDLE stored as an integer so the struct can live in Tauri state

    impl Job {
        pub fn for_child(child: &std::process::Child) -> Option<Self> {
            unsafe {
                let h: HANDLE = CreateJobObjectW(std::ptr::null(), std::ptr::null());
                if h.is_null() {
                    return None;
                }
                let mut limits: JOBOBJECT_EXTENDED_LIMIT_INFORMATION = std::mem::zeroed();
                limits.BasicLimitInformation.LimitFlags = JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE;
                let ok = SetInformationJobObject(
                    h,
                    JobObjectExtendedLimitInformation,
                    &limits as *const _ as *const core::ffi::c_void,
                    std::mem::size_of_val(&limits) as u32,
                ) != 0
                    && AssignProcessToJobObject(h, child.as_raw_handle() as HANDLE) != 0;
                if !ok {
                    CloseHandle(h);
                    return None;
                }
                Some(Job(h as isize))
            }
        }

        pub fn terminate(&self) {
            unsafe {
                TerminateJobObject(self.0 as HANDLE, 1);
            }
        }
    }

    impl Drop for Job {
        fn drop(&mut self) {
            unsafe {
                CloseHandle(self.0 as HANDLE);
            }
        }
    }
}
