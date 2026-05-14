// Strength exercises — bodyweight only, at-home, no equipment.
// Bias toward visible six-pack and pec development:
// abs (rectus/obliques/transverse) + push (chest/shoulders/triceps).

import type { CatalogEntry } from './catalog-types'

export const strengthCatalog: CatalogEntry[] = [
  // ─── Push / chest / shoulders ───────────────────────────────────────────
  {
    id: 'str-pushup',
    name: 'Push-Up',
    difficulty: 'Beginner',
    benefits:
      'Standard push-up. Builds chest, front delts, and triceps; the foundational push movement.',
    modality: 'strength',
  },
  {
    id: 'str-wide-pushup',
    name: 'Wide Push-Up',
    difficulty: 'Beginner',
    benefits:
      'Hands wider than shoulders. Biases load to the pecs over triceps; better pec hypertrophy stimulus.',
    modality: 'strength',
  },
  {
    id: 'str-diamond-pushup',
    name: 'Diamond Push-Up',
    difficulty: 'Intermediate',
    benefits:
      'Hands close, index fingers touching. Shifts load to triceps and inner chest.',
    modality: 'strength',
  },
  {
    id: 'str-decline-pushup',
    name: 'Decline Push-Up',
    difficulty: 'Intermediate',
    benefits:
      'Feet elevated on chair/bed. Biases load to the upper chest and front delts; key for the "upper pec" shelf.',
    modality: 'strength',
  },
  {
    id: 'str-pike-pushup',
    name: 'Pike Push-Up',
    difficulty: 'Intermediate',
    benefits:
      'Hips piked high, head drives toward the floor. The closest bodyweight analog to an overhead shoulder press.',
    modality: 'strength',
  },
  {
    id: 'str-archer-pushup',
    name: 'Archer Push-Up',
    difficulty: 'Advanced',
    benefits:
      'Bend one elbow while keeping the other arm straight. Asymmetric load; bridges toward the one-arm push-up.',
    modality: 'strength',
  },

  // ─── Core — rectus / dynamic ────────────────────────────────────────────
  {
    id: 'str-plank',
    name: 'Plank Hold',
    difficulty: 'Beginner',
    benefits:
      'Isometric full-body brace from forearms or hands. Trains anti-extension core stiffness; foundation for everything.',
    modality: 'strength',
  },
  {
    id: 'str-leg-raise',
    name: 'Lying Leg Raise',
    difficulty: 'Beginner',
    benefits:
      'Legs straight, lift to vertical and lower with control. Strong lower-rectus stimulus — the visible lower-abs region.',
    modality: 'strength',
  },
  {
    id: 'str-bicycle',
    name: 'Bicycle Crunch',
    difficulty: 'Beginner',
    benefits:
      'Cross-body elbow to opposite knee. Activates rectus + obliques simultaneously; high mechanical density.',
    modality: 'strength',
  },
  {
    id: 'str-hollow-hold',
    name: 'Hollow Body Hold',
    difficulty: 'Intermediate',
    benefits:
      'Lower back pressed flat, arms and legs hovering. Gymnastic-style core stiffness; transfers to every other lift.',
    modality: 'strength',
  },
  {
    id: 'str-v-up',
    name: 'V-Up',
    difficulty: 'Intermediate',
    benefits:
      'Simultaneous leg lift and torso crunch into a V. High-amplitude rectus contraction; major six-pack driver.',
    modality: 'strength',
  },
  {
    id: 'str-toe-touch',
    name: 'Toe Touch Crunch',
    difficulty: 'Beginner',
    benefits:
      'Legs vertical, reach for the toes. Isolates the upper rectus without hip-flexor dominance.',
    modality: 'strength',
  },
  {
    id: 'str-dead-bug',
    name: 'Dead Bug',
    difficulty: 'Beginner',
    benefits:
      'Opposite arm + leg extend while lower back stays glued. Anti-extension core control; lumbar-safe ab work.',
    modality: 'strength',
  },

  // ─── Core — obliques / rotational ───────────────────────────────────────
  {
    id: 'str-side-plank',
    name: 'Side Plank',
    difficulty: 'Beginner',
    benefits:
      'Supported on one forearm, body in a line. Builds obliques and lateral hip stability; key for "tight waist" look.',
    modality: 'strength',
  },
  {
    id: 'str-russian-twist',
    name: 'Russian Twist',
    difficulty: 'Beginner',
    benefits:
      'Seated rotation side-to-side with feet hovering. Rotational core; obliques and transverse abdominis.',
    modality: 'strength',
  },

  // ─── Conditioning / mixed ───────────────────────────────────────────────
  {
    id: 'str-mountain-climbers',
    name: 'Mountain Climbers',
    difficulty: 'Beginner',
    benefits:
      'Plank position, alternating knee drives. Cardio + core + shoulder endurance in one movement.',
    modality: 'strength',
  },
  {
    id: 'str-burpee',
    name: 'Burpee',
    difficulty: 'Intermediate',
    benefits:
      'Squat → plank → push-up → jump up. Full-body conditioning; the closest thing to a metabolic finisher with no gear.',
    modality: 'strength',
  },
  {
    id: 'str-squat',
    name: 'Bodyweight Squat',
    difficulty: 'Beginner',
    benefits:
      'Hip-and-knee flexion to depth and back up. Drives lower-body work alongside the upper-body push focus.',
    modality: 'strength',
  },
  {
    id: 'str-jumping-squat',
    name: 'Jumping Squat',
    difficulty: 'Intermediate',
    benefits:
      'Explosive vertical jump out of a squat. Adds power and elevates heart rate for a stronger fat-loss stimulus.',
    modality: 'strength',
  },
]
