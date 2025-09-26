# Script to clean up unwanted build artifacts in backend
param(
    [switch]$Deep
)

Write-Host "🧹 Cleaning up backend build artifacts..." -ForegroundColor Green

# Main project bin/obj are OK, but clean up any others
$backendPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$unwantedDirs = @()

# Find all bin/obj directories that are NOT in the root
Get-ChildItem -Path $backendPath -Recurse -Directory | 
    Where-Object { ($_.Name -eq "bin" -or $_.Name -eq "obj") -and $_.Parent.FullName -ne $backendPath } |
    ForEach-Object { $unwantedDirs += $_.FullName }

if ($unwantedDirs.Count -gt 0) {
    Write-Host "🗑️ Found unwanted build directories:" -ForegroundColor Yellow
    $unwantedDirs | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    
    foreach ($dir in $unwantedDirs) {
        try {
            Remove-Item -Path $dir -Recurse -Force -ErrorAction Stop
            Write-Host "✅ Removed: $dir" -ForegroundColor Green
        }
        catch {
            Write-Host "❌ Failed to remove: $dir - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
} else {
    Write-Host "✅ No unwanted build directories found!" -ForegroundColor Green
}

# If Deep clean requested, also clean main bin/obj
if ($Deep) {
    Write-Host "🔄 Performing deep clean (including main bin/obj)..." -ForegroundColor Blue
    
    $mainDirs = @("$backendPath\bin", "$backendPath\obj")
    foreach ($dir in $mainDirs) {
        if (Test-Path $dir) {
            try {
                Remove-Item -Path $dir -Recurse -Force -ErrorAction Stop
                Write-Host "✅ Deep cleaned: $dir" -ForegroundColor Green
            }
            catch {
                Write-Host "❌ Failed to deep clean: $dir - $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }
}

Write-Host "🎉 Cleanup completed!" -ForegroundColor Green