# PowerShell script to kill process using port 4000
$port = 4000
$processes = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($processes) {
    foreach ($pid in $processes) {
        Write-Host "Killing process $pid using port $port..."
        Stop-Process -Id $pid -Force
        Write-Host "Process $pid terminated."
    }
} else {
    Write-Host "No process found using port $port"
}

