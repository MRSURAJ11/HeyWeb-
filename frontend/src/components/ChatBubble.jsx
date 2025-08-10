import React from 'react';
import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';

export default function ChatBubble({ role = 'assistant', content = '' }) {
  const isUser = role === 'user';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.4, 0, 0.2, 1],
        type: "spring",
        stiffness: 100
      }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex items-start gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            isUser 
              ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
              : 'bg-gradient-to-br from-emerald-500 to-teal-600'
          }`}
        >
          {isUser ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <Bot className="w-4 h-4 text-white" />
          )}
        </motion.div>

        {/* Message Bubble */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`relative p-4 rounded-2xl ${
            isUser 
              ? 'chat-bubble-user' 
              : 'chat-bubble-assistant'
          }`}
        >
          {/* Message Content */}
          <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {content}
          </div>
          
          {/* Message Meta */}
          <div className={`mt-2 text-xs opacity-60 flex items-center gap-2 ${
            isUser ? 'justify-end' : 'justify-start'
          }`}>
            <span className="font-medium">
              {isUser ? 'You' : 'HeyWeb'}
            </span>
            <span>•</span>
            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>

          {/* Decorative elements */}
          {!isUser && (
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full opacity-60"></div>
          )}
          {isUser && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-60"></div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
