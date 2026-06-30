"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Volume2, VolumeX, Bookmark, Check, ZoomIn, ZoomOut, Maximize2, X, ChevronRight, Play 
} from "lucide-react";
import { PageData, DialogueLine } from "@/data/defaultNovel";
import { useNovel } from "@/context/NovelContext";
import { MandaraLogo } from "./MandaraLogo";

// Helper to format dialogues. Finds items inside brackets e.g. ("thought") and wraps in italics
const formatDialogueText = (text: string) => {
  const thoughtRegex = /\(([^)]+)\)/g;
  if (text.match(thoughtRegex)) {
    const parts = text.split(thoughtRegex);
    return parts.map((part, index) => {
      // odd indexes are the matched groups inside parentheses
      if (index % 2 === 1) {
        return <span key={index} className="italic opacity-75 font-light">({part})</span>;
      }
      return part;
    });
  }
  return text;
};

// ==========================================
// 1. STUNNING INLINE SVG GRAPHICS AS FALLBACKS
// ==========================================

export const SVGIllustrations: Record<string, React.FC<{ className?: string }>> = {
  cover: ({ className = "" }) => (
    <svg viewBox="0 0 400 500" className={`w-full h-full object-cover ${className}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="coverGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#B80F0A" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#F5EFEB" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="#F5EFEB" />
      <circle cx="200" cy="220" r="180" fill="url(#coverGlow)" />
      
      {/* Decorative Mandara Flower Mandala pattern */}
      <g transform="translate(200, 220)">
        {Array.from({ length: 8 }).map((_, i) => (
          <path
            key={i}
            d="M 0 0 C -30 -60, -50 -120, 0 -150 C 50 -120, 30 -60, 0 0 Z"
            fill="#B80F0A"
            opacity="0.12"
            transform={`rotate(${(360 / 8) * i})`}
          />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <path
            key={i}
            d="M 0 0 C -20 -40, -35 -80, 0 -100 C 35 -80, 20 -40, 0 0 Z"
            fill="#B80F0A"
            opacity="0.25"
            transform={`rotate(${(360 / 6) * i + 30})`}
          />
        ))}
        <circle cx="0" cy="0" r="25" fill="#9B1C1C" opacity="0.4" />
        <circle cx="0" cy="0" r="10" fill="#B80F0A" />
      </g>

      {/* Frame border */}
      <rect x="20" y="20" width="360" height="460" fill="none" stroke="#B80F0A" strokeWidth="1" strokeOpacity="0.3" rx="4" />
      <rect x="25" y="25" width="350" height="450" fill="none" stroke="#B80F0A" strokeWidth="0.5" strokeOpacity="0.15" rx="2" />
    </svg>
  ),

  metro: ({ className = "" }) => (
    <svg viewBox="0 0 400 500" className={`w-full h-full object-cover ${className}`} xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#E3DDD5" />
      {/* Dark sky behind window */}
      <rect x="50" y="80" width="300" height="280" fill="#1E293B" rx="16" />
      {/* City neon lights inside window */}
      <g opacity="0.45">
        <rect x="70" y="220" width="40" height="140" fill="#F87171" filter="blur(2px)" />
        <rect x="130" y="190" width="60" height="170" fill="#60A5FA" filter="blur(3px)" />
        <rect x="220" y="250" width="35" height="110" fill="#FBBF24" filter="blur(1px)" />
        <rect x="280" y="210" width="50" height="150" fill="#34D399" filter="blur(4px)" />
      </g>
      
      {/* Diagonal rain streaks outside window */}
      <g stroke="#94A3B8" strokeWidth="1.5" opacity="0.6">
        <line x1="80" y1="90" x2="60" y2="130" />
        <line x1="150" y1="110" x2="130" y2="150" />
        <line x1="280" y1="100" x2="260" y2="140" />
        <line x1="210" y1="160" x2="190" y2="200" />
        <line x1="110" y1="240" x2="90" y2="280" />
        <line x1="320" y1="220" x2="300" y2="260" />
        <line x1="250" y1="280" x2="230" y2="320" />
      </g>

      {/* Condensation trails */}
      <path d="M120,80 Q118,150 125,200 Q122,250 120,320" fill="none" stroke="#64748B" strokeWidth="1" opacity="0.4" />
      <path d="M260,80 Q265,180 258,240 Q262,300 260,360" fill="none" stroke="#64748B" strokeWidth="1.5" opacity="0.3" />

      {/* Inner train window frame and glass sheen */}
      <rect x="50" y="80" width="300" height="280" fill="none" stroke="#475569" strokeWidth="14" rx="16" />
      <rect x="55" y="85" width="290" height="270" fill="none" stroke="#94A3B8" strokeWidth="1" rx="12" opacity="0.3" />
      <path d="M60,90 L340,350" stroke="#FFFFFF" strokeWidth="2" opacity="0.08" />

      {/* Passenger seat reflection outline */}
      <path d="M340,360 C320,330 280,310 260,260 C240,210 240,160 260,110" fill="none" stroke="#94A3B8" strokeWidth="1" opacity="0.15" />
    </svg>
  ),

  keyboard: ({ className = "" }) => (
    <svg viewBox="0 0 400 500" className={`w-full h-full object-cover ${className}`} xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#EAE4DC" />
      {/* Keyboard perspective layout */}
      <g fill="#D6CDC4" stroke="#C5BBAE" strokeWidth="1">
        {/* Row 1 */}
        <rect x="40" y="80" width="50" height="50" rx="4" />
        <rect x="100" y="80" width="50" height="50" rx="4" />
        <rect x="160" y="80" width="50" height="50" rx="4" />
        <rect x="220" y="80" width="50" height="50" rx="4" />
        <rect x="280" y="80" width="80" height="50" rx="4" />

        {/* Row 2 */}
        <rect x="30" y="145" width="65" height="50" rx="4" />
        <rect x="105" y="145" width="50" height="50" rx="4" fill="#B80F0A" stroke="#9B1C1C" /> {/* Red highlight key */}
        <rect x="165" y="145" width="50" height="50" rx="4" />
        <rect x="225" y="145" width="50" height="50" rx="4" />
        <rect x="285" y="145" width="85" height="50" rx="4" />

        {/* Row 3 */}
        <rect x="40" y="210" width="70" height="50" rx="4" />
        <rect x="120" y="210" width="50" height="50" rx="4" />
        <rect x="180" y="210" width="50" height="50" rx="4" />
        <rect x="240" y="210" width="50" height="50" rx="4" />
        <rect x="300" y="210" width="60" height="50" rx="4" />
      </g>
      
      {/* Floating letters representing typing */}
      <g fontFamily="var(--font-lora)" fontSize="20" fill="#B80F0A" opacity="0.7">
        <text x="90" y="320" transform="rotate(-15 90 320)">M</text>
        <text x="140" y="300" transform="rotate(10 140 300)">a</text>
        <text x="180" y="330" transform="rotate(-5 180 330)">n</text>
        <text x="220" y="290" transform="rotate(25 220 290)">d</text>
        <text x="260" y="340" transform="rotate(-20 260 340)">a</text>
        <text x="300" y="310" transform="rotate(8 300 310)">r</text>
        <text x="340" y="335" transform="rotate(-12 340 335)">a</text>
      </g>

      <path d="M 60 410 L 340 410" stroke="#B80F0A" strokeWidth="0.75" opacity="0.3" />
    </svg>
  ),

  coffee: ({ className = "" }) => (
    <svg viewBox="0 0 400 500" className={`w-full h-full object-cover ${className}`} xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#EBE4DB" />
      
      {/* Table top texture circle outline */}
      <circle cx="200" cy="450" r="300" fill="none" stroke="#D1C6B8" strokeWidth="1" opacity="0.4" />
      
      {/* Ceramic Saucer */}
      <ellipse cx="200" cy="270" rx="110" ry="40" fill="#DFD7CD" stroke="#CFC4B8" strokeWidth="1" />
      <ellipse cx="200" cy="270" rx="90" ry="30" fill="none" stroke="#CFC4B8" strokeWidth="0.5" strokeDasharray="4 4" />
      
      {/* Coffee Cup body */}
      <ellipse cx="200" cy="250" rx="75" ry="35" fill="#F5EFEB" stroke="#CFC4B8" strokeWidth="1.5" />
      
      {/* Liquid Coffee */}
      <ellipse cx="200" cy="247" rx="68" ry="28" fill="#4A2F1B" />
      {/* Coffee foam/crema */}
      <ellipse cx="195" cy="245" rx="60" ry="22" fill="none" stroke="#C2A888" strokeWidth="2.5" opacity="0.65" strokeDasharray="30 15 45 20" />
      
      {/* Steam rising */}
      <g stroke="#FFFFFF" strokeWidth="2.5" fill="none" opacity="0.3" strokeLinecap="round">
        <path d="M175,190 Q170,160 180,130 T170,80" />
        <path d="M200,195 Q208,165 195,135 T205,85" />
        <path d="M225,190 Q220,165 230,140 T220,95" />
      </g>
      
      {/* Metro Paper Ticket lying next to coffee */}
      <g transform="translate(190, 310) rotate(-22)">
        <rect x="0" y="0" width="130" height="65" fill="#F8F4EC" stroke="#C1B4A5" strokeWidth="1" rx="4" />
        <line x1="12" y1="0" x2="12" y2="65" stroke="#B80F0A" strokeWidth="1.5" strokeDasharray="3 3" />
        <text x="25" y="28" fontFamily="var(--font-inter)" fontSize="10" fontWeight="bold" fill="#786B5E" letterSpacing="1">PRAYAANAM</text>
        <text x="25" y="44" fontFamily="var(--font-inter)" fontSize="8" fill="#998A7A">HYD METRO - TICKET #012</text>
        <circle cx="112" cy="32" r="10" fill="#B80F0A" opacity="0.1" />
        <path d="M109,29 L115,32 L109,35" fill="none" stroke="#B80F0A" strokeWidth="1" />
      </g>
    </svg>
  ),
};

// Component helper to resolve image path to either inline SVG or real img
const CardImage: React.FC<{ src?: string; alt?: string; className?: string }> = ({ src, alt = "", className = "" }) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    if (src?.includes("metro_window")) {
      return <SVGIllustrations.metro className={className} />;
    } else if (src?.includes("keyboard_closeup")) {
      return <SVGIllustrations.keyboard className={className} />;
    } else if (src?.includes("coffeecup_rain") || src?.includes("metro_ticket")) {
      return <SVGIllustrations.coffee className={className} />;
    }
    // Default fallback
    return <SVGIllustrations.cover className={className} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img 
      src={src} 
      alt={alt} 
      className={className} 
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
};

// ==========================================
// 2. SPLIT CONVERSATION ENGINE (SCROLL-SYNC)
// ==========================================

interface SplitConversationProps {
  page: PageData;
  setLightboxImage: (src: string | null) => void;
  isStatic?: boolean;
  activeIdx: number;
  setActiveIdx: (idx: number) => void;
  activeImage: string | undefined;
  setActiveImage: (src: string | undefined) => void;
}

const SplitConversation: React.FC<SplitConversationProps> = ({ 
  page, 
  setLightboxImage, 
  isStatic = false,
  activeIdx,
  setActiveIdx,
  activeImage,
  setActiveImage
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isStatic) return;

    const container = containerRef.current;
    if (!container) return;

    const observerOptions = {
      root: container,
      rootMargin: "-30% 0px -45% 0px", // focus target area centered vertically
      threshold: 0.1,
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      // If we are at the very top of the scroll container, keep the first line active
      if (container.scrollTop < 10) {
        setActiveIdx(0);
        if (page.dialogues && page.dialogues.length > 0) {
          setActiveImage(page.dialogues[0].image || page.image);
        }
        return;
      }

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idxStr = entry.target.getAttribute("data-index");
          if (idxStr !== null) {
            const index = parseInt(idxStr, 10);
            setActiveIdx(index);
            const imgPath = entry.target.getAttribute("data-image");
            if (imgPath) {
              setActiveImage(imgPath);
            }
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);
    const rows = container.querySelectorAll("[data-dialogue-row]");
    rows.forEach((row) => observer.observe(row));

    return () => {
      observer.disconnect();
    };
  }, [page.dialogues, page.image, isStatic, setActiveIdx, setActiveImage]);

  return (
    <div className="flex flex-row h-full w-full overflow-hidden select-text">
      {/* LEFT COLUMN: Sticky Image Window (45%) */}
      <div className="w-[45%] h-full pr-3.5 border-r border-[var(--border)]/15 flex flex-col justify-center items-center relative shrink-0 gap-2 select-none">
        <div 
          onClick={() => activeImage && setLightboxImage(activeImage)}
          className="w-full aspect-[4/5] rounded-xl overflow-hidden border border-[var(--border)] shadow-premium cursor-zoom-in relative bg-[var(--background)]"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeImage || "fallback"}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35 }}
              className="absolute inset-0 w-full h-full"
            >
              <CardImage src={activeImage} className="w-full h-full object-cover" />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-black/5 pointer-events-none" />
        </div>
        {page.enableZoom && (
          <span className="text-[8px] md:text-[9px] text-center text-[var(--foreground)] opacity-40 tracking-wider uppercase font-sans font-bold animate-pulse leading-normal select-none">
            🔍 Click to view full image
          </span>
        )}
      </div>

      {/* RIGHT COLUMN: Scrollable Dialogue Container (55%) */}
      <div 
        ref={containerRef}
        className="w-[55%] h-full overflow-y-auto pl-4 pr-1 custom-scrollbar flex flex-col py-4 gap-7 touch-pan-y"
      >
        {page.dialogues && page.dialogues.map((dlg, idx) => {
          const isBhairav = dlg.speaker.toLowerCase() === "bhairav" || dlg.speaker.toLowerCase() === "bhairava";
          const isIndu = dlg.speaker.toLowerCase() === "indu";
          let nameColor = "text-[var(--foreground)]/80";
          if (isBhairav) nameColor = "text-[var(--accent)] font-semibold";
          if (isIndu) nameColor = "text-amber-600 font-semibold";

          const rowImage = isStatic ? page.image : (dlg.image || page.image);
          const isActive = idx === activeIdx;

          return (
            <div 
              key={idx} 
              data-dialogue-row
              data-index={idx}
              data-image={rowImage}
              onClick={() => {
                setActiveIdx(idx);
                if (rowImage) setActiveImage(rowImage);
              }}
              className={`space-y-1 pl-3.5 py-2 pr-2 scroll-mt-6 transition-all duration-300 cursor-pointer rounded-r-md select-text ${
                isActive 
                  ? "border-l-2 border-[var(--accent)] bg-[var(--accent)]/5 opacity-100 shadow-sm" 
                  : "border-l border-[var(--border)]/15 opacity-40 hover:opacity-75 hover:border-[var(--accent)]/30"
              }`}
            >
              {dlg.speaker && (
                <div className={`text-[10px] uppercase tracking-wider ${nameColor} font-sans`}>
                  {dlg.speaker}
                </div>
              )}
              <div className="text-xs md:text-sm font-lora leading-relaxed text-[var(--foreground)]">
                {dlg.thought ? (
                  <span className="italic opacity-75 font-light">({dlg.text})</span>
                ) : (
                  `"${dlg.text}"`
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// 3. CARD RENDERER DISPATCHER
// ==========================================

interface CardRendererProps {
  page: PageData;
}

export const CardRenderer: React.FC<CardRendererProps> = ({ page }) => {
  const { currentChapterIndex, currentPageIndex, isPageBookmarked, toggleBookmark, isBhavamOn, setIsBhavamOn, novelData } = useNovel();
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState(1);

  const activeChapter = novelData.chapters[currentChapterIndex];
  const isBookmarked = isPageBookmarked(activeChapter.id, page.id);

  // Auto-play / active dialogue highlights
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [activeImage, setActiveImage] = useState<string | undefined>(undefined);
  const longConvoRef = useRef<HTMLDivElement>(null);

  // Reset activeIdx on page change
  useEffect(() => {
    setActiveIdx(0);
    if (page.dialogues && page.dialogues.length > 0) {
      setActiveImage(page.dialogues[0].image || page.image);
    } else {
      setActiveImage(page.image);
    }
  }, [page.id, page.dialogues, page.image]);

  // Reading timer calculator based on word count
  const calculateReadingDuration = (text: string): number => {
    const wordsCount = text.split(/\s+/).filter(w => w.length > 0).length;
    const duration = 2200 + wordsCount * 320;
    return Math.min(8000, Math.max(2500, duration));
  };

  // Timer loop for auto-advance dialogue highlight
  useEffect(() => {
    const isConvo = page.type === "conversation" || 
                    page.type === "long_conversation" || 
                    page.type === "split_conversation_single" || 
                    page.type === "split_conversation_multi";
                    
    if (!isConvo || !page.dialogues || page.dialogues.length === 0) return;
    if (activeIdx >= page.dialogues.length - 1) return;

    const currentText = page.dialogues[activeIdx].text;
    const duration = calculateReadingDuration(currentText);

    const timer = setTimeout(() => {
      setActiveIdx((prev) => {
        const nextIdx = Math.min(page.dialogues!.length - 1, prev + 1);
        const nextImg = page.dialogues![nextIdx].image || page.image;
        if (nextImg) {
          setActiveImage(nextImg);
        }
        return nextIdx;
      });
    }, duration);

    return () => clearTimeout(timer);
  }, [activeIdx, page.id, page.dialogues, page.type, page.image]);

  // IntersectionObserver for long_conversation page type scroll-sync
  useEffect(() => {
    if (page.type !== "long_conversation") return;
    const container = longConvoRef.current;
    if (!container) return;

    const observerOptions = {
      root: container,
      rootMargin: "-30% 0px -45% 0px",
      threshold: 0.1,
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      // If we are at the very top of the scroll container, keep the first line active
      if (container.scrollTop < 10) {
        setActiveIdx(0);
        return;
      }

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idxStr = entry.target.getAttribute("data-index");
          if (idxStr !== null) {
            setActiveIdx(parseInt(idxStr, 10));
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);
    const rows = container.querySelectorAll("[data-dialogue-row]");
    rows.forEach((row) => observer.observe(row));

    return () => observer.disconnect();
  }, [page.type, page.dialogues, page.id]);

  // Layouts
  return (
    <div className="relative w-full h-full flex flex-col justify-between p-6 md:p-8 select-text">
      
      {/* TOP HEADER: Pinned except for cover, intro, and interval pages */}
      {page.type !== "cover" && page.type !== "intro" && page.type !== "interval" && (
        <div className="flex justify-between items-center w-full border-b border-[var(--border)] pb-3 z-10">
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold font-sans">
              Chapter {activeChapter.number}
            </span>
            <span className="text-sm font-medium tracking-wide text-[var(--foreground)] opacity-70">
              {activeChapter.title}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Quick sound feedback indicator */}
            {isBhavamOn && page.audio && page.audio !== 'silence' && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--accent-soft)] rounded-full text-xs font-sans text-[var(--accent)] font-medium border border-[var(--accent)]/10 animate-pulse">
                <Volume2 size={12} className="shrink-0" />
                <span className="capitalize">{page.audio}</span>
              </span>
            )}
            
            {/* Bookmark button */}
            <button 
              onClick={() => toggleBookmark(activeChapter.id, page.id)}
              className="p-2 rounded-full hover:bg-[var(--accent-soft)] text-[var(--foreground)]/60 hover:text-[var(--accent)] transition-all"
              title="Bookmark Page"
            >
              {isBookmarked ? (
                <Bookmark size={18} className="fill-[var(--accent)] text-[var(--accent)]" />
              ) : (
                <Bookmark size={18} />
              )}
            </button>
          </div>
        </div>
      )}

      {/* CORE BODY GRID LAYOUT BY PAGE TYPE */}
      <div className="flex-1 flex flex-col justify-center w-full my-auto overflow-hidden">
        
        {/* COVER PAGE */}
        {page.type === "cover" && (
          <div className="flex flex-col items-center justify-center text-center space-y-6 md:space-y-8 max-w-md mx-auto h-full">
            <div className="w-48 h-64 md:w-56 md:h-72 rounded-lg overflow-hidden shadow-premium border border-[var(--border)] relative group">
              <CardImage src={page.image} alt={page.title} className="w-full h-full object-cover animate-kenburns" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold tracking-wider text-[var(--accent)] font-playfair">
                {page.title}
              </h1>
              <p className="text-xs uppercase tracking-widest text-[var(--foreground)] opacity-60 font-sans">
                {page.subtitle}
              </p>
            </div>
            
            <div className="relative py-2 px-6">
              <span className="absolute top-0 left-0 text-3xl text-[var(--accent)] opacity-20 font-playfair">&ldquo;</span>
              <p className="italic text-base md:text-lg text-[var(--foreground)]/80 font-lora max-w-xs leading-relaxed px-4">
                {page.quote}
              </p>
              <span className="absolute bottom-0 right-0 text-3xl text-[var(--accent)] opacity-20 font-playfair">&rdquo;</span>
            </div>

            <div className="pt-2 animate-bounce">
              <span className="text-xs tracking-widest uppercase opacity-40 font-sans font-semibold flex items-center gap-1.5">
                Tap Right to Begin <ChevronRight size={14} />
              </span>
            </div>
          </div>
        )}

        {/* CHAPTER INTRO PAGE */}
        {page.type === "intro" && (
          <div className="flex flex-col justify-between items-center text-center py-6 h-full max-w-md mx-auto">
            {/* Header branding */}
            <div className="opacity-40 text-xs tracking-widest uppercase font-sans font-bold">
              Mandara Interactive
            </div>

            <div className="space-y-6 my-auto">
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-widest text-[var(--accent)] font-bold font-sans">
                  Chapter {page.chapterNumber}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold font-playfair tracking-wide text-[var(--foreground)]">
                  {page.chapterName}
                </h2>
              </div>

              {/* Location & Time */}
              <div className="flex justify-center items-center gap-4 text-xs font-sans text-[var(--foreground)]/60 font-medium">
                <span className="bg-[var(--card-bg)] px-3 py-1 rounded border border-[var(--border)]">{page.location}</span>
                <span>&bull;</span>
                <span className="bg-[var(--card-bg)] px-3 py-1 rounded border border-[var(--border)]">{page.time}</span>
              </div>

              {/* Short Quote Block */}
              <p className="italic font-lora text-[var(--foreground)]/80 text-base md:text-lg max-w-xs leading-relaxed border-l-2 border-[var(--accent)]/30 pl-4 py-1 text-left mx-auto">
                &ldquo;{page.quote}&rdquo;
              </p>

              {/* Ambient Audio Toggle */}
              <div className="pt-4 flex flex-col items-center gap-3">
                <div className="flex items-center gap-3 bg-[var(--card-bg)] p-3 rounded-full border border-[var(--border)] shadow-sm">
                  <span className="text-sm font-sans font-semibold pl-2 flex items-center gap-1 text-[var(--foreground)]/80">
                    🌺 Bhavam Ambience
                  </span>
                  <button
                    onClick={() => setIsBhavamOn(!isBhavamOn)}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-sans font-bold tracking-wider transition-all duration-300 ${
                      isBhavamOn
                        ? "bg-[var(--accent)] text-white shadow-md shadow-[var(--accent)]/20"
                        : "bg-[var(--foreground)]/10 text-[var(--foreground)]/70 hover:bg-[var(--foreground)]/20"
                    }`}
                  >
                    {isBhavamOn ? (
                      <>
                        <Volume2 size={13} /> ON
                      </>
                    ) : (
                      <>
                        <VolumeX size={13} /> OFF
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-[var(--foreground)]/40 font-sans max-w-xs">
                  Ambience is designed to adapt contextually. Autoplay is disabled. Press ON to unlock auditory immersion.
                </p>
              </div>
            </div>

            <div className="pt-4">
              <span className="text-xs tracking-widest uppercase opacity-40 font-sans font-semibold flex items-center gap-1.5">
                Tap Right to Read <ChevronRight size={14} />
              </span>
            </div>
          </div>
        )}

        {/* CONVERSATION PAGE */}
        {page.type === "conversation" && (
          <div className="space-y-6 md:space-y-8 max-w-lg mx-auto w-full my-auto px-2">
            {page.dialogues && page.dialogues.map((dlg, idx) => {
              const isBhairav = dlg.speaker.toLowerCase() === "bhairav" || dlg.speaker.toLowerCase() === "bhairava";
              const isIndu = dlg.speaker.toLowerCase() === "indu";
              
              let nameColor = "text-[var(--foreground)]/80";
              if (isBhairav) nameColor = "text-[var(--accent)] font-semibold";
              if (isIndu) nameColor = "text-amber-650 font-semibold";
              const isActive = idx === activeIdx;

              return (
                <div 
                  key={idx} 
                  onClick={() => setActiveIdx(idx)}
                  className={`space-y-1.5 pl-4 py-2 pr-2 scroll-mt-6 transition-all duration-350 cursor-pointer rounded-r-md select-text ${
                    isActive 
                      ? "border-l-2 border-[var(--accent)] bg-[var(--accent)]/5 opacity-100 shadow-sm" 
                      : "border-l border-[var(--border)]/15 opacity-40 hover:opacity-75 hover:border-[var(--accent)]/30"
                  }`}
                >
                  <div className={`text-xs uppercase tracking-wider ${nameColor} font-sans`}>
                    {dlg.speaker}
                  </div>
                  <div className="text-[var(--font-size-dialogue)] font-lora leading-relaxed font-normal text-[var(--foreground)] text-[1.15rem]">
                    {dlg.thought ? (
                      <span className="italic opacity-75 font-light">({dlg.text})</span>
                    ) : (
                      `"${dlg.text}"`
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* LONG CONVERSATION PAGE */}
        {page.type === "long_conversation" && (
          <div className="flex flex-col h-full overflow-hidden max-w-lg mx-auto w-full py-4">
            {page.title && (
              <h3 className="text-base font-semibold tracking-wide font-sans mb-3 text-[var(--accent)] border-b border-[var(--border)]/20 pb-2">
                {page.title}
              </h3>
            )}
            <div 
              ref={longConvoRef}
              className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6 py-2 select-text touch-pan-y"
            >
              {page.dialogues && page.dialogues.map((dlg, idx) => {
                const isBhairav = dlg.speaker.toLowerCase() === "bhairav" || dlg.speaker.toLowerCase() === "bhairava";
                const isIndu = dlg.speaker.toLowerCase() === "indu";
                let nameColor = "text-[var(--foreground)]/80";
                if (isBhairav) nameColor = "text-[var(--accent)] font-semibold";
                if (isIndu) nameColor = "text-amber-600 font-semibold";
                const isActive = idx === activeIdx;

                return (
                  <div 
                    key={idx} 
                    data-dialogue-row
                    data-index={idx}
                    onClick={() => setActiveIdx(idx)}
                    className={`space-y-1 pl-4 py-2 pr-2 scroll-mt-6 transition-all duration-350 cursor-pointer rounded-r-md select-text ${
                      isActive 
                        ? "border-l-2 border-[var(--accent)] bg-[var(--accent)]/5 opacity-100 shadow-sm" 
                        : "border-l border-[var(--border)]/15 opacity-40 hover:opacity-75 hover:border-[var(--accent)]/30"
                    }`}
                  >
                    <div className={`text-xs uppercase tracking-wider ${nameColor} font-sans`}>
                      {dlg.speaker}
                    </div>
                    <div className="text-[var(--font-size-dialogue)] font-lora leading-relaxed text-[var(--foreground)] text-[1.125rem]">
                      {dlg.thought ? (
                        <span className="italic opacity-75 font-light">({dlg.text})</span>
                      ) : (
                        `"${dlg.text}"`
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SPLIT SCREEN SCROLL-SYNC CONVERSATION PAGE */}
        {(page.type === "split_conversation" || page.type === "split_conversation_multi") && (
          <div className="flex-1 w-full h-full overflow-hidden my-auto py-2">
            <SplitConversation 
              page={page} 
              setLightboxImage={setLightboxImage} 
              isStatic={false} 
              activeIdx={activeIdx}
              setActiveIdx={setActiveIdx}
              activeImage={activeImage}
              setActiveImage={setActiveImage}
            />
          </div>
        )}

        {/* SPLIT SCREEN STATIC CONVERSATION PAGE */}
        {page.type === "split_conversation_single" && (
          <div className="flex-1 w-full h-full overflow-hidden my-auto py-2">
            <SplitConversation 
              page={page} 
              setLightboxImage={setLightboxImage} 
              isStatic={true} 
              activeIdx={activeIdx}
              setActiveIdx={setActiveIdx}
              activeImage={activeImage}
              setActiveImage={setActiveImage}
            />
          </div>
        )}

        {/* STORY PAGE (NARRATIVE TEXT) */}
        {page.type === "story" && (
          <div className="flex flex-col h-full justify-center overflow-y-auto pr-1 custom-scrollbar max-w-lg mx-auto w-full py-4 select-text">
            <div className="space-y-5 text-justify">
              {page.paragraphs && page.paragraphs.map((para, idx) => (
                <p 
                  key={idx} 
                  className="font-lora text-[var(--font-size-body)] leading-relaxed text-[var(--foreground)]/90 text-[1.125rem] indent-6"
                >
                  {para}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* SINGLE IMAGE PAGE */}
        {page.type === "single_image" && (
          <div className="flex flex-col items-center justify-center w-full h-full p-2 gap-3 select-none">
            <div 
              onClick={() => page.image && setLightboxImage(page.image)}
              className="w-full flex-1 rounded-lg overflow-hidden border border-[var(--border)] shadow-premium cursor-zoom-in relative group min-h-[45dvh]"
            >
              <CardImage src={page.image} className="w-full h-full object-cover animate-kenburns" />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors pointer-events-none" />
              
              <div className="absolute bottom-4 right-4 bg-black/60 text-white p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 size={16} />
              </div>
            </div>
            {page.enableZoom && (
              <span className="text-[10px] text-[var(--foreground)] opacity-50 tracking-wider uppercase font-sans font-bold flex items-center gap-1.5 animate-pulse mt-0.5">
                🔍 Click to view full image
              </span>
            )}
          </div>
        )}

        {/* MULTI IMAGE PAGE (MASONRY GRID) */}
        {page.type === "multi_image" && (
          <div className="w-full h-full flex flex-col justify-center items-center p-2 gap-4 select-none">
            <div className="grid grid-cols-2 gap-4 w-full max-w-md mx-auto">
              {page.images && page.images.map((img, idx) => {
                // If odd number and last element, stretch across 2 columns
                const isLastAndOdd = idx === page.images!.length - 1 && page.images!.length % 2 !== 0;
                return (
                  <div
                    key={idx}
                    onClick={() => setLightboxImage(img)}
                    className={`h-40 md:h-48 rounded-lg overflow-hidden border border-[var(--border)] shadow-sm cursor-zoom-in relative group ${
                      isLastAndOdd ? "col-span-2 h-44 md:h-52" : ""
                    }`}
                  >
                    <CardImage src={img} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors pointer-events-none" />
                  </div>
                );
              })}
            </div>
            {page.enableZoom && (
              <span className="text-[10px] text-[var(--foreground)] opacity-50 tracking-wider uppercase font-sans font-bold flex items-center gap-1.5 animate-pulse mt-1">
                🔍 Click images to view full screen
              </span>
            )}
          </div>
        )}

        {/* QUOTE PAGE */}
        {page.type === "quote" && (
          <div className="flex flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto py-10 my-auto">
            <span className="text-[var(--accent)] font-serif text-5xl opacity-40 leading-none">&ldquo;</span>
            <blockquote className="text-xl md:text-2xl font-serif text-[var(--foreground)] italic tracking-wide leading-relaxed px-6 font-playfair">
              {page.quote}
            </blockquote>
            {page.author && (
              <cite className="text-xs uppercase tracking-widest text-[var(--accent)] not-italic font-bold font-sans">
                — {page.author}
              </cite>
            )}
          </div>
        )}

        {/* INTERVAL PAGE */}
        {page.type === "interval" && (
          <div className="absolute inset-0 bg-stone-950 flex flex-col justify-between items-center text-center p-8 z-20">
            <div className="pt-8 opacity-20 text-[10px] text-white tracking-widest uppercase font-sans font-bold">
              Interval
            </div>

            <div className="space-y-6 my-auto max-w-xs">
              <div className="flex justify-center">
                <MandaraLogo bloomRatio={1.0} size={130} animate={true} />
              </div>
              <p className="text-white/80 italic font-lora text-base md:text-lg leading-relaxed">
                &ldquo;{page.quote}&rdquo;
              </p>
              <div className="h-0.5 w-16 bg-[var(--accent)] mx-auto opacity-50" />
            </div>

            <div className="pb-8">
              <span className="text-xs tracking-widest uppercase text-white/40 font-sans font-semibold flex items-center gap-1.5 animate-pulse">
                Tap Right to Continue <ChevronRight size={14} />
              </span>
            </div>
          </div>
        )}

        {/* ENDING PAGE */}
        {page.type === "ending" && (
          <div className="flex flex-col justify-between items-center text-center py-6 h-full max-w-sm mx-auto">
            <div className="opacity-40 text-xs tracking-widest uppercase font-sans font-bold">
              The End of Part 1
            </div>

            <div className="space-y-6 my-auto bg-[var(--card-bg)] p-6 md:p-8 rounded-lg shadow-premium border border-[var(--border)] relative w-full">
              {/* Journal border pattern lines */}
              <div className="absolute top-0 bottom-0 left-4 w-px bg-red-400/20" />
              <div className="absolute top-0 bottom-0 left-5 w-px bg-red-400/20" />

              <div className="flex justify-center mb-2">
                <MandaraLogo bloomRatio={1.0} size={90} animate={false} />
              </div>
              
              <h3 className="font-playfair text-2xl font-bold text-[var(--foreground)]">
                Prayaanam Completed
              </h3>
              
              <p className="italic text-base text-[var(--foreground)]/80 leading-relaxed font-lora pl-6 pr-2">
                &ldquo;{page.quote}&rdquo;
              </p>

              <div className="h-px bg-[var(--border)] w-2/3 mx-auto" />

              <div className="pt-2">
                <span className="text-xs uppercase tracking-widest font-sans font-bold text-[var(--accent)] block mb-1">
                  Next Volume
                </span>
                <span className="text-sm font-semibold text-[var(--foreground)]">
                  {page.part || "Part 2: Agamanam"}
                </span>
              </div>
            </div>

            <div className="pt-4">
              <span className="text-xs tracking-widest uppercase opacity-40 font-sans font-semibold">
                Thank you for reading Mandara
              </span>
            </div>
          </div>
        )}

      </div>

      {/* FOOTER: Displays progress details and pagination indicators */}
      {page.type !== "cover" && page.type !== "intro" && page.type !== "interval" && (
        <div className="flex justify-between items-center border-t border-[var(--border)] pt-3 text-[10px] font-sans font-medium text-[var(--foreground)]/50 tracking-wider">
          <div>
            PAGE {currentPageIndex + 1} OF {activeChapter.pages.length}
          </div>
          <div>
            CHAPTER {activeChapter.number}
          </div>
        </div>
      )}

      {/* ==========================================
      3. INTERACTIVE IMAGE LIGHTBOX WITH PINCH ZOOM
      ========================================== */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex flex-col justify-between items-center p-4 touch-none"
          >
            {/* Lightbox Header */}
            <div className="w-full flex justify-between items-center text-white/70">
              <span className="text-xs font-sans tracking-widest uppercase">Illustration Lightbox</span>
              <button 
                onClick={() => {
                  setLightboxImage(null);
                  setZoomScale(1);
                }}
                className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Main Interactive Zoom Area */}
            <div className="flex-1 flex items-center justify-center overflow-hidden w-full relative">
              <motion.div 
                animate={{ scale: zoomScale }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className="max-w-full max-h-[75dvh] rounded overflow-hidden select-none"
              >
                <CardImage src={lightboxImage} alt="Fullscreen Illustration" className="max-w-full max-h-[75dvh] object-contain pointer-events-none" />
              </motion.div>
            </div>

            {/* Lightbox Controls */}
            <div className="flex items-center gap-6 bg-white/10 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/10 mb-4">
              <button 
                onClick={() => setZoomScale(prev => Math.max(1, prev - 0.5))}
                disabled={zoomScale <= 1}
                className="p-1.5 hover:bg-white/10 rounded-full text-white disabled:opacity-40"
              >
                <ZoomOut size={18} />
              </button>
              <span className="text-white text-xs font-mono w-12 text-center">
                {Math.round(zoomScale * 100)}%
              </span>
              <button 
                onClick={() => setZoomScale(prev => Math.min(3, prev + 0.5))}
                disabled={zoomScale >= 3}
                className="p-1.5 hover:bg-white/10 rounded-full text-white disabled:opacity-40"
              >
                <ZoomIn size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
