import type { VercelRequest, VercelResponse } from '@vercel/node'

export const maxDuration = 60
export const config = {
  maxDuration: 60,
}

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

  const prompt = `You are a trauma-informed, ADHD-informed, gentle movement coach.

Your job is NOT to create the best yoga routine.
Your job is to help an overwhelmed person safely BEGIN.

The user may be anxious, frozen, distracted, ashamed, tired, or resistant. The product is a nervous-system-safe starting ritual, not a workout. Motivation comes after action, not before. The first action must be so small that it does not trigger resistance.

CORE PRINCIPLES:
- Use very small steps. The total session is 1–3 minutes by default. Never more than 5 minutes unless the user explicitly asks for more.
- Use warm and direct language. No cheesy, clinical, or hype tone.
- Give choice and control. Permission language: "if it feels right", "stay as long as feels useful", "you can stop anytime".
- Avoid pressure, guilt, hype, or performance language.
- Make the FIRST move almost impossible to refuse — it should be so small a person can do it lying down with their eyes closed.
- Keep instructions concrete, short, and somatic — one sentence each.
- Use body-based grounding when appropriate.
- Use movement BEFORE stillness for restless/anxious states.
- Use tiny sensory grounding for frozen/shutdown states.
- Use novelty and low decision load for ADHD/scattered states.
- Use reassurance and dignity for shame states. No streak/failure language.
- Always include permission to stop if anything feels painful.
- Do NOT diagnose, treat, or give medical advice.
- NEVER shame the user. The completion message must affirm their showing up, not their performance.

MODE GUIDE (read the user's stated state and apply the matching mode):

FROZEN MODE (frozen, heavy, tired, numb, shut down):
  - Start with one breath or one micro-touch (hand on heart, hand on belly).
  - Seated or lying positions only.
  - No active movements. Use felt-sense cues ("notice the weight of your body").
  - Duration: 60–120 seconds total.

RESTLESS MODE (restless, tense, anxious, agitated):
  - Start with shaking, shoulder rolls, or pressing feet into the floor.
  - Move BEFORE you try to be still. Discharge the activation first.
  - End with one long exhale before any held pose.
  - Duration: 90–180 seconds total.

SCATTERED MODE (scattered, ADHD, can't focus):
  - One pose. One instruction. Short.
  - Add gentle novelty (a different focus point — sound, sensation, breath count).
  - No choices. No options. Just do this one thing.
  - Duration: 60–90 seconds total.

SHAME MODE (ashamed, "I failed again", avoiding):
  - Opening reassurance comes FIRST and longest.
  - Affirm the user's dignity. Frame their being here as enough.
  - Smallest possible move. One breath. Done.
  - Completion message must NOT reference streaks, consistency, or "next time".
  - Duration: 45–90 seconds total.

JUST START MODE (default, ordinary resistance):
  - One breath. Then one stretch. Then one minute total.
  - Optional 2-minute continuation offered at the end — never pressured.
  - Duration: 60 seconds total minimum.

═══ AVAILABLE POSES ═══
Use these EXACT ids only:
${poseList}

═══ OUTPUT ═══
Return ONLY a JSON object in this exact shape (no markdown wrappers, no commentary):
{
  "title": "Short session name (3-5 words, warm, not clinical)",
  "state": "Name the state in 1-3 words (e.g. 'Frozen', 'Restless', 'Shame')",
  "durationSec": <total seconds, integer between 45 and 300>,
  "openingReassurance": "1-2 sentences. Warm, grounded, direct. Tell the user they are welcome here, that what they're about to do is small enough to actually do.",
  "firstMove": {
    "poseId": "<exact id from list above>",
    "instruction": "One short sentence. What to do, somatic, present tense.",
    "durationSec": <seconds, integer between 15 and 60>,
    "whyItHelps": "1 sentence explaining what this does for the body or nervous system. Plain language. No jargon."
  },
  "steps": [
    {
      "poseId": "<exact id from list above>",
      "instruction": "One short somatic instruction.",
      "durationSec": <integer between 15 and 90>,
      "breathingCue": "One short sentence about the breath rhythm (e.g. 'Inhale through the nose, exhale longer through soft lips').",
      "energyLevel": "very low | low | medium"
    }
  ],
  "optionalContinue": "1 sentence offering to keep going 2 more minutes. Optional, never pressured.",
  "completionMessage": "1 sentence affirming the user showed up. Must NOT reference performance, streaks, or what to do next.",
  "safetyNote": "1 short sentence: 'You can stop anytime. If anything hurts, come out.'"
}

RULES:
- Use ONLY pose ids from the list above (exact match)
- firstMove + steps total time should be between 45 and 300 seconds
- Default to the smallest possible session (under 2 minutes) unless the user signals more energy
- Most sessions should be 3-6 steps INCLUDING firstMove
- Match the user's mode exactly
- All cues must be SOMATIC, present-tense: "Notice", "Feel", "Let", never "Should" or "Make sure"

User's current state: ${message}

Reason silently about which mode applies. Then output the smallest session that will actually get them to begin. Output JSON only.`

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`

  try {
    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.75,
          maxOutputTokens: 4096,
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

    let parsed: {
      title?: string
      state?: string
      durationSec?: number
      openingReassurance?: string
      firstMove?: {
        poseId?: string
        instruction?: string
        durationSec?: number
        whyItHelps?: string
      }
      steps?: Array<{
        poseId?: string
        instruction?: string
        durationSec?: number
        breathingCue?: string
        energyLevel?: string
      }>
      optionalContinue?: string
      completionMessage?: string
      safetyNote?: string
    } | null = null
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
      !parsed.title ||
      !parsed.firstMove ||
      !Array.isArray(parsed.steps)
    ) {
      res.status(502).json({
        error:
          'Model output invalid. Got: ' + text.slice(0, 500),
      })
      return
    }

    const validIds = new Set(poses.map((p) => p.id))

    // Validate firstMove
    if (
      !parsed.firstMove.poseId ||
      !validIds.has(parsed.firstMove.poseId)
    ) {
      res
        .status(502)
        .json({ error: 'firstMove poseId is not in the catalog' })
      return
    }

    const cleanFirstMove = {
      poseId: parsed.firstMove.poseId,
      instruction: parsed.firstMove.instruction ?? '',
      durationSec:
        typeof parsed.firstMove.durationSec === 'number'
          ? Math.max(15, Math.min(120, Math.round(parsed.firstMove.durationSec)))
          : 30,
      whyItHelps: parsed.firstMove.whyItHelps ?? '',
    }

    const cleanSteps = parsed.steps
      .filter(
        (s): s is { poseId: string } & Record<string, unknown> =>
          !!s && typeof s.poseId === 'string' && validIds.has(s.poseId),
      )
      .map((s) => ({
        poseId: s.poseId,
        instruction: typeof s.instruction === 'string' ? s.instruction : '',
        durationSec:
          typeof s.durationSec === 'number'
            ? Math.max(15, Math.min(180, Math.round(s.durationSec)))
            : 30,
        breathingCue:
          typeof s.breathingCue === 'string' ? s.breathingCue : undefined,
        energyLevel:
          typeof s.energyLevel === 'string' ? s.energyLevel : undefined,
      }))

    res.status(200).json({
      title: parsed.title,
      state: parsed.state ?? '',
      durationSec:
        typeof parsed.durationSec === 'number'
          ? Math.round(parsed.durationSec)
          : cleanFirstMove.durationSec +
            cleanSteps.reduce((a, s) => a + s.durationSec, 0),
      openingReassurance: parsed.openingReassurance ?? '',
      firstMove: cleanFirstMove,
      steps: cleanSteps,
      optionalContinue: parsed.optionalContinue ?? '',
      completionMessage:
        parsed.completionMessage ?? 'You showed up. That counts.',
      safetyNote:
        parsed.safetyNote ?? 'You can stop anytime. If anything hurts, come out.',
    })
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Unknown error'
    res.status(500).json({ error: errMsg })
  }
}
