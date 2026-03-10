$backendDir = $PSScriptRoot

# Stop any already running backend instance for this project to avoid port conflicts.
& (Join-Path $backendDir "stop_backend.ps1") | Out-Null

Start-Process -FilePath python -ArgumentList @(
    "-m",
    "uvicorn",
    "main:app",
    "--app-dir",
    $backendDir,
    "--host",
    "127.0.0.1",
    "--port",
    "8000"
) -WorkingDirectory $backendDir

Write-Output "Backend started at http://127.0.0.1:8000"