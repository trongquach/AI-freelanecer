$baseUrl = "http://localhost:8080/api/v1"

$loginBody = @{
    email = "client@test.com"
    password = "password"
} | ConvertTo-Json

$loginRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginRes.accessToken

$headers = @{
    Authorization = "Bearer $token"
}

try {
    $res = Invoke-RestMethod -Uri "$baseUrl/ai/jobs/2/recommend-experts" -Method Get -Headers $headers
    $res | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $_"
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $reader.ReadToEnd()
    }
}
