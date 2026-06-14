// =============================================
// Cine AI — Shared TypeScript interfaces
// =============================================

export interface MoviePick {
  title: string
  year: string
  genre: string
  runtime?: string
  director?: string
  cast?: string[]
  imdbRating?: string
  rottenTomatoes?: string
  synopsis: string
  /** Personalized emotional reasoning for *this* user. */
  whyItFits: string
  /** Short emotional vibe descriptor, e.g. "melancholic, tender". */
  emotionalVibe: string
  /** A famous line of dialogue that resonates. */
  famousDialogue?: string
  /** Label such as "Hidden Gem", "Wildcard", "Main Pick". */
  type?: string
  /** Filled in client-side via the /api/poster route. */
  posterUrl?: string
}

export interface CineResponse {
  /** Empathetic intro that mirrors the user's emotional state. */
  intro: string
  mainPick: MoviePick
  alternates: MoviePick[]
  /** A closing poetic thought. */
  closingThought: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  /** Raw user text (for role==='user'). */
  text?: string
  /** Structured recommendation (for role==='assistant'). */
  response?: CineResponse
  createdAt: number
}

export interface WatchlistItem {
  title: string
  year: string
  genre: string
  emotionalVibe: string
  posterUrl?: string
  savedAt: number
}

export interface MoodHistoryEntry {
  prompt: string
  topPick: string
  createdAt: number
}

// ---- Taste-profile learner ----

/** A learned, evolving model of a single user's film taste. */
export interface TasteProfile {
  /** uuid persisted in localStorage to key the profile. */
  userId: string
  /** Weighted preference for each genre. */
  genres: Record<string, number>
  /** Weighted preference for emotional keywords / moods. */
  moods: Record<string, number>
  /** Weighted preference for decades, e.g. "1990s". */
  decades: Record<string, number>
  /** Number of learning signals absorbed so far. */
  interactions: number
  updatedAt: number
}
