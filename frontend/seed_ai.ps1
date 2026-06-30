$baseUrl = "http://localhost:8080/api/v1"

$experts = @(
    @{
        email = "expert@test.com"
        bio = "I am a Senior AI Engineer specializing in Machine Learning, Deep Learning, and Natural Language Processing. I have 5 years of experience building scalable ML pipelines and RAG systems using Python, TensorFlow, and PyTorch."
        skillIds = @(1, 2, 3, 5)
    },
    @{
        email = "expert123@test.com"
        bio = "Fullstack developer with a strong focus on AI integration. I build web applications using React, Node.js, and integrate OpenAI APIs for smart features like chatbots and automated content generation."
        skillIds = @(4, 6, 7)
    }
)

foreach ($expert in $experts) {
    Write-Host "Logging in as $($expert.email)..."
    $loginBody = @{
        email = $expert.email
        password = "password"
    } | ConvertTo-Json

    $loginRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginRes.accessToken

    if (-not $token) {
        Write-Host "Failed to login as $($expert.email)"
        continue
    }

    Write-Host "Updating profile for $($expert.email) to trigger AI embedding generation..."
    
    $updateBody = @{
        bio = $expert.bio
        skillIds = $expert.skillIds
    } | ConvertTo-Json
    
    $headers = @{
        Authorization = "Bearer $token"
    }

    $updateRes = Invoke-RestMethod -Uri "$baseUrl/profile/me" -Method Put -Body $updateBody -ContentType "application/json" -Headers $headers
    
    Write-Host "Successfully updated $($expert.email) and triggered embedding!"
}
