# 🔄 Backend Flow Diagrams & Pseudocode

## Complete Request-Response Flow for UNotes AI System

---

## 📊 HIGH-LEVEL FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                                                                  │
│  ┌──────────────────┐              ┌──────────────────┐        │
│  │  Slide Change    │              │  User Types      │        │
│  │  Event Detected  │              │  Question        │        │
│  └────────┬─────────┘              └────────┬─────────┘        │
│           │                                  │                   │
│           ▼                                  ▼                   │
│  ┌──────────────────┐              ┌──────────────────┐        │
│  │ Build AUTO_MODE  │              │ Build CHAT_MODE  │        │
│  │ Request Payload  │              │ Request Payload  │        │
│  └────────┬─────────┘              └────────┬─────────┘        │
│           │                                  │                   │
│           └──────────────┬───────────────────┘                  │
│                          │                                       │
└──────────────────────────┼───────────────────────────────────────┘
                           │
                           ▼
        ┌────────────────────────────────────────┐
        │     POST /api/chat                     │
        │     server.js                          │
        │                                        │
        │  1. Receive request                    │
        │  2. Extract body                       │
        │  3. Call handleAIChat()                │
        │  4. Return response                    │
        └──────────────────┬─────────────────────┘
                           │
                           ▼
        ┌────────────────────────────────────────┐
        │     handleAIChat()                     │
        │     Endpoints/ai.js                    │
        │                                        │
        │  ┌──────────────────────────┐         │
        │  │  Mode Detection Logic    │         │
        │  │                          │         │
        │  │  if (mode === 'AUTO')    │         │
        │  │    → handleAutoSlide...()│         │
        │  │                          │         │
        │  │  else (mode === 'CHAT')  │         │
        │  │    → handleManualChat()  │         │
        │  └──────────────────────────┘         │
        └──────────────────┬─────────────────────┘
                           │
          ┌────────────────┴────────────────┐
          │                                  │
          ▼                                  ▼
┌─────────────────────┐          ┌──────────────────────┐
│ handleAutoSlide     │          │ handleManualChat()   │
│ Explanation()       │          │                      │
│                     │          │                      │
│ 1. Validate imageUrl│          │ 1. Validate question │
│ 2. Build AUTO prompt│          │ 2. Build CHAT prompt │
│ 3. Add slide context│          │ 3. Add soft context  │
│ 4. Add notes (soft) │          │ 4. Choose model      │
│ 5. Call GPT-4 Vision│          │ 5. Call OpenAI API   │
│ 6. Return teaching  │          │ 6. Return response   │
│    explanation      │          │                      │
└──────────┬──────────┘          └──────────┬───────────┘
           │                                 │
           └────────────┬────────────────────┘
                        │
                        ▼
        ┌────────────────────────────────────────┐
        │     OpenAI API                         │
        │                                        │
        │  GPT-4 Vision (for slides)             │
        │  GPT-4 Turbo (for text reasoning)      │
        └──────────────────┬─────────────────────┘
                           │
                           ▼
        ┌────────────────────────────────────────┐
        │     Response Assembly                  │
        │                                        │
        │  {                                     │
        │    response: "...",                    │
        │    mode: "AUTO_MODE" | "CHAT_MODE",    │
        │    timestamp: "..."                    │
        │  }                                     │
        └──────────────────┬─────────────────────┘
                           │
                           ▼
        ┌────────────────────────────────────────┐
        │     Return to Frontend                 │
        │                                        │
        │  Display in appropriate UI style       │
        └────────────────────────────────────────┘
```

---

## 💻 DETAILED PSEUDOCODE

### 1. Server Entry Point (`server.js`)

```pseudocode
FUNCTION handleChatEndpoint(request, response):
    TRY:
        // Extract request body
        requestData = parseJSON(request.body)
        
        // Delegate to AI logic handler
        result = await handleAIChat(requestData)
        
        // Send success response
        response.json(result)
        
    CATCH error:
        IF error.message == 'Question is required':
            response.status(400).json({ error: error.message })
        ELSE IF error.message == 'AUTO_MODE requires slide image URL':
            response.status(400).json({ error: error.message })
        ELSE:
            log(error)
            response.status(500).json({ 
                error: 'Failed to get AI response',
                details: error.message 
            })
    END TRY
END FUNCTION
```

---

### 2. Main Router (`handleAIChat()`)

```pseudocode
FUNCTION handleAIChat(requestData):
    // Extract all possible fields
    mode = requestData.mode
    userQuestion = requestData.userQuestion OR requestData.question
    imageUrl = requestData.imageUrl
    slideText = requestData.slideText
    slideIndex = requestData.slideIndex
    notes = requestData.notes
    
    // Legacy support
    isSlideAnalysis = requestData.isSlideAnalysis
    
    // ═══════════════════════════════════
    // MODE DETECTION LOGIC (CRITICAL)
    // ═══════════════════════════════════
    
    detectedMode = NULL
    
    // Priority 1: Explicit mode (RECOMMENDED)
    IF mode IS PROVIDED:
        detectedMode = mode
        
    // Priority 2: Legacy flag
    ELSE IF isSlideAnalysis == TRUE:
        detectedMode = 'AUTO_MODE'
        
    // Priority 3: Auto-inference (imageUrl but no question)
    ELSE IF imageUrl EXISTS AND NOT userQuestion:
        detectedMode = 'AUTO_MODE'
        
    // Priority 4: User question provided
    ELSE IF userQuestion EXISTS:
        detectedMode = 'CHAT_MODE'
        
    // Error: Ambiguous
    ELSE:
        THROW Error('Cannot determine AI mode')
    END IF
    
    // ═══════════════════════════════════
    // ROUTE TO APPROPRIATE HANDLER
    // ═══════════════════════════════════
    
    aiResponse = NULL
    
    IF detectedMode == 'AUTO_MODE':
        // Automatic slide explanation
        aiResponse = await handleAutoSlideExplanation({
            imageUrl: imageUrl,
            slideText: slideText,
            slideIndex: slideIndex,
            notes: notes
        })
        
    ELSE IF detectedMode == 'CHAT_MODE':
        // Manual user question
        aiResponse = await handleManualChat({
            userQuestion: userQuestion,
            notes: notes,
            slideText: slideText,
            slideIndex: slideIndex,
            imageUrl: imageUrl  // Optional context
        })
        
    ELSE:
        THROW Error('Invalid mode: ' + detectedMode)
    END IF
    
    // ═══════════════════════════════════
    // ASSEMBLE AND RETURN RESPONSE
    // ═══════════════════════════════════
    
    RETURN {
        response: aiResponse,
        mode: detectedMode,
        timestamp: getCurrentTimestamp()
    }
END FUNCTION
```

---

### 3. AUTO_MODE Handler

```pseudocode
FUNCTION handleAutoSlideExplanation(params):
    imageUrl = params.imageUrl
    slideText = params.slideText
    slideIndex = params.slideIndex
    notes = params.notes
    
    // ═══════════════════════════════════
    // VALIDATION
    // ═══════════════════════════════════
    
    IF NOT imageUrl:
        THROW Error('AUTO_MODE requires slide image URL')
    END IF
    
    // ═══════════════════════════════════
    // BUILD SYSTEM PROMPT (LECTURER MODE)
    // ═══════════════════════════════════
    
    systemPrompt = AUTO_MODE_PROMPT  // Pre-defined template
    
    // Add soft context (notes as reference, NOT restriction)
    IF notes AND notes.length > 0:
        notesContext = buildNotesContext(notes)
        systemPrompt = systemPrompt + notesContext
    END IF
    
    // ═══════════════════════════════════
    // BUILD SLIDE CONTEXT
    // ═══════════════════════════════════
    
    slideContext = ""
    slideContext += "\n\n📊 SLIDE INFORMATION:\n"
    slideContext += "Slide Number: " + (slideIndex OR "Current") + "\n"
    
    IF slideText:
        slideContext += "Slide Content:\n" + slideText + "\n"
    END IF
    
    // ═══════════════════════════════════
    // BUILD AUTO INSTRUCTION (NO USER INPUT)
    // ═══════════════════════════════════
    
    autoInstruction = slideContext + "\n\n"
    autoInstruction += "**TASK:** Explain this slide in detail "
    autoInstruction += "as if teaching it in a live lecture. "
    autoInstruction += "The student has just navigated to this slide "
    autoInstruction += "and needs to understand it thoroughly. "
    autoInstruction += "Provide a comprehensive explanation that goes "
    autoInstruction += "beyond what's visible on the slide."
    
    // ═══════════════════════════════════
    // CONSTRUCT OPENAI API MESSAGES
    // ═══════════════════════════════════
    
    messages = [
        {
            role: "system",
            content: systemPrompt
        },
        {
            role: "user",
            content: [
                {
                    type: "text",
                    text: autoInstruction
                },
                {
                    type: "image_url",
                    image_url: {
                        url: imageUrl,
                        detail: "high"  // High detail for OCR
                    }
                }
            ]
        }
    ]
    
    // ═══════════════════════════════════
    // CALL GPT-4 VISION
    // ═══════════════════════════════════
    
    completion = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: messages,
        max_tokens: 1500,        // Higher for teaching
        temperature: 0.7         // Balanced
    })
    
    aiResponse = completion.choices[0].message.content
    
    RETURN aiResponse
END FUNCTION
```

---

### 4. CHAT_MODE Handler

```pseudocode
FUNCTION handleManualChat(params):
    userQuestion = params.userQuestion
    notes = params.notes
    slideText = params.slideText
    slideIndex = params.slideIndex
    imageUrl = params.imageUrl
    
    // ═══════════════════════════════════
    // VALIDATION
    // ═══════════════════════════════════
    
    IF NOT userQuestion OR userQuestion.trim() == "":
        THROW Error('CHAT_MODE requires a user question')
    END IF
    
    // ═══════════════════════════════════
    // BUILD SYSTEM PROMPT (TUTOR MODE)
    // ═══════════════════════════════════
    
    systemPrompt = CHAT_MODE_PROMPT  // Pre-defined template
    
    // Add soft context (notes as reference, NOT boundary)
    IF notes AND notes.length > 0:
        notesContext = buildNotesContext(notes)
        systemPrompt = systemPrompt + notesContext
    END IF
    
    // Add current slide context (optional, soft)
    IF slideText OR slideIndex:
        systemPrompt += "\n\n📊 CURRENT CONTEXT:\n"
        systemPrompt += "The student is currently viewing "
        systemPrompt += (slideIndex ? "Slide " + slideIndex : "a lecture slide")
        systemPrompt += ".\n"
        
        IF slideText:
            systemPrompt += "Slide content: " + slideText + "\n"
        END IF
        
        systemPrompt += "This is just for context - "
        systemPrompt += "feel free to answer beyond this material.\n"
    END IF
    
    // ═══════════════════════════════════
    // CHOOSE MODEL BASED ON VISUAL NEEDS
    // ═══════════════════════════════════
    
    messages = []
    completion = NULL
    
    IF imageUrl EXISTS:
        // User might be asking about visible slide
        // Use GPT-4 Vision
        
        messages = [
            {
                role: "system",
                content: systemPrompt
            },
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: userQuestion
                    },
                    {
                        type: "image_url",
                        image_url: {
                            url: imageUrl,
                            detail: "high"
                        }
                    }
                ]
            }
        ]
        
        completion = await openai.chat.completions.create({
            model: "gpt-4-vision-preview",
            messages: messages,
            max_tokens: 1200,
            temperature: 0.8  // Higher creativity
        })
        
    ELSE:
        // Text-only question
        // Use GPT-4 Turbo (best reasoning)
        
        messages = [
            {
                role: "system",
                content: systemPrompt
            },
            {
                role: "user",
                content: userQuestion
            }
        ]
        
        completion = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: messages,
            max_tokens: 1200,
            temperature: 0.8
        })
    END IF
    
    aiResponse = completion.choices[0].message.content
    
    RETURN aiResponse
END FUNCTION
```

---

### 5. Context Builders (Utilities)

```pseudocode
FUNCTION buildNotesContext(notes):
    IF NOT notes OR notes.length == 0:
        RETURN ""
    END IF
    
    context = "\n\n📚 **REFERENCE MATERIALS (Student's Notes):**\n"
    context += "The student has taken these notes. "
    context += "Use them as context but feel free to expand beyond them.\n\n"
    
    FOR EACH note IN notes:
        context += "Note " + (index + 1) + ": " + note.title + "\n"
        
        IF note.content AND note.content IS ARRAY:
            context += note.content.join(' ') + "\n"
        END IF
        
        IF note.tags AND note.tags.length > 0:
            context += "Topics: " + note.tags.join(', ') + "\n"
        END IF
        
        context += "\n"
    END FOR
    
    RETURN context
END FUNCTION

FUNCTION buildSlideContext(slideText, slideIndex):
    context = "\n\n📊 **SLIDE INFORMATION:**\n"
    context += "Slide Number: " + (slideIndex OR "Current") + "\n"
    
    IF slideText:
        context += "Slide Content:\n" + slideText + "\n"
    END IF
    
    RETURN context
END FUNCTION
```

---

## 🔀 MODE DETECTION DECISION TREE

```
START
  │
  ├─ Is 'mode' explicitly provided?
  │    ├─ YES → Use provided mode
  │    └─ NO ↓
  │
  ├─ Is 'isSlideAnalysis' TRUE? (legacy)
  │    ├─ YES → AUTO_MODE
  │    └─ NO ↓
  │
  ├─ Is 'imageUrl' provided BUT NO 'userQuestion'?
  │    ├─ YES → AUTO_MODE (auto-trigger inference)
  │    └─ NO ↓
  │
  ├─ Is 'userQuestion' provided?
  │    ├─ YES → CHAT_MODE
  │    └─ NO ↓
  │
  └─ ERROR: Cannot determine mode
```

---

## 🎯 REQUEST VALIDATION MATRIX

| Mode | Required Fields | Optional Fields | Validation Error |
|------|----------------|-----------------|------------------|
| **AUTO_MODE** | `imageUrl` | `slideText`, `slideIndex`, `notes` | "AUTO_MODE requires slide image URL" |
| **CHAT_MODE** | `userQuestion` | `imageUrl`, `slideText`, `slideIndex`, `notes` | "CHAT_MODE requires a user question" |

---

## 🔄 RESPONSE FLOW TIMING

```
Frontend Event
    │
    ├─ 0ms: User action (slide change or question submit)
    ├─ 10ms: Build request payload
    ├─ 20ms: Send HTTP POST to /api/chat
    │
    ▼
Backend Processing
    │
    ├─ 50ms: Receive request, parse JSON
    ├─ 55ms: Mode detection
    ├─ 60ms: Route to handler
    ├─ 65ms: Build system prompt
    ├─ 70ms: Construct OpenAI messages
    ├─ 100ms: Send to OpenAI API
    │
    ▼
OpenAI Processing
    │
    ├─ 100-3000ms: GPT-4 Vision processing (AUTO_MODE)
    ├─ 100-2000ms: GPT-4 Turbo processing (CHAT_MODE)
    │
    ▼
Response Assembly
    │
    ├─ +10ms: Extract completion content
    ├─ +15ms: Build response object
    ├─ +20ms: Send JSON back to frontend
    │
    ▼
Frontend Display
    │
    ├─ +30ms: Parse response
    ├─ +35ms: Add to messages state
    ├─ +40ms: Render in UI
    │
    ▼
Total Time: 150ms-3100ms (typical: 1500ms)
```

---

## 🛡️ ERROR HANDLING FLOW

```pseudocode
TRY:
    result = handleAIChat(requestData)
    RETURN success(result)
    
CATCH ValidationError (e.g., missing field):
    LOG error
    RETURN status(400).json({
        error: error.message,
        type: 'validation',
        field: error.field
    })
    
CATCH OpenAIError (e.g., API failure):
    LOG error
    RETURN status(500).json({
        error: 'OpenAI API error',
        type: 'openai',
        details: error.message
    })
    
CATCH NetworkError:
    LOG error
    RETURN status(503).json({
        error: 'Service temporarily unavailable',
        type: 'network'
    })
    
CATCH UnknownError:
    LOG error
    RETURN status(500).json({
        error: 'Internal server error',
        type: 'unknown'
    })
END TRY
```

---

## 📊 CONTEXT POLLUTION PREVENTION

### How Modes Stay Separate:

```
Request 1: AUTO_MODE
    ├─ Uses AUTO_MODE_PROMPT
    ├─ System: "You are a lecturer..."
    └─ Response: Teaching-style

Request 2: CHAT_MODE (same session)
    ├─ Uses CHAT_MODE_PROMPT (NEW, independent)
    ├─ System: "You are a learning companion..."
    └─ Response: Conversational-style

Key: Each request is STATELESS
     No conversation history on backend
     Fresh system prompt every time
```

---

## 🧠 PROMPT SELECTION LOGIC

```pseudocode
FUNCTION selectSystemPrompt(mode, hasNotes, hasSlideContext):
    basePrompt = NULL
    
    IF mode == 'AUTO_MODE':
        // Lecturer mode - fixed prompt
        basePrompt = AUTO_MODE_PROMPT
        // ~400 words, teaching-focused
        
    ELSE IF mode == 'CHAT_MODE':
        // Tutor mode - fixed prompt
        basePrompt = CHAT_MODE_PROMPT
        // ~350 words, exploration-focused
    END IF
    
    // ═══════════════════════════════════
    // ADD SOFT CONTEXT (NOT RESTRICTIONS)
    // ═══════════════════════════════════
    
    augmentedPrompt = basePrompt
    
    IF hasNotes:
        notesContext = buildNotesContext(notes)
        augmentedPrompt += notesContext
        // Key phrase: "expand beyond them"
    END IF
    
    IF hasSlideContext AND mode == 'CHAT_MODE':
        slideContext = buildSlideContext(slideText, slideIndex)
        augmentedPrompt += slideContext
        // Key phrase: "just for context"
    END IF
    
    RETURN augmentedPrompt
END FUNCTION
```

---

## ⚡ PERFORMANCE OPTIMIZATION OPPORTUNITIES

### 1. Caching Strategy
```pseudocode
// Cache AUTO_MODE explanations per slide
slideExplanationCache = new Map()

IF mode == 'AUTO_MODE':
    cacheKey = generateHash(imageUrl + slideIndex)
    
    IF slideExplanationCache.has(cacheKey):
        RETURN slideExplanationCache.get(cacheKey)
    END IF
    
    response = await callOpenAI()
    slideExplanationCache.set(cacheKey, response)
    
    RETURN response
END IF
```

### 2. Model Selection Optimization
```pseudocode
// Use GPT-3.5 for simple CHAT_MODE follow-ups
IF mode == 'CHAT_MODE' AND isSimpleQuestion(userQuestion):
    model = "gpt-3.5-turbo"  // Faster, cheaper
ELSE:
    model = "gpt-4-turbo-preview"  // Better reasoning
END IF
```

### 3. Batch Processing (Future)
```pseudocode
// Pre-generate explanations for slide deck
FUNCTION pregenerateSlideExplanations(slides):
    FOR EACH slide IN slides:
        explanation = handleAutoSlideExplanation(slide)
        cache.set(slide.id, explanation)
    END FOR
END FUNCTION
```

---

## 🔍 LOGGING & MONITORING

```pseudocode
FUNCTION handleAIChat(requestData):
    startTime = now()
    
    LOG.info({
        event: 'ai_request_received',
        mode: requestData.mode,
        hasImage: !!requestData.imageUrl,
        hasQuestion: !!requestData.userQuestion
    })
    
    TRY:
        result = processRequest(requestData)
        
        LOG.info({
            event: 'ai_request_success',
            mode: result.mode,
            responseLength: result.response.length,
            duration: now() - startTime
        })
        
        RETURN result
        
    CATCH error:
        LOG.error({
            event: 'ai_request_failed',
            mode: detectedMode,
            error: error.message,
            duration: now() - startTime
        })
        
        THROW error
    END TRY
END FUNCTION
```

---

**END OF PSEUDOCODE DOCUMENTATION**

This provides the complete backend logic flow for the dual-mode AI system.
