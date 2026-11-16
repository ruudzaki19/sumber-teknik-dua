import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export const CoolingAirflowBackground: React.FC = () => {
  // Generate stable random particle positions for cool air drift
  const particles = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      x: `${(i * 7.5 + 3) % 96}%`,
      startY: 100 + (i * 25) % 80,
      size: (i % 3 === 0 ? 5 : i % 2 === 0 ? 3.5 : 2.5),
      duration: 14 + (i % 5) * 3,
      delay: (i * 1.3) % 7,
      isCrystal: i % 4 === 0,
      opacity: 0.12 + (i % 3) * 0.08
    }));
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
      style={{
        backgroundColor: '#F9F6F0'
      }}
    >
      {/* 1. Subtle Engineering Dot-Matrix Blueprint Pattern */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(circle, #CDC5B4 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          backgroundPosition: '0 0'
        }}
      />

      {/* 2. Soft Ambient Vignette for Cream Warmth */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(245, 239, 227, 0.6) 0%, rgba(249, 246, 240, 0.95) 100%)'
        }}
      />

      {/* 3. Rotating Technical Gear Watermark (Lambang Roda Gigi Mesin ST) */}
      <div className="absolute -bottom-24 -right-24 opacity-[0.045] text-[#15803D]">
        <motion.svg
          width="480"
          height="480"
          viewBox="0 0 200 200"
          fill="currentColor"
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
        >
          {/* 8-Tooth Industrial Gear Silhouette matching ST Logo */}
          <path d="M115,10 L85,10 L82,32 C75,34 68,38 62,43 L42,32 L20,54 L32,74 C28,80 24,87 22,95 L10,98 L10,128 L32,131 C34,138 38,145 43,151 L32,171 L54,193 L74,181 C80,185 87,189 95,191 L98,203 L128,203 L131,181 C138,179 145,175 151,170 L171,181 L193,159 L181,139 C185,133 189,126 191,118 L203,115 L203,85 L181,82 C179,75 175,68 170,62 L181,42 L159,20 L139,32 C133,28 126,24 118,22 Z M100,60 C122.09,60 140,77.91 140,100 C140,122.09 122.09,140 100,140 C77.91,140 60,122.09 60,100 C60,77.91 77.91,60 100,60 Z" />
        </motion.svg>
      </div>

      {/* 4. Second Subtle Gear Watermark in Top-Left */}
      <div className="absolute -top-20 -left-20 opacity-[0.03] text-[#15803D]">
        <motion.svg
          width="340"
          height="340"
          viewBox="0 0 200 200"
          fill="currentColor"
          animate={{ rotate: -360 }}
          transition={{ duration: 150, repeat: Infinity, ease: 'linear' }}
        >
          <path d="M115,10 L85,10 L82,32 C75,34 68,38 62,43 L42,32 L20,54 L32,74 C28,80 24,87 22,95 L10,98 L10,128 L32,131 C34,138 38,145 43,151 L32,171 L54,193 L74,181 C80,185 87,189 95,191 L98,203 L128,203 L131,181 C138,179 145,175 151,170 L171,181 L193,159 L181,139 C185,133 189,126 191,118 L203,115 L203,85 L181,82 C179,75 175,68 170,62 L181,42 L159,20 L139,32 C133,28 126,24 118,22 Z M100,60 C122.09,60 140,77.91 140,100 C140,122.09 122.09,140 100,140 C77.91,140 60,122.09 60,100 C60,77.91 77.91,60 100,60 Z" />
        </motion.svg>
      </div>

      {/* 5. Animated Cool Airflow Breeze Waves (Gelombang Aliran Angin AC) */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="coolBreezeGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#15803D" stopOpacity="0" />
            <stop offset="30%" stopColor="#15803D" stopOpacity="0.07" />
            <stop offset="70%" stopColor="#059669" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#15803D" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="coolBreezeGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0284C7" stopOpacity="0" />
            <stop offset="40%" stopColor="#0EA5E9" stopOpacity="0.05" />
            <stop offset="75%" stopColor="#10B981" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="coolBreezeGrad3" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#166534" stopOpacity="0" />
            <stop offset="50%" stopColor="#15803D" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#166534" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Breeze Stream 1: Top Flow */}
        <motion.path
          d="M -200 160 Q 250 120 700 170 T 1600 140 T 2400 180"
          fill="none"
          stroke="url(#coolBreezeGrad1)"
          strokeWidth="2.5"
          strokeDasharray="16 12"
          animate={{
            x: [0, 400],
            d: [
              "M -200 160 Q 250 120 700 170 T 1600 140 T 2400 180",
              "M -200 180 Q 250 150 700 130 T 1600 170 T 2400 150",
              "M -200 160 Q 250 120 700 170 T 1600 140 T 2400 180"
            ]
          }}
          transition={{
            x: { duration: 18, repeat: Infinity, ease: 'linear' },
            d: { duration: 10, repeat: Infinity, ease: 'easeInOut' }
          }}
        />

        {/* Breeze Stream 2: Mid-Air Cooling Flow */}
        <motion.path
          d="M -300 420 Q 200 470 650 400 T 1500 440 T 2300 390"
          fill="none"
          stroke="url(#coolBreezeGrad2)"
          strokeWidth="3"
          strokeDasharray="20 16"
          animate={{
            x: [0, 360],
            d: [
              "M -300 420 Q 200 470 650 400 T 1500 440 T 2300 390",
              "M -300 400 Q 200 430 650 460 T 1500 410 T 2300 440",
              "M -300 420 Q 200 470 650 400 T 1500 440 T 2300 390"
            ]
          }}
          transition={{
            x: { duration: 24, repeat: Infinity, ease: 'linear' },
            d: { duration: 12, repeat: Infinity, ease: 'easeInOut' }
          }}
        />

        {/* Breeze Stream 3: Lower Ambient Flow */}
        <motion.path
          d="M -150 680 Q 300 640 800 700 T 1700 660 T 2500 710"
          fill="none"
          stroke="url(#coolBreezeGrad3)"
          strokeWidth="2"
          strokeDasharray="14 10"
          animate={{
            x: [0, 300],
            d: [
              "M -150 680 Q 300 640 800 700 T 1700 660 T 2500 710",
              "M -150 710 Q 300 670 800 650 T 1700 690 T 2500 670",
              "M -150 680 Q 300 640 800 700 T 1700 660 T 2500 710"
            ]
          }}
          transition={{
            x: { duration: 22, repeat: Infinity, ease: 'linear' },
            d: { duration: 11, repeat: Infinity, ease: 'easeInOut' }
          }}
        />
      </svg>

      {/* 6. Subtle Floating Cool Air Micro-Particles (Hawa Sejuk / Frost Sparkles) */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.x,
            bottom: -20,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.isCrystal ? '#10B981' : '#15803D'
          }}
          animate={{
            y: [-20, -900],
            x: [0, (p.id % 2 === 0 ? 30 : -30), 0],
            opacity: [0, p.opacity, p.opacity * 0.8, 0]
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      ))}
    </div>
  );
};
