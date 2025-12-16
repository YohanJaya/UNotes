const OpenAI = require('openai');
require('dotenv').config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ============================================================================
// MODE DEFINITIONS
// ============================================================================
const AI_MODES = {
  AUTO_MODE: 'AUTO_MODE',    // Automatic slide explanation (no user prompt)
  CHAT_MODE: 'CHAT_MODE'     // Manual Q&A (user-driven interaction)
};

// ============================================================================
// PROMPT TEMPLATES - PRODUCTION READY
// ============================================================================

/**
 * AUTO_MODE: Automatic Slide Explanation Prompt
 * 
 * Purpose: Help an undergraduate student understand lecture slides in real-time
 * Context: Student is actively attending lecture, needs quick, clear understanding
 * Behavior: 
 *   - Explain like a helpful study buddy who gets it
 *   - Make complex stuff simple and relatable
 *   - Connect to real-world and practical uses
 *   - Never ask questions - just explain clearly
 */
const AUTO_MODE_PROMPT = `You are a brilliant study companion helping an undergraduate student learn during a live lecture.

**THE SITUATION:**
The student is sitting in class RIGHT NOW, and a new slide just appeared on the projector. They need to understand this slide quickly and clearly so they can:
- Follow along with the lecture
- Take good notes
- Connect it to what they already know
- Remember it for exams

**YOUR JOB:**
Explain this slide like you're a super-smart friend sitting next to them in class, helping them "get it" in real-time.

**HOW TO EXPLAIN:**

1. **Start Simple, Then Go Deeper**
   - First sentence: What IS this? (one-line summary)
   - Then break it down step by step
   - Build up from basics to the full picture

2. **Make It Click**
   - Use everyday examples and analogies
   - Connect to things students already know
   - Explain the "WHY" behind the concept, not just "WHAT"
   - Make abstract concepts concrete

3. **Be Practical**
   - Where will they see this in real life?
   - How does this connect to other courses?
   - Why would a professor test them on this?
   - What's the main takeaway for exams/assignments?

4. **Speak Student-to-Student**
   - Use clear, friendly language (not overly academic)
   - Break down jargon when you use it
   - "Think of it like..." and "Basically..." are your friends
   - If it's tricky, say so! ("This part can be confusing, but here's how to think about it...")

5. **Structure for Quick Understanding**
   - 🎯 **Main Idea:** [One sentence - what's this about?]
   - 📖 **The Breakdown:** [Step-by-step explanation with examples]
   - 💡 **Why It Matters:** [Real-world context, applications]
   - ✅ **Remember This:** [Key points for notes/exams]

**IMPORTANT:**
- Don't just read what's on the slide - EXPLAIN it
- Don't ask questions back - they're in class and need answers NOW
- Don't be too wordy - they need to follow the lecture
- Don't assume they know technical terms - explain them
- DO make connections to previous topics when relevant
- DO use examples from everyday life
- DO highlight what's exam-important

**TONE:**
Helpful, clear, encouraging, like a knowledgeable classmate who wants to help you succeed.

Start with "🎯" and jump right into your explanation. The student is waiting!`;

/**
 * CHAT_MODE: Manual Learning & Exploration Prompt
 * 
 * Purpose: Answer student questions and help them explore deeper
 * Context: Student wants to understand something better or explore beyond the slides
 * Behavior:
 *   - Conversational and helpful like a study partner
 *   - Not limited to slides/notes - teach anything
 *   - Encourage curiosity and deeper learning
 */
const CHAT_MODE_PROMPT = `You are a super helpful study buddy and tutor for an undergraduate student.

**THE SITUATION:**
The student is learning from lectures and has a question. They might be:
- Confused about something from the slide
- Curious about a topic and want to learn more
- Preparing for an exam and need clarification
- Connecting dots between different concepts
- Wondering how something works in real life

**YOUR JOB:**
Answer their question clearly and help them understand deeply. Be the study partner every student wishes they had.

**HOW TO HELP:**

1. **Actually Answer Their Question**
   - Get straight to answering what they asked
   - Be direct and clear
   - If the question is vague, give the most useful interpretation

2. **Explain in Student-Friendly Language**
   - No unnecessary jargon
   - Use examples and analogies
   - Break complex ideas into simple steps
   - "Think of it like..." works wonders

3. **Go Beyond If It Helps**
   - Their slides/notes are just starting points
   - If they ask about something not in their materials, TEACH IT ANYWAY
   - Make connections they might not see
   - Add context that makes it click

4. **Be Encouraging**
   - Good questions deserve recognition
   - If it's tricky, acknowledge that ("Yeah, this confuses a lot of students...")
   - Help them feel confident about learning

5. **Make It Practical**
   - How does this apply to real life?
   - Why would their professor care about this?
   - What's useful for exams/projects?
   - Connect to other courses if relevant

**YOU CAN:**
- Explain concepts not covered in their slides
- Give multiple perspectives or approaches
- Suggest related topics worth exploring
- Provide practice examples or scenarios
- Help with problem-solving strategies
- Compare and contrast different concepts
- Answer "what if" questions
- Clear up common misconceptions

**YOU SHOULD NOT:**
- Limit yourself to only what's in their notes (that's boring and not helpful!)
- Be overly formal or academic (be relatable!)
- Give one-word answers (they want to LEARN)
- Assume they know advanced terminology

**CONTEXT USAGE:**
If you see their notes or current slide content, use it as helpful background, but DON'T be restricted by it. If they ask something beyond their materials, that shows curiosity - help them explore!

**TONE:**
Friendly, knowledgeable, patient, encouraging. Like that one classmate who always explains things perfectly.

Answer naturally and conversationally. Make learning feel easy and enjoyable!`;

// ============================================================================
// CONTEXT BUILDERS (Soft Guidance, Not Restriction)
// ============================================================================

/**
 * Build context string from user notes (treated as reference material)
 * @param {Array} notes - User's notes array
 * @returns {string} Formatted notes context
 */
const buildNotesContext = (notes) => {
  if (!notes || notes.length === 0) {
    return '';
  }

  let context = '\n\n📚 **REFERENCE MATERIALS (Student\'s Notes):**\n';
  context += 'The student has taken these notes. Use them as context but feel free to expand beyond them.\n\n';
  
  notes.forEach((note, index) => {
    context += `Note ${index + 1}: ${note.title}\n`;
    if (note.content && Array.isArray(note.content)) {
      context += `${note.content.join(' ')}\n`;
    }
    if (note.tags && note.tags.length > 0) {
      context += `Topics: ${note.tags.join(', ')}\n`;
    }
    context += '\n';
  });

  return context;
};

/**
 * Build slide context for AUTO_MODE
 * @param {string} slideText - Extracted text from slide (if available)
 * @param {number} slideIndex - Current slide number
 * @returns {string} Formatted slide context
 */
const buildSlideContext = (slideText, slideIndex) => {
  let context = '\n\n📊 **SLIDE INFORMATION:**\n';
  context += `Slide Number: ${slideIndex || 'Current'}\n`;
  
  if (slideText) {
    context += `Slide Content:\n${slideText}\n`;
  }
  
  return context;
};

// ============================================================================
// AUTO_MODE HANDLER - Automatic Slide Explanation
// ============================================================================

/**
 * Handle automatic slide explanation (triggered by slide navigation)
 * NO USER PROMPT REQUIRED - Fully automatic
 * 
 * @param {string} imageUrl - URL of the slide image (required in AUTO_MODE)
 * @param {string} slideText - Extracted text from slide (optional)
 * @param {number} slideIndex - Current slide number
 * @param {Array} notes - User's notes (soft context)
 * @returns {Promise<string>} Detailed teaching explanation
 */
const handleAutoSlideExplanation = async ({ imageUrl, slideText, slideIndex, notes }) => {
  if (!imageUrl) {
    throw new Error('AUTO_MODE requires slide image URL');
  }

  // Build system prompt for lecturer mode
  let systemPrompt = AUTO_MODE_PROMPT;
  
  // Add soft context (notes as reference, not restriction)
  if (notes && notes.length > 0) {
    systemPrompt += buildNotesContext(notes);
  }

  // Build slide context
  const slideContext = buildSlideContext(slideText, slideIndex);
  
  // AUTO_MODE instruction: No user question needed
  const autoInstruction = `${slideContext}\n\n**TASK:** Explain this slide in detail as if teaching it in a live lecture. The student has just navigated to this slide and needs to understand it thoroughly. Provide a comprehensive explanation that goes beyond what's visible on the slide.`;

  // Construct messages for GPT-4 Vision
  const messages = [
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
            detail: "high"  // High detail for better text recognition
          }
        }
      ]
    }
  ];

  // Call GPT-4 Vision (best for slide image understanding)
  const completion = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: messages,
    max_tokens: 1500,        // Increased for detailed teaching
    temperature: 0.7,        // Balanced creativity and accuracy
  });

  return completion.choices[0].message.content;
};

// ============================================================================
// CHAT_MODE HANDLER - Manual Learning & Exploration
// ============================================================================

/**
 * Handle manual user questions (ChatGPT-style interaction)
 * User-driven, open-ended, generative
 * 
 * @param {string} userQuestion - User's question (required in CHAT_MODE)
 * @param {Array} notes - User's notes (soft context, not restriction)
 * @param {string} slideText - Current slide text (optional context)
 * @param {number} slideIndex - Current slide number (optional context)
 * @param {string} imageUrl - Current slide image (optional visual context)
 * @returns {Promise<string>} AI response
 */
const handleManualChat = async ({ userQuestion, notes, slideText, slideIndex, imageUrl, highlightedText, slideName }) => {
  if (!userQuestion || userQuestion.trim() === '') {
    throw new Error('CHAT_MODE requires a user question');
  }

  // Build system prompt for open-ended learning
  let systemPrompt = CHAT_MODE_PROMPT;
  
  // Add soft context (reference material, not boundary)
  if (notes && notes.length > 0) {
    systemPrompt += buildNotesContext(notes);
  }
  
  if (slideText || slideIndex) {
    systemPrompt += '\n\n📊 **CURRENT CONTEXT:**\n';
    systemPrompt += `The student is currently viewing ${slideIndex ? `Slide ${slideIndex}` : 'a lecture slide'}.\n`;
    if (slideText) {
      systemPrompt += `Slide content: ${slideText}\n`;
    }
    systemPrompt += 'This is just for context - feel free to answer beyond this material if needed.\n';
  }

  // If the frontend provided a highlighted excerpt, add it as the focused context
  if (highlightedText) {
    systemPrompt += '\n\n🔎 **HIGHLIGHTED EXCERPT (focus):**\n';
    systemPrompt += `${highlightedText}\n`;
    systemPrompt += 'Please focus your explanation on this excerpt and clarify any terms, implications, or steps needed to fully understand it.\n';
  }

  // If slideName provided, include it for a clearer reference
  if (slideName) {
    systemPrompt += `\n\nSlide Title: ${slideName}\n`;
  }

  // Choose model based on whether visual context is needed
  let messages, completion;

  if (imageUrl) {
    // Use GPT-4 Vision if slide image is relevant to question
    messages = [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          { type: "text", text: userQuestion },
          {
            type: "image_url",
            image_url: {
              url: imageUrl,
              detail: "high"
            }
          }
        ]
      }
    ];

    completion = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: messages,
      max_tokens: 1200,
      temperature: 0.8,  // Higher creativity for exploratory learning
    });

  } else {
    // Use GPT-4 or GPT-3.5-turbo for text-only interaction
    messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userQuestion }
    ];

    completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",  // Best for complex reasoning
      messages: messages,
      max_tokens: 1200,
      temperature: 0.8,
    });
  }

  return completion.choices[0].message.content;
};

// ============================================================================
// MAIN ROUTER - Mode Detection & Dispatch
// ============================================================================

/**
 * Main AI handler - Routes to AUTO_MODE or CHAT_MODE based on request
 * 
 * Request Structure:
 * {
 *   mode: 'AUTO_MODE' | 'CHAT_MODE',  // Explicit mode (recommended)
 *   
 *   // For AUTO_MODE:
 *   imageUrl: string (required),
 *   slideText: string (optional),
 *   slideIndex: number (optional),
 *   
 *   // For CHAT_MODE:
 *   userQuestion: string (required),
 *   imageUrl: string (optional - if asking about current slide),
 *   
 *   // Shared (soft context):
 *   notes: Array (optional)
 * }
 * 
 * @param {Object} requestData - Request payload
 * @returns {Promise<Object>} { response: string, mode: string }
 */
const handleAIChat = async (requestData) => {
  const {
    mode,
    userQuestion,
    imageUrl,
    slideText,
    slideIndex,
    notes,
    // Legacy support (deprecated)
    question,
    isSlideAnalysis
  } = requestData;
  // New/optional: highlighted excerpt sent from frontend (upload/select)
  const highlightedText = requestData.highlightedText || requestData.excerpt || null;
  // Optional slide title/name
  const slideName = requestData.slideName || null;

  // Determine mode (explicit or inferred)
  let detectedMode;

  if (mode) {
    // Explicit mode provided (best practice)
    detectedMode = mode;
  } else if (isSlideAnalysis || (!userQuestion && !question && imageUrl)) {
    // Legacy: isSlideAnalysis flag OR auto-triggered (no question but has image)
    detectedMode = AI_MODES.AUTO_MODE;
  } else if (userQuestion || question) {
    // User typed a question
    detectedMode = AI_MODES.CHAT_MODE;
  } else {
    throw new Error('Cannot determine AI mode. Provide either mode, userQuestion, or imageUrl.');
  }

  let aiResponse;

  // Route to appropriate handler
  if (detectedMode === AI_MODES.AUTO_MODE) {
    // Automatic slide explanation - no user prompt needed
    aiResponse = await handleAutoSlideExplanation({
      imageUrl,
      slideText,
      slideIndex,
      notes
    });

  } else if (detectedMode === AI_MODES.CHAT_MODE) {
    // Manual chat - user-driven exploration
    const finalQuestion = userQuestion || question;  // Support legacy 'question' field
    
    aiResponse = await handleManualChat({
      userQuestion: finalQuestion,
      notes,
      slideText,
      slideIndex,
      slideName,
      highlightedText,
      imageUrl  // Optional: user might ask about visible slide
    });

  } else {
    throw new Error(`Invalid mode: ${detectedMode}`);
  }

  return {
    response: aiResponse,
    mode: detectedMode,
    timestamp: new Date().toISOString()
  };
};

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Main handler
  handleAIChat,
  
  // Mode constants
  AI_MODES,
  
  // Individual handlers (for advanced usage)
  handleAutoSlideExplanation,
  handleManualChat,
  
  // Utility functions
  buildNotesContext,
  buildSlideContext,
  
  // Prompt templates (for reference/testing)
  AUTO_MODE_PROMPT,
  CHAT_MODE_PROMPT
};


