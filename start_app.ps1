$projectRoot = $PSScriptRoot

# Start backend using the existing stable backend starter script.
& (Join-Path $projectRoot "start_backend.ps1")

# Start frontend in a new PowerShell window.
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-ExecutionPolicy",
    "Bypass",
    "-Command",
    "Set-Location '$projectRoot\\frontend'; npm run dev"
)

# Open the frontend URL automatically after startup.
Start-Sleep -Seconds 2
Start-Process "http://localhost:5173"

Write-Output "DocuMind AI started. Frontend: http://localhost:5173 | Backend: http://127.0.0.1:8000"