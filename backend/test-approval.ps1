# PowerShell script to test approval API
param(
    [Parameter(Mandatory=$true)]
    [string]$ReportId,
    
    [Parameter(Mandatory=$false)]
    [string]$BaseUrl = "http://localhost:5264"
)

Write-Host "Testing approval for Report ID: $ReportId" -ForegroundColor Yellow

# You'll need to replace this with a valid JWT token from your login
$token = "Bearer YOUR_JWT_TOKEN_HERE"

$headers = @{
    "Authorization" = $token
    "Content-Type" = "application/json"
}

$url = "$BaseUrl/api/incidentreport/$ReportId/approve"

Write-Host "Calling: $url" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri $url -Method POST -Headers $headers
    Write-Host "Success Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error Response:" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host "Status Description: $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error Body: $errorBody" -ForegroundColor Red
    }
}