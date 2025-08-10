import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Languages, Send, Sparkles, Copy, Download, RefreshCw, ArrowRight } from 'lucide-react';
import axios from 'axios';

export default function TranslateSection({ keyboardInput, setKeyboardInput, onKeyboardSubmit }) {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('auto');
  const [targetLanguage, setTargetLanguage] = useState('english');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const languages = [
    { code: 'auto', name: 'Auto Detect' },
    { code: 'english', name: 'English' },
    { code: 'spanish', name: 'Spanish' },
    { code: 'french', name: 'French' },
    { code: 'german', name: 'German' },
    { code: 'italian', name: 'Italian' },
    { code: 'portuguese', name: 'Portuguese' },
    { code: 'russian', name: 'Russian' },
    { code: 'japanese', name: 'Japanese' },
    { code: 'korean', name: 'Korean' },
    { code: 'chinese', name: 'Chinese' },
    { code: 'arabic', name: 'Arabic' },
    { code: 'hindi', name: 'Hindi' },
    { code: 'dutch', name: 'Dutch' },
    { code: 'swedish', name: 'Swedish' },
    { code: 'norwegian', name: 'Norwegian' },
    { code: 'danish', name: 'Danish' },
    { code: 'finnish', name: 'Finnish' },
    { code: 'polish', name: 'Polish' },
    { code: 'turkish', name: 'Turkish' }
  ];

  const handleTranslate = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsProcessing(true);
    setError('');
    setTranslatedText('');

    try {
      const response = await axios.post('/api/translate', {
        text: inputText,
        sourceLanguage: sourceLanguage === 'auto' ? undefined : sourceLanguage,
        targetLanguage: targetLanguage
      });

      setTranslatedText(response.data.translatedText);
    } catch (err) {
      console.error('Translation error:', err);
      setError('Failed to translate text. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleDownload = () => {
    const content = `Original (${sourceLanguage}):\n${inputText}\n\nTranslated (${targetLanguage}):\n${translatedText}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'translation.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setInputText('');
    setTranslatedText('');
    setError('');
  };

  const swapLanguages = () => {
    if (sourceLanguage !== 'auto') {
      setSourceLanguage(targetLanguage);
      setTargetLanguage(sourceLanguage);
      setInputText(translatedText);
      setTranslatedText('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-800/50 rounded-2xl border border-white/10 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Languages className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h2 className="text-lg font-semibold text-white">Text Translator</h2>
            <p className="text-sm text-gray-400">AI-powered translation between multiple languages</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClear}
            className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
            title="Clear all"
          >
            <RefreshCw className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Language Selection */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">From</label>
            <select
              value={sourceLanguage}
              onChange={(e) => setSourceLanguage(e.target.value)}
              className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-orange-500/50 focus:bg-white/15 transition-all duration-300"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={swapLanguages}
            className="p-3 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 transition-colors"
            title="Swap languages"
          >
            <ArrowRight className="w-5 h-5" />
          </motion.button>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">To</label>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-orange-500/50 focus:bg-white/15 transition-all duration-300"
            >
              {languages.filter(lang => lang.code !== 'auto').map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col lg:flex-row gap-6 p-6">
          {/* Input Section */}
          <div className="lg:w-1/2 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Original Text</h3>
              <span className="text-sm text-gray-400">{inputText.length} characters</span>
            </div>
            
            <form onSubmit={handleTranslate} className="flex-1 flex flex-col">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text to translate..."
                className="flex-1 p-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500/50 focus:bg-white/15 transition-all duration-300 resize-none"
                rows={10}
              />
              
              <div className="flex items-center gap-3 mt-4">
                <motion.button
                  type="submit"
                  disabled={!inputText.trim() || isProcessing}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 p-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Translating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Translate</span>
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </div>

          {/* Output Section */}
          <div className="lg:w-1/2 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Translation</h3>
              {translatedText && (
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCopy(translatedText)}
                    className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors"
                    title="Copy translation"
                  >
                    <Copy className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDownload}
                    className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </motion.button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-auto">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 mb-4"
                  >
                    {error}
                  </motion.div>
                )}

                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                        <Languages className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex gap-1">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                      </div>
                      <div className="text-sm text-gray-400">Translating...</div>
                    </div>
                  </motion.div>
                )}

                {translatedText && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-xl bg-white/10 border border-white/10 h-full"
                  >
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Languages className="w-5 h-5 text-orange-400" />
                      {targetLanguage.charAt(0).toUpperCase() + targetLanguage.slice(1)}
                    </h4>
                    <div className="h-full overflow-auto">
                      <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{translatedText}</p>
                    </div>
                  </motion.div>
                )}

                {!translatedText && !isProcessing && !error && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12"
                  >
                    <motion.div 
                      className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500/20 to-red-600/20 flex items-center justify-center mx-auto mb-6"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Languages className="w-10 h-10 text-orange-400" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-white mb-2">Ready to Translate</h3>
                    <p className="text-gray-400">Enter your text and select languages to translate</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
