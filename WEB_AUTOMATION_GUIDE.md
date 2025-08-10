# Web Automation Guide - HeyWeb! Voice Assistant

This guide explains how to use HeyWeb!'s web automation capabilities to control websites through voice commands.

## 🚀 Overview

HeyWeb! now includes powerful web automation features that allow you to interact with any website using natural voice commands. The system uses AI to understand your intent and context, then executes the appropriate actions on the current web page.

## 📦 Components

### 1. Chrome Extension
- **Manifest**: `frontend/public/manifest.json`
- **Background Script**: `frontend/public/background.js`
- **Content Script**: `frontend/public/content.js`
- **Popup**: `frontend/public/popup.html` & `popup.js`

### 2. Web Application
- **Voice Assistant**: Enhanced with web automation commands
- **AI Integration**: Context-aware responses for web interactions
- **Real-time Feedback**: Visual indicators for automation status

## 🎯 Voice Commands

### Navigation Commands
| Command | Action |
|---------|--------|
| "go back" | Navigate to previous page |
| "go forward" | Navigate to next page |
| "refresh page" | Reload current page |
| "reload" | Reload current page |

### Click Commands
| Command | Action |
|---------|--------|
| "click login" | Click element containing "login" |
| "click the submit button" | Click submit button |
| "press sign up" | Click sign up element |
| "tap menu" | Click menu element |

### Form Interaction Commands
| Command | Action |
|---------|--------|
| "type username john" | Fill username field with "john" |
| "enter email user@example.com" | Fill email field |
| "fill password mypassword123" | Fill password field |
| "type in search box hello world" | Fill search field |

### Scroll Commands
| Command | Action |
|---------|--------|
| "scroll down" | Scroll page down |
| "scroll up" | Scroll page up |

### Tab Management
| Command | Action |
|---------|--------|
| "open new tab" | Create new browser tab |
| "close tab" | Close current tab |

## 🔧 Installation & Setup

### 1. Install Chrome Extension

1. **Load Extension in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (top right toggle)
   - Click "Load unpacked"
   - Select the `frontend/public/` folder

2. **Verify Installation**:
   - You should see "HeyWeb! Voice Assistant" in your extensions
   - The extension icon should appear in your toolbar

### 2. Start the Application

```bash
# Start both frontend and backend
.\start-dev.ps1

# Or manually
npm run dev
```

### 3. Enable Web Automation

1. **Open HeyWeb! App**: Navigate to `http://localhost:5173`
2. **Navigate to a Website**: Open any website in a new tab
3. **Check Status**: Look for "Web Automation Active" indicator
4. **Start Speaking**: Use voice commands to control the website

## 🎮 Usage Examples

### Example 1: Login to a Website
```
User: "I want to log in to my account"
HeyWeb!: "I can help you log in. Try saying 'click login' to find the login button, then 'type username your_username' and 'type password your_password'."

User: "click login"
HeyWeb!: "Clicking on login."

User: "type username john_doe"
HeyWeb!: "Typing john_doe in username."

User: "type password mypassword123"
HeyWeb!: "Typing mypassword123 in password."
```

### Example 2: Search and Navigate
```
User: "I want to search for something"
HeyWeb!: "I can help you search. Try saying 'click search' or 'type in search box your query'."

User: "type in search box artificial intelligence"
HeyWeb!: "Typing artificial intelligence in search box."

User: "scroll down"
HeyWeb!: "Scrolling down."
```

### Example 3: Form Filling
```
User: "I need to fill out a contact form"
HeyWeb!: "I can help you fill out forms. Try commands like 'type name John Doe', 'type email john@example.com', and 'type message your message here'."

User: "type name John Doe"
HeyWeb!: "Typing John Doe in name."

User: "type email john@example.com"
HeyWeb!: "Typing john@example.com in email."
```

## 🔍 How It Works

### 1. Voice Recognition
- Your voice commands are converted to text using Web Speech API
- The system analyzes the command for web automation keywords

### 2. Intent Detection
- Commands are parsed to identify:
  - Action type (click, type, scroll, navigate)
  - Target element (button text, field name)
  - Values (text to type, scroll direction)

### 3. Element Selection
The system tries multiple strategies to find elements:
- **Text Content**: Matches button/link text
- **Aria Labels**: Accessibility labels
- **Placeholders**: Input field placeholders
- **Names**: Form field names
- **Values**: Input values

### 4. Action Execution
- **Clicking**: Simulates mouse clicks on elements
- **Typing**: Fills form fields and triggers events
- **Scrolling**: Smooth page scrolling
- **Navigation**: Browser history navigation

## 🛠️ Technical Implementation

### Content Script Injection
```javascript
// Automatically injected into every web page
chrome.scripting.executeScript({
  target: { tabId: activeTab.id },
  files: ['content.js']
});
```

### Element Selection Strategy
```javascript
const selectors = [
  `[aria-label*="${targetText}" i]`,
  `[placeholder*="${targetText}" i]`,
  `button:contains("${targetText}")`,
  `a:contains("${targetText}")`,
  `input[value*="${targetText}" i]`,
  `label:contains("${targetText}")`
];
```

### Event Simulation
```javascript
// Fill form field
element.value = value;
element.dispatchEvent(new Event('input', { bubbles: true }));
element.dispatchEvent(new Event('change', { bubbles: true }));
```

## 🔒 Security & Permissions

### Required Permissions
- **activeTab**: Access to current tab
- **scripting**: Execute scripts in tabs
- **tabs**: Tab management
- **host_permissions**: Access to all URLs

### Security Features
- **Sandboxed Execution**: Content scripts run in isolated context
- **Permission Scoping**: Only accesses active tab
- **Error Handling**: Graceful failure for unsupported actions

## 🐛 Troubleshooting

### Common Issues

**"Web Automation Inactive"**
- Ensure Chrome extension is installed and enabled
- Check that you're on a supported website
- Refresh the page and try again

**"Element not found"**
- Try different wording for the element
- Use more specific commands
- Check if the element is visible on screen

**"Permission denied"**
- Grant microphone permissions to the website
- Allow the Chrome extension to access the page
- Check browser security settings

### Debug Mode
Enable debug logging in the browser console:
```javascript
// In browser console
localStorage.setItem('heyweb_debug', 'true');
```

## 🚀 Advanced Features

### Custom Commands
You can extend the system with custom commands by modifying the `handleWebAutomationCommand` function in `voiceAssistant.jsx`.

### AI Context Awareness
The AI assistant is aware of:
- Current page URL and title
- Available form fields and buttons
- Previous actions taken
- User's browsing context

### Multi-step Workflows
The system can handle complex multi-step interactions:
```
"fill out the registration form with my details"
→ "type first name John"
→ "type last name Doe"
→ "type email john@example.com"
→ "click submit"
```

## 📈 Future Enhancements

### Planned Features
- **Visual Element Highlighting**: Show which elements will be clicked
- **Command History**: Remember and repeat previous commands
- **Custom Macros**: Record and replay sequences of commands
- **Cross-tab Automation**: Control multiple tabs simultaneously
- **Advanced AI Integration**: More sophisticated intent recognition

### API Extensions
- **WebSocket Support**: Real-time communication
- **Plugin System**: Third-party automation plugins
- **Analytics**: Usage tracking and optimization

## 🤝 Contributing

To contribute to web automation features:

1. **Fork the repository**
2. **Create a feature branch**
3. **Implement your changes**
4. **Test thoroughly** on different websites
5. **Submit a pull request**

### Development Guidelines
- **Test on Multiple Sites**: Ensure compatibility across different websites
- **Handle Edge Cases**: Graceful degradation for unsupported actions
- **Performance**: Optimize for speed and reliability
- **Accessibility**: Maintain accessibility standards

---

**HeyWeb! Web Automation** - Making web browsing hands-free and voice-first! 🎤🌐
