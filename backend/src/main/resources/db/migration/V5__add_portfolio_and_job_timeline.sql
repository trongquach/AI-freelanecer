-- Create portfolio_items table
CREATE TABLE portfolio_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_profile_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    demo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_portfolio_user_profile FOREIGN KEY (user_profile_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

-- Add timeline columns to jobs table
ALTER TABLE jobs 
ADD COLUMN start_date DATE,
ADD COLUMN expected_duration VARCHAR(100);

-- Update enum for contract_status in contracts table if it's stored as VARCHAR
-- No schema change needed for enum if it's mapped as string in JPA, but if there's a check constraint, we'd alter it.
-- We'll assume it's just VARCHAR in MySQL.
