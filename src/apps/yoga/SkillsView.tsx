import { useMemo, useState } from 'react'
import { catalog } from './catalog'
import {
  SKILLS,
  loadSkillPoints,
  skillsForPose,
  type SkillId,
  type SkillMeta,
} from './skills'

export default function Skills() {
  const points = useMemo(loadSkillPoints, [])
  const [openSkill, setOpenSkill] = useState<SkillId | null>(null)

  const allSkills = useMemo(() => {
    const ids = Object.keys(SKILLS) as SkillId[]
    return ids
      .map((id) => ({ skill: SKILLS[id], pts: points[id] ?? 0 }))
      .sort((a, b) => b.pts - a.pts)
  }, [points])

  const developing = allSkills.filter((s) => s.pts > 0).length
  const total = allSkills.reduce((acc, s) => acc + s.pts, 0)
  const max = Math.max(1, ...allSkills.map((s) => s.pts))

  return (
    <div className="flex flex-col gap-4">
      <header className="px-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
          Skills
        </p>
        <h2 className="mt-0.5 font-display text-[32px] italic leading-tight tracking-tight text-slate-900">
          What you're building
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
          Each pose develops specific physiological capacities. Your skill points reflect what your body is actually gaining — not vanity metrics.
        </p>
        <div className="mt-3 flex items-center gap-3 rounded-xl bg-white px-3 py-2.5 ring-1 ring-black/5">
          <div className="flex-1">
            <p className="text-2xl font-bold leading-none text-slate-900">
              {total}
            </p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Total skill points
            </p>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="flex-1">
            <p className="text-2xl font-bold leading-none text-slate-900">
              {developing}/10
            </p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Skills developing
            </p>
          </div>
        </div>
      </header>

      <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
        <ul className="divide-y divide-slate-100">
          {allSkills.map(({ skill, pts }) => (
            <SkillRow
              key={skill.id}
              skill={skill}
              points={pts}
              max={max}
              isOpen={openSkill === skill.id}
              onToggle={() =>
                setOpenSkill(openSkill === skill.id ? null : skill.id)
              }
            />
          ))}
        </ul>
      </div>
    </div>
  )
}

function SkillRow({
  skill,
  points,
  max,
  isOpen,
  onToggle,
}: {
  skill: SkillMeta
  points: number
  max: number
  isOpen: boolean
  onToggle: () => void
}) {
  const posesForSkill = useMemo(() => {
    return catalog
      .map((p) => ({ pose: p, pts: skillsForPose(p.id)[skill.id] ?? 0 }))
      .filter((p) => p.pts > 0)
      .sort((a, b) => b.pts - a.pts || a.pose.name.localeCompare(b.pose.name))
  }, [skill.id])

  const pct = Math.min(100, (points / max) * 100)

  return (
    <li>
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3 text-left press hover:bg-slate-50"
      >
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl ${
            points > 0 ? skill.bg : 'bg-slate-100'
          }`}
        >
          <span className={points > 0 ? '' : 'opacity-40'}>{skill.emoji}</span>
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p
              className={`truncate text-[15px] font-semibold ${
                points > 0 ? 'text-slate-900' : 'text-slate-500'
              }`}
            >
              {skill.name}
            </p>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                points > 0
                  ? `${skill.bg} ${skill.text}`
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {points > 0 ? `${points} pts` : '—'}
            </span>
          </div>
          {points > 0 && (
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${skill.bg.replace('100', '400')}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          )}
        </div>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          className={`shrink-0 text-slate-400 transition-transform ${
            isOpen ? 'rotate-90' : ''
          }`}
          aria-hidden
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
      </button>

      {isOpen && (
        <div className="bg-slate-50 px-4 pb-4 pt-2">
          <p className="text-[13px] leading-relaxed text-slate-700">
            {skill.meaning}
          </p>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
            {posesForSkill.length} poses develop this
          </p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {posesForSkill.slice(0, 30).map(({ pose, pts }) => (
              <li
                key={pose.id}
                className="flex items-center justify-between rounded-lg bg-white px-3 py-1.5 text-[13px]"
              >
                <span className="truncate text-slate-700">{pose.name}</span>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${skill.bg} ${skill.text}`}
                >
                  +{pts}
                </span>
              </li>
            ))}
            {posesForSkill.length > 30 && (
              <li className="px-3 text-[11px] text-slate-500">
                +{posesForSkill.length - 30} more in the library
              </li>
            )}
          </ul>
        </div>
      )}
    </li>
  )
}
