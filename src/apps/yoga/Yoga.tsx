import { useEffect, useState } from 'react'
import { storage } from '../../lib/storage'
import PoseInfo from './PoseInfo'

type Pose = {
  id: string
  name: string
  notes: string
  mastered: boolean
  createdAt: number
}

const KEY = 'yoga:poses'

function load(): Pose[] {
  const raw = storage.get(KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as Pose[]
  } catch {
    return []
  }
}

function save(poses: Pose[]) {
  storage.set(KEY, JSON.stringify(poses))
}

export default function Yoga() {
  const [poses, setPoses] = useState<Pose[]>(() => load())
  const [draft, setDraft] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    save(poses)
  }, [poses])

  function addPose() {
    const name = draft.trim()
    if (!name) return
    const pose: Pose = {
      id: crypto.randomUUID(),
      name,
      notes: '',
      mastered: false,
      createdAt: Date.now(),
    }
    setPoses((prev) => [pose, ...prev])
    setDraft('')
    setExpandedId(pose.id)
  }

  function update(id: string, patch: Partial<Pose>) {
    setPoses((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }

  function remove(id: string) {
    setPoses((prev) => prev.filter((p) => p.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  const learning = poses.filter((p) => !p.mastered)
  const mastered = poses.filter((p) => p.mastered)

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-2">
        <Stat value={poses.length} label="Poses" tone="slate" />
        <Stat value={learning.length} label="Learning" tone="amber" />
        <Stat value={mastered.length} label="Mastered" tone="emerald" />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') addPose()
          }}
          placeholder="Add a pose — Crow, Wheel, Warrior I…"
          className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[15px] outline-none transition focus:border-[#0071e3]"
        />
        <button
          onClick={addPose}
          disabled={!draft.trim()}
          className="rounded-xl bg-[#0071e3] px-4 py-2 text-[15px] font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Add
        </button>
      </div>

      {poses.length === 0 && (
        <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
          No poses yet. Add one above to start tracking your practice.
        </div>
      )}

      {learning.length > 0 && (
        <Section title={`Working on · ${learning.length}`}>
          {learning.map((pose, i) => (
            <PoseRow
              key={pose.id}
              pose={pose}
              expanded={expandedId === pose.id}
              onToggleExpand={() =>
                setExpandedId(expandedId === pose.id ? null : pose.id)
              }
              onUpdate={(patch) => update(pose.id, patch)}
              onDelete={() => remove(pose.id)}
              isLast={i === learning.length - 1}
            />
          ))}
        </Section>
      )}

      {mastered.length > 0 && (
        <Section title={`Mastered · ${mastered.length}`}>
          {mastered.map((pose, i) => (
            <PoseRow
              key={pose.id}
              pose={pose}
              expanded={expandedId === pose.id}
              onToggleExpand={() =>
                setExpandedId(expandedId === pose.id ? null : pose.id)
              }
              onUpdate={(patch) => update(pose.id, patch)}
              onDelete={() => remove(pose.id)}
              isLast={i === mastered.length - 1}
            />
          ))}
        </Section>
      )}
    </div>
  )
}

function Stat({
  value,
  label,
  tone,
}: {
  value: number
  label: string
  tone: 'slate' | 'amber' | 'emerald'
}) {
  const tones = {
    slate: 'bg-slate-100 text-slate-700',
    amber: 'bg-amber-100 text-amber-800',
    emerald: 'bg-emerald-100 text-emerald-800',
  }
  return (
    <div className={`rounded-xl px-3 py-3 text-center ${tones[tone]}`}>
      <div className="text-2xl font-bold leading-none">{value}</div>
      <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider">
        {label}
      </div>
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h3 className="mb-2 px-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
        {title}
      </h3>
      <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
        {children}
      </div>
    </section>
  )
}

function PoseRow({
  pose,
  expanded,
  onToggleExpand,
  onUpdate,
  onDelete,
  isLast,
}: {
  pose: Pose
  expanded: boolean
  onToggleExpand: () => void
  onUpdate: (patch: Partial<Pose>) => void
  onDelete: () => void
  isLast: boolean
}) {
  return (
    <>
      <div className={expanded ? 'bg-slate-50' : ''}>
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => onUpdate({ mastered: !pose.mastered })}
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
              pose.mastered
                ? 'border-emerald-500 bg-emerald-500 text-white'
                : 'border-slate-300 bg-white hover:border-slate-400'
            }`}
            aria-label={pose.mastered ? 'Mark as learning' : 'Mark as mastered'}
          >
            {pose.mastered && (
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
                <path
                  d="M2 6L5 9L10 3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>

          <button
            onClick={onToggleExpand}
            className="min-w-0 flex-1 text-left"
          >
            <p
              className={`truncate text-[15px] font-semibold ${
                pose.mastered ? 'text-slate-500 line-through' : 'text-slate-900'
              }`}
            >
              {pose.name}
            </p>
            {!expanded && pose.notes && (
              <p className="truncate text-[13px] text-slate-500">
                {pose.notes}
              </p>
            )}
          </button>

          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            aria-hidden
            className={`shrink-0 text-slate-400 transition-transform ${
              expanded ? 'rotate-90' : ''
            }`}
          >
            <path
              d="M5 3L9 7L5 11"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {expanded && (
          <div className="flex flex-col gap-3 px-4 pb-4 pl-[60px]">
            <PoseInfo name={pose.name} />
            <textarea
              value={pose.notes}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              placeholder="Notes — alignment cues, breath, what you're working on…"
              className="min-h-[80px] w-full resize-none rounded-lg border border-slate-200 bg-white p-2 text-[14px] outline-none transition focus:border-[#0071e3]"
            />
            <button
              onClick={onDelete}
              className="self-start text-[13px] font-medium text-red-600 transition hover:text-red-700"
            >
              Delete pose
            </button>
          </div>
        )}
      </div>
      {!isLast && <div className="ml-[60px] h-px bg-slate-200/70" />}
    </>
  )
}
