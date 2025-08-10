import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Globe, Mic, MessageSquare, FileText, Languages, Settings, Bot, Send, X } from 'lucide-react';
import VoiceAssistant from './components/voiceAssistant.jsx';
import FloatingActionButton from './components/FloatingActionButton.jsx';
import SummarizeSection from './components/SummarizeSection';
import TranslateSection from './components/TranslateSection';
import ChatSection from './components/ChatSection';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [showSettings, setShowSettings] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [keyboardInput, setKeyboardInput] = useState('');
  const [webAutomationEnabled, setWebAutomationEnabled] = useState(false);

  // Check for Chrome extension context
  useEffect(() => {
    if (chrome && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          setWebAutomationEnabled(true);
        }
      });
    }
  }, []);

  const tabs = [
    { id: 'chat', label: 'Chat', icon: MessageSquare, color: 'from-blue-500 to-purple-600' },
    { id: 'summarize', label: 'Summarize', icon: FileText, color: 'from-emerald-500 to-teal-600' },
    { id: 'translate', label: 'Translate', icon: Languages, color: 'from-orange-500 to-red-600' }
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handleKeyboardSubmit = (e) => {
    e.preventDefault();
    if (keyboardInput.trim()) {
      // Handle keyboard input based on active tab
      console.log('Keyboard input:', keyboardInput);
      setKeyboardInput('');
    }
  };

  const handleMicClick = () => {
    setIsListening(!isListening);
  };

  const handleSettingsClick = () => {
    setShowSettings(true);
  };

  const handleDownloadClick = () => {
    // Handle download functionality
    console.log('Download clicked');
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 p-6 border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div 
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                HeyWeb!
              </h1>
              <p className="text-sm text-gray-400">AI-Powered Voice Assistant</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {webAutomationEnabled && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-sm"
              >
                <Globe className="w-4 h-4" />
                <span>Web Control</span>
              </motion.div>
            )}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 border border-white/10"
              title="Settings"
            >
              <Settings className="w-5 h-5 text-gray-300" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex-1 relative z-10 p-6 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          {/* Tab Navigation */}
          <motion.nav 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 mb-6"
          >
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 border ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg border-transparent`
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-300 hover:text-white'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </motion.button>
            ))}
          </motion.nav>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {activeTab === 'chat' && (
                  <ChatSection 
                    isListening={isListening}
                    setIsListening={setIsListening}
                    keyboardInput={keyboardInput}
                    setKeyboardInput={setKeyboardInput}
                    onKeyboardSubmit={handleKeyboardSubmit}
                  />
                )}
                {activeTab === 'summarize' && (
                  <SummarizeSection 
                    keyboardInput={keyboardInput}
                    setKeyboardInput={setKeyboardInput}
                    onKeyboardSubmit={handleKeyboardSubmit}
                  />
                )}
                {activeTab === 'translate' && (
                  <TranslateSection 
                    keyboardInput={keyboardInput}
                    setKeyboardInput={setKeyboardInput}
                    onKeyboardSubmit={handleKeyboardSubmit}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton 
        onMicClick={handleMicClick}
        onSettingsClick={handleSettingsClick}
        onDownloadClick={handleDownloadClick}
        isListening={isListening}
      />

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Settings</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Voice Settings
                  </label>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Speed</label>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        defaultValue="1"
                        className="w-full slider"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Pitch</label>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        defaultValue="1"
                        className="w-full slider"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Theme
                  </label>
                  <select className="w-full p-2 rounded-lg bg-slate-700 border border-white/10 text-white">
                    <option>Professional Dark</option>
                    <option>Light Mode</option>
                    <option>High Contrast</option>
                  </select>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}