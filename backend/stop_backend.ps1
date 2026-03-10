$backendDirPattern = [regex]::Escape($PSScriptRoot)

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
    exit 0
}

$processes | ForEach-Object {
    Stop-Process -Id $_.ProcessId -Force
    Write-Output "Stopped backend process ID $($_.ProcessId)"
}