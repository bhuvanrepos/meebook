"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, ChevronRight, Home, Settings, Users, Image as ImageIcon, Sparkles, BookOpen 
} from "lucide-react";
import { useNovel } from "@/context/NovelContext";
import { CardRenderer } from "./CardRenderer";
import { MandaraLogo } from "./MandaraLogo";

interface ReadingCanvasProps {
  onBackToHome: () => void;
  onOpenSettings: () => void;
  onOpenCharacters: () => void;
  onOpenGallery: () => void;
}

export const ReadingCanvas: React.FC<ReadingCanvasProps> = ({
  onBackToHome,
  onOpenSettings,
  onOpenCharacters,
  onOpenGallery,
}) => {
  const { 
    novelData, 
    currentChapterIndex, 
    currentPageIndex, 
    nextPage, 
    prevPage, 
    getProgressPercent, 
    getBloomRatio,
    settings
  } = useNovel();

  const [slideDirection, setSlideDirection] = useState<"next" | "prev">("next");

  const activeChapter = novelData.chapters[currentChapterIndex];
  if (!activeChapter) return null;

  const activePage = activeChapter.pages[currentPageIndex];
  if (!activePage) return null;

  // Swipe handling constants
  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    const swipe = swipePower(offset.x, velocity.x);

    if (swipe < -swipeConfidenceThreshold || offset.x < -100) {
      setSlideDirection("next");
      nextPage();
    } else if (swipe > swipeConfidenceThreshold || offset.x > 100) {
      setSlideDirection("prev");
      prevPage();
    }
  };

  // Click triggers for left/right tap navigations
  const handleLeftTap = () => {
    setSlideDirection("prev");
    prevPage();
  };

  const handleRightTap = () => {
    setSlideDirection("next");
    nextPage();
  };

  // Slide transition variants for Framer Motion card deck feeling
  const pageVariants = {
    enter: (dir: "next" | "prev") => ({
      x: dir === "next" ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: "next" | "prev") => ({
      x: dir === "next" ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  const pageTransition = {
    type: "spring" as const,
    stiffness: 280,
    damping: 28,
  };

  const progress = getProgressPercent();
  const bloomRatio = getBloomRatio();

  return (
    <div className="fixed inset-0 w-full h-[100dvh] flex flex-col justify-between overflow-hidden bg-[var(--background)] transition-colors duration-500 z-10 select-none">
      
      {/* 1. TOP PROGRESS INDICATOR */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--border)] z-30">
        <motion.div 
          className="h-full bg-[var(--accent)]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* 2. INVISIBLE THUMB-FRIENDLY TAP ZONES FOR SWIPING (Desktop/Mobile overlay) */}
      <div 
        onClick={handleLeftTap}
        className="absolute left-0 top-16 bottom-20 w-[15%] cursor-w-resize z-20 pointer-events-auto"
        title="Previous Page"
      />
      <div 
        onClick={handleRightTap}
        className="absolute right-0 top-16 bottom-20 w-[15%] cursor-e-resize z-20 pointer-events-auto"
        title="Next Page"
      />

      {/* 3. CORE DECK CONTAINER WITH GESTURES */}
      <div className="flex-1 w-full h-full max-w-xl mx-auto flex items-center justify-center relative px-3 py-1">
        <AnimatePresence initial={false} custom={slideDirection} mode="wait">
          <motion.div
            key={`${currentChapterIndex}-${currentPageIndex}`}
            custom={slideDirection}
            variants={settings.animate ? pageVariants : undefined}
            initial="enter"
            animate="center"
            exit="exit"
            transition={pageTransition}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.4}
            onDragEnd={handleDragEnd}
            className="w-full h-full max-h-[85dvh] rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] shadow-premium overflow-hidden touch-pan-y flex flex-col justify-between"
          >
            <CardRenderer page={activePage} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 4. FLOATING THUMB NAVIGATION BUTTONS (Optional fallback indicator) */}
      <div className="absolute top-1/2 -translate-y-1/2 left-2 right-2 flex justify-between pointer-events-none md:flex hidden">
        <button 
          onClick={handleLeftTap}
          className="p-2.5 rounded-full bg-[var(--card-bg)] border border-[var(--border)] text-[var(--foreground)]/60 hover:text-[var(--accent)] pointer-events-auto shadow-md transition"
        >
          <ChevronLeft size={20} />
        </button>
        <button 
          onClick={handleRightTap}
          className="p-2.5 rounded-full bg-[var(--card-bg)] border border-[var(--border)] text-[var(--foreground)]/60 hover:text-[var(--accent)] pointer-events-auto shadow-md transition"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* 5. BOTTOM NAVIGATION BAR: MOBILE CONTROL PANEL */}
      <div className="w-full bg-[var(--card-bg)]/80 backdrop-blur-md border-t border-[var(--border)] px-4 py-3 flex justify-between items-center z-30 select-none pb-safe-bottom">
        {/* Home */}
        <button 
          onClick={onBackToHome}
          className="flex flex-col items-center gap-1 p-1 hover:text-[var(--accent)] text-[var(--foreground)]/70 transition"
        >
          <Home size={18} />
          <span className="text-[10px] font-sans font-semibold uppercase tracking-wider">Home</span>
        </button>

        {/* Characters */}
        <button 
          onClick={onOpenCharacters}
          className="flex flex-col items-center gap-1 p-1 hover:text-[var(--accent)] text-[var(--foreground)]/70 transition"
        >
          <Users size={18} />
          <span className="text-[10px] font-sans font-semibold uppercase tracking-wider">Cast</span>
        </button>

        {/* Dynamic Blooming progress in the middle */}
        <div className="flex flex-col items-center justify-center -translate-y-2 select-none">
          <div className="bg-[var(--background)] p-2 rounded-full border border-[var(--border)] shadow-md relative">
            <MandaraLogo bloomRatio={bloomRatio} size={40} animate={settings.animate} />
          </div>
          <span className="text-[9px] font-mono font-bold text-[var(--accent)] tracking-wider mt-1.5 uppercase">
            {progress}% BLOOM
          </span>
        </div>

        {/* Gallery */}
        <button 
          onClick={onOpenGallery}
          className="flex flex-col items-center gap-1 p-1 hover:text-[var(--accent)] text-[var(--foreground)]/70 transition"
        >
          <ImageIcon size={18} />
          <span className="text-[10px] font-sans font-semibold uppercase tracking-wider">Gallery</span>
        </button>

        {/* Settings */}
        <button 
          onClick={onOpenSettings}
          className="flex flex-col items-center gap-1 p-1 hover:text-[var(--accent)] text-[var(--foreground)]/70 transition"
        >
          <Settings size={18} />
          <span className="text-[10px] font-sans font-semibold uppercase tracking-wider">Settings</span>
        </button>
      </div>

    </div>
  );
};
