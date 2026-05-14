// Breath practices — real, named breathwork from yogic and modern lineages.
// Each "entry" is a self-contained practice you can sustain for minutes.

import type { CatalogEntry } from './catalog-types'

export const breathCatalog: CatalogEntry[] = [
  {
    id: 'breath-box',
    name: 'Box Breathing (4-4-4-4)',
    difficulty: 'Beginner',
    benefits:
      'Equal-length inhale, hold, exhale, hold. Used by US Navy SEALs for stress regulation; balances the autonomic nervous system.',
    modality: 'breath',
  },
  {
    id: 'breath-4-7-8',
    name: '4-7-8 Breath',
    difficulty: 'Beginner',
    benefits:
      'Inhale 4, hold 7, exhale 8. Long exhale strongly activates the vagus nerve; effective for falling asleep.',
    modality: 'breath',
  },
  {
    id: 'breath-coherent',
    name: 'Coherent Breathing (5-5)',
    difficulty: 'Beginner',
    benefits:
      'Five-second inhale, five-second exhale, six breaths per minute. Maximizes heart-rate variability (HRV).',
    modality: 'breath',
  },
  {
    id: 'breath-long-exhale',
    name: 'Long Exhale',
    difficulty: 'Beginner',
    benefits:
      'Exhale twice as long as the inhale (e.g. 4-in, 8-out). Pure parasympathetic downshift; calms anxiety in under a minute.',
    modality: 'breath',
  },
  {
    id: 'breath-wim-hof',
    name: 'Wim Hof Method',
    difficulty: 'Intermediate',
    benefits:
      '30–40 deep power breaths, then full exhale with retention, then inhale-and-hold. 3 rounds. Strong alkalizing and adrenergic effect.',
    modality: 'breath',
  },
  {
    id: 'breath-nadi-shodhana',
    name: 'Alternate Nostril (Nadi Shodhana)',
    difficulty: 'Beginner',
    benefits:
      'Inhale one nostril, exhale the other, alternating. Classical yogic practice; balances the hemispheres and stills the mind.',
    modality: 'breath',
  },
  {
    id: 'breath-bhastrika',
    name: 'Bhastrika (Bellows Breath)',
    difficulty: 'Intermediate',
    benefits:
      'Forceful, equal inhale and exhale through the nose. Generates heat and alertness; clears the nasal passages.',
    modality: 'breath',
  },
  {
    id: 'breath-kapalabhati',
    name: 'Kapalabhati (Skull-Shining)',
    difficulty: 'Intermediate',
    benefits:
      'Sharp forced exhale, passive inhale. Cleansing yogic breath; activates the abdominal core and clears the head.',
    modality: 'breath',
  },
  {
    id: 'breath-bhramari',
    name: 'Bhramari (Humming Bee)',
    difficulty: 'Beginner',
    benefits:
      'Slow nasal exhale with humming. The vibration directly stimulates the vagus nerve via the eardrums; deeply calming.',
    modality: 'breath',
  },
  {
    id: 'breath-lion',
    name: "Lion's Breath (Simhasana)",
    difficulty: 'Beginner',
    benefits:
      'Inhale through the nose, exhale through the mouth with tongue out and a loud "haaa." Releases jaw and facial tension.',
    modality: 'breath',
  },
]
