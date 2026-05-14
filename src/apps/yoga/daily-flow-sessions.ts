// The Matis Path daily flows — one cross-modality session per 18-month phase.
// Each session chains all six modalities in the canonical order:
// yoga → dance → martial arts → strength → breath → meditation.
//
// durationSec on steps marked perSide is per-side; the session's stated
// durationMin reflects the real total time including both sides.
//
// modality is tagged as 'yoga' for type compatibility — these sessions are
// surfaced via the app-wide track, not via the per-modality session list.

import type { Session } from './sessions'

export const dailyFlowSessions: Session[] = [
  // ─── Phase 1 · Foundation ──────────────────────────────────────────────
  {
    id: 'path-foundation',
    name: 'Foundation Flow',
    focus: 'Daily Path · Foundation',
    difficulty: 'Beginner',
    durationMin: 20,
    icon: '🌱',
    gradient: 'from-emerald-400 via-teal-500 to-sky-500',
    description:
      'The first phase of the Matis Path. Twenty minutes, all six modalities, every day. The job is consistency — not depth.',
    modality: 'yoga',
    steps: [
      // Yoga (3 min)
      { poseId: 'mountain', durationSec: 30, cue: 'Yoga first. Stand tall. Notice the floor under both feet.' },
      { poseId: 'cat', durationSec: 30 },
      { poseId: 'cow', durationSec: 30 },
      { poseId: 'downward-dog', durationSec: 45, cue: 'Long spine. Heels reaching down.' },
      { poseId: 'child', durationSec: 45, cue: 'Rest. Breath into the back.' },

      // Dance (3 min)
      { poseId: 'dance-shake-loose', durationSec: 60, cue: 'Dance. Shake everything out. No form.' },
      { poseId: 'dance-bounce', durationSec: 60, cue: 'Find a tempo. Soft knees.' },
      { poseId: 'dance-two-step', durationSec: 60, cue: 'Side to side. Stay in your hips.' },

      // Martial arts (3 min)
      { poseId: 'ma-horse-stance', durationSec: 45, cue: 'Kung fu. Drop into the stance. Thighs working.' },
      { poseId: 'ma-straight-punch', durationSec: 30, perSide: true, cue: 'From the hip. Rotate. Extend. Retract.' },
      { poseId: 'ma-front-kick', durationSec: 30, perSide: true, cue: 'Knee up first, then extend the foot.' },

      // Strength (3 min)
      { poseId: 'str-pushup', durationSec: 30, cue: 'Strength. Push-ups — as many as you can in 30 seconds.' },
      { poseId: 'str-plank', durationSec: 30, cue: 'Hold. Hips level. Squeeze glutes.' },
      { poseId: 'str-bicycle', durationSec: 30 },
      { poseId: 'str-leg-raise', durationSec: 30, cue: 'Lower with control.' },
      { poseId: 'str-mountain-climbers', durationSec: 30 },

      // Breath (3 min)
      { poseId: 'breath-box', durationSec: 180, cue: 'Breath. Inhale 4, hold 4, exhale 4, hold 4.' },

      // Meditation (4 min)
      { poseId: 'med-body-scan', durationSec: 240, cue: 'Close. Body scan, head to feet.' },
    ],
  },

  // ─── Phase 2 · Build ───────────────────────────────────────────────────
  {
    id: 'path-build',
    name: 'Build Flow',
    focus: 'Daily Path · Build',
    difficulty: 'Beginner',
    durationMin: 35,
    icon: '🌿',
    gradient: 'from-amber-400 via-orange-500 to-rose-500',
    description:
      'Phase two of the Matis Path. Thirty-five minutes. Longer flows in every modality. Body recomp begins to be visible.',
    modality: 'yoga',
    steps: [
      // Yoga (~6 min)
      { poseId: 'mountain', durationSec: 30, cue: 'Yoga. Find the standing root.' },
      { poseId: 'downward-dog', durationSec: 60 },
      { poseId: 'low-lunge', durationSec: 45, perSide: true },
      { poseId: 'cobra', durationSec: 45 },
      { poseId: 'warrior-2', durationSec: 45, perSide: true, cue: 'Strong stance. Arms reaching.' },
      { poseId: 'happy-baby', durationSec: 30 },
      { poseId: 'child', durationSec: 30 },

      // Dance (~5 min)
      { poseId: 'dance-shake-loose', durationSec: 30, cue: 'Dance. Shake into it.' },
      { poseId: 'dance-bounce', durationSec: 30 },
      { poseId: 'dance-two-step', durationSec: 30 },
      { poseId: 'dance-body-roll', durationSec: 30 },
      { poseId: 'dance-ecstatic-flow', durationSec: 180, cue: 'Three minutes free. Whatever the body wants.' },
      { poseId: 'dance-cool-sway', durationSec: 30 },

      // Martial arts (~5 min)
      { poseId: 'ma-horse-stance', durationSec: 60, cue: 'Kung fu. Drop deep.' },
      { poseId: 'ma-bow-stance', durationSec: 30, perSide: true },
      { poseId: 'ma-straight-punch', durationSec: 30, perSide: true },
      { poseId: 'ma-front-kick', durationSec: 30, perSide: true },
      { poseId: 'ma-side-kick', durationSec: 30, perSide: true },

      // Strength (~7 min)
      { poseId: 'str-pushup', durationSec: 45, cue: 'Strength. Push-ups — to failure if you can.' },
      { poseId: 'str-wide-pushup', durationSec: 45, cue: 'Wide grip. Pec stretch at the bottom.' },
      { poseId: 'str-plank', durationSec: 45 },
      { poseId: 'str-leg-raise', durationSec: 45, cue: 'Slow. Lower-rectus burn.' },
      { poseId: 'str-bicycle', durationSec: 45 },
      { poseId: 'str-side-plank', durationSec: 30, perSide: true },
      { poseId: 'str-mountain-climbers', durationSec: 60 },
      { poseId: 'str-pushup', durationSec: 45, cue: 'Finisher set.' },

      // Breath (~4 min)
      { poseId: 'breath-box', durationSec: 120, cue: 'Breath. Box, two minutes.' },
      { poseId: 'breath-long-exhale', durationSec: 120, cue: 'Now exhale long. Twice the inhale.' },

      // Meditation (~7 min)
      { poseId: 'med-body-scan', durationSec: 420, cue: 'Close. Seven-minute body scan.' },
    ],
  },

  // ─── Phase 3 · Develop ─────────────────────────────────────────────────
  {
    id: 'path-develop',
    name: 'Develop Flow',
    focus: 'Daily Path · Develop',
    difficulty: 'Intermediate',
    durationMin: 50,
    icon: '🌳',
    gradient: 'from-orange-500 via-red-600 to-rose-700',
    description:
      'Phase three of the Matis Path. Fifty minutes. Aesthetic goals visible. Skill across all modalities begins to feel real.',
    modality: 'yoga',
    steps: [
      // Yoga (~8 min)
      { poseId: 'mountain', durationSec: 30, cue: 'Yoga. Begin.' },
      { poseId: 'downward-dog', durationSec: 60 },
      { poseId: 'low-lunge', durationSec: 45, perSide: true },
      { poseId: 'warrior-1', durationSec: 45, perSide: true },
      { poseId: 'warrior-2', durationSec: 45, perSide: true },
      { poseId: 'triangle', durationSec: 45, perSide: true },
      { poseId: 'plank', durationSec: 45 },
      { poseId: 'cobra', durationSec: 45 },
      { poseId: 'pigeon', durationSec: 60, perSide: true, cue: 'Deep hip opener. Breathe through it.' },

      // Dance (~7 min)
      { poseId: 'dance-shake-loose', durationSec: 30 },
      { poseId: 'dance-bounce', durationSec: 30 },
      { poseId: 'dance-body-roll', durationSec: 30 },
      { poseId: 'dance-crossover', durationSec: 30 },
      { poseId: 'dance-spin', durationSec: 30, perSide: true },
      { poseId: 'dance-ecstatic-flow', durationSec: 240, cue: 'Four minutes free flow. Closed eyes if it helps.' },
      { poseId: 'dance-freeze', durationSec: 30 },

      // Martial arts (~8 min)
      { poseId: 'ma-horse-stance', durationSec: 60 },
      { poseId: 'ma-bow-stance', durationSec: 30, perSide: true },
      { poseId: 'ma-straight-punch', durationSec: 30, perSide: true },
      { poseId: 'ma-palm-strike', durationSec: 30, perSide: true },
      { poseId: 'ma-front-kick', durationSec: 30, perSide: true },
      { poseId: 'ma-side-kick', durationSec: 30, perSide: true },
      { poseId: 'ma-roundhouse', durationSec: 30, perSide: true },
      { poseId: 'ma-shadow-flow', durationSec: 120, cue: 'Two minutes shadow flow. Free combos.' },

      // Strength (~12 min)
      { poseId: 'str-pushup', durationSec: 45 },
      { poseId: 'str-wide-pushup', durationSec: 45 },
      { poseId: 'str-decline-pushup', durationSec: 45, cue: 'Feet on chair. Upper-chest focus.' },
      { poseId: 'str-diamond-pushup', durationSec: 45 },
      { poseId: 'str-plank', durationSec: 60 },
      { poseId: 'str-side-plank', durationSec: 30, perSide: true },
      { poseId: 'str-leg-raise', durationSec: 45 },
      { poseId: 'str-bicycle', durationSec: 45 },
      { poseId: 'str-v-up', durationSec: 45, cue: 'Strong crunch at the top.' },
      { poseId: 'str-hollow-hold', durationSec: 45 },
      { poseId: 'str-russian-twist', durationSec: 45 },
      { poseId: 'str-burpee', durationSec: 60, cue: 'Finisher. Empty the tank.' },

      // Breath (~5 min)
      { poseId: 'breath-wim-hof', durationSec: 300, cue: 'Wim Hof. Two rounds. Power breaths into retention.' },

      // Meditation (~10 min)
      { poseId: 'med-metta', durationSec: 300, cue: 'Metta — for yourself, then someone you love.' },
      { poseId: 'med-silent-sit', durationSec: 300, cue: 'Then sit silent. Five minutes.' },
    ],
  },

  // ─── Phase 4 · Pro ─────────────────────────────────────────────────────
  {
    id: 'path-pro',
    name: 'Pro Flow',
    focus: 'Daily Path · Pro',
    difficulty: 'Advanced',
    durationMin: 65,
    icon: '🔥',
    gradient: 'from-rose-600 via-violet-700 to-indigo-900',
    description:
      'Phase four of the Matis Path. Sixty-five minutes. Full integration. The shape of the body — and the shape of the mind — is set by this practice.',
    modality: 'yoga',
    steps: [
      // Yoga (~10 min)
      { poseId: 'mountain', durationSec: 30 },
      { poseId: 'downward-dog', durationSec: 60 },
      { poseId: 'low-lunge', durationSec: 45, perSide: true },
      { poseId: 'warrior-1', durationSec: 45, perSide: true },
      { poseId: 'warrior-2', durationSec: 45, perSide: true },
      { poseId: 'side-angle', durationSec: 45, perSide: true },
      { poseId: 'triangle', durationSec: 45, perSide: true },
      { poseId: 'half-moon', durationSec: 45, perSide: true, cue: 'Single-leg balance. Long line.' },
      { poseId: 'pigeon', durationSec: 60, perSide: true },
      { poseId: 'crow', durationSec: 45, cue: 'Arm balance. Or work toward it.' },

      // Dance (~10 min)
      { poseId: 'dance-shake-loose', durationSec: 30 },
      { poseId: 'dance-body-roll', durationSec: 30 },
      { poseId: 'dance-crossover', durationSec: 30 },
      { poseId: 'dance-arm-wave', durationSec: 30 },
      { poseId: 'dance-spin', durationSec: 30, perSide: true },
      { poseId: 'dance-floor-drop', durationSec: 45 },
      { poseId: 'dance-ecstatic-flow', durationSec: 420, cue: 'Seven minutes free. Drop everything. Move.' },

      // Martial arts (~10 min)
      { poseId: 'ma-horse-stance', durationSec: 60 },
      { poseId: 'ma-bow-stance', durationSec: 30, perSide: true },
      { poseId: 'ma-empty-stance', durationSec: 30, perSide: true },
      { poseId: 'ma-straight-punch', durationSec: 30, perSide: true },
      { poseId: 'ma-palm-strike', durationSec: 30, perSide: true },
      { poseId: 'ma-elbow-strike', durationSec: 30, perSide: true },
      { poseId: 'ma-front-kick', durationSec: 30, perSide: true },
      { poseId: 'ma-side-kick', durationSec: 30, perSide: true },
      { poseId: 'ma-roundhouse', durationSec: 30, perSide: true },
      { poseId: 'ma-crescent-kick', durationSec: 30, perSide: true },
      { poseId: 'ma-shadow-flow', durationSec: 180, cue: 'Three minutes shadow. Real intent.' },

      // Strength (~15 min)
      { poseId: 'str-pushup', durationSec: 45 },
      { poseId: 'str-wide-pushup', durationSec: 45 },
      { poseId: 'str-decline-pushup', durationSec: 45 },
      { poseId: 'str-diamond-pushup', durationSec: 45 },
      { poseId: 'str-pike-pushup', durationSec: 45 },
      { poseId: 'str-archer-pushup', durationSec: 45, perSide: true, cue: 'Bridges toward the one-arm.' },
      { poseId: 'str-plank', durationSec: 60 },
      { poseId: 'str-side-plank', durationSec: 45, perSide: true },
      { poseId: 'str-v-up', durationSec: 45 },
      { poseId: 'str-hollow-hold', durationSec: 60 },
      { poseId: 'str-bicycle', durationSec: 45 },
      { poseId: 'str-russian-twist', durationSec: 45 },
      { poseId: 'str-leg-raise', durationSec: 45 },
      { poseId: 'str-burpee', durationSec: 60 },
      { poseId: 'str-jumping-squat', durationSec: 45, cue: 'Explosive. Cardio finish.' },
      { poseId: 'str-burpee', durationSec: 45, cue: 'One more set. Earn it.' },

      // Breath (~8 min)
      { poseId: 'breath-bhastrika', durationSec: 120, cue: 'Bhastrika. Bellows breath. Strong.' },
      { poseId: 'breath-wim-hof', durationSec: 360, cue: 'Wim Hof. Three full rounds. Hold deep.' },

      // Meditation (~12 min)
      { poseId: 'breath-long-exhale', durationSec: 60, cue: 'Settle. The body is open now.' },
      { poseId: 'med-silent-sit', durationSec: 660, cue: 'Eleven minutes. Just sit.' },
    ],
  },
]
