-- V6__add_profile_and_portfolio_fields.sql

ALTER TABLE user_profiles
ADD COLUMN timezone VARCHAR(100) DEFAULT NULL;

ALTER TABLE portfolio_items
ADD COLUMN technologies TEXT DEFAULT NULL,
ADD COLUMN display_order INT DEFAULT 0;
