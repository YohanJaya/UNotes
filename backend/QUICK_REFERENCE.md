# 🚀 UNotes AI System - Quick Reference Card

## One-Page Cheat Sheet for Developers

---

## 📋 MODES AT A GLANCE

| Mode | Trigger | User Action | AI Role | Response Style |
|------|---------|-------------|---------|----------------|
| **AUTO_MODE** | Slide navigation | None (automatic) | University Lecturer | Deep teaching explanation |
| **CHAT_MODE** | User types question | Manual input | Learning Companion | Conversational Q&A |

---

## 🔧 API REQUEST FORMATS

### AUTO_MODE Request
```json
{
  "mode": "AUTO_MODE",
  "imageUrl": "https://...slide.jpg",
  "slideText": "Optional extracted text",
  "slideIndex": 5,
  "notes": [...]
}
```

### CHAT_MODE Request
```json
{
  "mode": "CHAT_MODE",
  "userQuestion": "What is machine learning?",
  "imageUrl": "https://...slide.jpg",
  "slideIndex": 5,
  "notes": [...]
}
```

### Response Format (Both Modes)
```json
{
  "response": "AI-generated content...",
  "mode": "AUTO_MODE",
  "timestamp": "2025-12-13T10:30:00.000Z"
}
```

---

## 💻 FRONTEND CODE SNIPPETS

### Trigger AUTO_MODE (Slide Change)
```javascript
const handleSlideChange = async (slide) => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode: 'AUTO_MODE',
      imageUrl: slide.url,
      slideIndex: slide.index,
      notes: userNotes
    })
  });
  const data = await response.json();
  displayAutoExplanation(data.response);
};
```

### Trigger CHAT_MODE (User Question)
```javascript
const handleUserQuestion = async (question) => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode: 'CHAT_MODE',
      userQuestion: question,
      imageUrl: currentSlide?.url,
      notes: userNotes
    })
  });
  const data = await response.json();
  addToChat(question, data.response);
};
```

---

## 🧠 PROMPT TEMPLATES

### AUTO_MODE Prompt (Summary)
```
You are an expert university lecturer.

ROLE: Explain slides as if teaching in real-time
GUIDELINES:
- Expand beyond visible content
- Provide intuition and examples
- Build context and connections
- Be thorough but clear
- NEVER ask questions back

STRUCTURE:
1. Main concept overview
2. Detailed explanation
3. Practical context
4. Key takeaways
```

### CHAT_MODE Prompt (Summary)
```
You are an intelligent learning companion.

ROLE: Help students explore topics deeply
GUIDELINES:
- Be generative and creative
- Go beyond notes/slides
- Encourage exploration
- Be conversational
- No restrictions on knowledge

BEHAVIOR:
- Answer questions thoroughly
- Provide new insights
- Connect concepts
- Support critical thinking
```

---

## 🔀 MODE DETECTION LOGIC

```javascript
// Priority Order:
1. Explicit mode parameter (RECOMMENDED)
2. Legacy isSlideAnalysis flag
3. Auto-infer: imageUrl + no question → AUTO_MODE
4. User question provided → CHAT_MODE
5. Otherwise → ERROR
```

---

## 📊 MODEL SELECTION

| Scenario | Model | Tokens | Temp |
|----------|-------|--------|------|
| AUTO_MODE (always) | `gpt-4-vision-preview` | 1500 | 0.7 |
| CHAT_MODE (with image) | `gpt-4-vision-preview` | 1200 | 0.8 |
| CHAT_MODE (text only) | `gpt-4-turbo-preview` | 1200 | 0.8 |

---

## ⚠️ COMMON MISTAKES

### ❌ DON'T
```javascript
// Don't show prompt in input for AUTO_MODE
setQuestion("Explain this slide...");

// Don't restrict to notes only
systemPrompt = "Only answer from notes";

// Don't mix modes
if (isSlide || hasQuestion) { /* ambiguous */ }
```

### ✅ DO
```javascript
// Silent auto-trigger
if (slideChanged) handleAutoMode();

// Soft context
systemPrompt += "Use notes as reference, expand beyond";

// Explicit modes
mode: question ? 'CHAT_MODE' : 'AUTO_MODE'
```

---

## 🐛 DEBUG CHECKLIST

- [ ] `mode` parameter explicitly set?
- [ ] AUTO_MODE has `imageUrl`?
- [ ] CHAT_MODE has `userQuestion`?
- [ ] Backend logs show correct mode?
- [ ] Response includes `mode` field?
- [ ] No prompt shows for AUTO_MODE?
- [ ] Responses match mode style?

---

## 🎯 KEY PRINCIPLES

### 1. SEPARATION
- Two distinct modes, never mixed
- Different prompts, different behaviors

### 2. AUTOMATION
- AUTO_MODE requires NO user input
- Triggered by slide navigation only

### 3. EXPLORATION
- CHAT_MODE is unrestricted
- Can go beyond slides/notes

### 4. CONTEXT AS GUIDANCE
- Notes = soft reference
- NOT hard boundaries

### 5. STATELESS REQUESTS
- Each API call independent
- No conversation history on backend

---

## 📈 SUCCESS METRICS

| Metric | Target | Check |
|--------|--------|-------|
| Mode detection accuracy | 100% | Logs |
| AUTO_MODE response time | <3s | Monitoring |
| CHAT_MODE response time | <2s | Monitoring |
| Error rate | <0.1% | Logs |
| Teaching quality | Subjective | User surveys |

---

## 🔗 DOCUMENTATION LINKS

- **Architecture**: `AI_SYSTEM_DESIGN.md`
- **Frontend Guide**: `FRONTEND_INTEGRATION_GUIDE.md`
- **Backend Flow**: `BACKEND_FLOW_PSEUDOCODE.md`
- **Endpoints**: `Endpoints/README.md`

---

## 📞 QUICK TROUBLESHOOTING

| Issue | Solution |
|-------|----------|
| "Mode detection ambiguous" | Add explicit `mode` parameter |
| "AUTO_MODE requires imageUrl" | Check slide.url exists |
| "CHAT_MODE requires question" | Check userQuestion not empty |
| Responses too brief | Check max_tokens (1200-1500) |
| Wrong AI tone | Verify correct prompt template |
| Context pollution | Modes already separated - check logs |

---

## 💡 QUICK TIPS

1. **Always send explicit `mode`** - Don't rely on inference
2. **AUTO_MODE = silent** - No user-visible prompt
3. **CHAT_MODE = ChatGPT** - Open-ended, creative
4. **Notes = reference** - Not restrictions
5. **Each request = fresh** - No backend history

---

## 🚀 ONE-LINE DEPLOY CHECK

```bash
# Server running? Mode detection working? API responding?
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"mode":"CHAT_MODE","userQuestion":"test"}' | jq .mode
# Should return: "CHAT_MODE"
```

---

## 📝 REQUEST EXAMPLE (Complete)

```javascript
// AUTO_MODE: Full example
const autoRequest = {
  mode: 'AUTO_MODE',
  imageUrl: 'https://storage.unotes.com/slides/ml_lecture5_slide12.jpg',
  slideText: 'Supervised vs Unsupervised Learning',
  slideIndex: 12,
  notes: [
    {
      title: 'ML Basics',
      content: ['Classification', 'Regression', 'Clustering'],
      tags: ['AI', 'ML']
    }
  ]
};

// CHAT_MODE: Full example
const chatRequest = {
  mode: 'CHAT_MODE',
  userQuestion: 'Can you explain gradient descent in simpler terms?',
  imageUrl: 'https://storage.unotes.com/slides/ml_lecture5_slide15.jpg',
  slideText: 'Optimization Algorithms',
  slideIndex: 15,
  notes: [
    {
      title: 'Optimization',
      content: ['Gradient descent', 'Learning rate', 'Loss function'],
      tags: ['ML', 'optimization']
    }
  ]
};
```

---

## 🎓 REMEMBER

**AUTO_MODE** = "I'm a lecturer explaining this slide to you"  
**CHAT_MODE** = "I'm your learning companion answering your questions"

Both use context as **guidance**, not **restriction**.

---

**Keep this card handy during development!**

---

## 🔄 VERSION INFO

- **Version**: 2.0
- **Date**: December 13, 2025
- **Backend**: `Endpoints/ai.js`
- **API**: `POST /api/chat`
- **Models**: GPT-4 Vision, GPT-4 Turbo

---

**END OF QUICK REFERENCE**
