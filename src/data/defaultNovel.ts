import novelJson from "./novelData.json";

export interface DialogueLine {
  speaker: string;
  text: string;
  thought?: boolean;
  image?: string;
}

export interface PageData {
  id: string;
  type: 'cover' | 'intro' | 'conversation' | 'long_conversation' | 'story' | 'single_image' | 'multi_image' | 'quote' | 'interval' | 'ending' | 'split_conversation' | 'split_conversation_single' | 'split_conversation_multi';
  audio?: 'metro' | 'rain' | 'temple' | 'wind' | 'birds' | 'hospital' | 'keyboard' | 'night' | 'silence';
  audioVolume?: number;
  title?: string;
  subtitle?: string;
  quote?: string;
  author?: string;
  chapterNumber?: number;
  chapterName?: string;
  location?: string;
  time?: string;
  dialogues?: DialogueLine[];
  paragraphs?: string[];
  image?: string;
  images?: string[];
  part?: string;
  enableZoom?: boolean;
}

export interface ChapterData {
  id: string;
  number: number;
  title: string;
  location: string;
  time: string;
  quote: string;
  pages: PageData[];
}

export interface CharacterData {
  id: string;
  name: string;
  quote: string;
  description: string;
  sketch: string;
}

export interface GalleryItem {
  id: string;
  chapterId: string;
  title: string;
  image: string;
  description: string;
}

export interface NovelData {
  title: string;
  part: string;
  quote: string;
  chapters: ChapterData[];
  characters: CharacterData[];
  gallery: GalleryItem[];
}

export const defaultNovel: NovelData = novelJson as NovelData;
