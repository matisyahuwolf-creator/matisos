import { useEffect, useRef, useState } from 'react'
import { catalog } from './catalog'
import { poseImageUrl } from './pose-images'
import SessionRunner from './SessionRunner'
import type { Session, SessionStep } from './sessions'

type GeneratedStep = SessionStep & { rationale?: string }

type GeneratedSession = {
  name: string
  description: string
  arc?: string
  steps: GeneratedStep[]
}

type Message =
  | { role: 'user'; text: string }
  | { role: 'assistant'; session?: GeneratedSession; error?: string }

const MOODS: { emoji: string; label: string; prompt: string }[] = [
  {
    emoji: '😰',
    label: 'Fearful',
    prompt:
      "I feel fear or anxiety. There's a charged activation in my nervous system. I need to settle into safety.",
  },
  {
    emoji: '😔',
    label: 'Grieving',
    prompt:
      "I feel sadness or grief — something heavy is pressing on my chest. I need space to feel it and gentle support.",
  },
  {
    emoji: '🔥',
    label: 'Angry',
    prompt:
      "I feel anger or frustration — there's heat I need to move through my body before it gets stuck.",
  },
  {
    emoji: '🌀',
    label: 'Scattered',
    prompt:
      "My mind is scattered, restless, can't focus. I need to gather myself back into my body.",
  },
  {
    emoji: '😶',
    label: 'Numb',
    prompt:
      "I feel disconnected from my body — numb, dissociated. I need to gently come back into sensation.",
  },
  {
    emoji: '🪫',
    label: 'Depleted',
    prompt:
      "I am completely depleted, drained. I have nothing left to give. I need to receive rest.",
  },
  {
    emoji: '🌊',
    label: 'Overwhelmed',
    prompt:
      "Everything feels like too much. My system is flooded. I need a small, contained, simple practice.",
  },
  {
    emoji: '🪨',
    label: 'Stuck',
    prompt:
      "I feel stagnant, frozen, stuck — energy not flowing. I need something to shift and move me.",
  },
  {
    emoji: '🌫️',
    label: 'Foggy',
    prompt:
      'My head is foggy, my thinking unclear. I need to drop out of my head and into the body.',
  },
  {
    emoji: '⚓',
    label: 'Ungrounded',
    prompt:
      "I feel ungrounded, floaty, unsteady. I need to root down into the earth and feel held.",
  },
  {
    emoji: '☀️',
    label: 'Open',
    prompt:
      "I feel open, alive, ready. I want to deepen this feeling and honor it in my body.",
  },
  {
    emoji: '✨',
    label: 'Just guide me',
    prompt: 'I don\'t know what I need. Give me what feels balanced and restorative.',
  },
]

function poseName(id: string): string {
  return catalog.find((p) => p.id === id)?.name ?? id
}

function totalMinutes(steps: SessionStep[]): number {
  const sec = steps.reduce(
    (acc, s) => acc + s.durationSec * (s.perSide ? 2 : 1),
    0,
  )
  return Math.round(sec / 60)
}

export default function Coach() {
  const [history, setHistory] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [running, setRunning] = useState<Session | null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history, loading])

  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    setLoading(true)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 45_000)

    try {
      const poses = catalog.map((p) => ({
        id: p.id,
        name: p.name,
        difficulty: p.difficulty,
      }))
      const res = await fetch('/api/generate-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, poses }),
        signal: controller.signal,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.steps) {
        const msg = data.error ?? `Request failed (${res.status})`
        setHistory((prev) => [...prev, { role: 'assistant', error: msg }])
      } else {
        setHistory((prev) => [...prev, { role: 'assistant', session: data }])
      }
    } catch (err) {
      const isAbort = err instanceof DOMException && err.name === 'AbortError'
      const msg = isAbort
        ? 'Took too long (>45s). Try again — the model may be cold-starting.'
        : err instanceof Error
          ? err.message
          : 'Connection failed'
      setHistory((prev) => [...prev, { role: 'assistant', error: msg }])
    } finally {
      clearTimeout(timeoutId)
      setLoading(false)
    }
  }

  function runSession(gen: GeneratedSession) {
    const minutes = totalMinutes(gen.steps)
    const session: Session = {
      id: `custom-${Date.now()}`,
      name: gen.name,
      focus: 'Heart Opening',
      difficulty: 'Beginner',
      durationMin: minutes,
      icon: '✨',
      gradient: 'from-violet-500 via-purple-600 to-fuchsia-700',
      description: gen.description,
      steps: gen.steps,
    }
    setRunning(session)
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="px-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
          Coach
        </p>
        <h2 className="mt-0.5 text-2xl font-bold text-slate-900">
          How do you feel?
        </h2>
        <p className="mt-1 text-[13px] text-slate-500">
          Tap a mood. I'll build a session for it.
        </p>
      </header>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {MOODS.map((m) => (
          <button
            key={m.label}
            onClick={() => sendMessage(m.prompt)}
            disabled={loading}
            className="flex flex-col items-center gap-1 rounded-xl bg-white p-3 ring-1 ring-black/5 press hover:bg-slate-50 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="text-2xl">{m.emoji}</span>
            <span className="text-[11px] font-semibold text-slate-700">
              {m.label}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {history.map((msg, i) => (
          <MessageView key={i} msg={msg} onRun={runSession} />
        ))}
        {loading && <LoadingBubble />}
        <div ref={endRef} />
      </div>

      {running && (
        <SessionRunner
          session={running}
          onClose={() => setRunning(null)}
        />
      )}
    </div>
  )
}

function MessageView({
  msg,
  onRun,
}: {
  msg: Message
  onRun: (s: GeneratedSession) => void
}) {
  if (msg.role === 'user') {
    return (
      <div className="self-end max-w-[85%] rounded-2xl rounded-br-md bg-[#0071e3] px-4 py-2 text-[14px] text-white">
        {msg.text}
      </div>
    )
  }
  if (msg.error) {
    return (
      <div className="self-start max-w-[85%] rounded-2xl rounded-bl-md bg-red-50 px-4 py-2 text-[13px] text-red-700 ring-1 ring-red-200">
        Couldn't build a session — {msg.error}
      </div>
    )
  }
  if (msg.session) {
    return <GeneratedCard session={msg.session} onRun={() => onRun(msg.session!)} />
  }
  return null
}

function LoadingBubble() {
  return (
    <div className="self-start flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-white px-4 py-2.5 text-[13px] text-slate-500 ring-1 ring-black/5">
      <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:0ms]" />
      <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:150ms]" />
      <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:300ms]" />
      <span className="ml-2">Designing your session…</span>
    </div>
  )
}

function PoseThumbnail({ poseId }: { poseId: string }) {
  return (
    <img
      src={poseImageUrl(poseId, 200)}
      alt=""
      loading="lazy"
      className="h-16 w-16 shrink-0 rounded-xl bg-white object-cover ring-1 ring-black/5"
    />
  )
}

function StepRow({ step, index }: { step: GeneratedStep; index: number }) {
  const [open, setOpen] = useState(false)
  const dur = step.perSide
    ? `${step.durationSec}s / side`
    : `${step.durationSec}s`
  return (
    <li className="px-4 py-3">
      <div className="flex items-start gap-3">
        <PoseThumbnail poseId={step.poseId} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-[15px] font-semibold text-slate-900">
              <span className="text-slate-400">{index + 1}.</span>{' '}
              {poseName(step.poseId)}
            </p>
            <p className="shrink-0 text-[11px] font-medium text-slate-500">
              {dur}
            </p>
          </div>
          {step.cue && (
            <p className="mt-1 text-[12px] leading-snug text-slate-600">
              {step.cue}
            </p>
          )}
          {step.rationale && (
            <button
              onClick={() => setOpen((o) => !o)}
              className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-violet-700 hover:text-violet-900"
            >
              {open ? '− Hide reasoning' : '+ Why this pose'}
            </button>
          )}
          {open && step.rationale && (
            <p className="mt-2 rounded-lg bg-amber-50/60 px-2.5 py-1.5 text-[12px] leading-snug italic text-slate-700">
              {step.rationale}
            </p>
          )}
        </div>
      </div>
    </li>
  )
}

function GeneratedCard({
  session,
  onRun,
}: {
  session: GeneratedSession
  onRun: () => void
}) {
  const minutes = totalMinutes(session.steps)
  const [arcOpen, setArcOpen] = useState(false)
  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
      <div className="bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-700 p-5 text-white">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/85">
          Custom · {session.steps.length} poses · ~{minutes} min
        </p>
        <h3 className="mt-1 text-xl font-bold leading-tight">{session.name}</h3>
        <p className="mt-2 text-[13px] leading-relaxed text-white/90">
          {session.description}
        </p>
        <button
          onClick={onRun}
          className="mt-4 w-full rounded-xl bg-white px-4 py-3 text-[15px] font-bold text-slate-900 shadow press hover:bg-white/90"
        >
          ▶ Start session
        </button>
      </div>

      {session.arc && (
        <div className="border-b border-slate-100 px-5 py-3">
          <button
            onClick={() => setArcOpen((o) => !o)}
            className="flex w-full items-center justify-between text-[11px] font-bold uppercase tracking-[0.12em] text-violet-700"
          >
            <span>The arc</span>
            <span className="text-[12px]">{arcOpen ? '−' : '+'}</span>
          </button>
          {arcOpen && (
            <p className="mt-1.5 text-[12px] leading-relaxed italic text-slate-600">
              {session.arc}
            </p>
          )}
        </div>
      )}

      <ol className="divide-y divide-slate-100">
        {session.steps.map((step, i) => (
          <StepRow key={i} step={step} index={i} />
        ))}
      </ol>
    </div>
  )
}
