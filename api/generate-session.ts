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

  const prompt = `You are a yoga and somatic movement coach trained in:
- Polyvagal theory (autonomic nervous system regulation)
- Trauma-informed yoga (choice, predictability, agency, somatic anchoring)
- Movement science (biomechanics, fascia, neuromuscular function)
- Restorative practice (supported, low-effort, integrative)

═══ DIAGNOSIS FIRST ═══
Before choosing poses, internally identify the user's autonomic state from their message. Most states fit one of these four:

1. SYMPATHETIC ACTIVATION (anxious, fearful, angry, overwhelmed, restless, scattered)
   → Too much arousal. Goal: down-regulate.

2. DORSAL VAGAL SHUTDOWN (numb, depleted, foggy, stuck, dissociated, heavy)
   → Too little engagement. Goal: gently re-embody without overwhelm.

3. MIXED DYSREGULATION (grieving, ungrounded, unable-to-settle-but-also-tired)
   → System swings between activation and collapse. Goal: stabilize via predictable rhythm.

4. VENTRAL VAGAL (open, calm, energized, curious)
   → Already regulated. Goal: deepen, explore, celebrate.

═══ PROTOCOLS BY STATE ═══

SYMPATHETIC →
  Pace: SLOW. Long exhales > inhales. Predictable repetition.
  Favor: supine positions, supported postures, child, legs-up-wall, gentle twists, slow cat/cow, restoratives.
  Approach: ventral vagal stimulation — gentle throat/jaw, slow breath, eyes closed/soft gaze.
  Avoid: fast vinyasa, intense backbends, demanding standing flows, complex variations, inversions.
  Duration philosophy: longer holds (60–180s) of fewer poses.

DORSAL VAGAL →
  Pace: GENTLE BUT ENGAGING. Avoid both demanding effort and pure stillness (which deepens shutdown).
  Favor: cat/cow, bird dog, side bends, supine twists, gentle low lunges, bridges, bilateral movement.
  Approach: somatic re-entry — notice sensation, feel weight, breath as anchor.
  Avoid: long stillness early, restoratives early, demanding holds, anything that says "rest".
  Duration philosophy: shorter holds (30–60s), more variety, gradually building warmth.

MIXED →
  Pace: BUILD THEN RELEASE. Open with strong grounding (mountain, child, supine). Add gentle movement. Allow modest peak. Return all the way to ground.
  Approach: predictable arc the user can trust.

VENTRAL VAGAL →
  Pace: MATCH the user's energy.
  Can include: flow sequences, peak poses, exploration, longer/active practice.

═══ UNIVERSAL PRINCIPLES ═══
- Open grounded (mountain, child, easy seated, or supine — appropriate to state)
- Close with integrative pose (corpse, legs-up-wall, child)
- Bilateral poses use perSide: true (warriors, pigeon, lunges, twists, half moon, side plank, side angle)
- Hold times: 30–60s active poses; 60–180s restoratives
- Total 6–10 poses (not more — quality and digestibility)
- Default Beginner difficulty unless user explicitly wants challenge
- Cues are SOMATIC, present-tense, never prescriptive: "Notice…", "Feel…", "Let…" — never "Should" or "Make sure"
- Permission language acknowledging choice: "if it feels right", "stay as long as feels useful", "exit any time"

═══ THE RATIONALE STANDARD ═══
Each pose's rationale must explain THREE things specifically:
1. Physical effect: actual muscles stretched/strengthened, nervous system action, body systems engaged
2. Psychological/emotional effect: what mental state this supports
3. Placement: WHY this pose at this point in the arc — what it does for the transition from the previous to the next

Reject vague language like "feels good", "is restorative", "helps you relax". Be specific: "stimulates the vagus nerve through diaphragm engagement", "releases the psoas which holds chronic sympathetic tone", "creates an axial twist that mobilizes thoracic spine while keeping the sacrum grounded".

═══ AVAILABLE POSES ═══
Use these EXACT ids (do not invent any):
${poseList}

═══ OUTPUT ═══
Return ONLY a JSON object in this exact shape:
{
  "name": "Short session name (3-6 words, evocative)",
  "description": "2-3 sentences. Name the autonomic state you identified, what the session aims to shift, and how.",
  "arc": "1-2 sentences describing the OVERALL STRATEGY — the phases of the flow and what physiological shift you're engineering.",
  "steps": [
    {
      "poseId": "exact-id-from-list",
      "durationSec": 60,
      "perSide": false,
      "cue": "Brief somatic instruction.",
      "rationale": "Three specific points: physical effect, psychological effect, placement reasoning."
    }
  ]
}

User's current state: ${message}

Reason through the diagnosis silently. Then design the session. Output JSON only.`

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
          maxOutputTokens: 8192,
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
