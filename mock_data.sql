-- Clear existing mock data if any
DELETE FROM jobs;
DELETE FROM services;
DELETE FROM user_profiles;
DELETE FROM users;

-- Insert Users (Password is 'password123' for all)
INSERT INTO users (id, email, password_hash, role, status, email_verified, created_at, updated_at) VALUES 
(1, 'client1@example.com', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjGVX/n/.m', 'CLIENT', 'ACTIVE', 1, NOW(), NOW()),
(2, 'client2@example.com', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjGVX/n/.m', 'CLIENT', 'ACTIVE', 1, NOW(), NOW()),
(3, 'expert1@example.com', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjGVX/n/.m', 'EXPERT', 'ACTIVE', 1, NOW(), NOW()),
(4, 'expert2@example.com', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjGVX/n/.m', 'EXPERT', 'ACTIVE', 1, NOW(), NOW());

-- Insert User Profiles
INSERT INTO user_profiles (id, user_id, full_name, bio, avatar_url, hourly_rate, rating, total_reviews, completion_rate, is_available, created_at, updated_at) VALUES
(1, 1, 'John Tech (Client)', 'Startup founder looking for AI developers to build amazing products.', 'https://ui-avatars.com/api/?name=John+Tech&background=random', NULL, 4.8, 12, 100.0, 1, NOW(), NOW()),
(2, 2, 'Alice Smith (Client)', 'Marketing director at an e-commerce agency.', 'https://ui-avatars.com/api/?name=Alice+Smith&background=random', NULL, 5.0, 4, 100.0, 1, NOW(), NOW()),
(3, 3, 'Bob AI (Expert)', 'Senior AI/ML Engineer with 5 years of experience building chatbots and RAG systems.', 'https://ui-avatars.com/api/?name=Bob+AI&background=random', 45.00, 4.9, 32, 98.5, 1, NOW(), NOW()),
(4, 4, 'Sarah Data (Expert)', 'Data Scientist specialized in NLP and computer vision models.', 'https://ui-avatars.com/api/?name=Sarah+Data&background=random', 55.00, 5.0, 18, 100.0, 1, NOW(), NOW());

-- Insert Jobs (Posted by Clients)
INSERT INTO jobs (id, client_id, title, description, budget_min, budget_max, deadline, status, ai_enhanced, view_count, created_at, updated_at) VALUES
(1, 1, 'Build a Customer Support Chatbot using OpenAI API', 'We need an experienced AI developer to build a RAG-based customer support chatbot for our e-commerce website. The bot should be able to read our product catalog and answer customer queries accurately.', 500.00, 1500.00, DATE_ADD(NOW(), INTERVAL 14 DAY), 'OPEN', 1, 45, NOW(), NOW()),
(2, 1, 'Fine-tune LLaMA 3 for Legal Documents', 'Looking for an AI expert to fine-tune a local LLM on a dataset of legal documents. Must have experience with LoRA and PyTorch.', 2000.00, 5000.00, DATE_ADD(NOW(), INTERVAL 30 DAY), 'OPEN', 1, 12, NOW(), NOW()),
(3, 2, 'Automated Product Image Background Removal', 'Need a Python script that uses Computer Vision (like rembg or SAM) to automatically remove backgrounds from our product photos in bulk.', 200.00, 600.00, DATE_ADD(NOW(), INTERVAL 7 DAY), 'OPEN', 0, 89, NOW(), NOW()),
(4, 2, 'AI Voice Generator Integration', 'Looking for someone to integrate ElevenLabs API into our existing Node.js application to generate voiceovers for our videos.', 300.00, 800.00, DATE_ADD(NOW(), INTERVAL 10 DAY), 'OPEN', 0, 23, NOW(), NOW());

-- Insert Services (Posted by Experts)
INSERT INTO services (id, expert_id, title, description, price, delivery_days, status, rating, order_count, created_at, updated_at) VALUES
(1, 3, 'Custom ChatGPT Clone Development', 'I will build a custom ChatGPT clone tailored to your business needs, integrated with your company data using LangChain and Pinecone.', 999.00, 7, 'ACTIVE', 4.9, 15, NOW(), NOW()),
(2, 3, 'AI Prompt Engineering & Optimization', 'I will write and optimize complex prompts for your AI applications to get consistent, high-quality JSON outputs and reduce token costs.', 150.00, 2, 'ACTIVE', 5.0, 42, NOW(), NOW()),
(3, 4, 'Computer Vision / Object Detection Model', 'I will train a custom YOLOv8 model on your dataset to detect specific objects in images or video streams.', 1200.00, 14, 'ACTIVE', 4.8, 8, NOW(), NOW()),
(4, 4, 'Data Scraping & NLP Analysis', 'I will scrape data from websites and perform sentiment analysis and entity extraction using NLP models.', 350.00, 5, 'ACTIVE', 5.0, 21, NOW(), NOW());
