export type WeeklyMix = {
  sessionId: string
  perWeek: number
}

export type TrackPhase = {
  id: string
  name: string
  weeks: number
  description: string
  goals: string[]
  markers: string[]
  weeklyMix: WeeklyMix[]
  weeklyMinutes: string
}

import type { Modality } from './modalities'

export type Track = {
  id: string
  name: string
  subtitle: string
  description: string
  totalWeeks: number
  icon: string
  gradient: string
  phases: TrackPhase[]
  modality: Modality
  // True for tracks that span every modality (the Matis Path). App-wide
  // tracks are shown at the top of the Programs tab regardless of the
  // selected modality.
  appWide?: boolean
}

export const tracks: Track[] = [
  {
    id: 'matis-path',
    modality: 'yoga',
    appWide: true,
    name: 'The Matis Path',
    subtitle: '18 months · 78 weeks · all six modalities',
    description:
      'A daily session that chains all six modalities — yoga, dance, martial arts, strength, breath, meditation — in one progressive arc from novice to pro. Four phases, each with a single daily flow at the right intensity. The path is consistency over depth; the months do the work.',
    totalWeeks: 78,
    icon: '🜂',
    gradient: 'from-orange-500 via-rose-600 to-violet-700',
    phases: [
      {
        id: 'foundation',
        name: 'Foundation',
        weeks: 12,
        description:
          'Build the daily habit. Twenty minutes, every day, all six modalities at the lightest intensity. The goal is showing up — not depth, not intensity, not soreness.',
        weeklyMinutes: '~100 min/week (5 × 20 min)',
        goals: [
          'Do the daily flow 5 days a week',
          'Learn the basic shape of each modality',
          'Make 20 minutes feel like nothing',
        ],
        markers: [
          'You can do the full flow without checking the clock',
          'Push-ups: 10+ in a clean set',
          'Box breathing for 3 min feels natural',
          'Body scan feels like rest, not work',
        ],
        weeklyMix: [{ sessionId: 'path-foundation', perWeek: 5 }],
      },
      {
        id: 'build',
        name: 'Build',
        weeks: 18,
        description:
          'Thirty-five-minute daily flow. Each modality gets more time and slightly harder content. Body recomp starts here — push variations begin, ab work doubles, dance and shadow flows lengthen.',
        weeklyMinutes: '~210 min/week (6 × 35 min)',
        goals: [
          'Daily flow 6 days a week',
          'Hold a side plank 30s per side',
          'Run 3 minutes of free-form dance without freezing',
          'Long-exhale breath drops heart rate visibly',
        ],
        markers: [
          'Push-ups: 20+ in a clean set, wide-grip 15+',
          'Front kick and side kick on both sides without losing balance',
          'Belly is noticeably tighter when you check in the mirror',
          'Sitting in meditation 7 min without restlessness',
        ],
        weeklyMix: [{ sessionId: 'path-build', perWeek: 6 }],
      },
      {
        id: 'develop',
        name: 'Develop',
        weeks: 24,
        description:
          'Fifty-minute daily flow. Aesthetic goals become visible — abs defining, pec shelf forming. Skill across modalities feels real: shadow flows have intent, dance has its own grammar, Wim Hof rounds work.',
        weeklyMinutes: '~300 min/week (6 × 50 min)',
        goals: [
          'Daily flow 6 days a week, full 50 minutes',
          '4 minutes of free-form dance without stopping',
          'Wim Hof: 2 full rounds',
          'Pigeon and warrior poses held without strain',
        ],
        markers: [
          'Six-pack visible in good light, especially upper abs',
          'Pec shelf and upper-chest line defined',
          'Decline + diamond push-ups in clean form',
          'Roundhouse kick on both sides with hip pivot',
          'Silent sit for 5 min without restlessness',
        ],
        weeklyMix: [{ sessionId: 'path-develop', perWeek: 6 }],
      },
      {
        id: 'pro',
        name: 'Pro',
        weeks: 24,
        description:
          'Sixty-five-minute daily flow. The body is set; the practice is the lifestyle. Inversions, archer push-ups, three rounds of Wim Hof, eleven-minute silent sits. After this phase the program no longer ends — it just is what you do.',
        weeklyMinutes: '~390 min/week (6 × 65 min)',
        goals: [
          'Daily flow 6 days a week, the full 65 minutes',
          '7 minutes free-form dance',
          'Wim Hof: 3 full rounds with deep retentions',
          'Eleven-minute silent sit baseline',
        ],
        markers: [
          'Full six-pack visible all the time, lower abs included',
          'Crow pose held for 10+ seconds',
          'Archer push-up on both sides',
          'Three minutes of shadow flow without dropping intensity',
          'You feel "off" on a day you skip — the body wants the flow',
        ],
        weeklyMix: [{ sessionId: 'path-pro', perWeek: 6 }],
      },
    ],
  },
  {
    id: 'full-flexibility',
    modality: 'yoga',
    name: 'Full Flexibility',
    subtitle: '18 months · 78 weeks',
    description:
      'A progressive path from baseline to advanced flexibility. Four phases that build on each other — from establishing the daily habit through to approaching splits and full backbends. Move through it at your own pace; the weeks are reference points, not deadlines.',
    totalWeeks: 78,
    icon: '🌱',
    gradient: 'from-emerald-500 via-teal-600 to-cyan-700',
    phases: [
      {
        id: 'foundation',
        name: 'Foundation',
        weeks: 12,
        description:
          'Build the daily habit and discover your baseline range. Short, accessible sessions five days a week. The goal here is consistency, not depth.',
        weeklyMinutes: '50–75 min/week',
        goals: [
          'Establish a 10–15 min daily practice',
          'Become comfortable in basic positions for 1+ minute',
          'Learn the body’s current range across major joints',
        ],
        markers: [
          'You can reach toward your toes (knees bent is fine) without straining',
          'Child’s Pose feels restful for 2+ minutes',
          'You can sit cross-legged with a tall spine',
        ],
        weeklyMix: [
          { sessionId: 'morning', perWeek: 3 },
          { sessionId: 'lower-back', perWeek: 1 },
          { sessionId: 'pre-sleep', perWeek: 1 },
        ],
      },
      {
        id: 'building',
        name: 'Building',
        weeks: 18,
        description:
          'Longer holds, deeper positions. You’ll start to feel real flexibility gains. Begin to explore hip openers and post-workout recovery work.',
        weeklyMinutes: '100–150 min/week',
        goals: [
          'Hold deep stretches for 1–2 min each',
          'Practice 5–6 days/week',
          'Introduce intermediate positions like Pigeon Stretch and Pyramid',
        ],
        markers: [
          'Pigeon Stretch comfortable for 1+ min per side',
          'Standing Forward Fold: hands flat or near the floor',
          'Low Lunge held 90 sec each side',
        ],
        weeklyMix: [
          { sessionId: 'morning', perWeek: 2 },
          { sessionId: 'hip-release', perWeek: 2 },
          { sessionId: 'post-workout', perWeek: 1 },
          { sessionId: 'lower-back', perWeek: 1 },
        ],
      },
      {
        id: 'deepening',
        name: 'Deepening',
        weeks: 22,
        description:
          'Reach toward end-range positions. Add chest-opening and backbend work. Flexibility starts to feel like a property of who you are, not just something you do.',
        weeklyMinutes: '150–200 min/week',
        goals: [
          'Approach end-range in major joints',
          'Develop active flexibility — not just passive holds',
          'Build postural strength to support deeper work',
        ],
        markers: [
          'Pigeon Stretch 2–3 min per side, hips deeply released',
          'Bridge: arms extending, heels lifting',
          'Wheel / Backbend accessible (even partial)',
          'Splits prep showing progress',
        ],
        weeklyMix: [
          { sessionId: 'hip-release', perWeek: 3 },
          { sessionId: 'heart-opening', perWeek: 2 },
          { sessionId: 'stress-release', perWeek: 1 },
        ],
      },
      {
        id: 'integration',
        name: 'Integration',
        weeks: 26,
        description:
          'Combine flexibility with strength. Explore the advanced positions — splits, full backbend, inversions. Practice becomes self-directed; you know your body well enough to know what it needs.',
        weeklyMinutes: '200–300 min/week',
        goals: [
          'Working toward full splits (front and middle)',
          'Comfortable in Wheel with relaxed breath',
          'Begin inversion practice (Forearm Stand, Headstand)',
          'Self-prescribe sequences based on need',
        ],
        markers: [
          'Front split: back knee toward the floor, hips square',
          'Middle split: thighs parallel to the floor',
          'Wheel Pose held 30+ sec with relaxed breath',
          'Comfortable improvising your own daily sequence',
        ],
        weeklyMix: [
          { sessionId: 'hip-release', perWeek: 3 },
          { sessionId: 'heart-opening', perWeek: 2 },
          { sessionId: 'grounding', perWeek: 1 },
        ],
      },
    ],
  },
]

export function phaseFor(track: Track, week: number): TrackPhase {
  let acc = 0
  for (const p of track.phases) {
    acc += p.weeks
    if (week <= acc) return p
  }
  return track.phases[track.phases.length - 1]
}

export function phaseStartWeek(track: Track, phaseId: string): number {
  let acc = 0
  for (const p of track.phases) {
    if (p.id === phaseId) return acc + 1
    acc += p.weeks
  }
  return 1
}

export type ActiveTrackState = {
  trackId: string
  startedAt: number
  currentWeek: number
}

export const ACTIVE_TRACK_KEY = 'yoga:track-v1'

import { storage } from '../../lib/storage'
import { sessions, type Session } from './sessions'
import { countSessionsInWindow } from './history'

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

export function loadActiveTrack(): ActiveTrackState | null {
  const raw = storage.get(ACTIVE_TRACK_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as ActiveTrackState
  } catch {
    return null
  }
}

export function getNextSessionInProgram(
  justCompletedSessionId: string,
): Session | null {
  const active = loadActiveTrack()
  if (!active) return null
  const track = tracks.find((t) => t.id === active.trackId)
  if (!track) return null
  const phase = phaseFor(track, active.currentWeek)
  const incomplete = phase.weeklyMix
    .map((mix) => ({
      mix,
      done: countSessionsInWindow(mix.sessionId, WEEK_MS),
    }))
    .filter(({ mix, done }) => done < mix.perWeek)

  if (incomplete.length === 0) return null

  // Prefer something different from what just finished
  const candidate =
    incomplete.find((i) => i.mix.sessionId !== justCompletedSessionId) ??
    incomplete[0]
  return sessions.find((s) => s.id === candidate.mix.sessionId) ?? null
}
