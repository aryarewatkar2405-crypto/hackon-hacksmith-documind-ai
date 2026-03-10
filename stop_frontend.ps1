$projectRoot = $PSScriptRoot
$frontendDir = Join-Path $projectRoot "frontend"
$frontendPattern = [regex]::Escape($frontendDir)

$frontendProcesses = Get-CimInstance Win32_Process |
    Where-Object {
        $_.Name -match "node" -and
        $_.CommandLine -and
        $_.CommandLine -match "vite" -and
        $_.CommandLine -match $frontendPattern
    }

if (-not $frontendProcesses) {
    Write-Output "No frontend process found."
    exit 0
}

$frontendProcesses | ForEach-Object {
    Stop-Process -Id $_.ProcessId -Force
    Write-Output "Stopped frontend process ID $($_.ProcessId)"
}