import { useEffect, useRef, useState } from 'react'
import { catalog } from './catalog'
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

const SUGGESTIONS = [
  "I'm exhausted from work",
  "I'm anxious",
  "Lower back pain",
  "Sat at a desk all day",
  "Can't sleep",
  "Overwhelmed",
  "Need to wake up",
  "Stiff and sore",
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
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [running, setRunning] = useState<Session | null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history, loading])

  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    setInput('')
    setHistory((prev) => [...prev, { role: 'user', text: trimmed }])
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
          Tell me how you feel.
        </h2>
        <p className="mt-1 text-[13px] text-slate-500">
          I'll build a session for your mood and what your body needs right
          now.
        </p>
      </header>

      {history.length === 0 && (
        <div className="flex flex-wrap gap-1.5 px-1">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              disabled={loading}
              className="rounded-full bg-slate-200/70 px-3 py-1 text-[12px] font-medium text-slate-700 transition hover:bg-slate-200 disabled:opacity-60"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {history.map((msg, i) => (
          <MessageView key={i} msg={msg} onRun={runSession} />
        ))}
        {loading && <LoadingBubble />}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          sendMessage(input)
        }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. anxious before a meeting…"
          disabled={loading}
          className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[15px] outline-none transition focus:border-[#0071e3] disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="rounded-xl bg-[#0071e3] px-4 py-2 text-[15px] font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Send
        </button>
      </form>

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

function GeneratedCard({
  session,
  onRun,
}: {
  session: GeneratedSession
  onRun: () => void
}) {
  const minutes = totalMinutes(session.steps)
  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
      <div className="bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-700 p-5 text-white">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/85">
          Custom · {session.steps.length} poses · ~{minutes} min
        </p>
        <h3 className="mt-1 text-xl font-bold leading-tight">
          {session.name}
        </h3>
        <p className="mt-2 text-[13px] leading-relaxed text-white/90">
          {session.description}
        </p>
        <button
          onClick={onRun}
          className="mt-4 w-full rounded-xl bg-white px-4 py-3 text-[15px] font-bold text-slate-900 shadow transition hover:bg-white/90"
        >
          ▶ Start session
        </button>
      </div>

      {session.arc && (
        <div className="border-b border-slate-100 bg-violet-50/40 px-5 py-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-violet-700">
            The arc
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-slate-700">
            {session.arc}
          </p>
        </div>
      )}

      <ol className="divide-y divide-slate-100">
        {session.steps.map((step, i) => (
          <li key={i} className="px-5 py-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[12px] font-bold text-slate-700">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-[15px] font-semibold text-slate-900">
                    {poseName(step.poseId)}
                  </p>
                  <p className="shrink-0 text-[11px] font-medium text-slate-500">
                    {step.durationSec}s{step.perSide ? ' / side' : ''}
                  </p>
                </div>
                {step.cue && (
                  <p className="mt-1 text-[12px] leading-snug text-slate-600">
                    <span className="font-semibold text-slate-700">Cue · </span>
                    {step.cue}
                  </p>
                )}
                {step.rationale && (
                  <p className="mt-2 rounded-lg bg-amber-50/70 px-2.5 py-1.5 text-[12px] leading-snug text-slate-700">
                    <span className="font-semibold text-amber-800">
                      Why ·{' '}
                    </span>
                    {step.rationale}
                  </p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
