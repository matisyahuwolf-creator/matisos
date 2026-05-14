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
type View = 'timeline' | 'energy' | 'priority' | 'narrative'

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
  narrative: string
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

const CATEGORY_COLOR: Record<Category, string> = {
  work: 'bg-indigo-500',
  rest: 'bg-slate-400',
  movement: 'bg-emerald-500',
  meal: 'bg-amber-500',
  connect: 'bg-rose-500',
  create: 'bg-fuchsia-500',
  admin: 'bg-cyan-600',
  sleep: 'bg-violet-700',
}

const CATEGORY_GLYPH: Record<Category, string> = {
  work: '▣',
  rest: '◌',
  movement: '◆',
  meal: '◉',
  connect: '◐',
  create: '✦',
  admin: '▤',
  sleep: '☾',
}

const ENERGY_OPACITY: Record<Energy, string> = {
  low: 'opacity-55',
  mid: 'opacity-80',
  high: 'opacity-100',
}

function toMin(t: string): number {
  const [h, m] = t.split(':').map((n) => parseInt(n, 10))
  return h * 60 + m
}
function fmtTime(t: string): string {
  const [h, m] = t.split(':').map((n) => parseInt(n, 10))
  const period = h >= 12 ? 'pm' : 'am'
  const hh = h % 12 === 0 ? 12 : h % 12
  return m === 0 ? `${hh}${period}` : `${hh}:${String(m).padStart(2, '0')}${period}`
}
function durationMin(b: Block): number {
  return Math.max(0, toMin(b.end) - toMin(b.start))
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
  const [showState, setShowState] = useState(false)

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
        view: data.view,
        narrative: data.narrative ?? '',
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
            `Updated your day — ${newPlan.blocks.length} blocks.`,
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

  const greeting = useMemo(() => {
    const h = new Date().getHours()
    if (h < 5) return 'Up late'
    if (h < 12) return 'Morning'
    if (h < 17) return 'Afternoon'
    if (h < 21) return 'Evening'
    return 'Night'
  }, [])

  return (
    <div className="flex flex-col gap-5">
      <header className="px-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-600">
          {greeting} · Cadence
        </p>
        <h1 className="mt-1 font-display text-[28px] italic font-medium leading-tight tracking-tight text-slate-900 sm:text-[32px]">
          An AI shape for your day.
        </h1>
        <p className="mt-2 max-w-md text-[13px] leading-relaxed text-slate-600">
          Tell it what's on your mind. It'll choose how to render the answer —
          a full plan, an energy read, a priority cut, or a story.
        </p>
      </header>

      <section className="rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4 ring-1 ring-indigo-100">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowState((v) => !v)}
            className="text-[11px] font-semibold uppercase tracking-wider text-indigo-700 press hover:text-indigo-900"
          >
            {showState ? '▾' : '▸'} State · {intents.length} intent
            {intents.length === 1 ? '' : 's'} · {fixed.length} pinned
          </button>
          {(plan || history.length > 0) && (
            <button
              onClick={clearAll}
              className="text-[11px] text-slate-500 press hover:text-slate-900"
            >
              Reset
            </button>
          )}
        </div>

        {showState && (
          <div className="mt-3 flex flex-col gap-3">
            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                Intents — what you want from the day
              </p>
              <div className="flex flex-wrap gap-1.5">
                {intents.map((it, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[12px] text-slate-700 ring-1 ring-indigo-100"
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
                <span className="inline-flex items-center gap-1 rounded-full bg-white/60 px-1.5 py-0.5 ring-1 ring-indigo-100">
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
                    className="w-32 bg-transparent text-[12px] outline-none placeholder:text-slate-400"
                  />
                  {newIntent && (
                    <button
                      onClick={addIntent}
                      className="text-[12px] font-semibold text-indigo-600"
                    >
                      +
                    </button>
                  )}
                </span>
              </div>
            </div>

            {fixed.length > 0 && (
              <div>
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Pinned — can't be moved
                </p>
                <div className="flex flex-col gap-1">
                  {fixed.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between rounded-lg bg-white px-2.5 py-1.5 text-[12px] ring-1 ring-indigo-100"
                    >
                      <span>
                        <span className="font-semibold text-slate-700">
                          {fmtTime(b.start)}–{fmtTime(b.end)}
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
              </div>
            )}
          </div>
        )}
      </section>

      <section
        className="rounded-2xl bg-slate-950 p-5 text-slate-100 shadow-card"
        aria-live="polite"
      >
        {!plan && (
          <EmptyState onPrompt={(p) => send(p)} disabled={loading} />
        )}
        {plan && plan.view === 'timeline' && (
          <TimelineView plan={plan} onPin={pinBlock} />
        )}
        {plan && plan.view === 'energy' && (
          <EnergyView plan={plan} onPin={pinBlock} />
        )}
        {plan && plan.view === 'priority' && (
          <PriorityView plan={plan} onPin={pinBlock} />
        )}
        {plan && plan.view === 'narrative' && (
          <NarrativeView plan={plan} onPin={pinBlock} />
        )}
      </section>

      {plan && plan.suggestions.length > 0 && (
        <section>
          <p className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Nudges
          </p>
          <ul className="flex flex-col gap-1.5">
            {plan.suggestions.map((s, i) => (
              <li
                key={i}
                className="rounded-xl bg-amber-50 px-3 py-2 text-[13px] text-amber-900 ring-1 ring-amber-200"
              >
                {s}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="sticky bottom-0 -mx-6 -mb-6 mt-1 rounded-b-2xl border-t border-slate-200 bg-white/90 px-6 py-3 backdrop-blur">
        {error && (
          <p className="mb-2 text-[12px] text-rose-600">{error}</p>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            send(input)
          }}
          className="flex items-end gap-2"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send(input)
              }
            }}
            placeholder={
              plan
                ? 'Adjust the day, ask what matters, rebuild it…'
                : 'Plan my day · what should I focus on · how am I doing on energy'
            }
            rows={1}
            className="min-h-[40px] flex-1 resize-none rounded-xl bg-slate-100 px-3 py-2 text-[14px] outline-none ring-1 ring-transparent focus:bg-white focus:ring-indigo-300 placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="press inline-flex h-10 items-center rounded-xl bg-slate-900 px-4 text-[13px] font-semibold text-white shadow-sm transition disabled:opacity-40"
          >
            {loading ? 'Thinking…' : 'Send'}
          </button>
        </form>
      </section>
    </div>
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
    'Plan my day',
    'What should I focus on first?',
    'How is my energy looking?',
    'Tell me about my day in one paragraph',
  ]
  return (
    <div className="flex flex-col items-center gap-3 py-6 text-center">
      <div className="text-[28px] opacity-50">◑</div>
      <p className="text-[13px] text-slate-300">
        Start with intents above, then ask Cadence anything.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-1.5">
        {seeds.map((s) => (
          <button
            key={s}
            disabled={disabled}
            onClick={() => onPrompt(s)}
            className="press rounded-full bg-slate-800 px-3 py-1 text-[12px] text-slate-200 ring-1 ring-slate-700 hover:bg-slate-700 disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

function ViewHeader({
  label,
  plan,
}: {
  label: string
  plan: Plan
}) {
  return (
    <div className="mb-3 flex items-start justify-between gap-3">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
          {label}
        </p>
        {plan.narrative && (
          <p className="mt-1 font-display text-[17px] italic leading-snug text-slate-100">
            {plan.narrative}
          </p>
        )}
      </div>
      <span className="shrink-0 rounded-full bg-slate-800 px-2 py-0.5 text-[10px] uppercase tracking-wider text-slate-300">
        {plan.blocks.length}
      </span>
    </div>
  )
}

function TimelineView({ plan, onPin }: { plan: Plan; onPin: (b: Block) => void }) {
  if (plan.blocks.length === 0) {
    return <p className="text-[13px] text-slate-400">No blocks — try a follow-up.</p>
  }
  const dayStart = Math.min(...plan.blocks.map((b) => toMin(b.start)))
  const dayEnd = Math.max(...plan.blocks.map((b) => toMin(b.end)))
  const span = Math.max(60, dayEnd - dayStart)

  return (
    <div>
      <ViewHeader label="Timeline" plan={plan} />
      <ol className="flex flex-col gap-1.5">
        {plan.blocks.map((b) => {
          const height = Math.max(36, ((durationMin(b) / span) * 360) | 0)
          return (
            <li
              key={b.id}
              className="group relative flex overflow-hidden rounded-xl ring-1 ring-slate-800"
              style={{ minHeight: height }}
            >
              <div
                className={`w-1.5 ${CATEGORY_COLOR[b.category]} ${ENERGY_OPACITY[b.energy]}`}
              />
              <div className="flex flex-1 flex-col gap-0.5 bg-slate-900 px-3 py-2">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-mono text-[11px] text-slate-400">
                    {fmtTime(b.start)} – {fmtTime(b.end)}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500">
                    {b.energy}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[14px] font-semibold text-slate-100">
                  <span aria-hidden className="text-slate-500">
                    {CATEGORY_GLYPH[b.category]}
                  </span>
                  {b.title}
                  {b.fixed && (
                    <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-indigo-300">
                      pinned
                    </span>
                  )}
                </div>
                {b.why && (
                  <p className="text-[12px] leading-snug text-slate-400">{b.why}</p>
                )}
              </div>
              {!b.fixed && (
                <button
                  onClick={() => onPin(b)}
                  className="press absolute right-2 top-2 hidden rounded-md bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300 ring-1 ring-slate-700 hover:bg-slate-700 group-hover:block"
                  aria-label="Pin block"
                >
                  Pin
                </button>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function EnergyView({ plan, onPin }: { plan: Plan; onPin: (b: Block) => void }) {
  const energyValue: Record<Energy, number> = { low: 1, mid: 2, high: 3 }
  const max = 3
  return (
    <div>
      <ViewHeader label="Energy" plan={plan} />
      <div className="flex h-32 items-end gap-1">
        {plan.blocks.map((b) => {
          const v = energyValue[b.energy]
          const pct = (v / max) * 100
          const w = Math.max(8, durationMin(b))
          return (
            <button
              key={b.id}
              onClick={() => onPin(b)}
              title={`${b.title} · ${b.energy} · ${fmtTime(b.start)}`}
              className="press flex flex-col justify-end overflow-hidden rounded-t-md ring-1 ring-slate-800 transition hover:ring-slate-600"
              style={{ flex: w, height: '100%' }}
            >
              <div
                className={`${CATEGORY_COLOR[b.category]} ${ENERGY_OPACITY[b.energy]}`}
                style={{ height: `${pct}%` }}
              />
            </button>
          )
        })}
      </div>
      <ul className="mt-3 flex flex-col gap-1">
        {plan.blocks.map((b) => (
          <li
            key={b.id}
            className="flex items-baseline gap-2 text-[12px] text-slate-300"
          >
            <span className="font-mono text-[10px] text-slate-500">
              {fmtTime(b.start)}
            </span>
            <span
              className={`h-2 w-2 rounded-full ${CATEGORY_COLOR[b.category]} ${ENERGY_OPACITY[b.energy]}`}
            />
            <span className="flex-1 truncate text-slate-200">{b.title}</span>
            <span className="text-[10px] uppercase tracking-wider text-slate-500">
              {b.energy}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function PriorityView({
  plan,
  onPin,
}: {
  plan: Plan
  onPin: (b: Block) => void
}) {
  const ranked = [...plan.blocks].sort((a, b) => {
    const e: Record<Energy, number> = { high: 0, mid: 1, low: 2 }
    return e[a.energy] - e[b.energy]
  })
  const top = ranked.slice(0, 3)
  const rest = ranked.slice(3)
  return (
    <div>
      <ViewHeader label="What matters" plan={plan} />
      <ol className="flex flex-col gap-2">
        {top.map((b, i) => (
          <li
            key={b.id}
            className="overflow-hidden rounded-xl bg-slate-900 ring-1 ring-slate-800"
          >
            <div
              className={`h-1 ${CATEGORY_COLOR[b.category]} ${ENERGY_OPACITY[b.energy]}`}
            />
            <div className="p-3">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-[28px] font-bold text-slate-700">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold leading-tight text-slate-100">
                    {b.title}
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] text-slate-400">
                    {fmtTime(b.start)} – {fmtTime(b.end)} · {b.energy} energy
                  </p>
                </div>
                {!b.fixed && (
                  <button
                    onClick={() => onPin(b)}
                    className="press rounded-md bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300 ring-1 ring-slate-700 hover:bg-slate-700"
                  >
                    Pin
                  </button>
                )}
              </div>
              {b.why && (
                <p className="mt-2 text-[12px] leading-snug text-slate-400">
                  {b.why}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
      {rest.length > 0 && (
        <>
          <p className="mt-3 mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
            Everything else
          </p>
          <div className="flex flex-wrap gap-1">
            {rest.map((b) => (
              <span
                key={b.id}
                className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-400"
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${CATEGORY_COLOR[b.category]}`}
                />
                {b.title}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function NarrativeView({
  plan,
  onPin,
}: {
  plan: Plan
  onPin: (b: Block) => void
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
        Narrative
      </p>
      <p className="mt-2 font-display text-[20px] italic leading-relaxed text-slate-100">
        {plan.narrative || '—'}
      </p>
      <div className="mt-5 grid grid-cols-1 gap-1 sm:grid-cols-2">
        {plan.blocks.map((b) => (
          <button
            key={b.id}
            onClick={() => onPin(b)}
            className="press group flex items-center gap-2 rounded-lg bg-slate-900 px-2.5 py-1.5 text-left ring-1 ring-slate-800 hover:ring-slate-600"
          >
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${CATEGORY_COLOR[b.category]} ${ENERGY_OPACITY[b.energy]}`}
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12px] text-slate-200">
                {b.title}
              </span>
              <span className="block font-mono text-[10px] text-slate-500">
                {fmtTime(b.start)} – {fmtTime(b.end)}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
