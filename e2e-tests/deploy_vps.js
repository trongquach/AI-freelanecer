const Client = require('ssh2-sftp-client');
const { Client: SshClient } = require('ssh2');
const path = require('path');

const config = {
  host: '116.118.6.40',
  port: 22,
  username: 'root',
  password: '&UTrh@FRHRDeDq6'
};

const sftp = new Client();

const filesToUpload = [
  'backend/src/main/java/com/aimarket/controller/ChatController.java',
  'backend/src/main/java/com/aimarket/controller/ContractController.java',
  'backend/src/main/java/com/aimarket/service/ChatService.java',
  'backend/src/main/java/com/aimarket/service/ContractService.java',
  'backend/src/main/java/com/aimarket/controller/DisputeController.java',
  'backend/src/main/java/com/aimarket/service/DisputeService.java',
  'backend/src/main/java/com/aimarket/dto/dispute/DisputeResponse.java',
  'frontend/src/api/adminApi.ts',
  'frontend/src/pages/dashboard/admin/DisputesPage.tsx'
];

async function deploy() {
  try {
    console.log('Connecting to SFTP...');
    await sftp.connect(config);
    console.log('SFTP connected.');

    for (const file of filesToUpload) {
      const localPath = path.join(__dirname, '..', file);
      // Ensure linux path format
      const remotePath = `/var/www/aimarket/${file.replace(/\\/g, '/')}`;
      console.log(`Uploading ${localPath} -> ${remotePath}`);
      await sftp.put(localPath, remotePath);
    }
    await sftp.end();
    console.log('Upload finished.');

    console.log('Connecting SSH to trigger build...');
    const conn = new SshClient();
    conn.on('ready', () => {
      console.log('SSH Client ready. Running Docker Compose build...');
      const cmd = `cd /var/www/aimarket && docker compose -f docker-compose.vps.yml up -d --build backend frontend`;
      conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
          console.log(`SSH Stream closed with code ${code}`);
          conn.end();
        }).on('data', (data) => {
          process.stdout.write(data.toString());
        }).stderr.on('data', (data) => {
          process.stderr.write(data.toString());
        });
      });
    }).connect(config);

  } catch (err) {
    console.error('Deployment error:', err);
    process.exit(1);
  }
}

deploy();
