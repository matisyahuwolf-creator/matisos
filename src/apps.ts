export type AppEntry = {
  name: string
  description: string
  url: string
  icon: string
  status: 'live' | 'wip'
}

export const apps: AppEntry[] = [
  {
    name: 'matisOS',
    description: 'This launcher — a personal home for everything I build.',
    url: 'https://matisos.vercel.app',
    icon: '🪐',
    status: 'live',
  },
  {
    name: 'Source',
    description: 'The code behind matisOS, on GitHub.',
    url: 'https://github.com/matisyahuwolf-creator/matisos',
    icon: '📦',
    status: 'live',
  },
  {
    name: 'Coming soon',
    description: 'Your next app lands here. Edit src/apps.ts to add it.',
    url: '#',
    icon: '✨',
    status: 'wip',
  },
]
