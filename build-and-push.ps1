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

# Note: Docker will automatically handle authentication when pushing
# If not logged in, Docker will show a clear error message

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
    Write-Host "Backend push failed! Please check the errors above." -ForegroundColor Red
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
    Write-Host "Frontend push failed! Please check the errors above." -ForegroundColor Red
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
    Write-Host "Nginx push failed! Please check the errors above." -ForegroundColor Red
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

