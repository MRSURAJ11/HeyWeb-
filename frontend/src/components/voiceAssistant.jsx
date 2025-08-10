import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Mic, StopCircle, Download, Settings, Globe, ExternalLink, Send, Sparkles, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatBubble from './ChatBubble';
import SettingsModal from './SettingsModal';
import Waveform from './waveform.jsx';

export default function VoiceAssistant() {
  const [listening, setListening] = useState(false);
  const [isProcessing, setProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState(() => {
    try { return JSON.parse(localStorage.getItem('heyweb_messages') || '[]'); }
    catch { return []; }
  });

  const [recording, setRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState({ rate: 1, pitch: 1, voice: null });
  const [voices, setVoices] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [webAutomationEnabled, setWebAutomationEnabled] = useState(false);
  const [speechRecognitionAvailable, setSpeechRecognitionAvailable] = useState(true);

  const recognitionRef = useRef(null);
  const recorderRef = useRef(null);
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize Speech Recognition and voices
  useEffect(() => {
    // Check for speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('SpeechRecognition not supported in this browser. Please use Chrome, Edge, or Safari.');
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari for voice commands.');
      setSpeechRecognitionAvailable(false);
      return;
    }

    try {
      const r = new SpeechRecognition();
      r.lang = 'en-US';
      r.interimResults = true;
      r.continuous = false;
      r.maxAlternatives = 1;

      r.onstart = () => {
        console.log('Speech recognition started');
        setListening(true);
      };

      r.onresult = (e) => {
        const interim = Array.from(e.results)
          .map(res => res[0].transcript)
          .join('');
        setTranscript(interim);

        if (e.results[0].isFinal) {
          handleUserCommand(interim.trim());
        }
      };

      r.onerror = (ev) => {
        console.error('Speech error:', ev.error);
        setListening(false);
        
        // Handle specific error types
        switch (ev.error) {
          case 'not-allowed':
            alert('Microphone access denied. Please allow microphone access and try again.');
            break;
          case 'no-speech':
            console.log('No speech detected');
            break;
          case 'audio-capture':
            alert('Audio capture error. Please check your microphone and try again.');
            break;
          case 'network':
            alert('Network error. Please check your internet connection.');
            break;
          default:
            console.error('Speech recognition error:', ev.error);
        }
      };

      r.onend = () => {
        console.log('Speech recognition ended');
        setListening(false);
      };

      recognitionRef.current = r;
    } catch (error) {
      console.error('Failed to initialize speech recognition:', error);
      alert('Failed to initialize speech recognition. Please refresh the page and try again.');
    }

    // Load TTS voices
    const loadVoices = () => {
      try {
        const v = window.speechSynthesis.getVoices();
        setVoices(v);
        if (v.length && !voiceSettings.voice) {
          setVoiceSettings(s => ({ ...s, voice: v[0].name }));
        }
      } catch (error) {
        console.error('Failed to load voices:', error);
      }
    };
    
    // Load voices immediately if available
    loadVoices();
    
    // Set up voice change listener
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Get current active tab for web automation context
    if (chrome && chrome.tabs) {
      try {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            setActiveTab(tabs[0]);
            setWebAutomationEnabled(true);
          }
        });
      } catch (error) {
        console.error('Failed to get active tab:', error);
      }
    }

    // Cleanup
    return () => {
      try { 
        if (recognitionRef.current) {
          recognitionRef.current.onresult = null; 
          recognitionRef.current.onerror = null;
          recognitionRef.current.onstart = null;
          recognitionRef.current.onend = null;
        }
      } catch {}
      
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem('heyweb_messages', JSON.stringify(messages));
  }, [messages]);

  // Start/stop speech recognition
  const startListening = async () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not available. Please refresh the page and try again.');
      return;
    }
    
    setTranscript('');
    try {
      // Check if already listening
      if (listening) {
        stopListening();
        return;
      }
      
      recognitionRef.current.start();
      console.log('Starting speech recognition...');
    } catch (e) { 
      console.error('Failed to start speech recognition:', e);
      setListening(false);
      
      if (e.name === 'InvalidStateError') {
        alert('Speech recognition is already active. Please wait a moment and try again.');
      } else if (e.name === 'NotAllowedError') {
        alert('Microphone access denied. Please allow microphone access in your browser settings.');
      } else {
        alert('Failed to start voice recognition. Please try again.');
      }
    }
  };

  const stopListening = () => {
    try { 
      if (recognitionRef.current && listening) {
        recognitionRef.current.stop();
        console.log('Stopping speech recognition...');
      }
    } catch (e) { 
      console.error('Error stopping speech recognition:', e);
    } finally {
      setListening(false);
    }
  };

  // Main workflow: User speaks → Text → AI Backend → Action/Answer → Spoken & Displayed Back
  async function handleUserCommand(userText) {
    setTranscript('');
    setListening(false);
    if (!userText) return;

    // Add user message to chat
    const userMessage = { role: 'user', content: userText };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setProcessing(true);

    try {
      // Send to AI Backend with context
      const payload = {
        messages: updatedMessages.slice(-10), // Keep last 10 messages for context
        context: {
          activeTab: activeTab,
          webAutomationEnabled: webAutomationEnabled,
          currentTime: new Date().toISOString(),
          userAgent: navigator.userAgent
        }
      };

      const response = await axios.post('/api/chat', payload);
      const aiResponse = response.data?.assistant || 'Sorry, I could not process your request.';
      
      // Add AI response to chat
      const aiMessage = { role: 'assistant', content: aiResponse };
      setMessages(prev => [...prev, aiMessage]);

      // Execute any actions returned by AI
      if (response.data?.actions) {
        await executeActions(response.data.actions);
      }

      // Speak the response back to user
      speakText(aiResponse);

    } catch (err) {
      console.error('AI processing error:', err);
      const errorMessage = { 
        role: 'assistant', 
        content: 'I encountered an error processing your request. Please try again.' 
      };
      setMessages(prev => [...prev, errorMessage]);
      speakText('I encountered an error. Please try again.');
    } finally {
      setProcessing(false);
    }
  }

  // Execute actions returned by AI
  async function executeActions(actions) {
    if (!actions || !Array.isArray(actions)) return;

    for (const action of actions) {
      try {
        switch (action.type) {
          case 'web_automation':
            await executeWebAutomation(action);
            break;
          case 'search':
            await executeSearch(action);
            break;
          case 'navigation':
            await executeNavigation(action);
            break;
          case 'system':
            await executeSystemAction(action);
            break;
          default:
            console.log('Unknown action type:', action.type);
        }
      } catch (error) {
        console.error('Action execution error:', error);
      }
    }
  }

  // Execute web automation actions
  async function executeWebAutomation(action) {
    if (!webAutomationEnabled || !activeTab) return;

    const { command, target, value, direction } = action;

    switch (command) {
      case 'click':
        if (chrome && chrome.tabs && chrome.scripting) {
          chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            func: (targetText) => {
              // Enhanced element finding
              const selectors = [
                `[aria-label*="${targetText}" i]`,
                `[placeholder*="${targetText}" i]`,
                `button:contains("${targetText}")`,
                `a:contains("${targetText}")`,
                `input[value*="${targetText}" i]`,
                `label:contains("${targetText}")`,
                `*:contains("${targetText}")`
              ];

              for (const selector of selectors) {
                try {
                  const elements = document.querySelectorAll(selector);
                  for (const element of elements) {
                    if (element.textContent.toLowerCase().includes(targetText.toLowerCase()) ||
                        element.getAttribute('aria-label')?.toLowerCase().includes(targetText.toLowerCase()) ||
                        element.getAttribute('placeholder')?.toLowerCase().includes(targetText.toLowerCase())) {
                      element.click();
                      return true;
                    }
                  }
                } catch (e) {
                  console.warn('Selector failed:', selector, e);
                }
              }
              return false;
            },
            args: [target]
          });
        }
        break;

      case 'type':
        if (chrome && chrome.tabs && chrome.scripting) {
          chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            func: (fieldName, fieldValue) => {
              const selectors = [
                `input[name*="${fieldName}" i]`,
                `input[placeholder*="${fieldName}" i]`,
                `input[aria-label*="${fieldName}" i]`,
                `textarea[name*="${fieldName}" i]`,
                `textarea[placeholder*="${fieldName}" i]`,
                `textarea[aria-label*="${fieldName}" i]`
              ];

              for (const selector of selectors) {
                const element = document.querySelector(selector);
                if (element) {
                  element.value = fieldValue;
                  element.dispatchEvent(new Event('input', { bubbles: true }));
                  element.dispatchEvent(new Event('change', { bubbles: true }));
                  return true;
                }
              }
              return false;
            },
            args: [target, value]
          });
        }
        break;

      case 'scroll':
        if (chrome && chrome.tabs && chrome.scripting) {
          chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            func: (dir) => {
              const scrollAmount = dir === 'up' ? -300 : 300;
              window.scrollBy(0, scrollAmount);
            },
            args: [direction]
          });
        }
        break;

      case 'navigate':
        if (chrome && chrome.tabs) {
          switch (target) {
            case 'back':
              chrome.tabs.goBack(activeTab.id);
              break;
            case 'forward':
              chrome.tabs.goForward(activeTab.id);
              break;
            case 'refresh':
              chrome.tabs.reload(activeTab.id);
              break;
            case 'new_tab':
              chrome.tabs.create({});
              break;
            case 'close_tab':
              chrome.tabs.remove(activeTab.id);
              break;
          }
        }
        break;
    }
  }

  // Execute search actions
  async function executeSearch(action) {
    const { query, engine = 'google' } = action;
    const searchUrls = {
      google: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      bing: `https://www.bing.com/search?q=${encodeURIComponent(query)}`,
      youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
      wikipedia: `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`
    };

    const url = searchUrls[engine] || searchUrls.google;
    window.open(url, '_blank');
  }

  // Execute navigation actions
  async function executeNavigation(action) {
    const { url, target = '_blank' } = action;
    window.open(url, target);
  }

  // Execute system actions
  async function executeSystemAction(action) {
    const { command } = action;

    switch (command) {
      case 'clear_history':
        setMessages([]);
        localStorage.removeItem('heyweb_messages');
        break;
      case 'export_conversation':
        downloadConversation();
        break;
      case 'open_settings':
        setShowSettings(true);
        break;
    }
  }

  // Text-to-Speech function
  function speakText(text) {
    if (!('speechSynthesis' in window)) return;
    
    // Stop any current speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = voiceSettings.rate;
    utterance.pitch = voiceSettings.pitch;
    
    if (voiceSettings.voice) {
      const match = window.speechSynthesis.getVoices().find(v => v.name === voiceSettings.voice);
      if (match) utterance.voice = match;
    }
    
    window.speechSynthesis.speak(utterance);
  }

  // Audio recording functions
  async function startRecord() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      const chunks = [];
      recorderRef.current = { mr, stream, chunks };

      mr.ondataavailable = (e) => chunks.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
      };
      mr.start();
      setRecording(true);
    } catch (e) {
      console.error('Record error', e);
    }
  }

  function stopRecord() {
    recorderRef.current?.mr?.stop();
    recorderRef.current?.stream?.getTracks().forEach(t => t.stop());
    setRecording(false);
  }

  function downloadConversation() {
    const blob = new Blob([JSON.stringify(messages, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'heyweb-conversation.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <motion.div 
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center"
            animate={{ rotate: listening ? [0, 10, -10, 0] : 0 }}
            transition={{ duration: 1, repeat: listening ? Infinity : 0 }}
          >
            <Bot className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold gradient-text">HeyWeb Assistant</h2>
            <p className="text-sm opacity-70">Your voice-first AI companion</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {webAutomationEnabled && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="status-indicator"
            >
              <Globe className="w-4 h-4" />
              <span>Web Control</span>
            </motion.div>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSettings(true)}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={downloadConversation}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300"
            title="Export conversation"
          >
            <Download className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Enhanced Chat Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto p-6 space-y-4 rounded-2xl card">
          <AnimatePresence>
            {messages.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <motion.div 
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-600/20 flex items-center justify-center mx-auto mb-6"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-10 h-10 text-purple-400" />
                </motion.div>
                <h3 className="text-xl font-semibold mb-2">Welcome to HeyWeb!</h3>
                <p className="text-lg opacity-70 mb-4">Say "HeyWeb" and speak naturally</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  {[
                    { icon: '🔍', text: 'Search for anything' },
                    { icon: '⚡', text: 'Control websites' },
                    { icon: '💬', text: 'Have conversations' }
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-4 rounded-xl bg-white/5 border border-white/10"
                    >
                      <div className="text-2xl mb-2">{item.icon}</div>
                      <div className="text-sm opacity-80">{item.text}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {messages.map((m, i) => (
              <ChatBubble key={i} role={m.role} content={m.content} />
            ))}

            {isProcessing && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 rounded-2xl bg-white/5"
              >
                <div className="flex gap-1">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
                <div className="text-sm opacity-70">Processing your request...</div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Enhanced Controls */}
      <div className="mt-6 space-y-4">
        {/* Transcript Display */}
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30"
          >
            <div className="text-sm opacity-80 mb-1">Listening...</div>
            <div className="text-lg font-medium">{transcript}</div>
          </motion.div>
        )}

        {/* Control Buttons */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input
              value={transcript}
              readOnly
              placeholder="Speak naturally to HeyWeb..."
              className="input-enhanced"
            />
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => (recording ? stopRecord() : startRecord())}
              className={`p-4 rounded-2xl transition-all duration-300 ${
                recording 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-white/10 hover:bg-white/20'
              }`}
              title="Record audio"
            >
              {recording ? <StopCircle className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => (listening ? stopListening() : startListening())}
              disabled={!speechRecognitionAvailable}
              className={`px-8 py-4 rounded-2xl flex items-center gap-3 font-medium transition-all duration-300 ${
                !speechRecognitionAvailable
                  ? 'bg-gray-500/50 text-gray-400 cursor-not-allowed'
                  : listening 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse-glow' 
                    : 'btn-primary'
              }`}
              title={!speechRecognitionAvailable ? 'Speech recognition not available' : 'Talk to HeyWeb'}
            >
              <Mic className="w-5 h-5" />
              <span>
                {!speechRecognitionAvailable 
                  ? 'Voice Unavailable' 
                  : listening 
                    ? 'Listening...' 
                    : 'Talk to HeyWeb'
                }
              </span>
            </motion.button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between text-xs opacity-60">
          <div className="flex items-center gap-4">
            <span>Voices: {voices.length}</span>
            <span>Microphone: {listening ? 'on' : 'off'}</span>
            <span className={`${speechRecognitionAvailable ? 'text-green-400' : 'text-red-400'}`}>
              Speech Recognition: {speechRecognitionAvailable ? 'Available' : 'Unavailable'}
            </span>
          </div>
          {webAutomationEnabled && (
            <div className="flex items-center gap-2">
              <Globe className="w-3 h-3" />
              <span>Web Control Active</span>
            </div>
          )}
        </div>

        {/* Enhanced Waveform */}
        <div className="mt-4">
          <Waveform active={recording || !!recordedUrl || isProcessing} />
        </div>
      </div>

      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        voices={voices}
        voiceSettings={voiceSettings}
        onChange={(s) => setVoiceSettings(s)}
      />
    </div>
  );
}
