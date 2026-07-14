-- Seed data for AIMarket
SET FOREIGN_KEY_CHECKS = 0;

-- 10 Users (3 Clients, 6 Experts, 1 Admin)
INSERT IGNORE INTO users (id, email, password_hash, role, status, email_verified, created_at, updated_at) VALUES 
(1, 'admin@test.com', 'Password@123', 'ADMIN', 'ACTIVE', 1, NOW(), NOW()),
(2, 'client1@test.com', 'Password@123', 'CLIENT', 'ACTIVE', 1, NOW(), NOW()),
(3, 'client2@test.com', 'Password@123', 'CLIENT', 'ACTIVE', 1, NOW(), NOW()),
(4, 'client3@test.com', 'Password@123', 'CLIENT', 'ACTIVE', 1, NOW(), NOW()),
(5, 'expert1@test.com', 'Password@123', 'EXPERT', 'ACTIVE', 1, NOW(), NOW()),
(6, 'expert2@test.com', 'Password@123', 'EXPERT', 'ACTIVE', 1, NOW(), NOW()),
(7, 'expert3@test.com', 'Password@123', 'EXPERT', 'ACTIVE', 1, NOW(), NOW()),
(8, 'expert4@test.com', 'Password@123', 'EXPERT', 'ACTIVE', 1, NOW(), NOW()),
(9, 'expert5@test.com', 'Password@123', 'EXPERT', 'ACTIVE', 1, NOW(), NOW()),
(10, 'expert6@test.com', 'Password@123', 'EXPERT', 'ACTIVE', 1, NOW(), NOW());

-- 10 User Profiles
INSERT IGNORE INTO user_profiles (id, user_id, full_name, bio, avatar_url, hourly_rate, timezone, created_at, updated_at) VALUES 
(1, 1, 'Admin', 'System Admin', NULL, 0, 'UTC', NOW(), NOW()),
(2, 2, 'Tech Startup Inc', 'Looking for AI talents', NULL, 0, 'UTC', NOW(), NOW()),
(3, 3, 'Data Corp', 'Big data company', NULL, 0, 'UTC', NOW(), NOW()),
(4, 4, 'Creative AI', 'AI art studio', NULL, 0, 'UTC', NOW(), NOW()),
(5, 5, 'Alice Johnson', 'Senior Data Scientist', NULL, 50.00, 'UTC', NOW(), NOW()),
(6, 6, 'Bob Smith', 'Computer Vision Expert', NULL, 60.00, 'UTC', NOW(), NOW()),
(7, 7, 'Charlie Brown', 'NLP Engineer', NULL, 45.00, 'UTC', NOW(), NOW()),
(8, 8, 'Diana Prince', 'Prompt Engineer', NULL, 30.00, 'UTC', NOW(), NOW()),
(9, 9, 'Evan Davis', 'Machine Learning Engineer', NULL, 55.00, 'UTC', NOW(), NOW()),
(10, 10, 'Fiona White', 'AI Researcher', NULL, 70.00, 'UTC', NOW(), NOW());

-- 10 Skills
INSERT IGNORE INTO skills (id, name, category, created_at) VALUES 
(1, 'Python', 'Programming', NOW()),
(2, 'Machine Learning', 'AI', NOW()),
(3, 'Computer Vision', 'AI', NOW()),
(4, 'NLP', 'AI', NOW()),
(5, 'Deep Learning', 'AI', NOW()),
(6, 'Prompt Engineering', 'AI', NOW()),
(7, 'TensorFlow', 'Framework', NOW()),
(8, 'PyTorch', 'Framework', NOW()),
(9, 'Data Analysis', 'Data', NOW()),
(10, 'OpenAI API', 'API', NOW());

-- 10 User Skills
INSERT IGNORE INTO user_skills (user_id, skill_id) VALUES 
(5, 1), (5, 2), (5, 7), (6, 3), (6, 5), (7, 4), (7, 10), (8, 6), (9, 2), (10, 8);

-- 10 Jobs
INSERT IGNORE INTO jobs (id, client_id, title, description, budget_min, budget_max, deadline, expected_duration, status, view_count, created_at, updated_at) VALUES 
(1, 2, 'Build an Object Detection API', 'Need someone to build an API using YOLO.', 500, 1000, '2026-12-01', '1 month', 'OPEN', 10, NOW(), NOW()),
(2, 2, 'NLP Chatbot for E-commerce', 'Build a chatbot that understands user intent.', 1000, 2000, '2026-11-01', '2 months', 'OPEN', 25, NOW(), NOW()),
(3, 3, 'Data Cleaning and Prep', 'Clean 100GB of text data for LLM training.', 200, 500, '2026-08-01', '2 weeks', 'OPEN', 5, NOW(), NOW()),
(4, 3, 'Fine-tune Llama 3', 'Fine-tune open source model on our private docs.', 2000, 5000, '2027-01-01', '3 months', 'OPEN', 50, NOW(), NOW()),
(5, 4, 'Midjourney Prompt Expert needed', 'Need someone to generate specific art styles.', 100, 300, '2026-07-15', '1 week', 'OPEN', 100, NOW(), NOW()),
(6, 4, 'Voice Cloning App', 'Develop an app that clones voices from short clips.', 3000, 7000, '2026-10-01', '4 months', 'OPEN', 40, NOW(), NOW()),
(7, 2, 'Recommendation System', 'Build a movie recommendation system.', 800, 1500, '2026-09-01', '1.5 months', 'OPEN', 12, NOW(), NOW()),
(8, 3, 'Time Series Forecasting', 'Predict stock prices using LSTM.', 1500, 2500, '2026-12-15', '2 months', 'OPEN', 8, NOW(), NOW()),
(9, 4, 'Stable Diffusion LoRA training', 'Train a LoRA model on our product images.', 400, 800, '2026-07-30', '2 weeks', 'OPEN', 33, NOW(), NOW()),
(10, 2, 'Document OCR and Parsing', 'Extract text from scanned invoices.', 600, 1200, '2026-08-15', '1 month', 'OPEN', 18, NOW(), NOW());

-- 10 Job Skills
INSERT IGNORE INTO job_skills (job_id, skill_id) VALUES 
(1, 3), (2, 4), (3, 9), (4, 4), (5, 6), (6, 5), (7, 2), (8, 2), (9, 3), (10, 3);

-- 10 Services
INSERT IGNORE INTO services (id, expert_id, title, description, price, delivery_days, status, order_count, created_at, updated_at) VALUES 
(1, 5, 'I will build a custom Machine Learning model', 'I can build any ML model in Python.', 500, 14, 'ACTIVE', 50, NOW(), NOW()),
(2, 5, 'Data Analysis in Pandas', 'Comprehensive data analysis report.', 200, 5, 'ACTIVE', 20, NOW(), NOW()),
(3, 6, 'Computer Vision with OpenCV', 'Object detection and tracking.', 800, 21, 'ACTIVE', 80, NOW(), NOW()),
(4, 6, 'Face Recognition System', 'State of the art face recognition API.', 1000, 30, 'ACTIVE', 120, NOW(), NOW()),
(5, 7, 'NLP Sentiment Analysis', 'Analyze tweets and reviews.', 300, 7, 'ACTIVE', 40, NOW(), NOW()),
(6, 7, 'Custom GPT Development', 'Build a custom ChatGPT for your website.', 1500, 14, 'ACTIVE', 200, NOW(), NOW()),
(7, 8, 'Prompt Engineering Services', 'I will write the perfect prompts for you.', 50, 1, 'ACTIVE', 500, NOW(), NOW()),
(8, 9, 'Time Series Prediction', 'Accurate forecasting models.', 600, 10, 'ACTIVE', 30, NOW(), NOW()),
(9, 10, 'Deep Learning Research', 'Implement research papers in PyTorch.', 2000, 45, 'ACTIVE', 15, NOW(), NOW()),
(10, 5, 'Machine Learning Consultation', '1 hour consultation on ML architecture.', 100, 1, 'ACTIVE', 90, NOW(), NOW());

-- 10 Proposals
INSERT IGNORE INTO proposals (id, job_id, expert_id, cover_letter, price, timeline_days, status, created_at, updated_at) VALUES 
(1, 1, 6, 'I am great at YOLO.', 800, 21, 'PENDING', NOW(), NOW()),
(2, 2, 7, 'I have built many chatbots.', 1500, 60, 'PENDING', NOW(), NOW()),
(3, 3, 5, 'Data cleaning is my specialty.', 300, 7, 'PENDING', NOW(), NOW()),
(4, 4, 10, 'I am a researcher specializing in LLMs.', 4500, 90, 'PENDING', NOW(), NOW()),
(5, 5, 8, 'I can write amazing prompts.', 200, 5, 'PENDING', NOW(), NOW()),
(6, 6, 9, 'I have experience with voice cloning.', 6000, 120, 'PENDING', NOW(), NOW()),
(7, 7, 5, 'I built a recsys for Netflix clone.', 1200, 30, 'PENDING', NOW(), NOW()),
(8, 8, 9, 'LSTM is perfect for this.', 2000, 60, 'PENDING', NOW(), NOW()),
(9, 9, 6, 'I train LoRAs daily.', 600, 14, 'PENDING', NOW(), NOW()),
(10, 10, 6, 'OCR is my core skill.', 900, 21, 'PENDING', NOW(), NOW());

-- 10 Contracts
INSERT IGNORE INTO contracts (id, job_id, proposal_id, client_id, expert_id, total_amount, status, created_at) VALUES 
(1, 1, 1, 2, 6, 800, 'ACTIVE', NOW()),
(2, 2, 2, 2, 7, 1500, 'ACTIVE', NOW()),
(3, 3, 3, 3, 5, 300, 'COMPLETED', NOW()),
(4, 4, 4, 3, 10, 4500, 'ACTIVE', NOW()),
(5, 5, 5, 4, 8, 200, 'COMPLETED', NOW()),
(6, 6, 6, 4, 9, 6000, 'ACTIVE', NOW()),
(7, 7, 7, 2, 5, 1200, 'ACTIVE', NOW()),
(8, 8, 8, 3, 9, 2000, 'DISPUTED', NOW()),
(9, 9, 9, 4, 6, 600, 'CANCELLED', NOW()),
(10, 10, 10, 2, 6, 900, 'ACTIVE', NOW());

-- 10 Escrow Accounts
INSERT IGNORE INTO escrow_accounts (id, user_id, balance, locked_amount, total_deposited, total_released, currency, updated_at) VALUES 
(5, 1, 0, 0, 0, 0, 'USD', NOW()),
(6, 4, 5000, 3900, 10000, 1100, 'USD', NOW()),
(7, 5, 10000, 6500, 15000, 300, 'USD', NOW()),
(8, 6, 8000, 6000, 8000, 200, 'USD', NOW()),
(9, 7, 1500, 0, 0, 1500, 'USD', NOW()),
(10, 8, 800, 0, 0, 800, 'USD', NOW()),
(11, 9, 0, 0, 0, 0, 'USD', NOW()),
(12, 10, 200, 0, 0, 200, 'USD', NOW());

SET FOREIGN_KEY_CHECKS = 1;
