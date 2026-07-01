-- ============================================================
-- V9__update_passwords_to_plaintext.sql
-- Update all users to use plain text 'password' for easier local development
-- ============================================================

UPDATE users SET password_hash = 'Password@123';
