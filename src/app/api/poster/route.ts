// =============================================
// Cine AI — Poster enrichment (TMDB)
// =============================================

import { NextResponse } from 'next/server'
import { fetchPosterUrl } from '@/lib/tmdb'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title')
  const year = searchParams.get('year') ?? undefined

  if (!title) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 })
  }

  const posterUrl = await fetchPosterUrl(title, year)
  return NextResponse.json({ posterUrl })
}
