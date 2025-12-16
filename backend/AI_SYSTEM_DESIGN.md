# 🧠 UNotes AI System Architecture

## Production-Ready AI Teaching Assistant

**Version:** 2.0  
**Author:** Senior AI Systems Engineer  
**Date:** December 13, 2025

---

## 🎯 SYSTEM OVERVIEW

UNotes uses a **dual-mode AI system** designed specifically for real-time lecture learning:

| Mode | Trigger | Behavior | Purpose |
|------|---------|----------|---------|
| **AUTO_MODE** | Slide navigation | Automatic teaching explanation | Learn slide content deeply without typing |
| **CHAT_MODE** | User types question | ChatGPT-style dialogue | Explore topics, ask follow-ups, deep dive |

---

## 🏗️ ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND EVENT                            │
└───────────────────┬─────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
   Slide Change          User Types Question
        │                       │
        ▼                       ▼
┌───────────────┐       ┌──────────────┐
│  AUTO_MODE    │       │  CHAT_MODE   │
│  Triggered    │       │  Triggered   │
└───────┬───────┘       └──────┬───────┘
        │                      │
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │  Backend Router      │
        │  handleAIChat()      │
        └──────────┬───────────┘
                   │
          ┌────────┴────────┐
          │                 │
          ▼                 ▼
┌─────────────────┐  ┌─────────────────┐
│ AUTO_MODE       │  │ CHAT_MODE       │
│ Handler         │  │ Handler         │
│                 │  │                 │
│ • No prompt     │  │ • User question │
│ • Teaching mode │  │ • Exploratory   │
│ • Lecturer role │  │ • Generative    │
│ • Expand slides │  │ • Unrestricted  │
└────────┬────────┘  └────────┬────────┘
         │                    │
         └────────┬───────────┘
                  │
                  ▼
        ┌──────────────────┐
        │   OpenAI API     │
        │                  │
        │ GPT-4 Vision     │
        │ GPT-4 Turbo      │
        └────────┬─────────┘
                 │
                 ▼
        ┌──────────────────┐
        │  AI Response     │
        │  (Teaching or    │
        │   Dialogue)      │
        └──────────────────┘
```

---

## 📋 MODE SPECIFICATIONS

### 🔹 AUTO_MODE - Automatic Slide Explanation

**Trigger Conditions:**
- User navigates to new slide (index changes)
- Slide image changes
- Frontend explicitly sets `mode: 'AUTO_MODE'`

**Required Data:**
```javascript
{
  mode: 'AUTO_MODE',
  imageUrl: 'https://...',  // REQUIRED
  slideText: '...',         // Optional (extracted text)
  slideIndex: 5,            // Optional (current slide number)
  notes: [...]              // Optional (soft context)
}
```

**Behavior:**
✅ Automatically explains slide without user typing  
✅ Acts as university lecturer  
✅ Expands beyond visible content  
✅ Provides intuition and examples  
✅ Never asks clarifying questions  
✅ Assumes undergraduate student level  

**Model Used:** `gpt-4-vision-preview`  
**Max Tokens:** 1500  
**Temperature:** 0.7 (balanced)

**Example Response Structure:**
```
📊 Understanding [Slide Topic]

[Overview paragraph explaining main concept]

🔍 Detailed Explanation:
[In-depth breakdown of how it works]

💡 Practical Context:
[Why it matters, real-world applications]

📌 Key Takeaways:
• [Point 1]
• [Point 2]
• [Point 3]
```

---

### 🔹 CHAT_MODE - Manual Learning & Exploration

**Trigger Conditions:**
- User types and submits a question
- Frontend explicitly sets `mode: 'CHAT_MODE'`

**Required Data:**
```javascript
{
  mode: 'CHAT_MODE',
  userQuestion: 'What is the difference between...',  // REQUIRED
  imageUrl: 'https://...',  // Optional (if asking about visible slide)
  slideText: '...',         // Optional (context)
  slideIndex: 5,            // Optional (context)
  notes: [...]              // Optional (soft context)
}
```

**Behavior:**
✅ Responds to specific user questions  
✅ ChatGPT-style open-ended dialogue  
✅ Creative and generative  
✅ Can go beyond slides/notes  
✅ Encourages deep exploration  
✅ Builds on conversation context  

**Model Used:** 
- `gpt-4-turbo-preview` (text-only)
- `gpt-4-vision-preview` (if imageUrl provided)

**Max Tokens:** 1200  
**Temperature:** 0.8 (higher creativity)

**Use Cases:**
- "Explain this concept in simpler terms"
- "What's the difference between X and Y?"
- "Can you give me more examples?"
- "How does this relate to [other topic]?"
- "What if we applied this to [scenario]?"

---

## 🧠 PROMPT ENGINEERING

### AUTO_MODE Prompt Design

**Core Principles:**
1. **Lecturer Identity** - "You are an expert university lecturer"
2. **Teaching Mandate** - "Explain... Teach... Expand..."
3. **No Questions Back** - "Never ask clarifying questions"
4. **Depth Focus** - "Provide intuition, examples, context"
5. **Structure Guidance** - Clear response format

**Key Phrases:**
- "Expand beyond the slide"
- "Provide intuition"
- "Give examples"
- "Build context"
- "Be thorough but clear"

**Prompt Length:** ~400 words  
**Tone:** Professional, enthusiastic, patient

---

### CHAT_MODE Prompt Design

**Core Principles:**
1. **Open Identity** - "Learning companion and AI tutor"
2. **Generative Mandate** - "Create new insights, perspectives"
3. **No Restrictions** - "Go beyond materials"
4. **Dialogue Focus** - "Conversational, build on context"
5. **Exploration Encouragement** - "Help discover connections"

**Key Phrases:**
- "Be generative"
- "Go beyond materials"
- "Encourage exploration"
- "Not limited to notes"
- "Creative and helpful"

**Prompt Length:** ~350 words  
**Tone:** Intelligent, supportive, curious

---

## 🔧 TECHNICAL IMPLEMENTATION

### Backend Request Handler

```javascript
// ai.js - Main router
const handleAIChat = async (requestData) => {
  // 1. Mode detection
  const mode = detectMode(requestData);
  
  // 2. Route to handler
  if (mode === 'AUTO_MODE') {
    return handleAutoSlideExplanation(requestData);
  } else {
    return handleManualChat(requestData);
  }
};
```

### Context Building (Soft Guidance)

```javascript
// Notes are REFERENCE material, not restrictions
const buildNotesContext = (notes) => {
  return `
📚 REFERENCE MATERIALS (Student's Notes):
Use as context but expand beyond them.

${notes.map(n => n.content).join('\n')}
  `;
};
```

### Mode Detection Logic

```javascript
// Priority order:
// 1. Explicit mode parameter (recommended)
// 2. Auto-trigger detection (imageUrl but no question)
// 3. User question detection (question provided)

if (mode === 'AUTO_MODE') {
  // Automatic
} else if (userQuestion) {
  // Manual
} else if (imageUrl && !userQuestion) {
  // Auto-infer AUTO_MODE
} else {
  // Error: ambiguous
}
```

---

## 📡 API REQUEST EXAMPLES

### Example 1: AUTO_MODE (Slide Navigation)

```javascript
POST /api/chat
Content-Type: application/json

{
  "mode": "AUTO_MODE",
  "imageUrl": "https://storage.unotes.com/slides/lecture5_slide12.jpg",
  "slideText": "Machine Learning: Supervised vs Unsupervised",
  "slideIndex": 12,
  "notes": [
    {
      "title": "ML Basics",
      "content": ["Classification", "Regression"],
      "tags": ["AI", "ML"]
    }
  ]
}
```

**Expected Response:**
```json
{
  "response": "📊 Understanding Supervised vs Unsupervised Learning\n\nThis slide introduces one of the most fundamental distinctions in machine learning...\n\n🔍 Detailed Explanation:\nSupervised learning is like learning with a teacher. Imagine you're studying for an exam and you have answer keys...\n\n💡 Practical Context:\nIn real-world applications, supervised learning is used when you have labeled historical data...",
  "mode": "AUTO_MODE",
  "timestamp": "2025-12-13T10:30:00.000Z"
}
```

---

### Example 2: CHAT_MODE (User Question)

```javascript
POST /api/chat
Content-Type: application/json

{
  "mode": "CHAT_MODE",
  "userQuestion": "Can you explain the difference between gradient descent and stochastic gradient descent in simpler terms?",
  "notes": [
    {
      "title": "Optimization",
      "content": ["Gradient descent minimizes loss"],
      "tags": ["ML", "optimization"]
    }
  ],
  "slideIndex": 15
}
```

**Expected Response:**
```json
{
  "response": "Great question! Let me break this down with an intuitive analogy.\n\nImagine you're hiking down a mountain in thick fog...\n\n**Gradient Descent (Regular):**\nIt's like taking careful measurements of the entire surrounding area...\n\n**Stochastic Gradient Descent (SGD):**\nInstead of measuring everything, you randomly sample just a few points...\n\nThe key trade-off: Regular GD is more accurate per step but slower. SGD is noisier but much faster...",
  "mode": "CHAT_MODE",
  "timestamp": "2025-12-13T10:32:00.000Z"
}
```

---

### Example 3: CHAT_MODE with Visual Context

```javascript
POST /api/chat
Content-Type: application/json

{
  "mode": "CHAT_MODE",
  "userQuestion": "What's happening in the diagram on this slide?",
  "imageUrl": "https://storage.unotes.com/slides/lecture5_slide15.jpg",
  "slideIndex": 15
}
```

**Response:** Uses GPT-4 Vision to analyze diagram and explain interactively.

---

## 🎨 FRONTEND INTEGRATION GUIDE

### Triggering AUTO_MODE

```javascript
// When user navigates to new slide
const onSlideChange = async (newSlideIndex) => {
  const slide = slides[newSlideIndex];
  
  // Trigger automatic explanation
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode: 'AUTO_MODE',           // Explicit mode
      imageUrl: slide.imageUrl,
      slideText: slide.extractedText,
      slideIndex: newSlideIndex,
      notes: userNotes
    })
  });
  
  const result = await response.json();
  
  // Display explanation automatically in AI panel
  displayAIMessage(result.response, 'auto');
};
```

### Triggering CHAT_MODE

```javascript
// When user submits a question
const onUserQuestion = async (question) => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode: 'CHAT_MODE',            // Explicit mode
      userQuestion: question,
      imageUrl: currentSlide?.imageUrl,  // Optional context
      slideIndex: currentSlideIndex,     // Optional context
      notes: userNotes
    })
  });
  
  const result = await response.json();
  
  // Add to chat history
  addToChatHistory({
    user: question,
    ai: result.response,
    mode: result.mode
  });
};
```

---

## 🧪 TESTING SCENARIOS

### Test Case 1: Pure AUTO_MODE
**Setup:** Navigate to slide 5  
**Expected:** AI explains slide without prompt  
**Verify:** Response is teaching-style, detailed, expanded

### Test Case 2: Pure CHAT_MODE
**Setup:** User types "What is machine learning?"  
**Expected:** AI answers conversationally  
**Verify:** Response is generative, not just note summary

### Test Case 3: CHAT_MODE Beyond Materials
**Setup:** User asks about topic not in notes  
**Expected:** AI still provides helpful answer  
**Verify:** Not restricted to notes only

### Test Case 4: Context Pollution Prevention
**Setup:** AUTO_MODE → CHAT_MODE → AUTO_MODE  
**Expected:** Each response appropriate to mode  
**Verify:** No mixing of teaching vs. dialogue tones

### Test Case 5: Legacy Compatibility
**Setup:** Send request with old `isSlideAnalysis` flag  
**Expected:** Still routes correctly to AUTO_MODE  
**Verify:** Backward compatibility maintained

---

## ⚠️ ANTI-PATTERNS TO AVOID

### ❌ DON'T: Mix modes in same prompt
```javascript
// BAD
systemPrompt = "You're a lecturer. Also answer questions."
```

### ✅ DO: Separate modes clearly
```javascript
// GOOD
if (mode === 'AUTO_MODE') {
  systemPrompt = AUTO_MODE_PROMPT;
} else {
  systemPrompt = CHAT_MODE_PROMPT;
}
```

---

### ❌ DON'T: Restrict CHAT_MODE to notes only
```javascript
// BAD
"Only answer based on the student's notes."
```

### ✅ DO: Treat notes as soft guidance
```javascript
// GOOD
"Reference materials: [notes]. Feel free to expand beyond them."
```

---

### ❌ DON'T: Ask questions in AUTO_MODE
```javascript
// BAD
"What would you like to know about this slide?"
```

### ✅ DO: Deliver full explanation directly
```javascript
// GOOD
"This slide covers [topic]. Let me explain..."
```

---

## 📊 MODEL RECOMMENDATIONS

| Scenario | Model | Reasoning |
|----------|-------|-----------|
| AUTO_MODE with image | `gpt-4-vision-preview` | Best slide understanding |
| CHAT_MODE text-only | `gpt-4-turbo-preview` | Best reasoning & generation |
| CHAT_MODE with image | `gpt-4-vision-preview` | Visual context needed |
| Budget-conscious CHAT | `gpt-3.5-turbo` | Good for simple follow-ups |

**Cost Optimization:**
- AUTO_MODE: Always GPT-4 Vision (quality critical)
- CHAT_MODE: Start with GPT-4 Turbo, fallback to 3.5 if budget tight

---

## 🔒 CONTEXT POLLUTION PREVENTION

### Strategy 1: Explicit Mode Separation
Each mode has completely different system prompts. No shared logic that could leak behavior.

### Strategy 2: Stateless Requests
Each API call is independent. No conversation history persists on backend.

### Strategy 3: Frontend Chat Management
Frontend maintains conversation history per mode if needed.

### Strategy 4: Clear Mode Indicators
Every response includes `mode` field so frontend knows context.

---

## 🚀 DEPLOYMENT CHECKLIST

- [ ] Environment variable `OPENAI_API_KEY` set
- [ ] Model names match OpenAI's latest versions
- [ ] Max tokens configured appropriately (1200-1500)
- [ ] Temperature values set (0.7 for AUTO, 0.8 for CHAT)
- [ ] Error handling for missing `imageUrl` in AUTO_MODE
- [ ] Error handling for missing `userQuestion` in CHAT_MODE
- [ ] Legacy support for old API format maintained
- [ ] Frontend updated to send explicit `mode` parameter
- [ ] Slide change events trigger AUTO_MODE correctly
- [ ] User question submit triggers CHAT_MODE correctly
- [ ] Testing completed for both modes
- [ ] Rate limiting configured (if needed)
- [ ] Logging for mode detection and routing
- [ ] Monitoring for response quality

---

## 📈 SUCCESS METRICS

**AUTO_MODE Quality:**
- Explanation depth (subjective review)
- Student comprehension (surveys)
- Time saved vs. manual note-taking

**CHAT_MODE Quality:**
- Answer relevance
- Exploration depth
- Student satisfaction with follow-ups

**System Health:**
- Mode detection accuracy (should be 100%)
- API response time (<5s for AUTO, <3s for CHAT)
- Error rate (<0.1%)

---

## 🎓 PEDAGOGICAL PHILOSOPHY

**AUTO_MODE:**
- Mimics a **proactive lecturer** who explains before being asked
- Focuses on **teaching**, not describing
- Builds **intuition**, not just facts

**CHAT_MODE:**
- Mimics a **Socratic tutor** who engages in dialogue
- Encourages **exploration**, not just answers
- Supports **discovery**, not just information delivery

**Both Modes:**
- Student-centered
- Depth over brevity
- Understanding over memorization

---

## 📞 SUPPORT & DEBUGGING

**Common Issues:**

1. **"Mode detection ambiguous"**
   - Solution: Always send explicit `mode` parameter

2. **"AUTO_MODE responses too brief"**
   - Check: max_tokens should be 1500+
   - Check: Temperature should be 0.7

3. **"CHAT_MODE restricted to notes"**
   - Check: Prompt says "expand beyond materials"
   - Check: Not using old restrictive prompt

4. **"Context pollution between modes"**
   - Solution: Verify separate system prompts
   - Solution: No shared conversation history

---

## 🔮 FUTURE ENHANCEMENTS

**Phase 2 Ideas:**
- Conversation history per session
- Multi-slide context awareness
- Personalized teaching style
- Voice-based explanations
- Adaptive difficulty level
- Quiz generation from slides

---

**END OF DOCUMENTATION**

For questions or contributions, contact the UNotes AI team.
