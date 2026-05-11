import type { ComponentType } from 'react'
import Pardes from './apps/pardes/Pardes'
import Scratch from './apps/scratch/Scratch'
import Yoga from './apps/yoga/Yoga'

type BaseEntry = {
  name: string
  tagline: string
  description: string
  icon: string
  status: 'live' | 'wip'
  gradient: string
  category: 'Wellness' | 'Tools' | 'Meta'
}

export type AppEntry =
  | (BaseEntry & { kind: 'internal'; slug: string; component: ComponentType })
  | (BaseEntry & { kind: 'external'; url: string })

export const apps: AppEntry[] = [
  {
    kind: 'internal',
    slug: 'pardes',
    name: 'Pardes',
    tagline: 'Mystical Meditation',
    description:
      'A psychedelic journey through the ten Sefirot. Hebrew letters, color, and breath drawn from Kabbalistic tradition.',
    icon: '🌌',
    status: 'live',
    gradient: 'from-violet-600 via-fuchsia-600 to-orange-500',
    category: 'Wellness',
    component: Pardes,
  },
  {
    kind: 'internal',
    slug: 'yoga',
    name: 'Yoga',
    tagline: 'Stress Release & Recovery',
    description:
      'Guided sessions and a curated pose library focused on stress release, trauma-informed practice, and physical recovery.',
    icon: '🧘',
    status: 'live',
    gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
    category: 'Wellness',
    component: Yoga,
  },
  {
    kind: 'internal',
    slug: 'scratch',
    name: 'Scratch',
    tagline: 'Notepad',
    description:
      'A quick scratchpad. Anything you type is saved automatically in your browser.',
    icon: '📝',
    status: 'live',
    gradient: 'from-amber-400 to-orange-500',
    category: 'Tools',
    component: Scratch,
  },
  {
    kind: 'external',
    url: 'https://github.com/matisyahuwolf-creator/matisos',
    name: 'Source',
    tagline: 'Open Source',
    description: 'The code behind matisOS, on GitHub.',
    icon: '📦',
    status: 'live',
    gradient: 'from-slate-700 to-slate-900',
    category: 'Meta',
  },
]
