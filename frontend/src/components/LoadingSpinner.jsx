import React from 'react';
import { motion } from 'framer-motion';

export default function LoadingSpinner({ size = 'md', color = 'primary' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'border-blue-500',
    secondary: 'border-purple-500',
    success: 'border-emerald-500',
    warning: 'border-yellow-500'
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} border-2 border-white/20 border-t-current rounded-full ${colorClasses[color]}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );
}
