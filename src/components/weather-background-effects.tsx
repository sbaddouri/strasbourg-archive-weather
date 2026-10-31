"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// Predefined values for consistency
const SUN_RAY_HEIGHTS = [120, 95, 110, 130, 105, 125, 100, 115];
const SUN_RAY_DURATIONS = [3, 2.5, 3.5, 2.8, 3.2, 2.7, 3.3, 2.9];

export default function WeatherBackgroundEffects() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Gradient orbits */}
      <motion.div
        className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-orange-300/30 to-amber-400/20 rounded-full blur-3xl"
        animate={{
          x: mousePosition.x / 30,
          y: mousePosition.y / 30,
        }}
        transition={{ type: "spring", stiffness: 50 }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-400/20 to-cyan-300/20 rounded-full blur-3xl"
        animate={{
          x: -mousePosition.x / 40,
          y: -mousePosition.y / 40,
        }}
        transition={{ type: "spring", stiffness: 50 }}
      />
      
      {/* Floating sun rays */}
      <div className="absolute top-20 right-20">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 bg-gradient-to-b from-yellow-400/60 to-transparent"
            style={{
              height: SUN_RAY_HEIGHTS[i],
              left: 0,
              top: 0,
              transform: `rotate(${i * 45}deg) translateY(-60px)`,
              transformOrigin: "bottom center",
            }}
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scaleY: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: SUN_RAY_DURATIONS[i],
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.1,
            }}
          />
        ))}
        <motion.div
          className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full shadow-lg shadow-yellow-400/40"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 360],
          }}
          transition={{
            scale: {
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            },
            rotate: {
              duration: 60,
              repeat: Infinity,
              ease: "linear",
            },
          }}
        />
      </div>
      
      {/* Floating clouds */}
      <FloatingClouds />
    </div>
  );
}

function FloatingClouds() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(4)].map((_, i) => (
        <Cloud key={i} delay={i * 2} scale={0.6 + i * 0.2} top={10 + i * 15} />
      ))}
    </div>
  );
}

function Cloud({ delay, scale, top }: { delay: number; scale: number; top: number }) {
  return (
    <motion.div
      className="absolute"
      style={{ top: `${top}%`, scale }}
      initial={{ x: -200 }}
      animate={{ x: ["100vw", "-300px"] }}
      transition={{
        duration: 80 + delay * 20,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      <div className="flex items-center gap-1">
        <div className="w-16 h-10 bg-white/60 rounded-full blur-sm" />
        <div className="w-24 h-12 bg-white/70 rounded-full blur-sm -ml-6 -mt-2" />
        <div className="w-20 h-11 bg-white/65 rounded-full blur-sm -ml-5" />
        <div className="w-16 h-10 bg-white/55 rounded-full blur-sm -ml-4" />
      </div>
    </motion.div>
  );
}
