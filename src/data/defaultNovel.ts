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

// Generate templates for Chapters 2 through 40
const generateChapters = (): ChapterData[] => {
  const chaptersList: ChapterData[] = [
    {
      id: "chapter-1",
      number: 1,
      title: "Prayaanam",
      location: "Hyderabad Metro",
      time: "06:30 PM",
      quote: "Every journey begins with a brief silence.",
      pages: [
        {
          id: "p1-1",
          type: "cover",
          audio: "silence",
          title: "MANDARA",
          subtitle: "Part 1: Prayaanam",
          quote: "Prathi Prayanam... Oka Parichayamtho Modalavuthundi.",
          image: "/images/cover_art.png"
        },
        {
          id: "p1-2",
          type: "intro",
          audio: "metro",
          chapterNumber: 1,
          chapterName: "Prayaanam",
          location: "Hyderabad Metro Station",
          time: "06:30 PM",
          quote: "The constant hum of metal and voices. A journey of two souls waiting to connect."
        },
        {
          id: "p1-3",
          type: "split_conversation_single",
          audio: "metro",
          image: "/images/metro_window.png",
          enableZoom: true,
          dialogues: [
            { speaker: "Bhairav", text: "Nuvvu office ki vellava?", image: "/images/metro_window.png" },
            { speaker: "Indu", text: "Almost.", image: "/images/coffeecup_rain.png" },
            { speaker: "Bhairav", text: "Tinnava?", image: "/images/keyboard_closeup.png" },
            { speaker: "Indu", text: "Ledu.", image: "/images/metro_ticket.png" }
          ]
        },
        {
          id: "p1-4",
          type: "single_image",
          audio: "metro",
          image: "/images/metro_window.png"
        },
        {
          id: "p1-5",
          type: "story",
          audio: "rain",
          paragraphs: [
            "The clouds had been threatening all afternoon. As the train slipped past the elevated platforms, heavy rain began to lash against the glass panels, blurring the neon city lights below.",
            "Bhairav looked at Indu. She was staring at her phone, her fingers hovering, lost in thought. A drop of condensation trailed down the window pane, mirroring the quiet sadness in her eyes."
          ]
        },
        {
          id: "p1-6",
          type: "conversation",
          audio: "rain",
          dialogues: [
            { speaker: "Bhairav", text: "Nuvvu ekkada unnava?" },
            { speaker: "Indu", text: "Office." },
            { speaker: "Bhairav", text: "Late avthundha?" },
            { speaker: "Indu", text: "Nenu thanaki cheppala...?", thought: true },
            { speaker: "Indu", text: "Ledu." }
          ]
        },
        {
          id: "p1-7",
          type: "quote",
          audio: "silence",
          quote: "Konni Prayanalu... Manishini Marchesthai.",
          author: "Mandara"
        },
        {
          id: "p1-8",
          type: "multi_image",
          audio: "keyboard",
          images: [
            "/images/keyboard_closeup.png",
            "/images/coffeecup_rain.png",
            "/images/metro_ticket.png"
          ]
        },
        {
          id: "p1-9",
          type: "split_conversation_multi",
          audio: "night",
          title: "Late Night Crossroads",
          image: "/images/call.png",
          enableZoom: true,
          dialogues: [
            { speaker: "Bhairav", text: "Why do we always meet at the edge of the day?", image: "/images/call.png" },
            { speaker: "Indu", text: "Maybe because that's when we stop pretending to be busy.", image: "/images/indu.png" },
            { speaker: "Bhairav", text: "Do you ever think about turning back?", image: "/images/speech.png" },
            { speaker: "Indu", text: "I did. But the tracks only go forward.", image: "/images/indu.png" },
            { speaker: "Bhairav", text: "Nenu endhuku ila feel avthunna...?", thought: true, image: "/images/speech.png" },
            { speaker: "Bhairav", text: "Then let's see where they lead.", image: "/images/call.png" },
            { speaker: "Indu", text: "Even if they lead to nowhere?", image: "/images/indu.png" },
            { speaker: "Bhairav", text: "There is no 'nowhere' when we are travelling together.", image: "/images/speech.png" }
          ]
        },
        {
          id: "p1-10",
          type: "interval",
          audio: "temple",
          quote: "A brief pause before the destination comes into view."
        },
        {
          id: "p1-11",
          type: "ending",
          audio: "wind",
          quote: "And just like that, the first stop was reached. But the journey of Mandara has only begun.",
          part: "Part 2: Agamanam"
        }
      ]
    }
  ];

  // Dynamic titles and locations for template variety
  const locationsList = [
    "Cafe Coffee Day", "Central Park Bench", "Office Library", "Lakeside Walking Path",
    "Rainy Bus Stop", "Corporate High-Rise", "Old City Temple", "Quiet Residential Lane",
    "Cozy Balcony", "Late Night Diner", "Sparsely Filled Elevator", "Art Gallery"
  ];
  
  const audiosList: PageData['audio'][] = [
    "rain", "silence", "wind", "birds", "night", "metro", "temple", "keyboard"
  ];

  for (let chNum = 2; chNum <= 40; chNum++) {
    const loc = locationsList[(chNum - 2) % locationsList.length];
    const chAudio = audiosList[(chNum - 2) % audiosList.length];
    
    chaptersList.push({
      id: `chapter-${chNum}`,
      number: chNum,
      title: `Chapter ${chNum} Title`,
      location: loc,
      time: "07:30 PM",
      quote: "Write chapter quote here...",
      pages: [
        {
          id: `p${chNum}-1`,
          type: "intro",
          audio: chAudio,
          chapterNumber: chNum,
          chapterName: `Chapter ${chNum} Title`,
          location: loc,
          time: "07:30 PM",
          quote: "A short introductory quote describing the emotional setting of this chapter."
        },
        {
          id: `p${chNum}-2`,
          type: "conversation",
          audio: chAudio,
          dialogues: [
            { speaker: "Bhairav", text: "Nuvvu office ki vellava?" },
            { speaker: "Indu", text: "Almost." },
            { speaker: "Bhairav", text: "Write your dialogues here..." },
            { speaker: "Indu", text: "Nenu thanaki cheppala...?", thought: true },
            { speaker: "Indu", text: "Change these dialogues in the code file." }
          ]
        },
        {
          id: `p${chNum}-3`,
          type: "single_image",
          audio: "silence",
          // Refers to a customizable path inside public/images/
          image: `/images/chapter_${chNum}.png`
        }
      ]
    });
  }

  return chaptersList;
};

export const defaultNovel: NovelData = {
  title: "MANDARA",
  part: "Part 1: Prayaanam",
  quote: "Prathi Prayanam... Oka Parichayamtho Modalavuthundi.",
  chapters: generateChapters(),
  characters: [
    {
      id: "bhairav",
      name: "Bhairav",
      quote: "Life is like a train ticket. You pay for the journey, not the destination.",
      description: "A calm, introspective software developer who finds comfort in train rides, city lights, and silent observers. He feels a sudden, unexplainable connection with Indu.",
      sketch: "bhairav_portrait"
    },
    {
      id: "indu",
      name: "Indu",
      quote: "I hide behind my screens, hoping someone will read the unwritten text.",
      description: "A designer running away from familial expectations. Creative yet deeply guarded, she speaks in fragments but holds worlds of unspoken thoughts inside.",
      sketch: "indu_portrait"
    }
  ],
  gallery: [
    {
      id: "gal-cover",
      chapterId: "chapter-1",
      title: "MANDARA Bloom",
      image: "/images/cover_art.png",
      description: "The blooming crimson Mandara flower, representing the birth of a silent bond."
    },
    {
      id: "gal-metro",
      chapterId: "chapter-1",
      title: "Metro Rain Window",
      image: "/images/metro_window.png",
      description: "Neon city lights blurred by rain, seen from inside the Metro."
    },
    {
      id: "gal-details",
      chapterId: "chapter-1",
      title: "Small Connections",
      image: "/images/coffeecup_rain.png",
      description: "Warm coffee cups, train tickets, and late night texts."
    }
  ]
};
