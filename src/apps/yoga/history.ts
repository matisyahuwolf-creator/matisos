import { storage } from '../../lib/storage'

export type Completion = {
  sessionId: string
  sessionName: string
  state?: string
  durationSec: number
  completedAt: number
}

const KEY = 'yoga:history'
const MAX = 500

export function loadHistory(): Completion[] {
  const raw = storage.get(KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as Completion[]
  } catch {
    return []
  }
}

export function recordCompletion(entry: Completion): void {
  const list = loadHistory()
  list.unshift(entry)
  storage.set(KEY, JSON.stringify(list.slice(0, MAX)))
}

function startOfDay(ts: number): number {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function historyStats(list: Completion[] = loadHistory()) {
  const now = Date.now()
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000
  const monthAgo = now - 30 * 24 * 60 * 60 * 1000

  const thisWeek = list.filter((c) => c.completedAt >= weekAgo)
  const thisMonth = list.filter((c) => c.completedAt >= monthAgo)
  const totalSec = list.reduce((acc, c) => acc + c.durationSec, 0)
  const weekSec = thisWeek.reduce((acc, c) => acc + c.durationSec, 0)

  // streak: consecutive days ending today (or yesterday) with at least one session
  const days = new Set(list.map((c) => startOfDay(c.completedAt)))
  let streak = 0
  let cursor = startOfDay(now)
  if (!days.has(cursor)) {
    cursor -= 24 * 60 * 60 * 1000 // allow streak to start yesterday
  }
  while (days.has(cursor)) {
    streak += 1
    cursor -= 24 * 60 * 60 * 1000
  }

  return {
    total: list.length,
    thisWeek: thisWeek.length,
    thisMonth: thisMonth.length,
    totalSec,
    weekSec,
    streak,
    lastAt: list[0]?.completedAt,
  }
}

export function countSessionsInWindow(
  sessionId: string,
  windowMs: number,
  list: Completion[] = loadHistory(),
): number {
  const now = Date.now()
  return list.filter(
    (c) => c.sessionId === sessionId && c.completedAt >= now - windowMs,
  ).length
}
