$backendDir = $PSScriptRoot
$watchdogScript = Join-Path $backendDir "backend_watchdog.ps1"
$stopFlagPath = Join-Path $backendDir ".backend_stop"

# Stop any already running backend instance for this project to avoid port conflicts.
& (Join-Path $backendDir "stop_backend.ps1") | Out-Null

if (Test-Path $stopFlagPath) {
    Remove-Item $stopFlagPath -Force
}

# Start backend using a watchdog process that auto-restarts it if it crashes.
Start-Process -FilePath powershell -ArgumentList @(
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    $watchdogScript
) -WorkingDirectory $backendDir -WindowStyle Hidden

Write-Output "Backend watchdog started at http://127.0.0.1:8000"