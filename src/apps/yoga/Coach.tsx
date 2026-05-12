import { useEffect, useRef, useState } from 'react'
import { catalog } from './catalog'
import { poseImageUrl } from './pose-images'
import SessionRunner from './SessionRunner'
import type { Session, SessionStep } from './sessions'

type FirstMove = {
  poseId: string
  instruction: string
  durationSec: number
  whyItHelps: string
}

type StarterStep = {
  poseId: string
  instruction: string
  durationSec: number
  breathingCue?: string
  energyLevel?: string
}

type StarterSession = {
  title: string
  state: string
  durationSec: number
  openingReassurance: string
  firstMove: FirstMove
  steps: StarterStep[]
  optionalContinue: string
  completionMessage: string
  safetyNote: string
}

const STATES: { emoji: string; label: string; prompt: string }[] = [
  {
    emoji: '❄️',
    label: 'Frozen',
    prompt:
      "I feel frozen — shut down, numb, can't move. Use Frozen Mode. Start with one breath or one touch. Seated or lying down.",
  },
  {
    emoji: '⚡',
    label: 'Restless',
    prompt:
      'I feel restless — too much energy, agitated, anxious. Use Restless Mode. Start with gentle movement before stillness.',
  },
  {
    emoji: '🪢',
    label: 'Tense',
    prompt:
      'I feel tense — contracted, gripping, tight. Use Restless Mode. Move to release before any stillness.',
  },
  {
    emoji: '🌀',
    label: 'Scattered',
    prompt:
      "I feel scattered — can't focus, ADHD-brain, too many things. Use Scattered Mode. One pose, short and concrete. No choices.",
  },
  {
    emoji: '🪨',
    label: 'Heavy',
    prompt:
      'I feel heavy — depleted, weighted down, dorsal-vagal. Use Frozen Mode. Very small. Lying down is fine.',
  },
  {
    emoji: '🙈',
    label: 'Avoiding',
    prompt:
      "I've been avoiding starting. Use Just Start Mode with extra dignity. Smallest possible action. No reference to 'finally' or 'consistency'.",
  },
  {
    emoji: '😞',
    label: 'Ashamed',
    prompt:
      'I feel ashamed — like I failed again. Use Shame Mode. Long opening reassurance. No streak language. No guilt. Dignity first.',
  },
  {
    emoji: '😴',
    label: 'Tired',
    prompt:
      'I feel tired — low energy. Use Frozen Mode with very gentle movement. Permission to do almost nothing.',
  },
  {
    emoji: '▶️',
    label: 'Just start',
    prompt:
      'I just need to start. Use Just Start Mode. Give me the smallest possible action — one breath, one stretch.',
  },
]

const LOADING_STATUSES = [
  'Meeting you where you are',
  'Listening to your body',
  'Finding the smallest step',
  'Making it safe to begin',
  'Almost there',
]

function poseName(id: string): string {
  return catalog.find((p) => p.id === id)?.name ?? id
}

export default function Coach() {
  const [history, setHistory] = useState<StarterSession[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [running, setRunning] = useState<Session | null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history, loading])

  async function generate(promptText: string) {
    if (loading) return
    setError(null)
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
        body: JSON.stringify({ message: promptText, poses }),
        signal: controller.signal,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.firstMove) {
        throw new Error(data.error ?? `Request failed (${res.status})`)
      }
      setHistory((prev) => [data as StarterSession, ...prev])
    } catch (err) {
      const isAbort = err instanceof DOMException && err.name === 'AbortError'
      const msg = isAbort
        ? 'Took too long. Try again in a moment.'
        : err instanceof Error
          ? err.message
          : 'Something got in the way. Try again.'
      setError(msg)
    } finally {
      clearTimeout(timeoutId)
      setLoading(false)
    }
  }

  function runStarter(s: StarterSession) {
    const steps: SessionStep[] = [
      {
        poseId: s.firstMove.poseId,
        durationSec: s.firstMove.durationSec,
        cue: s.firstMove.instruction,
        rationale: s.firstMove.whyItHelps,
      },
      ...s.steps.map((step) => ({
        poseId: step.poseId,
        durationSec: step.durationSec,
        cue: step.breathingCue
          ? `${step.instruction} ${step.breathingCue}`
          : step.instruction,
      })),
    ]
    const session: Session = {
      id: `starter-${Date.now()}`,
      name: s.title,
      focus: 'Grounding',
      difficulty: 'Beginner',
      durationMin: Math.max(1, Math.round(s.durationSec / 60)),
      icon: '✨',
      gradient: 'from-violet-500 via-purple-600 to-fuchsia-700',
      description: s.openingReassurance,
      steps,
    }
    setRunning(session)
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="px-1">
        <h2 className="font-display text-[36px] italic leading-[1.05] tracking-tight text-slate-900 sm:text-[44px]">
          Come as you are.
        </h2>
        <p className="mt-3 max-w-md text-[15px] leading-relaxed text-slate-600">
          Where are you right now? Tap one — I'll help you begin with the
          smallest reset that works.
        </p>
      </header>

      <div className="grid grid-cols-3 gap-2">
        {STATES.map((s) => (
          <button
            key={s.label}
            onClick={() => generate(s.prompt)}
            disabled={loading}
            className="flex flex-col items-center gap-1 rounded-2xl bg-white p-3 ring-1 ring-black/5 press hover:bg-slate-50 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="text-2xl">{s.emoji}</span>
            <span className="text-[11px] font-semibold text-slate-700">
              {s.label}
            </span>
          </button>
        ))}
      </div>

      {loading && <LoadingMandala />}

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-800 ring-1 ring-red-200">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {history.map((s, i) => (
          <StarterCard key={i} starter={s} onRun={() => runStarter(s)} />
        ))}
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

function StarterCard({
  starter,
  onRun,
}: {
  starter: StarterSession
  onRun: () => void
}) {
  const totalMin = Math.max(1, Math.round(starter.durationSec / 60))
  const totalLabel =
    starter.durationSec < 60
      ? `${starter.durationSec}s`
      : starter.durationSec < 120
        ? `~1 min`
        : `~${totalMin} min`

  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
      <button
        onClick={onRun}
        className="psychedelic-shimmer w-full bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-700 p-5 text-left text-white press hover:brightness-105 active:scale-[0.995]"
      >
        {starter.state && (
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/85">
            {starter.state} · {totalLabel}
          </p>
        )}
        <h3 className="mt-1 font-display text-[26px] italic leading-tight">
          {starter.title}
        </h3>
        {starter.openingReassurance && (
          <p className="mt-3 text-[14px] leading-relaxed text-white/95">
            {starter.openingReassurance}
          </p>
        )}
        <div className="mt-4 flex items-center justify-between rounded-xl bg-white/15 px-4 py-3 backdrop-blur">
          <span className="text-[13px] font-bold uppercase tracking-[0.12em]">
            Begin
          </span>
          <span className="text-lg">▶</span>
        </div>
      </button>

      <div className="border-b border-slate-100 bg-amber-50/40 px-5 py-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-800">
          First move
        </p>
        <div className="mt-2 flex items-start gap-3">
          <img
            src={poseImageUrl(starter.firstMove.poseId, 200)}
            alt=""
            loading="lazy"
            className="h-16 w-16 shrink-0 rounded-xl bg-white object-cover ring-1 ring-black/5"
          />
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold text-slate-900">
              {poseName(starter.firstMove.poseId)}
              <span className="ml-2 text-[11px] font-medium text-slate-500">
                {starter.firstMove.durationSec}s
              </span>
            </p>
            <p className="mt-1 text-[13px] leading-snug text-slate-700">
              {starter.firstMove.instruction}
            </p>
            {starter.firstMove.whyItHelps && (
              <p className="mt-1.5 text-[12px] italic leading-snug text-slate-500">
                {starter.firstMove.whyItHelps}
              </p>
            )}
          </div>
        </div>
      </div>

      {starter.steps.length > 0 && (
        <ol className="divide-y divide-slate-100">
          {starter.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3 px-5 py-3">
              <img
                src={poseImageUrl(step.poseId, 160)}
                alt=""
                loading="lazy"
                className="h-12 w-12 shrink-0 rounded-lg bg-white object-cover ring-1 ring-black/5"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-slate-900">
                  {poseName(step.poseId)}
                  <span className="ml-2 text-[11px] font-medium text-slate-500">
                    {step.durationSec}s
                  </span>
                </p>
                <p className="mt-0.5 text-[12px] leading-snug text-slate-600">
                  {step.instruction}
                </p>
                {step.breathingCue && (
                  <p className="mt-0.5 text-[11px] leading-snug text-slate-500">
                    {step.breathingCue}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}

      {starter.safetyNote && (
        <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-[11px] italic leading-relaxed text-slate-500">
          {starter.safetyNote}
        </div>
      )}
    </div>
  )
}

function LoadingMandala() {
  const [statusIndex, setStatusIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setStatusIndex((i) => (i + 1) % LOADING_STATUSES.length)
    }, 2200)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="relative flex flex-col items-center justify-center gap-6 overflow-hidden rounded-2xl bg-gradient-to-br from-violet-50 via-rose-50 to-amber-50 px-4 py-10 ring-1 ring-violet-200/40">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-violet-300/35 via-fuchsia-300/30 to-amber-300/35 blur-3xl"
        style={{ animation: 'hueShift 10s linear infinite' }}
      />
      <div
        className="relative h-36 w-36"
        style={{ animation: 'hueShift 14s linear infinite' }}
      >
        <svg
          className="absolute inset-0"
          viewBox="0 0 200 200"
          style={{
            animation: 'mandalaSlow 28s linear infinite',
            transformOrigin: 'center',
          }}
          aria-hidden
        >
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180
            const cx = 100 + 88 * Math.cos(angle)
            const cy = 100 + 88 * Math.sin(angle)
            return <circle key={i} cx={cx} cy={cy} r="3" fill="#a78bfa" />
          })}
        </svg>
        <svg
          className="absolute inset-0"
          viewBox="0 0 200 200"
          style={{
            animation: 'mandalaSlow 18s linear infinite reverse',
            transformOrigin: 'center',
          }}
          aria-hidden
        >
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = (i * 60 * Math.PI) / 180
            const cx = 100 + 58 * Math.cos(angle)
            const cy = 100 + 58 * Math.sin(angle)
            return (
              <ellipse
                key={i}
                cx={cx}
                cy={cy}
                rx="9"
                ry="14"
                fill="#ec4899"
                opacity="0.7"
                transform={`rotate(${i * 60} ${cx} ${cy})`}
              />
            )
          })}
        </svg>
        <div
          className="absolute left-1/2 top-1/2 h-12 w-12 rounded-full bg-gradient-to-br from-amber-300 via-rose-400 to-fuchsia-500 shadow-xl"
          style={{ animation: 'mandalaBreath 3s ease-in-out infinite' }}
        />
      </div>
      <div className="relative h-5 w-full text-center">
        {LOADING_STATUSES.map((s, i) => (
          <p
            key={s}
            className="absolute inset-0 text-[12px] font-medium uppercase tracking-[0.16em] text-violet-800/80 transition-opacity duration-500"
            style={{ opacity: statusIndex === i ? 1 : 0 }}
          >
            {s}…
          </p>
        ))}
      </div>
    </div>
  )
}
