import type { VercelRequest, VercelResponse } from '@vercel/node'

export const maxDuration = 30
export const config = { maxDuration: 30 }

type Block = {
  id?: string
  start?: string
  end?: string
  title?: string
  category?: string
  energy?: string
  why?: string
  fixed?: boolean
}

type ChatTurn = { role: 'user' | 'assistant'; content: string }

const CATEGORIES = [
  'work',
  'rest',
  'movement',
  'meal',
  'connect',
  'create',
  'admin',
  'sleep',
] as const
const ENERGIES = ['low', 'mid', 'high'] as const
const VIEWS = ['timeline', 'energy', 'priority', 'narrative'] as const

type Category = (typeof CATEGORIES)[number]
type Energy = (typeof ENERGIES)[number]
type View = (typeof VIEWS)[number]

function pickEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback
}

function normalizeTime(t: unknown): string | null {
  if (typeof t !== 'string') return null
  const m = t.trim().match(/^(\d{1,2}):(\d{2})$/)
  if (!m) return null
  const h = Math.min(23, Math.max(0, parseInt(m[1], 10)))
  const min = Math.min(59, Math.max(0, parseInt(m[2], 10)))
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'GEMINI_API_KEY env var is missing.' })
    return
  }

  const message: string =
    typeof req.body?.message === 'string' ? req.body.message.trim() : ''
  if (!message) {
    res.status(400).json({ error: 'message required' })
    return
  }

  const intents: string[] = Array.isArray(req.body?.intents)
    ? req.body.intents.filter((s: unknown): s is string => typeof s === 'string').slice(0, 20)
    : []
  const fixed: Block[] = Array.isArray(req.body?.fixed) ? req.body.fixed.slice(0, 12) : []
  const history: ChatTurn[] = Array.isArray(req.body?.history)
    ? req.body.history
        .filter(
          (m: ChatTurn): m is ChatTurn =>
            (m?.role === 'user' || m?.role === 'assistant') &&
            typeof m?.content === 'string',
        )
        .slice(-8)
    : []
  const nowIso: string =
    typeof req.body?.now === 'string' ? req.body.now : new Date().toISOString()
  const tz: string =
    typeof req.body?.timezone === 'string' ? req.body.timezone : 'local'

  const intentsBlock = intents.length
    ? intents.map((i) => `- ${i}`).join('\n')
    : '(none yet — user has not declared intents)'
  const fixedBlock = fixed.length
    ? fixed
        .map(
          (b) =>
            `- ${b.start ?? '??:??'}–${b.end ?? '??:??'}: ${b.title ?? '(untitled)'}`,
        )
        .join('\n')
    : '(no fixed commitments)'
  const historyBlock = history.length
    ? history.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n')
    : '(first exchange)'

  const systemPrompt = `You are Cadence — an AI day-planner for a single user.
You shape the day around energy, not just time. You're terse, honest, and never preachy.

Today is ${nowIso} (timezone: ${tz}).

You have four ways to render your answer (the "view"):
- "timeline" — full day in time-ordered blocks. Use when user wants a plan.
- "energy" — same blocks, but answer is framed around energy peaks/troughs. Use when user asks about energy, focus, fatigue.
- "priority" — surface only the 2–4 highest-leverage blocks, deprioritize the rest. Use when user is overwhelmed or asks what matters.
- "narrative" — story-first answer. Use when user is reflecting, asking "how does my day look", or wants framing more than scheduling.

CHOOSE the view that best fits the user's last message. Do not always pick "timeline".

Rules:
- 4–10 blocks total. Cover roughly 07:00 to 22:00 unless context says otherwise.
- Respect every fixed commitment exactly — same start/end/title, with fixed:true.
- Use 24-hour HH:MM times. Blocks must not overlap. End > start.
- Categories: work | rest | movement | meal | connect | create | admin | sleep.
- Energy: low | mid | high. Front-load high-energy work when sensible.
- Each block: a one-line "why" — concrete, specific, never generic.
- Narrative: 1–3 sentences. No emojis. No hedging.
- Suggestions: up to 3 short nudges (e.g. "skip the 3pm coffee").`

  const userPrompt = `INTENTS:
${intentsBlock}

FIXED COMMITMENTS:
${fixedBlock}

RECENT CONVERSATION:
${historyBlock}

LATEST MESSAGE:
${message}

Return ONLY JSON in this shape:
{
  "view": "timeline" | "energy" | "priority" | "narrative",
  "narrative": "1-3 sentences framing the day",
  "blocks": [
    {
      "id": "kebab-slug",
      "start": "HH:MM",
      "end": "HH:MM",
      "title": "Short label",
      "category": "work | rest | movement | meal | connect | create | admin | sleep",
      "energy": "low | mid | high",
      "why": "One concrete reason this slot.",
      "fixed": false
    }
  ],
  "suggestions": ["short nudge", "short nudge"]
}`

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`

  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
          maxOutputTokens: 2000,
        },
      }),
    })
    if (!r.ok) {
      const errText = await r.text()
      res.status(500).json({ error: `Gemini ${r.status}: ${errText.slice(0, 200)}` })
      return
    }
    const data = await r.json()
    const text: string | undefined =
      data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) {
      res.status(502).json({ error: 'No text from Gemini' })
      return
    }
    let parsed: {
      view?: string
      narrative?: string
      blocks?: Block[]
      suggestions?: unknown[]
    }
    try {
      parsed = JSON.parse(text)
    } catch {
      res.status(502).json({ error: 'Invalid JSON', raw: text.slice(0, 300) })
      return
    }

    const blocks = (Array.isArray(parsed.blocks) ? parsed.blocks : [])
      .map((b, i): Block | null => {
        const start = normalizeTime(b?.start)
        const end = normalizeTime(b?.end)
        if (!start || !end || start >= end) return null
        return {
          id: typeof b?.id === 'string' && b.id ? b.id : `b-${i}`,
          start,
          end,
          title:
            typeof b?.title === 'string' && b.title.trim() ? b.title.trim() : 'Block',
          category: pickEnum<Category>(b?.category, CATEGORIES, 'work'),
          energy: pickEnum<Energy>(b?.energy, ENERGIES, 'mid'),
          why: typeof b?.why === 'string' ? b.why.slice(0, 200) : '',
          fixed: b?.fixed === true,
        }
      })
      .filter((b): b is Block => b !== null)
      .sort((a, b) => (a.start! < b.start! ? -1 : 1))

    const suggestions = Array.isArray(parsed.suggestions)
      ? parsed.suggestions
          .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
          .slice(0, 3)
      : []

    res.status(200).json({
      view: pickEnum<View>(parsed.view, VIEWS, 'timeline'),
      narrative:
        typeof parsed.narrative === 'string' ? parsed.narrative.trim() : '',
      blocks,
      suggestions,
    })
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Unknown error'
    res.status(500).json({ error: errMsg })
  }
}
