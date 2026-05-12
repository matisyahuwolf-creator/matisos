import type { VercelRequest, VercelResponse } from '@vercel/node'

export const maxDuration = 30
export const config = { maxDuration: 30 }

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

  const city: string =
    typeof req.body?.city === 'string' ? req.body.city : 'your area'
  const condition: string =
    typeof req.body?.condition === 'string' ? req.body.condition : 'unknown'
  const tempF: number =
    typeof req.body?.tempF === 'number' ? req.body.tempF : 70

  const now = new Date()
  const hour = now.getHours()
  const timeOfDay =
    hour < 11 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'night'

  const prompt = `You are a warm, grounded friend giving local suggestions.

Context:
- Location: ${city}
- Current weather: ${condition}, ${tempF}°F
- Time of day: ${timeOfDay}

Suggest 3 specific, real places or activities someone could go today given this weather and time. Be specific (named parks, neighborhood vibes, activity types) — not generic ("go for a walk"). Match the weather honestly: if it's raining, suggest indoor; if it's beautiful, suggest outdoor.

Tone: warm, practical, short. No hype. Each suggestion is 1 sentence.

Return ONLY JSON in this shape:
{
  "vibe": "One short phrase describing today's weather as a feeling.",
  "suggestions": [
    {
      "name": "Specific place or activity type",
      "why": "One sentence why it fits today."
    }
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
          temperature: 0.8,
          maxOutputTokens: 800,
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
      vibe?: string
      suggestions?: Array<{ name?: string; why?: string }>
    }
    try {
      parsed = JSON.parse(text)
    } catch {
      res.status(502).json({ error: 'Invalid JSON', raw: text.slice(0, 300) })
      return
    }
    res.status(200).json({
      vibe: typeof parsed.vibe === 'string' ? parsed.vibe : '',
      suggestions: Array.isArray(parsed.suggestions)
        ? parsed.suggestions.slice(0, 5).map((s) => ({
            name: typeof s?.name === 'string' ? s.name : '',
            why: typeof s?.why === 'string' ? s.why : '',
          }))
        : [],
    })
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Unknown'
    res.status(500).json({ error: errMsg })
  }
}
