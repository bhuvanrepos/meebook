"use client";

import React, { useState } from "react";
import { useNovel } from "@/context/NovelContext";
import { PageData, DialogueLine, ChapterData } from "@/data/defaultNovel";
import { 
  X, Plus, Copy, Trash2, ArrowUp, ArrowDown, Download, Upload, Eye, RefreshCw, FileText, Music, Image as ImageIcon 
} from "lucide-react";

const DEFAULT_CHARACTERS = [
  "Bhairava",
  "Indu",
  "Radha",
  "Kanna",
  "Rudra",
  "Aadya",
  "Rajmouli",
  "writer",
  "Director",
  "Cute Girl"
];

export const WriterMode: React.FC = () => {
  const { novelData, setNovelData, currentChapterIndex, currentPageIndex, goToPage, setIsWriterMode } = useNovel();
  const [selectedChIdx, setSelectedChIdx] = useState(currentChapterIndex);
  const [selectedPgIdx, setSelectedPgIdx] = useState(currentPageIndex);
  const [isSaving, setIsSaving] = useState(false);

  const saveNovelToDisk = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ novelData }),
      });
      const data = await response.json();
      if (data.success) {
        alert("🎉 Novel data successfully saved to local file 'src/data/novelData.json'!\n\nRefresh your page to view your edits.");
      } else {
        alert("❌ Failed to save to local file: " + (data.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("❌ Network/Server error: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const activeChapter = novelData.chapters[selectedChIdx] || novelData.chapters[0];
  const activePage = activeChapter?.pages[selectedPgIdx];

  // ==========================================
  // Novel Mutations
  // ==========================================

  const updateNovelData = (updater: (data: typeof novelData) => void) => {
    setNovelData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      updater(copy);
      return copy;
    });
  };

  // Chapter handlers
  const createChapter = () => {
    updateNovelData((data) => {
      const newNum = data.chapters.length + 1;
      const newCh: ChapterData = {
        id: `chapter-${Date.now()}`,
        number: newNum,
        title: `New Chapter ${newNum}`,
        location: "Unknown",
        time: "12:00 AM",
        quote: "Every story has a beginning.",
        pages: [
          {
            id: `p-${Date.now()}-1`,
            type: "cover",
            title: "Novel Title",
            subtitle: `Part ${newNum}`,
            quote: "Chapter description...",
            audio: "silence"
          }
        ]
      };
      data.chapters.push(newCh);
    });
    setSelectedChIdx(novelData.chapters.length);
    setSelectedPgIdx(0);
  };

  // Page handlers
  const createPage = (type: PageData['type']) => {
    updateNovelData((data) => {
      const pages = data.chapters[selectedChIdx].pages;
      const isDlgType = type === "conversation" || 
                        type === "long_conversation" || 
                        type === "split_conversation" || 
                        type === "split_conversation_single" || 
                        type === "split_conversation_multi";
      const newPage: PageData = {
        id: `p-${Date.now()}`,
        type,
        audio: "silence",
        title: type === "cover" ? "MANDARA" : undefined,
        quote: type === "quote" || type === "interval" || type === "ending" ? "Write quote here..." : undefined,
        dialogues: isDlgType ? [
          { speaker: "Bhairav", text: "Write first line here..." }
        ] : undefined,
        paragraphs: type === "story" ? ["Write narration paragraph here..."] : undefined,
        image: type === "single_image" || type === "split_conversation_single" || type === "split_conversation_multi" ? "/images/metro_window.png" : undefined,
        images: type === "multi_image" ? ["/images/keyboard_closeup.png", "/images/coffeecup_rain.png"] : undefined,
      };
      pages.splice(selectedPgIdx + 1, 0, newPage);
    });
    setSelectedPgIdx(prev => prev + 1);
  };

  const duplicatePage = () => {
    if (!activePage) return;
    updateNovelData((data) => {
      const pages = data.chapters[selectedChIdx].pages;
      const duplicated: PageData = {
        ...JSON.parse(JSON.stringify(activePage)),
        id: `p-${Date.now()}`, // new unique ID
      };
      pages.splice(selectedPgIdx + 1, 0, duplicated);
    });
    setSelectedPgIdx(prev => prev + 1);
  };

  const deletePage = () => {
    if (activeChapter.pages.length <= 1) {
      alert("A chapter must contain at least one page.");
      return;
    }
    const confirm = window.confirm("Are you sure you want to delete this page?");
    if (!confirm) return;

    updateNovelData((data) => {
      data.chapters[selectedChIdx].pages.splice(selectedPgIdx, 1);
    });
    setSelectedPgIdx(prev => Math.max(0, prev - 1));
  };

  const movePage = (direction: 'up' | 'down') => {
    const pages = activeChapter.pages;
    if (direction === 'up' && selectedPgIdx === 0) return;
    if (direction === 'down' && selectedPgIdx === pages.length - 1) return;

    const targetIdx = direction === 'up' ? selectedPgIdx - 1 : selectedPgIdx + 1;

    updateNovelData((data) => {
      const list = data.chapters[selectedChIdx].pages;
      const temp = list[selectedPgIdx];
      list[selectedPgIdx] = list[targetIdx];
      list[targetIdx] = temp;
    });
    setSelectedPgIdx(targetIdx);
  };

  // Editing current active page details
  const updatePageField = (field: keyof PageData, value: any) => {
    updateNovelData((data) => {
      const pg = data.chapters[selectedChIdx].pages[selectedPgIdx];
      if (pg) {
        (pg as any)[field] = value;
      }
    });
  };

  // Dialogue array modifications
  const updateDialogue = (dlgIdx: number, key: keyof DialogueLine, val: any) => {
    updateNovelData((data) => {
      const pg = data.chapters[selectedChIdx].pages[selectedPgIdx];
      if (pg && pg.dialogues && pg.dialogues[dlgIdx]) {
        (pg.dialogues[dlgIdx] as any)[key] = val;
      }
    });
  };

  const addDialogueLine = () => {
    updateNovelData((data) => {
      const pg = data.chapters[selectedChIdx].pages[selectedPgIdx];
      if (pg) {
        if (!pg.dialogues) pg.dialogues = [];
        pg.dialogues.push({ speaker: "", text: "" });
      }
    });
  };

  const removeDialogueLine = (dlgIdx: number) => {
    updateNovelData((data) => {
      const pg = data.chapters[selectedChIdx].pages[selectedPgIdx];
      if (pg && pg.dialogues) {
        pg.dialogues.splice(dlgIdx, 1);
      }
    });
  };

  const moveDialogueLine = (dlgIdx: number, direction: "up" | "down") => {
    updateNovelData((data) => {
      const pg = data.chapters[selectedChIdx].pages[selectedPgIdx];
      if (pg && pg.dialogues) {
        const list = pg.dialogues;
        if (direction === "up" && dlgIdx === 0) return;
        if (direction === "down" && dlgIdx === list.length - 1) return;
        
        const targetIdx = direction === "up" ? dlgIdx - 1 : dlgIdx + 1;
        const temp = list[dlgIdx];
        list[dlgIdx] = list[targetIdx];
        list[targetIdx] = temp;
      }
    });
  };

  // Story paragraphs array modifications
  const updateParagraph = (pIdx: number, val: string) => {
    updateNovelData((data) => {
      const pg = data.chapters[selectedChIdx].pages[selectedPgIdx];
      if (pg && pg.paragraphs) {
        pg.paragraphs[pIdx] = val;
      }
    });
  };

  const addParagraph = () => {
    updateNovelData((data) => {
      const pg = data.chapters[selectedChIdx].pages[selectedPgIdx];
      if (pg) {
        if (!pg.paragraphs) pg.paragraphs = [];
        pg.paragraphs.push("");
      }
    });
  };

  const removeParagraph = (pIdx: number) => {
    updateNovelData((data) => {
      const pg = data.chapters[selectedChIdx].pages[selectedPgIdx];
      if (pg && pg.paragraphs) {
        pg.paragraphs.splice(pIdx, 1);
      }
    });
  };

  // ==========================================
  // Import / Export JSON
  // ==========================================
  
  const exportNovelJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(novelData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${novelData.title.toLowerCase()}_novel.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = e.target.files;
    if (!files || files.length === 0) return;

    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.title && parsed.chapters) {
          setNovelData(parsed);
          alert("Novel structure imported successfully!");
        } else {
          alert("Invalid novel JSON format. Must contain 'title' and 'chapters'.");
        }
      } catch (err) {
        alert("Failed to parse JSON file.");
      }
    };
    fileReader.readAsText(files[0]);
  };

  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-stone-900 text-stone-100 z-50 flex flex-col font-sans select-none md:flex-row">
      
      {/* 1. LEFT SIDEBAR: CARD DECK INDEX & ACTIONS */}
      <div className="w-full md:w-80 border-r border-stone-800 flex flex-col shrink-0 h-1/3 md:h-full">
        {/* Editor Branding */}
        <div className="p-4 border-b border-stone-800 flex justify-between items-center">
          <div>
            <h3 className="font-bold tracking-wider text-rose-500 uppercase text-xs">MANDARA WRITER</h3>
            <span className="text-[10px] text-stone-400">Visual Novel Architect</span>
          </div>
          <button 
            onClick={() => setIsWriterMode(false)}
            className="p-1.5 hover:bg-stone-800 rounded-full transition text-stone-400"
            title="Exit Writer Mode"
          >
            <X size={18} />
          </button>
        </div>

        {/* Chapters selector dropdown */}
        <div className="p-4 border-b border-stone-800 flex items-center gap-2">
          <select 
            value={selectedChIdx}
            onChange={(e) => {
              setSelectedChIdx(parseInt(e.target.value));
              setSelectedPgIdx(0);
            }}
            className="flex-1 bg-stone-800 text-stone-100 border border-stone-700 px-2.5 py-1.5 rounded-lg text-xs"
          >
            {novelData.chapters.map((ch, idx) => (
              <option key={ch.id} value={idx}>
                Chapter {ch.number}: {ch.title}
              </option>
            ))}
          </select>
          <button 
            onClick={createChapter}
            className="p-1.5 bg-rose-600 hover:bg-rose-700 rounded text-white"
            title="Add Chapter"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Pages Deck List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar font-sans">
          <div className="flex justify-between items-center text-[10px] uppercase font-bold text-stone-500 tracking-wider">
            <span>Pages in chapter</span>
            <div className="flex items-center gap-1.5">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    createPage(e.target.value as PageData['type']);
                    e.target.value = ""; // reset
                  }
                }}
                className="bg-stone-800 hover:bg-stone-700 border border-stone-700 text-rose-500 text-[10px] font-sans font-bold py-0.5 px-1.5 rounded cursor-pointer max-w-[85px] outline-none"
                defaultValue=""
              >
                <option value="" disabled>+ Add Page</option>
                <option value="conversation">Conversation</option>
                <option value="long_conversation">Long Conversation</option>
                <option value="split_conversation_single">Split (Single)</option>
                <option value="split_conversation_multi">Split (Multi)</option>
                <option value="story">Story</option>
                <option value="single_image">Single Image</option>
                <option value="multi_image">Multi Image</option>
                <option value="cover">Cover</option>
                <option value="intro">Intro</option>
                <option value="quote">Quote</option>
                <option value="interval">Interval</option>
                <option value="ending">Ending</option>
              </select>
              <span>{activeChapter?.pages.length || 0} Pages</span>
            </div>
          </div>
          
          {activeChapter?.pages.map((p, idx) => {
            const isSelected = selectedPgIdx === idx;
            return (
              <div 
                key={p.id}
                onClick={() => {
                  setSelectedPgIdx(idx);
                  // Preview page instantly in context
                  goToPage(selectedChIdx, idx);
                }}
                className={`p-3 rounded-lg border text-left cursor-pointer transition flex items-center justify-between group ${
                  isSelected 
                    ? "bg-rose-950/40 border-rose-600/60 text-stone-100 shadow"
                    : "bg-stone-800/50 border-stone-800 hover:border-stone-700 text-stone-300"
                }`}
              >
                <div className="flex flex-col gap-0.5 max-w-[80%]">
                  <span className="text-[10px] font-mono opacity-50 uppercase">Page {idx + 1}</span>
                  <span className="text-xs font-semibold truncate capitalize">{p.type.replace('_', ' ')}</span>
                  <span className="text-[9px] text-stone-400 truncate opacity-80">
                    {p.audio !== 'silence' ? `🔊 ${p.audio}` : '🔇 silence'}
                  </span>
                </div>
                
                {/* Micro movement actions */}
                {isSelected && (
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); movePage('up'); }}
                      disabled={idx === 0}
                      className="p-1 hover:bg-stone-800 rounded text-stone-400 disabled:opacity-30"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); movePage('down'); }}
                      disabled={idx === activeChapter.pages.length - 1}
                      className="p-1 hover:bg-stone-800 rounded text-stone-400 disabled:opacity-30"
                    >
                      <ArrowDown size={12} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Global JSON Export / Import buttons */}
        <div className="p-4 border-t border-stone-800 bg-stone-900 grid grid-cols-2 gap-3.5 shrink-0">
          <button
            onClick={exportNovelJSON}
            className="flex items-center justify-center gap-1.5 py-2 px-3 border border-stone-700 hover:bg-stone-800 rounded-lg text-xs font-semibold tracking-wider text-stone-300"
          >
            <Download size={13} /> Export JSON
          </button>
          
          <label className="flex items-center justify-center gap-1.5 py-2 px-3 border border-stone-700 hover:bg-stone-800 rounded-lg text-xs font-semibold tracking-wider text-stone-300 cursor-pointer text-center">
            <Upload size={13} /> Import JSON
            <input 
              type="file" 
              accept=".json" 
              onChange={handleImportJSON} 
              className="hidden" 
            />
          </label>
        </div>
      </div>

      {/* 2. RIGHT SIDEBAR: PAGE CONFIG EDITOR WORKSPACE */}
      <div className="flex-1 flex flex-col h-2/3 md:h-full overflow-hidden">
        
        {/* Editor controls ribbon */}
        <div className="p-4 border-b border-stone-800 bg-stone-900/80 backdrop-blur-md flex justify-between items-center z-10 shrink-0 select-none">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase bg-stone-800 px-2 py-0.5 rounded text-stone-300 font-mono">
              Page {selectedPgIdx + 1}
            </span>
            <span className="text-sm font-bold text-stone-200">Content Config</span>
          </div>

          <div className="flex items-center gap-3 font-sans">
            {/* Local CMS Save Button */}
            <button
              onClick={saveNovelToDisk}
              disabled={isSaving}
              className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded text-xs font-sans font-bold shadow-md transition-all duration-300 ${
                isSaving 
                  ? "bg-stone-850 text-stone-500 cursor-not-allowed border border-stone-800" 
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              {isSaving ? (
                <>
                  <RefreshCw size={12} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <FileText size={12} /> Save to File
                </>
              )}
            </button>
            {/* Quick Template Switcher Dropdown */}
            <select
              value={activePage?.type || "story"}
              onChange={(e) => updatePageField("type", e.target.value)}
              className="bg-stone-800 border border-stone-700 text-stone-100 text-xs py-1 px-2.5 rounded"
            >
              {["cover", "intro", "conversation", "long_conversation", "split_conversation_single", "split_conversation_multi", "story", "single_image", "multi_image", "quote", "interval", "ending"].map((t) => (
                <option key={t} value={t}>
                  {t === "split_conversation_single" 
                    ? "split conversation (one image)" 
                    : t === "split_conversation_multi" 
                    ? "split conversation (multi images)" 
                    : t.replace(/_/g, ' ')}
                </option>
              ))}
            </select>

            <button
              onClick={duplicatePage}
              className="p-1.5 hover:bg-stone-800 rounded text-stone-400 flex items-center gap-1 text-xs font-semibold"
              title="Duplicate Card"
            >
              <Copy size={14} /> Duplicate
            </button>
            <button
              onClick={deletePage}
              className="p-1.5 hover:bg-rose-950/40 rounded text-rose-500 flex items-center gap-1 text-xs font-semibold"
              title="Delete Card"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>

        {/* Input Work Field Container */}
        {activePage ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar select-text bg-stone-900/40">
            
            {/* AMBIENCE SOUND MAPPING */}
            <div className="bg-stone-800/40 border border-stone-800/60 p-4 rounded-xl space-y-3.5">
              <label className="text-xs font-bold uppercase tracking-wider text-rose-500/80 flex items-center gap-1.5 font-sans">
                <Music size={14} /> Page Ambience Sound Track
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  "silence", "metro", "rain", "temple",
                  "wind", "birds", "hospital", "keyboard", "night"
                ].map((track) => (
                  <button
                    key={track}
                    onClick={() => updatePageField("audio", track)}
                    className={`py-2 rounded-lg text-[10px] uppercase font-bold tracking-wider transition ${
                      activePage.audio === track
                        ? "bg-rose-600 text-white shadow-sm"
                        : "bg-stone-800 hover:bg-stone-700 text-stone-400"
                    }`}
                  >
                    {track}
                  </button>
                ))}
              </div>
            </div>

            {/* TEMPLATE CONTENT FORM FIELDS */}

            {/* A. COVER PAGE FIELDS */}
            {activePage.type === "cover" && (
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase text-stone-400 font-bold">Novel Title</label>
                  <input
                    type="text"
                    value={activePage.title || ""}
                    onChange={(e) => updatePageField("title", e.target.value)}
                    className="writer-input bg-stone-800 border-stone-700 text-white"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase text-stone-400 font-bold">Part Subtitle</label>
                  <input
                    type="text"
                    value={activePage.subtitle || ""}
                    onChange={(e) => updatePageField("subtitle", e.target.value)}
                    className="writer-input bg-stone-800 border-stone-700 text-white"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase text-stone-400 font-bold">Cover Quote</label>
                  <textarea
                    value={activePage.quote || ""}
                    onChange={(e) => updatePageField("quote", e.target.value)}
                    rows={2}
                    className="writer-input bg-stone-800 border-stone-700 text-white resize-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase text-stone-400 font-bold flex items-center gap-1">
                    <ImageIcon size={12} /> Image Path
                  </label>
                  <input
                    type="text"
                    value={activePage.image || ""}
                    onChange={(e) => updatePageField("image", e.target.value)}
                    className="writer-input bg-stone-800 border-stone-700 text-white font-mono text-xs"
                    placeholder="/images/cover_art.png"
                  />
                </div>
              </div>
            )}

            {/* B. CHAPTER INTRO PAGE FIELDS */}
            {activePage.type === "intro" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs uppercase text-stone-400 font-bold">Chapter Number</label>
                    <input
                      type="number"
                      value={activePage.chapterNumber || 1}
                      onChange={(e) => updatePageField("chapterNumber", parseInt(e.target.value))}
                      className="writer-input bg-stone-800 border-stone-700 text-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs uppercase text-stone-400 font-bold">Chapter Name</label>
                    <input
                      type="text"
                      value={activePage.chapterName || ""}
                      onChange={(e) => updatePageField("chapterName", e.target.value)}
                      className="writer-input bg-stone-800 border-stone-700 text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs uppercase text-stone-400 font-bold">Location</label>
                    <input
                      type="text"
                      value={activePage.location || ""}
                      onChange={(e) => updatePageField("location", e.target.value)}
                      className="writer-input bg-stone-800 border-stone-700 text-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs uppercase text-stone-400 font-bold">Time Stamp</label>
                    <input
                      type="text"
                      value={activePage.time || ""}
                      onChange={(e) => updatePageField("time", e.target.value)}
                      className="writer-input bg-stone-800 border-stone-700 text-white"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase text-stone-400 font-bold">Intro Quote</label>
                  <textarea
                    value={activePage.quote || ""}
                    onChange={(e) => updatePageField("quote", e.target.value)}
                    rows={2}
                    className="writer-input bg-stone-800 border-stone-700 text-white resize-none"
                  />
                </div>
              </div>
            )}

            {/* C. CONVERSATIONS FIELDS */}
            {(activePage.type === "conversation" || activePage.type === "long_conversation" || activePage.type === "split_conversation" || activePage.type === "split_conversation_single" || activePage.type === "split_conversation_multi") && (
              <div className="space-y-4">
                {activePage.type === "long_conversation" && (
                  <div className="flex flex-col gap-1.5 mb-2">
                    <label className="text-xs uppercase text-stone-400 font-bold">Scene Header Title</label>
                    <input
                      type="text"
                      value={activePage.title || ""}
                      onChange={(e) => updatePageField("title", e.target.value)}
                      className="writer-input bg-stone-800 border-stone-700 text-white"
                      placeholder="e.g. Late Night Conversations"
                    />
                  </div>
                )}

                {(activePage.type === "split_conversation" || activePage.type === "split_conversation_single" || activePage.type === "split_conversation_multi") && (
                  <div className="space-y-3 p-3 bg-stone-900/40 rounded-lg border border-stone-800/80 mb-3">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Page Settings</span>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase text-stone-500 font-bold flex items-center gap-1">
                        <ImageIcon size={10} /> Default Page Image
                      </label>
                      <input
                        type="text"
                        value={activePage.image || ""}
                        onChange={(e) => updatePageField("image", e.target.value)}
                        className="writer-input bg-stone-800 border-stone-700 text-white font-mono text-[10px] py-1"
                        placeholder="Fallback page-level image URL..."
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-1.5">
                      <label className="flex items-center gap-2 text-[10px] uppercase text-stone-400 font-bold cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={!!activePage.enableZoom}
                          onChange={(e) => updatePageField("enableZoom", e.target.checked)}
                          className="accent-rose-600"
                        />
                        🔍 Enable Zoom Hint for Readers
                      </label>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center text-xs text-stone-400 font-bold uppercase pb-1 border-b border-stone-800">
                  <span>Dialogue Block Lines</span>
                  <button
                    onClick={addDialogueLine}
                    className="flex items-center gap-1 px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-sans font-bold"
                  >
                    <Plus size={10} /> Add Line
                  </button>
                </div>

                <div className="space-y-3.5">
                  {activePage.dialogues?.map((dlg, dIdx) => (
                    <div key={dIdx} className="bg-stone-800/30 border border-stone-800 p-3 rounded-lg space-y-2 relative group/line">
                      <div className="flex items-center gap-4">
                        <div className="w-1/3 flex flex-col gap-1">
                          <span className="text-[10px] uppercase font-bold text-stone-500">Speaker</span>
                          <select
                            value={DEFAULT_CHARACTERS.includes(dlg.speaker) ? dlg.speaker : dlg.speaker ? "custom" : ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "custom") {
                                updateDialogue(dIdx, "speaker", "Custom Name");
                              } else {
                                updateDialogue(dIdx, "speaker", val);
                              }
                            }}
                            className="writer-input bg-stone-800 border-stone-700 text-white text-xs py-1 cursor-pointer"
                          >
                            <option value="" disabled>Select character</option>
                            {DEFAULT_CHARACTERS.map((char) => (
                              <option key={char} value={char}>{char}</option>
                            ))}
                            <option value="custom">Custom (Type Name)...</option>
                          </select>
                          {(!DEFAULT_CHARACTERS.includes(dlg.speaker) || dlg.speaker === "Custom Name") && dlg.speaker !== "" && (
                            <input
                              type="text"
                              value={dlg.speaker === "Custom Name" ? "" : dlg.speaker}
                              onChange={(e) => updateDialogue(dIdx, "speaker", e.target.value)}
                              className="writer-input bg-stone-800 border-stone-700 text-white text-xs py-1 mt-1.5"
                              placeholder="Type name..."
                              autoFocus
                            />
                          )}
                        </div>
                        
                        <div className="flex-1 flex flex-col gap-1">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] uppercase font-bold text-stone-500">Dialogue</span>
                            <div className="flex items-center gap-2">
                              {/* Inner Thought Toggle */}
                              <label className="flex items-center gap-1 text-[9px] text-stone-400 font-bold uppercase cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={!!dlg.thought}
                                  onChange={(e) => updateDialogue(dIdx, "thought", e.target.checked)}
                                  className="accent-rose-600"
                                /> Inner Thought
                              </label>

                              <span className="text-stone-700 text-[10px] select-none">|</span>

                              {/* Ordering & Delete Row buttons */}
                              <div className="flex items-center gap-0.5 bg-stone-900/60 p-0.5 rounded border border-stone-850">
                                <button
                                  onClick={() => moveDialogueLine(dIdx, "up")}
                                  disabled={dIdx === 0}
                                  className="p-0.5 hover:bg-stone-800 text-stone-400 hover:text-white rounded disabled:opacity-30 transition"
                                  title="Move Up"
                                >
                                  <ArrowUp size={10} />
                                </button>
                                <button
                                  onClick={() => moveDialogueLine(dIdx, "down")}
                                  disabled={dIdx === (activePage.dialogues?.length || 0) - 1}
                                  className="p-0.5 hover:bg-stone-800 text-stone-400 hover:text-white rounded disabled:opacity-30 transition"
                                  title="Move Down"
                                >
                                  <ArrowDown size={10} />
                                </button>
                                <button
                                  onClick={() => removeDialogueLine(dIdx)}
                                  className="p-0.5 hover:bg-stone-800 text-stone-500 hover:text-red-500 rounded transition ml-0.5 border-l border-stone-800 pl-1"
                                  title="Delete Line"
                                >
                                  <Trash2 size={10} />
                                </button>
                              </div>
                            </div>
                          </div>
                          <input
                            type="text"
                            value={dlg.text}
                            onChange={(e) => updateDialogue(dIdx, "text", e.target.value)}
                            className="writer-input bg-stone-800 border-stone-700 text-white text-xs py-1"
                            placeholder={dlg.thought ? "Enter inner thoughts (will be bracketed italics)" : "Enter speech..."}
                          />
                          {(activePage.type === "split_conversation" || activePage.type === "split_conversation_multi") && (
                            <div className="mt-2 flex flex-col gap-1">
                              <span className="text-[9px] uppercase font-bold text-stone-500 flex items-center gap-1">
                                <ImageIcon size={10} /> Dialogue Illustration Image Path
                              </span>
                              <input
                                type="text"
                                value={dlg.image || ""}
                                onChange={(e) => updateDialogue(dIdx, "image", e.target.value)}
                                className="writer-input bg-stone-800 border-stone-700 text-white text-[10px] py-0.5 font-mono"
                                placeholder="e.g. /images/metro_window.png"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* D. STORY FIELDS */}
            {activePage.type === "story" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs text-stone-400 font-bold uppercase pb-1 border-b border-stone-800">
                  <span>Narration Paragraphs</span>
                  <button
                    onClick={addParagraph}
                    className="flex items-center gap-1 px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-sans font-bold"
                  >
                    <Plus size={10} /> Add Para
                  </button>
                </div>

                <div className="space-y-3.5">
                  {activePage.paragraphs?.map((para, pIdx) => (
                    <div key={pIdx} className="relative group/para">
                      <button
                        onClick={() => removeParagraph(pIdx)}
                        className="absolute right-3 top-3 p-1 hover:bg-stone-800 text-stone-500 hover:text-red-500 rounded transition opacity-0 group-hover/para:opacity-100 z-10"
                        title="Delete Paragraph"
                      >
                        <Trash2 size={12} />
                      </button>

                      <textarea
                        value={para}
                        onChange={(e) => updateParagraph(pIdx, e.target.value)}
                        rows={3}
                        className="writer-input bg-stone-800 border-stone-700 text-white text-xs w-full pr-10"
                        placeholder="Write narrative paragraph..."
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* E. SINGLE IMAGE FIELDS */}
            {activePage.type === "single_image" && (
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase text-stone-400 font-bold flex items-center gap-1">
                    <ImageIcon size={12} /> Image Path URL
                  </label>
                  <input
                    type="text"
                    value={activePage.image || ""}
                    onChange={(e) => updatePageField("image", e.target.value)}
                    className="writer-input bg-stone-800 border-stone-700 text-white font-mono text-xs"
                    placeholder="e.g. /images/metro_window.png"
                  />
                  <span className="text-[9px] text-stone-500 leading-normal">
                    Tip: Enter relative paths (e.g. `/images/...`) or external URLs. Fallback illustrations display if paths are blank.
                  </span>
                  
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-stone-800/40">
                    <label className="flex items-center gap-2 text-xs uppercase text-stone-400 font-bold cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={!!activePage.enableZoom}
                        onChange={(e) => updatePageField("enableZoom", e.target.checked)}
                        className="accent-rose-600"
                      />
                      🔍 Enable Zoom Hint for Readers
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* F. MULTI IMAGE FIELDS */}
            {activePage.type === "multi_image" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs text-stone-400 font-bold uppercase pb-1 border-b border-stone-800">
                  <span>Gallery Images Layout (2, 3 or 4 images)</span>
                  <button
                    onClick={() => {
                      const list = activePage.images ? [...activePage.images] : [];
                      list.push("/images/metro_window.png");
                      updatePageField("images", list);
                    }}
                    disabled={activePage.images && activePage.images.length >= 4}
                    className="flex items-center gap-1 px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-sans font-bold disabled:opacity-30"
                  >
                    <Plus size={10} /> Add Image
                  </button>
                </div>

                <div className="space-y-3">
                  {activePage.images?.map((img, imgIdx) => (
                    <div key={imgIdx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={img}
                        onChange={(e) => {
                          const list = [...activePage.images!];
                          list[imgIdx] = e.target.value;
                          updatePageField("images", list);
                        }}
                        className="writer-input bg-stone-800 border-stone-700 text-white font-mono text-xs flex-1"
                        placeholder="Image URL"
                      />
                      <button
                        onClick={() => {
                          const list = [...activePage.images!];
                          list.splice(imgIdx, 1);
                          updatePageField("images", list);
                        }}
                        className="p-2 bg-stone-800 hover:bg-rose-950/40 text-stone-400 hover:text-red-500 rounded"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-stone-800">
                  <label className="flex items-center gap-2 text-xs uppercase text-stone-400 font-bold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={!!activePage.enableZoom}
                      onChange={(e) => updatePageField("enableZoom", e.target.checked)}
                      className="accent-rose-600"
                    />
                    🔍 Enable Zoom Hint for Readers
                  </label>
                </div>
              </div>
            )}

            {/* G. QUOTE PAGE FIELDS */}
            {activePage.type === "quote" && (
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase text-stone-400 font-bold">Quote Text</label>
                  <textarea
                    value={activePage.quote || ""}
                    onChange={(e) => updatePageField("quote", e.target.value)}
                    rows={3}
                    className="writer-input bg-stone-800 border-stone-700 text-white"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase text-stone-400 font-bold">Author (Optional)</label>
                  <input
                    type="text"
                    value={activePage.author || ""}
                    onChange={(e) => updatePageField("author", e.target.value)}
                    className="writer-input bg-stone-800 border-stone-700 text-white"
                  />
                </div>
              </div>
            )}

            {/* H. INTERVAL PAGE FIELDS */}
            {activePage.type === "interval" && (
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase text-stone-400 font-bold">Transition Quote</label>
                  <textarea
                    value={activePage.quote || ""}
                    onChange={(e) => updatePageField("quote", e.target.value)}
                    rows={3}
                    className="writer-input bg-stone-800 border-stone-700 text-white"
                  />
                </div>
              </div>
            )}

            {/* I. ENDING PAGE FIELDS */}
            {activePage.type === "ending" && (
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase text-stone-400 font-bold">Concluding Ending Quote</label>
                  <textarea
                    value={activePage.quote || ""}
                    onChange={(e) => updatePageField("quote", e.target.value)}
                    rows={3}
                    className="writer-input bg-stone-800 border-stone-700 text-white"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase text-stone-400 font-bold">Proceed To Volume Title</label>
                  <input
                    type="text"
                    value={activePage.part || ""}
                    onChange={(e) => updatePageField("part", e.target.value)}
                    className="writer-input bg-stone-800 border-stone-700 text-white font-sans text-xs"
                    placeholder="Part 2: Agamanam"
                  />
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center opacity-40 text-sm">
            Select or add a page to begin editing details.
          </div>
        )}

        {/* Live Preview confirmation sticker */}
        <div className="p-3 bg-rose-600/10 border-t border-stone-800/80 flex items-center gap-1.5 text-rose-400 text-[10px] font-sans font-bold tracking-wider uppercase shrink-0">
          <RefreshCw size={10} className="animate-spin text-rose-500" />
          <span>Updates are reflected on active reader cards instantly</span>
        </div>
      </div>
    </div>
  );
};
