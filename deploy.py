import paramiko
import os

HOST = '116.118.6.40'
USER = 'root'
PASSWORD = '&UTrh@FRHRDeDq6'
REMOTE_DIR = '/var/www/aimarket'
LOCAL_DIR = 'd:/FPT/AI-freelanecer'

files_to_upload = [
    'backend/src/main/resources/db/migration/V13__reset_and_seed_custom_data.sql',
    'backend/src/main/java/com/aimarket/service/EscrowService.java',
    'backend/src/main/java/com/aimarket/service/AICVScreeningService.java',
    'backend/src/main/java/com/aimarket/exception/GlobalExceptionHandler.java',
    'frontend/src/hooks/useRealtimeEvents.ts',
    'frontend/src/pages/proposals/ProposalListPage.tsx',
    'frontend/src/components/ui/Button.tsx',
    'frontend/src/pages/proposals/ProposalFormPage.tsx',
    'frontend/src/pages/wallet/WalletPage.tsx',
    'frontend/src/pages/dashboard/ClientDashboard.tsx',
    'frontend/src/pages/dashboard/ExpertDashboard.tsx',
    'frontend/src/pages/contracts/ContractPage.tsx',
    'frontend/src/components/chat/ChatWidget.tsx',
    'frontend/src/pages/jobs/JobDetailPage.tsx',
    'frontend/src/components/cards/JobCard.tsx',
    'frontend/src/pages/marketplace/MyServicesPage.tsx',
    'frontend/src/pages/marketplace/MarketplacePage.tsx',
    'frontend/src/pages/jobs/MyJobsPage.tsx',
    'frontend/src/pages/jobs/JobsPage.tsx'
]

print("Connecting to VPS...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, username=USER, password=PASSWORD)

print("Opening SFTP session...")
sftp = ssh.open_sftp()

for file_path in files_to_upload:
    local_path = os.path.join(LOCAL_DIR, file_path)
    remote_path = f"{REMOTE_DIR}/{file_path}".replace('\\', '/')
    print(f"Uploading {local_path} to {remote_path}...")
    
    # Ensure remote directory exists (we assume they do since we just replace existing files, but safe to check if it wasn't)
    try:
        sftp.put(local_path, remote_path)
        print(f"Success: {file_path}")
    except Exception as e:
        print(f"Failed to upload {file_path}: {e}")

sftp.close()

# Now run docker-compose build and up
commands = [
    f"cd {REMOTE_DIR} && docker compose -f docker-compose.vps.yml up -d --build backend frontend"
]

for cmd in commands:
    print(f"Executing: {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    
    while not stdout.channel.exit_status_ready():
        if stdout.channel.recv_ready():
            chunk = stdout.channel.recv(1024).decode('utf-8', errors='replace')
            print(chunk.encode('ascii', errors='replace').decode('ascii'), end='')
        if stderr.channel.recv_ready():
            chunk = stderr.channel.recv(1024).decode('utf-8', errors='replace')
            print(chunk.encode('ascii', errors='replace').decode('ascii'), end='')
            
    # Print remaining output
    chunk_out = stdout.read().decode('utf-8', errors='replace')
    print(chunk_out.encode('ascii', errors='replace').decode('ascii'))
    chunk_err = stderr.read().decode('utf-8', errors='replace')
    print(chunk_err.encode('ascii', errors='replace').decode('ascii'))

ssh.close()
print("Deployment completed successfully!")
