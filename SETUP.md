# HeyWeb! Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key

### 1. Environment Setup

Create a `.env` file in the `server` directory:

```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=.......

# Server Configuration
PORT=4000
FRONTEND_ORIGIN=http://localhost:5173
```

### 2. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Start the Application

#### Option A: Use the PowerShell Script (Windows)
```powershell
./start-dev.ps1
```

#### Option B: Manual Start
```bash
# Terminal 1 - Start the server
cd server
npm start

# Terminal 2 - Start the frontend
cd frontend
npm run dev
```

### 4. Access the Application
Open your browser and navigate to: `http://localhost:5173`

## 🎯 Features

### ✅ Fixed Issues
- **All buttons now work properly** with proper event handling
- **Keyboard input support** for all sections
- **No scrolling issues** - responsive design that fits in browser viewport
- **Professional theme** with modern UI/UX

### 🆕 New Features

#### 1. **AI Chat Assistant**
- Voice and text input
- Real-time conversation with OpenAI GPT
- Message history with localStorage
- Text-to-speech responses

#### 2. **Text Summarizer**
- AI-powered text summarization
- Key points extraction
- Copy and download functionality
- Professional interface

#### 3. **Multi-Language Translator**
- Support for 20+ languages
- Auto-language detection
- Language swap functionality
- Copy and download translations

#### 4. **Enhanced UI/UX**
- Professional dark theme
- Smooth animations with Framer Motion
- Responsive design for all screen sizes
- Glass morphism effects
- Tab-based navigation

#### 5. **Voice Integration**
- Speech recognition for voice input
- Text-to-speech for AI responses
- Voice settings customization
- Real-time transcript display

## 🔧 Configuration

### OpenAI API Key
1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add it to the `server/.env` file
3. The application supports GPT-5 by default

### Voice Settings
- Adjust speech rate and pitch in the settings modal
- Choose from available system voices
- Customize voice parameters

### Theme Customization
The application uses a professional dark theme with:
- Slate color palette
- Purple and blue accent colors
- Glass morphism effects
- Smooth animations

## 🛠️ Development

### Project Structure
```
HeyWeb!/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── ChatSection.jsx
│   │   │   ├── SummarizeSection.jsx
│   │   │   ├── TranslateSection.jsx
│   │   │   └── ...
│   │   ├── App.jsx         # Main application
│   │   └── index.css       # Global styles
│   └── package.json
├── server/                  # Express backend
│   ├── index.js            # Main server file
│   └── package.json
└── start-dev.ps1           # Development startup script
```

### API Endpoints
- `POST /api/chat` - AI chat conversation
- `POST /api/summarize` - Text summarization
- `POST /api/translate` - Text translation
- `GET /api/health` - Health check

### Key Technologies
- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express, OpenAI API
- **Voice**: Web Speech API (SpeechRecognition, SpeechSynthesis)
- **Styling**: Tailwind CSS with custom glass morphism

## 🚀 Deployment

### Frontend Deployment
```bash
cd frontend
npm run build
```

### Backend Deployment
```bash
cd server
npm start
```

### Environment Variables for Production
```bash
NODE_ENV=production
FRONTEND_ORIGIN=https://yourdomain.com
OPENAI_API_KEY=your_production_api_key
```

## 🐛 Troubleshooting

### Common Issues

1. **Speech Recognition Not Working**
   - Ensure you're using HTTPS or localhost
   - Check browser permissions for microphone
   - Try refreshing the page

2. **OpenAI API Errors**
   - Verify your API key is correct
   - Check your OpenAI account balance
   - Ensure the API key has proper permissions

3. **Port Conflicts**
   - Change the PORT in server/.env
   - Update the proxy in frontend/vite.config.js

4. **Styling Issues**
   - Clear browser cache
   - Ensure Tailwind CSS is properly installed
   - Check for CSS conflicts

### Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Most features supported
- Safari: Limited voice support
- Mobile: Responsive design supported

## 📝 License
This project is open source and available under the MIT License.

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.
