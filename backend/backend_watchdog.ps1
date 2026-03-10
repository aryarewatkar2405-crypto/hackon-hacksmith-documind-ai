$backendDir = $PSScriptRoot
$stopFlagPath = Join-Path $backendDir ".backend_stop"
$logDir = Join-Path $backendDir "logs"
$stdoutLog = Join-Path $logDir "backend_stdout.log"
$stderrLog = Join-Path $logDir "backend_stderr.log"
$watchdogLog = Join-Path $logDir "backend_watchdog.log"

New-Item -ItemType Directory -Path $logDir -Force | Out-Null

$pythonCmd = Get-Command python -ErrorAction SilentlyContinue
$pyLauncher = Get-Command py -ErrorAction SilentlyContinue

if (-not $pythonCmd -and -not $pyLauncher) {
    Add-Content -Path $watchdogLog -Value "[$(Get-Date -Format o)] No Python executable found in PATH. Watchdog exiting."
    exit 1
}

$restartCount = 0

while ($true) {
    if (Test-Path $stopFlagPath) {
        Remove-Item $stopFlagPath -Force
        Add-Content -Path $watchdogLog -Value "[$(Get-Date -Format o)] Stop flag found. Watchdog exiting."
        break
    }

    Add-Content -Path $watchdogLog -Value "[$(Get-Date -Format o)] Starting backend process..."

    Push-Location $backendDir
    try {
        if ($pythonCmd) {
            & python -m uvicorn main:app --app-dir "$backendDir" --host 127.0.0.1 --port 8000 1>> $stdoutLog 2>> $stderrLog
        } else {
            & py -3 -m uvicorn main:app --app-dir "$backendDir" --host 127.0.0.1 --port 8000 1>> $stdoutLog 2>> $stderrLog
        }
        $exitCode = $LASTEXITCODE
    } finally {
        Pop-Location
    }

    Add-Content -Path $watchdogLog -Value "[$(Get-Date -Format o)] Backend process exited with code $exitCode."

    if (Test-Path $stopFlagPath) {
        Remove-Item $stopFlagPath -Force
        Add-Content -Path $watchdogLog -Value "[$(Get-Date -Format o)] Backend stopped by user request."
        break
    }

    $restartCount += 1
    $sleepSeconds = if ($restartCount -lt 5) { 2 } elseif ($restartCount -lt 10) { 5 } else { 10 }
    Add-Content -Path $watchdogLog -Value "[$(Get-Date -Format o)] Backend exited unexpectedly. Restarting in $sleepSeconds s..."
    Start-Sleep -Seconds $sleepSeconds
}