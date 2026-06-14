"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Bookmark, History, Send, Sparkles } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

import type {
  ChatMessage as ChatMessageType,
  CineResponse,
  MoodHistoryEntry,
  MoviePick,
  TasteProfile,
  WatchlistItem,
} from "@/lib/types"
import {
  getHistory,
  getTasteProfile,
  getWatchlist,
  saveHistory,
  saveTasteProfile,
  saveWatchlist,
} from "@/lib/storage"
import {
  learnFromPrompt,
  learnFromResponse,
  learnFromSave,
  rerank,
  summarizeTaste,
} from "@/lib/taste"
import { MOOD_SUGGESTIONS } from "@/lib/prompt"
import { Button } from "@/components/ui/button"
import { ChatMessage } from "@/components/ChatMessage"
import { TypingIndicator } from "@/components/TypingIndicator"
import { WelcomeScreen } from "@/components/WelcomeScreen"
import { WatchlistPanel } from "@/components/WatchlistPanel"
import { MoodHistoryPanel } from "@/components/MoodHistoryPanel"

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => getWatchlist())
  const [history, setHistory] = useState<MoodHistoryEntry[]>(() => getHistory())
  const [taste, setTaste] = useState<TasteProfile | null>(() => getTasteProfile())

  const [watchlistOpen, setWatchlistOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const tar = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to newest message.
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [messages, loading])

  const isSaved = useCallback(
    (pick: MoviePick) =>
      watchlist.some((w) => w.title === pick.title && w.year === pick.year),
    [watchlist]
  )

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim()
      if (!text || loading) return

      setError(null)
      setInput("")

      // 1) Learn from the prompt (implicit taste signal) and persist.
      const base = taste ?? getTasteProfile()
      const afterPrompt = learnFromPrompt(base, text)
      setTaste(afterPrompt)
      saveTasteProfile(afterPrompt)

      const userMsg: ChatMessageType = {
        id: uuidv4(),
        role: "user",
        text,
        createdAt: Date.now(),
      }
      const priorHistory = messages
        .flatMap((m): { role: "user" | "assistant"; content: string }[] =>
          m.role === "user" && m.text
            ? [{ role: "user", content: m.text }]
            : m.role === "assistant" && m.response
              ? [{ role: "assistant", content: JSON.stringify(m.response) }]
              : []
        )
        .slice(-6)

      setMessages((prev) => [...prev, userMsg])
      setLoading(true)

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            history: priorHistory,
            tasteSummary: summarizeTaste(afterPrompt),
          }),
        })

        const data = await res.json()
        if (!res.ok || !data.response) {
          throw new Error(data.error ?? "Something went wrong.")
        }

        const response = data.response as CineResponse

        // 2) Re-rank alternates by what we've learned the user loves.
        response.alternates = rerank(afterPrompt, response.alternates ?? [])

        // 3) Learn (weakly) from what was surfaced and persist.
        const afterResponse = learnFromResponse(afterPrompt, response)
        setTaste(afterResponse)
        saveTasteProfile(afterResponse)

        const assistantMsg: ChatMessageType = {
          id: uuidv4(),
          role: "assistant",
          response,
          createdAt: Date.now(),
        }
        setMessages((prev) => [...prev, assistantMsg])

        // 4) Record mood history.
        const entry: MoodHistoryEntry = {
          prompt: text,
          topPick: `${response.mainPick.title} (${response.mainPick.year})`,
          createdAt: Date.now(),
        }
        setHistory((prev) => {
          const next = [entry, ...prev]
          saveHistory(next)
          return next.slice(0, 50)
        })
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.")
      } finally {
        setLoading(false)
      }
    },
    [loading, messages, taste]
  )

  const toggleSave = useCallback(
    (pick: MoviePick) => {
      setWatchlist((prev) => {
        const exists = prev.some(
          (w) => w.title === pick.title && w.year === pick.year
        )
        let next: WatchlistItem[]
        if (exists) {
          next = prev.filter(
            (w) => !(w.title === pick.title && w.year === pick.year)
          )
        } else {
          next = [
            {
              title: pick.title,
              year: pick.year,
              genre: pick.genre,
              emotionalVibe: pick.emotionalVibe,
              posterUrl: pick.posterUrl,
              savedAt: Date.now(),
            },
            ...prev,
          ]
          // Saving is the strongest taste signal — learn from it.
          setTaste((t) => {
            const learned = learnFromSave(t ?? getTasteProfile(), pick)
            saveTasteProfile(learned)
            return learned
          })
        }
        saveWatchlist(next)
        return next
      })
    },
    []
  )

  const removeFromWatchlist = useCallback((item: WatchlistItem) => {
    setWatchlist((prev) => {
      const next = prev.filter(
        (w) => !(w.title === item.title && w.year === item.year)
      )
      saveWatchlist(next)
      return next
    })
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  const hasConversation = messages.length > 0

  return (
    <div className="flex h-screen flex-col bg-deep">
      {/* Header */}
      <header className="z-20 flex items-center justify-between border-b border-surface3/60 px-4 py-3 backdrop-blur">
        <button
          onClick={() => setHistoryOpen(true)}
          className="flex items-center gap-2 text-text-dim transition-colors hover:text-gold"
        >
          <History size={18} />
          <span className="hidden text-sm sm:inline">History</span>
        </button>

        <div className="flex items-center gap-2 font-serif text-lg text-text-primary">
          <Sparkles size={16} className="text-gold" /> Cine&nbsp;AI
        </div>

        <button
          onClick={() => setWatchlistOpen(true)}
          className="flex items-center gap-2 text-text-dim transition-colors hover:text-gold"
        >
          <span className="hidden text-sm sm:inline">Watchlist</span>
          <span className="relative">
            <Bookmark size={18} />
            {watchlist.length > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-deep">
                {watchlist.length}
              </span>
            )}
          </span>
        </button>
      </header>

      {/* Conversation */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {!hasConversation ? (
          <WelcomeScreen onPick={send} />
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
            {messages.map((m) => (
              <ChatMessage
                key={m.id}
                message={m}
                isSaved={isSaved}
                onToggleSave={toggleSave}
              />
            ))}
            {loading && (
              <div className="pl-1">
                <TypingIndicator />
              </div>
            )}
            {error && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-surface3/60 bg-deep/80 px-4 py-3 backdrop-blur">
        <div className="mx-auto max-w-3xl">
          {/* Mood chips */}
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
            {MOOD_SUGGESTIONS.map((mood) => (
              <button
                key={mood}
                onClick={() => send(mood.replace(/^[^A-Za-z]+/, "").trim())}
                disabled={loading}
                className="shrink-0 rounded-full border border-surface3 bg-surface px-3 py-1.5 text-xs text-text-dim transition-colors hover:border-gold/40 hover:text-gold disabled:opacity-50"
              >
                {mood}
              </button>
            ))}
          </div>

          <div className="flex items-end gap-2 rounded-2xl border border-surface3 bg-surface p-2 focus-within:border-gold/40">
            <textarea
              ref={tar}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Tell me how you feel, or describe the night you're having…"
              className="max-h-40 flex-1 resize-none bg-transparent px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
            />
            <Button
              size="icon"
              aria-label="Send"
              disabled={loading || !input.trim()}
              onClick={() => send(input)}
            >
              <Send size={16} />
            </Button>
          </div>
          <p className="mt-2 text-center text-[11px] text-text-muted">
            Cine AI learns your taste as you go — saves and prompts shape every
            next pick.
          </p>
        </div>
      </div>

      <WatchlistPanel
        open={watchlistOpen}
        items={watchlist}
        onClose={() => setWatchlistOpen(false)}
        onRemove={removeFromWatchlist}
      />
      <MoodHistoryPanel
        open={historyOpen}
        entries={history}
        onClose={() => setHistoryOpen(false)}
        onReplay={(prompt) => {
          setHistoryOpen(false)
          send(prompt)
        }}
      />
    </div>
  )
}
