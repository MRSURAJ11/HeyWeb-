import React, { useEffect, useState } from 'react';
import { X, Settings, Volume2, Mic, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SettingsModal({ open = false, onClose = () => {}, voices = [], voiceSettings = {}, onChange = () => {} }) {
  const [local, setLocal] = useState(voiceSettings);

  useEffect(() => setLocal(voiceSettings), [voiceSettings]);

  if (!open) return null;

  function update(k, v) {
    const next = { ...local, [k]: v };
    setLocal(next);
  }

  function save() {
    onChange(local);
    onClose();
  }

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4"
      >
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-md" 
          onClick={onClose} 
        />
        
        <motion.div
          initial={{ y: 40, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 40, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative z-10 w-full max-w-2xl card-premium rounded-3xl p-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Voice & TTS Settings</h3>
                <p className="text-sm opacity-60">Customize your AI assistant experience</p>
              </div>
            </div>
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose} 
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300"
            >
              <X size={20} />
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Voice Settings */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Volume2 className="w-5 h-5 text-purple-400" />
                <h4 className="text-lg font-semibold">Voice Settings</h4>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium opacity-80 mb-2 block">Voice Selection</label>
                  <select
                    value={local.voice || ''}
                    onChange={(e) => update('voice', e.target.value)}
                    className="input-enhanced w-full"
                  >
                    {voices.map((v, i) => (
                      <option key={i} value={v.name}>{v.name} — {v.lang}</option>
                    ))}
                    {voices.length === 0 && <option value="">(No voices available)</option>}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium opacity-80 mb-2 block">Speech Rate</label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={local.rate || 1}
                      onChange={(e) => update('rate', Number(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs opacity-70">
                      <span>Slow</span>
                      <span className="font-medium">{local.rate || 1}x</span>
                      <span>Fast</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium opacity-80 mb-2 block">Pitch</label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={local.pitch || 1}
                      onChange={(e) => update('pitch', Number(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs opacity-70">
                      <span>Low</span>
                      <span className="font-medium">{local.pitch || 1}</span>
                      <span>High</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview & Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Mic className="w-5 h-5 text-emerald-400" />
                <h4 className="text-lg font-semibold">Preview & Info</h4>
              </div>

              <div className="card p-6 rounded-2xl">
                <h5 className="font-medium mb-3">Voice Preview</h5>
                <p className="text-sm opacity-80 mb-4">
                  Test your current voice settings with a sample text.
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const utterance = new SpeechSynthesisUtterance("Hello! This is a preview of your voice settings.");
                    utterance.rate = local.rate || 1;
                    utterance.pitch = local.pitch || 1;
                    if (local.voice) {
                      const match = window.speechSynthesis.getVoices().find(v => v.name === local.voice);
                      if (match) utterance.voice = match;
                    }
                    window.speechSynthesis.speak(utterance);
                  }}
                  className="btn-secondary w-full"
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  Test Voice
                </motion.button>
              </div>

              <div className="card p-6 rounded-2xl">
                <h5 className="font-medium mb-3">Quick Tips</h5>
                <div className="space-y-2 text-sm opacity-80">
                  <div className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span>Adjust rate for faster or slower speech</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span>Modify pitch to change voice character</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span>Choose from available system voices</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-white/10">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose} 
              className="btn-secondary"
            >
              Cancel
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={save} 
              className="btn-primary"
            >
              Save Settings
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
