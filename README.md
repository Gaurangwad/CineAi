# 🎬 Cine AI — Your Cinephile Movie Therapist

> An emotionally intelligent AI that recommends movies based on your mood, situation, and soul.

![Cine AI](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![Groq](https://img.shields.io/badge/Groq-Llama_3.3_70B-f55036?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwindcss)

---

## ✨ What It Does

Cine AI is not a search engine. It's a deeply empathetic AI cinephile that:

- **Understands your emotional state** from natural language prompts
- **Recommends films** with deep reasoning about why they match your exact mood
- **Explains emotional vibes**, famous dialogues, and psychological resonance
- **Avoids clichés** — no obvious picks, always thoughtful and surprising
- **Remembers your conversation** for multi-turn refinement
- **Saves your watchlist** persistently in the browser
- **Tracks your mood history** so you can revisit past discoveries
- **Learns your taste over time** — an on-device taste-profile learner builds an
  evolving model of your favored genres, emotional themes, and eras from every
  prompt and watchlist save, then biases future picks toward *you*

---

## 🧠 How the Taste Learner Works

Cine AI ships with a lightweight **online preference model** (`src/lib/taste.ts`)
that "keeps learning" what you like — no GPU, no training job, no external ML
service, and it can't fail at inference time:

| Signal | Weight | What it teaches the model |
|--------|--------|---------------------------|
| You type a prompt | low | your current mood / desired vibe |
| A pick is shown to you | low | weak genre & mood association |
| You **save** to your watchlist | high | a strong, explicit taste signal |

Each signal updates a per-user `TasteProfile` (genres, moods, decades) with
**exponential decay**, so the model gently forgets stale taste and tracks where
you are *now*. Before each request the learner produces a short natural-language
summary that is injected into the system prompt, and it **re-ranks** alternate
picks so the ones closest to your taste surface first. The profile persists in
`localStorage` and the same logic is exposed server-side at `/api/taste`.

> Why not a literal CNN? Convolutional nets are built for spatial/image data.
> User taste is a small, sparse, evolving set of categorical signals with very
> little data per user — an online weighted-feature model is the right tool:
> it learns from the very first interaction, is fully explainable, and never
> errors out.

### 🎨 UI / UX

The landing experience uses an interactive **gooey pixel-trail** hero
(`src/components/ui/gooey-filter.tsx` + `pixel-trail.tsx`) built on shadcn
structure — hover the hero and gold pixels bloom and melt together via an SVG
goo filter. The rest of the app is a cinematic dark theme (gold-on-charcoal)
with Framer Motion transitions.

---

## 🚀 Quick Start

### 1. Clone and install

```bash
git clone https://github.com/your-repo/cine-ai
cd cine-ai
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your keys:

```env
GROQ_API_KEY=gsk_...                  # Required (free, fast, reliable)
NEXT_PUBLIC_TMDB_API_KEY=...          # Optional: for movie posters
OMDB_API_KEY=...                      # Optional: additional movie data
```

**Getting API keys:**
- **Groq** (free): [console.groq.com/keys](https://console.groq.com/keys) — runs Llama 3.3 70B, very fast & stable
- **TMDB** (free): [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
- **OMDb** (free tier): [omdbapi.com/apikey](https://www.omdbapi.com/apikey.aspx)

### 3. Run locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 🏗 Project Structure

```
cine-ai/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts        # Groq (Llama 3.3 70B) chat endpoint
│   │   │   ├── poster/route.ts      # TMDB poster enrichment
│   │   │   └── taste/route.ts       # Taste-profile learner (server-side)
│   │   ├── globals.css              # Cinematic dark theme
│   │   ├── layout.tsx               # Root layout + fonts
│   │   └── page.tsx                 # Entry point
│   ├── components/
│   │   ├── ui/
│   │   │   ├── gooey-filter.tsx     # SVG goo filter (shadcn structure)
│   │   │   ├── pixel-trail.tsx      # Interactive gooey pixel-trail hero fx
│   │   │   └── button.tsx           # shadcn-style button
│   │   ├── hooks/
│   │   │   └── use-debounced-dimensions.ts
│   │   ├── ChatInterface.tsx        # Main chat UI + state + learner wiring
│   │   ├── ChatMessage.tsx          # Individual message renderer
│   │   ├── MovieCard.tsx            # Cinematic recommendation card
│   │   ├── WatchlistPanel.tsx       # Slide-out watchlist sidebar
│   │   ├── MoodHistoryPanel.tsx     # Mood/chat history sidebar
│   │   ├── WelcomeScreen.tsx        # Gooey pixel-trail landing hero
│   │   └── TypingIndicator.tsx      # Animated AI thinking state
│   ├── hooks/
│   │   └── use-screen-size.ts       # Responsive breakpoint hook
│   └── lib/
│       ├── types.ts                 # TypeScript interfaces
│       ├── prompt.ts                # System prompt + mood suggestions
│       ├── tmdb.ts                  # TMDB API utilities
│       ├── taste.ts                 # Online taste-profile learner
│       ├── storage.ts               # localStorage watchlist/history/taste
│       └── utils.ts                 # cn() class merge helper
├── components.json                  # shadcn config
├── .env.example                     # Environment variables template
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## 🎨 Features

### Core Chat
- Natural language mood/emotion input
- Multi-turn conversation memory
- 12 quick-access mood chip buttons
- 6 welcome suggestion tiles
- Enter to send, Shift+Enter for newline

### Movie Recommendations
- **Main pick** with full details:
  - Poster image (via TMDB API)
  - Title, year, genre, runtime
  - Director and cast
  - IMDb + Rotten Tomatoes ratings
  - Spoiler-free synopsis
  - *Why It Fits* — personalized emotional reasoning
  - Emotional vibe description
  - Famous dialogue that resonates
  - Trailer search button
  - Watchlist save/unsave
- **2 alternate picks** with type labels (Hidden Gem, Wildcard, etc.)
- **Closing poetic thought**

### Watchlist
- Persistent across sessions (localStorage)
- Slide-out panel from header button
- Remove individual items on hover
- Shows emotional vibe for each saved film

### Mood History
- Tracks every prompt and top recommendation
- Replay past prompts with one click
- Slide-out panel from history button

---

## 🌐 Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

Set environment variables in Vercel dashboard:
- `GROQ_API_KEY`
- `NEXT_PUBLIC_TMDB_API_KEY` (optional)
- `OMDB_API_KEY` (optional)

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci --only=production
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🔧 Customization

### Change the AI personality

Edit `src/lib/prompt.ts` → `CINE_SYSTEM_PROMPT` to adjust tone, rules, or film selection philosophy.

### Add more mood chips

Edit `MOOD_SUGGESTIONS` in `src/lib/prompt.ts`.

### Adjust recommendation schema

The `CineResponse` interface in `src/lib/types.ts` defines the JSON structure. Modify the schema in `CINE_SYSTEM_PROMPT` to match.

---

## 📝 Example Prompts

```
"I just got rejected and need something to help me feel less alone"
"I need a movie that feels like late-night loneliness and 3am thoughts"
"Something like Mulholland Drive but more grounded emotionally"
"I failed at something important. Need to believe in myself again"
"Recommend something Japanese that feels like melancholy and memory"
"Perfect film for a rainy Friday night alone with wine"
"I need an existential crisis film — something that questions everything"
"I miss someone who doesn't miss me back"
"Hidden gem that changed someone's life but nobody's seen it"
"A film that feels like falling in love for the last time"
```

---

## 🤝 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | Tailwind CSS, Framer Motion, shadcn structure |
| AI | Groq — Llama 3.3 70B (free, fast, reliable) |
| Personalization | On-device online taste-profile learner |
| Movie Data | TMDB API, OMDb API |
| Storage | Browser localStorage |
| Fonts | DM Serif Display + DM Sans (Google Fonts) |
| Deployment | Vercel |

---

## 📄 License

MIT — build something beautiful with it.
