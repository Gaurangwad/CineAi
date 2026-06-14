"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import {
  Bookmark,
  BookmarkCheck,
  Clapperboard,
  PlayCircle,
  Quote,
  Star,
} from "lucide-react"
import { motion } from "framer-motion"

import type { MoviePick } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MovieCardProps {
  pick: MoviePick
  featured?: boolean
  saved: boolean
  onToggleSave: (pick: MoviePick) => void
}

const FALLBACK_POSTER =
  "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=500&q=80"

export function MovieCard({
  pick,
  featured = false,
  saved,
  onToggleSave,
}: MovieCardProps) {
  const [poster, setPoster] = useState<string | undefined>(pick.posterUrl)

  useEffect(() => {
    if (poster) return
    let active = true
    const url = `/api/poster?title=${encodeURIComponent(
      pick.title
    )}&year=${encodeURIComponent(pick.year)}`
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        if (active && d?.posterUrl) setPoster(d.posterUrl)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [pick.title, pick.year, poster])

  const trailerSearch = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${pick.title} ${pick.year} trailer`
  )}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-surface3 bg-surface",
        featured ? "md:flex" : "flex flex-col"
      )}
    >
      {/* Poster */}
      <div
        className={cn(
          "relative shrink-0 overflow-hidden bg-surface2",
          featured ? "md:w-56 aspect-[2/3] md:aspect-auto" : "aspect-[2/3]"
        )}
      >
        <Image
          src={poster ?? FALLBACK_POSTER}
          alt={`${pick.title} poster`}
          fill
          sizes="(max-width: 768px) 50vw, 224px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          unoptimized
        />
        {pick.type && (
          <span className="absolute left-3 top-3 rounded-full bg-deep/80 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-gold backdrop-blur">
            {pick.type}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-xl leading-tight text-text-primary">
              {pick.title}{" "}
              <span className="text-text-muted">({pick.year})</span>
            </h3>
            <p className="mt-1 text-sm text-text-dim">
              {[pick.genre, pick.runtime].filter(Boolean).join(" · ")}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label={saved ? "Remove from watchlist" : "Save to watchlist"}
            onClick={() => onToggleSave(pick)}
            className={saved ? "text-gold" : ""}
          >
            {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </Button>
        </div>

        {(pick.imdbRating || pick.rottenTomatoes || pick.director) && (
          <div className="flex flex-wrap items-center gap-3 text-xs text-text-dim">
            {pick.imdbRating && (
              <span className="inline-flex items-center gap-1">
                <Star size={13} className="text-gold" /> {pick.imdbRating}
              </span>
            )}
            {pick.rottenTomatoes && (
              <span className="inline-flex items-center gap-1">
                🍅 {pick.rottenTomatoes}
              </span>
            )}
            {pick.director && (
              <span className="inline-flex items-center gap-1">
                <Clapperboard size={13} /> {pick.director}
              </span>
            )}
          </div>
        )}

        <p className="text-sm leading-relaxed text-text-dim">{pick.synopsis}</p>

        <div className="rounded-xl border border-gold-dim/30 bg-gold/5 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gold">
            Why it fits you
          </p>
          <p className="mt-1 text-sm leading-relaxed text-text-primary">
            {pick.whyItFits}
          </p>
        </div>

        {pick.emotionalVibe && (
          <p className="text-xs italic text-text-muted">
            vibe — {pick.emotionalVibe}
          </p>
        )}

        {pick.famousDialogue && (
          <p className="flex gap-2 text-sm italic text-text-dim">
            <Quote size={14} className="mt-1 shrink-0 text-gold-dim" />
            <span>“{pick.famousDialogue}”</span>
          </p>
        )}

        <div className="mt-auto flex items-center gap-3 pt-2">
          <a href={trailerSearch} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm">
              <PlayCircle size={15} /> Trailer
            </Button>
          </a>
        </div>
      </div>
    </motion.div>
  )
}
