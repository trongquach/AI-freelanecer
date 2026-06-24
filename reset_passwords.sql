UPDATE users SET password_hash='$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy' WHERE email='admin@test.com';
UPDATE users SET password_hash='$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy' WHERE email='expert@test.com';
UPDATE users SET password_hash='$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy' WHERE email='client@test.com';
SELECT email, SUBSTRING(password_hash,1,20) as hash_start FROM users WHERE email IN ('admin@test.com','expert@test.com','client@test.com');
