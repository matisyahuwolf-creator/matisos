import { storage } from '../../lib/storage'

export type BodyCheckin = {
  ts: number
  state: 'energized' | 'okay' | 'tired' | 'sore' | 'stiff'
  note?: string
}

export type StrengthEntry = {
  ts: number
  exercise: string
  sets?: number
  reps?: number
  weight?: string
  notes?: string
}

export type CardioEntry = {
  ts: number
  activity: string
  durationMin?: number
  notes?: string
}

export type FoodEntry = {
  ts: number
  meal: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  what: string
  notes?: string
}

type LogKey =
  | 'practice:body-checkins'
  | 'practice:strength-log'
  | 'practice:cardio-log'
  | 'practice:food-log'

function load<T>(key: LogKey): T[] {
  const raw = storage.get(key)
  if (!raw) return []
  try {
    return JSON.parse(raw) as T[]
  } catch {
    return []
  }
}

function save<T>(key: LogKey, list: T[]) {
  storage.set(key, JSON.stringify(list.slice(0, 500)))
}

export function loadCheckins(): BodyCheckin[] {
  return load<BodyCheckin>('practice:body-checkins')
}
export function addCheckin(entry: BodyCheckin) {
  const list = loadCheckins()
  list.unshift(entry)
  save('practice:body-checkins', list)
}

export function loadStrength(): StrengthEntry[] {
  return load<StrengthEntry>('practice:strength-log')
}
export function addStrength(entry: StrengthEntry) {
  const list = loadStrength()
  list.unshift(entry)
  save('practice:strength-log', list)
}

export function loadCardio(): CardioEntry[] {
  return load<CardioEntry>('practice:cardio-log')
}
export function addCardio(entry: CardioEntry) {
  const list = loadCardio()
  list.unshift(entry)
  save('practice:cardio-log', list)
}

export function loadFood(): FoodEntry[] {
  return load<FoodEntry>('practice:food-log')
}
export function addFood(entry: FoodEntry) {
  const list = loadFood()
  list.unshift(entry)
  save('practice:food-log', list)
}

export function deleteAt<T extends { ts: number }>(
  key: LogKey,
  ts: number,
): T[] {
  const list = load<T>(key)
  const filtered = list.filter((e) => e.ts !== ts)
  save(key, filtered)
  return filtered
}

export function relativeDay(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const day = 24 * 60 * 60 * 1000
  if (diff < day && d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }
  if (diff < 2 * day) return 'Yesterday'
  if (diff < 7 * day) return d.toLocaleDateString('en-US', { weekday: 'short' })
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function startOfToday(): number {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}
