// =============================================
// Cine AI — Taste learner endpoint
// ---------------------------------------------
// Stateless learning service: the client sends its current TasteProfile plus
// new signals (a prompt, a saved film, or a response); the server folds them
// into the profile using the online learner and returns the updated profile
// and a human-readable taste summary. Keeping this server-side means the
// learning logic can later be backed by a real DB without changing the client.
// =============================================

import { NextResponse } from 'next/server'
import {
  createProfile,
  learnFromPrompt,
  learnFromResponse,
  learnFromSave,
  summarizeTaste,
} from '@/lib/taste'
import type { CineResponse, MoviePick, TasteProfile } from '@/lib/types'

export const runtime = 'nodejs'

interface TasteBody {
  profile?: TasteProfile
  signals?: {
    prompt?: string
    saved?: Pick<MoviePick, 'genre' | 'year' | 'emotionalVibe'>
    response?: CineResponse
  }
}

export async function POST(req: Request) {
  let body: TasteBody
  try {
    body = (await req.json()) as TasteBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  let profile = body.profile ?? createProfile()
  const s = body.signals ?? {}

  if (s.prompt) profile = learnFromPrompt(profile, s.prompt)
  if (s.saved) profile = learnFromSave(profile, s.saved)
  if (s.response) profile = learnFromResponse(profile, s.response)

  return NextResponse.json({
    profile,
    tasteSummary: summarizeTaste(profile),
  })
}
