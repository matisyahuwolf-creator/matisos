// Martial Arts techniques — kung fu primary (Northern long-fist / general
// Chinese martial-arts vocabulary), open to drilling other styles later.
// Stances are foundational; strikes/kicks/blocks build on them.

import type { CatalogEntry } from './catalog-types'

export const martialArtsCatalog: CatalogEntry[] = [
  // ─── Stances ────────────────────────────────────────────────────────────
  {
    id: 'ma-horse-stance',
    name: 'Horse Stance (Ma Bu)',
    difficulty: 'Beginner',
    benefits:
      'Wide stance with thighs parallel to the floor. The foundational kung fu stance; builds quads, glutes, and rooted balance.',
    modality: 'martial-arts',
  },
  {
    id: 'ma-bow-stance',
    name: 'Bow Stance (Gong Bu)',
    difficulty: 'Beginner',
    benefits:
      'Front leg bent, back leg straight. The forward-attacking stance; trains hip alignment under linear power.',
    modality: 'martial-arts',
  },
  {
    id: 'ma-empty-stance',
    name: 'Empty Stance (Xu Bu)',
    difficulty: 'Intermediate',
    benefits:
      'Back leg bears all weight, front toe lightly touching. Trains single-leg load and quick-kick readiness.',
    modality: 'martial-arts',
  },
  {
    id: 'ma-cat-stance',
    name: 'Cat Stance',
    difficulty: 'Intermediate',
    benefits:
      'Similar to Empty Stance but more compressed. Sharpens balance and the ability to lift the front foot fast.',
    modality: 'martial-arts',
  },

  // ─── Strikes ────────────────────────────────────────────────────────────
  {
    id: 'ma-straight-punch',
    name: 'Straight Punch',
    difficulty: 'Beginner',
    benefits:
      'Linear punch from the hip with hip rotation. Builds the basic power-generation chain (foot → hip → shoulder → fist).',
    modality: 'martial-arts',
  },
  {
    id: 'ma-back-fist',
    name: 'Back Fist',
    difficulty: 'Beginner',
    benefits:
      'Whipping strike with the back of the knuckles. Trains relaxed-then-snap mechanics, not muscular force.',
    modality: 'martial-arts',
  },
  {
    id: 'ma-palm-strike',
    name: 'Palm Strike',
    difficulty: 'Beginner',
    benefits:
      'Open-hand strike with the heel of the palm. Safer than a closed fist for self-defense; transfers shock without wrist risk.',
    modality: 'martial-arts',
  },
  {
    id: 'ma-elbow-strike',
    name: 'Elbow Strike',
    difficulty: 'Beginner',
    benefits:
      'Short-range horizontal or vertical strike with the elbow. Hardest natural weapon; close-quarters power.',
    modality: 'martial-arts',
  },

  // ─── Kicks ──────────────────────────────────────────────────────────────
  {
    id: 'ma-front-kick',
    name: 'Front Kick (Zheng Ti Tui)',
    difficulty: 'Beginner',
    benefits:
      'Straight kick driven from the hip. Builds hip flexor strength and one-leg balance.',
    modality: 'martial-arts',
  },
  {
    id: 'ma-side-kick',
    name: 'Side Kick (Ce Ti Tui)',
    difficulty: 'Intermediate',
    benefits:
      'Lateral kick with the heel of the foot. Demands hip mobility and rooted standing leg.',
    modality: 'martial-arts',
  },
  {
    id: 'ma-roundhouse',
    name: 'Roundhouse Kick',
    difficulty: 'Intermediate',
    benefits:
      'Whip-style kick rotating from the hip. Trains hip rotation power and supporting-foot pivot.',
    modality: 'martial-arts',
  },
  {
    id: 'ma-crescent-kick',
    name: 'Crescent Kick',
    difficulty: 'Intermediate',
    benefits:
      'Sweeping inward or outward arc kick. Develops hip mobility in the frontal plane.',
    modality: 'martial-arts',
  },

  // ─── Blocks / footwork / flow ───────────────────────────────────────────
  {
    id: 'ma-high-block',
    name: 'High Block',
    difficulty: 'Beginner',
    benefits:
      'Rising forearm block above the head. The basic upward defense; trains shoulder-elbow timing.',
    modality: 'martial-arts',
  },
  {
    id: 'ma-low-block',
    name: 'Low Block',
    difficulty: 'Beginner',
    benefits:
      'Downward sweep with the forearm to deflect low strikes/kicks. Builds the most-used defensive arc.',
    modality: 'martial-arts',
  },
  {
    id: 'ma-footwork-shuffle',
    name: 'Shuffle Step',
    difficulty: 'Beginner',
    benefits:
      'Light forward/back shuffle without crossing the feet. Foundational kung fu footwork; keeps base under you while moving.',
    modality: 'martial-arts',
  },
  {
    id: 'ma-shadow-flow',
    name: 'Shadow Flow',
    difficulty: 'Intermediate',
    benefits:
      'Free-form sequencing of stances, strikes, and kicks against an imagined opponent. Where technique becomes practice.',
    modality: 'martial-arts',
  },
]
