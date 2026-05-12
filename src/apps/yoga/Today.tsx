import { useMemo, useState } from 'react'
import { storage } from '../../lib/storage'
import { sessions, type Session } from './sessions'
import { phaseFor, phaseStartWeek, tracks } from './tracks'
import SessionRunner from './SessionRunner'
import { historyStats, loadHistory } from './history'

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

export type TabKey = 'today' | 'coach' | 'programs' | 'sessions' | 'library'

type TodayProps = {
  stats: { working: number; mastered: number; library: number }
  onSwitchTab: (tab: TabKey) => void
}

export default function Today({ stats, onSwitchTab }: TodayProps) {
  const [running, setRunning] = useState<Session | null>(null)

  const active = useMemo(loadActive, [])
  const track = useMemo(
    () => (active ? tracks.find((t) => t.id === active.trackId) ?? null : null),
    [active],
  )
  const phase = useMemo(
    () => (track && active ? phaseFor(track, active.currentWeek) : null),
    [track, active],
  )

  const pick = useMemo<Session>(() => {
    if (phase) {
      const firstId = phase.weeklyMix[0]?.sessionId
      if (firstId) {
        const found = sessions.find((s) => s.id === firstId)
        if (found) return found
      }
    }
    return pickByTimeOfDay()
  }, [phase])

  const reason = phase
    ? `From your program · ${phase.name}`
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
          onClose={() => setRunning(null)}
        />
      )}
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

function PracticeDashboard() {
  const history = useMemo(loadHistory, [])
  if (history.length === 0) return null
  const stats = historyStats(history)
  const totalMin = Math.round(stats.totalSec / 60)
  const weekMin = Math.round(stats.weekSec / 60)
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
        <DashStat value={weekMin > 0 ? `${weekMin}m` : '—'} label="this week" />
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
