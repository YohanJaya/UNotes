# UNotes Backend

Backend API server for the UNotes application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file and add your API keys:
```
PORT=5000
OPENAI_API_KEY=your_key_here
```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

- `GET /` - Health check
- `POST /api/chat` - AI chat endpoint
- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create a new note
- `POST /api/upload` - Upload documents

## Environment Variables

- `PORT` - Server port (default: 5000)
- `OPENAI_API_KEY` - OpenAI API key (optional)
- `GEMINI_API_KEY` - Google Gemini API key (optional)
