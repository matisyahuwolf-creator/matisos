import { useEffect, useMemo, useState } from 'react'
import { storage } from '../../lib/storage'

type Category =
  | 'work'
  | 'rest'
  | 'movement'
  | 'meal'
  | 'connect'
  | 'create'
  | 'admin'
  | 'sleep'
type Energy = 'low' | 'mid' | 'high'
type View = 'energy' | 'timeline' | 'narrative'
type Period = 'dawn' | 'rise' | 'midday' | 'trough' | 'evening' | 'night'

type Block = {
  id: string
  start: string
  end: string
  title: string
  category: Category
  energy: Energy
  why?: string
  fixed?: boolean
}

type Plan = {
  view: View
  headline: string
  narrative: string
  summary: { title: string; hint: string }
  blocks: Block[]
  suggestions: string[]
  generatedAt: number
}

type Turn = { role: 'user' | 'assistant'; content: string }

const KEYS = {
  intents: 'cadence:intents',
  fixed: 'cadence:fixed',
  plan: 'cadence:plan',
  history: 'cadence:history',
}

const ENERGY_VAL: Record<Energy, number> = { low: 0.25, mid: 0.55, high: 0.92 }

const PERIOD_GRADIENT: Record<Period, string> = {
  dawn: 'from-amber-200 via-orange-300 to-rose-400',
  rise: 'from-yellow-200 via-orange-200 to-cyan-200',
  midday: 'from-sky-100 via-cyan-100 to-emerald-100',
  trough: 'from-rose-200 via-fuchsia-300 to-violet-400',
  evening: 'from-violet-400 via-indigo-500 to-blue-700',
  night: 'from-indigo-700 via-slate-800 to-slate-900',
}

const PERIOD_LABEL: Record<Period, string> = {
  dawn: 'Dawn',
  rise: 'Rise',
  midday: 'Midday',
  trough: 'Trough',
  evening: 'Evening',
  night: 'Night',
}

const PERIOD_MOOD: Record<Period, string> = {
  dawn: 'clarity builds',
  rise: 'great for hard things',
  midday: 'steady momentum',
  trough: 'energy dips naturally',
  evening: 'social sweet spot',
  night: 'wind down well',
}

const NARRATIVE_PERIODS: { key: Period; label: string; dot: string }[] = [
  { key: 'rise', label: 'Morning', dot: 'bg-amber-500' },
  { key: 'midday', label: 'Midday', dot: 'bg-rose-400' },
  { key: 'trough', label: 'Afternoon', dot: 'bg-violet-500' },
  { key: 'evening', label: 'Evening', dot: 'bg-cyan-600' },
]

function toMin(t: string): number {
  const [h, m] = t.split(':').map((n) => parseInt(n, 10))
  return h * 60 + m
}
function fmtClock(t: string): string {
  const [h, m] = t.split(':').map((n) => parseInt(n, 10))
  const period = h >= 12 ? 'PM' : 'AM'
  const hh = h % 12 === 0 ? 12 : h % 12
  return m === 0 ? `${hh} ${period}` : `${hh}:${String(m).padStart(2, '0')} ${period}`
}
function periodOf(time: string): Period {
  const m = toMin(time)
  if (m < 7 * 60) return 'dawn'
  if (m < 11 * 60) return 'rise'
  if (m < 14 * 60) return 'midday'
  if (m < 17 * 60) return 'trough'
  if (m < 21 * 60) return 'evening'
  return 'night'
}
function periodAnchorTime(p: Period): string {
  return {
    dawn: '6 AM',
    rise: '9 AM',
    midday: '12 PM',
    trough: '3 PM',
    evening: '6 PM',
    night: '9 PM',
  }[p]
}

function loadJSON<T>(key: string, fallback: T): T {
  const raw = storage.get(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}
function saveJSON(key: string, value: unknown) {
  storage.set(key, JSON.stringify(value))
}

function fmtDateLong(d: Date): string {
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

export default function Cadence() {
  const [intents, setIntents] = useState<string[]>(() =>
    loadJSON<string[]>(KEYS.intents, []),
  )
  const [fixed, setFixed] = useState<Block[]>(() =>
    loadJSON<Block[]>(KEYS.fixed, []),
  )
  const [plan, setPlan] = useState<Plan | null>(() =>
    loadJSON<Plan | null>(KEYS.plan, null),
  )
  const [history, setHistory] = useState<Turn[]>(() =>
    loadJSON<Turn[]>(KEYS.history, []),
  )
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newIntent, setNewIntent] = useState('')
  const [editingIntents, setEditingIntents] = useState(false)

  useEffect(() => saveJSON(KEYS.intents, intents), [intents])
  useEffect(() => saveJSON(KEYS.fixed, fixed), [fixed])
  useEffect(() => {
    if (plan) saveJSON(KEYS.plan, plan)
  }, [plan])
  useEffect(() => saveJSON(KEYS.history, history), [history])

  async function send(message: string) {
    const trimmed = message.trim()
    if (!trimmed || loading) return
    setLoading(true)
    setError(null)
    const nextHistory = [...history, { role: 'user' as const, content: trimmed }]
    setHistory(nextHistory)
    setInput('')

    try {
      const r = await fetch('/api/cadence-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          intents,
          fixed,
          history: nextHistory.slice(-8),
          now: new Date().toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      })
      if (!r.ok) {
        const data = await r.json().catch(() => ({}))
        throw new Error(data?.error ?? `Request failed (${r.status})`)
      }
      const data = await r.json()
      const newPlan: Plan = {
        view: data.view ?? 'timeline',
        headline: data.headline ?? '',
        narrative: data.narrative ?? '',
        summary: data.summary ?? { title: '', hint: '' },
        blocks: data.blocks ?? [],
        suggestions: data.suggestions ?? [],
        generatedAt: Date.now(),
      }
      setPlan(newPlan)
      setHistory([
        ...nextHistory,
        {
          role: 'assistant',
          content:
            newPlan.narrative ||
            newPlan.headline ||
            `Reshaped your day — ${newPlan.blocks.length} blocks.`,
        },
      ])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  function addIntent() {
    const v = newIntent.trim()
    if (!v) return
    setIntents([...intents, v])
    setNewIntent('')
  }
  function removeIntent(i: number) {
    setIntents(intents.filter((_, idx) => idx !== i))
  }
  function pinBlock(b: Block) {
    if (fixed.find((f) => f.id === b.id)) return
    setFixed([...fixed, { ...b, fixed: true }])
  }
  function unpin(id: string) {
    setFixed(fixed.filter((f) => f.id !== id))
  }
  function clearAll() {
    setPlan(null)
    setHistory([])
    storage.remove(KEYS.plan)
    storage.remove(KEYS.history)
  }

  const today = useMemo(() => fmtDateLong(new Date()), [])
  const view: View = plan?.view ?? 'energy'
  const headline = plan?.headline || defaultHeadline(view)

  return (
    <div
      className="-m-6 overflow-hidden rounded-2xl"
      style={{
        background:
          'linear-gradient(180deg, #faf6ee 0%, #f5ecd6 55%, #f7e4d4 100%)',
      }}
    >
      <div className="relative">
        {/* Atmospheric wash overlays — lavender top-left, peach top-right, cool wash bottom */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(at 12% 0%, rgba(167,139,250,0.22), transparent 50%), radial-gradient(at 88% 4%, rgba(251,146,60,0.18), transparent 55%), radial-gradient(at 90% 95%, rgba(125,211,252,0.18), transparent 50%)',
          }}
        />

        <div className="relative px-5 pt-6 pb-32 sm:px-7 sm:pt-7">
          {/* — View header — */}
          <header className="flex flex-col items-center text-center">
            <div className="flex w-full items-center justify-between text-slate-700">
              <ViewGlyph view={view} side="left" />
              <span className="text-[13px] tracking-[0.02em] text-slate-700">
                {viewName(view)}
              </span>
              <ViewGlyph view={view} side="right" />
            </div>
            <p className="mt-5 text-[11px] tracking-[0.18em] text-slate-500">
              {today}
            </p>
            <h1 className="mt-1.5 max-w-[14ch] font-display text-[28px] italic font-medium leading-[1.1] text-slate-800 sm:text-[30px]">
              {headline}
            </h1>
          </header>

          {/* — View body — */}
          <section className="mt-7" aria-live="polite">
            {!plan ? (
              <EmptyState onPrompt={(p) => send(p)} disabled={loading} />
            ) : view === 'energy' ? (
              <EnergyView plan={plan} intents={intents} onPin={pinBlock} />
            ) : view === 'timeline' ? (
              <TimelineView plan={plan} onPin={pinBlock} />
            ) : (
              <NarrativeView plan={plan} onPin={pinBlock} />
            )}
          </section>

          {/* — Suggestions — */}
          {plan && plan.suggestions.length > 0 && (
            <section className="mt-6">
              <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Nudges
              </p>
              <ul className="flex flex-col gap-1.5">
                {plan.suggestions.map((s, i) => (
                  <li
                    key={i}
                    className="rounded-2xl bg-white/65 px-4 py-2.5 text-center font-hand text-[18px] leading-snug text-slate-700 ring-1 ring-slate-200/60"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* — Intents editor — */}
          <section className="mt-7">
            <button
              onClick={() => setEditingIntents((v) => !v)}
              className="press mx-auto flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-slate-800"
            >
              <span className="text-slate-400">✦</span>
              Intents · {intents.length}
              <span className="text-slate-400">
                {editingIntents ? '−' : '+'}
              </span>
            </button>
            {editingIntents && (
              <div className="mx-auto mt-3 max-w-md">
                <div className="flex flex-wrap justify-center gap-1.5">
                  {intents.map((it, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-[12px] text-slate-700 ring-1 ring-slate-200"
                    >
                      {it}
                      <button
                        onClick={() => removeIntent(i)}
                        className="text-slate-400 hover:text-rose-500"
                        aria-label={`Remove ${it}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/60 px-2 py-0.5 ring-1 ring-slate-200">
                    <input
                      value={newIntent}
                      onChange={(e) => setNewIntent(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addIntent()
                        }
                      }}
                      placeholder="add intent…"
                      className="w-28 bg-transparent px-1 py-0.5 text-[12px] outline-none placeholder:text-slate-400"
                    />
                    {newIntent && (
                      <button
                        onClick={addIntent}
                        className="text-[13px] font-semibold text-slate-700"
                      >
                        +
                      </button>
                    )}
                  </span>
                </div>
                {fixed.length > 0 && (
                  <div className="mt-3 flex flex-col gap-1">
                    <p className="text-center text-[10px] uppercase tracking-[0.16em] text-slate-400">
                      Pinned
                    </p>
                    {fixed.map((b) => (
                      <div
                        key={b.id}
                        className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-1.5 text-[12px] ring-1 ring-slate-200"
                      >
                        <span>
                          <span className="font-semibold text-slate-700">
                            {fmtClock(b.start)} – {fmtClock(b.end)}
                          </span>{' '}
                          <span className="text-slate-600">{b.title}</span>
                        </span>
                        <button
                          onClick={() => unpin(b.id)}
                          className="text-slate-400 hover:text-rose-500"
                          aria-label="Unpin"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {(plan || history.length > 0) && (
                  <div className="mt-3 text-center">
                    <button
                      onClick={clearAll}
                      className="text-[11px] text-slate-400 press hover:text-rose-500"
                    >
                      Reset day
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        {/* — Composer — */}
        <div
          className="sticky bottom-0 z-10 border-t border-white/60 px-5 pb-5 pt-3 sm:px-7"
          style={{
            background:
              'linear-gradient(180deg, rgba(247,228,212,0.6) 0%, rgba(247,228,212,0.96) 100%)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {error && (
            <p className="mb-2 text-center text-[12px] text-rose-600">{error}</p>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
            className="flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 ring-1 ring-slate-200/70 shadow-[0_2px_10px_rgba(120,80,40,0.06)]"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="what's true for today?"
              className="font-hand flex-1 bg-transparent text-[20px] leading-none text-slate-700 outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="Send"
              className="press flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm transition disabled:opacity-30"
            >
              {loading ? (
                <span className="block h-2 w-2 animate-pulse rounded-full bg-white" />
              ) : (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M8 13V3" />
                  <path d="M3 8l5-5 5 5" />
                </svg>
              )}
            </button>
          </form>
          <p className="mt-1.5 text-center text-[10px] text-slate-500">
            Cadence listens and shapes the day with you.
          </p>
        </div>
      </div>
    </div>
  )
}

function viewName(v: View): string {
  return v === 'energy' ? 'Energy' : v === 'timeline' ? 'Timeline' : 'Narrative'
}

function defaultHeadline(v: View): string {
  return v === 'energy'
    ? 'follow the rhythm'
    : v === 'timeline'
      ? 'where is focus strongest?'
      : 'the story of your day'
}

function ViewGlyph({ view, side }: { view: View; side: 'left' | 'right' }) {
  const stroke = '#475569'
  const props = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke,
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }
  if (side === 'left') {
    if (view === 'energy')
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" />
        </svg>
      )
    if (view === 'timeline')
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7l2 5-5 2 3-7z" fill={stroke} />
        </svg>
      )
    return (
      <svg {...props}>
        <path d="M4 5a2 2 0 012-2h6v18H6a2 2 0 01-2-2V5z" />
        <path d="M20 5a2 2 0 00-2-2h-6v18h6a2 2 0 002-2V5z" />
      </svg>
    )
  }
  // right glyph — compass / sliders / dots
  if (view === 'energy')
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="9" />
        <path d="M15.5 8.5l-2.5 5.5-5.5 2.5L10 11l5.5-2.5z" />
      </svg>
    )
  if (view === 'timeline')
    return (
      <svg {...props}>
        <path d="M4 6h12M4 12h8M4 18h14" />
        <circle cx="18" cy="6" r="1.5" fill={stroke} />
        <circle cx="14" cy="12" r="1.5" fill={stroke} />
        <circle cx="8" cy="18" r="1.5" fill={stroke} />
      </svg>
    )
  return (
    <svg {...props}>
      <circle cx="6" cy="12" r="1.4" fill={stroke} />
      <circle cx="12" cy="12" r="1.4" fill={stroke} />
      <circle cx="18" cy="12" r="1.4" fill={stroke} />
    </svg>
  )
}

function EmptyState({
  onPrompt,
  disabled,
}: {
  onPrompt: (p: string) => void
  disabled: boolean
}) {
  const seeds = [
    'plan my day',
    'where is my focus strongest?',
    'how does today look?',
    'tell me the story of today',
  ]
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <p className="max-w-xs font-hand text-[20px] leading-snug text-slate-600">
        Cadence treats your day as a shape, not a grid. Ask anything.
      </p>
      <div className="flex flex-wrap justify-center gap-1.5">
        {seeds.map((s) => (
          <button
            key={s}
            disabled={disabled}
            onClick={() => onPrompt(s)}
            className="press rounded-full bg-white/80 px-3 py-1 text-[12px] text-slate-700 ring-1 ring-slate-200 hover:bg-white disabled:opacity-40"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ─── Energy View ─────────────────────────────────────────────────────── */

function EnergyView({
  plan,
  intents,
  onPin,
}: {
  plan: Plan
  intents: string[]
  onPin: (b: Block) => void
}) {
  if (plan.blocks.length === 0) {
    return <p className="text-center text-[13px] text-slate-500">No shape yet.</p>
  }

  const W = 700
  const H = 240
  const xMin = 6 * 60
  const xMax = 22 * 60
  const xSpan = xMax - xMin
  const xOf = (min: number) =>
    Math.max(0, Math.min(W, ((min - xMin) / xSpan) * W))
  const yOf = (v: number) => H - 30 - v * (H - 60)

  const points = plan.blocks.map((b) => {
    const mid = (toMin(b.start) + toMin(b.end)) / 2
    return { block: b, x: xOf(mid), y: yOf(ENERGY_VAL[b.energy]) }
  })

  // Smooth bezier path through points
  let path = ''
  if (points.length > 0) {
    path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      const cx = (prev.x + curr.x) / 2
      path += ` C ${cx.toFixed(1)} ${prev.y.toFixed(1)}, ${cx.toFixed(1)} ${curr.y.toFixed(1)}, ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`
    }
  }
  const areaPath = path
    ? `${path} L ${points[points.length - 1].x.toFixed(1)} ${H} L ${points[0].x.toFixed(1)} ${H} Z`
    : ''

  // Peak (highest energy = lowest y) and trough (lowest energy = highest y)
  const sorted = [...points].sort((a, b) => a.y - b.y)
  const peak = sorted[0]
  const trough = sorted[sorted.length - 1]

  const timeMarks = [6, 9, 12, 15, 18, 21] as const

  return (
    <div className="flex flex-col gap-6">
      <div className="relative overflow-visible">
        <svg
          viewBox={`0 -10 ${W} ${H + 20}`}
          className="h-56 w-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="energyArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fb923c" stopOpacity="0.65" />
              <stop offset="35%" stopColor="#ec4899" stopOpacity="0.45" />
              <stop offset="65%" stopColor="#a855f7" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="energyStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="30%" stopColor="#f97316" />
              <stop offset="55%" stopColor="#ec4899" />
              <stop offset="80%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>
          {/* Layered echoes of the main curve for topographic feel */}
          {[14, 9, 5, 2].map((dy, i) => (
            <path
              key={i}
              d={path}
              fill="none"
              stroke="url(#energyStroke)"
              strokeOpacity={0.18 - i * 0.025}
              strokeWidth={1.2}
              transform={`translate(0 ${-dy})`}
            />
          ))}
          {areaPath && (
            <path d={areaPath} fill="url(#energyArea)" opacity={0.85} />
          )}
          {path && (
            <path
              d={path}
              fill="none"
              stroke="url(#energyStroke)"
              strokeWidth={2}
              strokeLinecap="round"
            />
          )}
          {/* Annotation dots — peak + trough */}
          {peak && (
            <g>
              <circle cx={peak.x} cy={peak.y} r={5} fill="#f97316" />
              <circle cx={peak.x} cy={peak.y} r={9} fill="#f97316" opacity={0.2} />
            </g>
          )}
          {trough && trough !== peak && (
            <g>
              <circle cx={trough.x} cy={trough.y} r={4} fill="#a855f7" />
              <circle cx={trough.x} cy={trough.y} r={8} fill="#a855f7" opacity={0.2} />
            </g>
          )}
        </svg>

        {/* Floating annotation labels positioned over the SVG */}
        {peak && (
          <div
            className="pointer-events-none absolute text-right"
            style={{
              left: `${(peak.x / W) * 100}%`,
              top: `${(peak.y / (H + 20)) * 100}%`,
              transform: 'translate(-100%, -130%)',
            }}
          >
            <p className="text-[10px] tracking-wider text-slate-500">
              {fmtClock(peak.block.start)}
            </p>
            <p className="font-display text-[14px] italic text-slate-700">
              {shortBlockNote(peak.block, 'peak')}
            </p>
          </div>
        )}
        {trough && trough !== peak && (
          <div
            className="pointer-events-none absolute text-left"
            style={{
              left: `${(trough.x / W) * 100}%`,
              top: `${(trough.y / (H + 20)) * 100}%`,
              transform: 'translate(8px, 8px)',
            }}
          >
            <p className="text-[10px] tracking-wider text-slate-500">
              {fmtClock(trough.block.start)}
            </p>
            <p className="font-display text-[14px] italic text-slate-700">
              {shortBlockNote(trough.block, 'trough')}
            </p>
          </div>
        )}
      </div>

      {/* Time strip */}
      <div className="flex justify-between px-1 text-slate-500">
        {timeMarks.map((h) => (
          <div
            key={h}
            className="flex flex-col items-center gap-0.5 text-[10px]"
          >
            <span>
              {h % 12 === 0 ? 12 : h % 12}
              {h < 12 ? 'A' : 'P'}
            </span>
            <TimeIcon hour={h} />
          </div>
        ))}
      </div>

      {/* Intents in Orbit */}
      {intents.length > 0 && (
        <div className="pt-2">
          <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            <span className="text-amber-500">✦</span> Intents in Orbit
          </p>
          <IntentsOrbit intents={intents} />
        </div>
      )}

      {/* Full block list — interactable */}
      <BlockList blocks={plan.blocks} onPin={onPin} />
    </div>
  )
}

function shortBlockNote(b: Block, kind: 'peak' | 'trough'): string {
  if (b.why && b.why.length > 0) {
    const w = b.why.split('.')[0]
    return w.length < 40 ? w.toLowerCase() : b.title.toLowerCase()
  }
  return kind === 'peak'
    ? `${b.title.toLowerCase()}`
    : `${b.title.toLowerCase()}`
}

function TimeIcon({ hour }: { hour: number }) {
  if (hour < 7)
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
        <path
          d="M3 12h10M5 12a3 3 0 016 0"
          fill="none"
          stroke="#fbbf24"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    )
  if (hour < 11)
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
        <circle cx="8" cy="8" r="3" fill="#fbbf24" />
      </svg>
    )
  if (hour < 15)
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
        <path
          d="M3 10c0-2 1.5-3 3-3 .3-1.5 1.7-2.5 3.5-2.5C11.3 4.5 13 6 13 8c.8.3 1.5 1 1.5 2 0 1.3-1 2-2.2 2H4.5C3.5 12 2.5 11.2 2.5 10z"
          fill="#cbd5e1"
        />
      </svg>
    )
  if (hour < 18)
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
        <circle cx="8" cy="8" r="3" fill="#f97316" opacity="0.7" />
      </svg>
    )
  if (hour < 21)
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
        <path
          d="M3 11c0-1.8 1.4-3 3-3 .3-1.4 1.6-2.5 3.5-2.5S13 7 13 9c.9.3 1.5 1 1.5 1.8 0 1.2-1 2-2.2 2H4.5c-1 0-1.5-.8-1.5-1.8z"
          fill="#c4b5fd"
        />
      </svg>
    )
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
      <path
        d="M11 3a5 5 0 100 10 4 4 0 110-10z"
        fill="#6366f1"
      />
    </svg>
  )
}

function IntentsOrbit({ intents }: { intents: string[] }) {
  const items = intents.slice(0, 6)
  const ringSize = 220
  return (
    <div
      className="relative mx-auto"
      style={{ width: ringSize, height: ringSize }}
    >
      {/* Orbit rings */}
      <svg
        className="absolute inset-0"
        viewBox="0 0 100 100"
        aria-hidden
      >
        <circle
          cx="50"
          cy="50"
          r="32"
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="0.3"
          strokeDasharray="0.6 1.5"
          opacity="0.7"
        />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="0.25"
          strokeDasharray="0.6 1.8"
          opacity="0.5"
        />
      </svg>
      {/* Central sun */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 44,
          height: 44,
          background:
            'radial-gradient(circle at 35% 35%, #fff7ed 0%, #fbbf24 45%, #f97316 100%)',
          boxShadow:
            '0 0 18px rgba(251,191,36,0.45), 0 0 36px rgba(251,146,60,0.25)',
        }}
      />
      {/* Orbiting intent chips */}
      {items.map((it, i) => {
        const angle = (i / items.length) * 2 * Math.PI - Math.PI / 2
        const r = 92
        const x = 50 + (Math.cos(angle) * r * 100) / ringSize
        const y = 50 + (Math.sin(angle) * r * 100) / ringSize
        return (
          <div
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200 shadow-[0_2px_6px_rgba(120,80,40,0.08)]"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            {it}
          </div>
        )
      })}
      {items.length === 0 && (
        <p className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[11px] italic text-slate-400">
          add intents below to populate the orbit
        </p>
      )}
    </div>
  )
}

/* ─── Timeline View ───────────────────────────────────────────────────── */

function TimelineView({
  plan,
  onPin,
}: {
  plan: Plan
  onPin: (b: Block) => void
}) {
  if (plan.blocks.length === 0) {
    return (
      <p className="text-center text-[13px] text-slate-500">No timeline yet.</p>
    )
  }

  // Group blocks by period anchor
  const byPeriod = new Map<Period, Block[]>()
  for (const b of plan.blocks) {
    const p = periodOf(b.start)
    if (!byPeriod.has(p)) byPeriod.set(p, [])
    byPeriod.get(p)!.push(b)
  }
  const anchors: Period[] = ['dawn', 'rise', 'midday', 'trough', 'evening', 'night']
  const activeAnchors = anchors.filter((a) => byPeriod.has(a))

  return (
    <div className="flex flex-col gap-4">
      <div className="relative pl-20">
        {/* Vertical thread */}
        <div
          aria-hidden
          className="absolute bottom-2 left-[68px] top-2 w-px"
          style={{
            background:
              'linear-gradient(180deg, #fbbf24 0%, #f97316 18%, #ec4899 38%, #a855f7 58%, #6366f1 78%, #1e293b 100%)',
            opacity: 0.7,
          }}
        />
        <ol className="flex flex-col gap-5">
          {activeAnchors.map((a) => {
            const blocks = byPeriod.get(a)!
            return (
              <li key={a} className="relative">
                {/* Anchor label */}
                <div className="absolute -left-20 top-0 w-[60px] text-right">
                  <p className="text-[11px] font-semibold text-slate-700">
                    {periodAnchorTime(a)}
                  </p>
                  <p className="text-[10px] tracking-wider text-slate-500">
                    {PERIOD_LABEL[a]}
                  </p>
                </div>
                {/* Dot on the thread */}
                <span
                  aria-hidden
                  className="absolute -left-[18px] top-1.5 h-2.5 w-2.5 rounded-full bg-white ring-2"
                  style={{ borderColor: anchorColor(a) }}
                />
                {/* Watercolor strip */}
                <div
                  className={`relative h-20 overflow-hidden rounded-2xl bg-gradient-to-br ${PERIOD_GRADIENT[a]} shadow-[0_4px_18px_rgba(120,80,40,0.08)]`}
                >
                  <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        'radial-gradient(at 20% 30%, rgba(255,255,255,0.5), transparent 45%), radial-gradient(at 75% 75%, rgba(255,255,255,0.25), transparent 50%)',
                    }}
                  />
                  <p className="absolute right-3 top-2 font-display text-[14px] italic text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.18)]">
                    {PERIOD_MOOD[a]}
                  </p>
                  <p className="absolute bottom-2 left-3 text-[10px] uppercase tracking-[0.18em] text-white/80">
                    {blocks.length} block{blocks.length === 1 ? '' : 's'}
                  </p>
                </div>
                {/* Blocks in this period */}
                <ul className="mt-2 flex flex-col gap-1">
                  {blocks.map((b) => (
                    <li
                      key={b.id}
                      className="group flex items-start gap-2 rounded-xl bg-white/70 px-3 py-1.5 ring-1 ring-slate-200/60"
                    >
                      <span
                        aria-hidden
                        className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: anchorColor(a) }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-medium leading-snug text-slate-800">
                          {b.title}
                        </p>
                        <p className="font-mono text-[10px] text-slate-500">
                          {fmtClock(b.start)} – {fmtClock(b.end)}
                          {b.fixed && ' · pinned'}
                        </p>
                      </div>
                      {!b.fixed && (
                        <button
                          onClick={() => onPin(b)}
                          className="press hidden rounded-md bg-white/80 px-1.5 py-0.5 text-[10px] text-slate-500 ring-1 ring-slate-200 hover:text-slate-800 group-hover:block"
                        >
                          pin
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            )
          })}
        </ol>
      </div>

      {/* Day Shape Summary */}
      {plan.summary.title && (
        <div className="rounded-2xl bg-white/75 px-4 py-3 ring-1 ring-slate-200/60 shadow-[0_2px_10px_rgba(120,80,40,0.05)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            Day Shape Summary
          </p>
          <p className="mt-1 font-display text-[17px] italic text-slate-800">
            {plan.summary.title}
          </p>
          <div className="mt-2 h-10 w-full">
            <MiniShape blocks={plan.blocks} />
          </div>
          {plan.summary.hint && (
            <p className="mt-2 font-hand text-[18px] text-slate-600">
              {plan.summary.hint}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function anchorColor(p: Period): string {
  return {
    dawn: '#fbbf24',
    rise: '#f97316',
    midday: '#ec4899',
    trough: '#a855f7',
    evening: '#6366f1',
    night: '#1e293b',
  }[p]
}

function MiniShape({ blocks }: { blocks: Block[] }) {
  if (blocks.length === 0) return null
  const W = 200
  const H = 40
  const xMin = 6 * 60
  const xMax = 22 * 60
  const xSpan = xMax - xMin
  const points = blocks.map((b) => {
    const mid = (toMin(b.start) + toMin(b.end)) / 2
    const x = Math.max(0, Math.min(W, ((mid - xMin) / xSpan) * W))
    const y = H - 4 - ENERGY_VAL[b.energy] * (H - 10)
    return { x, y }
  })
  let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const cx = (prev.x + curr.x) / 2
    path += ` C ${cx.toFixed(1)} ${prev.y.toFixed(1)}, ${cx.toFixed(1)} ${curr.y.toFixed(1)}, ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`
  }
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-full w-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="miniShape" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      <path
        d={`${path} L ${points[points.length - 1].x} ${H} L ${points[0].x} ${H} Z`}
        fill="url(#miniShape)"
        opacity={0.25}
      />
      <path
        d={path}
        fill="none"
        stroke="url(#miniShape)"
        strokeWidth={1.4}
        strokeLinecap="round"
      />
    </svg>
  )
}

/* ─── Narrative View ──────────────────────────────────────────────────── */

function NarrativeView({
  plan,
  onPin,
}: {
  plan: Plan
  onPin: (b: Block) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      {NARRATIVE_PERIODS.map((np) => {
        const blocksInPeriod = plan.blocks.filter(
          (b) => periodOf(b.start) === np.key,
        )
        if (blocksInPeriod.length === 0) return null
        const lead = blocksInPeriod[0]
        const handNote = lead.why
          ? trimSentence(lead.why)
          : `${lead.title}.`
        const restProse = blocksInPeriod
          .slice(0, 3)
          .map((b) => b.title)
          .join(', ')
        return (
          <article
            key={np.key}
            className="relative overflow-hidden rounded-2xl bg-white/65 px-4 py-3 ring-1 ring-slate-200/60"
          >
            {/* Cloud wash on the right */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-6 -top-4 h-24 w-32 rounded-full opacity-60"
              style={{
                background: `radial-gradient(circle at 40% 50%, ${cloudWash(np.key)}, transparent 70%)`,
              }}
            />
            <div className="relative">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                <span
                  aria-hidden
                  className={`h-1.5 w-1.5 rounded-full ${np.dot}`}
                />
                {np.label}
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-slate-700">
                {periodProse(np.key, restProse)}
              </p>
              <p className="mt-1.5 font-hand text-[20px] leading-tight text-slate-600">
                {handNote}
              </p>
              <ul className="mt-2 flex flex-wrap gap-1">
                {blocksInPeriod.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => onPin(b)}
                    disabled={b.fixed}
                    className="press inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-0.5 text-[11px] text-slate-600 ring-1 ring-slate-200/70 disabled:opacity-60"
                    title={b.fixed ? 'pinned' : 'pin this block'}
                  >
                    <span className="font-mono text-[9px] text-slate-400">
                      {fmtClock(b.start)}
                    </span>
                    {b.title}
                  </button>
                ))}
              </ul>
            </div>
          </article>
        )
      })}
      {plan.summary.title && (
        <div className="rounded-2xl border border-slate-200/60 bg-white/40 px-4 py-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            Today's Takeaway <span className="text-amber-500">✦</span>
          </p>
          <p className="mt-2 font-display text-[18px] italic leading-snug text-slate-700">
            {plan.summary.title}.
            {plan.summary.hint && ` ${capitalize(plan.summary.hint)}`}
          </p>
        </div>
      )}
      {plan.narrative && (
        <p className="px-2 text-center font-display text-[15px] italic leading-relaxed text-slate-500">
          {plan.narrative}
        </p>
      )}
    </div>
  )
}

function periodProse(p: Period, items: string): string {
  const lead = {
    rise: 'The morning opens with',
    midday: 'The middle of the day brings',
    trough: 'The afternoon turns toward',
    evening: 'The evening softens into',
    dawn: 'Dawn holds',
    night: 'Night closes with',
  }[p]
  return `${lead} ${items.toLowerCase()}.`
}

function cloudWash(p: Period): string {
  return {
    dawn: 'rgba(251,191,36,0.5)',
    rise: 'rgba(253,186,116,0.45)',
    midday: 'rgba(244,114,182,0.4)',
    trough: 'rgba(168,85,247,0.4)',
    evening: 'rgba(99,102,241,0.4)',
    night: 'rgba(30,41,59,0.35)',
  }[p]
}

function trimSentence(s: string): string {
  const first = s.split('.')[0]
  const out = first.length > 60 ? first.slice(0, 58) + '…' : first
  return out.charAt(0).toLowerCase() + out.slice(1) + '.'
}
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/* ─── Shared block list (used by Energy view) ─────────────────────────── */

function BlockList({
  blocks,
  onPin,
}: {
  blocks: Block[]
  onPin: (b: Block) => void
}) {
  return (
    <details className="rounded-2xl bg-white/55 px-4 py-2 ring-1 ring-slate-200/60">
      <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
        {blocks.length} block{blocks.length === 1 ? '' : 's'}
      </summary>
      <ul className="mt-2 flex flex-col gap-1">
        {blocks.map((b) => {
          const p = periodOf(b.start)
          return (
            <li
              key={b.id}
              className="group flex items-center gap-2 rounded-lg bg-white/70 px-2.5 py-1 ring-1 ring-slate-200/50"
            >
              <span
                aria-hidden
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: anchorColor(p) }}
              />
              <span className="min-w-0 flex-1 truncate text-[13px] text-slate-700">
                {b.title}
              </span>
              <span className="font-mono text-[10px] text-slate-500">
                {fmtClock(b.start)}
              </span>
              {!b.fixed && (
                <button
                  onClick={() => onPin(b)}
                  className="press hidden text-[10px] text-slate-500 hover:text-slate-800 group-hover:block"
                >
                  pin
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </details>
  )
}
