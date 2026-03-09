import React from 'react';
import { motion } from 'framer-motion';

export const Gauge = ({ value, max, title, unit, color = "text-rpm-yellow" }) => {
  // Normalize value between 0 and 1
  const normalizedValue = Math.min(Math.max(value / max, 0), 1);
  
  // Calculate rotation angle (sweep from -120 to +120 degrees)
  const rotation = -120 + (normalizedValue * 240);

  // SVG parameters
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedValue * circumference * (240 / 360));

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-rpm-carbon/80 border border-gray-800 rounded-3xl shadow-2xl relative overflow-hidden backdrop-blur-sm">
      {/* Hexagonal accents */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rotate-45 transform translate-x-8 -translate-y-8 border-l border-b border-white/10" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rotate-45 transform -translate-x-8 translate-y-8 border-r border-t border-white/10" />
      
      <h3 className="text-gray-400 font-bold tracking-widest uppercase text-sm mb-4 z-10">{title}</h3>
      
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Background Arc */}
        <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke="#333"
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (120 / 360)}
            transform="rotate(150 100 100)"
          />
        </svg>

        {/* Dynamic Arc */}
        <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 200 200">
          <motion.circle
            cx="100"
            cy="100"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            className={`${color} drop-shadow-[0_0_10px_currentColor]`}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ type: "spring", stiffness: 50, damping: 15 }}
            strokeLinecap="round"
            transform="rotate(150 100 100)"
          />
        </svg>

        {/* Needle */}
        <motion.div
          className="absolute w-2 h-24 origin-bottom flex flex-col items-center justify-start bottom-1/2 left-[calc(50%-4px)]"
          initial={{ rotate: -120 }}
          animate={{ rotate: rotation }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          <div className="w-1 h-12 bg-red-500 rounded-t-full shadow-[0_0_10px_rgba(255,0,0,0.8)]" />
          <div className="w-4 h-4 bg-zinc-800 rounded-full border-2 border-zinc-600 mt-auto translate-y-2 z-10 shadow-lg" />
        </motion.div>

        {/* Center Value */}
        <div className="absolute flex flex-col items-center translate-y-12">
          <span className={`text-3xl font-bold font-mono ${color}`}>{value}</span>
          <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">{unit}</span>
        </div>
      </div>
    </div>
  );
};