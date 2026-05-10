import type { ComponentType } from 'react'
import Scratch from './apps/scratch/Scratch'
import Yoga from './apps/yoga/Yoga'

type BaseEntry = {
  name: string
  tagline: string
  description: string
  icon: string
  status: 'live' | 'wip'
  gradient: string
}

export type AppEntry =
  | (BaseEntry & { kind: 'internal'; slug: string; component: ComponentType })
  | (BaseEntry & { kind: 'external'; url: string })

export const apps: AppEntry[] = [
  {
    kind: 'internal',
    slug: 'yoga',
    name: 'Yoga',
    tagline: 'Practice & Mastery',
    description:
      'Track the poses you’re learning, the ones you’ve mastered, and the notes you need to remember next time on the mat.',
    icon: '🧘',
    status: 'live',
    gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
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
  },
  {
    kind: 'internal',
    slug: 'coming-soon',
    name: 'Coming soon',
    tagline: 'Future',
    description: 'Your next app lands here. Add a folder under src/apps/.',
    icon: '✨',
    status: 'wip',
    gradient: 'from-pink-400 to-fuchsia-500',
    component: () => null,
  },
]
