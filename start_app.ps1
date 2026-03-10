$projectRoot = $PSScriptRoot

# Start backend using the existing stable backend starter script.
& (Join-Path $projectRoot "start_backend.ps1")

# Wait for backend to be healthy.
$backendHealthy = $false
for ($i = 0; $i -lt 20; $i++) {
    try {
        $resp = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/health" -Method Get -TimeoutSec 2
        if ($resp.status -eq "running") {
            $backendHealthy = $true
            break
        }
    } catch {
    }
    Start-Sleep -Milliseconds 700
}

if (-not $backendHealthy) {
    Write-Warning "Backend health check did not pass yet. It may still be starting."
}

# Start frontend using the dedicated resilient starter script.
& (Join-Path $projectRoot "start_frontend.ps1")

# Wait for frontend port before opening browser.
$frontendReady = $false
for ($i = 0; $i -lt 30; $i++) {
    try {
        $conn = Test-NetConnection -ComputerName 127.0.0.1 -Port 5173 -WarningAction SilentlyContinue
        if ($conn.TcpTestSucceeded) {
            $frontendReady = $true
            break
        }
    } catch {
    }
    Start-Sleep -Milliseconds 700
}

if ($frontendReady) {
    Start-Process "http://127.0.0.1:5173"
} else {
    Write-Warning "Frontend port 5173 not reachable yet. Check the frontend terminal output."
}

Write-Output "DocuMind AI startup triggered. Frontend: http://127.0.0.1:5173 | Backend: http://127.0.0.1:8000"