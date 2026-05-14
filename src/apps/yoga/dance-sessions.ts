import type { Session } from './sessions'

export const danceSessions: Session[] = [
  {
    id: 'dance-wake-up',
    name: 'Wake-Up Dance',
    focus: 'Dance Warmup',
    difficulty: 'Beginner',
    durationMin: 8,
    icon: '💃',
    gradient: 'from-fuchsia-500 via-pink-500 to-rose-500',
    description:
      'A short, low-stakes dance warmup. Loosen, find rhythm, smile. No choreography — just move.',
    modality: 'dance',
    steps: [
      { poseId: 'dance-shake-loose', durationSec: 60, cue: 'Shake everything. Arms, legs, hips, face. No form.' },
      { poseId: 'dance-bounce', durationSec: 60, cue: 'Soft knees. Find a tempo.' },
      { poseId: 'dance-two-step', durationSec: 90, cue: 'Side to side. Stay in your hips.' },
      { poseId: 'dance-groove-walk', durationSec: 60, cue: 'Walk like the song is yours.' },
      { poseId: 'dance-body-roll', durationSec: 60 },
      { poseId: 'dance-ecstatic-flow', durationSec: 120, cue: 'No rules. Whatever wants to move.' },
      { poseId: 'dance-cool-sway', durationSec: 60, cue: 'Slow it down. Long exhales.' },
    ],
  },
  {
    id: 'dance-ecstatic',
    name: 'Ecstatic Flow',
    focus: 'Ecstatic Flow',
    difficulty: 'Beginner',
    durationMin: 15,
    icon: '🌀',
    gradient: 'from-purple-500 via-fuchsia-500 to-orange-500',
    description:
      'A longer free-form dance. The job is to follow the body. Eyes closed if it helps. No one is watching.',
    modality: 'dance',
    steps: [
      { poseId: 'dance-shake-loose', durationSec: 90 },
      { poseId: 'dance-bounce', durationSec: 60 },
      { poseId: 'dance-body-roll', durationSec: 60 },
      { poseId: 'dance-ecstatic-flow', durationSec: 360, cue: 'Six minutes. Drop all form. Move where the body pulls.' },
      { poseId: 'dance-spin', durationSec: 60, perSide: true },
      { poseId: 'dance-freeze', durationSec: 30 },
      { poseId: 'dance-cool-sway', durationSec: 120, cue: 'Bring it down. Notice what changed.' },
    ],
  },
  {
    id: 'dance-cool',
    name: 'Cool Groove',
    focus: 'Dance Cooldown',
    difficulty: 'Beginner',
    durationMin: 5,
    icon: '🎶',
    gradient: 'from-rose-400 via-pink-400 to-fuchsia-500',
    description:
      'A short cool-down after harder work — yoga, strength, or longer dance. Soft, slow, melodic.',
    modality: 'dance',
    steps: [
      { poseId: 'dance-cool-sway', durationSec: 120 },
      { poseId: 'dance-body-roll', durationSec: 60 },
      { poseId: 'dance-shake-loose', durationSec: 60, cue: 'One last gentle shake.' },
      { poseId: 'dance-freeze', durationSec: 60, cue: 'End in a shape you like.' },
    ],
  },
]
