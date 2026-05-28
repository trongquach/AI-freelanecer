const crypto = require('crypto');
const fs = require('fs');

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

const privateKeyBase64 = Buffer.from(privateKey).toString('base64');
const publicKeyBase64 = Buffer.from(publicKey).toString('base64');

console.log('PRIVATE_KEY_BASE64:');
console.log(privateKeyBase64);
console.log('\nPUBLIC_KEY_BASE64:');
console.log(publicKeyBase64);

let envContent = fs.readFileSync('.env', 'utf8');
envContent = envContent.replace(
  /JWT_PRIVATE_KEY_BASE64=.*/,
  `JWT_PRIVATE_KEY_BASE64=${privateKeyBase64}`
);
envContent = envContent.replace(
  /JWT_PUBLIC_KEY_BASE64=.*/,
  `JWT_PUBLIC_KEY_BASE64=${publicKeyBase64}`
);

fs.writeFileSync('.env', envContent);
console.log('\n.env file updated with new RSA keys.');
