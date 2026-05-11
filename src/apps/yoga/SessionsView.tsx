import { useMemo, useState } from 'react'
import { catalog } from './catalog'
import { sessions, type Session, type SessionStep } from './sessions'
import SessionRunner from './SessionRunner'

function formatMin(min: number) {
  return `${min} min`
}

function formatSec(sec: number) {
  if (sec >= 60 && sec % 60 === 0) return `${sec / 60} min`
  if (sec >= 60) {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }
  return `${sec}s`
}

function poseName(id: string): string {
  return catalog.find((p) => p.id === id)?.name ?? id
}

function totalDuration(session: Session): number {
  return session.steps.reduce(
    (acc, s) => acc + s.durationSec * (s.perSide ? 2 : 1),
    0,
  )
}

export default function Sessions() {
  const [openId, setOpenId] = useState<string | null>(null)
  const [runningId, setRunningId] = useState<string | null>(null)
  const open = useMemo(
    () => sessions.find((s) => s.id === openId) ?? null,
    [openId],
  )
  const running = useMemo(
    () => sessions.find((s) => s.id === runningId) ?? null,
    [runningId],
  )

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between px-1">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
          Sessions · {sessions.length}
        </h3>
        <span className="text-[11px] text-slate-400">tap to view</span>
      </div>

      <p className="rounded-lg bg-slate-100 px-3 py-2 text-[12px] leading-snug text-slate-600">
        These are guided sequences for self-practice. They aren't a substitute
        for therapy or working with a trauma-informed teacher. Exit any
        position at any time.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {sessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            isOpen={openId === session.id}
            onClick={() =>
              setOpenId(openId === session.id ? null : session.id)
            }
          />
        ))}
      </div>

      {open && (
        <SessionDetail
          session={open}
          onClose={() => setOpenId(null)}
          onStart={() => setRunningId(open.id)}
        />
      )}
      {running && (
        <SessionRunner
          session={running}
          onClose={() => setRunningId(null)}
        />
      )}
    </section>
  )
}

function SessionCard({
  session,
  isOpen,
  onClick,
}: {
  session: Session
  isOpen: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col gap-2 overflow-hidden rounded-2xl bg-gradient-to-br ${session.gradient} p-4 text-left text-white shadow-[0_4px_16px_-8px_rgba(0,0,0,0.3)] transition-transform duration-200 active:scale-[0.99] ${
        isOpen ? 'ring-2 ring-white/40' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="text-3xl">{session.icon}</span>
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur">
          {session.difficulty}
        </span>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/80">
          {session.focus}
        </p>
        <h4 className="text-lg font-bold leading-tight">{session.name}</h4>
      </div>
      <div className="mt-auto flex items-center justify-between pt-2 text-[12px] font-medium text-white/85">
        <span>{formatMin(session.durationMin)}</span>
        <span>{session.steps.length} steps →</span>
      </div>
    </button>
  )
}

function SessionDetail({
  session,
  onClose,
  onStart,
}: {
  session: Session
  onClose: () => void
  onStart: () => void
}) {
  const total = totalDuration(session)
  const totalMin = Math.round(total / 60)

  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
      <div
        className={`bg-gradient-to-br ${session.gradient} p-5 text-white`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="text-4xl">{session.icon}</span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/85">
                {session.focus} · {session.difficulty} · ~{totalMin} min
              </p>
              <h3 className="mt-0.5 text-2xl font-bold leading-tight">
                {session.name}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-full bg-white/20 px-2 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur transition hover:bg-white/30"
            aria-label="Close session"
          >
            Close
          </button>
        </div>
        <p className="mt-3 text-[13px] leading-relaxed text-white/90">
          {session.description}
        </p>
        <button
          onClick={onStart}
          className="mt-4 w-full rounded-xl bg-white px-4 py-3 text-[15px] font-bold text-slate-900 shadow transition hover:bg-white/90"
        >
          ▶ Start session
        </button>
      </div>

      <ol className="divide-y divide-slate-100">
        {session.steps.map((step, i) => (
          <StepRow key={i} index={i + 1} step={step} />
        ))}
      </ol>
    </div>
  )
}

function StepRow({ index, step }: { index: number; step: SessionStep }) {
  const name = poseName(step.poseId)
  const durationLabel = step.perSide
    ? `${formatSec(step.durationSec)} per side`
    : formatSec(step.durationSec)
  return (
    <li className="flex gap-3 px-4 py-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[12px] font-bold text-slate-700">
        {index}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <p className="text-[15px] font-semibold text-slate-900">{name}</p>
          <p className="text-[12px] font-medium text-slate-500">
            {durationLabel}
          </p>
        </div>
        {step.cue && (
          <p className="mt-1 text-[13px] leading-snug text-slate-600">
            {step.cue}
          </p>
        )}
      </div>
    </li>
  )
}
