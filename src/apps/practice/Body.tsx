import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  addCardio,
  addCheckin,
  addStrength,
  deleteAt,
  loadCardio,
  loadCheckins,
  loadStrength,
  relativeDay,
  startOfToday,
  type BodyCheckin,
  type CardioEntry,
  type StrengthEntry,
} from './storage'

const STATES: {
  id: BodyCheckin['state']
  emoji: string
  label: string
  bg: string
  text: string
}[] = [
  {
    id: 'energized',
    emoji: '⚡',
    label: 'Energized',
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
  },
  {
    id: 'okay',
    emoji: '🙂',
    label: 'Okay',
    bg: 'bg-sky-100',
    text: 'text-sky-700',
  },
  {
    id: 'tired',
    emoji: '😴',
    label: 'Tired',
    bg: 'bg-indigo-100',
    text: 'text-indigo-700',
  },
  {
    id: 'sore',
    emoji: '🪢',
    label: 'Sore',
    bg: 'bg-amber-100',
    text: 'text-amber-700',
  },
  {
    id: 'stiff',
    emoji: '🪨',
    label: 'Stiff',
    bg: 'bg-rose-100',
    text: 'text-rose-700',
  },
]

export default function Body() {
  const [checkins, setCheckins] = useState<BodyCheckin[]>(() => loadCheckins())
  const [strength, setStrength] = useState<StrengthEntry[]>(() => loadStrength())
  const [cardio, setCardio] = useState<CardioEntry[]>(() => loadCardio())

  const todayCheckin = useMemo(() => {
    const todayStart = startOfToday()
    return checkins.find((c) => c.ts >= todayStart) ?? null
  }, [checkins])

  function checkIn(state: BodyCheckin['state']) {
    const entry: BodyCheckin = { ts: Date.now(), state }
    addCheckin(entry)
    setCheckins([entry, ...checkins])
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Daily check-in */}
      <section className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
        <div className="border-b border-slate-100 px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
            Today's body
          </p>
          <h3 className="mt-0.5 font-display text-[20px] italic text-slate-900">
            {todayCheckin
              ? `Feeling ${todayCheckin.state}.`
              : 'How are you in your body?'}
          </h3>
        </div>
        <div className="grid grid-cols-5 gap-1 p-2">
          {STATES.map((s) => {
            const active = todayCheckin?.state === s.id
            return (
              <button
                key={s.id}
                onClick={() => checkIn(s.id)}
                className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2.5 press hover:bg-slate-50 active:scale-95 ${
                  active ? `${s.bg} ring-2 ring-offset-1 ring-${s.text.replace('text-', '')}` : ''
                }`}
              >
                <span className="text-2xl">{s.emoji}</span>
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider ${
                    active ? s.text : 'text-slate-500'
                  }`}
                >
                  {s.label}
                </span>
              </button>
            )
          })}
        </div>
        {checkins.length > 1 && (
          <div className="border-t border-slate-100 bg-slate-50 px-4 py-2.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
              Recent
            </p>
            <ul className="mt-1 flex flex-wrap gap-1.5">
              {checkins.slice(0, 10).map((c) => {
                const meta = STATES.find((s) => s.id === c.state)
                return (
                  <li
                    key={c.ts}
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${meta?.bg ?? ''} ${meta?.text ?? ''}`}
                  >
                    <span>{meta?.emoji ?? '·'}</span>
                    <span className="font-medium">{relativeDay(c.ts)}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </section>

      {/* Exercise modalities */}
      <section>
        <p className="mb-3 px-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
          Exercise
        </p>
        <div className="flex flex-col gap-3">
          {/* Yoga — link out */}
          <Link
            to="/apps/yoga"
            className="group flex items-center gap-3 overflow-hidden rounded-2xl bg-white p-4 ring-1 ring-black/5 shadow-card press hover:shadow-card-hover"
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 text-2xl">
              🧘
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[16px] font-bold text-slate-900">Yoga</p>
              <p className="text-[12px] italic text-slate-500">
                Trauma-informed practice
              </p>
            </div>
            <span className="text-[12px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-700">
              Open →
            </span>
          </Link>

          {/* Strength */}
          <StrengthCard entries={strength} setEntries={setStrength} />

          {/* Cardio */}
          <CardioCard entries={cardio} setEntries={setCardio} />
        </div>
      </section>
    </div>
  )
}

function StrengthCard({
  entries,
  setEntries,
}: {
  entries: StrengthEntry[]
  setEntries: (e: StrengthEntry[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [exercise, setExercise] = useState('')
  const [sets, setSets] = useState('')
  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')

  function log() {
    const name = exercise.trim()
    if (!name) return
    const entry: StrengthEntry = {
      ts: Date.now(),
      exercise: name,
      sets: sets ? Number(sets) : undefined,
      reps: reps ? Number(reps) : undefined,
      weight: weight.trim() || undefined,
    }
    addStrength(entry)
    setEntries([entry, ...entries])
    setExercise('')
    setSets('')
    setReps('')
    setWeight('')
  }

  function remove(ts: number) {
    setEntries(deleteAt<StrengthEntry>('practice:strength-log', ts))
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 shadow-card">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 p-4 text-left press"
      >
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 via-red-500 to-rose-600 text-2xl">
          🔥
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[16px] font-bold text-slate-900">Strength</p>
          <p className="text-[12px] italic text-slate-500">
            {entries.length > 0
              ? `${entries.length} logged · last ${relativeDay(entries[0].ts)}`
              : 'Track lifts, sets, reps'}
          </p>
        </div>
        <span className="text-[12px] font-bold uppercase tracking-wider text-slate-400">
          {open ? 'Close' : 'Log'}
        </span>
      </button>

      {open && (
        <div className="border-t border-slate-100 p-4">
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={exercise}
              onChange={(e) => setExercise(e.target.value)}
              placeholder="Exercise (e.g. Bench Press)"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[14px] outline-none focus:border-rose-400"
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                inputMode="numeric"
                value={sets}
                onChange={(e) => setSets(e.target.value)}
                placeholder="Sets"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[14px] outline-none focus:border-rose-400"
              />
              <input
                type="number"
                inputMode="numeric"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder="Reps"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[14px] outline-none focus:border-rose-400"
              />
              <input
                type="text"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Weight"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[14px] outline-none focus:border-rose-400"
              />
            </div>
            <button
              onClick={log}
              disabled={!exercise.trim()}
              className="rounded-lg bg-rose-600 px-3 py-2 text-[14px] font-semibold text-white press disabled:bg-slate-300"
            >
              Log set
            </button>
          </div>

          {entries.length > 0 && (
            <ul className="mt-4 flex flex-col divide-y divide-slate-100">
              {entries.slice(0, 8).map((e) => (
                <li
                  key={e.ts}
                  className="flex items-baseline justify-between gap-2 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-slate-900">
                      {e.exercise}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {[
                        e.sets ? `${e.sets} sets` : null,
                        e.reps ? `${e.reps} reps` : null,
                        e.weight,
                      ]
                        .filter(Boolean)
                        .join(' · ') || 'No details'}
                    </p>
                  </div>
                  <span className="shrink-0 text-[11px] text-slate-400">
                    {relativeDay(e.ts)}
                  </span>
                  <button
                    onClick={() => remove(e.ts)}
                    className="shrink-0 text-[11px] text-slate-400 hover:text-rose-600"
                    aria-label="Delete entry"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

function CardioCard({
  entries,
  setEntries,
}: {
  entries: CardioEntry[]
  setEntries: (e: CardioEntry[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [activity, setActivity] = useState('')
  const [duration, setDuration] = useState('')
  const [notes, setNotes] = useState('')

  function log() {
    const name = activity.trim()
    if (!name) return
    const entry: CardioEntry = {
      ts: Date.now(),
      activity: name,
      durationMin: duration ? Number(duration) : undefined,
      notes: notes.trim() || undefined,
    }
    addCardio(entry)
    setEntries([entry, ...entries])
    setActivity('')
    setDuration('')
    setNotes('')
  }

  function remove(ts: number) {
    setEntries(deleteAt<CardioEntry>('practice:cardio-log', ts))
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 shadow-card">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 p-4 text-left press"
      >
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 text-2xl">
          🏃
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[16px] font-bold text-slate-900">Cardio</p>
          <p className="text-[12px] italic text-slate-500">
            {entries.length > 0
              ? `${entries.length} logged · last ${relativeDay(entries[0].ts)}`
              : 'Track runs, walks, bike, swim'}
          </p>
        </div>
        <span className="text-[12px] font-bold uppercase tracking-wider text-slate-400">
          {open ? 'Close' : 'Log'}
        </span>
      </button>

      {open && (
        <div className="border-t border-slate-100 p-4">
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              placeholder="Activity (e.g. Run, Bike)"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[14px] outline-none focus:border-blue-400"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                inputMode="numeric"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Minutes"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[14px] outline-none focus:border-blue-400"
              />
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes (optional)"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[14px] outline-none focus:border-blue-400"
              />
            </div>
            <button
              onClick={log}
              disabled={!activity.trim()}
              className="rounded-lg bg-blue-600 px-3 py-2 text-[14px] font-semibold text-white press disabled:bg-slate-300"
            >
              Log session
            </button>
          </div>

          {entries.length > 0 && (
            <ul className="mt-4 flex flex-col divide-y divide-slate-100">
              {entries.slice(0, 8).map((e) => (
                <li
                  key={e.ts}
                  className="flex items-baseline justify-between gap-2 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-slate-900">
                      {e.activity}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {[e.durationMin ? `${e.durationMin} min` : null, e.notes]
                        .filter(Boolean)
                        .join(' · ') || 'No details'}
                    </p>
                  </div>
                  <span className="shrink-0 text-[11px] text-slate-400">
                    {relativeDay(e.ts)}
                  </span>
                  <button
                    onClick={() => remove(e.ts)}
                    className="shrink-0 text-[11px] text-slate-400 hover:text-blue-600"
                    aria-label="Delete entry"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
