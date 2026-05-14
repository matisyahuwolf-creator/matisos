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

  // Shared shed-styled shell
  const shell =
    'overflow-hidden rounded-md border border-[#c9a14a]/25 bg-gradient-to-b from-[#1f130a] to-[#15100a] shadow-[inset_0_1px_0_rgba(201,161,74,0.12),0_2px_8px_rgba(0,0,0,0.4)] text-[#e8dcc4]'
  const stencil =
    "font-mono text-[10px] uppercase tracking-[0.22em] text-[#c9a14a]/75 font-bold"

  if (state.kind === 'idle') {
    return (
      <div className={shell}>
        <div className="flex items-start gap-3 p-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#c9a14a]/30 bg-[#0d0805]/60 text-lg">
            🌤
          </span>
          <div className="min-w-0 flex-1">
            <p className={stencil}>the almanac</p>
            <p className="mt-1 text-[12px] leading-snug text-[#c9bf9d]/75">
              Local weather and three places worth going today. Needs your location.
            </p>
          </div>
        </div>
        <button
          onClick={enable}
          className={`${stencil} w-full border-t border-[#c9a14a]/15 bg-[#0d0805]/50 px-4 py-2.5 text-[#c9a14a] transition hover:bg-[#c9a14a]/10 hover:text-[#f3deaa]`}
        >
          Enable location
        </button>
      </div>
    )
  }

  if (state.kind === 'loading') {
    return (
      <div className={`${shell} flex items-center gap-3 p-4`}>
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#c9a14a] [animation-delay:0ms]" />
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#c9a14a] [animation-delay:150ms]" />
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#c9a14a] [animation-delay:300ms]" />
        <span className="text-[12px] text-[#c9bf9d]/75">reading the day…</span>
      </div>
    )
  }

  if (state.kind === 'denied' || state.kind === 'error') {
    return (
      <div className={`${shell} p-4`}>
        <p className="text-[12px] text-[#c9bf9d]/80">
          {state.kind === 'denied'
            ? "Location's off — that's fine."
            : `Couldn't load: ${'message' in state ? state.message : 'unknown'}`}
        </p>
        <button
          onClick={enable}
          className={`${stencil} mt-2 text-[#c9a14a] hover:text-[#f3deaa]`}
        >
          Try again
        </button>
      </div>
    )
  }

  // ready
  const { weather, location, suggestions } = state
  return (
    <div className={shell}>
      <div className="flex items-center gap-3 border-b border-[#c9a14a]/15 px-4 py-3">
        <span className="text-2xl">{weather.emoji}</span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-[20px] font-semibold tracking-tight text-[#f3deaa]">
            {weather.tempF}°F · {weather.condition}
          </p>
          {location.city && (
            <p className={`${stencil} mt-0.5`}>{location.city}</p>
          )}
        </div>
      </div>
      {suggestions ? (
        suggestions.suggestions.length > 0 ? (
          <div className="px-4 py-3">
            {suggestions.vibe && (
              <p className="mb-2 font-display text-[13px] italic text-[#c9bf9d]/85">
                {suggestions.vibe}
              </p>
            )}
            <p className={stencil}>today might be good for</p>
            <ul className="mt-2 flex flex-col gap-1.5">
              {suggestions.suggestions.map((s, i) => (
                <li
                  key={i}
                  className="rounded-md border border-[#c9a14a]/15 bg-[#0d0805]/40 px-3 py-2"
                >
                  <p className="text-[13px] font-semibold text-[#e8dcc4]">
                    {s.name}
                  </p>
                  <p className="text-[12px] leading-snug text-[#c9bf9d]/75">
                    {s.why}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : null
      ) : (
        <div className="px-4 py-3 text-[12px] text-[#c9bf9d]/60">
          Loading suggestions…
        </div>
      )}
    </div>
  )
}
