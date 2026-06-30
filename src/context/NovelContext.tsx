"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { defaultNovel, NovelData, PageData } from "@/data/defaultNovel";

export interface UserSettings {
  theme: "paper" | "dark" | "midnight";
  fontSize: "small" | "regular" | "large";
  fontFamily: "lora" | "merriweather" | "playfair" | "inter";
  animate: boolean;
}

export interface Bookmark {
  chapterId: string;
  pageId: string;
  timestamp: number;
}

interface NovelContextType {
  novelData: NovelData;
  setNovelData: React.Dispatch<React.SetStateAction<NovelData>>;
  currentChapterIndex: number;
  currentPageIndex: number;
  isBhavamOn: boolean;
  bhavamVolume: number;
  settings: UserSettings;
  bookmarks: Bookmark[];
  isWriterMode: boolean;
  
  // Navigation
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (chapterIdx: number, pageIdx: number) => void;
  goToChapterIntro: (chapterIdx: number) => void;
  
  // Bhavam Audio
  setIsBhavamOn: (val: boolean) => void;
  setBhavamVolume: (val: number) => void;
  
  // Settings
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  
  // Bookmarks
  toggleBookmark: (chapterId: string, pageId: string) => void;
  isPageBookmarked: (chapterId: string, pageId: string) => boolean;
  
  // Progress
  getProgressPercent: () => number;
  getBloomRatio: () => number; // 0 to 1
  
  // Writer Mode
  setIsWriterMode: (val: boolean) => void;
  resetAllData: () => void;
}

const NovelContext = createContext<NovelContextType | undefined>(undefined);

export const NovelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [novelData, setNovelData] = useState<NovelData>(defaultNovel);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isBhavamOn, setIsBhavamOn] = useState(false);
  const [bhavamVolume, setBhavamVolume] = useState(0.5);
  const [isWriterMode, setIsWriterMode] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [settings, setSettings] = useState<UserSettings>({
    theme: "paper",
    fontSize: "regular",
    fontFamily: "lora",
    animate: true,
  });

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const storedNovel = localStorage.getItem("mandara_novel_data");
      if (storedNovel) {
        setNovelData(JSON.parse(storedNovel));
      }

      const storedProgress = localStorage.getItem("mandara_reading_progress");
      if (storedProgress) {
        const { chapterIdx, pageIdx } = JSON.parse(storedProgress);
        setCurrentChapterIndex(chapterIdx);
        setCurrentPageIndex(pageIdx);
      }

      const storedBhavam = localStorage.getItem("mandara_bhavam_enabled");
      if (storedBhavam) {
        setIsBhavamOn(JSON.parse(storedBhavam));
      }

      const storedVolume = localStorage.getItem("mandara_bhavam_volume");
      if (storedVolume) {
        setBhavamVolume(JSON.parse(storedVolume));
      }

      const storedSettings = localStorage.getItem("mandara_settings");
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }

      const storedBookmarks = localStorage.getItem("mandara_bookmarks");
      if (storedBookmarks) {
        setBookmarks(JSON.parse(storedBookmarks));
      }
    } catch (e) {
      console.error("Error loading localStorage data", e);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem("mandara_novel_data", JSON.stringify(novelData));
  }, [novelData]);

  useEffect(() => {
    localStorage.setItem(
      "mandara_reading_progress",
      JSON.stringify({ chapterIdx: currentChapterIndex, pageIdx: currentPageIndex })
    );
  }, [currentChapterIndex, currentPageIndex]);

  useEffect(() => {
    localStorage.setItem("mandara_bhavam_enabled", JSON.stringify(isBhavamOn));
  }, [isBhavamOn]);

  useEffect(() => {
    localStorage.setItem("mandara_bhavam_volume", JSON.stringify(bhavamVolume));
  }, [bhavamVolume]);

  useEffect(() => {
    localStorage.setItem("mandara_settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem("mandara_bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Apply Theme & Font to html element for global styled CSS variables
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove previous classes
    root.classList.remove("theme-paper", "theme-dark", "theme-midnight");
    root.classList.remove("font-lora", "font-merriweather", "font-playfair", "font-inter");
    root.classList.remove("text-sz-small", "text-sz-regular", "text-sz-large");
    
    // Add current classes
    root.classList.add(`theme-${settings.theme}`);
    root.classList.add(`font-${settings.fontFamily}`);
    root.classList.add(`text-sz-${settings.fontSize}`);
  }, [settings]);

  // Actions
  const nextPage = () => {
    const chapter = novelData.chapters[currentChapterIndex];
    if (!chapter) return;

    if (currentPageIndex < chapter.pages.length - 1) {
      setCurrentPageIndex((prev) => prev + 1);
    } else if (currentChapterIndex < novelData.chapters.length - 1) {
      setCurrentChapterIndex((prev) => prev + 1);
      setCurrentPageIndex(0);
    }
  };

  const prevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex((prev) => prev - 1);
    } else if (currentChapterIndex > 0) {
      const prevChapterIndex = currentChapterIndex - 1;
      const prevChapter = novelData.chapters[prevChapterIndex];
      setCurrentChapterIndex(prevChapterIndex);
      setCurrentPageIndex(prevChapter.pages.length - 1);
    }
  };

  const goToPage = (chapterIdx: number, pageIdx: number) => {
    if (chapterIdx >= 0 && chapterIdx < novelData.chapters.length) {
      const chapter = novelData.chapters[chapterIdx];
      if (pageIdx >= 0 && pageIdx < chapter.pages.length) {
        setCurrentChapterIndex(chapterIdx);
        setCurrentPageIndex(pageIdx);
      }
    }
  };

  const goToChapterIntro = (chapterIdx: number) => {
    if (chapterIdx >= 0 && chapterIdx < novelData.chapters.length) {
      setCurrentChapterIndex(chapterIdx);
      setCurrentPageIndex(0);
    }
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const toggleBookmark = (chapterId: string, pageId: string) => {
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.chapterId === chapterId && b.pageId === pageId);
      if (exists) {
        return prev.filter((b) => !(b.chapterId === chapterId && b.pageId === pageId));
      } else {
        return [...prev, { chapterId, pageId, timestamp: Date.now() }];
      }
    });
  };

  const isPageBookmarked = (chapterId: string, pageId: string) => {
    return bookmarks.some((b) => b.chapterId === chapterId && b.pageId === pageId);
  };

  // Progress Calculations
  const getProgressPercent = () => {
    if (!novelData.chapters || novelData.chapters.length === 0) return 0;
    
    // Calculate total pages across all chapters
    let totalPages = 0;
    let completedPages = 0;
    
    for (let c = 0; c < novelData.chapters.length; c++) {
      const pagesCount = novelData.chapters[c].pages.length;
      totalPages += pagesCount;
      
      if (c < currentChapterIndex) {
        completedPages += pagesCount;
      } else if (c === currentChapterIndex) {
        completedPages += currentPageIndex + 1;
      }
    }
    
    if (totalPages === 0) return 0;
    return Math.round((completedPages / totalPages) * 100);
  };

  const getBloomRatio = () => {
    const percent = getProgressPercent();
    return percent / 100; // Value between 0 and 1
  };

  const resetAllData = () => {
    localStorage.removeItem("mandara_novel_data");
    localStorage.removeItem("mandara_reading_progress");
    localStorage.removeItem("mandara_bookmarks");
    setNovelData(defaultNovel);
    setCurrentChapterIndex(0);
    setCurrentPageIndex(0);
    setBookmarks([]);
  };

  return (
    <NovelContext.Provider
      value={{
        novelData,
        setNovelData,
        currentChapterIndex,
        currentPageIndex,
        isBhavamOn,
        bhavamVolume,
        settings,
        bookmarks,
        isWriterMode,
        nextPage,
        prevPage,
        goToPage,
        goToChapterIntro,
        setIsBhavamOn,
        setBhavamVolume,
        updateSettings,
        toggleBookmark,
        isPageBookmarked,
        getProgressPercent,
        getBloomRatio,
        setIsWriterMode,
        resetAllData,
      }}
    >
      {children}
    </NovelContext.Provider>
  );
};

export const useNovel = () => {
  const context = useContext(NovelContext);
  if (context === undefined) {
    throw new Error("useNovel must be used within a NovelProvider");
  }
  return context;
};
