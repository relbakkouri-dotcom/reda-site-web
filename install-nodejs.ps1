$NodeVersion = "v20.10.0"
$NodeUrl = "https://nodejs.org/dist/$NodeVersion/node-$NodeVersion-x64.msi"
$InstallerPath = "C:\Temp\node-installer.msi"

Write-Host "Downloading Node.js $NodeVersion..."
New-Item -ItemType Directory -Path "C:\Temp" -Force | Out-Null

try {
    Invoke-WebRequest -Uri $NodeUrl -OutFile $InstallerPath -ErrorAction Stop
    Write-Host "Downloaded successfully to $InstallerPath"
    
    Write-Host "Installing Node.js..."
    Start-Process -FilePath "msiexec.exe" -ArgumentList "/i", "$InstallerPath", "/quiet", "/norestart" -NoNewWindow -Wait
    Write-Host "Node.js installation completed!"
    
    # Wait a moment for PATH to update
    Start-Sleep -Seconds 3
    
    # Refresh environment
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    
    Write-Host "Verifying installation..."
    & node --version
    & npm --version
    
    Write-Host "`nNode.js is ready! Now installing project dependencies..."
    
} catch {
    Write-Host "Error: $_"
    exit 1
}
