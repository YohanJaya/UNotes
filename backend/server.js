const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'UNotes Backend API', status: 'running' });
});

// AI Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { question, notes } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Build context from notes
    let context = 'You are a helpful AI assistant for a note-taking application called UNotes. ';
    if (notes && notes.length > 0) {
      context += 'Here are the user\'s notes:\n\n';
      notes.forEach(note => {
        context += `Title: ${note.title}\n`;
        context += `Content: ${note.content.join('. ')}\n`;
        context += `Tags: ${note.tags.join(', ')}\n\n`;
      });
      context += 'Answer the user\'s question based on their notes if relevant, or provide general helpful information.\n\n';
    }

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: context },
        { role: "user", content: question }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const aiResponse = completion.choices[0].message.content;

    res.json({
      response: aiResponse
    });
  } catch (error) {
    console.error('OpenAI API Error:', error.message);
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
