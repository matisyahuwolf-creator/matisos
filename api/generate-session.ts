export const maxDuration = 60
export const config = {
  maxDuration: 60,
}

type PoseInfo = { id: string; name: string; difficulty?: string }

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return Response.json(
      {
        error:
          'GEMINI_API_KEY env var is missing on the server. Add it in Vercel → Settings → Environment Variables and redeploy.',
      },
      { status: 500 },
    )
  }

  let body: { message?: string; poses?: PoseInfo[] }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const message = body.message?.trim()
  const poses = body.poses ?? []

  if (!message) {
    return Response.json({ error: 'message required' }, { status: 400 })
  }
  if (poses.length === 0) {
    return Response.json({ error: 'poses list required' }, { status: 400 })
  }

  const poseList = poses
    .map((p) => `- ${p.id}: ${p.name}${p.difficulty ? ` (${p.difficulty})` : ''}`)
    .join('\n')

  const prompt = `You are a calm, supportive yoga coach. Generate a custom session based on the user's mood.

Available poses (use these EXACT ids — do not invent any):
${poseList}

Return ONLY a JSON object in this exact shape:
{
  "name": "Short session name (3-6 words)",
  "description": "2-3 sentence description of what this session does and why it fits.",
  "steps": [
    { "poseId": "exact-id-from-list", "durationSec": 60, "cue": "Brief calm instruction.", "perSide": false }
  ]
}

Rules:
- Use ONLY pose IDs from the list above (exact match)
- 5-12 steps total
- Hold durations: 30-180 seconds
- Include a grounding pose at the start and a closing pose (corpse, child, or legs-up-wall) at the end
- Use "perSide": true ONLY for bilateral poses (pigeon, lunges, twists, warriors)
- Cues are calm, present-tense ("Notice the breath", "Feel the ground"), never prescriptive
- Default to Beginner poses unless user wants challenge
- Match the energy: shorter session if overwhelmed; gentle wake-up if tired

User's current state: ${message}`

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 25_000)

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      }),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!res.ok) {
      const errText = await res.text()
      return Response.json(
        { error: `Gemini API ${res.status}: ${errText.slice(0, 300)}` },
        { status: 500 },
      )
    }

    const data = await res.json()
    const text: string | undefined =
      data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) {
      return Response.json(
        { error: 'Gemini returned no text. Response: ' + JSON.stringify(data).slice(0, 200) },
        { status: 502 },
      )
    }

    let parsed: {
      name?: string
      description?: string
      steps?: Array<{
        poseId?: string
        durationSec?: number
        cue?: string
        perSide?: boolean
      }>
    }
    try {
      parsed = JSON.parse(text)
    } catch {
      const match = text.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (match) {
        try {
          parsed = JSON.parse(match[1])
        } catch {
          return Response.json(
            { error: 'Model output was not valid JSON' },
            { status: 502 },
          )
        }
      } else {
        return Response.json(
          { error: 'Model output was not valid JSON' },
          { status: 502 },
        )
      }
    }

    if (
      !parsed.name ||
      !parsed.description ||
      !Array.isArray(parsed.steps)
    ) {
      return Response.json(
        { error: 'Model response missing required fields' },
        { status: 502 },
      )
    }

    const validIds = new Set(poses.map((p) => p.id))
    const cleanSteps = parsed.steps
      .filter(
        (s): s is { poseId: string } & Record<string, unknown> =>
          !!s && typeof s.poseId === 'string' && validIds.has(s.poseId),
      )
      .map((s) => ({
        poseId: s.poseId,
        durationSec:
          typeof s.durationSec === 'number'
            ? Math.max(15, Math.min(300, Math.round(s.durationSec)))
            : 60,
        cue: typeof s.cue === 'string' ? s.cue : undefined,
        perSide: s.perSide === true,
      }))

    if (cleanSteps.length === 0) {
      return Response.json(
        { error: 'Generated session had no valid poses' },
        { status: 502 },
      )
    }

    return Response.json({
      name: parsed.name,
      description: parsed.description,
      steps: cleanSteps,
    })
  } catch (err) {
    clearTimeout(timeoutId)
    const isAbort = err instanceof Error && err.name === 'AbortError'
    const errMsg = isAbort
      ? 'Gemini API call timed out after 25s'
      : err instanceof Error
        ? err.message
        : 'Unknown error'
    return Response.json({ error: errMsg }, { status: 500 })
  }
}
