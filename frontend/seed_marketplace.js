const axios = require('axios');

const API_URL = 'http://3.27.209.83/api/v1';

const servicesToCreate = [
  {
    title: 'Custom GPT-4 Customer Support Chatbot',
    description: 'I will build a highly customized, intelligent customer support chatbot using GPT-4 and integrate it into your website or Shopify store. It will be trained on your specific business data.',
    price: 499,
    deliveryDays: 7,
    tags: ['GPT-4', 'Chatbot', 'Python', 'OpenAI']
  },
  {
    title: 'Machine Learning Model for Predictive Maintenance',
    description: 'Develop a predictive maintenance model using historical IoT sensor data to forecast equipment failures before they happen, saving you thousands in downtime.',
    price: 1200,
    deliveryDays: 14,
    tags: ['Machine Learning', 'IoT', 'Data Science', 'Python']
  },
  {
    title: 'AI Image Generation API Integration',
    description: 'Integrate Stable Diffusion or DALL-E 3 into your application to generate high-quality, custom images dynamically based on user prompts.',
    price: 350,
    deliveryDays: 5,
    tags: ['Stable Diffusion', 'DALL-E', 'API', 'Node.js']
  },
  {
    title: 'Automated Document Data Extraction with OCR & NLP',
    description: 'I will build a pipeline that automatically scans invoices or receipts using OCR and extracts structured data (JSON) using advanced NLP models.',
    price: 800,
    deliveryDays: 10,
    tags: ['OCR', 'NLP', 'Computer Vision', 'Data Extraction']
  },
  {
    title: 'Personalized AI Recommendation Engine',
    description: 'Build a collaborative filtering and content-based recommendation engine for your e-commerce site to boost sales by suggesting relevant products to users.',
    price: 950,
    deliveryDays: 12,
    tags: ['Recommendation', 'E-commerce', 'Python', 'Machine Learning']
  },
  {
    title: 'AI Voice Assistant & Speech to Text',
    description: 'Develop a custom voice assistant using Whisper for speech recognition and a text-to-speech engine to create human-like conversational interfaces.',
    price: 600,
    deliveryDays: 8,
    tags: ['Whisper', 'Voice AI', 'Speech-to-Text', 'NLP']
  },
  {
    title: 'Fine-tune LLaMA 3 for your Business',
    description: 'I will fine-tune open-source LLMs like LLaMA 3 on your proprietary dataset so you have a private, highly capable model running on your own servers.',
    price: 2500,
    deliveryDays: 21,
    tags: ['LLaMA', 'Fine-tuning', 'LLMs', 'PyTorch']
  },
  {
    title: 'AI-Powered Resume Parsing Tool',
    description: 'Create an AI tool for HR departments that automatically reads resumes, extracts skills, experience, and education, and ranks candidates against job descriptions.',
    price: 550,
    deliveryDays: 6,
    tags: ['HR Tech', 'NLP', 'Data Parsing', 'Python']
  },
  {
    title: 'Real-time Video Analytics & Object Detection',
    description: 'Implement YOLOv8 to detect and track specific objects in real-time video streams for security, retail analytics, or traffic monitoring.',
    price: 1500,
    deliveryDays: 15,
    tags: ['Computer Vision', 'YOLO', 'Object Detection', 'Video Analytics']
  },
  {
    title: 'AI Copywriting Assistant Extension',
    description: 'Develop a Chrome extension powered by AI that helps writers generate, summarize, and improve their text directly in the browser.',
    price: 450,
    deliveryDays: 5,
    tags: ['Chrome Extension', 'OpenAI', 'JavaScript', 'Copywriting']
  }
];

const jobsToCreate = [
  {
    title: 'Need an AI dev to build a trading bot',
    description: 'We are looking for an experienced AI engineer to build a crypto trading bot using reinforcement learning. Must be familiar with Binance API and deep learning frameworks.',
    budgetMin: 1000,
    budgetMax: 3000,
    timeline: '1 month',
    skills: ['Trading', 'Reinforcement Learning', 'Python']
  },
  {
    title: 'Integrate Claude 3 into our CRM',
    description: 'We need to integrate Anthropic Claude 3 into our custom CRM to automatically draft email responses to clients based on the conversation history.',
    budgetMin: 300,
    budgetMax: 800,
    timeline: '2 weeks',
    skills: ['Claude', 'API', 'CRM', 'Node.js']
  },
  {
    title: 'Medical Image Classification Model',
    description: 'Looking for a computer vision expert to train a CNN model on an X-ray dataset to detect anomalies. High accuracy and explainability (Grad-CAM) are required.',
    budgetMin: 2000,
    budgetMax: 5000,
    timeline: '2 months',
    skills: ['Computer Vision', 'CNN', 'Healthcare', 'PyTorch']
  },
  {
    title: 'Automated AI Blog Writer',
    description: 'Need a script that scrapes trending news, uses GPT-4 to rewrite them into original SEO-optimized blog posts, and automatically publishes to WordPress.',
    budgetMin: 200,
    budgetMax: 500,
    timeline: '1 week',
    skills: ['Web Scraping', 'GPT-4', 'WordPress', 'Python']
  },
  {
    title: 'AI Semantic Search for Internal Docs',
    description: 'We have 10,000+ PDF documents. We need an AI engineer to build a RAG (Retrieval-Augmented Generation) system using vector databases so our employees can ask questions and get answers with citations.',
    budgetMin: 1500,
    budgetMax: 4000,
    timeline: '1.5 months',
    skills: ['RAG', 'Vector Database', 'NLP', 'Python']
  }
];

async function seed() {
  console.log('Starting seed process...');

  try {
    // 1. Create a new Expert
    const expertEmail = `expert_${Date.now()}@test.com`;
    console.log(`Registering expert: ${expertEmail}`);
    await axios.post(`${API_URL}/auth/register`, {
      email: expertEmail,
      password: 'Password@123',
      fullName: 'Top AI Agency',
      role: 'EXPERT'
    });

    // Login as Expert
    const expertLogin = await axios.post(`${API_URL}/auth/login`, {
      email: expertEmail,
      password: 'Password@123'
    });
    const expertToken = expertLogin.data.accessToken;
    
    // Create services
    for (const service of servicesToCreate) {
      console.log(`Creating service: ${service.title}`);
      await axios.post(`${API_URL}/services`, service, {
        headers: { Authorization: `Bearer ${expertToken}` }
      });
    }

    console.log('Skipping admin approval via API. Will update via DB later.');

    // 3. Create a new Client
    const clientEmail = `client_${Date.now()}@test.com`;
    console.log(`Registering client: ${clientEmail}`);
    await axios.post(`${API_URL}/auth/register`, {
      email: clientEmail,
      password: 'Password@123',
      fullName: 'Tech Startup Inc.',
      role: 'CLIENT'
    });

    // Login as Client
    const clientLogin = await axios.post(`${API_URL}/auth/login`, {
      email: clientEmail,
      password: 'Password@123'
    });
    const clientToken = clientLogin.data.accessToken;

    // Create Jobs
    for (const job of jobsToCreate) {
      console.log(`Creating job: ${job.title}`);
      await axios.post(`${API_URL}/jobs`, job, {
        headers: { Authorization: `Bearer ${clientToken}` }
      });
      // Assuming jobs are published automatically or we might need to publish them.
      // Wait, let's get the job list and publish them just in case.
    }
    
    const jobsRes = await axios.get(`${API_URL}/jobs/my`, {
      headers: { Authorization: `Bearer ${clientToken}` }
    });
    const clientJobs = jobsRes.data.content || jobsRes.data;
    for (const j of clientJobs) {
      if (j.status === 'DRAFT') {
         console.log(`Publishing job: ${j.title}`);
         await axios.post(`${API_URL}/jobs/${j.id}/publish`, {}, {
           headers: { Authorization: `Bearer ${clientToken}` }
         });
      }
    }

    console.log('🎉 Seeding completed successfully! 10 services and 5 jobs added.');

  } catch (err) {
    console.error('Error during seeding:');
    if (err.response) {
      console.error(err.response.status, err.response.data);
    } else {
      console.error(err.message);
    }
  }
}

seed();
