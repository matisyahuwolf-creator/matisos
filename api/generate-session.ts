import OpenAI from 'openai'

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

  const client = new OpenAI({
    apiKey,
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    timeout: 25_000,
    maxRetries: 1,
  })

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

  const systemPrompt = `You are a calm, supportive yoga and movement coach. The user practices via a guided app and you are helping them pick a session based on how they feel right now.

Available poses (use these EXACT ids — do not invent ids):
${poseList}

Generate a single custom session tailored to the user's mood and needs. Always start with a grounding pose and end with a closing/restorative pose (Corpse Pose / child / legs-up-wall are good).

Return ONLY valid JSON in this exact shape:
{
  "name": "Short session name (3-6 words)",
  "description": "2-3 sentence description: what this session does, why it fits this person right now, what to expect.",
  "steps": [
    { "poseId": "exact-id-from-list", "durationSec": 60, "cue": "Brief calm instruction.", "perSide": false }
  ]
}

Rules:
- Use ONLY pose IDs from the list above (exact match)
- 5-12 steps total
- Hold durations: 30-180s. Restorative poses 90-180s; active/standing poses 30-60s
- Use "perSide": true ONLY for bilateral poses (lunges, pigeon, warriors, twists, etc.)
- Cues are calm, present-tense ("Notice the contact with the ground", "Feel the breath go in and out"), never prescriptive ("you should…")
- If user sounds overwhelmed or activated: shorter session, more restorative
- If user sounds tired or low energy: gentle wake-up flow
- If user is in pain: avoid loading the painful area; favor counter-stretches and restorative poses
- Default to Beginner poses unless user explicitly asks for challenge`

  try {
    const completion = await client.chat.completions.create({
      model: 'gemini-1.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 800,
    })

    const raw = completion.choices[0]?.message?.content
    if (!raw) {
      return Response.json({ error: 'Empty model response' }, { status: 502 })
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
      parsed = JSON.parse(raw)
    } catch {
      return Response.json(
        { error: 'Model response was not valid JSON' },
        { status: 502 },
      )
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
    const errMsg = err instanceof Error ? err.message : 'Generation failed'
    return Response.json({ error: errMsg }, { status: 500 })
  }
}
