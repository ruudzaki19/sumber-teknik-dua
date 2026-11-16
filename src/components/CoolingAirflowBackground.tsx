import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export const CoolingAirflowBackground: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  // 5 Solid floating circles (hijau pucat, krem gelap, hijau muda semi-transparan)
  const circles = [
    { id: 1, size: 280, top: '8%', left: '4%', bg: 'bg-st-pale', dx: 35, dy: 45, duration: 15, delay: 0 },
    { id: 2, size: 340, top: '52%', right: '5%', bg: 'bg-st-cream-dark', dx: -40, dy: 35, duration: 17, delay: 1.5 },
    { id: 3, size: 200, top: '78%', left: '12%', bg: 'bg-st-light/35', dx: 30, dy: -35, duration: 14, delay: 0.8 },
    { id: 4, size: 230, top: '24%', right: '22%', bg: 'bg-st-pale', dx: -25, dy: 40, duration: 18, delay: 2.2 },
    { id: 5, size: 290, top: '65%', right: '36%', bg: 'bg-st-cream-dark', dx: 35, dy: -30, duration: 16, delay: 1.0 },
  ];

  // 4 Thin horizontal lines (hijau muda solid) moving left to right like AC cooling breeze
  const airflowLines = [
    { id: 1, top: '16%', width: 180, delay: 0 },
    { id: 2, top: '36%', width: 240, delay: 2.4 },
    { id: 3, top: '60%', width: 160, delay: 4.8 },
    { id: 4, top: '82%', width: 210, delay: 6.8 },
  ];

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none bg-st-cream"
    >
      {/* 5 Solid Floating Circles (Tanpa Gradasi) */}
      {circles.map((c) => (
        <motion.div
          key={c.id}
          className={`absolute rounded-full ${c.bg}`}
          style={{
            width: c.size,
            height: c.size,
            top: c.top,
            left: c.left,
            right: c.right,
          }}
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  x: [0, c.dx, 0],
                  y: [0, c.dy, 0],
                  scale: [1, 1.06, 1],
                }
          }
          transition={{
            duration: c.duration,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
            delay: c.delay,
          }}
        />
      ))}

      {/* 4 Thin Light Green Lines: Moving Left-to-Right like AC breeze (9s loop) */}
      {!shouldReduceMotion &&
        airflowLines.map((line) => (
          <motion.div
            key={line.id}
            className="absolute h-[2px] bg-st-light rounded-full"
            style={{
              top: line.top,
              width: line.width,
              left: 0,
            }}
            animate={{
              x: ['-280px', 'calc(100vw + 280px)'],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              ease: 'linear',
              delay: line.delay,
            }}
          />
        ))}
    </div>
  );
};
