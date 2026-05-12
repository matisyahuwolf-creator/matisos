import type { VercelRequest, VercelResponse } from '@vercel/node'

export const maxDuration = 30
export const config = { maxDuration: 30 }

type ChatMsg = { role: 'user' | 'assistant'; content: string }

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

  const messages: ChatMsg[] = Array.isArray(req.body?.messages)
    ? req.body.messages.filter(
        (m: ChatMsg): m is ChatMsg =>
          (m?.role === 'user' || m?.role === 'assistant') &&
          typeof m?.content === 'string',
      )
    : []
  if (messages.length === 0) {
    res.status(400).json({ error: 'messages required' })
    return
  }

  const systemContext = `You are a warm, calm, trauma-informed yoga coach inside an app called matisOS. The user may be anxious, overwhelmed, or just looking for guidance. Your role is to listen, offer one small somatic suggestion if useful, and never prescribe or hype.

Rules:
- Keep replies under 80 words.
- Use permission language ("you can", "if it feels right", "stay if it helps").
- Acknowledge what the user says before suggesting anything.
- One tiny actionable thing at most per reply.
- Never diagnose. Never reference streaks, consistency, or "should".
- If they're acutely distressed, gently mention seeking a human (therapist, friend) is also valid.
- Match their tone: warm if vulnerable, lighter if curious.`

  const geminiMessages = messages.map((m) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }))

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`

  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemContext }] },
        contents: geminiMessages,
        generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
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
      res.status(502).json({ error: 'No reply from Gemini' })
      return
    }
    res.status(200).json({ reply: text.trim() })
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Unknown error'
    res.status(500).json({ error: errMsg })
  }
}
