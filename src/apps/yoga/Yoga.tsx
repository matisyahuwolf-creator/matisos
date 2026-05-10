import { useEffect, useMemo, useState } from 'react'
import { storage } from '../../lib/storage'
import PoseInfo from './PoseInfo'
import AIDiagram from './AIDiagram'
import { catalog } from './catalog'

type Status = 'library' | 'learning' | 'mastered'

type Pose = {
  id: string
  name: string
  sanskrit?: string
  category?: string
  status: Status
  notes: string
  imageUrl?: string
  isCustom: boolean
  createdAt: number
}

const KEY = 'yoga:state-v2'
const LEGACY_KEY = 'yoga:poses'

function loadState(): Pose[] {
  const map = new Map<string, Pose>()

  const raw = storage.get(KEY)
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Pose[]
      for (const p of parsed) map.set(p.id, p)
    } catch {
      // fall through
    }
  } else {
    const legacy = storage.get(LEGACY_KEY)
    if (legacy) {
      try {
        const old = JSON.parse(legacy) as Array<{
          id: string
          name: string
          notes?: string
          mastered?: boolean
          imageUrl?: string
          createdAt?: number
        }>
        for (const p of old) {
          map.set(p.id, {
            id: p.id,
            name: p.name,
            status: p.mastered ? 'mastered' : 'learning',
            notes: p.notes ?? '',
            imageUrl: p.imageUrl,
            isCustom: true,
            createdAt: p.createdAt ?? Date.now(),
          })
        }
      } catch {
        // ignore
      }
    }
  }

  for (const entry of catalog) {
    if (!map.has(entry.id)) {
      map.set(entry.id, {
        id: entry.id,
        name: entry.name,
        sanskrit: entry.sanskrit,
        category: entry.category,
        status: 'library',
        notes: '',
        isCustom: false,
        createdAt: 0,
      })
    } else {
      const existing = map.get(entry.id)!
      if (!existing.sanskrit) existing.sanskrit = entry.sanskrit
      if (!existing.category) existing.category = entry.category
    }
  }

  return Array.from(map.values())
}

function saveState(poses: Pose[]) {
  storage.set(KEY, JSON.stringify(poses))
}

export default function Yoga() {
  const [poses, setPoses] = useState<Pose[]>(() => loadState())
  const [draft, setDraft] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [librarySearch, setLibrarySearch] = useState('')
  const [libraryCategory, setLibraryCategory] = useState<string>('All')

  useEffect(() => {
    saveState(poses)
  }, [poses])

  function addCustomPose() {
    const name = draft.trim()
    if (!name) return
    const pose: Pose = {
      id: `custom-${crypto.randomUUID()}`,
      name,
      status: 'learning',
      notes: '',
      isCustom: true,
      createdAt: Date.now(),
    }
    setPoses((prev) => [pose, ...prev])
    setDraft('')
    setExpandedId(pose.id)
  }

  function update(id: string, patch: Partial<Pose>) {
    setPoses((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }

  function removeOrReset(pose: Pose) {
    if (pose.isCustom) {
      setPoses((prev) => prev.filter((p) => p.id !== pose.id))
    } else {
      update(pose.id, { status: 'library', notes: '', imageUrl: undefined })
    }
    if (expandedId === pose.id) setExpandedId(null)
  }

  const learning = poses.filter((p) => p.status === 'learning')
  const mastered = poses.filter((p) => p.status === 'mastered')
  const library = poses.filter((p) => p.status === 'library')

  const categories = useMemo(() => {
    const set = new Set<string>()
    for (const p of library) if (p.category) set.add(p.category)
    return ['All', ...Array.from(set).sort()]
  }, [library])

  const filteredLibrary = useMemo(() => {
    const q = librarySearch.trim().toLowerCase()
    return library.filter((p) => {
      if (libraryCategory !== 'All' && p.category !== libraryCategory) return false
      if (!q) return true
      return (
        p.name.toLowerCase().includes(q) ||
        p.sanskrit?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      )
    })
  }, [library, librarySearch, libraryCategory])

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-2">
        <Stat value={learning.length} label="Working on" tone="amber" />
        <Stat value={mastered.length} label="Mastered" tone="emerald" />
        <Stat value={library.length} label="In Library" tone="slate" />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') addCustomPose()
          }}
          placeholder="Add a custom pose…"
          className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[15px] outline-none transition focus:border-[#0071e3]"
        />
        <button
          onClick={addCustomPose}
          disabled={!draft.trim()}
          className="rounded-xl bg-[#0071e3] px-4 py-2 text-[15px] font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Add
        </button>
      </div>

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
              onRemoveOrReset={() => removeOrReset(pose)}
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
              onRemoveOrReset={() => removeOrReset(pose)}
              isLast={i === mastered.length - 1}
            />
          ))}
        </Section>
      )}

      {library.length > 0 && (
        <section>
          <h3 className="mb-2 px-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
            Library · {library.length}
          </h3>

          <div className="mb-3 flex flex-col gap-2 px-1">
            <input
              type="search"
              value={librarySearch}
              onChange={(e) => setLibrarySearch(e.target.value)}
              placeholder="Search library…"
              className="w-full rounded-xl bg-slate-200/70 px-3 py-2 text-[15px] outline-none placeholder:text-slate-500"
            />
            <div className="flex flex-wrap gap-1.5">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setLibraryCategory(c)}
                  className={`rounded-full px-3 py-1 text-[12px] font-semibold transition ${
                    libraryCategory === c
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-200/70 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {filteredLibrary.length === 0 ? (
            <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
              No poses match this filter.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
              {filteredLibrary.map((pose, i) => (
                <PoseRow
                  key={pose.id}
                  pose={pose}
                  expanded={expandedId === pose.id}
                  onToggleExpand={() =>
                    setExpandedId(expandedId === pose.id ? null : pose.id)
                  }
                  onUpdate={(patch) => update(pose.id, patch)}
                  onRemoveOrReset={() => removeOrReset(pose)}
                  isLast={i === filteredLibrary.length - 1}
                />
              ))}
            </div>
          )}
        </section>
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

function StatusAction({
  status,
  onStartPracticing,
  onToggleMastered,
}: {
  status: Status
  onStartPracticing: () => void
  onToggleMastered: () => void
}) {
  if (status === 'library') {
    return (
      <button
        onClick={onStartPracticing}
        className="rounded-full bg-[#0071e3] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white transition hover:bg-[#0064cc]"
      >
        Practice
      </button>
    )
  }
  return (
    <button
      onClick={onToggleMastered}
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
        status === 'mastered'
          ? 'border-emerald-500 bg-emerald-500 text-white'
          : 'border-slate-300 bg-white hover:border-slate-400'
      }`}
      aria-label={status === 'mastered' ? 'Mark as learning' : 'Mark as mastered'}
    >
      {status === 'mastered' && (
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
  )
}

function PoseRow({
  pose,
  expanded,
  onToggleExpand,
  onUpdate,
  onRemoveOrReset,
  isLast,
}: {
  pose: Pose
  expanded: boolean
  onToggleExpand: () => void
  onUpdate: (patch: Partial<Pose>) => void
  onRemoveOrReset: () => void
  isLast: boolean
}) {
  return (
    <>
      <div className={expanded ? 'bg-slate-50' : ''}>
        <div className="flex items-center gap-3 px-4 py-3">
          {pose.status === 'library' ? (
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">
              {pose.category?.[0] ?? '·'}
            </div>
          ) : (
            <StatusAction
              status={pose.status}
              onStartPracticing={() => onUpdate({ status: 'learning' })}
              onToggleMastered={() =>
                onUpdate({
                  status: pose.status === 'mastered' ? 'learning' : 'mastered',
                })
              }
            />
          )}

          <button
            onClick={onToggleExpand}
            className="min-w-0 flex-1 text-left"
          >
            <p
              className={`truncate text-[15px] font-semibold ${
                pose.status === 'mastered'
                  ? 'text-slate-500 line-through'
                  : 'text-slate-900'
              }`}
            >
              {pose.name}
            </p>
            <p className="truncate text-[12px] text-slate-500">
              {pose.sanskrit ||
                (!expanded && pose.notes ? pose.notes : pose.category ?? '')}
            </p>
          </button>

          {pose.status === 'library' && (
            <StatusAction
              status="library"
              onStartPracticing={() => onUpdate({ status: 'learning' })}
              onToggleMastered={() => {}}
            />
          )}

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
            <PoseInfo name={pose.sanskrit ?? pose.name} />
            <AIDiagram
              poseName={pose.sanskrit ?? pose.name}
              imageUrl={pose.imageUrl}
              onGenerated={(dataUrl) => onUpdate({ imageUrl: dataUrl })}
            />
            <textarea
              value={pose.notes}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              placeholder="Notes — alignment cues, breath, what you're working on…"
              className="min-h-[80px] w-full resize-none rounded-lg border border-slate-200 bg-white p-2 text-[14px] outline-none transition focus:border-[#0071e3]"
            />
            <button
              onClick={onRemoveOrReset}
              className="self-start text-[13px] font-medium text-red-600 transition hover:text-red-700"
            >
              {pose.isCustom
                ? 'Delete pose'
                : pose.status === 'library'
                  ? 'Reset'
                  : 'Move back to library'}
            </button>
          </div>
        )}
      </div>
      {!isLast && <div className="ml-[60px] h-px bg-slate-200/70" />}
    </>
  )
}
