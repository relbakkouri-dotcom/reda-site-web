# Install Node.js v20 LTS
Write-Host "========================================"
Write-Host "Installing Node.js v20 LTS..."
Write-Host "========================================"
Write-Host ""

# Create temp directory
$TempDir = "C:\Temp"
New-Item -ItemType Directory -Path $TempDir -Force | Out-Null

# Download Node.js
$NodeVersion = "v20.10.0"
$NodeUrl = "https://nodejs.org/dist/$NodeVersion/node-$NodeVersion-x64.msi"
$InstallerPath = "$TempDir\node-installer.msi"

Write-Host "Downloading Node.js installer..."
try {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri $NodeUrl -OutFile $InstallerPath -UseBasicParsing -ErrorAction Stop
    Write-Host "Download complete!"
} catch {
    Write-Host "Download failed: $_"
    exit 1
}

# Install Node.js
Write-Host ""
Write-Host "Installing Node.js..."
try {
    Start-Process -FilePath "msiexec.exe" -ArgumentList "/i", "$InstallerPath", "/quiet", "/norestart" -NoNewWindow -Wait
    Write-Host "Installation complete!"
} catch {
    Write-Host "Installation failed: $_"
    exit 1
}

# Wait for PATH update
Write-Host ""
Write-Host "Waiting for system to update..."
Start-Sleep -Seconds 10

# Refresh environment
$MachinePath = [System.Environment]::GetEnvironmentVariable("Path","Machine")
$UserPath = [System.Environment]::GetEnvironmentVariable("Path","User")
$env:Path = $MachinePath + ";" + $UserPath

# Verify installation
Write-Host ""
Write-Host "Verifying installation..."
try {
    $NodePath = "C:\Program Files\nodejs\node.exe"
    $NpmPath = "C:\Program Files\nodejs\npm.cmd"
    
    if (Test-Path $NodePath) {
        $NodeVer = & $NodePath --version
        Write-Host "Node.js $NodeVer installed successfully"
    } else {
        Write-Host "Node.js executable not found"
        exit 1
    }
    
    if (Test-Path $NpmPath) {
        $NpmVer = & $NpmPath --version
        Write-Host "npm $NpmVer installed successfully"
    }
} catch {
    Write-Host "Verification failed: $_"
    exit 1
}

Write-Host ""
Write-Host "========================================"
Write-Host "Installation Successful!"
Write-Host "========================================"
