const bcrypt = require('bcryptjs');
const hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
const passwords = ['Test@12345', 'Admin@12345', 'admin123', 'Admin123!', 'password', '12345678', 'Admin@1234'];

Promise.all(passwords.map(async p => {
  const match = await bcrypt.compare(p, hash);
  if (match) console.log('MATCH:', p);
  else console.log('NO:', p);
}));
