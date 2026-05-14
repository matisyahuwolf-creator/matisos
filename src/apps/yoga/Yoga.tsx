import { useEffect, useMemo, useState } from 'react'
import { storage } from '../../lib/storage'
import PoseInfo from './PoseInfo'
import AIDiagram from './AIDiagram'
import { SKILLS, skillsForPose, type SkillId } from './skills'
import SessionsView from './SessionsView'
import TracksView from './TracksView'
import Today, { type TabKey } from './Today'
import Coach from './Coach'
import SkillsView from './SkillsView'
import FloatingChat from './FloatingChat'
import { catalog, type Difficulty } from './catalog'
import { MODALITY_LIST, MODALITIES, type Modality } from './modalities'

type Status = 'library' | 'learning' | 'mastered'
type FilterDifficulty = 'All' | Difficulty

const DIFFICULTY_ORDER: Record<Difficulty, number> = {
  Beginner: 0,
  Intermediate: 1,
  Advanced: 2,
}

type Pose = {
  id: string
  name: string
  difficulty?: Difficulty
  benefits?: string
  status: Status
  notes: string
  imageUrl?: string
  isCustom: boolean
  createdAt: number
  modality?: Modality
}

function modalityOf(pose: Pose): Modality {
  return pose.modality ?? catalog.find((c) => c.id === pose.id)?.modality ?? 'yoga'
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
    const existing = map.get(entry.id)
    if (!existing) {
      map.set(entry.id, {
        id: entry.id,
        name: entry.name,
        difficulty: entry.difficulty,
        benefits: entry.benefits,
        status: 'library',
        notes: '',
        isCustom: false,
        createdAt: 0,
      })
    } else {
      existing.name = entry.name
      existing.difficulty = entry.difficulty
      existing.benefits = entry.benefits
    }
  }

  return Array.from(map.values())
}

function saveState(poses: Pose[]) {
  storage.set(KEY, JSON.stringify(poses))
}

function difficultyRank(p: Pose): number {
  return p.difficulty ? DIFFICULTY_ORDER[p.difficulty] : 99
}

export default function Yoga() {
  const [poses, setPoses] = useState<Pose[]>(() => loadState())
  const [draft, setDraft] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [librarySearch, setLibrarySearch] = useState('')
  const [filter, setFilter] = useState<FilterDifficulty>('All')
  const [modality, setModality] = useState<Modality>('yoga')

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
      modality,
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

  const learning = useMemo(
    () =>
      poses
        .filter((p) => p.status === 'learning' && modalityOf(p) === modality)
        .sort((a, b) => difficultyRank(a) - difficultyRank(b)),
    [poses, modality],
  )
  const mastered = useMemo(
    () =>
      poses
        .filter((p) => p.status === 'mastered' && modalityOf(p) === modality)
        .sort((a, b) => difficultyRank(a) - difficultyRank(b)),
    [poses, modality],
  )
  const library = useMemo(
    () =>
      poses
        .filter((p) => p.status === 'library' && modalityOf(p) === modality)
        .sort((a, b) => {
          const d = difficultyRank(a) - difficultyRank(b)
          if (d !== 0) return d
          return a.name.localeCompare(b.name)
        }),
    [poses, modality],
  )

  const filteredLibrary = useMemo(() => {
    const q = librarySearch.trim().toLowerCase()
    return library.filter((p) => {
      if (filter !== 'All' && p.difficulty !== filter) return false
      if (!q) return true
      return (
        p.name.toLowerCase().includes(q) ||
        p.benefits?.toLowerCase().includes(q)
      )
    })
  }, [library, librarySearch, filter])

  const filters: FilterDifficulty[] = ['All', 'Beginner', 'Intermediate', 'Advanced']
  const [tab, setTab] = useState<TabKey>('today')

  const modalityScopedTab =
    tab === 'library' || tab === 'sessions' || tab === 'programs'

  return (
    <div className="flex flex-col gap-5">
      <TabBar value={tab} onChange={setTab} />

      {modalityScopedTab && (
        <ModalityBar value={modality} onChange={setModality} />
      )}

      {tab === 'today' && (
        <Today
          stats={{
            working: learning.length,
            mastered: mastered.length,
            library: library.length,
          }}
          onSwitchTab={setTab}
        />
      )}

      {tab === 'coach' && <Coach />}

      {tab === 'skills' && <SkillsView />}

      {tab === 'programs' && <TracksView modality={modality} />}

      {tab === 'sessions' && <SessionsView modality={modality} />}

      {tab === 'library' && (
        <div className="flex flex-col gap-6">
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
              placeholder="Search by name or benefit…"
              className="w-full rounded-xl bg-slate-200/70 px-3 py-2 text-[15px] outline-none placeholder:text-slate-500"
            />
            <div className="flex flex-wrap gap-1.5">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-full px-3 py-1 text-[12px] font-semibold transition ${
                    filter === f
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-200/70 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {f}
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
      )}

      <FloatingChat />
    </div>
  )
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'coach', label: 'Begin' },
  { key: 'skills', label: 'Skills' },
  { key: 'programs', label: 'Programs' },
  { key: 'sessions', label: 'Sessions' },
  { key: 'library', label: 'Library' },
]

function TabBar({
  value,
  onChange,
}: {
  value: TabKey
  onChange: (k: TabKey) => void
}) {
  return (
    <div className="flex gap-1 rounded-full bg-slate-200/70 p-1">
      {TABS.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`flex-1 rounded-full px-2 py-1.5 text-[12px] font-semibold press sm:text-[13px] ${
            value === t.key
              ? 'bg-white text-slate-900 shadow-[0_1px_3px_rgba(15,23,42,0.08),0_1px_2px_rgba(15,23,42,0.06)]'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

function ModalityBar({
  value,
  onChange,
}: {
  value: Modality
  onChange: (m: Modality) => void
}) {
  const active = MODALITIES[value]
  return (
    <div className="flex flex-col gap-2">
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {MODALITY_LIST.map((m) => {
          const isActive = m.id === value
          return (
            <button
              key={m.id}
              onClick={() => onChange(m.id)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold press transition ${
                isActive
                  ? `bg-gradient-to-br ${m.gradient} text-white shadow-[0_4px_12px_-4px_rgba(0,0,0,0.25)]`
                  : 'bg-white text-slate-700 ring-1 ring-black/5 hover:bg-slate-50'
              }`}
            >
              <span className="mr-1">{m.icon}</span>
              {m.name}
            </button>
          )
        })}
      </div>
      <p className="px-2 text-[11px] italic text-slate-500">
        {active.tagline}
      </p>
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

function DifficultyBadge({ difficulty }: { difficulty?: Difficulty }) {
  if (!difficulty) return null
  const tone = {
    Beginner: 'bg-emerald-100 text-emerald-700',
    Intermediate: 'bg-amber-100 text-amber-700',
    Advanced: 'bg-rose-100 text-rose-700',
  }[difficulty]
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tone}`}
    >
      {difficulty}
    </span>
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
        className="shrink-0 rounded-full bg-[#0071e3] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white transition hover:bg-[#0064cc]"
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
  const subtitle =
    !expanded && pose.notes ? pose.notes : pose.benefits ?? ''

  return (
    <>
      <div className={expanded ? 'bg-slate-50' : ''}>
        <div className="flex items-center gap-3 px-4 py-3">
          {pose.status !== 'library' && (
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
            <div className="flex items-center gap-2">
              <p
                className={`truncate text-[15px] font-semibold ${
                  pose.status === 'mastered'
                    ? 'text-slate-500 line-through'
                    : 'text-slate-900'
                }`}
              >
                {pose.name}
              </p>
              {pose.status === 'library' && (
                <DifficultyBadge difficulty={pose.difficulty} />
              )}
            </div>
            {subtitle && (
              <p className="truncate text-[12px] text-slate-500">{subtitle}</p>
            )}
            <SkillEmojiRow poseId={pose.id} />
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
            {pose.benefits && (
              <div className="rounded-lg bg-slate-100 px-3 py-2 text-[13px] text-slate-700">
                <span className="font-semibold">Physical benefits — </span>
                {pose.benefits}
              </div>
            )}
            <PoseSkillChips poseId={pose.id} />
            <PoseInfo name={pose.name} />
            <a
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                pose.name + ' yoga tutorial',
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 self-start rounded-lg bg-red-600 px-3 py-2 text-[13px] font-semibold text-white transition hover:bg-red-700"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
                <path fill="currentColor" d="M8 5v14l11-7L8 5z" />
              </svg>
              Watch on YouTube
            </a>
            <AIDiagram
              poseName={pose.name}
              imageUrl={pose.imageUrl}
              onGenerated={(dataUrl) => onUpdate({ imageUrl: dataUrl })}
            />
            <textarea
              value={pose.notes}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              placeholder="Notes — what you're working on, cues, breath…"
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

function PoseSkillChips({ poseId }: { poseId: string }) {
  const skills = (Object.entries(skillsForPose(poseId)) as [SkillId, number][])
    .filter(([, p]) => p > 0)
    .sort((a, b) => b[1] - a[1])
  if (skills.length === 0) return null
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <p className="mr-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
        Skills earned
      </p>
      {skills.map(([id, pts]) => {
        const meta = SKILLS[id]
        return (
          <span
            key={id}
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${meta.bg} ${meta.text}`}
            title={meta.meaning}
          >
            <span>{meta.emoji}</span>
            <span>{meta.name}</span>
            <span className="opacity-70">+{pts}</span>
          </span>
        )
      })}
    </div>
  )
}

function SkillEmojiRow({ poseId }: { poseId: string }) {
  const skills = (Object.entries(skillsForPose(poseId)) as [SkillId, number][])
    .filter(([, p]) => p > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
  if (skills.length === 0) return null
  return (
    <div className="mt-1 flex items-center gap-1">
      {skills.map(([id, pts]) => {
        const meta = SKILLS[id]
        return (
          <span
            key={id}
            title={`${meta.name} +${pts}`}
            className={`inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px] ${meta.bg}`}
          >
            <span className="text-[11px] leading-none">{meta.emoji}</span>
            <span className={`font-semibold ${meta.text}`}>+{pts}</span>
          </span>
        )
      })}
    </div>
  )
}
