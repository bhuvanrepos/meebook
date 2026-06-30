"use client";

import React from "react";
import { motion } from "framer-motion";

interface MandaraLogoProps {
  bloomRatio?: number; // 0 to 1
  size?: number;
  className?: string;
  animate?: boolean;
}

export const MandaraLogo: React.FC<MandaraLogoProps> = ({
  bloomRatio = 0.5,
  size = 120,
  className = "",
  animate = true,
}) => {
  const outerPetalsCount = 10;
  const innerPetalsCount = 6;
  
  // Calculate transformation values based on progress ratio
  const outerDistance = 8 + bloomRatio * 20; // how far petals move out
  const innerDistance = 4 + bloomRatio * 12;
  
  const outerScale = 0.3 + bloomRatio * 0.7; // scale up as we progress
  const innerScale = 0.4 + bloomRatio * 0.6;
  
  const centerScale = 0.8 + bloomRatio * 0.2;

  // Single petal path (upward almond/teardrop shape)
  // Drawn from (0,0) upwards
  const petalPath = "M 0 0 C -14 -35, -25 -65, 0 -85 C 25 -65, 14 -35, 0 0 Z";
  const innerPetalPath = "M 0 0 C -10 -25, -18 -48, 0 -65 C 18 -48, 10 -25, 0 0 Z";

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="-100 -100 200 200"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Ambient background glow behind the flower */}
        <circle
          cx="0"
          cy="0"
          r="75"
          fill="var(--accent)"
          className="opacity-5 blur-xl transition-opacity duration-500"
          style={{ opacity: 0.05 + bloomRatio * 0.12 }}
        />

        {/* Outer Petals Layer */}
        {Array.from({ length: outerPetalsCount }).map((_, i) => {
          const angle = (360 / outerPetalsCount) * i;
          return (
            <motion.g
              key={`outer-petal-${i}`}
              animate={
                animate
                  ? {
                      rotate: angle,
                      y: -outerDistance,
                      scale: outerScale,
                    }
                  : undefined
              }
              initial={{ rotate: angle, y: -8, scale: 0.3 }}
              transition={{ type: "spring", stiffness: 60, damping: 15 }}
              style={
                !animate
                  ? {
                      transform: `rotate(${angle}deg) translateY(-${outerDistance}px) scale(${outerScale})`,
                      transformOrigin: "0px 0px",
                    }
                  : { transformOrigin: "0px 0px" }
              }
            >
              <path
                d={petalPath}
                fill="var(--accent)"
                className="opacity-75 transition-colors duration-300"
                style={{
                  fill: i % 2 === 0 ? "var(--accent)" : "var(--accent-hover)",
                  opacity: 0.65 + bloomRatio * 0.25,
                }}
              />
            </motion.g>
          );
        })}

        {/* Inner Petals Layer */}
        {Array.from({ length: innerPetalsCount }).map((_, i) => {
          const angle = (360 / innerPetalsCount) * i + (360 / innerPetalsCount) / 2; // Offset rotation
          return (
            <motion.g
              key={`inner-petal-${i}`}
              animate={
                animate
                  ? {
                      rotate: angle,
                      y: -innerDistance,
                      scale: innerScale,
                    }
                  : undefined
              }
              initial={{ rotate: angle, y: -4, scale: 0.4 }}
              transition={{ type: "spring", stiffness: 80, damping: 12 }}
              style={
                !animate
                  ? {
                      transform: `rotate(${angle}deg) translateY(-${innerDistance}px) scale(${innerScale})`,
                      transformOrigin: "0px 0px",
                    }
                  : { transformOrigin: "0px 0px" }
              }
            >
              <path
                d={innerPetalPath}
                fill="#DC2626"
                className="opacity-90 transition-colors duration-300"
                style={{
                  fill: "var(--accent)",
                  filter: "brightness(1.15)",
                  opacity: 0.8 + bloomRatio * 0.2,
                }}
              />
            </motion.g>
          );
        })}

        {/* Flower Center Disc / Stamens */}
        <motion.g
          animate={animate ? { scale: centerScale } : undefined}
          transition={{ type: "spring", stiffness: 100 }}
          style={!animate ? { transform: `scale(${centerScale})` } : {}}
        >
          {/* Stamens spikes */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (360 / 12) * i;
            return (
              <line
                key={`stamen-${i}`}
                x1="0"
                y1="0"
                x2="0"
                y2="-18"
                stroke="#FBBF24"
                strokeWidth="1.5"
                transform={`rotate(${angle})`}
                opacity={0.7 + bloomRatio * 0.3}
              />
            );
          })}
          {/* Central bud */}
          <circle
            cx="0"
            cy="0"
            r="12"
            fill="#D97706"
            className="stroke-amber-400 stroke-1"
          />
          <circle
            cx="0"
            cy="0"
            r="7"
            fill="#FBBF24"
          />
        </motion.g>
      </svg>
    </div>
  );
};
