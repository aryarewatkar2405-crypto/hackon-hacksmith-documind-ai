$backendDirPattern = [regex]::Escape($PSScriptRoot)
$stopFlagPath = Join-Path $PSScriptRoot ".backend_stop"

# Signal watchdog to stop restarting backend after process shutdown.
Set-Content -Path $stopFlagPath -Value "stop"

$processes = Get-CimInstance Win32_Process |
    Where-Object {
        $_.Name -match "python" -and
        $_.CommandLine -and
        $_.CommandLine -match "uvicorn" -and
        $_.CommandLine -match "main:app" -and
        $_.CommandLine -match "--app-dir" -and
        $_.CommandLine -match $backendDirPattern
    }

if (-not $processes) {
    Write-Output "No DocuMind backend process found."
} else {
    $processes | ForEach-Object {
        Stop-Process -Id $_.ProcessId -Force
        Write-Output "Stopped backend process ID $($_.ProcessId)"
    }
}

# Stop watchdog PowerShell processes for this backend project.
$watchdogPattern = [regex]::Escape((Join-Path $PSScriptRoot "backend_watchdog.ps1"))
$watchdogs = Get-CimInstance Win32_Process |
    Where-Object {
        $_.Name -match "powershell" -and
        $_.CommandLine -and
        $_.CommandLine -match $watchdogPattern
    }

$watchdogs | ForEach-Object {
    Stop-Process -Id $_.ProcessId -Force
    Write-Output "Stopped watchdog process ID $($_.ProcessId)"
}