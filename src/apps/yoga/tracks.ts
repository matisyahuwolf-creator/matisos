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

export type Track = {
  id: string
  name: string
  subtitle: string
  description: string
  totalWeeks: number
  icon: string
  gradient: string
  phases: TrackPhase[]
}

export const tracks: Track[] = [
  {
    id: 'full-flexibility',
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
