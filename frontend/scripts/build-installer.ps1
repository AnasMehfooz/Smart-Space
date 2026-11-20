<#
.SYNOPSIS
  Builds the Smart Space Windows installer with the backend bundled inside.

.DESCRIPTION
  1. Builds the backend with PyInstaller (scripts\build_backend.ps1 -> backend\dist\smartspace-backend\).
     Skip with -SkipBackend when it is already built and the backend did not change.
  2. Leaves out the NVIDIA-only llama.cpp build (bin\llama\cuda, ~776 MB). The Vulkan build runs on NVIDIA, AMD and
     Intel graphics and the CPU build covers the rest, so the installer stays around 1 GB instead of 1.9 GB.
  3. Builds the app and the NSIS installer (tauri build with src-tauri\tauri.bundle.conf.json, which adds the
     backend folder as a resource).

  Output: src-tauri\target\release\bundle\nsis\Smart Space_<version>_x64-setup.exe

.EXAMPLE
  npm run build:installer
  powershell -ExecutionPolicy Bypass -File scripts\build-installer.ps1 -SkipBackend
#>
param([switch]$SkipBackend)
$ErrorActionPreference = "Stop"

$frontend = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$repo = [System.IO.Path]::GetFullPath((Join-Path $frontend ".."))
$dist = Join-Path $repo "backend\dist\smartspace-backend"

# uv keeps its Python here on machines where the default AppData location is redirected.
$uvPython = Join-Path $env:USERPROFILE ".local\share\uv\python"
if (-not $env:UV_PYTHON_INSTALL_DIR -and (Test-Path $uvPython)) { $env:UV_PYTHON_INSTALL_DIR = $uvPython }

if (-not $SkipBackend) {
    Write-Host "== 1/3 Building the backend (PyInstaller)" -ForegroundColor Cyan
    & powershell -ExecutionPolicy Bypass -File (Join-Path $repo "scripts\build_backend.ps1")
    if ($LASTEXITCODE -ne 0) { throw "Backend build failed" }
}
if (-not (Test-Path (Join-Path $dist "smartspace-backend.exe"))) {
    throw "No backend build at $dist. Run without -SkipBackend."
}

Write-Host "== 2/3 Leaving out the NVIDIA-only engine (Vulkan + CPU stay)" -ForegroundColor Cyan
$cuda = Join-Path $dist "bin\llama\cuda"
if (Test-Path $cuda) { Remove-Item -Recurse -Force $cuda }
$size = (Get-ChildItem -Recurse $dist | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host ("Backend to bundle: {0:N0} MB" -f $size)

Write-Host "== 3/3 Building the app and the installer" -ForegroundColor Cyan
Push-Location $frontend
try {
    npx tauri build --config src-tauri/tauri.bundle.conf.json
    if ($LASTEXITCODE -ne 0) { throw "tauri build failed" }
} finally {
    Pop-Location
}

$setup = Get-ChildItem (Join-Path $frontend "src-tauri\target\release\bundle\nsis") -Filter "*-setup.exe" |
    Sort-Object LastWriteTime -Descending | Select-Object -First 1
Write-Host ("Installer: {0} ({1:N0} MB)" -f $setup.FullName, ($setup.Length / 1MB)) -ForegroundColor Green
