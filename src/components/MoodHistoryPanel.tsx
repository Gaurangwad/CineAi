"use client"

import { AnimatePresence, motion } from "framer-motion"
import { History, RotateCcw, X } from "lucide-react"

import type { MoodHistoryEntry } from "@/lib/types"
import { Button } from "@/components/ui/button"

interface MoodHistoryPanelProps {
  open: boolean
  entries: MoodHistoryEntry[]
  onClose: () => void
  onReplay: (prompt: string) => void
}

export function MoodHistoryPanel({
  open,
  entries,
  onClose,
  onReplay,
}: MoodHistoryPanelProps) {
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
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="glass fixed left-0 top-0 z-50 flex h-full w-full max-w-sm flex-col border-r border-surface3"
          >
            <header className="flex items-center justify-between border-b border-surface3 px-5 py-4">
              <h2 className="flex items-center gap-2 font-serif text-lg text-text-primary">
                <History size={18} className="text-gold" /> Mood History
              </h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X size={18} />
              </Button>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              {entries.length === 0 && (
                <p className="pt-10 text-center text-sm text-text-muted">
                  Your past moods and discoveries will appear here.
                </p>
              )}
              {entries.map((entry, i) => (
                <button
                  key={`${entry.createdAt}-${i}`}
                  onClick={() => onReplay(entry.prompt)}
                  className="group flex w-full items-start justify-between gap-3 rounded-xl border border-surface3 bg-surface p-3 text-left transition-colors hover:border-gold/40"
                >
                  <div>
                    <p className="line-clamp-2 text-sm text-text-primary">
                      {entry.prompt}
                    </p>
                    <p className="mt-1 text-xs italic text-text-muted">
                      → {entry.topPick}
                    </p>
                  </div>
                  <RotateCcw
                    size={15}
                    className="mt-1 shrink-0 text-text-muted opacity-0 transition-opacity group-hover:opacity-100"
                  />
                </button>
              ))}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
