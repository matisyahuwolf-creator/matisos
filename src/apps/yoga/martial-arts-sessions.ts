import type { Session } from './sessions'

export const martialArtsSessions: Session[] = [
  {
    id: 'ma-basics',
    name: 'Kung Fu Basics',
    focus: 'Stances & Strikes',
    difficulty: 'Beginner',
    durationMin: 10,
    icon: '🥋',
    gradient: 'from-red-600 via-orange-600 to-amber-600',
    description:
      'Foundation: drop into the basic stances and drill the core strikes. Slow first, then with intent.',
    modality: 'martial-arts',
    steps: [
      { poseId: 'ma-horse-stance', durationSec: 60, cue: 'Sink. Thighs working. Back tall.' },
      { poseId: 'ma-bow-stance', durationSec: 60, perSide: true, cue: 'Front knee over ankle. Back leg straight, foot rooted.' },
      { poseId: 'ma-straight-punch', durationSec: 60, perSide: true, cue: 'From the hip. Rotate, extend, retract.' },
      { poseId: 'ma-back-fist', durationSec: 60, perSide: true, cue: 'Loose, then snap. Don\'t muscle it.' },
      { poseId: 'ma-palm-strike', durationSec: 60, perSide: true },
      { poseId: 'ma-low-block', durationSec: 45, perSide: true },
      { poseId: 'ma-high-block', durationSec: 45, perSide: true },
      { poseId: 'ma-footwork-shuffle', durationSec: 60, cue: 'Light. Stay over your base.' },
    ],
  },
  {
    id: 'ma-kicks',
    name: 'Kicks & Combos',
    focus: 'Kicks & Combos',
    difficulty: 'Intermediate',
    durationMin: 12,
    icon: '🦶',
    gradient: 'from-orange-700 via-red-700 to-rose-800',
    description:
      'Front kick, side kick, roundhouse. Then chain them. Standing leg must root before the kicking leg fires.',
    modality: 'martial-arts',
    steps: [
      { poseId: 'ma-horse-stance', durationSec: 45 },
      { poseId: 'ma-front-kick', durationSec: 60, perSide: true, cue: 'Knee up first, then extend the foot.' },
      { poseId: 'ma-side-kick', durationSec: 60, perSide: true, cue: 'Chamber, then push the heel out.' },
      { poseId: 'ma-roundhouse', durationSec: 60, perSide: true, cue: 'Pivot the standing foot. Hip turns over.' },
      { poseId: 'ma-crescent-kick', durationSec: 45, perSide: true },
      { poseId: 'ma-shadow-flow', durationSec: 180, cue: 'Free combo. Strike, step, kick, breathe.' },
      { poseId: 'ma-empty-stance', durationSec: 30, perSide: true, cue: 'Cool-down — find the single-leg root.' },
    ],
  },
  {
    id: 'ma-shadow',
    name: 'Shadow Round',
    focus: 'Shadow Flow',
    difficulty: 'Intermediate',
    durationMin: 6,
    icon: '👤',
    gradient: 'from-stone-700 via-red-800 to-orange-900',
    description:
      'A short, sweaty free-form round. Move continuously between stances, strikes, kicks, and footwork.',
    modality: 'martial-arts',
    steps: [
      { poseId: 'ma-footwork-shuffle', durationSec: 30 },
      { poseId: 'ma-shadow-flow', durationSec: 240, cue: 'Four minutes of free flow. Breathe.' },
      { poseId: 'ma-horse-stance', durationSec: 60, cue: 'Drop back into the root. Slow the breath.' },
    ],
  },
]
