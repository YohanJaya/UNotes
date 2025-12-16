const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import endpoints
const { handleAIChat } = require('./Endpoints/ai');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'UNotes Backend API', status: 'running' });
});

// AI Chat endpoint - routes to ai.js for logic
app.post('/api/chat', async (req, res) => {
  try {
    const result = await handleAIChat(req.body);
    res.json(result);
  } catch (error) {
    console.error('AI Chat Error:', error.message);
    
    // Handle validation errors
    if (error.message === 'Question is required') {
      return res.status(400).json({ error: error.message });
    }
    
    // Handle other errors
    res.status(500).json({ 
      error: 'Failed to get AI response',
      details: error.message 
    });
  }
});

// Notes endpoints
app.get('/api/notes', (req, res) => {
  // TODO: Implement notes retrieval from database
  res.json({ notes: [] });
});

app.post('/api/notes', (req, res) => {
  // TODO: Implement note creation
  res.json({ message: 'Note created' });
});

// Upload endpoint
app.post('/api/upload', (req, res) => {
  // TODO: Implement file upload
  res.json({ message: 'File upload endpoint' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
