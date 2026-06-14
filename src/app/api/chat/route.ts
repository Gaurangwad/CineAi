// =============================================
// Cine AI — Chat endpoint (Groq, free + reliable)
// ---------------------------------------------
// Uses Groq's OpenAI-compatible Chat Completions API with Llama 3.3 70B.
// Groq is free, extremely fast, and stable. The taste summary learned from the
// user's history is injected into the system prompt so picks get more
// personal the more the user interacts.
// =============================================

import { NextResponse } from 'next/server'
import { buildSystemPrompt } from '@/lib/prompt'
import type { CineResponse } from '@/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

interface IncomingMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatBody {
  /** The new user prompt. */
  message: string
  /** Prior turns for multi-turn refinement. */
  history?: IncomingMessage[]
  /** Learned taste summary string from the client-side learner. */
  tasteSummary?: string
}

/** Pull a JSON object out of a model response that may include stray text. */
function extractJson(raw: string): CineResponse | null {
  if (!raw) return null
  let text = raw.trim()
  // Strip markdown fences if present.
  text = text.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim()
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1) return null
  try {
    return JSON.parse(text.slice(start, end + 1)) as CineResponse
  } catch {
    return null
  }
}

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'GROQ_API_KEY is not configured on the server.' },
      { status: 500 }
    )
  }

  let body: ChatBody
  try {
    body = (await req.json()) as ChatBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  if (!body.message?.trim()) {
    return NextResponse.json({ error: 'Message is required.' }, { status: 400 })
  }

  const messages = [
    { role: 'system' as const, content: buildSystemPrompt(body.tasteSummary) },
    ...(body.history ?? []).slice(-6).map((m) => ({
      role: m.role,
      content: m.content,
    })),
    { role: 'user' as const, content: body.message },
  ]

  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.9,
        max_tokens: 1800,
        response_format: { type: 'json_object' },
      }),
    })

    if (!res.ok) {
      const detail = await res.text()
      // Surface the real reason (auth, bad model, rate limit) so it's debuggable.
      let reason = detail.slice(0, 300)
      try {
        reason = JSON.parse(detail)?.error?.message ?? reason
      } catch {
        /* keep raw text */
      }
      const hint =
        res.status === 401
          ? ' — your GROQ_API_KEY looks invalid or expired. Update .env.local and restart the dev server.'
          : res.status === 429
            ? ' — rate limited by Groq, try again in a moment.'
            : res.status === 400 && /model/i.test(reason)
              ? ' — the model id may be decommissioned; check console.groq.com/docs/models.'
              : ''
      return NextResponse.json(
        { error: `Groq error (${res.status}): ${reason}${hint}` },
        { status: 502 }
      )
    }

    const data = await res.json()
    const content: string = data?.choices?.[0]?.message?.content ?? ''
    const parsed = extractJson(content)

    if (!parsed || !parsed.mainPick) {
      return NextResponse.json(
        { error: 'Could not parse a recommendation. Please try rephrasing.' },
        { status: 502 }
      )
    }

    return NextResponse.json({ response: parsed })
  } catch (err) {
    return NextResponse.json(
      { error: 'Network error reaching the model.', detail: String(err) },
      { status: 502 }
    )
  }
}
