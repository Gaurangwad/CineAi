// =============================================
// Cine AI — Taste-Profile Learner
// ---------------------------------------------
// A lightweight, transparent online preference model that "keeps learning"
// what a user likes. Every time a user prompts, saves to their watchlist, or
// engages with a pick, we extract feature signals (genres, moods, decades)
// and fold them into a per-user TasteProfile using exponential decay so the
// model gently forgets stale taste and tracks where the user is *now*.
//
// Why this instead of a CNN: a convolutional net is designed for spatial data
// (images). User taste is a small, sparse, evolving set of categorical signals
// with very little data per user. An online weighted-feature model learns from
// the very first interaction, never needs a GPU/training job, can't "fail" at
// inference time, is fully explainable ("we leaned into your slow-burn drama
// streak"), and persists trivially. It is the right tool for this job.
// =============================================

import { v4 as uuidv4 } from 'uuid'
import type { CineResponse, MoviePick, TasteProfile } from './types'

/** How strongly past taste is retained each update (0..1). Higher = longer memory. */
const DECAY = 0.92
/** Weight of an explicit "saved to watchlist" signal vs. an implicit prompt signal. */
const SAVE_WEIGHT = 3
const PROMPT_WEIGHT = 1
const PICK_WEIGHT = 1.5

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'for', 'with', 'something', 'movie',
  'film', 'watch', 'want', 'need', 'feel', 'feeling', 'like', 'that', 'this',
  'about', 'really', 'just', 'some', 'into', 'me', 'my', 'i', 'im', 'to', 'of',
  'in', 'on', 'it', 'is', 'am', 'are', 'be', 'recommend', 'give', 'show',
])

/** Curated emotional vocabulary we track as "moods". */
const MOOD_LEXICON = [
  'lonely', 'loneliness', 'melancholy', 'melancholic', 'nostalgic', 'nostalgia',
  'hopeful', 'hope', 'cozy', 'comfort', 'cathartic', 'grief', 'heartbreak',
  'romantic', 'love', 'existential', 'surreal', 'dreamlike', 'tender', 'angry',
  'rage', 'anxious', 'anxiety', 'calm', 'peaceful', 'uplifting', 'bittersweet',
  'dark', 'gritty', 'whimsical', 'playful', 'tense', 'thrilling', 'eerie',
  'haunting', 'wholesome', 'devastating', 'euphoric', 'rebellious', 'quiet',
  'slow', 'meditative', 'epic', 'intimate', 'mysterious', 'wistful',
]

export function createProfile(userId?: string): TasteProfile {
  return {
    userId: userId ?? uuidv4(),
    genres: {},
    moods: {},
    decades: {},
    interactions: 0,
    updatedAt: Date.now(),
  }
}

function bump(map: Record<string, number>, key: string, amount: number) {
  const k = key.trim().toLowerCase()
  if (!k) return
  map[k] = (map[k] ?? 0) + amount
}

/** Apply exponential decay to every weight in a feature map. */
function decayMap(map: Record<string, number>) {
  for (const k of Object.keys(map)) {
    map[k] *= DECAY
    if (map[k] < 0.05) delete map[k] // prune negligible weights
  }
}

function extractMoods(text: string): string[] {
  const lower = text.toLowerCase()
  return MOOD_LEXICON.filter((m) => lower.includes(m))
}

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w))
}

function decadeOf(year?: string): string | null {
  if (!year) return null
  const y = parseInt(year, 10)
  if (Number.isNaN(y)) return null
  return `${Math.floor(y / 10) * 10}s`
}

function splitGenres(genre?: string): string[] {
  if (!genre) return []
  return genre.split(/[,/|]/).map((g) => g.trim()).filter(Boolean)
}

/**
 * Learn from a free-text prompt the user typed (implicit signal about their
 * current emotional state / desired vibe).
 */
export function learnFromPrompt(profile: TasteProfile, prompt: string): TasteProfile {
  const next = structuredClone(profile)
  decayMap(next.moods)
  for (const mood of extractMoods(prompt)) bump(next.moods, mood, PROMPT_WEIGHT)
  for (const kw of extractKeywords(prompt)) bump(next.moods, kw, PROMPT_WEIGHT * 0.4)
  next.interactions += 1
  next.updatedAt = Date.now()
  return next
}

/**
 * Learn from an explicit positive signal: the user saved a film to their
 * watchlist. This is the strongest signal we get.
 */
export function learnFromSave(profile: TasteProfile, pick: Pick<MoviePick, 'genre' | 'year' | 'emotionalVibe'>): TasteProfile {
  const next = structuredClone(profile)
  decayMap(next.genres)
  decayMap(next.decades)
  for (const g of splitGenres(pick.genre)) bump(next.genres, g, SAVE_WEIGHT)
  const dec = decadeOf(pick.year)
  if (dec) bump(next.decades, dec, SAVE_WEIGHT)
  for (const mood of extractMoods(pick.emotionalVibe ?? '')) bump(next.moods, mood, SAVE_WEIGHT)
  next.interactions += 1
  next.updatedAt = Date.now()
  return next
}

/** Learn (weakly) from picks that were surfaced to the user this turn. */
export function learnFromResponse(profile: TasteProfile, res: CineResponse): TasteProfile {
  let next = structuredClone(profile)
  const picks = [res.mainPick, ...(res.alternates ?? [])].filter(Boolean)
  for (const p of picks) {
    for (const g of splitGenres(p.genre)) bump(next.genres, g, PICK_WEIGHT * 0.3)
    for (const mood of extractMoods(p.emotionalVibe ?? '')) bump(next.moods, mood, PICK_WEIGHT * 0.3)
  }
  next.updatedAt = Date.now()
  return next
}

function topN(map: Record<string, number>, n: number): string[] {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k]) => k)
}

/** Cosine-like relevance score of a candidate pick against the learned profile. */
export function scorePick(profile: TasteProfile, pick: MoviePick): number {
  let score = 0
  for (const g of splitGenres(pick.genre)) score += profile.genres[g.toLowerCase()] ?? 0
  for (const mood of extractMoods(pick.emotionalVibe ?? '')) score += profile.moods[mood] ?? 0
  const dec = decadeOf(pick.year)
  if (dec) score += (profile.decades[dec] ?? 0) * 0.5
  return score
}

/** Re-rank alternate picks so the ones closest to learned taste come first. */
export function rerank(profile: TasteProfile, picks: MoviePick[]): MoviePick[] {
  return [...picks].sort((a, b) => scorePick(profile, b) - scorePick(profile, a))
}

/**
 * A short, human-readable summary of the learned taste, injected into the
 * system prompt so the LLM tailors picks. This is how the model "uses" what it
 * has learned. Returns '' for a cold-start user.
 */
export function summarizeTaste(profile: TasteProfile): string {
  if (profile.interactions < 1) return ''
  const genres = topN(profile.genres, 3)
  const moods = topN(profile.moods, 4)
  const decades = topN(profile.decades, 2)
  const parts: string[] = []
  if (genres.length) parts.push(`favored genres: ${genres.join(', ')}`)
  if (moods.length) parts.push(`recurring emotional themes: ${moods.join(', ')}`)
  if (decades.length) parts.push(`eras they gravitate to: ${decades.join(', ')}`)
  if (!parts.length) return ''
  return `LEARNED TASTE PROFILE (from ${profile.interactions} past interactions) — ${parts.join('; ')}. Lean into this taste, but keep surprising them.`
}
