require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || '*';
app.use(cors({ origin: FRONTEND_ORIGIN }));

// basic rate-limit
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 120,
  })
);

const fetch = global.fetch || require('node-fetch');
const OPENAI_KEY = process.env.OPENAI_API_KEY || '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';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const API_BASE_URL = process.env.API_BASE_URL || 'https://openrouter.ai/api/v1';



if (!OPENAI_KEY) {
  console.warn('OPENAI_API_KEY not set in env — server will not function without it.');
}

app.get('/api/health', (req, res) => res.json({ ok: true }));

// POST /api/chat - Main workflow endpoint
// body: { messages: [{role:'user'|'assistant'|'system', content: '...'}, ...], context: {activeTab, webAutomationEnabled, currentTime, userAgent} }
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, context } = req.body;
    if (!messages) return res.status(400).json({ error: 'messages required' });

    // Create comprehensive system message for AI
    let systemMessage = {
      role: 'system',
      content: `You are HeyWeb!, a voice-first AI assistant that helps users interact with websites and get information through natural conversation.

Your capabilities include:
1. Web Automation: Click buttons, fill forms, scroll pages, navigate browser
2. Search: Search the web, YouTube, Wikipedia, etc.
3. Information: Answer questions, provide explanations, give recommendations
4. System Actions: Clear history, export conversations, open settings

When users speak naturally, you should:
1. Understand their intent and context
2. Provide a helpful verbal response
3. Return structured actions to execute

Available action types:
- web_automation: { type: "web_automation", command: "click|type|scroll|navigate", target: "element_name", value: "text_to_type", direction: "up|down" }
- search: { type: "search", query: "search_term", engine: "google|bing|youtube|wikipedia" }
- navigation: { type: "navigation", url: "https://example.com", target: "_blank|_self" }
- system: { type: "system", command: "clear_history|export_conversation|open_settings" }

Examples:
User: "Show me the latest news about AI"
Response: "I'll search for the latest AI news for you."
Actions: [{ type: "search", query: "latest artificial intelligence news", engine: "google" }]

User: "Click the login button"
Response: "I'll click the login button for you."
Actions: [{ type: "web_automation", command: "click", target: "login" }]

User: "What's the weather like today?"
Response: "I'll search for current weather information for you."
Actions: [{ type: "search", query: "current weather today", engine: "google" }]

Keep responses conversational and natural. Always provide a verbal response and include relevant actions when needed.`
    };

    // Add context information if available
    if (context) {
      let contextInfo = '';
      if (context.webAutomationEnabled && context.activeTab) {
        contextInfo += `\nCurrent web page: ${context.activeTab.url || 'Unknown'}`;
        contextInfo += `\nWeb automation is active on this page.`;
      }
      if (context.currentTime) {
        contextInfo += `\nCurrent time: ${new Date(context.currentTime).toLocaleString()}`;
      }
      if (contextInfo) {
        systemMessage.content += contextInfo;
      }
    }

    const payload = {
      model: OPENAI_MODEL,
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 1000,
    };

    const r = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await r.json();
    const assistantText = data?.choices?.[0]?.message?.content || 'Sorry, I could not process your request.';

    // Parse the response to extract actions
    const actions = parseActionsFromResponse(assistantText);

    res.json({ 
      assistant: assistantText, 
      actions: actions,
      raw: data 
    });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'server error' });
  }
});

// POST /api/summarize - Text summarization endpoint
app.post('/api/summarize', async (req, res) => {
  try {
    const { text, maxLength = 300, includeKeyPoints = true } = req.body;
    if (!text) return res.status(400).json({ error: 'text required' });

    const systemMessage = {
      role: 'system',
      content: `You are an expert text summarizer. Your task is to create concise, accurate summaries of the provided text.

Requirements:
1. Create a clear, coherent summary that captures the main ideas
2. Keep the summary within ${maxLength} words
3. Maintain the original meaning and tone
4. ${includeKeyPoints ? 'Extract 3-5 key points that highlight the most important information' : ''}

Format your response as JSON:
{
  "summary": "Your summary text here",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"]
}`
    };

    const payload = {
      model: OPENAI_MODEL,
      messages: [
        systemMessage,
        { role: 'user', content: `Please summarize this text:\n\n${text}` }
      ],
      temperature: 0.3,
      max_tokens: 800,
    };

    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || '';

    // Try to parse JSON response
    try {
      const parsed = JSON.parse(content);
      res.json({
        summary: parsed.summary || 'Summary could not be generated.',
        keyPoints: parsed.keyPoints || []
      });
    } catch (parseError) {
      // Fallback: treat the entire response as summary
      res.json({
        summary: content,
        keyPoints: []
      });
    }
  } catch (err) {
    console.error('Summarization error:', err);
    res.status(500).json({ error: 'summarization error' });
  }
});

// POST /api/translate - Text translation endpoint
app.post('/api/translate', async (req, res) => {
  try {
    const { text, sourceLanguage, targetLanguage } = req.body;
    if (!text || !targetLanguage) return res.status(400).json({ error: 'text and targetLanguage required' });

    const systemMessage = {
      role: 'system',
      content: `You are an expert translator. Translate the provided text to ${targetLanguage}.

Requirements:
1. Provide accurate, natural translation
2. Maintain the original meaning and tone
3. Preserve formatting and structure
4. If the source language is not specified, detect it automatically
5. Return only the translated text, no explanations or additional content

${sourceLanguage ? `Source language: ${sourceLanguage}` : 'Auto-detect source language'}
Target language: ${targetLanguage}`
    };

    const payload = {
      model: OPENAI_MODEL,
      messages: [
        systemMessage,
        { role: 'user', content: `Translate this text:\n\n${text}` }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    };

    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    const translatedText = data?.choices?.[0]?.message?.content || 'Translation could not be generated.';

    res.json({
      translatedText: translatedText.trim(),
      sourceLanguage: sourceLanguage || 'auto-detected',
      targetLanguage: targetLanguage
    });
  } catch (err) {
    console.error('Translation error:', err);
    res.status(500).json({ error: 'translation error' });
  }
});

// Parse actions from AI response
function parseActionsFromResponse(response) {
  const actions = [];
  
  // Look for action patterns in the response
  const actionPatterns = [
    // Web automation patterns
    { 
      regex: /click\s+(?:the\s+)?([a-zA-Z0-9\s]+)/gi, 
      type: 'web_automation', 
      command: 'click',
      extract: (match) => ({ target: match[1].trim() })
    },
    { 
      regex: /type\s+(?:in\s+)?([a-zA-Z0-9\s]+)\s+(?:as\s+)?([a-zA-Z0-9\s@.]+)/gi, 
      type: 'web_automation', 
      command: 'type',
      extract: (match) => ({ target: match[1].trim(), value: match[2].trim() })
    },
    { 
      regex: /scroll\s+(up|down)/gi, 
      type: 'web_automation', 
      command: 'scroll',
      extract: (match) => ({ direction: match[1] })
    },
    { 
      regex: /(?:go\s+)?(back|forward|refresh)/gi, 
      type: 'web_automation', 
      command: 'navigate',
      extract: (match) => ({ target: match[1] })
    },
    
    // Search patterns
    { 
      regex: /search\s+(?:for\s+)?([a-zA-Z0-9\s]+)/gi, 
      type: 'search',
      extract: (match) => ({ query: match[1].trim() })
    },
    { 
      regex: /(?:search|find)\s+(?:on\s+)?(google|bing|youtube|wikipedia)\s+(?:for\s+)?([a-zA-Z0-9\s]+)/gi, 
      type: 'search',
      extract: (match) => ({ engine: match[1], query: match[2].trim() })
    },
    
    // Navigation patterns
    { 
      regex: /open\s+(?:the\s+)?(?:website\s+)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi, 
      type: 'navigation',
      extract: (match) => ({ url: `https://${match[1]}` })
    },
    
    // System patterns
    { 
      regex: /clear\s+(?:the\s+)?(?:conversation\s+)?history/gi, 
      type: 'system',
      extract: () => ({ command: 'clear_history' })
    }
  ];

  for (const pattern of actionPatterns) {
    const matches = [...response.matchAll(pattern.regex)];
    for (const match of matches) {
      const action = {
        type: pattern.type,
        ...pattern.extract(match)
      };
      
      if (pattern.command) {
        action.command = pattern.command;
      }
      
      actions.push(action);
    }
  }

  return actions;
}

// POST /api/web-automation - Execute web automation commands
app.post('/api/web-automation', async (req, res) => {
  try {
    const { action, target, field, value, direction } = req.body;
    
    // This endpoint would typically communicate with the Chrome extension
    // For now, we'll return a success response
    res.json({ 
      success: true, 
      action: action,
      message: `Web automation command executed: ${action}` 
    });
  } catch (err) {
    console.error('Web automation error:', err);
    res.status(500).json({ error: 'web automation error' });
  }
});

// Optional: receive audio file for server-side transcription or storage
app.post('/api/transcribe', async (req, res) => {
  // Implementation depends on whether you want to use OpenAI audio transcriptions
  // Keep this endpoint as multipart/form-data and call OpenAI's audio.transcriptions
  res.status(501).json({ error: 'Not implemented in this template — see README for options' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));