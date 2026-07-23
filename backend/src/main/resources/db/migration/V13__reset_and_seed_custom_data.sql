-- ============================================================
-- V13__reset_and_seed_custom_data.sql
-- Reset database entirely and seed specific custom data (AI specific)
-- ============================================================

-- 1. Truncate all tables EXCEPT skills
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE audit_logs;
TRUNCATE TABLE notifications;
TRUNCATE TABLE disputes;
TRUNCATE TABLE reviews;
TRUNCATE TABLE messages;
TRUNCATE TABLE transactions;
TRUNCATE TABLE escrow_accounts;
TRUNCATE TABLE milestones;
TRUNCATE TABLE contracts;
TRUNCATE TABLE proposals;
TRUNCATE TABLE services;
TRUNCATE TABLE job_skills;
TRUNCATE TABLE jobs;
TRUNCATE TABLE user_skills;
TRUNCATE TABLE user_profiles;
TRUNCATE TABLE expert_cvs;
TRUNCATE TABLE refresh_tokens;
TRUNCATE TABLE ai_usage_logs;
TRUNCATE TABLE users;
-- We do NOT truncate skills. We will use the existing AI skills from V2__seed_skills.sql
SET FOREIGN_KEY_CHECKS = 1;

-- 2. Seed Users
-- Admin (ID 1)
INSERT INTO users (id, email, password_hash, role, status, email_verified, created_at, updated_at) VALUES 
(1, 'admin@test.com', 'password', 'ADMIN', 'ACTIVE', TRUE, NOW(), NOW());

-- Clients (ID 2, 3, 4)
INSERT INTO users (id, email, password_hash, role, status, email_verified, created_at, updated_at) VALUES 
(2, 'client1@test.com', 'password', 'CLIENT', 'ACTIVE', TRUE, NOW(), NOW()),
(3, 'client2@test.com', 'password', 'CLIENT', 'ACTIVE', TRUE, NOW(), NOW()),
(4, 'client3@test.com', 'password', 'CLIENT', 'ACTIVE', TRUE, NOW(), NOW());

-- Experts (ID 5, 6, 7, 8, 9)
INSERT INTO users (id, email, password_hash, role, status, email_verified, created_at, updated_at) VALUES 
(5, 'expert1@test.com', 'password', 'EXPERT', 'ACTIVE', TRUE, NOW(), NOW()),
(6, 'expert2@test.com', 'password', 'EXPERT', 'ACTIVE', TRUE, NOW(), NOW()),
(7, 'expert3@test.com', 'password', 'EXPERT', 'ACTIVE', TRUE, NOW(), NOW()),
(8, 'expert4@test.com', 'password', 'EXPERT', 'ACTIVE', TRUE, NOW(), NOW()),
(9, 'expert5@test.com', 'password', 'EXPERT', 'ACTIVE', TRUE, NOW(), NOW());

-- 3. Seed User Profiles & Escrow Accounts
-- Admin
INSERT INTO user_profiles (user_id, full_name, bio, created_at, updated_at) VALUES (1, 'Super Admin', 'System Administrator', NOW(), NOW());

-- Clients
INSERT INTO user_profiles (user_id, full_name, bio, created_at, updated_at) VALUES 
(2, 'AI Startup Client', 'Building the next generation AI SaaS.', NOW(), NOW()),
(3, 'Enterprise Client', 'Large enterprise seeking AI transformation.', NOW(), NOW()),
(4, 'Tech Agency Client', 'Local agency needing AI integrations.', NOW(), NOW());

-- Escrow for Clients (balance 5000)
INSERT INTO escrow_accounts (user_id, balance, total_deposited, updated_at) VALUES 
(2, 5000.00, 5000.00, NOW()),
(3, 5000.00, 5000.00, NOW()),
(4, 5000.00, 5000.00, NOW());

-- Experts Profiles (All AI Focused)
INSERT INTO user_profiles (user_id, full_name, bio, hourly_rate, rating, total_reviews, completion_rate, is_available, created_at, updated_at) VALUES 
(5, 'Alice LLM', 'Senior AI Engineer specializing in LLMs, RAG, and LangChain.', 80.00, 4.9, 25, 1.00, TRUE, NOW(), NOW()),
(6, 'Bob Vision', 'Computer Vision Expert specializing in PyTorch and Object Detection.', 75.00, 4.8, 18, 0.95, TRUE, NOW(), NOW()),
(7, 'Charlie MLOps', 'MLOps Engineer. Deploying scalable ML pipelines.', 85.00, 5.0, 10, 1.00, TRUE, NOW(), NOW()),
(8, 'David Data', 'Data Scientist working with Python, Pandas, and Scikit-learn.', 45.00, 4.7, 30, 0.90, TRUE, NOW(), NOW()),
(9, 'Eve Agents', 'AI Agent Developer using CrewAI and LangGraph.', 70.00, 4.9, 15, 0.98, TRUE, NOW(), NOW());

-- Escrow for Experts
INSERT INTO escrow_accounts (user_id, balance, total_deposited, updated_at) VALUES 
(5, 0.00, 0.00, NOW()), (6, 0.00, 0.00, NOW()), (7, 0.00, 0.00, NOW()), (8, 0.00, 0.00, NOW()), (9, 0.00, 0.00, NOW());

-- Expert Skills (Using IDs from V2__seed_skills.sql)
INSERT INTO user_skills (user_id, skill_id) VALUES 
(5, 15), (5, 16), (5, 17), -- Prompt Eng, RAG, Fine-tuning
(6, 4),  (6, 8),  (6, 10), -- Computer Vision, Deep Learning, Scikit-learn
(7, 29), (7, 30), (7, 21), -- MLOps, Model Deployment, Python
(8, 1),  (8, 21), (8, 23), -- Machine Learning, Python, SQL
(9, 19), (9, 21), (9, 13); -- AI Agents, Python, LangChain

-- 4. Seed Expert CVs
-- Experts 5, 6, 7 get CVs. 8 and 9 do not.
INSERT INTO expert_cvs (user_id, summary, work_experiences, educations, languages, years_of_experience, created_at, updated_at) VALUES 
(5, 'I am a highly skilled AI Engineer with a strong track record of designing scalable RAG pipelines and fine-tuning open-source LLMs.', '[{"company":"AI Corp","title":"Senior AI Engineer","duration":"2020 - Present","description":"Led a team to build an enterprise RAG system serving 10k users daily."}]', '[]', 'English, Vietnamese', 6, NOW(), NOW()),
(6, 'Passionate Computer Vision Researcher focused on creating real-time object detection models for edge devices.', '[{"company":"VisionTech","title":"Computer Vision Engineer","duration":"2019 - Present","description":"Developed YOLO-based object detection models for self-driving prototypes."}]', '[]', 'English', 5, NOW(), NOW()),
(7, 'MLOps Engineer specializing in deploying and scaling Machine Learning models on Kubernetes and AWS.', '[{"company":"CloudML","title":"MLOps Engineer","duration":"2018 - Present","description":"Automated ML deployments using Kubeflow and GitHub Actions, reducing deployment time by 80%."}]', '[]', 'English', 8, NOW(), NOW());

-- 5. Seed Services (1-2 per expert)
INSERT INTO services (id, expert_id, title, description, price, delivery_days, status, rating, order_count, created_at, updated_at) VALUES 
(1, 5, 'Custom RAG Pipeline Development', 'I will build a Retrieval-Augmented Generation pipeline using LangChain and Vector DBs.', 800.00, 10, 'ACTIVE', 5.0, 5, NOW(), NOW()),
(2, 5, 'Fine-tune Llama 3', 'I will fine-tune an open-source LLM on your specific company dataset.', 1200.00, 14, 'ACTIVE', 4.9, 2, NOW(), NOW()),
(3, 6, 'Object Detection Model', 'I will develop a custom Computer Vision model using PyTorch.', 900.00, 12, 'ACTIVE', 4.8, 10, NOW(), NOW()),
(4, 7, 'MLOps Infrastructure Setup', 'I will set up a CI/CD pipeline for your ML models using MLflow.', 1000.00, 10, 'ACTIVE', 5.0, 1, NOW(), NOW()),
(5, 7, 'Model Deployment API', 'I will wrap your ML model into a scalable FastAPI endpoint.', 400.00, 3, 'ACTIVE', 0.0, 0, NOW(), NOW()),
(6, 8, 'Data Analysis & Cleaning', 'I will analyze your dataset and build a predictive ML model.', 350.00, 5, 'ACTIVE', 4.7, 8, NOW(), NOW()),
(7, 9, 'Build an Autonomous AI Agent', 'I will build a LangChain/CrewAI agent to automate your business tasks.', 700.00, 7, 'ACTIVE', 5.0, 4, NOW(), NOW());

-- 6. Seed Jobs (3-5 per client)
-- Client 1 (ID 2): 4 Jobs
INSERT INTO jobs (id, client_id, title, description, budget_min, budget_max, deadline, status, max_shortlist, ai_screening_threshold, created_at, updated_at) VALUES 
(1, 2, 'Need a Prompt Engineer', 'We are looking for an expert in Prompt Engineering to optimize our LLM outputs.', 1000, 3000, '2027-01-01', 'OPEN', 5, 0.60, NOW(), NOW()),
(2, 2, 'Build a Vector Database', 'Looking for an engineer to set up Pinecone or Qdrant for semantic search.', 500, 1500, '2027-02-01', 'OPEN', 5, 0.60, NOW(), NOW()),
(3, 2, 'Implement RAG for Customer Support', 'We need an AI expert to build a chatbot that answers questions based on our knowledge base.', 2000, 5000, '2027-03-01', 'OPEN', 3, 0.70, NOW(), NOW()),
(4, 2, 'Fine-tune LLM for Legal Docs', 'We need someone to fine-tune a model to understand legal terminology.', 1500, 4000, '2027-04-01', 'OPEN', 5, 0.60, NOW(), NOW());

INSERT INTO job_skills (job_id, skill_id) VALUES (1, 15), (1, 21), (2, 20), (3, 16), (4, 17);

-- Client 2 (ID 3): 3 Jobs
INSERT INTO jobs (id, client_id, title, description, budget_min, budget_max, deadline, status, max_shortlist, ai_screening_threshold, created_at, updated_at) VALUES 
(5, 3, 'MLOps Setup', 'Need a DevOps engineer to set up Kubeflow for our ML team.', 500, 1000, '2027-01-15', 'OPEN', 5, 0.50, NOW(), NOW()),
(6, 3, 'Computer Vision for Defect Detection', 'Looking for an AI engineer to build a defect detection system.', 3000, 8000, '2027-05-01', 'OPEN', 5, 0.75, NOW(), NOW()),
(7, 3, 'Churn Prediction Model', 'Need a Data Scientist to build a churn prediction model using Scikit-learn.', 300, 800, '2027-01-10', 'OPEN', 5, 0.60, NOW(), NOW());

INSERT INTO job_skills (job_id, skill_id) VALUES (5, 29), (6, 4), (7, 10);

-- Client 3 (ID 4): 3 Jobs
INSERT INTO jobs (id, client_id, title, description, budget_min, budget_max, deadline, status, max_shortlist, ai_screening_threshold, created_at, updated_at) VALUES 
(8, 4, 'Build an AI Agent', 'Need a developer to build an autonomous agent that scrapes the web.', 4000, 10000, '2027-06-01', 'OPEN', 5, 0.80, NOW(), NOW()),
(9, 4, 'NLP Sentiment Analysis', 'Build a sentiment analysis API for our social media platform.', 1000, 2500, '2027-03-15', 'OPEN', 5, 0.60, NOW(), NOW()),
(10, 4, 'PyTorch Model Optimization', 'Optimize our PyTorch model for faster inference speed.', 800, 2000, '2027-02-28', 'OPEN', 5, 0.60, NOW(), NOW());

INSERT INTO job_skills (job_id, skill_id) VALUES (8, 19), (9, 3), (10, 8);
