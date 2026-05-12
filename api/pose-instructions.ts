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

  const poseName: string | undefined =
    typeof req.body?.poseName === 'string'
      ? req.body.poseName.trim()
      : undefined
  if (!poseName) {
    res.status(400).json({ error: 'poseName required' })
    return
  }

  const prompt = `You are a gentle, trauma-informed yoga instructor. Give step-by-step instructions for entering, holding, and exiting the pose called "${poseName}".

Rules:
- 4-6 numbered steps total.
- Each step: one short sentence, present-tense, somatic ("Press the soles of your feet into the floor"), never prescriptive ("you should").
- One "feel" sentence describing what the user should be sensing in their body.
- One short "modify if" sentence (e.g. "if your knees are tender, place a folded blanket beneath them").
- Skip any spiritual framing. Keep it concrete and physical.

Return ONLY JSON in this shape:
{
  "steps": ["step 1", "step 2", ...],
  "feel": "What you should be feeling.",
  "modify": "How to modify if needed."
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
          temperature: 0.5,
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
    let parsed: { steps?: string[]; feel?: string; modify?: string }
    try {
      parsed = JSON.parse(text)
    } catch {
      res.status(502).json({ error: 'Invalid JSON', raw: text.slice(0, 300) })
      return
    }
    res.status(200).json({
      steps: Array.isArray(parsed.steps) ? parsed.steps : [],
      feel: typeof parsed.feel === 'string' ? parsed.feel : '',
      modify: typeof parsed.modify === 'string' ? parsed.modify : '',
    })
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Unknown error'
    res.status(500).json({ error: errMsg })
  }
}
