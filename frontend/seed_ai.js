const fs = require('fs');

async function seedData() {
  const baseUrl = 'http://localhost:8080/api/v1';

  // Helper to login and get token
  async function login(email, password) {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    return data.accessToken;
  }

  const experts = [
    {
      email: 'expert@test.com',
      bio: 'I am a Senior AI Engineer specializing in Machine Learning, Deep Learning, and Natural Language Processing. I have 5 years of experience building scalable ML pipelines and RAG systems using Python, TensorFlow, and PyTorch.',
      skillIds: [1, 2, 3, 5] // Assuming these are AI/ML skills
    },
    {
      email: 'expert123@test.com',
      bio: 'Fullstack developer with a strong focus on AI integration. I build web applications using React, Node.js, and integrate OpenAI APIs for smart features like chatbots and automated content generation.',
      skillIds: [4, 6, 7]
    }
  ];

  for (const expert of experts) {
    try {
      console.log(`Logging in as ${expert.email}...`);
      const token = await login(expert.email, 'password');
      if (!token) {
        console.error(`Failed to login as ${expert.email}`);
        continue;
      }

      console.log(`Updating profile for ${expert.email} to trigger AI embedding generation...`);
      const res = await fetch(`${baseUrl}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bio: expert.bio,
          skillIds: expert.skillIds
        })
      });

      if (res.ok) {
        console.log(`Successfully updated ${expert.email} and triggered embedding!`);
      } else {
        console.error(`Failed to update ${expert.email}:`, await res.text());
      }
    } catch (e) {
      console.error(`Error processing ${expert.email}:`, e.message);
    }
  }
}

seedData();
