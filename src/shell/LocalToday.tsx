import { useEffect, useState } from 'react'
import {
  fetchWeather,
  getLocation,
  loadCachedLocation,
  loadCachedWeather,
  type Location,
  type Weather,
} from '../lib/weather'

type Suggestion = { name: string; why: string }
type Suggestions = { vibe: string; suggestions: Suggestion[]; fetchedAt: number }

const SUGGESTIONS_KEY = 'matisos:suggestions'
const SUGGESTIONS_CACHE_MS = 3 * 60 * 60 * 1000 // 3 hours

function loadCachedSuggestions(): Suggestions | null {
  try {
    const raw = localStorage.getItem(SUGGESTIONS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Suggestions
    if (Date.now() - parsed.fetchedAt > SUGGESTIONS_CACHE_MS) return null
    return parsed
  } catch {
    return null
  }
}

function saveSuggestions(s: Suggestions) {
  try {
    localStorage.setItem(SUGGESTIONS_KEY, JSON.stringify(s))
  } catch {
    // ignored
  }
}

async function fetchSuggestions(
  weather: Weather,
  location: Location,
): Promise<Suggestions> {
  const r = await fetch('/api/where-to-go', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      city: location.city ?? 'your area',
      condition: weather.condition,
      tempF: weather.tempF,
    }),
  })
  if (!r.ok) throw new Error(`Suggestions ${r.status}`)
  const data = await r.json()
  const out: Suggestions = {
    vibe: typeof data?.vibe === 'string' ? data.vibe : '',
    suggestions: Array.isArray(data?.suggestions)
      ? data.suggestions.filter((s: Suggestion) => s?.name && s?.why)
      : [],
    fetchedAt: Date.now(),
  }
  saveSuggestions(out)
  return out
}

type State =
  | { kind: 'idle' }
  | { kind: 'denied' }
  | { kind: 'loading' }
  | { kind: 'ready'; weather: Weather; location: Location; suggestions: Suggestions | null }
  | { kind: 'error'; message: string }

export default function LocalToday() {
  const [state, setState] = useState<State>(() => {
    const loc = loadCachedLocation()
    const weather = loadCachedWeather()
    const suggestions = loadCachedSuggestions()
    if (loc && weather) {
      return { kind: 'ready', weather, location: loc, suggestions }
    }
    return { kind: 'idle' }
  })

  // If we have cached location+weather but no suggestions, fetch them in background
  useEffect(() => {
    if (state.kind !== 'ready' || state.suggestions) return
    let active = true
    fetchSuggestions(state.weather, state.location)
      .then((s) => {
        if (!active) return
        setState({
          kind: 'ready',
          weather: state.weather,
          location: state.location,
          suggestions: s,
        })
      })
      .catch(() => {
        // suggestions are non-critical
      })
    return () => {
      active = false
    }
  }, [state])

  async function enable() {
    setState({ kind: 'loading' })
    try {
      const location = await getLocation()
      const weather = await fetchWeather(location)
      let suggestions: Suggestions | null = null
      try {
        suggestions = await fetchSuggestions(weather, location)
      } catch {
        // suggestions are best-effort
      }
      setState({ kind: 'ready', weather, location, suggestions })
    } catch (err) {
      const msg =
        err instanceof GeolocationPositionError
          ? err.code === 1
            ? 'Location permission denied'
            : 'Could not get your location'
          : err instanceof Error
            ? err.message
            : 'Unknown error'
      setState({
        kind: msg.toLowerCase().includes('denied') ? 'denied' : 'error',
        message: msg,
      } as State)
    }
  }

  if (state.kind === 'idle') {
    return (
      <div className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-black/5">
        <div className="flex items-start gap-3 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-xl">
            🌤️
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold text-slate-900">
              Weather & where to go
            </p>
            <p className="text-[12px] leading-snug text-slate-500">
              Enable location to see your local weather and three places worth going today.
            </p>
          </div>
        </div>
        <button
          onClick={enable}
          className="w-full border-t border-slate-100 bg-slate-50 px-4 py-2.5 text-[13px] font-bold uppercase tracking-[0.14em] text-amber-700 press hover:bg-slate-100"
        >
          Enable location
        </button>
      </div>
    )
  }

  if (state.kind === 'loading') {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card ring-1 ring-black/5">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-amber-400 [animation-delay:0ms]" />
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-amber-400 [animation-delay:150ms]" />
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-amber-400 [animation-delay:300ms]" />
        <span className="text-[13px] text-slate-500">
          Reading the day…
        </span>
      </div>
    )
  }

  if (state.kind === 'denied' || state.kind === 'error') {
    return (
      <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-black/5">
        <p className="text-[13px] text-slate-600">
          {state.kind === 'denied'
            ? "Location's off — that's fine."
            : `Couldn't load: ${'message' in state ? state.message : 'unknown'}`}
        </p>
        <button
          onClick={enable}
          className="mt-2 text-[12px] font-semibold uppercase tracking-wider text-amber-700 hover:text-amber-900"
        >
          Try again
        </button>
      </div>
    )
  }

  // ready
  const { weather, location, suggestions } = state
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-black/5">
      <div className="flex items-center gap-3 bg-gradient-to-br from-amber-50 via-rose-50 to-sky-50 px-4 py-3">
        <span className="text-3xl">{weather.emoji}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[18px] font-bold text-slate-900">
            {weather.tempF}°F · {weather.condition}
          </p>
          {location.city && (
            <p className="text-[12px] text-slate-500">{location.city}</p>
          )}
        </div>
      </div>
      {suggestions ? (
        suggestions.suggestions.length > 0 ? (
          <div className="px-4 py-3">
            {suggestions.vibe && (
              <p className="mb-2 font-display text-[14px] italic text-slate-600">
                {suggestions.vibe}
              </p>
            )}
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
              Today might be good for
            </p>
            <ul className="mt-2 flex flex-col gap-2">
              {suggestions.suggestions.map((s, i) => (
                <li key={i} className="rounded-lg bg-slate-50 px-3 py-2">
                  <p className="text-[13px] font-semibold text-slate-900">
                    {s.name}
                  </p>
                  <p className="text-[12px] leading-snug text-slate-600">
                    {s.why}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : null
      ) : (
        <div className="px-4 py-3 text-[12px] text-slate-500">
          Loading suggestions…
        </div>
      )}
    </div>
  )
}
