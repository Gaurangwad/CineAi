# 🎬 Cine AI — Your Cinephile Movie Therapist

> An emotionally intelligent AI that recommends movies based on your mood, situation, and soul.

![Cine AI](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![Anthropic](https://img.shields.io/badge/Claude-Sonnet-orange?style=flat-square)
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
ANTHROPIC_API_KEY=sk-ant-...          # Required
NEXT_PUBLIC_TMDB_API_KEY=...          # Optional: for movie posters
OMDB_API_KEY=...                      # Optional: additional movie data
```

**Getting API keys:**
- **Anthropic**: [console.anthropic.com](https://console.anthropic.com) → API Keys
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
│   │   │   ├── chat/route.ts        # Claude AI chat endpoint
│   │   │   └── poster/route.ts      # TMDB poster enrichment
│   │   ├── layout.tsx               # Root layout + fonts
│   │   └── page.tsx                 # Entry point
│   ├── components/
│   │   ├── ChatInterface.tsx        # Main chat UI + state
│   │   ├── ChatMessage.tsx          # Individual message renderer
│   │   ├── MovieCard.tsx            # Cinematic recommendation card
│   │   ├── WatchlistPanel.tsx       # Slide-out watchlist sidebar
│   │   ├── MoodHistoryPanel.tsx     # Mood/chat history sidebar
│   │   ├── WelcomeScreen.tsx        # Initial landing state
│   │   └── TypingIndicator.tsx      # Animated AI thinking state
│   ├── lib/
│   │   ├── types.ts                 # TypeScript interfaces
│   │   ├── prompt.ts                # System prompt + mood suggestions
│   │   ├── tmdb.ts                  # TMDB API utilities
│   │   └── storage.ts               # localStorage watchlist/history
│   └── styles/
│       └── globals.css              # Cinematic dark theme
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
- `ANTHROPIC_API_KEY`
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
| Styling | Tailwind CSS, Framer Motion |
| AI | Anthropic Claude (Sonnet) |
| Movie Data | TMDB API, OMDb API |
| Storage | Browser localStorage |
| Fonts | DM Serif Display + DM Sans (Google Fonts) |
| Deployment | Vercel |

---

## 📄 License

MIT — build something beautiful with it.
