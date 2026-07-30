import paramiko
import os

HOST = '116.118.6.40'
USER = 'root'
PASSWORD = '&UTrh@FRHRDeDq6'
REMOTE_DIR = '/var/www/aimarket'
LOCAL_DIR = 'd:/FPT/AI-freelanecer'

def get_all_files(directory):
    file_paths = []
    for root, directories, files in os.walk(directory):
        for filename in files:
            filepath = os.path.join(root, filename)
            rel_path = os.path.relpath(filepath, LOCAL_DIR).replace('\\', '/')
            file_paths.append(rel_path)
    return file_paths

files_to_upload = get_all_files(os.path.join(LOCAL_DIR, 'backend/src')) + get_all_files(os.path.join(LOCAL_DIR, 'frontend/src'))
# Add any root level config files if needed
files_to_upload.append('docker-compose.vps.yml')

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
        remote_dir_path = os.path.dirname(remote_path)
        try:
            sftp.stat(remote_dir_path)
        except IOError:
            # Create directories recursively
            dirs_to_create = []
            curr_dir = remote_dir_path
            while curr_dir != '/' and curr_dir != '':
                try:
                    sftp.stat(curr_dir)
                    break
                except IOError:
                    dirs_to_create.insert(0, curr_dir)
                    curr_dir = os.path.dirname(curr_dir).replace('\\', '/')
            for d in dirs_to_create:
                try:
                    sftp.mkdir(d)
                except Exception:
                    pass
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
