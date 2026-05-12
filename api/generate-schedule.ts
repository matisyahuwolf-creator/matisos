import type { VercelRequest, VercelResponse } from '@vercel/node'

export const maxDuration = 45
export const config = { maxDuration: 45 }

type SessionMeta = {
  id: string
  name: string
  focus?: string
  durationMin?: number
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'GEMINI_API_KEY env var is missing.' })
    return
  }

  const intent: string =
    typeof req.body?.intent === 'string' && req.body.intent.trim()
      ? req.body.intent.trim()
      : 'balanced practice'
  const sessions: SessionMeta[] = Array.isArray(req.body?.sessions)
    ? req.body.sessions
    : []
  if (sessions.length === 0) {
    res.status(400).json({ error: 'sessions required' })
    return
  }

  const sessionList = sessions
    .map(
      (s) =>
        `- ${s.id}: ${s.name}${s.focus ? ` (${s.focus})` : ''}${s.durationMin ? `, ${s.durationMin} min` : ''}`,
    )
    .join('\n')

  const prompt = `You are a yoga coach building a 7-day schedule for someone with this intent: "${intent}".

Use ONLY these session IDs (exact match, do not invent):
${sessionList}

Rules:
- 7 entries, Monday through Sunday, in order.
- Mix gentle/restorative and active days. Don't put two demanding days back to back.
- Include 1-2 lighter days (Pre-Sleep, Stress Down-regulation, Breath Foundation, or Tech Neck Reset).
- Don't repeat the same session more than 3 times.
- Match the user's intent — if they want flexibility, weight toward hip/hamstring/deep work; if they want energy, toward morning/balance/core.
- Each day gets a one-sentence reason for the pick.

Return ONLY JSON in this shape:
{
  "schedule": [
    { "day": "Monday", "sessionId": "exact-id", "reason": "Brief one-sentence why." },
    ... 7 entries total ...
  ]
}`

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`

  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
          maxOutputTokens: 1500,
        },
      }),
    })
    if (!r.ok) {
      const errText = await r.text()
      res
        .status(500)
        .json({ error: `Gemini ${r.status}: ${errText.slice(0, 200)}` })
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
      schedule?: Array<{ day?: string; sessionId?: string; reason?: string }>
    }
    try {
      parsed = JSON.parse(text)
    } catch {
      res.status(502).json({ error: 'Invalid JSON', raw: text.slice(0, 300) })
      return
    }
    const validIds = new Set(sessions.map((s) => s.id))
    const cleanSchedule = DAYS.map((day) => {
      const found = parsed.schedule?.find(
        (e) => e?.day?.toLowerCase() === day.toLowerCase(),
      )
      const sessionId =
        found?.sessionId && validIds.has(found.sessionId)
          ? found.sessionId
          : null
      return {
        day,
        sessionId,
        reason: typeof found?.reason === 'string' ? found.reason : '',
      }
    })
    res.status(200).json({ schedule: cleanSchedule })
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Unknown error'
    res.status(500).json({ error: errMsg })
  }
}
