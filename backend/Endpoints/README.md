# Backend Endpoints - Code Organization

## 📁 Structure Overview

The backend has been refactored to follow **separation of concerns** principle:

- **`server.js`** - Contains only API routes and Express configuration
- **`Endpoints/ai.js`** - Contains all AI logic and OpenAI integration

---

## 📝 `server.js` - API Routes Only

### Responsibilities:
✅ Express app initialization
✅ Middleware configuration (CORS, JSON parsing)
✅ API endpoint definitions
✅ Error handling and HTTP responses
✅ Server startup

### Key Points:
- **No business logic** - Just routes requests to appropriate handlers
- **Clean and minimal** - Easy to see all available endpoints
- **Imports logic** from Endpoints modules

### Example:
```javascript
// Clean API endpoint - delegates to ai.js
app.post('/api/chat', async (req, res) => {
  try {
    const result = await handleAIChat(req.body);
    res.json(result);
  } catch (error) {
    // Error handling only
  }
});
```

---

## 🤖 `Endpoints/ai.js` - AI Business Logic

### Responsibilities:
✅ OpenAI client initialization
✅ Message context building
✅ GPT-4 Vision integration for slides
✅ GPT-3.5-turbo for text queries
✅ All AI-related business logic

### Exported Functions:

#### **1. `handleAIChat(requestData)`**
Main entry point for AI chat functionality.

**Parameters:**
```javascript
{
  question: string,      // User's question (required)
  notes: Array,          // User's notes (optional)
  imageUrl: string,      // Slide image URL (optional)
  isSlideAnalysis: bool  // Flag for slide analysis (optional)
}
```

**Returns:**
```javascript
{
  response: string  // AI-generated response
}
```

**Example Usage:**
```javascript
const { handleAIChat } = require('./Endpoints/ai');

const result = await handleAIChat({
  question: "Explain this slide",
  imageUrl: "/slides/sensor-basics.jpg",
  isSlideAnalysis: true
});
```

---

#### **2. `buildSystemContext(isSlideAnalysis, notes)`**
Builds appropriate system context message based on request type.

**Parameters:**
- `isSlideAnalysis` (boolean) - Whether analyzing a slide
- `notes` (Array) - User's notes array

**Returns:** System context string

**Logic:**
- If slide analysis → Sets context for detailed explanations
- If notes provided → Includes notes in context
- Otherwise → General helpful assistant context

---

#### **3. `analyzeSlideWithImage(question, imageUrl, systemContext)`**
Handles slide analysis using GPT-4 Vision.

**Parameters:**
- `question` (string) - User's question
- `imageUrl` (string) - URL of the slide image
- `systemContext` (string) - System message

**Returns:** AI response string

**Features:**
- Uses `gpt-4-vision-preview` model
- Supports high-detail image analysis
- Max tokens: 1000
- Temperature: 0.7

---

#### **4. `handleTextChat(question, systemContext)`**
Handles text-only chat using GPT-3.5-turbo.

**Parameters:**
- `question` (string) - User's question
- `systemContext` (string) - System message

**Returns:** AI response string

**Features:**
- Uses `gpt-3.5-turbo` model
- Fast and cost-effective
- Max tokens: 800
- Temperature: 0.7

---

## 🔄 Request Flow

```
┌─────────────────┐
│  Client Request │
│  (Frontend)     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  server.js              │
│  POST /api/chat         │
│  - Validates request    │
│  - Handles HTTP errors  │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Endpoints/ai.js        │
│  handleAIChat()         │
│                         │
│  1. buildSystemContext()│
│  2. Check for imageUrl  │
│     ├─ Yes: analyzeSlideWithImage()
│     └─ No:  handleTextChat()
│                         │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  OpenAI API             │
│  - GPT-4 Vision         │
│  - GPT-3.5-turbo        │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  AI Response            │
│  Returns to client      │
└─────────────────────────┘
```

---

## ✨ Benefits of This Structure

### 1. **Separation of Concerns**
- API layer separated from business logic
- Easy to test individual components
- Clear responsibilities

### 2. **Maintainability**
- Changes to AI logic don't affect routing
- Easy to add new endpoints
- Simple to understand codebase

### 3. **Reusability**
- AI functions can be imported elsewhere
- Logic can be used in other contexts
- Functions are modular and composable

### 4. **Scalability**
- Easy to add new endpoint files (note.js, uploadDoc.js)
- Each file focuses on one domain
- Follows industry best practices

### 5. **Testing**
- Can unit test AI logic independently
- Can integration test API endpoints
- Mock OpenAI API easily

---

## 🔧 Adding New Endpoints

When adding new functionality, follow this pattern:

### 1. Create Logic File
```javascript
// Endpoints/newFeature.js
const handleNewFeature = async (data) => {
  // Business logic here
  return result;
};

module.exports = { handleNewFeature };
```

### 2. Add Route in server.js
```javascript
// server.js
const { handleNewFeature } = require('./Endpoints/newFeature');

app.post('/api/new-feature', async (req, res) => {
  try {
    const result = await handleNewFeature(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## 🚀 Running the Server

```bash
# Development mode with auto-reload
cd backend
npm run dev

# Production mode
npm start
```

---

## 📊 Current Endpoints

| Method | Endpoint      | Handler           | Description                |
|--------|---------------|-------------------|----------------------------|
| GET    | /             | server.js         | Health check               |
| POST   | /api/chat     | ai.js             | AI chat with slide support |
| GET    | /api/notes    | server.js (TODO)  | Get user notes             |
| POST   | /api/notes    | server.js (TODO)  | Create new note            |
| POST   | /api/upload   | server.js (TODO)  | Upload files               |

---

## 🔐 Environment Variables

Required in `.env` file:

```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=5000
NODE_ENV=development
```

---

## 📖 Example API Usage

### Slide Analysis with Image:
```javascript
POST /api/chat
Content-Type: application/json

{
  "question": "Please provide a detailed explanation of this slide",
  "imageUrl": "https://example.com/slide.jpg",
  "isSlideAnalysis": true,
  "notes": []
}
```

### Text-Only Query:
```javascript
POST /api/chat
Content-Type: application/json

{
  "question": "What are the main concepts in my notes?",
  "notes": [
    {
      "title": "Sensors",
      "content": ["Distance sensors measure..."],
      "tags": ["robotics", "hardware"]
    }
  ]
}
```

---

## ✅ Code Quality

- ✅ Clean separation of concerns
- ✅ Well-documented functions
- ✅ Proper error handling
- ✅ CommonJS module exports
- ✅ Consistent code style
- ✅ Easy to extend and maintain
