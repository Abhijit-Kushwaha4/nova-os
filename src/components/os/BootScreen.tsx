import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface BootScreenProps {
  onComplete: () => void;
}

export const BootScreen: React.FC<BootScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initializing...');

  useEffect(() => {
    const steps = [
      { progress: 20, status: 'Loading system files...' },
      { progress: 40, status: 'Initializing desktop...' },
      { progress: 60, status: 'Loading applications...' },
      { progress: 80, status: 'Starting services...' },
      { progress: 100, status: 'Welcome!' },
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setProgress(steps[currentStep].progress);
        setStatus(steps[currentStep].status);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 500);
      }
    }, 400);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex flex-col items-center justify-center z-[100]"
      style={{ background: 'linear-gradient(135deg, hsl(222 47% 4%) 0%, hsl(260 50% 8%) 50%, hsl(222 47% 6%) 100%)' }}
    >
      {/* Logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-12"
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl">
          <div className="w-10 h-10 grid grid-cols-2 gap-1">
            <div className="bg-white/90 rounded-sm" />
            <div className="bg-white/70 rounded-sm" />
            <div className="bg-white/70 rounded-sm" />
            <div className="bg-white/90 rounded-sm" />
          </div>
        </div>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-3xl font-light text-foreground mb-2 tracking-wide"
      >
        WebOS
      </motion.h1>
      
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-sm text-muted-foreground mb-12"
      >
        Your browser-based operating system
      </motion.p>

      {/* Loading */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col items-center gap-4"
      >
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">{status}</p>
        
        {/* Progress Bar */}
        <div className="w-48 h-1 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};
