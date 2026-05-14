import type { ComponentType } from 'react'
import Cadence from './apps/cadence/Cadence'
import Hyrogliphics from './apps/hyrogliphics/Hyrogliphics'
import Initiation from './apps/initiation/Initiation'
import Pardes from './apps/pardes/Pardes'
import Scratch from './apps/scratch/Scratch'
import Susquehanna from './apps/susquehanna/Susquehanna'
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
    name: 'Matis Fitness',
    tagline: 'Six modalities. One daily flow.',
    description:
      'Yoga, dance, martial arts, strength, breath, meditation — chained into a single daily practice. Bodyweight only; built for one body in particular.',
    icon: '🔥',
    status: 'live',
    gradient: 'from-orange-500 via-rose-500 to-violet-600',
    category: 'Wellness',
    component: Yoga,
  },
  {
    kind: 'internal',
    slug: 'initiation',
    name: 'Initiation',
    tagline: 'Open research, in common.',
    description:
      'A free commons for research into AI safety, consciousness, and the meeting of East and West. Free, open-source, unowned.',
    icon: '○',
    status: 'live',
    gradient: 'from-stone-200 via-stone-300 to-stone-500',
    category: 'Tools',
    component: Initiation,
  },
  {
    kind: 'internal',
    slug: 'hyrogliphics',
    name: 'Hyrogliphics',
    tagline: 'Decode the language of intelligence.',
    description:
      'A landing page for an AI school. Ancient-meets-future — three paths (Initiate, Practitioner, Adept) taught from the same alphabet.',
    icon: '𓋹',
    status: 'live',
    gradient: 'from-amber-700 via-yellow-800 to-stone-900',
    category: 'Tools',
    component: Hyrogliphics,
  },
  {
    kind: 'internal',
    slug: 'cadence',
    name: 'Cadence',
    tagline: 'An AI shape for your day.',
    description:
      'A personal day-planner that picks how to render the answer — a full plan, an energy read, a priority cut, or a story.',
    icon: '◑',
    status: 'live',
    gradient: 'from-indigo-600 via-violet-500 to-cyan-500',
    category: 'Tools',
    component: Cadence,
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
    kind: 'internal',
    slug: 'susquehanna',
    name: 'Susquehanna',
    tagline: 'AI for NEPA small business.',
    description:
      'A landing page for an AI integrations company in Northeastern PA — starting with restaurants. Modern websites + customer-service chatbots, then expanding to dental, auto, and salons.',
    icon: '🌊',
    status: 'live',
    gradient: 'from-cyan-700 via-emerald-700 to-stone-700',
    category: 'Tools',
    component: Susquehanna,
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
