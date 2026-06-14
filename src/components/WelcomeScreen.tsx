"use client"

import { motion } from "framer-motion"

import { useScreenSize } from "@/hooks/use-screen-size"
import { GooeyFilter } from "@/components/ui/gooey-filter"
import { PixelTrail } from "@/components/ui/pixel-trail"
import { WELCOME_SUGGESTIONS } from "@/lib/prompt"

interface WelcomeScreenProps {
  onPick: (prompt: string) => void
}

export function WelcomeScreen({ onPick }: WelcomeScreenProps) {
  const screenSize = useScreenSize()

  return (
    <div className="relative flex min-h-[70vh] w-full flex-col items-center justify-center gap-10 overflow-hidden px-4 py-16 text-center">
      {/* Cinematic backdrop */}
      <img
        src="https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=1600&q=80"
        alt="dim cinema seats"
        className="absolute inset-0 h-full w-full object-cover opacity-25"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-deep/60 via-deep/85 to-deep" />

      {/* Gooey interactive pixel trail — hover the hero to reveal it */}
      <GooeyFilter id="gooey-filter-pixel-trail" strength={5} />
      <div
        className="absolute inset-0 z-0"
        style={{ filter: "url(#gooey-filter-pixel-trail)" }}
      >
        <PixelTrail
          pixelSize={screenSize.lessThan("md") ? 24 : 36}
          fadeDuration={0}
          delay={420}
          pixelClassName="bg-gold/70"
        />
      </div>

      {/* Hero copy */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-full border border-gold/30 bg-deep/50 px-4 py-1 text-xs uppercase tracking-[0.2em] text-gold backdrop-blur"
        >
          Cine AI
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="font-serif text-5xl font-normal leading-tight text-text-primary text-balance sm:text-6xl md:text-7xl"
        >
          Tell me how you <span className="gold-gradient italic">feel.</span>
          <br className="hidden sm:block" /> I’ll find the film.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="max-w-xl text-base leading-relaxed text-text-dim text-balance"
        >
          Not a search engine — a cinephile that reads your mood, your 3am
          thoughts, your soul, and answers with movies that meet you exactly
          where you are.
        </motion.p>
      </div>

      {/* Suggestion tiles */}
      <div className="relative z-10 grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3">
        {WELCOME_SUGGESTIONS.map((s, i) => (
          <motion.button
            key={s.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            onClick={() => onPick(s.prompt)}
            className="group rounded-xl border border-surface3 bg-surface/70 p-4 text-left backdrop-blur transition-colors hover:border-gold/40 hover:bg-surface2"
          >
            <p className="font-serif text-sm text-text-primary group-hover:text-gold">
              {s.title}
            </p>
            <p className="mt-1 line-clamp-2 text-xs text-text-muted">
              {s.prompt}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
