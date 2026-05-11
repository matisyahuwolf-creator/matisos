import type { VercelRequest, VercelResponse } from '@vercel/node'

type PoseInfo = { id: string; name: string; difficulty?: string }

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
    res.status(500).json({
      error:
        'GEMINI_API_KEY env var is missing. Add it in Vercel → Settings → Environment Variables and redeploy.',
    })
    return
  }

  const message: string | undefined =
    typeof req.body?.message === 'string'
      ? req.body.message.trim()
      : undefined
  const poses: PoseInfo[] = Array.isArray(req.body?.poses)
    ? req.body.poses
    : []

  if (!message) {
    res.status(400).json({ error: 'message required' })
    return
  }
  if (poses.length === 0) {
    res.status(400).json({ error: 'poses list required' })
    return
  }

  const poseList = poses
    .map(
      (p) =>
        `- ${p.id}: ${p.name}${p.difficulty ? ` (${p.difficulty})` : ''}`,
    )
    .join('\n')

  const prompt = `You are a calm, supportive yoga coach who teaches WHY each pose matters. The user wants to see the reasoning behind the sequence — the physical and mental effect of each pose, and how the flow builds toward their goal.

Available poses (use these EXACT ids — do not invent any):
${poseList}

Return ONLY a JSON object in this exact shape:
{
  "name": "Short session name (3-6 words)",
  "description": "2-3 sentence description of what this session does and how it serves the user's mood.",
  "arc": "1-2 sentences describing the OVERALL STRATEGY of the sequence — how the flow progresses (e.g. grounding → activation → peak → cool-down) and what physiological or mental shift the user should expect by the end.",
  "steps": [
    {
      "poseId": "exact-id-from-list",
      "durationSec": 60,
      "perSide": false,
      "cue": "Brief calm instruction (1 sentence).",
      "rationale": "1-2 concise sentences explaining: (a) what this pose does physically (muscles stretched/strengthened, nervous system effect), (b) what it does mentally/emotionally, (c) why it's placed here in the flow and how it serves the user's specific goal."
    }
  ]
}

Rules:
- Use ONLY pose IDs from the list above (exact match)
- 5-12 steps total
- Hold durations: 30-180 seconds
- Include a grounding pose at the start and a closing/restorative pose (corpse, child, legs-up-wall) at the end
- Use "perSide": true ONLY for bilateral poses (pigeon, lunges, twists, warriors)
- Cues are calm, present-tense ("Notice the breath", "Feel the ground"), never prescriptive
- Rationales should be specific and physiological — actual muscles, nerves, body systems. Avoid vague language like "feels good"; explain WHY it works
- Default to Beginner poses unless user wants challenge
- Match energy to user state: shorter if overwhelmed, gentle wake-up if tired, energizing if low

User's current state: ${message}`

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`

  try {
    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
          maxOutputTokens: 6000,
        },
      }),
    })

    if (!geminiRes.ok) {
      const errText = await geminiRes.text()
      res.status(500).json({
        error: `Gemini API ${geminiRes.status}: ${errText.slice(0, 300)}`,
      })
      return
    }

    const data = await geminiRes.json()
    const text: string | undefined =
      data?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      res.status(502).json({
        error:
          'Gemini returned no text. Response: ' +
          JSON.stringify(data).slice(0, 200),
      })
      return
    }

    let parsed:
      | {
          name?: string
          description?: string
          arc?: string
          steps?: Array<{
            poseId?: string
            durationSec?: number
            cue?: string
            rationale?: string
            perSide?: boolean
          }>
        }
      | null = null
    try {
      parsed = JSON.parse(text)
    } catch {
      const match = text.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (match) {
        try {
          parsed = JSON.parse(match[1])
        } catch {
          /* fall through */
        }
      }
    }

    if (
      !parsed ||
      !parsed.name ||
      !parsed.description ||
      !Array.isArray(parsed.steps)
    ) {
      res.status(502).json({
        error:
          'Model output invalid or missing fields. Got: ' +
          text.slice(0, 500),
      })
      return
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
        rationale:
          typeof s.rationale === 'string' ? s.rationale : undefined,
        perSide: s.perSide === true,
      }))

    if (cleanSteps.length === 0) {
      res
        .status(502)
        .json({ error: 'Generated session had no valid poses from the catalog' })
      return
    }

    res.status(200).json({
      name: parsed.name,
      description: parsed.description,
      arc: typeof parsed.arc === 'string' ? parsed.arc : undefined,
      steps: cleanSteps,
    })
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Unknown error'
    res.status(500).json({ error: errMsg })
  }
}
