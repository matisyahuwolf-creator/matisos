import { useMemo, useState } from 'react'
import { sessions, type Session } from './sessions'
import SessionRunner from './SessionRunner'
import { MODALITIES, type Modality } from './modalities'

function formatMin(min: number) {
  return `${min} min`
}

export default function Sessions({ modality }: { modality: Modality }) {
  const [runningId, setRunningId] = useState<string | null>(null)
  const filtered = useMemo(
    () => sessions.filter((s) => s.modality === modality),
    [modality],
  )
  const running = useMemo(
    () => sessions.find((s) => s.id === runningId) ?? null,
    [runningId],
  )
  const modalityMeta = MODALITIES[modality]

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between px-1">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
          {modalityMeta.name} sessions · {filtered.length}
        </h3>
        <span className="text-[11px] text-slate-400">tap to begin</span>
      </div>

      {modality === 'yoga' && (
        <p className="rounded-lg bg-slate-100 px-3 py-2 text-[12px] leading-snug text-slate-600">
          These are guided sequences for self-practice. They aren't a substitute
          for therapy or working with a trauma-informed teacher. Exit any
          position at any time.
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
          No {modalityMeta.name.toLowerCase()} sessions yet. Coming soon.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtered.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onClick={() => setRunningId(session.id)}
            />
          ))}
        </div>
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
  onClick,
}: {
  session: Session
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`psychedelic-shimmer group relative flex flex-col gap-2 overflow-hidden rounded-2xl bg-gradient-to-br ${session.gradient} p-4 text-left text-white shadow-[0_4px_16px_-8px_rgba(0,0,0,0.3)] press hover:brightness-105 active:scale-[0.99]`}
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
        <span className="font-bold uppercase tracking-[0.12em]">Begin ▶</span>
      </div>
    </button>
  )
}

