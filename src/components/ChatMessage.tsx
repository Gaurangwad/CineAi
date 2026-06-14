"use client"

import type { ChatMessage as ChatMessageType, MoviePick } from "@/lib/types"
import { MovieCard } from "@/components/MovieCard"

interface ChatMessageProps {
  message: ChatMessageType
  isSaved: (pick: MoviePick) => boolean
  onToggleSave: (pick: MoviePick) => void
}

export function ChatMessage({
  message,
  isSaved,
  onToggleSave,
}: ChatMessageProps) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end animate-slide-up">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-surface2 px-4 py-3 text-sm text-text-primary">
          {message.text}
        </div>
      </div>
    )
  }

  const res = message.response
  if (!res) return null

  return (
    <div className="flex flex-col gap-4 animate-slide-up">
      <div className="flex gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface2 text-gold">
          🎬
        </div>
        <p className="max-w-[85%] pt-1.5 text-sm leading-relaxed text-text-dim">
          {res.intro}
        </p>
      </div>

      <div className="pl-12">
        <MovieCard
          pick={res.mainPick}
          featured
          saved={isSaved(res.mainPick)}
          onToggleSave={onToggleSave}
        />
      </div>

      {res.alternates?.length > 0 && (
        <div className="grid gap-4 pl-12 sm:grid-cols-2">
          {res.alternates.map((alt, i) => (
            <MovieCard
              key={`${alt.title}-${i}`}
              pick={alt}
              saved={isSaved(alt)}
              onToggleSave={onToggleSave}
            />
          ))}
        </div>
      )}

      {res.closingThought && (
        <p className="pl-12 text-sm italic text-text-muted">
          {res.closingThought}
        </p>
      )}
    </div>
  )
}
