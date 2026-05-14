// Matis Fitness modalities — the six daily-flow slots.
// Order matters: it is the canonical daily full-flow sequence
// (warmup → expression → combat → strength → breath → close).

export type Modality =
  | 'yoga'
  | 'dance'
  | 'martial-arts'
  | 'strength'
  | 'breath'
  | 'meditation'

export type ModalityMeta = {
  id: Modality
  name: string
  tagline: string
  icon: string
  gradient: string
  // Singular/plural noun for the unit shown in Library
  unitSingular: string
  unitPlural: string
}

export const MODALITIES: Record<Modality, ModalityMeta> = {
  yoga: {
    id: 'yoga',
    name: 'Yoga',
    tagline: 'Warm up. Open. Show up.',
    icon: '🧘',
    gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
    unitSingular: 'pose',
    unitPlural: 'poses',
  },
  dance: {
    id: 'dance',
    name: 'Dance',
    tagline: 'Move the body the body wants to move.',
    icon: '💃',
    gradient: 'from-fuchsia-500 via-pink-500 to-rose-500',
    unitSingular: 'move',
    unitPlural: 'moves',
  },
  'martial-arts': {
    id: 'martial-arts',
    name: 'Martial Arts',
    tagline: 'Kung fu. Power, focus, root.',
    icon: '🥋',
    gradient: 'from-red-600 via-orange-600 to-amber-600',
    unitSingular: 'technique',
    unitPlural: 'techniques',
  },
  strength: {
    id: 'strength',
    name: 'Strength',
    tagline: 'Bodyweight. Six-pack. Pecs.',
    icon: '💪',
    gradient: 'from-stone-700 via-zinc-800 to-slate-900',
    unitSingular: 'exercise',
    unitPlural: 'exercises',
  },
  breath: {
    id: 'breath',
    name: 'Breath',
    tagline: 'Real breathwork. Real changes.',
    icon: '🌬️',
    gradient: 'from-sky-400 via-blue-500 to-indigo-600',
    unitSingular: 'practice',
    unitPlural: 'practices',
  },
  meditation: {
    id: 'meditation',
    name: 'Meditation',
    tagline: 'Close. Integrate. Sit.',
    icon: '☯️',
    gradient: 'from-violet-600 via-purple-700 to-indigo-800',
    unitSingular: 'meditation',
    unitPlural: 'meditations',
  },
}

export const MODALITY_ORDER: Modality[] = [
  'yoga',
  'dance',
  'martial-arts',
  'strength',
  'breath',
  'meditation',
]

export const MODALITY_LIST: ModalityMeta[] = MODALITY_ORDER.map(
  (id) => MODALITIES[id],
)
