$projectRoot = $PSScriptRoot
$frontendDir = Join-Path $projectRoot "frontend"

if (-not (Test-Path (Join-Path $frontendDir "package.json"))) {
    Write-Error "Frontend package.json not found at $frontendDir"
    exit 1
}

$frontendPattern = [regex]::Escape($frontendDir)

# Stop existing Vite/node processes for this frontend to avoid port/process conflicts.
$runningFrontend = Get-CimInstance Win32_Process |
    Where-Object {
        $_.Name -match "node" -and
        $_.CommandLine -and
        $_.CommandLine -match "vite" -and
        $_.CommandLine -match $frontendPattern
    }

$runningFrontend | ForEach-Object {
    Stop-Process -Id $_.ProcessId -Force
    Write-Output "Stopped frontend process ID $($_.ProcessId)"
}

if (-not (Test-Path (Join-Path $frontendDir "node_modules"))) {
    Write-Output "Installing frontend dependencies..."
    Push-Location $frontendDir
    try {
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Error "npm install failed."
            exit 1
        }
    } finally {
        Pop-Location
    }
}

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-ExecutionPolicy",
    "Bypass",
    "-Command",
    "Set-Location '$frontendDir'; npm run dev -- --host 127.0.0.1 --port 5173 --strictPort"
)

Write-Output "Frontend started at http://127.0.0.1:5173"