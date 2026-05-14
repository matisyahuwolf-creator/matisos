import { useMemo, useState } from 'react'
import { storage } from '../../lib/storage'
import { sessions, type Session } from './sessions'
import {
  ACTIVE_TRACK_KEY,
  loadActiveTrack,
  phaseFor,
  phaseStartWeek,
  tracks,
} from './tracks'
import SessionRunner from './SessionRunner'
import { historyStats, loadHistory } from './history'

export type TabKey = 'today' | 'path' | 'library' | 'coach' | 'more'

type TodayProps = {
  onSwitchTab: (tab: TabKey) => void
}

// The Matis Path is the canonical app-wide track. Today centers on it.
const PATH_TRACK_ID = 'matis-path'

// Per-weekday accent colors for the 7-day completion strip. Rotates through
// the modality palette so each day reads as its own little stamp.
const DAY_COLORS = [
  'bg-emerald-500', // Mon
  'bg-fuchsia-500', // Tue
  'bg-orange-500',  // Wed
  'bg-slate-800',   // Thu
  'bg-sky-500',     // Fri
  'bg-violet-500',  // Sat
  'bg-rose-500',    // Sun
]

function startOfWeekMonday(d: Date): Date {
  const out = new Date(d)
  const dow = out.getDay() // 0=Sun ... 6=Sat
  // Convert to Mon=0..Sun=6
  const offset = (dow + 6) % 7
  out.setDate(out.getDate() - offset)
  out.setHours(0, 0, 0, 0)
  return out
}

function formatDuration(sec: number): string {
  if (sec < 60) return `${sec}s`
  const min = Math.round(sec / 60)
  if (min < 60) return `${min}m`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

function getTodaysFlowSession(phaseSessionId: string): Session | undefined {
  return sessions.find((s) => s.id === phaseSessionId)
}

export default function Today({ onSwitchTab }: TodayProps) {
  const [running, setRunning] = useState<Session | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Reload active track & history each refresh
  const active = useMemo(loadActiveTrack, [refreshKey])
  const track = useMemo(
    () => tracks.find((t) => t.id === PATH_TRACK_ID) ?? null,
    [],
  )
  const phase = useMemo(
    () => (track && active ? phaseFor(track, active.currentWeek) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [track, active],
  )

  // Today's session — first weeklyMix entry of the current phase, or the
  // Foundation session if not started yet.
  const todaysSession = useMemo<Session | undefined>(() => {
    const sid = phase?.weeklyMix[0]?.sessionId ?? 'path-foundation'
    return getTodaysFlowSession(sid)
  }, [phase])

  // Week stats — completion days this week and total time
  const week = useMemo(() => {
    const history = loadHistory()
    const monday = startOfWeekMonday(new Date())
    const weekStart = monday.getTime()
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayIdx = (new Date().getDay() + 6) % 7

    // Per-day: did any session complete that day?
    const days = Array.from({ length: 7 }, (_, i) => {
      const dStart = weekStart + i * 24 * 60 * 60 * 1000
      const dEnd = dStart + 24 * 60 * 60 * 1000
      const done = history.some(
        (h) => h.completedAt >= dStart && h.completedAt < dEnd,
      )
      return { idx: i, done, isToday: i === todayIdx, isPast: i < todayIdx }
    })
    const doneCount = days.filter((d) => d.done).length
    const weekSec = history
      .filter((h) => h.completedAt >= weekStart)
      .reduce((acc, h) => acc + h.durationSec, 0)
    return { days, doneCount, weekSec, todayIdx }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey])

  const stats = useMemo(historyStats, [refreshKey])

  const phaseLabel = phase
    ? `${phase.name} · Week ${
        active && track
          ? active.currentWeek - phaseStartWeek(track, phase.id) + 1
          : 1
      } of ${phase.weeks}`
    : 'An 18-month daily program'

  const daysPerWeek = phase?.weeklyMix[0]?.perWeek ?? 5

  function startThePath() {
    // Persist a new active track at week 1, then open today's session.
    const state = {
      trackId: PATH_TRACK_ID,
      startedAt: Date.now(),
      currentWeek: 1,
    }
    storage.set(ACTIVE_TRACK_KEY, JSON.stringify(state))
    setRefreshKey((k) => k + 1)
    if (todaysSession) setRunning(todaysSession)
  }

  function beginToday() {
    if (!active) {
      startThePath()
      return
    }
    if (todaysSession) setRunning(todaysSession)
  }

  return (
    <div className="flex flex-col gap-7 pb-6">
      {/* Headline ─────────────────────────────────────────────────────── */}
      <header className="flex flex-col gap-2 px-1 pt-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
          The Matis Path
        </p>
        <h1 className="font-display text-[44px] leading-[0.95] tracking-tight text-slate-900 sm:text-[52px]">
          The <span className="italic">Matis</span> Path
        </h1>
        <p className="text-[14px] leading-snug text-slate-500">{phaseLabel}</p>
      </header>

      {/* Hero card — Today's Flow ─────────────────────────────────────── */}
      <button
        onClick={beginToday}
        className="group relative aspect-square w-full overflow-hidden rounded-[28px] text-white shadow-[0_24px_60px_-24px_rgba(180,40,120,0.55)] transition active:scale-[0.99]"
        style={{
          background:
            'linear-gradient(135deg, #FF8A3D 0%, #FF5A6E 32%, #E64BA0 60%, #8B3FD8 100%)',
        }}
      >
        {/* Soft inner highlight */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            background:
              'radial-gradient(120% 80% at 25% 18%, rgba(255,255,255,0.35) 0%, transparent 55%)',
          }}
        />
        <div className="relative flex h-full flex-col items-center justify-center gap-5 px-6 text-center">
          <h2 className="font-display text-[44px] font-medium italic leading-none drop-shadow-sm sm:text-[52px]">
            Today's Flow
          </h2>
          <span className="block h-1 w-1 rounded-full bg-white/70" />
          <p className="text-[20px] font-light tracking-tight">
            {todaysSession?.durationMin ?? 20} min
          </p>
          <span className="block h-1 w-1 rounded-full bg-white/70" />
          <p className="text-[26px] font-display font-medium italic">
            {active ? 'Begin →' : 'Begin the Path →'}
          </p>
        </div>
      </button>

      {/* This week ────────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between px-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            This Week
          </p>
          <p className="text-[12px] font-medium text-slate-500">
            {week.doneCount} of {daysPerWeek} days done
          </p>
        </div>

        <DayStrip days={week.days} />
      </section>

      {/* Stats card ───────────────────────────────────────────────────── */}
      <section className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/[0.06]">
        <StatRow
          icon={<SpiralIcon />}
          label="Current streak"
          value={`${stats.streak} ${stats.streak === 1 ? 'day' : 'days'}`}
        />
        <div className="h-px bg-slate-100" />
        <StatRow
          icon={<ClockIcon />}
          label="Total time this week"
          value={week.weekSec > 0 ? formatDuration(week.weekSec) : '—'}
        />
      </section>

      {/* Tap-through to Path ─────────────────────────────────────────── */}
      {active && (
        <button
          onClick={() => onSwitchTab('path')}
          className="self-center text-[12px] font-medium uppercase tracking-[0.18em] text-slate-400 transition hover:text-slate-700"
        >
          See the full path →
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

// ─── Day strip ────────────────────────────────────────────────────────
function DayStrip({
  days,
}: {
  days: { idx: number; done: boolean; isToday: boolean; isPast: boolean }[]
}) {
  const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  return (
    <div className="flex flex-col gap-3 px-1">
      <div className="flex items-end justify-between gap-2">
        {days.map((d, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <span
              className={`text-[11px] font-semibold ${
                d.isToday ? 'text-slate-900' : 'text-slate-400'
              }`}
            >
              {labels[i]}
            </span>
            <DayDot day={d} />
          </div>
        ))}
      </div>
      {/* Rainbow progression rule */}
      <div
        className="h-[2px] rounded-full"
        style={{
          background:
            'linear-gradient(90deg, #10b981 0%, #d946ef 20%, #f97316 40%, #1e293b 60%, #0ea5e9 80%, #8b5cf6 100%)',
        }}
      />
    </div>
  )
}

function DayDot({
  day,
}: {
  day: { idx: number; done: boolean; isToday: boolean; isPast: boolean }
}) {
  if (day.done) {
    return (
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full ${DAY_COLORS[day.idx]}`}
        aria-label="completed"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
          <path
            d="M3 7L6 10L11 4"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    )
  }
  if (day.isToday) {
    return (
      <span
        className="flex h-7 w-7 items-center justify-center rounded-full border-[2px] border-sky-500"
        aria-label="today"
      />
    )
  }
  return (
    <span
      className="flex h-7 w-7 items-center justify-center rounded-full border-[1.5px] border-slate-200"
      aria-label="empty"
    />
  )
}

// ─── Stat row ────────────────────────────────────────────────────────
function StatRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3.5">
      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600">
          {icon}
        </span>
        <p className="text-[14px] font-medium text-slate-700">{label}</p>
      </div>
      <p className="text-[14px] font-semibold tabular-nums text-slate-900">
        {value}
      </p>
    </div>
  )
}

function SpiralIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
      <path
        d="M8 14a6 6 0 11.001-11.999A4.5 4.5 0 0112.5 6.5 3 3 0 019.5 9.5 1.5 1.5 0 018 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
      <circle
        cx="8"
        cy="8"
        r="6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M8 4.5V8L10.5 9.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
