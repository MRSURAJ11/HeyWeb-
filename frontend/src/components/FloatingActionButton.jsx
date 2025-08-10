import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Settings, Download, Sparkles, StopCircle } from 'lucide-react';

export default function FloatingActionButton({ onMicClick, onSettingsClick, onDownloadClick, isListening = false }) {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      icon: isListening ? StopCircle : Mic,
      label: isListening ? 'Stop Listening' : 'Voice Input',
      onClick: onMicClick,
      color: isListening ? 'from-red-500 to-red-600' : 'from-emerald-500 to-teal-600'
    },
    {
      icon: Settings,
      label: 'Settings',
      onClick: onSettingsClick,
      color: 'from-purple-500 to-blue-600'
    },
    {
      icon: Download,
      label: 'Export',
      onClick: onDownloadClick,
      color: 'from-orange-500 to-red-600'
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-16 right-0 space-y-3"
          >
            {actions.map((action, index) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                className={`p-4 rounded-2xl bg-gradient-to-br ${action.color} shadow-lg hover:shadow-xl transition-all duration-300 group ${
                  isListening && action.label.includes('Voice') ? 'animate-pulse' : ''
                }`}
                title={action.label}
              >
                <action.icon className="w-6 h-6 text-white" />
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute right-full mr-3 px-2 py-1 text-xs font-medium bg-black/80 text-white rounded-lg whitespace-nowrap"
                >
                  {action.label}
                </motion.span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center ${
          isListening ? 'animate-pulse' : ''
        }`}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <Sparkles className="w-7 h-7 text-white" />
        </motion.div>
      </motion.button>
    </div>
  );
}
