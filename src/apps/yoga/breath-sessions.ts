import type { Session } from './sessions'

export const breathSessions: Session[] = [
  {
    id: 'breath-box-reset',
    name: 'Box Reset',
    focus: 'Box Breath',
    difficulty: 'Beginner',
    durationMin: 5,
    icon: '🟦',
    gradient: 'from-sky-400 via-blue-500 to-indigo-600',
    description:
      'Five minutes of 4-4-4-4 box breathing. Resets the autonomic nervous system; good before sleep or before focused work.',
    modality: 'breath',
    steps: [
      { poseId: 'breath-long-exhale', durationSec: 60, cue: 'Settle in. A few slow exhales before we start.' },
      { poseId: 'breath-box', durationSec: 240, cue: 'Inhale 4, hold 4, exhale 4, hold 4. Repeat.' },
    ],
  },
  {
    id: 'breath-wim-hof',
    name: 'Wim Hof Round',
    focus: 'Wim Hof',
    difficulty: 'Intermediate',
    durationMin: 10,
    icon: '❄️',
    gradient: 'from-cyan-500 via-blue-600 to-indigo-700',
    description:
      'Three rounds of Wim Hof breathing — power breaths, full exhale retention, then recovery hold. Strong stimulant; do not do near sleep.',
    modality: 'breath',
    steps: [
      { poseId: 'breath-long-exhale', durationSec: 60, cue: 'Get comfortable. Sitting or lying on your back.' },
      { poseId: 'breath-wim-hof', durationSec: 180, cue: 'Round 1: 30 power breaths, then exhale and hold. Inhale and hold 15s.' },
      { poseId: 'breath-wim-hof', durationSec: 180, cue: 'Round 2: 35 power breaths.' },
      { poseId: 'breath-wim-hof', durationSec: 180, cue: 'Round 3: 40 power breaths. Stay with the holds.' },
      { poseId: 'breath-long-exhale', durationSec: 60, cue: 'Integrate. Breath natural now.' },
    ],
  },
  {
    id: 'breath-vagal',
    name: 'Long Exhale Calm',
    focus: 'Vagal Calm',
    difficulty: 'Beginner',
    durationMin: 5,
    icon: '🌊',
    gradient: 'from-teal-400 via-sky-500 to-blue-600',
    description:
      'Pure parasympathetic downshift. Best before sleep, or after stress. Exhale at least twice as long as the inhale.',
    modality: 'breath',
    steps: [
      { poseId: 'breath-long-exhale', durationSec: 120, cue: 'Inhale 4, exhale 8. Through the nose if you can.' },
      { poseId: 'breath-bhramari', durationSec: 90, cue: 'Hum on the exhale. Soft, low pitch.' },
      { poseId: 'breath-coherent', durationSec: 90, cue: 'Settle into 5-in, 5-out. Six breaths per minute.' },
    ],
  },
]
