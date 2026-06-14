// =============================================
// Cine AI — localStorage persistence (client only)
// =============================================

import type { MoodHistoryEntry, TasteProfile, WatchlistItem } from './types'
import { createProfile } from './taste'

const WATCHLIST_KEY = 'cineai.watchlist'
const HISTORY_KEY = 'cineai.history'
const TASTE_KEY = 'cineai.taste'

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* quota / privacy mode — ignore */
  }
}

// ---- Watchlist ----

export function getWatchlist(): WatchlistItem[] {
  return read<WatchlistItem[]>(WATCHLIST_KEY, [])
}

export function saveWatchlist(items: WatchlistItem[]) {
  write(WATCHLIST_KEY, items)
}

export function isInWatchlist(title: string, year: string): boolean {
  return getWatchlist().some((w) => w.title === title && w.year === year)
}

// ---- Mood history ----

export function getHistory(): MoodHistoryEntry[] {
  return read<MoodHistoryEntry[]>(HISTORY_KEY, [])
}

export function saveHistory(entries: MoodHistoryEntry[]) {
  write(HISTORY_KEY, entries.slice(0, 50))
}

// ---- Taste profile (the learner's memory) ----

export function getTasteProfile(): TasteProfile {
  const existing = read<TasteProfile | null>(TASTE_KEY, null)
  if (existing && existing.userId) return existing
  const fresh = createProfile()
  write(TASTE_KEY, fresh)
  return fresh
}

export function saveTasteProfile(profile: TasteProfile) {
  write(TASTE_KEY, profile)
}
