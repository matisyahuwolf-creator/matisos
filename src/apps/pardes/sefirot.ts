export type Sefira = {
  id: string
  hebrew: string
  transliteration: string
  attribute: string
  bgGradient: string
  accentColor: string
  textTone: 'light' | 'dark'
  kavanah: string
  breathSec: number
}

export const sefirot: Sefira[] = [
  {
    id: 'keter',
    hebrew: 'כֶּתֶר',
    transliteration: 'Keter',
    attribute: 'Crown · the will above thought',
    bgGradient:
      'from-zinc-50 via-white to-violet-100',
    accentColor: '#a78bfa',
    textTone: 'dark',
    kavanah:
      'Before form. Before name. The silent source that gives rise to everything.',
    breathSec: 8,
  },
  {
    id: 'chochmah',
    hebrew: 'חָכְמָה',
    transliteration: 'Chochmah',
    attribute: 'Wisdom · the flash of insight',
    bgGradient:
      'from-sky-300 via-blue-600 to-indigo-800',
    accentColor: '#93c5fd',
    textTone: 'light',
    kavanah:
      'The seed-point of awareness. The lightning before the thunder.',
    breathSec: 6,
  },
  {
    id: 'binah',
    hebrew: 'בִּינָה',
    transliteration: 'Binah',
    attribute: 'Understanding · the womb of form',
    bgGradient:
      'from-teal-600 via-emerald-700 to-slate-900',
    accentColor: '#5eead4',
    textTone: 'light',
    kavanah:
      'The unfolding of insight into pattern. The receptive depth that gives form to the formless.',
    breathSec: 7,
  },
  {
    id: 'chesed',
    hebrew: 'חֶסֶד',
    transliteration: 'Chesed',
    attribute: 'Lovingkindness · the outward flow',
    bgGradient:
      'from-amber-100 via-sky-100 to-blue-300',
    accentColor: '#60a5fa',
    textTone: 'dark',
    kavanah:
      'Boundless giving. The right hand of expansion. What pours forth without measure.',
    breathSec: 6,
  },
  {
    id: 'gevurah',
    hebrew: 'גְּבוּרָה',
    transliteration: 'Gevurah',
    attribute: 'Strength · the inward contraction',
    bgGradient:
      'from-red-700 via-rose-700 to-red-950',
    accentColor: '#f87171',
    textTone: 'light',
    kavanah:
      'Holy restraint. The left hand of form. What you say no to defines what you say yes to.',
    breathSec: 7,
  },
  {
    id: 'tiferet',
    hebrew: 'תִּפְאֶרֶת',
    transliteration: 'Tiferet',
    attribute: 'Beauty · the harmonic center',
    bgGradient:
      'from-yellow-400 via-amber-500 to-orange-600',
    accentColor: '#fcd34d',
    textTone: 'light',
    kavanah:
      'The balance of giving and holding. The heart at the center of the tree, where opposites meet.',
    breathSec: 8,
  },
  {
    id: 'netzach',
    hebrew: 'נֶצַח',
    transliteration: 'Netzach',
    attribute: 'Eternity · the drive that persists',
    bgGradient:
      'from-emerald-400 via-green-600 to-lime-700',
    accentColor: '#86efac',
    textTone: 'light',
    kavanah:
      'The pulse of life that does not quit. Endurance in the body and the will.',
    breathSec: 6,
  },
  {
    id: 'hod',
    hebrew: 'הוֹד',
    transliteration: 'Hod',
    attribute: 'Splendor · the surrender to what is',
    bgGradient:
      'from-orange-400 via-rose-500 to-pink-600',
    accentColor: '#fda4af',
    textTone: 'light',
    kavanah:
      'Reverence. Letting yourself be moved by something larger than yourself.',
    breathSec: 7,
  },
  {
    id: 'yesod',
    hebrew: 'יְסוֹד',
    transliteration: 'Yesod',
    attribute: 'Foundation · the channel that gathers',
    bgGradient:
      'from-violet-600 via-purple-700 to-fuchsia-800',
    accentColor: '#d8b4fe',
    textTone: 'light',
    kavanah:
      'The funnel through which everything above pours into the body and the world below.',
    breathSec: 7,
  },
  {
    id: 'malkhut',
    hebrew: 'מַלְכוּת',
    transliteration: 'Malkhut',
    attribute: 'Sovereignty · the vessel of the everyday',
    bgGradient:
      'from-stone-700 via-amber-900 to-stone-900',
    accentColor: '#d6d3d1',
    textTone: 'light',
    kavanah:
      'The world you are in. The body, the breath, this moment. The divine in the dust.',
    breathSec: 8,
  },
]
