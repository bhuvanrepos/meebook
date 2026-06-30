"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Petal {
  id: number;
  x: number; // initial horizontal position %
  delay: number; // animation delay seconds
  duration: number; // descent duration seconds
  scale: number; // scale multiplier
  rotate: number; // initial rotation angle
  swayDistance: number; // range of horizontal sway
}

export const FloatingPetals: React.FC = () => {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    // Generate static details for 12 background petals
    const items = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // random start horizontal position
      delay: Math.random() * -20, // offset delay so some petals are already visible on mount
      duration: 15 + Math.random() * 20, // slow descent speeds
      scale: 0.5 + Math.random() * 0.7,
      rotate: Math.random() * 360,
      swayDistance: 30 + Math.random() * 70,
    }));
    setPetals(items);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {petals.map((petal) => (
        <motion.div
          key={petal.id}
          className="absolute"
          initial={{ 
            top: "-10%", 
            left: `${petal.x}%`, 
            scale: petal.scale, 
            rotate: petal.rotate,
            opacity: 0 
          }}
          animate={{
            top: "110%",
            left: [
              `${petal.x}%`,
              `${petal.x + (petal.swayDistance / 10)}%`,
              `${petal.x - (petal.swayDistance / 10)}%`,
              `${petal.x + (petal.swayDistance / 20)}%`
            ],
            rotate: petal.rotate + 360 + (Math.random() * 180),
            opacity: [0, 0.15, 0.4, 0.4, 0.25, 0]
          }}
          transition={{
            duration: petal.duration,
            delay: petal.delay,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ width: 18, height: 26 }}
        >
          <svg viewBox="0 0 20 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M 10 0 C 16 10, 22 20, 10 30 C -2 20, 4 10, 10 0 Z"
              fill="var(--accent)"
              className="opacity-70"
            />
          </svg>
        </motion.div>
      ))}
    </div>
  );
};
