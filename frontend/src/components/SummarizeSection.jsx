import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Send, Sparkles, Copy, Download, RefreshCw } from 'lucide-react';
import axios from 'axios';

export default function SummarizeSection({ keyboardInput, setKeyboardInput, onKeyboardSubmit }) {
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState('');
  const [keyPoints, setKeyPoints] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSummarize = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsProcessing(true);
    setError('');
    setSummary('');
    setKeyPoints([]);

    try {
      const response = await axios.post('/api/summarize', {
        text: inputText,
        maxLength: 300,
        includeKeyPoints: true
      });

      setSummary(response.data.summary);
      setKeyPoints(response.data.keyPoints || []);
    } catch (err) {
      console.error('Summarization error:', err);
      setError('Failed to summarize text. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleDownload = () => {
    const content = `Summary:\n${summary}\n\nKey Points:\n${keyPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'summary.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setInputText('');
    setSummary('');
    setKeyPoints([]);
    setError('');
  };

  return (
    <div className="h-full flex flex-col bg-slate-800/50 rounded-2xl border border-white/10 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <FileText className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h2 className="text-lg font-semibold text-white">Text Summarizer</h2>
            <p className="text-sm text-gray-400">AI-powered text summarization with key points</p>
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

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col lg:flex-row gap-6 p-6">
          {/* Input Section */}
          <div className="lg:w-1/2 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Input Text</h3>
              <span className="text-sm text-gray-400">{inputText.length} characters</span>
            </div>
            
            <form onSubmit={handleSummarize} className="flex-1 flex flex-col">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste or type the text you want to summarize..."
                className="flex-1 p-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 focus:bg-white/15 transition-all duration-300 resize-none"
                rows={10}
              />
              
              <div className="flex items-center gap-3 mt-4">
                <motion.button
                  type="submit"
                  disabled={!inputText.trim() || isProcessing}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 p-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Summarize</span>
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </div>

          {/* Output Section */}
          <div className="lg:w-1/2 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Summary & Key Points</h3>
              {summary && (
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCopy(summary)}
                    className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors"
                    title="Copy summary"
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

            <div className="flex-1 overflow-auto space-y-4">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400"
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
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex gap-1">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                      </div>
                      <div className="text-sm text-gray-400">Generating summary...</div>
                    </div>
                  </motion.div>
                )}

                {summary && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-xl bg-white/10 border border-white/10"
                  >
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-emerald-400" />
                      Summary
                    </h4>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{summary}</p>
                  </motion.div>
                )}

                {keyPoints.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-xl bg-white/10 border border-white/10"
                  >
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-emerald-400" />
                      Key Points
                    </h4>
                    <ul className="space-y-2">
                      {keyPoints.map((point, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-3 text-gray-300"
                        >
                          <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-medium flex items-center justify-center flex-shrink-0 mt-0.5">
                            {index + 1}
                          </span>
                          <span className="leading-relaxed">{point}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {!summary && !isProcessing && !error && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12"
                  >
                    <motion.div 
                      className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-600/20 flex items-center justify-center mx-auto mb-6"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <FileText className="w-10 h-10 text-emerald-400" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-white mb-2">Ready to Summarize</h3>
                    <p className="text-gray-400">Enter your text and get an AI-powered summary with key points</p>
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
