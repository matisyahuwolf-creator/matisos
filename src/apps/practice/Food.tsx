import { useMemo, useState } from 'react'
import {
  addFood,
  deleteAt,
  loadFood,
  relativeDay,
  startOfToday,
  type FoodEntry,
} from './storage'

const MEALS: { id: FoodEntry['meal']; label: string; emoji: string }[] = [
  { id: 'breakfast', label: 'Breakfast', emoji: '🍳' },
  { id: 'lunch', label: 'Lunch', emoji: '🥗' },
  { id: 'dinner', label: 'Dinner', emoji: '🍲' },
  { id: 'snack', label: 'Snack', emoji: '🍎' },
]

function defaultMealForTime(): FoodEntry['meal'] {
  const h = new Date().getHours()
  if (h < 11) return 'breakfast'
  if (h < 15) return 'lunch'
  if (h < 21) return 'dinner'
  return 'snack'
}

function startOfDay(ts: number): number {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function dayLabel(ts: number): string {
  const today = startOfToday()
  const day = startOfDay(ts)
  if (day === today) return 'Today'
  const yesterday = today - 24 * 60 * 60 * 1000
  if (day === yesterday) return 'Yesterday'
  return new Date(day).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

export default function Food() {
  const [entries, setEntries] = useState<FoodEntry[]>(() => loadFood())
  const [meal, setMeal] = useState<FoodEntry['meal']>(defaultMealForTime())
  const [what, setWhat] = useState('')
  const [notes, setNotes] = useState('')

  function log() {
    const text = what.trim()
    if (!text) return
    const entry: FoodEntry = {
      ts: Date.now(),
      meal,
      what: text,
      notes: notes.trim() || undefined,
    }
    addFood(entry)
    setEntries([entry, ...entries])
    setWhat('')
    setNotes('')
  }

  function remove(ts: number) {
    setEntries(deleteAt<FoodEntry>('practice:food-log', ts))
  }

  const byDay = useMemo(() => {
    const groups: Record<number, FoodEntry[]> = {}
    for (const e of entries) {
      const day = startOfDay(e.ts)
      if (!groups[day]) groups[day] = []
      groups[day].push(e)
    }
    return Object.entries(groups)
      .map(([k, v]) => ({ day: Number(k), entries: v }))
      .sort((a, b) => b.day - a.day)
      .slice(0, 10)
  }, [entries])

  return (
    <div className="flex flex-col gap-5">
      {/* Quick log */}
      <section className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 shadow-card">
        <div className="border-b border-slate-100 px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
            What did you eat?
          </p>
          <h3 className="mt-0.5 font-display text-[20px] italic text-slate-900">
            A quiet log of nourishment.
          </h3>
        </div>

        <div className="p-4">
          <div className="mb-3 flex flex-wrap gap-1.5">
            {MEALS.map((m) => {
              const active = m.id === meal
              return (
                <button
                  key={m.id}
                  onClick={() => setMeal(m.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold press ${
                    active
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{m.emoji}</span>
                  <span>{m.label}</span>
                </button>
              )
            })}
          </div>

          <div className="flex flex-col gap-2">
            <textarea
              value={what}
              onChange={(e) => setWhat(e.target.value)}
              placeholder="e.g. Oatmeal with banana and walnuts"
              rows={2}
              className="resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-[14px] outline-none focus:border-amber-400"
            />
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes (how it felt, optional)"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] outline-none focus:border-amber-400"
            />
            <button
              onClick={log}
              disabled={!what.trim()}
              className="rounded-lg bg-amber-600 px-3 py-2 text-[14px] font-semibold text-white press disabled:bg-slate-300"
            >
              Log it
            </button>
          </div>
        </div>
      </section>

      {/* Recent days */}
      {byDay.length > 0 && (
        <section className="flex flex-col gap-3">
          {byDay.map((group) => (
            <div
              key={group.day}
              className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/5"
            >
              <div className="flex items-baseline justify-between border-b border-slate-100 px-4 py-2.5">
                <p className="font-display text-[15px] italic text-slate-900">
                  {dayLabel(group.day)}
                </p>
                <p className="text-[11px] uppercase tracking-wider text-slate-500">
                  {group.entries.length} entries
                </p>
              </div>
              <ul className="divide-y divide-slate-100">
                {group.entries.map((e) => {
                  const meta = MEALS.find((m) => m.id === e.meal)
                  return (
                    <li
                      key={e.ts}
                      className="flex items-start gap-3 px-4 py-2.5"
                    >
                      <span className="text-xl">{meta?.emoji ?? '·'}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                            {meta?.label}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {relativeDay(e.ts)}
                          </p>
                        </div>
                        <p className="text-[14px] text-slate-900">{e.what}</p>
                        {e.notes && (
                          <p className="mt-0.5 text-[12px] italic text-slate-500">
                            {e.notes}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => remove(e.ts)}
                        className="shrink-0 text-[12px] text-slate-300 hover:text-rose-500"
                        aria-label="Delete entry"
                      >
                        ×
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </section>
      )}

      {entries.length === 0 && (
        <p className="px-1 text-center text-[12px] text-slate-500">
          No entries yet. Add what you ate today.
        </p>
      )}
    </div>
  )
}
