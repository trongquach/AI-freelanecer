import paramiko

host = '116.118.6.40'
username = 'root'
password = '&UTrh@FRHRDeDq6'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(host, username=username, password=password)

# Get the backend logs from 05:51:35 to 05:51:50
stdin, stdout, stderr = ssh.exec_command('docker logs aimarket-backend-prod --since 2026-07-30T05:51:35Z --until 2026-07-30T05:51:50Z')
logs = stdout.read().decode('utf-8')

with open('backend_error.log', 'w', encoding='utf-8') as f:
    f.write(logs)

ssh.close()
