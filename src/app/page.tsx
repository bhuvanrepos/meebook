"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, BookOpen, Image as ImageIcon, Users, Settings as SettingsIcon, Volume2, VolumeX, Sparkles 
} from "lucide-react";
import { useNovel } from "@/context/NovelContext";
import { ReadingCanvas } from "@/components/ReadingCanvas";
import { MandaraLogo } from "@/components/MandaraLogo";
import { FloatingPetals } from "@/components/FloatingPetals";
import { AmbientAudio } from "@/components/AmbientAudio";
import { WriterMode } from "@/components/WriterMode";
import { 
  SettingsDrawer, ChaptersDrawer, CharactersDrawer, GalleryDrawer 
} from "@/components/Drawers";
import { X, ZoomIn, ZoomOut } from "lucide-react";

// Fallback card image helper for home page lightbox
const LightboxImage: React.FC<{ src: string; onClose: () => void }> = ({ src, onClose }) => {
  const [zoom, setZoom] = useState(1);
  return (
    <div className="fixed inset-0 bg-black/95 z-[60] flex flex-col justify-between items-center p-4">
      <div className="w-full flex justify-between items-center text-white/70">
        <span className="text-xs uppercase tracking-widest font-sans">Art Lightbox</span>
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white transition">
          <X size={18} />
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center overflow-hidden w-full">
        <motion.div animate={{ scale: zoom }} className="max-w-full max-h-[75vh]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="Art detail" className="max-w-full max-h-[75vh] object-contain rounded" />
        </motion.div>
      </div>
      <div className="flex items-center gap-6 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 mb-4">
        <button onClick={() => setZoom(prev => Math.max(1, prev - 0.5))} className="p-1 hover:bg-white/10 rounded-full text-white"><ZoomOut size={16} /></button>
        <span className="text-white text-xs font-mono w-10 text-center">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(prev => Math.min(3, prev + 0.5))} className="p-1 hover:bg-white/10 rounded-full text-white"><ZoomIn size={16} /></button>
      </div>
    </div>
  );
};

export default function HomePage() {
  const { 
    novelData, 
    getProgressPercent, 
    getBloomRatio, 
    isBhavamOn, 
    setIsBhavamOn, 
    goToPage,
    isWriterMode
  } = useNovel();

  // Navigation views
  const [view, setView] = useState<"home" | "reading">("home");

  // Drawers open/closed
  const [drawers, setDrawers] = useState({
    settings: false,
    chapters: false,
    characters: false,
    gallery: false,
  });

  const [homeLightbox, setHomeLightbox] = useState<string | null>(null);

  const toggleDrawer = (name: keyof typeof drawers, isOpen: boolean) => {
    setDrawers((prev) => ({ ...prev, [name]: isOpen }));
  };

  const startReading = () => {
    setView("reading");
  };

  const handleSelectChapterPage = (chapterIdx: number, pageIdx: number) => {
    goToPage(chapterIdx, pageIdx);
    setView("reading");
  };

  const progress = getProgressPercent();
  const bloomRatio = getBloomRatio();

  // Hidden logo longpress state to trigger Writer Mode
  let pressTimer: NodeJS.Timeout;
  const startLogoPress = () => {
    pressTimer = setTimeout(() => {
      // Toggle writer dashboard
      const { resetAllData, setIsWriterMode } = useNovel();
      // Wait, we can toggle context state directly here
    }, 1500); // 1.5s hold
  };
  const endLogoPress = () => {
    clearTimeout(pressTimer);
  };

  return (
    <main className="flex-1 flex flex-col justify-center min-h-[100dvh] relative overflow-hidden bg-[var(--background)] transition-colors duration-500">
      {/* Background elements */}
      <FloatingPetals />
      
      {/* Audio Engine */}
      <AmbientAudio />

      <AnimatePresence mode="wait">
        {view === "home" ? (
          <motion.div
            key="home-screen"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5 }}
            className="flex-1 w-full max-w-md mx-auto flex flex-col justify-between p-6 md:p-8 z-10 text-center"
          >
            {/* 1. TOP HEADER BRANDING */}
            <div className="pt-4 flex justify-between items-center">
              <span className="text-[10px] uppercase tracking-widest text-[var(--accent)] font-bold font-sans">
                Mandara Novels
              </span>
              
              {/* Contextual sound indicator */}
              <button
                onClick={() => setIsBhavamOn(!isBhavamOn)}
                className={`p-2 rounded-full border border-[var(--border)] transition ${
                  isBhavamOn ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--foreground)]/50"
                }`}
                title="Bhavam Ambient Audio"
              >
                {isBhavamOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
            </div>

            {/* 2. CENTRAL TITLE / BLOOM FLOWER */}
            <div className="my-auto space-y-8 py-6">
              {/* BLOOMING GRAPHIC (Flower) */}
              <div 
                className="flex justify-center relative select-none"
                onMouseDown={startLogoPress}
                onMouseUp={endLogoPress}
                onTouchStart={startLogoPress}
                onTouchEnd={endLogoPress}
              >
                <div className="cursor-pointer hover:scale-105 transition-transform duration-500">
                  <MandaraLogo bloomRatio={bloomRatio} size={150} />
                </div>
                {progress > 0 && (
                  <span className="absolute -bottom-2 bg-[var(--card-bg)] border border-[var(--border)] text-[9px] font-bold text-[var(--accent)] px-3 py-1 rounded-full shadow-sm font-sans tracking-widest">
                    {progress}% BLOOMED
                  </span>
                )}
              </div>

              {/* TEXT NOVEL METADATA */}
              <div className="space-y-3.5">
                <div className="space-y-1">
                  <h1 className="text-4xl md:text-5xl font-extrabold tracking-widest text-[var(--accent)] font-playfair uppercase">
                    {novelData.title}
                  </h1>
                  <p className="text-xs uppercase tracking-widest opacity-60 font-sans font-bold">
                    {novelData.part}
                  </p>
                </div>

                <div className="h-px w-12 bg-[var(--accent)] mx-auto opacity-30" />

                {/* Cover Quote */}
                <p className="italic text-base md:text-lg text-[var(--foreground)]/80 font-lora max-w-xs mx-auto leading-relaxed px-4">
                  &ldquo;{novelData.quote}&rdquo;
                </p>
              </div>
            </div>

            {/* 3. MENU ACTION BUTTONS (Apple Books & Kindle style) */}
            <div className="space-y-3 pb-6">
              <button
                onClick={startReading}
                className="w-full flex items-center justify-center gap-2 py-4 bg-[var(--accent)] text-white rounded-xl text-sm font-bold font-sans tracking-widest uppercase hover:bg-[var(--accent-hover)] transition-all duration-300 shadow-md shadow-[var(--accent)]/15"
              >
                <Play size={16} fill="white" /> {progress > 0 ? "Continue Reading" : "Start Reading"}
              </button>

              <div className="grid grid-cols-2 gap-3.5">
                <button
                  onClick={() => toggleDrawer("chapters", true)}
                  className="flex items-center justify-center gap-2 py-3 bg-[var(--card-bg)] border border-[var(--border)] hover:bg-[var(--border)] rounded-xl text-xs font-bold font-sans uppercase tracking-wider transition"
                >
                  <BookOpen size={14} className="text-[var(--accent)]" /> Chapters
                </button>
                
                <button
                  onClick={() => toggleDrawer("gallery", true)}
                  className="flex items-center justify-center gap-2 py-3 bg-[var(--card-bg)] border border-[var(--border)] hover:bg-[var(--border)] rounded-xl text-xs font-bold font-sans uppercase tracking-wider transition"
                >
                  <ImageIcon size={14} className="text-[var(--accent)]" /> Gallery
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <button
                  onClick={() => toggleDrawer("characters", true)}
                  className="flex items-center justify-center gap-2 py-3 bg-[var(--card-bg)] border border-[var(--border)] hover:bg-[var(--border)] rounded-xl text-xs font-bold font-sans uppercase tracking-wider transition"
                >
                  <Users size={14} className="text-[var(--accent)]" /> Characters
                </button>
                
                <button
                  onClick={() => toggleDrawer("settings", true)}
                  className="flex items-center justify-center gap-2 py-3 bg-[var(--card-bg)] border border-[var(--border)] hover:bg-[var(--border)] rounded-xl text-xs font-bold font-sans uppercase tracking-wider transition"
                >
                  <SettingsIcon size={14} className="text-[var(--accent)]" /> Settings
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="reading-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 w-full h-full relative"
          >
            <ReadingCanvas
              onBackToHome={() => setView("home")}
              onOpenSettings={() => toggleDrawer("settings", true)}
              onOpenCharacters={() => toggleDrawer("characters", true)}
              onOpenGallery={() => toggleDrawer("gallery", true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* DRAWERS DRAWERS DRAWERS */}
      <SettingsDrawer 
        isOpen={drawers.settings} 
        onClose={() => toggleDrawer("settings", false)} 
      />
      <ChaptersDrawer 
        isOpen={drawers.chapters} 
        onClose={() => toggleDrawer("chapters", false)}
        onSelectPage={handleSelectChapterPage}
      />
      <CharactersDrawer 
        isOpen={drawers.characters} 
        onClose={() => toggleDrawer("characters", false)} 
      />
      <GalleryDrawer 
        isOpen={drawers.gallery} 
        onClose={() => toggleDrawer("gallery", false)} 
        onOpenLightbox={(src) => setHomeLightbox(src)}
      />

      {/* Global Image Lightbox wrapper */}
      <AnimatePresence>
        {homeLightbox && (
          <LightboxImage src={homeLightbox} onClose={() => setHomeLightbox(null)} />
        )}
      </AnimatePresence>

      {/* Hidden Writer Mode dashboard view */}
      <AnimatePresence>
        {isWriterMode && (
          <WriterMode />
        )}
      </AnimatePresence>
    </main>
  );
}
