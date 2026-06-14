"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Bookmark, X } from "lucide-react"

import type { WatchlistItem } from "@/lib/types"
import { Button } from "@/components/ui/button"

interface WatchlistPanelProps {
  open: boolean
  items: WatchlistItem[]
  onClose: () => void
  onRemove: (item: WatchlistItem) => void
}

export function WatchlistPanel({
  open,
  items,
  onClose,
  onRemove,
}: WatchlistPanelProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="glass fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col border-l border-surface3"
          >
            <header className="flex items-center justify-between border-b border-surface3 px-5 py-4">
              <h2 className="flex items-center gap-2 font-serif text-lg text-text-primary">
                <Bookmark size={18} className="text-gold" /> Watchlist
              </h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X size={18} />
              </Button>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              {items.length === 0 && (
                <p className="pt-10 text-center text-sm text-text-muted">
                  Nothing saved yet. Tap the bookmark on any film to keep it.
                </p>
              )}
              {items.map((item) => (
                <div
                  key={`${item.title}-${item.year}`}
                  className="group flex items-start justify-between gap-3 rounded-xl border border-surface3 bg-surface p-3"
                >
                  <div>
                    <p className="font-serif text-sm text-text-primary">
                      {item.title}{" "}
                      <span className="text-text-muted">({item.year})</span>
                    </p>
                    <p className="text-xs text-text-dim">{item.genre}</p>
                    {item.emotionalVibe && (
                      <p className="mt-1 text-xs italic text-text-muted">
                        {item.emotionalVibe}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => onRemove(item)}
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Remove"
                  >
                    <X size={16} className="text-text-muted hover:text-gold" />
                  </button>
                </div>
              ))}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
