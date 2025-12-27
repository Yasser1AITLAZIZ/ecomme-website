# PowerShell script to build and push Docker images to Docker Hub
# Usage: .\build-and-push.ps1 [version] [dockerhub-username]

param(
    [string]$Version = "latest",
    [string]$DockerHubUsername = "yasser1aitlaziz",
    [string]$RepoPrefix = "primostore"
)

Write-Host "========================================" -ForegroundColor Blue
Write-Host "Building and Pushing Docker Images" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host "Version: $Version" -ForegroundColor Yellow
Write-Host "Docker Hub Username: $DockerHubUsername" -ForegroundColor Yellow
Write-Host "Repository Prefix: $RepoPrefix" -ForegroundColor Yellow
Write-Host ""

# Check if user is logged in to Docker Hub
Write-Host "Checking Docker Hub authentication..." -ForegroundColor Cyan
$dockerConfig = "$env:USERPROFILE\.docker\config.json"
$isLoggedIn = $false

if (Test-Path $dockerConfig) {
    try {
        $config = Get-Content $dockerConfig | ConvertFrom-Json
        $dockerHubAuth = $config.auths.PSObject.Properties | Where-Object { $_.Name -like '*docker.io*' -or $_.Name -like '*docker.com*' }
        if ($dockerHubAuth) {
            $isLoggedIn = $true
            Write-Host "[OK] Docker Hub authentication found" -ForegroundColor Green
        }
    } catch {
        # Config exists but might not have auth
    }
}

if (-not $isLoggedIn) {
    Write-Host "" -ForegroundColor Yellow
    Write-Host "[WARNING] Not logged in to Docker Hub!" -ForegroundColor Yellow
    Write-Host "Please run: docker login" -ForegroundColor Yellow
    Write-Host "Or: docker login --username $DockerHubUsername" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        Write-Host "Aborted. Please log in to Docker Hub first." -ForegroundColor Red
        exit 1
    }
}

# Build and push Backend
Write-Host "Building backend image..." -ForegroundColor Green
docker build -t "${DockerHubUsername}/${RepoPrefix}-backend:$Version" `
             -t "${DockerHubUsername}/${RepoPrefix}-backend:latest" `
             ./backend

if ($LASTEXITCODE -ne 0) {
    Write-Host "Backend build failed! Please check the errors above." -ForegroundColor Red
    exit 1
}

Write-Host "Pushing backend image..." -ForegroundColor Green
docker push "${DockerHubUsername}/${RepoPrefix}-backend:$Version"
docker push "${DockerHubUsername}/${RepoPrefix}-backend:latest"

if ($LASTEXITCODE -ne 0) {
    Write-Host "" -ForegroundColor Red
    Write-Host "Backend push failed!" -ForegroundColor Red
    Write-Host "" -ForegroundColor Yellow
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "  1. Not logged in to Docker Hub - Run: docker login" -ForegroundColor Yellow
    Write-Host "  2. Repository doesn't exist - It will be created on first push if you're logged in" -ForegroundColor Yellow
    Write-Host "  3. Insufficient permissions - Check your Docker Hub account permissions" -ForegroundColor Yellow
    Write-Host "  4. Wrong username - Current: $DockerHubUsername" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Build and push Frontend
Write-Host "Building frontend image..." -ForegroundColor Green
docker build -t "${DockerHubUsername}/${RepoPrefix}-frontend:$Version" `
             -t "${DockerHubUsername}/${RepoPrefix}-frontend:latest" `
             ./frontend

if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend build failed! Please check the errors above." -ForegroundColor Red
    exit 1
}

Write-Host "Pushing frontend image..." -ForegroundColor Green
docker push "${DockerHubUsername}/${RepoPrefix}-frontend:$Version"
docker push "${DockerHubUsername}/${RepoPrefix}-frontend:latest"

if ($LASTEXITCODE -ne 0) {
    Write-Host "" -ForegroundColor Red
    Write-Host "Frontend push failed!" -ForegroundColor Red
    Write-Host "Please check the errors above and ensure you're logged in to Docker Hub." -ForegroundColor Yellow
    exit 1
}

# Build and push Nginx
Write-Host "Building nginx image..." -ForegroundColor Green
docker build -t "${DockerHubUsername}/${RepoPrefix}-nginx:$Version" `
             -t "${DockerHubUsername}/${RepoPrefix}-nginx:latest" `
             ./nginx

if ($LASTEXITCODE -ne 0) {
    Write-Host "Nginx build failed! Please check the errors above." -ForegroundColor Red
    exit 1
}

Write-Host "Pushing nginx image..." -ForegroundColor Green
docker push "${DockerHubUsername}/${RepoPrefix}-nginx:$Version"
docker push "${DockerHubUsername}/${RepoPrefix}-nginx:latest"

if ($LASTEXITCODE -ne 0) {
    Write-Host "" -ForegroundColor Red
    Write-Host "Nginx push failed!" -ForegroundColor Red
    Write-Host "Please check the errors above and ensure you're logged in to Docker Hub." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "All images built and pushed successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Images available at:"
Write-Host "  - ${DockerHubUsername}/${RepoPrefix}-backend:$Version"
Write-Host "  - ${DockerHubUsername}/${RepoPrefix}-frontend:$Version"
Write-Host "  - ${DockerHubUsername}/${RepoPrefix}-nginx:$Version"

