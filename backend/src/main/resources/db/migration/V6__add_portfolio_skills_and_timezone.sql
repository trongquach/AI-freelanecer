-- Add timezone to user_profiles
ALTER TABLE user_profiles ADD COLUMN timezone VARCHAR(100);

-- Create portfolio_item_skills mapping table
CREATE TABLE portfolio_item_skills (
    portfolio_item_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    PRIMARY KEY (portfolio_item_id, skill_id),
    FOREIGN KEY (portfolio_item_id) REFERENCES portfolio_items(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- Add index for better performance
CREATE INDEX idx_portfolio_item_skills_item_id ON portfolio_item_skills(portfolio_item_id);
CREATE INDEX idx_portfolio_item_skills_skill_id ON portfolio_item_skills(skill_id);
