$ErrorActionPreference = 'Stop'
$sshArgs = "-i aimarket-key.pem -o StrictHostKeyChecking=no -o BatchMode=yes ubuntu@54.206.116.105"
$cmd = "cd aimarket/frontend && node translate_all_deploy.js && cd .. && sudo docker compose -f docker-compose.prod.yml up -d --build"
Invoke-Expression "ssh $sshArgs `"$cmd`""
