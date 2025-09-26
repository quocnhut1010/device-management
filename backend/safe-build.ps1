# Safe build script that cleans up before building
param(
    [switch]$Run,
    [switch]$DeepClean
)

Write-Host "🚀 Safe Backend Build Script" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan

# Step 1: Cleanup unwanted build artifacts
Write-Host "Step 1: Cleaning up unwanted build artifacts..." -ForegroundColor Yellow
if ($DeepClean) {
    & "$PSScriptRoot\cleanup-build.ps1" -Deep
} else {
    & "$PSScriptRoot\cleanup-build.ps1"
}

# Step 2: Clean project
Write-Host "`nStep 2: Cleaning project..." -ForegroundColor Yellow
dotnet clean
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Clean failed!" -ForegroundColor Red
    exit $LASTEXITCODE
}

# Step 3: Build project
Write-Host "`nStep 3: Building project..." -ForegroundColor Yellow
dotnet build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit $LASTEXITCODE
}

# Step 4: Check for unwanted artifacts after build
Write-Host "`nStep 4: Post-build cleanup check..." -ForegroundColor Yellow
& "$PSScriptRoot\cleanup-build.ps1"

Write-Host "`n✅ Safe build completed successfully!" -ForegroundColor Green

# Step 5: Optionally run the backend
if ($Run) {
    Write-Host "`nStep 5: Starting backend server..." -ForegroundColor Magenta
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
    dotnet run
}