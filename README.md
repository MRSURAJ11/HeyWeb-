# HeyWeb! - Voice-First AI Assistant

A modern, voice-first AI assistant web application that allows you to interact with AI through natural speech. Built with React, Node.js, and powered by OpenAI's GPT models.

## ✨ Features

- **Voice Recognition**: Real-time speech-to-text using Web Speech API
- **AI Chat**: Powered by OpenAI GPT models for intelligent conversations
- **Text-to-Speech**: Natural voice responses with customizable settings
- **Web Automation**: Control websites through voice commands
- **Chrome Extension**: Seamless integration with browser automation
- **Audio Recording**: Record and save conversations
- **Modern UI**: Beautiful glass-morphism design with Tailwind CSS
- **Real-time Waveform**: Visual audio feedback during recording
- **Voice Commands**: Quick commands like "clear history", "search for...", "repeat last"
- **Settings Modal**: Customize voice rate, pitch, and voice selection
- **Export Conversations**: Download chat history as JSON

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd HeyWeb!
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the server directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=.......
   PORT=4000
   NODE_ENV=development
   FRONTEND_ORIGIN=http://localhost:5173
   ```

4. **Install Chrome Extension** (for web automation)
   
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (top right toggle)
   - Click "Load unpacked"
   - Select the `frontend/public/` folder

5. **Start the development server**
   ```bash
   # On Windows (PowerShell)
   .\start-dev.ps1
   
   # Or manually
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
HeyWeb!/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── ChatBubble.jsx
│   │   │   ├── SettingsModal.jsx
│   │   │   ├── voiceAssistant.jsx
│   │   │   └── waveform.jsx
│   │   ├── utils/           # Utility functions
│   │   │   ├── audioUtils.js
│   │   │   └── openai.js
│   │   ├── App.jsx          # Main app component
│   │   ├── main.jsx         # React entry point
│   │   └── index.css        # Global styles
│   ├── public/              # Static assets
│   └── package.json         # Frontend dependencies
├── server/                  # Node.js backend
│   ├── index.js            # Express server
│   └── package.json        # Backend dependencies
├── start-dev.ps1           # Development startup script
└── package.json            # Root package.json
```

## 🎯 Usage

### Voice-First Workflow

1. **Speak naturally** - Say "HeyWeb" and speak your request
2. **AI processes** - Your voice is converted to text and sent to AI
3. **Actions executed** - AI understands intent and performs actions
4. **Response spoken** - AI speaks back the answer and shows results

### Example Conversations

**User**: "HeyWeb, show me the latest news about AI"
**HeyWeb**: "I'll search for the latest AI news for you." *[Opens Google search]*

**User**: "HeyWeb, click the login button"
**HeyWeb**: "I'll click the login button for you." *[Clicks login button]*

**User**: "HeyWeb, what's the weather like today?"
**HeyWeb**: "I'll search for current weather information for you." *[Opens weather search]*

### Voice Commands

#### Basic Commands
- **"Clear history"** - Clear the conversation
- **"Search for [query]"** - Open Google search in new tab
- **"Repeat last"** - Have the AI repeat its last response

#### Natural Language Examples
- **"Show me the latest news about AI"** - Searches for AI news
- **"Click the login button"** - Clicks login button on current page
- **"What's the weather like today?"** - Searches for weather information
- **"Search for React tutorials on YouTube"** - Searches YouTube for React tutorials
- **"Open Wikipedia and search for quantum physics"** - Opens Wikipedia search
- **"Type my email in the username field"** - Fills username field with email
- **"Scroll down to see more content"** - Scrolls the page down
- **"Go back to the previous page"** - Navigates back in browser history

### Settings

Click the settings icon to customize:
- **Voice selection** - Choose from available TTS voices
- **Speech rate** - Adjust how fast the AI speaks
- **Pitch** - Modify the voice pitch

### Recording

- Use the microphone button to record audio
- Download conversations as JSON files
- Visual waveform shows audio activity

### AI-Powered Actions

- **Natural Language Understanding**: Speak naturally, AI understands intent
- **Web Automation**: Click buttons, fill forms, scroll pages automatically
- **Smart Search**: Search web, YouTube, Wikipedia with voice commands
- **Context Awareness**: AI remembers conversation and current page
- **Real-time Feedback**: Visual indicators and spoken responses

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | Required |
| `OPENAI_MODEL` | GPT model to use | `.......` |
| `PORT` | Backend server port | `4000` |
| `FRONTEND_ORIGIN` | Frontend URL for CORS | `http://localhost:5173` |

### Available Scripts

```bash
# Install all dependencies
npm run install-all

# Start development servers
npm run dev

# Start production servers
npm start

# Start only backend
npm run server

# Start only frontend
npm run frontend
```

## 🛠️ Development

### Frontend (React + Vite)

- **Framework**: React 18 with hooks
- **Styling**: Tailwind CSS with custom glass-morphism design
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **HTTP Client**: Axios

### Backend (Node.js + Express)

- **Framework**: Express.js
- **Security**: Helmet, CORS, Rate limiting
- **AI Integration**: OpenAI API
- **Environment**: dotenv for configuration

### Chrome Extension

- **Manifest V3**: Modern extension architecture
- **Content Scripts**: Web page automation
- **Background Service Worker**: Extension lifecycle management
- **Popup Interface**: Quick access to features

## 🔒 Security Features

- Rate limiting (120 requests per 15 minutes)
- CORS protection
- Helmet security headers
- Input validation and sanitization

## 🌐 Browser Compatibility

- **Speech Recognition**: Chrome, Edge, Safari (iOS 14.5+)
- **Speech Synthesis**: All modern browsers
- **MediaRecorder**: Chrome, Firefox, Safari 14.1+

## 📝 API Endpoints

### POST `/api/chat`
Send messages to OpenAI and get AI responses.

**Request:**
```json
{
  "messages": [
    {"role": "user", "content": "Hello, how are you?"}
  ],
  "context": {
    "activeTab": { "url": "https://example.com" },
    "webAutomationEnabled": true
  }
}
```

**Response:**
```json
{
  "assistant": "Hello! I'm doing well, thank you for asking. How can I help you today?",
  "raw": { /* OpenAI response object */ }
}
```

### POST `/api/web-automation`
Execute web automation commands.

**Request:**
```json
{
  "action": "click",
  "target": "login button"
}
```

**Response:**
```json
{
  "success": true,
  "action": "click",
  "message": "Web automation command executed: click"
}
```

### GET `/api/health`
Health check endpoint.

**Response:**
```json
{
  "ok": true
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- OpenAI for providing the GPT API
- Web Speech API for voice recognition and synthesis
- React and Vite communities
- Tailwind CSS for the beautiful styling framework

## 🆘 Troubleshooting

### Common Issues

**"SpeechRecognition not supported"**
- Use Chrome, Edge, or Safari
- Ensure microphone permissions are granted

**"OPENAI_API_KEY not set"**
- Check your `.env` file in the server directory
- Verify the API key is valid

**"CORS errors"**
- Ensure both frontend and backend are running
- Check the `FRONTEND_ORIGIN` environment variable

**"Port already in use"**
- Change the port in the environment variables
- Kill processes using the ports

**"Web Automation Inactive"**
- Ensure Chrome extension is installed and enabled
- Check that you're on a supported website
- Refresh the page and try again

**"Element not found"**
- Try different wording for the element
- Use more specific commands
- Check if the element is visible on screen

### Getting Help

If you encounter issues:
1. Check the browser console for errors
2. Verify all dependencies are installed
3. Ensure environment variables are set correctly
4. Check that both servers are running

## 📚 Additional Resources

- **[Workflow Documentation](./WORKFLOW.md)** - Complete voice-first workflow explanation
- **[Web Automation Guide](./WEB_AUTOMATION_GUIDE.md)** - Detailed guide for web automation features
---

**HeyWeb!** - Making AI conversations feel natural and effortless. 🎤✨
