'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Clock, RefreshCw } from 'lucide-react';

function getNextUpdateTime(): Date {
  const now = new Date();
  const nextUpdate = new Date(now);
  nextUpdate.setUTCHours(2, 0, 0, 0); // 2 AM UTC

  if (nextUpdate <= now) {
    nextUpdate.setDate(nextUpdate.getDate() + 1);
  }

  return nextUpdate;
}

function formatTimeRemaining(date: Date): {
  hours: string;
  minutes: string;
  seconds: string;
} {
  const now = new Date();
  const diff = Math.max(0, date.getTime() - now.getTime());

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return {
    hours: hours.toString().padStart(2, '0'),
    minutes: minutes.toString().padStart(2, '0'),
    seconds: seconds.toString().padStart(2, '0'),
  };
}

export default function WeatherCountdown() {
  const [timeRemaining, setTimeRemaining] = useState({
    hours: '00',
    minutes: '00',
    seconds: '00',
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Set mounted and initialize time remaining
    const initialNextUpdate = getNextUpdateTime();
    setTimeRemaining(formatTimeRemaining(initialNextUpdate));
    setMounted(true);

    const timer = setInterval(() => {
      // Always recalculate nextUpdate to avoid stale closure
      const currentNextUpdate = getNextUpdateTime();
      setTimeRemaining(formatTimeRemaining(currentNextUpdate));
    }, 1000);

    return () => clearInterval(timer);
  }, []); // Empty dependency array - only run once on mount

  if (!mounted) {
    return null; // Render nothing server-side
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="w-full max-w-2xl mx-auto mb-8"
    >
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-2xl p-6 shadow-lg border border-blue-100 dark:border-slate-700">
        <div className="flex items-center justify-center gap-3 mb-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 20,
              ease: 'linear',
              repeat: Infinity,
            }}
          >
            <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </motion.div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            Prochaine Mise à jour
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <TimeUnit label="Heures" value={timeRemaining.hours} />
          <TimeUnit label="Minutes" value={timeRemaining.minutes} />
          <TimeUnit label="Secondes" value={timeRemaining.seconds} />
        </div>

        <motion.div
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
          animate={{
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <RefreshCw className="w-4 h-4" />
          <span>Données mises à jour tous les jours à 2h00 UTC</span>
        </motion.div>
      </div>
    </motion.div>
  );
}

function TimeUnit({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-28 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-blue-100 dark:border-slate-700 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-800" />

        {/* Animated digit container */}
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={value}
              initial={{ y: 50, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -50, opacity: 0, scale: 0.8 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
              className="text-4xl font-black bg-gradient-to-b from-blue-700 to-indigo-800 dark:from-blue-300 dark:to-indigo-400 bg-clip-text text-transparent"
            >
              {value}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Decorative lines */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-200 dark:via-slate-600 to-transparent" />
        <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-500" />
        <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-500" />
        <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-500" />
        <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-500" />
      </div>

      <motion.p
        className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300"
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
      >
        {label}
      </motion.p>
    </div>
  );
}
