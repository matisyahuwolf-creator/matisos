import { useMemo, useState } from 'react'
import { storage } from '../../lib/storage'
import {
  phaseFor,
  phaseStartWeek,
  tracks,
  type Track,
  type TrackPhase,
} from './tracks'
import { sessions } from './sessions'
import { countSessionsInWindow, loadHistory } from './history'
import { MODALITIES, type Modality } from './modalities'

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

type ActiveTrackState = {
  trackId: string
  startedAt: number
  currentWeek: number
}

const KEY = 'yoga:track-v1'

function loadActive(): ActiveTrackState | null {
  const raw = storage.get(KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as ActiveTrackState
  } catch {
    return null
  }
}

function saveActive(state: ActiveTrackState | null) {
  if (state === null) storage.remove(KEY)
  else storage.set(KEY, JSON.stringify(state))
}

function sessionMeta(id: string) {
  const s = sessions.find((s) => s.id === id)
  return {
    name: s?.name ?? id,
    icon: s?.icon ?? '🧘',
    gradient: s?.gradient ?? 'from-slate-500 to-slate-700',
    durationMin: s?.durationMin ?? 0,
  }
}

export default function TracksView({ modality }: { modality: Modality }) {
  const [active, setActive] = useState<ActiveTrackState | null>(() =>
    loadActive(),
  )
  const [openTrackId, setOpenTrackId] = useState<string | null>(null)
  const appWideTracks = useMemo(
    () => tracks.filter((t) => t.appWide),
    [],
  )
  const filteredTracks = useMemo(
    () => tracks.filter((t) => !t.appWide && t.modality === modality),
    [modality],
  )
  const modalityMeta = MODALITIES[modality]

  function startTrack(trackId: string) {
    const state: ActiveTrackState = {
      trackId,
      startedAt: Date.now(),
      currentWeek: 1,
    }
    setActive(state)
    saveActive(state)
    setOpenTrackId(null)
  }

  function endTrack() {
    if (
      !confirm(
        'End the current program? You can start it again later, but your week progress will be lost.',
      )
    )
      return
    setActive(null)
    saveActive(null)
  }

  function advanceWeek(delta: number) {
    if (!active) return
    const track = tracks.find((t) => t.id === active.trackId)
    if (!track) return
    const newWeek = Math.max(
      1,
      Math.min(track.totalWeeks, active.currentWeek + delta),
    )
    const newState = { ...active, currentWeek: newWeek }
    setActive(newState)
    saveActive(newState)
  }

  const activeTrack = useMemo(
    () => (active ? tracks.find((t) => t.id === active.trackId) ?? null : null),
    [active],
  )

  const openTrack = useMemo(
    () => tracks.find((t) => t.id === openTrackId) ?? null,
    [openTrackId],
  )

  if (activeTrack && active) {
    return (
      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between px-1">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
            Active program
          </h3>
        </div>
        <ActiveTrackPanel
          track={activeTrack}
          state={active}
          onAdvance={() => advanceWeek(1)}
          onBack={() => advanceWeek(-1)}
          onEnd={endTrack}
          onViewRoadmap={() => setOpenTrackId(activeTrack.id)}
        />
        {openTrack && (
          <TrackDetail
            track={openTrack}
            currentWeek={active.currentWeek}
            onClose={() => setOpenTrackId(null)}
          />
        )}
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-5">
      {appWideTracks.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between px-1">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
              The path · {appWideTracks.length}
            </h3>
            <span className="text-[11px] text-slate-400">all six modalities</span>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {appWideTracks.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                isOpen={openTrackId === track.id}
                onClick={() =>
                  setOpenTrackId(openTrackId === track.id ? null : track.id)
                }
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between px-1">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
            {modalityMeta.name} programs · {filteredTracks.length}
          </h3>
          <span className="text-[11px] text-slate-400">deeper dives</span>
        </div>
        {filteredTracks.length === 0 ? (
          <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
            No {modalityMeta.name.toLowerCase()}-specific programs yet. The
            full daily path above already covers this modality.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredTracks.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                isOpen={openTrackId === track.id}
                onClick={() =>
                  setOpenTrackId(openTrackId === track.id ? null : track.id)
                }
              />
            ))}
          </div>
        )}
      </div>

      {openTrack && (
        <TrackDetail
          track={openTrack}
          onClose={() => setOpenTrackId(null)}
          onStart={() => startTrack(openTrack.id)}
        />
      )}
    </section>
  )
}

function TrackCard({
  track,
  isOpen,
  onClick,
}: {
  track: Track
  isOpen: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${track.gradient} p-5 text-left text-white shadow-[0_6px_20px_-8px_rgba(0,0,0,0.3)] transition-transform duration-200 active:scale-[0.99] ${
        isOpen ? 'ring-2 ring-white/40' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-4xl">{track.icon}</span>
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur">
          {track.subtitle}
        </span>
      </div>
      <h4 className="mt-3 text-2xl font-bold leading-tight">{track.name}</h4>
      <p className="mt-2 text-[13px] leading-relaxed text-white/85">
        {track.description}
      </p>
      <div className="mt-3 text-[11px] font-bold uppercase tracking-wider text-white/80">
        {track.phases.length} phases · {isOpen ? 'tap to close' : 'tap to view roadmap'}
      </div>
    </button>
  )
}

function SkillPointsBar({
  track,
  state,
  phase,
}: {
  track: Track
  state: ActiveTrackState
  phase: TrackPhase
}) {
  const earned = useMemo(() => {
    const history = loadHistory()
    const since = state.startedAt
    return history.filter((h) => h.completedAt >= since).length
  }, [state.startedAt])

  // Phase goal: each phase has a target number of sessions (3 sessions/wk × weeks)
  const phaseGoal = phase.weeks * 3
  const phasesBefore = track.phases.slice(
    0,
    track.phases.findIndex((p) => p.id === phase.id),
  )
  const prevPhaseGoals = phasesBefore.reduce(
    (sum, p) => sum + p.weeks * 3,
    0,
  )
  const earnedInPhase = Math.max(0, earned - prevPhaseGoals)
  const pct = Math.min(100, (earnedInPhase / phaseGoal) * 100)

  return (
    <div className="rounded-xl bg-gradient-to-br from-amber-50 via-rose-50 to-violet-50 px-3 py-3 ring-1 ring-amber-200/40">
      <div className="flex items-baseline justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-800">
          Skill points · {phase.name}
        </p>
        <p className="text-[13px] font-bold text-slate-900">
          {earnedInPhase}{' '}
          <span className="text-[11px] font-medium text-slate-500">
            / {phaseGoal}
          </span>
        </p>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/70">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 via-rose-400 to-violet-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1.5 text-[11px] text-slate-600">
        {earnedInPhase >= phaseGoal
          ? "You've reached this phase's goal. Move on whenever you're ready."
          : `${phaseGoal - earnedInPhase} sessions to reach this phase's goal.`}
      </p>
    </div>
  )
}

function ActiveTrackPanel({
  track,
  state,
  onAdvance,
  onBack,
  onEnd,
  onViewRoadmap,
}: {
  track: Track
  state: ActiveTrackState
  onAdvance: () => void
  onBack: () => void
  onEnd: () => void
  onViewRoadmap: () => void
}) {
  const phase = phaseFor(track, state.currentWeek)
  const phaseStart = phaseStartWeek(track, phase.id)
  const weekInPhase = state.currentWeek - phaseStart + 1
  const progressPct = (state.currentWeek / track.totalWeeks) * 100

  const days = Math.floor((Date.now() - state.startedAt) / (1000 * 60 * 60 * 24))

  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
      <div
        className={`bg-gradient-to-br ${track.gradient} p-5 text-white`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="text-3xl">{track.icon}</span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/85">
                {phase.name} · Week {weekInPhase} of {phase.weeks}
              </p>
              <h3 className="mt-0.5 text-xl font-bold leading-tight">
                {track.name}
              </h3>
            </div>
          </div>
          <button
            onClick={onEnd}
            className="shrink-0 rounded-full bg-white/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur transition hover:bg-white/25"
          >
            End
          </button>
        </div>

        <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full bg-white/85 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-white/80">
          <span>
            Week {state.currentWeek} of {track.totalWeeks}
          </span>
          <span>
            Day {days + 1} since start
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={onBack}
            disabled={state.currentWeek === 1}
            className="rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-semibold backdrop-blur transition hover:bg-white/25 disabled:opacity-40"
          >
            ← Prev week
          </button>
          <button
            onClick={onAdvance}
            disabled={state.currentWeek === track.totalWeeks}
            className="rounded-full bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-900 transition hover:bg-white/90 disabled:opacity-40"
          >
            Mark week done →
          </button>
          <button
            onClick={onViewRoadmap}
            className="ml-auto rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-semibold backdrop-blur transition hover:bg-white/25"
          >
            Roadmap
          </button>
        </div>
      </div>

      <div className="p-4">
        <SkillPointsBar track={track} state={state} phase={phase} />
        <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
          This week’s mix · {phase.weeklyMinutes}
        </p>
        <ul className="mt-2 flex flex-col gap-2">
          {phase.weeklyMix.map((mix) => {
            const meta = sessionMeta(mix.sessionId)
            const completedThisWeek = countSessionsInWindow(
              mix.sessionId,
              WEEK_MS,
            )
            const done = Math.min(completedThisWeek, mix.perWeek)
            const isDone = done >= mix.perWeek
            return (
              <li
                key={mix.sessionId}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 transition ${
                  isDone ? 'bg-emerald-50' : 'bg-slate-50'
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br ${meta.gradient} text-lg`}
                >
                  <span>{meta.icon}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-slate-900">
                    {meta.name}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">
                    {meta.durationMin} min · {done}/{mix.perWeek} this week
                  </p>
                </div>
                {isDone ? (
                  <span className="shrink-0 text-emerald-600" aria-label="done">
                    <svg width="20" height="20" viewBox="0 0 20 20">
                      <path
                        d="M4 10l4 4 8-8"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                ) : (
                  <span className="shrink-0 text-[11px] font-bold text-slate-400">
                    {mix.perWeek - done} to go
                  </span>
                )}
              </li>
            )
          })}
        </ul>
        <p className="mt-3 px-1 text-[11px] text-slate-400">
          Tap a session in the Sessions tab — completed sessions check off here automatically.
        </p>
      </div>
    </div>
  )
}

function TrackDetail({
  track,
  currentWeek,
  onClose,
  onStart,
}: {
  track: Track
  currentWeek?: number
  onClose: () => void
  onStart?: () => void
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
      <div className={`bg-gradient-to-br ${track.gradient} p-5 text-white`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="text-4xl">{track.icon}</span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/85">
                {track.subtitle}
              </p>
              <h3 className="mt-0.5 text-2xl font-bold leading-tight">
                {track.name}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-full bg-white/20 px-2 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur transition hover:bg-white/30"
          >
            Close
          </button>
        </div>
        <p className="mt-3 text-[13px] leading-relaxed text-white/90">
          {track.description}
        </p>
        {onStart && (
          <button
            onClick={onStart}
            className="mt-4 w-full rounded-xl bg-white px-4 py-3 text-[15px] font-bold text-slate-900 shadow transition hover:bg-white/90"
          >
            Start program
          </button>
        )}
      </div>

      <ol className="divide-y divide-slate-100">
        {track.phases.map((phase, i) => (
          <PhaseRow
            key={phase.id}
            phase={phase}
            phaseStart={phaseStartWeek(track, phase.id)}
            isCurrent={
              currentWeek !== undefined &&
              currentWeek >= phaseStartWeek(track, phase.id) &&
              currentWeek < phaseStartWeek(track, phase.id) + phase.weeks
            }
            index={i + 1}
          />
        ))}
      </ol>

      <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-[11px] leading-snug text-slate-500">
        This is a flexible framework, not a prescription. Real progression
        depends on your body, your consistency, and your history. Markers are
        reference points — not requirements.
      </div>
    </div>
  )
}

function PhaseRow({
  phase,
  phaseStart,
  isCurrent,
  index,
}: {
  phase: TrackPhase
  phaseStart: number
  isCurrent: boolean
  index: number
}) {
  return (
    <li
      className={`px-5 py-4 ${isCurrent ? 'bg-emerald-50/60' : ''}`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${
            isCurrent
              ? 'bg-emerald-500 text-white'
              : 'bg-slate-200 text-slate-700'
          }`}
        >
          {index}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <h4 className="text-[16px] font-bold text-slate-900">
              {phase.name}
            </h4>
            <p className="text-[11px] font-medium text-slate-500">
              Weeks {phaseStart}–{phaseStart + phase.weeks - 1} · {phase.weeklyMinutes}
            </p>
            {isCurrent && (
              <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                You are here
              </span>
            )}
          </div>
          <p className="mt-1 text-[13px] leading-relaxed text-slate-600">
            {phase.description}
          </p>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Goals
              </p>
              <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[12px] text-slate-700">
                {phase.goals.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Markers
              </p>
              <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[12px] text-slate-700">
                {phase.markers.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Weekly mix
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {phase.weeklyMix.map((mix) => {
                const meta = sessionMeta(mix.sessionId)
                return (
                  <span
                    key={mix.sessionId}
                    className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700"
                  >
                    <span>{meta.icon}</span>
                    {meta.name}
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-500">{mix.perWeek}×</span>
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </li>
  )
}
