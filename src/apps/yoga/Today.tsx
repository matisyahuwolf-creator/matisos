import { useMemo, useState } from 'react'
import { storage } from '../../lib/storage'
import { sessions, type Session } from './sessions'
import { phaseFor, phaseStartWeek, tracks } from './tracks'
import SessionRunner from './SessionRunner'
import { historyStats, loadHistory } from './history'
import { SKILLS, loadSkillPoints, skillsForPose, type SkillId } from './skills'

type ActiveTrackState = {
  trackId: string
  startedAt: number
  currentWeek: number
}

function loadActive(): ActiveTrackState | null {
  const raw = storage.get('yoga:track-v1')
  if (!raw) return null
  try {
    return JSON.parse(raw) as ActiveTrackState
  } catch {
    return null
  }
}

function greeting(): string {
  const h = new Date().getHours()
  if (h < 5) return 'Late night'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function dateLabel(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

function pickByTimeOfDay(): Session {
  const h = new Date().getHours()
  let id: string
  if (h >= 5 && h < 11) id = 'morning'
  else if (h >= 11 && h < 17) id = 'stress-release'
  else if (h >= 17 && h < 21) id = 'hip-release'
  else id = 'pre-sleep'
  return sessions.find((s) => s.id === id) ?? sessions[0]
}

export type TabKey =
  | 'today'
  | 'coach'
  | 'skills'
  | 'programs'
  | 'sessions'
  | 'library'

type TodayProps = {
  stats: { working: number; mastered: number; library: number }
  onSwitchTab: (tab: TabKey) => void
}

export default function Today({ stats, onSwitchTab }: TodayProps) {
  const [running, setRunning] = useState<Session | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const active = useMemo(loadActive, [])
  const track = useMemo(
    () => (active ? tracks.find((t) => t.id === active.trackId) ?? null : null),
    [active],
  )
  const phase = useMemo(
    () => (track && active ? phaseFor(track, active.currentWeek) : null),
    [track, active],
  )

  const WEEK_MS = 7 * 24 * 60 * 60 * 1000
  const weeklyProgress = useMemo(() => {
    if (!phase) return null
    const history = loadHistory()
    const weekAgo = Date.now() - WEEK_MS
    return phase.weeklyMix.map((mix) => {
      const done = history.filter(
        (h) => h.sessionId === mix.sessionId && h.completedAt >= weekAgo,
      ).length
      const session = sessions.find((s) => s.id === mix.sessionId)
      return { mix, session, done }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, refreshKey])

  const pick = useMemo<Session>(() => {
    if (weeklyProgress) {
      const nextPending = weeklyProgress.find(
        (w) => w.session && w.done < w.mix.perWeek,
      )
      if (nextPending?.session) return nextPending.session
    }
    return pickByTimeOfDay()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weeklyProgress])

  const allDone =
    weeklyProgress?.every((w) => w.done >= w.mix.perWeek) ?? false

  const reason = phase
    ? allDone
      ? 'You finished this week. Bonus if you want it.'
      : `From your program · ${phase.name}`
    : 'Matched to your time of day'

  return (
    <div className="flex flex-col gap-4">
      <header className="px-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
          {dateLabel()}
        </p>
        <h2 className="mt-0.5 text-2xl font-bold text-slate-900">
          {greeting()}.
        </h2>
      </header>

      {track && active && phase && (
        <button
          onClick={() => onSwitchTab('programs')}
          className={`overflow-hidden rounded-xl bg-gradient-to-br ${track.gradient} p-4 text-left text-white shadow-sm transition-transform active:scale-[0.99]`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/85">
                {phase.name} · Week{' '}
                {active.currentWeek - phaseStartWeek(track, phase.id) + 1} of{' '}
                {phase.weeks}
              </p>
              <h4 className="truncate text-base font-bold leading-tight">
                {track.name}
              </h4>
            </div>
            <span className="shrink-0 text-2xl">{track.icon}</span>
          </div>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full bg-white/85"
              style={{
                width: `${(active.currentWeek / track.totalWeeks) * 100}%`,
              }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-white/75">
            Week {active.currentWeek} of {track.totalWeeks} · tap for roadmap
          </p>
        </button>
      )}

      <button
        onClick={() => setRunning(pick)}
        className={`psychedelic-shimmer w-full overflow-hidden rounded-[22px] bg-gradient-to-br ${pick.gradient} p-6 text-left text-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.25)] press hover:brightness-105 active:scale-[0.99]`}
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/80">
          {reason}
        </p>
        <div className="mt-3 flex items-start gap-3">
          <span className="text-4xl">{pick.icon}</span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/85">
              {pick.focus} · {pick.durationMin} min · {pick.difficulty}
            </p>
            <h3 className="mt-0.5 text-2xl font-bold leading-tight">
              {pick.name}
            </h3>
          </div>
        </div>
        <p className="mt-3 text-[13px] leading-relaxed text-white/85">
          {pick.description}
        </p>
        <div className="mt-4 flex items-center justify-between rounded-xl bg-white/15 px-4 py-3 backdrop-blur">
          <span className="text-[13px] font-bold uppercase tracking-[0.12em]">
            Tap to begin
          </span>
          <span className="text-lg">▶</span>
        </div>
      </button>

      {weeklyProgress && weeklyProgress.length > 0 && (
        <>
          <WeeklySchedule
            rows={weeklyProgress}
            onPickSession={(s) => setRunning(s)}
          />
          <ThisWeekSkills rows={weeklyProgress} />
        </>
      )}

      <PracticeDashboard />

      <div className="flex items-stretch rounded-xl bg-white px-2 py-3 ring-1 ring-black/5">
        <StatBlock value={stats.working} label="Working on" />
        <Divider />
        <StatBlock value={stats.mastered} label="Mastered" />
        <Divider />
        <StatBlock value={stats.library} label="In Library" />
      </div>

      {!active && (
        <button
          onClick={() => onSwitchTab('programs')}
          className="self-start rounded-full bg-slate-900 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-slate-800"
        >
          Start a flexibility program →
        </button>
      )}

      {running && (
        <SessionRunner
          session={running}
          onClose={() => {
            setRunning(null)
            setRefreshKey((k) => k + 1)
          }}
        />
      )}
    </div>
  )
}

function WeeklySchedule({
  rows,
  onPickSession,
}: {
  rows: Array<{
    mix: { sessionId: string; perWeek: number }
    session: Session | undefined
    done: number
  }>
  onPickSession: (s: Session) => void
}) {
  const totalNeeded = rows.reduce((acc, r) => acc + r.mix.perWeek, 0)
  const totalDone = rows.reduce(
    (acc, r) => acc + Math.min(r.done, r.mix.perWeek),
    0,
  )
  const nextPendingIndex = rows.findIndex(
    (r) => r.done < r.mix.perWeek && r.session,
  )
  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
      <div className="flex items-baseline justify-between border-b border-slate-100 px-4 py-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
            This week's schedule
          </p>
          <h3 className="mt-0.5 font-display text-[20px] italic text-slate-900">
            {totalDone} of {totalNeeded} done
          </h3>
        </div>
        <div className="text-right">
          <p className="text-[20px] font-bold text-slate-900">
            {totalNeeded - totalDone}
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            to go
          </p>
        </div>
      </div>
      <ul className="divide-y divide-slate-100">
        {rows.map((row, i) => {
          if (!row.session) return null
          const isDone = row.done >= row.mix.perWeek
          const isNext = i === nextPendingIndex
          const remaining = Math.max(0, row.mix.perWeek - row.done)
          return (
            <li key={row.mix.sessionId}>
              <button
                onClick={() => row.session && onPickSession(row.session)}
                disabled={!row.session}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left press ${
                  isNext
                    ? 'bg-amber-50/60 hover:bg-amber-50'
                    : isDone
                      ? 'bg-emerald-50/40 hover:bg-emerald-50/60'
                      : 'hover:bg-slate-50'
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${row.session.gradient} text-lg`}
                >
                  <span>{row.session.icon}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p
                      className={`truncate text-[14px] font-semibold ${
                        isDone ? 'text-slate-600' : 'text-slate-900'
                      }`}
                    >
                      {row.session.name}
                    </p>
                    {isNext && (
                      <span className="shrink-0 rounded-full bg-amber-200 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-900">
                        Next
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {row.session.durationMin} min ·{' '}
                    {isDone
                      ? `done ${row.done}×`
                      : `${row.done}/${row.mix.perWeek} this week`}
                  </p>
                </div>
                {isDone ? (
                  <span
                    className="shrink-0 text-emerald-600"
                    aria-label="completed"
                  >
                    <svg width="22" height="22" viewBox="0 0 22 22">
                      <path
                        d="M5 11l4 4 8-8"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                ) : (
                  <span className="shrink-0 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {remaining}× left
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function StatBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex-1 text-center">
      <p className="text-xl font-bold text-slate-900">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>
    </div>
  )
}

function Divider() {
  return <div className="self-center h-8 w-px bg-slate-200" />
}

function totalPoints(pts: Partial<Record<SkillId, number>>): number {
  return Object.values(pts).reduce((a, b) => a + (b ?? 0), 0)
}

function PracticeDashboard() {
  const history = useMemo(loadHistory, [])
  if (history.length === 0) return null
  const stats = historyStats(history)
  const totalMin = Math.round(stats.totalSec / 60)
  const points = totalPoints(loadSkillPoints())
  const last = stats.lastAt ? new Date(stats.lastAt) : null
  function lastLabel(d: Date): string {
    const diff = Date.now() - d.getTime()
    const day = 24 * 60 * 60 * 1000
    if (diff < day && d.toDateString() === new Date().toDateString()) {
      return 'today'
    }
    if (diff < 2 * day) return 'yesterday'
    return d.toLocaleDateString('en-US', { weekday: 'long' })
  }
  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
      <div className="border-b border-slate-100 px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
          Practice
        </p>
        <h3 className="mt-0.5 font-display text-[20px] italic text-slate-900">
          You showed up {stats.total} {stats.total === 1 ? 'time' : 'times'}.
        </h3>
      </div>
      <div className="grid grid-cols-3 divide-x divide-slate-100">
        <DashStat value={stats.thisWeek} label="this week" />
        <DashStat value={stats.streak} label="day streak" />
        <DashStat value={points} label="skill points" />
      </div>
      <div className="border-t border-slate-100 bg-slate-50 px-4 py-2.5 text-[12px] text-slate-600">
        Total · {totalMin} min across {stats.total} sessions
        {last && ` · Last: ${lastLabel(last)}`}
      </div>
    </div>
  )
}

function DashStat({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="px-3 py-3 text-center">
      <p className="text-2xl font-bold leading-none text-slate-900">{value}</p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
    </div>
  )
}

function ThisWeekSkills({
  rows,
}: {
  rows: Array<{
    mix: { sessionId: string; perWeek: number }
    session: Session | undefined
    done: number
  }>
}) {
  const projection: Partial<Record<SkillId, number>> = {}
  for (const row of rows) {
    if (!row.session) continue
    for (const step of row.session.steps) {
      const ps = skillsForPose(step.poseId)
      for (const [id, pts] of Object.entries(ps)) {
        projection[id as SkillId] =
          (projection[id as SkillId] ?? 0) + (pts ?? 0) * row.mix.perWeek
      }
    }
  }
  const top = (Object.entries(projection) as [SkillId, number][])
    .filter(([, p]) => p > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
  if (top.length === 0) return null
  const max = top[0][1]
  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
      <div className="border-b border-slate-100 px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
          This week you're building
        </p>
        <h3 className="mt-0.5 font-display text-[20px] italic text-slate-900">
          {top.length} skills through these poses
        </h3>
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          What you'll gain physically if you complete all the planned sessions this week.
        </p>
      </div>
      <ul className="divide-y divide-slate-100">
        {top.map(([id, pts]) => {
          const meta = SKILLS[id]
          const pct = Math.min(100, (pts / max) * 100)
          return (
            <li key={id} className="flex items-center gap-3 px-4 py-2.5">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg ${meta.bg}`}
              >
                {meta.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-[14px] font-semibold text-slate-900">
                    {meta.name}
                  </p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${meta.bg} ${meta.text}`}
                  >
                    +{pts} pts
                  </span>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${meta.bg.replace('100', '400')}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
