import type { Session } from './sessions'

export const meditationSessions: Session[] = [
  {
    id: 'med-body-scan',
    name: 'Body Scan',
    focus: 'Body Scan',
    difficulty: 'Beginner',
    durationMin: 10,
    icon: '🫧',
    gradient: 'from-violet-500 via-purple-600 to-indigo-700',
    description:
      'Slow attention from head to feet. Notice sensation without trying to change it. Foundational interoception practice.',
    modality: 'meditation',
    steps: [
      { poseId: 'breath-long-exhale', durationSec: 60, cue: 'Settle. A few slow breaths to arrive.' },
      { poseId: 'med-body-scan', durationSec: 540, cue: 'Move attention down the body. Pause where it wants to pause.' },
    ],
  },
  {
    id: 'med-metta',
    name: 'Loving-Kindness',
    focus: 'Metta',
    difficulty: 'Beginner',
    durationMin: 10,
    icon: '💗',
    gradient: 'from-rose-400 via-pink-500 to-fuchsia-600',
    description:
      'Phrases of well-wishing — for yourself, a loved one, a neutral person, a difficult person, all beings.',
    modality: 'meditation',
    steps: [
      { poseId: 'breath-long-exhale', durationSec: 60 },
      { poseId: 'med-metta', durationSec: 120, cue: 'For yourself. "May I be safe. May I be well. May I be at ease."' },
      { poseId: 'med-metta', durationSec: 120, cue: 'For someone you love. Same phrases.' },
      { poseId: 'med-metta', durationSec: 120, cue: 'For someone neutral — a stranger you saw today.' },
      { poseId: 'med-metta', durationSec: 120, cue: 'For someone difficult. Start small.' },
      { poseId: 'med-metta', durationSec: 120, cue: 'For all beings. Everywhere.' },
    ],
  },
  {
    id: 'med-silent',
    name: 'Silent Sit',
    focus: 'Silent Sit',
    difficulty: 'Intermediate',
    durationMin: 15,
    icon: '☯️',
    gradient: 'from-stone-600 via-slate-700 to-zinc-900',
    description:
      'No technique. No anchor. Just sit. Whatever happens is the meditation.',
    modality: 'meditation',
    steps: [
      { poseId: 'breath-long-exhale', durationSec: 60, cue: 'Arrive. A few breaths.' },
      { poseId: 'med-silent-sit', durationSec: 840, cue: 'Fourteen minutes. Just sit.' },
    ],
  },
]
