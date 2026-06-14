"use client"

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 px-1 py-2 animate-fade-in">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface2 text-gold">
        🎬
      </div>
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full bg-gold/70"
            style={{
              animation: 'pulse 1.2s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
        <span className="ml-2 text-sm text-text-dim">
          reading between the lines…
        </span>
      </div>
    </div>
  )
}
