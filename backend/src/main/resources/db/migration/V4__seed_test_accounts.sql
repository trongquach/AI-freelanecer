-- ============================================================
-- V4__seed_test_accounts.sql
-- Seed QA test accounts with BCrypt-hashed passwords
-- Password for all accounts: Test@12345
-- BCrypt hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
-- ============================================================

-- Prevent duplicate inserts on re-run
INSERT IGNORE INTO users (email, password_hash, role, status, email_verified, created_at, updated_at)
VALUES
    ('admin@test.com',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN',  'ACTIVE', TRUE, NOW(), NOW()),
    ('client@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'CLIENT', 'ACTIVE', TRUE, NOW(), NOW()),
    ('expert@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'EXPERT', 'ACTIVE', TRUE, NOW(), NOW());

-- Seed user_profiles for each test account
INSERT IGNORE INTO user_profiles (user_id, full_name, bio, hourly_rate, rating, total_reviews, completion_rate, is_available, created_at, updated_at)
SELECT id, 'QA Admin',   'System administrator account for QA testing',   NULL,  0.00, 0, 0.00, TRUE, NOW(), NOW() FROM users WHERE email = 'admin@test.com'
UNION ALL
SELECT id, 'QA Client',  'Sample client account for QA end-to-end testing', NULL, 0.00, 0, 0.00, TRUE, NOW(), NOW() FROM users WHERE email = 'client@test.com'
UNION ALL
SELECT id, 'QA Expert',  'Sample expert account for QA end-to-end testing', 50.00, 0.00, 0, 0.00, TRUE, NOW(), NOW() FROM users WHERE email = 'expert@test.com';

-- Seed escrow accounts for client and expert
INSERT IGNORE INTO escrow_accounts (user_id, balance, locked_amount, total_deposited, total_released, currency, updated_at)
SELECT id, 1000.00, 0.00, 1000.00, 0.00, 'USD', NOW() FROM users WHERE email = 'client@test.com'
UNION ALL
SELECT id, 0.00,    0.00, 0.00,    0.00, 'USD', NOW() FROM users WHERE email = 'expert@test.com';
