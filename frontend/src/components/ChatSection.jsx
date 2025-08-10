import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Send, Bot, User, Sparkles, StopCircle } from 'lucide-react';
import axios from 'axios';

export default function ChatSection({ isListening, setIsListening, keyboardInput, setKeyboardInput, onKeyboardSubmit }) {
  const [messages, setMessages] = useState(() => {
    try { return JSON.parse(localStorage.getItem('heyweb_messages') || '[]'); }
    catch { return []; }
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [speechRecognitionAvailable, setSpeechRecognitionAvailable] = useState(true);
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Save messages to localStorage
  useEffect(() => {
    localStorage.setItem('heyweb_messages', JSON.stringify(messages));
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('SpeechRecognition not supported in this browser. Please use Chrome, Edge, or Safari.');
      setSpeechRecognitionAvailable(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log('Chat speech recognition started');
        setIsListening(true);
      };

      recognition.onresult = (e) => {
        const interim = Array.from(e.results)
          .map(res => res[0].transcript)
          .join('');
        setTranscript(interim);

        if (e.results[0].isFinal) {
          handleUserMessage(interim.trim());
        }
      };

      recognition.onerror = (ev) => {
        console.error('Chat speech error:', ev.error);
        setIsListening(false);
        
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

      recognition.onend = () => {
        console.log('Chat speech recognition ended');
        setIsListening(false);
      };

      setRecognition(recognition);
    } catch (error) {
      console.error('Failed to initialize chat speech recognition:', error);
    }

    return () => {
      if (recognition) {
        try {
          recognition.onresult = null;
          recognition.onerror = null;
          recognition.onstart = null;
          recognition.onend = null;
        } catch (error) {
          console.error('Error cleaning up recognition:', error);
        }
      }
    };
  }, []);

  // Handle listening state changes
  useEffect(() => {
    if (isListening && recognition) {
      try {
        recognition.start();
        setTranscript('');
        console.log('Starting chat speech recognition...');
      } catch (e) {
        console.error('Failed to start chat recognition:', e);
        setIsListening(false);
        
        if (e.name === 'InvalidStateError') {
          alert('Speech recognition is already active. Please wait a moment and try again.');
        } else if (e.name === 'NotAllowedError') {
          alert('Microphone access denied. Please allow microphone access in your browser settings.');
        } else {
          alert('Failed to start voice recognition. Please try again.');
        }
      }
    } else if (!isListening && recognition) {
      try {
        recognition.stop();
        console.log('Stopping chat speech recognition...');
      } catch (e) {
        console.error('Failed to stop chat recognition:', e);
      }
    }
  }, [isListening, recognition]);

  const handleUserMessage = async (text) => {
    if (!text.trim()) return;

    setTranscript('');
    setIsListening(false);

    // Add user message to chat
    const userMessage = { role: 'user', content: text, timestamp: new Date() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsProcessing(true);

    try {
      // Send to AI Backend
      const response = await axios.post('/api/chat', {
        messages: updatedMessages.slice(-10), // Keep last 10 messages for context
        context: {
          currentTime: new Date().toISOString(),
          userAgent: navigator.userAgent
        }
      });

      const aiResponse = response.data?.assistant || 'Sorry, I could not process your request.';
      
      // Add AI response to chat
      const aiMessage = { role: 'assistant', content: aiResponse, timestamp: new Date() };
      setMessages(prev => [...prev, aiMessage]);

      // Speak the response back to user
      speakText(aiResponse);

    } catch (err) {
      console.error('AI processing error:', err);
      const errorMessage = { 
        role: 'assistant', 
        content: 'I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      speakText('I encountered an error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyboardSubmit = (e) => {
    e.preventDefault();
    if (keyboardInput.trim()) {
      handleUserMessage(keyboardInput.trim());
      setKeyboardInput('');
    }
  };

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    
    window.speechSynthesis.speak(utterance);
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('heyweb_messages');
  };

  const downloadConversation = () => {
    const blob = new Blob([JSON.stringify(messages, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'heyweb-conversation.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col bg-slate-800/50 rounded-2xl border border-white/10 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
            animate={{ rotate: isListening ? [0, 10, -10, 0] : 0 }}
            transition={{ duration: 1, repeat: isListening ? Infinity : 0 }}
          >
            <Bot className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h2 className="text-lg font-semibold text-white">AI Chat Assistant</h2>
            <p className="text-sm text-gray-400">Powered by OpenAI GPT</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearChat}
            className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
            title="Clear chat"
          >
            <Sparkles className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto p-6 space-y-4">
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
                <h3 className="text-xl font-semibold text-white mb-2">Welcome to HeyWeb Chat!</h3>
                <p className="text-lg text-gray-400 mb-4">Start a conversation with your AI assistant</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  {[
                    { icon: '💬', text: 'Ask questions' },
                    { icon: '🔍', text: 'Search information' },
                    { icon: '⚡', text: 'Get help with tasks' }
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-4 rounded-xl bg-white/5 border border-white/10"
                    >
                      <div className="text-2xl mb-2">{item.icon}</div>
                      <div className="text-sm text-gray-300">{item.text}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {messages.map((message, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                      : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className={`p-4 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-blue-500/30'
                      : 'bg-white/10 border border-white/10'
                  }`}>
                    <p className="text-white whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}

            {isProcessing && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 rounded-2xl bg-white/5"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="flex gap-1">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
                <div className="text-sm text-gray-400">Processing your request...</div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-white/10">
        {/* Transcript Display */}
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 mb-4"
          >
            <div className="text-sm text-blue-300 mb-1">Listening...</div>
            <div className="text-lg font-medium text-white">{transcript}</div>
          </motion.div>
        )}

        {/* Input Form */}
        <form onSubmit={handleKeyboardSubmit} className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={keyboardInput}
              onChange={(e) => setKeyboardInput(e.target.value)}
              placeholder="Type your message or speak naturally..."
              className="w-full p-4 pr-12 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:bg-white/15 transition-all duration-300"
            />
            <button
              type="submit"
              disabled={!keyboardInput.trim()}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsListening(!isListening)}
            disabled={!speechRecognitionAvailable}
            className={`p-4 rounded-xl flex items-center gap-2 font-medium transition-all duration-300 ${
              !speechRecognitionAvailable
                ? 'bg-gray-500/50 text-gray-400 cursor-not-allowed'
                : isListening 
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
            }`}
            title={!speechRecognitionAvailable ? 'Speech recognition not available' : 'Use voice input'}
          >
            {isListening ? (
              <>
                <StopCircle className="w-5 h-5" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                <span>{speechRecognitionAvailable ? 'Voice' : 'Unavailable'}</span>
              </>
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
}
