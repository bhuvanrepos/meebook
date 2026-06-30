"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Volume2, Sliders, Play, Lock, Eye, BookOpen, Trash2, ArrowRight, ShieldAlert, Users 
} from "lucide-react";
import { useNovel } from "@/context/NovelContext";
import { MandaraLogo } from "./MandaraLogo";
import { SVGIllustrations } from "./CardRenderer";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

// ==========================================
// 1. SETTINGS DRAWER
// ==========================================
export const SettingsDrawer: React.FC<DrawerProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, isBhavamOn, setIsBhavamOn, bhavamVolume, setBhavamVolume, resetAllData, isWriterMode, setIsWriterMode } = useNovel();
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />
          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-[var(--card-bg)] border-t border-[var(--border)] rounded-t-2xl z-50 p-6 overflow-y-auto custom-scrollbar text-[var(--foreground)]"
          >
            <div className="flex justify-between items-center pb-4 border-b border-[var(--border)]">
              <h3 className="text-lg font-bold font-sans tracking-wide flex items-center gap-2">
                <Sliders size={20} className="text-[var(--accent)]" /> Reading settings
              </h3>
              <button onClick={onClose} className="p-1 hover:bg-[var(--border)] rounded-full transition">
                <X size={20} />
              </button>
            </div>

            <div className="py-6 space-y-6">
              {/* Theme Settings */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider opacity-60 font-sans font-bold">Theme</label>
                <div className="grid grid-cols-3 gap-3">
                  {(["paper", "dark", "midnight"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => updateSettings({ theme: t })}
                      className={`py-3 px-2 rounded-lg border text-xs uppercase tracking-widest font-sans font-semibold transition-all ${
                        settings.theme === t
                          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                          : "border-[var(--border)] hover:bg-[var(--border)]"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Family Settings */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider opacity-60 font-sans font-bold">Font Family</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: "lora", name: "Lora (Serif)" },
                    { id: "merriweather", name: "Merriweather" },
                    { id: "playfair", name: "Playfair Display" },
                    { id: "inter", name: "Inter (Sans)" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => updateSettings({ fontFamily: f.id as any })}
                      className={`py-2 px-3 rounded-lg border text-sm text-left transition-all ${
                        settings.fontFamily === f.id
                          ? "border-[var(--accent)] bg-[var(--accent-soft)] font-bold"
                          : "border-[var(--border)] hover:bg-[var(--border)]"
                      }`}
                      style={{ fontFamily: `var(--font-${f.id})` }}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size Settings */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider opacity-60 font-sans font-bold">Font Size</label>
                <div className="grid grid-cols-3 gap-3">
                  {(["small", "regular", "large"] as const).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => updateSettings({ fontSize: sz })}
                      className={`py-2 px-1 rounded-lg border text-sm capitalize transition-all ${
                        settings.fontSize === sz
                          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] font-bold"
                          : "border-[var(--border)] hover:bg-[var(--border)]"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bhavam Ambience Audio Level */}
              <div className="space-y-3 bg-[var(--background)] p-4 rounded-xl border border-[var(--border)]">
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase tracking-wider opacity-60 font-sans font-bold">
                    🌺 Bhavam Volume
                  </span>
                  <button
                    onClick={() => setIsBhavamOn(!isBhavamOn)}
                    className={`text-xs font-bold font-sans px-3 py-1 rounded-full transition ${
                      isBhavamOn 
                        ? "bg-[var(--accent)] text-white" 
                        : "bg-[var(--foreground)]/10 text-[var(--foreground)]/60"
                    }`}
                  >
                    {isBhavamOn ? "ON" : "OFF"}
                  </button>
                </div>
                
                <div className="flex items-center gap-3">
                  <Volume2 size={16} className="text-[var(--accent)]" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={bhavamVolume}
                    onChange={(e) => setBhavamVolume(parseFloat(e.target.value))}
                    disabled={!isBhavamOn}
                    className="flex-1 accent-[var(--accent)] cursor-pointer disabled:opacity-40"
                  />
                  <span className="text-xs font-mono w-8 text-right">
                    {Math.round(bhavamVolume * 100)}%
                  </span>
                </div>
              </div>

              {/* Toggle Transitions */}
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-sans font-semibold">Enable Page Flip Animations</span>
                <button
                  onClick={() => updateSettings({ animate: !settings.animate })}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${
                    settings.animate ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/20"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                      settings.animate ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Hidden Access to Writer Mode */}
              <div className="flex justify-between items-center py-2 border-t border-[var(--border)]/50 pt-4">
                <div>
                  <span className="text-sm font-sans font-semibold block">Writer Mode Dashboard</span>
                  <span className="text-[10px] text-[var(--foreground)]/50 font-sans">
                    Toggle visual content page editor.
                  </span>
                </div>
                <button
                  onClick={() => {
                    setIsWriterMode(!isWriterMode);
                    onClose();
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold font-sans border transition ${
                    isWriterMode
                      ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                      : "border-[var(--border)] hover:bg-[var(--border)]"
                  }`}
                >
                  {isWriterMode ? "Disable" : "Enable"}
                </button>
              </div>

              {/* Reset Data */}
              <div className="pt-4 border-t border-[var(--border)]/50">
                {!showConfirmReset ? (
                  <button
                    onClick={() => setShowConfirmReset(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 border border-red-500/20 text-red-500 rounded-lg text-sm font-semibold font-sans hover:bg-red-500/5 transition"
                  >
                    <Trash2 size={16} /> Reset All Progress
                  </button>
                ) : (
                  <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl space-y-3">
                    <span className="text-xs font-sans font-bold text-red-500 flex items-center gap-1.5 uppercase">
                      <ShieldAlert size={14} /> Are you absolutely sure?
                    </span>
                    <p className="text-xs opacity-80 leading-normal">
                      This will reset your bookmark, progress stats, and any content configurations.
                    </p>
                    <div className="grid grid-cols-2 gap-3.5 pt-1">
                      <button
                        onClick={() => setShowConfirmReset(false)}
                        className="py-2 text-xs font-bold border border-[var(--border)] rounded-lg font-sans"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          resetAllData();
                          setShowConfirmReset(false);
                          onClose();
                        }}
                        className="py-2 text-xs font-bold bg-red-600 text-white rounded-lg font-sans shadow"
                      >
                        Yes, Reset
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ==========================================
// 2. CHAPTERS DRAWER (Card Index)
// ==========================================
export const ChaptersDrawer: React.FC<DrawerProps & { onSelectPage: (cIdx: number, pIdx: number) => void }> = ({
  isOpen,
  onClose,
  onSelectPage,
}) => {
  const { novelData, currentChapterIndex, currentPageIndex } = useNovel();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 max-h-[80vh] bg-[var(--card-bg)] border-t border-[var(--border)] rounded-t-2xl z-50 p-6 overflow-y-auto custom-scrollbar text-[var(--foreground)]"
          >
            <div className="flex justify-between items-center pb-4 border-b border-[var(--border)]">
              <h3 className="text-lg font-bold font-sans tracking-wide flex items-center gap-2">
                <BookOpen size={20} className="text-[var(--accent)]" /> Index & Chapters
              </h3>
              <button onClick={onClose} className="p-1 hover:bg-[var(--border)] rounded-full transition">
                <X size={20} />
              </button>
            </div>

            <div className="py-6 space-y-6">
              {novelData.chapters.map((ch, chIdx) => (
                <div key={ch.id} className="space-y-3">
                  <div className="flex justify-between items-end border-b border-[var(--border)]/30 pb-2">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-[var(--accent)] font-bold">
                        Chapter {ch.number}
                      </span>
                      <h4 className="text-xl font-bold font-playfair">{ch.title}</h4>
                    </div>
                    <span className="text-xs text-[var(--foreground)]/50 font-sans">
                      {ch.pages.length} pages
                    </span>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
                    {ch.pages.map((p, pIdx) => {
                      const isActive = currentChapterIndex === chIdx && currentPageIndex === pIdx;
                      return (
                        <button
                          key={p.id}
                          onClick={() => {
                            onSelectPage(chIdx, pIdx);
                            onClose();
                          }}
                          className={`py-3 rounded-lg border text-xs font-mono font-bold transition-all flex flex-col items-center justify-center ${
                            isActive
                              ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] ring-1 ring-[var(--accent)]/30"
                              : "border-[var(--border)] hover:bg-[var(--border)]"
                          }`}
                        >
                          <span>P.{pIdx + 1}</span>
                          <span className="text-[8px] opacity-40 font-sans uppercase tracking-tighter mt-0.5">
                            {p.type === 'cover' || p.type === 'intro' ? p.type : p.type.split('_')[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ==========================================
// 3. CHARACTERS DRAWER
// ==========================================

// Gorgeous vector charcoal-style hand-drawn outlines of characters
const CharacterSketches: Record<string, React.FC<{ className?: string }>> = {
  bhairav_portrait: ({ className = "" }) => (
    <svg viewBox="0 0 200 240" className={`w-full h-full ${className}`} xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#FDFBF7" />
      {/* Hand-drawn sketch style effect */}
      <g stroke="#3A322C" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.8">
        {/* Face contour */}
        <path d="M70,75 C70,110 75,130 90,145 C105,160 125,160 135,145 C145,130 148,110 148,75" />
        {/* Hair - messy lines */}
        <path d="M 65 75 Q 85 45 110 50 T 145 60 T 152 80" strokeWidth="2.5" />
        <path d="M 68 70 Q 90 52 120 53 T 148 72" />
        <path d="M 60 85 Q 75 60 95 62 T 130 65 T 145 85" />
        <path d="M 64 78 L 60 92 M 150 78 L 154 90" />
        {/* Glasses */}
        <circle cx="95" cy="100" r="16" strokeWidth="2" />
        <circle cx="127" cy="100" r="16" strokeWidth="2" />
        <line x1="111" y1="100" x2="111" y2="100" strokeWidth="2" /> {/* nose bridge */}
        <line x1="79" y1="96" x2="68" y2="98" />
        <line x1="143" y1="96" x2="148" y2="98" />
        {/* Nose */}
        <path d="M111,100 L113,118 L108,122" />
        {/* Lips */}
        <path d="M102,135 Q111,131 120,135" />
        <path d="M105,138 Q111,136 117,138" />
        {/* Clothes neck collar */}
        <path d="M85,165 L65,220 M127,165 L145,220" />
        <path d="M85,165 C95,180 115,180 127,165" />
        <path d="M106,177 L106,220" strokeWidth="1" strokeDasharray="3 3" />
      </g>
      {/* Red Mandara petal tucked behind ear or floating near */}
      <path d="M 148 68 C 153 62, 160 65, 155 74 C 150 83, 145 74, 148 68 Z" fill="var(--accent)" opacity="0.8" />
    </svg>
  ),

  indu_portrait: ({ className = "" }) => (
    <svg viewBox="0 0 200 240" className={`w-full h-full ${className}`} xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#FDFBF7" />
      <g stroke="#3A322C" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.8">
        {/* Face contour */}
        <path d="M68,85 C68,115 72,135 88,148 C104,161 122,161 132,148 C142,135 144,115 144,85" />
        {/* Hair - long soft strokes */}
        <path d="M 64 85 C 55 120 52 160 55 200" strokeWidth="2" />
        <path d="M 146 85 C 155 120 158 160 155 200" strokeWidth="2" />
        <path d="M 66 80 C 80 50 110 45 136 52 C 146 65 146 85 146 85" strokeWidth="2.5" />
        <path d="M 72 70 C 88 56 112 52 132 58" />
        <path d="M 78 85 C 92 82 108 82 122 85" strokeWidth="1" /> {/* Bangs */}
        {/* Eyes (closed/thoughtful look) */}
        <path d="M84,98 Q91,102 96,98" strokeWidth="2" />
        <path d="M116,98 Q121,102 128,98" strokeWidth="2" />
        {/* Eyebrows */}
        <path d="M82,91 Q90,88 98,92" />
        <path d="M114,91 Q122,88 130,92" />
        {/* Nose */}
        <path d="M106,98 Q108,115 104,118" />
        {/* Lips (small warm smile) */}
        <path d="M98,134 Q106,140 114,134" />
        {/* Headphones around neck */}
        <path d="M68,155 Q62,175 75,182 Q85,185 106,178 Q125,185 135,182 Q148,175 142,155" strokeWidth="2.5" />
        <circle cx="68" cy="158" r="8" fill="#FDFBF7" stroke="#3A322C" strokeWidth="2" />
        <circle cx="142" cy="158" r="8" fill="#FDFBF7" stroke="#3A322C" strokeWidth="2" />
        {/* Shoulders */}
        <path d="M58,220 C68,195 82,185 106,185 C128,185 142,195 152,220" />
      </g>
      {/* Falling red Mandara petals near shoulder */}
      <path d="M 52 165 C 57 159, 64 162, 59 171 C 54 180, 49 171, 52 165 Z" fill="var(--accent)" opacity="0.6" />
    </svg>
  ),
};

export const CharactersDrawer: React.FC<DrawerProps> = ({ isOpen, onClose }) => {
  const { novelData } = useNovel();
  const [selectedCharId, setSelectedCharId] = useState(novelData.characters[0]?.id || "");

  const activeChar = novelData.characters.find((c) => c.id === selectedCharId) || novelData.characters[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-[var(--card-bg)] border-t border-[var(--border)] rounded-t-2xl z-50 p-6 overflow-y-auto custom-scrollbar text-[var(--foreground)]"
          >
            <div className="flex justify-between items-center pb-4 border-b border-[var(--border)]">
              <h3 className="text-lg font-bold font-sans tracking-wide flex items-center gap-2">
                <Users size={20} className="text-[var(--accent)]" /> Characters & Cast
              </h3>
              <button onClick={onClose} className="p-1 hover:bg-[var(--border)] rounded-full transition">
                <X size={20} />
              </button>
            </div>

            <div className="py-6 flex flex-col md:flex-row gap-6">
              {/* Characters Tab Menu */}
              <div className="flex md:flex-col gap-2 border-b md:border-b-0 md:border-r border-[var(--border)]/30 pb-3 md:pb-0 md:pr-4 shrink-0">
                {novelData.characters.map((char) => (
                  <button
                    key={char.id}
                    onClick={() => setSelectedCharId(char.id)}
                    className={`flex-1 md:flex-none text-left py-2 px-4 rounded-lg text-sm font-semibold font-sans tracking-wider transition ${
                      selectedCharId === char.id
                        ? "bg-[var(--accent)] text-white shadow-sm"
                        : "hover:bg-[var(--border)] text-[var(--foreground)]/70"
                    }`}
                  >
                    {char.name}
                  </button>
                ))}
              </div>

              {/* Character Details Display */}
              {activeChar && (
                <div className="flex-1 flex flex-col sm:flex-row gap-5 items-center sm:items-start select-text">
                  {/* Portrait Box */}
                  <div className="w-36 h-44 shrink-0 rounded-xl overflow-hidden shadow-premium border border-[var(--border)] relative bg-[var(--background)]">
                    {activeChar.sketch === "bhairav_portrait" ? (
                      <CharacterSketches.bhairav_portrait />
                    ) : activeChar.sketch === "indu_portrait" ? (
                      <CharacterSketches.indu_portrait />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs opacity-40">Sketch</div>
                    )}
                  </div>
                  
                  {/* Bio details */}
                  <div className="space-y-3.5 text-center sm:text-left">
                    <div>
                      <h4 className="text-2xl font-bold font-playfair tracking-wide">{activeChar.name}</h4>
                      <div className="h-0.5 w-10 bg-[var(--accent)] mt-1.5 mx-auto sm:mx-0" />
                    </div>

                    <blockquote className="italic font-lora text-[var(--foreground)]/90 text-sm leading-relaxed relative pl-4 border-l-2 border-[var(--accent)]/30 py-0.5 text-left">
                      &ldquo;{activeChar.quote}&rdquo;
                    </blockquote>

                    <p className="text-xs md:text-sm text-[var(--foreground)]/80 leading-relaxed font-sans text-left">
                      {activeChar.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ==========================================
// 4. ILLUSTRATION GALLERY DRAWER
// ==========================================
export const GalleryDrawer: React.FC<DrawerProps & { onOpenLightbox: (src: string) => void }> = ({
  isOpen,
  onClose,
  onOpenLightbox,
}) => {
  const { novelData, currentChapterIndex, currentPageIndex } = useNovel();

  // A helper function to check if a gallery item is unlocked.
  // Gallery items unlock chapter by chapter. Let's assume we unlock everything inside or preceding our current chapter.
  const isUnlocked = (chapterId: string) => {
    const activeChIndex = novelData.chapters.findIndex(c => c.id === chapterId);
    return currentChapterIndex >= activeChIndex;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-[var(--card-bg)] border-t border-[var(--border)] rounded-t-2xl z-50 p-6 overflow-y-auto custom-scrollbar text-[var(--foreground)]"
          >
            <div className="flex justify-between items-center pb-4 border-b border-[var(--border)]">
              <h3 className="text-lg font-bold font-sans tracking-wide flex items-center gap-2">
                <Lock size={16} className="text-[var(--accent)]" /> Novel Art Gallery
              </h3>
              <button onClick={onClose} className="p-1 hover:bg-[var(--border)] rounded-full transition">
                <X size={20} />
              </button>
            </div>

            <div className="py-6 select-text">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {novelData.gallery.map((item) => {
                  const unlocked = isUnlocked(item.chapterId);
                  
                  // Render matching vector background fallback
                  let VectorImage = SVGIllustrations.cover;
                  if (item.image.includes("metro_window")) {
                    VectorImage = SVGIllustrations.metro;
                  } else if (item.image.includes("coffeecup_rain")) {
                    VectorImage = SVGIllustrations.coffee;
                  } else if (item.image.includes("keyboard_closeup")) {
                    VectorImage = SVGIllustrations.keyboard;
                  }

                  return (
                    <div 
                      key={item.id} 
                      className="group flex flex-col space-y-2 border border-[var(--border)]/40 p-2.5 rounded-xl bg-[var(--background)] shadow-sm"
                    >
                      {/* Image container */}
                      <div className="aspect-[4/5] w-full rounded-lg overflow-hidden border border-[var(--border)] relative bg-[var(--card-bg)]">
                        {unlocked ? (
                          <>
                            <VectorImage className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                            <button
                              onClick={() => {
                                onOpenLightbox(item.image);
                              }}
                              className="absolute inset-0 bg-black/10 hover:bg-black/35 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-white cursor-zoom-in"
                            >
                              <span className="text-xs bg-black/60 px-3 py-1.5 rounded-full flex items-center gap-1 backdrop-blur-sm font-sans tracking-wider font-semibold uppercase">
                                <Eye size={12} /> View Art
                              </span>
                            </button>
                          </>
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-stone-900/90 text-white/50 p-4 text-center">
                            <Lock size={20} className="text-white/30" />
                            <span className="text-[10px] uppercase tracking-wider font-sans font-semibold">Locked</span>
                            <span className="text-[9px] opacity-60 leading-tight">Complete subsequent chapters to unlock.</span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div>
                        <h4 className="text-sm font-bold font-sans truncate">{item.title}</h4>
                        <p className="text-[10px] text-[var(--foreground)]/60 font-sans line-clamp-2 h-7 leading-relaxed mt-0.5">
                          {unlocked ? item.description : "Decrypting story details..."}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
