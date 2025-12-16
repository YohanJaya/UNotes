# 🎯 Frontend Integration Guide - New AI System

## Quick Start: Implementing AUTO_MODE & CHAT_MODE

---

## 📋 SUMMARY OF CHANGES NEEDED

Your frontend needs **two distinct triggers**:

1. **Slide Navigation** → Trigger `AUTO_MODE` (automatic explanation)
2. **User Question Submit** → Trigger `CHAT_MODE` (manual Q&A)

---

## 🔧 IMPLEMENTATION STEPS

### Step 1: Update AI Component State

```javascript
// src/components/ai.jsx

const AI = ({ selectedSlide, notes }) => {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState(null);  // NEW: Track mode
  
  // ... rest of state
}
```

---

### Step 2: Create AUTO_MODE Handler (Slide Navigation)

```javascript
// src/components/ai.jsx

/**
 * AUTO_MODE: Triggered when slide changes
 * NO user prompt needed - fully automatic
 */
const handleSlideChange = async (slide) => {
  if (!slide || !slide.url) return;
  
  setIsLoading(true);
  setCurrentMode('AUTO_MODE');
  
  try {
    const response = await fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode: 'AUTO_MODE',                    // EXPLICIT MODE
        imageUrl: slide.url,                  // Slide image (required)
        slideText: slide.extractedText,       // Optional: OCR text
        slideIndex: slide.index,              // Optional: slide number
        notes: notes                          // Optional: user notes as context
      }),
    });

    const data = await response.json();
    
    // Add auto-explanation to chat
    setMessages(prev => [...prev, {
      type: 'ai',
      content: data.response,
      mode: 'AUTO_MODE',
      slideIndex: slide.index,
      timestamp: new Date().toISOString()
    }]);
    
  } catch (error) {
    console.error('AUTO_MODE error:', error);
    // Handle error gracefully
  } finally {
    setIsLoading(false);
  }
};
```

---

### Step 3: Create CHAT_MODE Handler (User Question)

```javascript
// src/components/ai.jsx

/**
 * CHAT_MODE: Triggered when user submits question
 * User-driven, ChatGPT-style interaction
 */
const handleUserQuestion = async (e) => {
  e.preventDefault();
  
  if (!question.trim()) return;
  
  // Add user message to chat immediately
  const userMessage = {
    type: 'user',
    content: question,
    timestamp: new Date().toISOString()
  };
  setMessages(prev => [...prev, userMessage]);
  
  setIsLoading(true);
  setCurrentMode('CHAT_MODE');
  const currentQuestion = question;
  setQuestion('');  // Clear input
  
  try {
    const response = await fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode: 'CHAT_MODE',                    // EXPLICIT MODE
        userQuestion: currentQuestion,        // User's question (required)
        imageUrl: selectedSlide?.url,         // Optional: current slide context
        slideText: selectedSlide?.extractedText,  // Optional
        slideIndex: selectedSlide?.index,     // Optional
        notes: notes                          // Optional: soft context
      }),
    });

    const data = await response.json();
    
    // Add AI response to chat
    setMessages(prev => [...prev, {
      type: 'ai',
      content: data.response,
      mode: 'CHAT_MODE',
      timestamp: new Date().toISOString()
    }]);
    
  } catch (error) {
    console.error('CHAT_MODE error:', error);
    // Handle error gracefully
  } finally {
    setIsLoading(false);
  }
};
```

---

### Step 4: Wire Up Slide Change Detection

```javascript
// src/components/ai.jsx

useEffect(() => {
  if (selectedSlide && selectedSlide !== currentSlide) {
    setCurrentSlide(selectedSlide);
    
    // TRIGGER AUTO_MODE AUTOMATICALLY
    handleSlideChange(selectedSlide);
  }
}, [selectedSlide]);
```

---

### Step 5: Update JSX with Clear Mode Indicators

```javascript
// src/components/ai.jsx

return (
  <div className="ai-container">
    <div className="ai-header">
      <h2>AI Teaching Assistant</h2>
      {currentMode && (
        <span className={`mode-badge ${currentMode.toLowerCase()}`}>
          {currentMode === 'AUTO_MODE' ? '🤖 Auto-Explaining' : '💬 Chat Mode'}
        </span>
      )}
    </div>

    <div className="ai-messages">
      {messages.map((msg, index) => (
        <div key={index} className={`message ${msg.type}`}>
          {/* Mode indicator for AI messages */}
          {msg.type === 'ai' && msg.mode && (
            <div className="message-mode-label">
              {msg.mode === 'AUTO_MODE' 
                ? `📊 Slide ${msg.slideIndex || ''} Explanation` 
                : '💡 AI Response'}
            </div>
          )}
          
          <div className="message-content">
            {msg.content}
          </div>
          
          <div className="message-timestamp">
            {new Date(msg.timestamp).toLocaleTimeString()}
          </div>
        </div>
      ))}
      
      {isLoading && (
        <div className="message ai loading">
          <div className="typing-indicator">
            {currentMode === 'AUTO_MODE' 
              ? 'Analyzing slide...' 
              : 'Thinking...'}
          </div>
        </div>
      )}
    </div>

    {/* User input for CHAT_MODE */}
    <form onSubmit={handleUserQuestion} className="ai-input-form">
      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask a question to explore deeper..."
        disabled={isLoading}
      />
      <button type="submit" disabled={isLoading || !question.trim()}>
        Ask AI
      </button>
    </form>
  </div>
);
```

---

### Step 6: Add CSS for Mode Indicators

```css
/* src/components/ai.css */

.mode-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.mode-badge.auto_mode {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.mode-badge.chat_mode {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.message-mode-label {
  font-size: 0.75rem;
  color: #888;
  margin-bottom: 8px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.message.ai {
  background: #1a1a1a;
  border-left: 4px solid #667eea;
}

.message.user {
  background: #2a2a2a;
  border-left: 4px solid #f5576c;
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #888;
}

.typing-indicator::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #667eea;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}
```

---

## 📊 COMPARISON: OLD vs NEW

### OLD System (What You Had)
```javascript
// ❌ Ambiguous - requires user to type prompt
const analyzeSlide = (slide) => {
  const autoPrompt = `Please explain this slide: ${slide.name}`;
  setQuestion(autoPrompt);  // Shows in input
  setTimeout(() => sendQuery(autoPrompt, slide.url, true), 500);
};
```

### NEW System (What You Need)
```javascript
// ✅ Clear - automatic, no prompt needed
const handleSlideChange = async (slide) => {
  await fetch('/api/chat', {
    body: JSON.stringify({
      mode: 'AUTO_MODE',        // Explicit mode
      imageUrl: slide.url,      // Just the image
      // NO question field needed!
    })
  });
};
```

---

## 🎯 KEY DIFFERENCES

| Aspect | OLD | NEW |
|--------|-----|-----|
| **Mode Detection** | Implicit (via `isSlideAnalysis` flag) | **Explicit (`mode` parameter)** |
| **Auto Trigger** | Shows fake prompt in input box | **Silent - no user-visible prompt** |
| **User Questions** | Mixed with auto-analysis logic | **Separate CHAT_MODE handler** |
| **AI Behavior** | Generic "helpful assistant" | **Role-specific (Lecturer vs Tutor)** |
| **Context Usage** | Notes as restriction | **Notes as soft guidance** |
| **Response Depth** | Basic explanation | **Deep teaching + expansion** |

---

## 🚀 TESTING YOUR IMPLEMENTATION

### Test 1: AUTO_MODE
1. Navigate to a slide
2. **Expect:** AI explanation appears automatically
3. **Verify:** No prompt shows in input box
4. **Check:** Response is teaching-style, detailed

### Test 2: CHAT_MODE
1. Type "What is machine learning?"
2. Click "Ask AI"
3. **Expect:** AI answers your specific question
4. **Verify:** Response is conversational, exploratory

### Test 3: Mode Separation
1. Trigger AUTO_MODE (change slide)
2. Then ask a manual question (CHAT_MODE)
3. **Verify:** Each response appropriate to its mode
4. **Check:** No tone mixing

### Test 4: Context Awareness
1. Ask question beyond your notes
2. **Expect:** AI still provides helpful answer
3. **Verify:** Not restricted to notes only

---

## 🐛 COMMON ISSUES & FIXES

### Issue 1: "AUTO_MODE still showing prompt in input"
**Fix:** Remove the `setQuestion()` call from slide change handler. AUTO_MODE should be completely silent.

```javascript
// ❌ DON'T DO THIS
const handleSlideChange = (slide) => {
  setQuestion("Explain this slide...");  // REMOVE THIS
  sendToAPI();
};

// ✅ DO THIS
const handleSlideChange = (slide) => {
  // Just send to API, no UI prompt needed
  sendToAPI();
};
```

---

### Issue 2: "Mode field missing in request"
**Fix:** Always send explicit `mode` parameter:

```javascript
body: JSON.stringify({
  mode: 'AUTO_MODE',  // or 'CHAT_MODE'
  // ... rest of data
})
```

---

### Issue 3: "AI responses too brief"
**Check:** Backend max_tokens settings
- AUTO_MODE: Should be 1500
- CHAT_MODE: Should be 1200

---

### Issue 4: "Context pollution between modes"
**Fix:** Backend already handles this with separate prompts. If still occurring, check that you're not caching system prompts.

---

## 📱 MOBILE CONSIDERATIONS

```javascript
// Disable auto-scroll to input on AUTO_MODE
const handleSlideChange = async (slide) => {
  // ... API call ...
  
  // DON'T scroll to input (it's not being used)
  // inputRef.current?.focus();  // REMOVE THIS
};

// Only scroll/focus on CHAT_MODE
const handleUserQuestion = async (e) => {
  e.preventDefault();
  // User explicitly engaged - OK to manage focus
};
```

---

## 🎨 UI/UX RECOMMENDATIONS

### 1. Visual Distinction
- **AUTO_MODE messages**: Blue/purple gradient border
- **CHAT_MODE messages**: Pink/red gradient border

### 2. Loading States
- **AUTO_MODE**: "Analyzing slide..."
- **CHAT_MODE**: "Thinking..."

### 3. Message Headers
- **AUTO_MODE**: "📊 Slide 5 Explanation"
- **CHAT_MODE**: "💡 AI Response"

### 4. Input Placeholder
- Change based on context: "Ask a question to explore deeper..."
- NOT: "Type question or click slide" (confusing)

### 5. Clear Chat Button
- Option to clear AUTO_MODE explanations separately
- Keep CHAT_MODE conversation history

---

## 💾 LOCAL STORAGE (Optional)

```javascript
// Save chat history per mode
const saveChatHistory = () => {
  const autoMessages = messages.filter(m => m.mode === 'AUTO_MODE');
  const chatMessages = messages.filter(m => m.mode === 'CHAT_MODE');
  
  localStorage.setItem('unotes_auto_explanations', JSON.stringify(autoMessages));
  localStorage.setItem('unotes_chat_history', JSON.stringify(chatMessages));
};

// Restore on load
useEffect(() => {
  const autoHistory = JSON.parse(localStorage.getItem('unotes_auto_explanations') || '[]');
  const chatHistory = JSON.parse(localStorage.getItem('unotes_chat_history') || '[]');
  
  setMessages([...autoHistory, ...chatHistory]);
}, []);
```

---

## 🔍 DEBUGGING CHECKLIST

- [ ] `mode` parameter is explicitly set in every request
- [ ] AUTO_MODE sends `imageUrl` (required)
- [ ] CHAT_MODE sends `userQuestion` (required)
- [ ] Slide change triggers `handleSlideChange()` correctly
- [ ] User input triggers `handleUserQuestion()` correctly
- [ ] No prompt shows in input on AUTO_MODE
- [ ] Messages include `mode` field for UI rendering
- [ ] Loading states show appropriate text
- [ ] Backend responds with `mode` in response
- [ ] Error handling works for both modes
- [ ] No console errors in browser or server

---

## 📞 SUPPORT

If issues persist:
1. Check browser console for errors
2. Check backend logs for mode detection
3. Verify request payload matches API spec
4. Test with simple slides first
5. Review `backend/AI_SYSTEM_DESIGN.md` for details

---

**You're ready to implement the new dual-mode AI system! 🚀**
