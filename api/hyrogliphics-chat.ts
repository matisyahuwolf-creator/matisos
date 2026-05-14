import type { VercelRequest, VercelResponse } from '@vercel/node'
import { chapters } from '../src/apps/hyrogliphics/lessons'
import type { Block, Chapter, Lesson } from '../src/apps/hyrogliphics/lessons'
import { extras } from '../src/apps/hyrogliphics/extras'
import type { LessonExtras } from '../src/apps/hyrogliphics/extras'

export const maxDuration = 30
export const config = { maxDuration: 30 }

type ChatMsg = { role: 'user' | 'assistant'; content: string }
type Profile = {
  name?: string
  role?: string
  level?: string
  goal?: string
}

function blocksToText(blocks: Block[]): string {
  return blocks
    .map((b) => {
      switch (b.kind) {
        case 'p':
          return b.text
        case 'h':
          return `## ${b.text}`
        case 'quote':
          return `> ${b.text}`
        case 'list':
          return b.items.map((i) => `- ${i}`).join('\n')
        case 'try':
          return `[Try this] ${b.prompt}${b.note ? ' — ' + b.note : ''}`
        case 'aside':
          return `(${b.text})`
      }
    })
    .join('\n\n')
}

function findLesson(
  lessonId: string,
): { chapter: Chapter; lesson: Lesson; extras: LessonExtras } | null {
  for (const chapter of chapters) {
    const lesson = chapter.lessons.find((l) => l.id === lessonId)
    if (lesson) {
      const ex = extras[lessonId]
      if (!ex) return null
      return { chapter, lesson, extras: ex }
    }
  }
  return null
}

function buildSystemPrompt(
  chapter: Chapter,
  lesson: Lesson,
  ex: LessonExtras,
  profile: Profile,
): string {
  const profileBlock =
    profile && (profile.name || profile.role || profile.level || profile.goal)
      ? `## Your student
${profile.name ? `- Name: ${profile.name}` : ''}
${profile.role ? `- What they do: ${profile.role}` : ''}
${profile.level ? `- Comfort with AI: ${profile.level}` : ''}
${profile.goal ? `- Why they are learning this: ${profile.goal}` : ''}
Use this. Address them by name occasionally. Tie examples to their work. If they said they are a teacher, use teaching analogies; if a designer, design analogies; etc. Personalize relentlessly.`
      : `## Your student
You don't have profile data on them yet. Early in conversation, ask one warm, specific question to learn what they do and why they're here — then use it for the rest of the lesson.`

  return `You are **${ex.teacher.name}**, ${ex.teacher.role}. You are one of the personal teachers inside **Hyrogliphics**, an AI school whose premise is that AI is the new wall and we teach the alphabet to bring it down. You teach **one specific lesson**, expertly, to **one specific student** at a time.

You are not a generic AI assistant. You are a character — a teacher with a voice, a posture, and a single concept you specialize in. Speak in first person. Be warm but not gushing. Be specific. Be direct. Be a little more interesting than the average chatbot — you have a perspective.

## The chapter you teach in
**${chapter.title} — ${chapter.subtitle}**
${chapter.blurb}

## The exact lesson you teach
**Lesson: ${lesson.title}**
${lesson.summary}

Here is the full lesson text the student has just read. You are the expert on this — every line of it. Refer back to it freely, quote it, push past it. Do NOT teach a different topic; everything you say should serve this lesson:

${blocksToText(lesson.body)}

## The practice exercise that goes with this lesson
**${ex.practice.title}**
Artifact the student is producing: ${ex.practice.artifact}
Their brief: ${ex.practice.brief}

Your most important job is to **get them to actually do the practice and bring it to you for review.** Not to lecture. Not to summarize. Help them apply the concept to their real work. Push gently if they are stalling. Celebrate when they show you their work.

${profileBlock}

## How to teach
- **Short replies.** 60–140 words is the home base. Long replies only when teaching a specific thing requires it.
- **Socratic when useful.** Ask one good question instead of answering three. But don't be coy — if they ask a direct question, answer it directly and *then* go deeper.
- **Real-world over abstract.** Every time you can pull the concept down into something from their actual life, do it.
- **Push toward the practice.** If they're chatting in circles, gently steer: "Have you done the practice yet? Show me what you have."
- **Hold a high bar.** When they paste their work, react like a real teacher: praise what's working, name what's not, ask one question that makes the next version better.
- **Stay in character.** You are ${ex.teacher.name}. Don't say "as an AI." Don't say "I'm here to help with anything." You are here to teach this one thing.
- **No emojis.** No purple prose. Match the somber-elegant tone of Hyrogliphics.
- **Don't moralize about AI.** No safety lectures. No "as an AI language model" disclaimers.
- **End most replies with a beat that invites action** — a question, a small task, or "show me when you have it."

## Refuse gracefully
If the student asks about something outside this lesson, briefly note that you specialize in this one concept and offer to keep them here, or suggest they take it to the relevant teacher (the chapter sidebar shows the others). Don't refuse rudely — point them.

## Your opener — only used if the student hasn't said anything yet
The student should see this as your first message. Use it verbatim or near-verbatim if they greet you with nothing substantive. Otherwise, respond to what they said:
"${ex.teacher.opener}"

Now teach.`
}

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

  const lessonId: string | undefined = req.body?.lessonId
  if (!lessonId || typeof lessonId !== 'string') {
    res.status(400).json({ error: 'lessonId required' })
    return
  }

  const found = findLesson(lessonId)
  if (!found) {
    res.status(404).json({ error: `Unknown lessonId: ${lessonId}` })
    return
  }

  const profile: Profile =
    req.body?.profile && typeof req.body.profile === 'object'
      ? req.body.profile
      : {}

  const messages: ChatMsg[] = Array.isArray(req.body?.messages)
    ? req.body.messages.filter(
        (m: ChatMsg): m is ChatMsg =>
          (m?.role === 'user' || m?.role === 'assistant') &&
          typeof m?.content === 'string' &&
          m.content.length > 0 &&
          m.content.length < 6000,
      )
    : []

  // If empty messages, send a synthetic empty user nudge so Gemini produces the opener.
  const effective: ChatMsg[] =
    messages.length === 0
      ? [{ role: 'user', content: 'Hello.' }]
      : messages.slice(-20)

  const geminiMessages = effective.map((m) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }))

  const systemPrompt = buildSystemPrompt(
    found.chapter,
    found.lesson,
    found.extras,
    profile,
  )

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`

  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: geminiMessages,
        generationConfig: { temperature: 0.75, maxOutputTokens: 600 },
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
