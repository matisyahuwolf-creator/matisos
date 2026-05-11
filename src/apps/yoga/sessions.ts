import type { Difficulty } from './catalog'

export type SessionFocus =
  | 'Grounding'
  | 'Stress Release'
  | 'Anxiety Reset'
  | 'Pre-Sleep'
  | 'Hip Release'
  | 'Heart Opening'
  | 'Lower Back Relief'
  | 'Tech Neck Reset'
  | 'Morning Activation'
  | 'Post-Workout Recovery'

export type SessionStep = {
  poseId: string
  durationSec: number
  cue?: string
  rationale?: string
  perSide?: boolean
}

export type Session = {
  id: string
  name: string
  focus: SessionFocus
  difficulty: Difficulty
  durationMin: number
  icon: string
  gradient: string
  description: string
  steps: SessionStep[]
}

export const sessions: Session[] = [
  {
    id: 'grounding',
    name: 'Grounding',
    focus: 'Grounding',
    difficulty: 'Beginner',
    durationMin: 15,
    icon: '🌳',
    gradient: 'from-emerald-500 to-teal-700',
    description:
      'A slow, predictable sequence to return to the body. You can exit any position at any time — that choice is part of the practice.',
    steps: [
      { poseId: 'mountain', durationSec: 60, cue: 'Stand with weight evenly through both feet. Notice the contact with the ground.' },
      { poseId: 'cow', durationSec: 60, cue: 'Slow cycle with the breath; eyes can be soft or closed.' },
      { poseId: 'cat', durationSec: 60 },
      { poseId: 'standing-forward-fold', durationSec: 60, cue: 'Soft knees. Let the head be heavy.' },
      { poseId: 'child', durationSec: 120, cue: 'Stay as long as feels useful. Arms forward or by your sides.' },
      { poseId: 'reclining-bound-angle', durationSec: 180, cue: 'Optional: a folded blanket or pillow under the knees.' },
      { poseId: 'legs-up-wall', durationSec: 300, cue: 'Gentle reset for the nervous system.' },
      { poseId: 'corpse', durationSec: 180, cue: 'Final integration. Notice the body where it is.' },
    ],
  },
  {
    id: 'stress-release',
    name: 'Stress Down-regulation',
    focus: 'Stress Release',
    difficulty: 'Beginner',
    durationMin: 20,
    icon: '🌊',
    gradient: 'from-sky-500 to-blue-700',
    description:
      'Gentle chest-opening and supported postures that engage the vagus nerve and shift you out of sympathetic overdrive.',
    steps: [
      { poseId: 'easy', durationSec: 180, cue: 'Sit comfortably. Long, slow exhales — longer than the inhales.' },
      { poseId: 'cow', durationSec: 60 },
      { poseId: 'cat', durationSec: 60 },
      { poseId: 'cobra', durationSec: 60, cue: 'Low, gentle. Lift only as far as feels comfortable.' },
      { poseId: 'bridge', durationSec: 120, cue: 'Hold or come up and down a few times with the breath.' },
      { poseId: 'supine-twist', durationSec: 90, perSide: true },
      { poseId: 'fish', durationSec: 60, cue: 'Optional: support the upper back with a folded blanket.' },
      { poseId: 'legs-up-wall', durationSec: 300 },
      { poseId: 'reclining-bound-angle', durationSec: 180 },
      { poseId: 'corpse', durationSec: 180 },
    ],
  },
  {
    id: 'anxiety-reset',
    name: 'Anxiety Reset',
    focus: 'Anxiety Reset',
    difficulty: 'Beginner',
    durationMin: 10,
    icon: '🫧',
    gradient: 'from-cyan-400 to-indigo-600',
    description:
      'A quick sequence for moments of overwhelm. The point is contact with the body — not perfect form.',
    steps: [
      { poseId: 'easy', durationSec: 120, cue: 'Box breath: 4 in, 4 hold, 4 out, 4 hold. Three rounds.' },
      { poseId: 'cow', durationSec: 30 },
      { poseId: 'cat', durationSec: 30 },
      { poseId: 'standing-forward-fold', durationSec: 60 },
      { poseId: 'child', durationSec: 120 },
      { poseId: 'supine-twist', durationSec: 60, perSide: true },
      { poseId: 'legs-up-wall', durationSec: 180 },
    ],
  },
  {
    id: 'pre-sleep',
    name: 'Pre-Sleep Wind-Down',
    focus: 'Pre-Sleep',
    difficulty: 'Beginner',
    durationMin: 20,
    icon: '🌙',
    gradient: 'from-indigo-500 to-purple-800',
    description:
      'Floor-based, low-arousal sequence to transition the body toward rest. Do this on your bed if that feels right.',
    steps: [
      { poseId: 'child', durationSec: 180 },
      { poseId: 'reclining-bound-angle', durationSec: 180 },
      { poseId: 'supine-twist', durationSec: 60, perSide: true },
      { poseId: 'happy-baby', durationSec: 60 },
      { poseId: 'legs-up-wall', durationSec: 300 },
      { poseId: 'reclining-bound-angle', durationSec: 180 },
      { poseId: 'corpse', durationSec: 240 },
    ],
  },
  {
    id: 'hip-release',
    name: 'Hip Release',
    focus: 'Hip Release',
    difficulty: 'Intermediate',
    durationMin: 25,
    icon: '🫶',
    gradient: 'from-rose-500 to-pink-700',
    description:
      'Hips often hold tension from prolonged sitting and chronic activation. This sequence works the area systematically. Emotional release can happen here — pause whenever you need to.',
    steps: [
      { poseId: 'easy', durationSec: 120 },
      { poseId: 'cow', durationSec: 60 },
      { poseId: 'cat', durationSec: 60 },
      { poseId: 'downward-dog', durationSec: 60 },
      { poseId: 'low-lunge', durationSec: 90, perSide: true },
      { poseId: 'pigeon', durationSec: 180, perSide: true, cue: 'Stay slow into it. Out at any point.' },
      { poseId: 'garland', durationSec: 60 },
      { poseId: 'bound-angle', durationSec: 120 },
      { poseId: 'wide-angle-fold', durationSec: 120 },
      { poseId: 'reclining-bound-angle', durationSec: 180 },
      { poseId: 'corpse', durationSec: 180 },
    ],
  },
  {
    id: 'lower-back',
    name: 'Lower Back Relief',
    focus: 'Lower Back Relief',
    difficulty: 'Beginner',
    durationMin: 15,
    icon: '🦴',
    gradient: 'from-cyan-500 to-teal-700',
    description:
      'Targeted release for the lumbar spine and the muscles around it. Slow holds; the goal is to decompress, not to stretch hard.',
    steps: [
      { poseId: 'child', durationSec: 120, cue: 'Settle in. Knees can be wide if that feels better.' },
      { poseId: 'cow', durationSec: 45 },
      { poseId: 'cat', durationSec: 45 },
      { poseId: 'sphinx', durationSec: 90 },
      { poseId: 'bridge', durationSec: 90, cue: 'Multiple lifts with the breath, or one long hold — your call.' },
      { poseId: 'supine-twist', durationSec: 60, perSide: true },
      { poseId: 'happy-baby', durationSec: 60 },
      { poseId: 'reclining-bound-angle', durationSec: 120 },
      { poseId: 'legs-up-wall', durationSec: 180 },
      { poseId: 'corpse', durationSec: 90 },
    ],
  },
  {
    id: 'tech-neck',
    name: 'Tech Neck Reset',
    focus: 'Tech Neck Reset',
    difficulty: 'Beginner',
    durationMin: 10,
    icon: '💻',
    gradient: 'from-slate-500 to-blue-700',
    description:
      'For shoulders rounded by screens and a head jutted forward. Opens the chest and mobilizes the upper back.',
    steps: [
      { poseId: 'easy', durationSec: 60, cue: 'Slow neck rolls — half circles, ear toward shoulder, then the other.' },
      { poseId: 'thread-needle', durationSec: 60, perSide: true },
      { poseId: 'cow', durationSec: 30 },
      { poseId: 'cat', durationSec: 30 },
      { poseId: 'sphinx', durationSec: 60 },
      { poseId: 'cobra', durationSec: 45 },
      { poseId: 'child', durationSec: 90, cue: 'Arms forward. Forehead heavy.' },
      { poseId: 'supine-twist', durationSec: 60, perSide: true },
      { poseId: 'corpse', durationSec: 60 },
    ],
  },
  {
    id: 'morning',
    name: 'Morning Activation',
    focus: 'Morning Activation',
    difficulty: 'Beginner',
    durationMin: 10,
    icon: '☀️',
    gradient: 'from-amber-400 to-orange-600',
    description:
      'Gentle activation to wake the body without shocking the nervous system. Good first thing before coffee.',
    steps: [
      { poseId: 'easy', durationSec: 60, cue: 'A few long breaths to settle. No rush.' },
      { poseId: 'cow', durationSec: 30 },
      { poseId: 'cat', durationSec: 30 },
      { poseId: 'cobra', durationSec: 45 },
      { poseId: 'downward-dog', durationSec: 60 },
      { poseId: 'standing-forward-fold', durationSec: 45 },
      { poseId: 'high-lunge', durationSec: 45, perSide: true },
      { poseId: 'bridge', durationSec: 60 },
      { poseId: 'tree', durationSec: 45, perSide: true },
      { poseId: 'mountain', durationSec: 60, cue: 'Done. Feel the body awake.' },
    ],
  },
  {
    id: 'post-workout',
    name: 'Post-Workout Cool-Down',
    focus: 'Post-Workout Recovery',
    difficulty: 'Beginner',
    durationMin: 15,
    icon: '💪',
    gradient: 'from-lime-500 to-green-700',
    description:
      'Flexibility-focused recovery after strength or cardio. Stretches the major lower-body muscle groups while heart rate comes down.',
    steps: [
      { poseId: 'child', durationSec: 90 },
      { poseId: 'cow', durationSec: 30 },
      { poseId: 'cat', durationSec: 30 },
      { poseId: 'downward-dog', durationSec: 60 },
      { poseId: 'low-lunge', durationSec: 75, perSide: true },
      { poseId: 'half-forward-fold', durationSec: 45 },
      { poseId: 'standing-forward-fold', durationSec: 60 },
      { poseId: 'seated-forward-fold', durationSec: 90 },
      { poseId: 'bound-angle', durationSec: 90 },
      { poseId: 'supine-twist', durationSec: 60, perSide: true },
      { poseId: 'legs-up-wall', durationSec: 120 },
      { poseId: 'corpse', durationSec: 90 },
    ],
  },
  {
    id: 'heart-opening',
    name: 'Heart Opening',
    focus: 'Heart Opening',
    difficulty: 'Intermediate',
    durationMin: 20,
    icon: '🌅',
    gradient: 'from-orange-400 to-rose-600',
    description:
      'Chest and upper-back work to counter the closed posture of stress and screen time. Bookended with grounding so you don\'t leave the body raw.',
    steps: [
      { poseId: 'child', durationSec: 120, cue: 'Start grounded.' },
      { poseId: 'cow', durationSec: 60 },
      { poseId: 'cat', durationSec: 60 },
      { poseId: 'cobra', durationSec: 60 },
      { poseId: 'sphinx', durationSec: 120 },
      { poseId: 'bridge', durationSec: 90, cue: 'Repeat 2–3 times with the breath, or hold.' },
      { poseId: 'camel', durationSec: 60, cue: 'Optional. Hands on the lower back if reaching the heels feels too much.' },
      { poseId: 'reclining-bound-angle', durationSec: 180 },
      { poseId: 'supine-twist', durationSec: 60, perSide: true },
      { poseId: 'corpse', durationSec: 180, cue: 'Return to ground.' },
    ],
  },
]
