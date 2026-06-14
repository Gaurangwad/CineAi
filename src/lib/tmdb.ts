// =============================================
// Cine AI — TMDB poster utilities (free, reliable)
// =============================================

const TMDB_BASE = 'https://api.themoviedb.org/3'
const IMG_BASE = 'https://image.tmdb.org/t/p/w500'

/**
 * Look up a poster URL for a movie by title (+ optional year). Uses the public
 * TMDB search endpoint. Returns null on any failure so the UI degrades
 * gracefully to a placeholder.
 */
export async function fetchPosterUrl(
  title: string,
  year?: string
): Promise<string | null> {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY
  if (!apiKey) return null

  try {
    const params = new URLSearchParams({
      api_key: apiKey,
      query: title,
    })
    if (year) params.set('year', year)

    const res = await fetch(`${TMDB_BASE}/search/movie?${params.toString()}`, {
      // cache aggressively — posters don't change
      next: { revalidate: 60 * 60 * 24 },
    })
    if (!res.ok) return null

    const data = await res.json()
    const path = data?.results?.[0]?.poster_path
    return path ? `${IMG_BASE}${path}` : null
  } catch {
    return null
  }
}
