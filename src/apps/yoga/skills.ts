import { catalog } from './catalog'
import { storage } from '../../lib/storage'

export type SkillId =
  | 'hip-mobility'
  | 'hamstring'
  | 'spine'
  | 'shoulder'
  | 'balance'
  | 'core'
  | 'vagal-tone'
  | 'recovery'
  | 'posture'
  | 'embodiment'

export type SkillMeta = {
  id: SkillId
  name: string
  meaning: string
  emoji: string
  bg: string
  text: string
}

export const SKILLS: Record<SkillId, SkillMeta> = {
  'hip-mobility': {
    id: 'hip-mobility',
    name: 'Hip Mobility',
    meaning:
      'Range in hip rotators, glutes, and inner thighs. These muscles hold chronic stress and sitting-related shortening.',
    emoji: '🦴',
    bg: 'bg-rose-100',
    text: 'text-rose-800',
  },
  hamstring: {
    id: 'hamstring',
    name: 'Hamstring Length',
    meaning:
      'Length in the posterior leg. Directly affects forward folding, splits, and lower-back health.',
    emoji: '🦵',
    bg: 'bg-amber-100',
    text: 'text-amber-800',
  },
  spine: {
    id: 'spine',
    name: 'Spinal Mobility',
    meaning:
      'Range through the spine: flexion, extension, rotation, side-bending. Lubricates discs and nourishes spinal nerves.',
    emoji: '🌿',
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
  },
  shoulder: {
    id: 'shoulder',
    name: 'Shoulder Mobility',
    meaning:
      'Range in the shoulder girdle. Counteracts forward-rounded posture from screens and stress.',
    emoji: '🪽',
    bg: 'bg-sky-100',
    text: 'text-sky-800',
  },
  balance: {
    id: 'balance',
    name: 'Balance',
    meaning:
      'Vestibular, proprioceptive, and stabilizer development. Strongly predictive of healthy aging.',
    emoji: '⚖️',
    bg: 'bg-violet-100',
    text: 'text-violet-800',
  },
  core: {
    id: 'core',
    name: 'Core Strength',
    meaning:
      'Deep abdominals, obliques, and back-supporting muscles. The girdle that protects the spine.',
    emoji: '🔥',
    bg: 'bg-orange-100',
    text: 'text-orange-800',
  },
  'vagal-tone': {
    id: 'vagal-tone',
    name: 'Vagal Tone',
    meaning:
      'Parasympathetic capacity to down-regulate. Measurable as HRV. Built through long exhales, supine rest, and supported postures.',
    emoji: '🌊',
    bg: 'bg-cyan-100',
    text: 'text-cyan-800',
  },
  recovery: {
    id: 'recovery',
    name: 'Recovery Capacity',
    meaning:
      'Practiced ability to enter rest. The autonomic switch from work to repair.',
    emoji: '🌙',
    bg: 'bg-indigo-100',
    text: 'text-indigo-800',
  },
  posture: {
    id: 'posture',
    name: 'Postural Awareness',
    meaning:
      'Felt sense of vertical alignment. Lower-back and neck protection in daily movement.',
    emoji: '🏛️',
    bg: 'bg-stone-100',
    text: 'text-stone-800',
  },
  embodiment: {
    id: 'embodiment',
    name: 'Embodiment',
    meaning:
      'The simple act of being in your body. Foundation for nervous-system regulation and everything else.',
    emoji: '🤲',
    bg: 'bg-fuchsia-100',
    text: 'text-fuchsia-800',
  },
}

export function skillsForPose(poseId: string): Partial<Record<SkillId, number>> {
  const pose = catalog.find((p) => p.id === poseId)
  const name = (pose?.name ?? poseId).toLowerCase()
  const skills: Partial<Record<SkillId, number>> = { embodiment: 1 }

  if (
    /pigeon|lizard|frog|butterfly|bound.angle|garland|deep squat|lotus|crossed.leg|goddess|happy baby|ankle.to.knee|figure.4/i.test(
      name,
    )
  ) {
    skills['hip-mobility'] = 2
  }
  if (
    /forward fold|seated forward|splits|pyramid|head.to.knee|wide.leg|standing splits|half splits|heron|ragdoll/i.test(
      name,
    )
  ) {
    skills.hamstring = 2
  }
  if (
    /twist|cat|cow|cobra|sphinx|bridge|wheel|camel|bow|fish|spinal|side bend|banana|marichi/i.test(
      name,
    )
  ) {
    skills.spine = 2
  }
  if (
    /eagle|thread the needle|cow.face|dolphin|downward|plank|chaturanga|shoulder/i.test(
      name,
    )
  ) {
    skills.shoulder = 1
  }
  if (
    /^tree|warrior iii|warrior 3|half moon|dancer|standing splits|crow|firefly|eight.angle|handstand|headstand|forearm stand|side plank/i.test(
      name,
    )
  ) {
    skills.balance = 2
  }
  if (
    /plank|boat|crow|firefly|eight.angle|bird dog|chaturanga/i.test(name)
  ) {
    skills.core = 2
  }
  if (
    /corpse|child|legs up|reclining|reclined|easy seated|easy seat|constructive rest|butterfly|sphinx/i.test(
      name,
    )
  ) {
    skills['vagal-tone'] = 2
  }
  if (/corpse|child|legs up|reclining|reclined/i.test(name)) {
    skills.recovery = 2
  }
  if (
    /mountain|warrior i\b|warrior 1|staff|chair|upward salute/i.test(name)
  ) {
    skills.posture = 1
  }
  return skills
}

export function calculateSessionSkills(
  poseIds: string[],
): Partial<Record<SkillId, number>> {
  const totals: Partial<Record<SkillId, number>> = {}
  for (const poseId of poseIds) {
    const s = skillsForPose(poseId)
    for (const [skillId, pts] of Object.entries(s)) {
      const id = skillId as SkillId
      totals[id] = (totals[id] ?? 0) + (pts ?? 0)
    }
  }
  return totals
}

const SKILLS_KEY = 'yoga:skill-points'

export function loadSkillPoints(): Partial<Record<SkillId, number>> {
  const raw = storage.get(SKILLS_KEY)
  if (!raw) return {}
  try {
    return JSON.parse(raw) as Partial<Record<SkillId, number>>
  } catch {
    return {}
  }
}

export function addSkillPoints(
  earned: Partial<Record<SkillId, number>>,
): Partial<Record<SkillId, number>> {
  const current = loadSkillPoints()
  const next: Partial<Record<SkillId, number>> = { ...current }
  for (const [id, pts] of Object.entries(earned)) {
    const key = id as SkillId
    next[key] = (next[key] ?? 0) + (pts ?? 0)
  }
  storage.set(SKILLS_KEY, JSON.stringify(next))
  return next
}

export function totalSkillPoints(
  pts: Partial<Record<SkillId, number>> = loadSkillPoints(),
): number {
  return Object.values(pts).reduce((a, b) => a + (b ?? 0), 0)
}

export function topSkills(
  pts: Partial<Record<SkillId, number>> = loadSkillPoints(),
  n = 4,
): Array<{ skill: SkillMeta; points: number }> {
  const entries = (Object.entries(pts) as [SkillId, number][])
    .filter(([, p]) => p > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
  return entries.map(([id, points]) => ({ skill: SKILLS[id], points }))
}
