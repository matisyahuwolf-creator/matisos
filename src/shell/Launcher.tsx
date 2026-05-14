import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apps, type AppEntry } from '../apps'
import {
  fetchWeather,
  getLocation,
  loadCachedLocation,
  loadCachedWeather,
  type Location,
  type Weather,
} from '../lib/weather'

// Backdrop is a painted scene (public/workshop-backdrop.png, 1448x1086).
// Overlays cover the painted text regions with live, dynamic data.
// Each painted sign on the pegboard is a click hotspot positioned as
// a percentage of the backdrop. Re-measure if backdrop changes.
const ASPECT = 1448 / 1086

type Zone = { top: string; left: string; width: string; height: string }

const TILE_ZONES: Record<string, Zone> = {
  pardes:       { top: '23%', left: '16%', width: '17%', height: '30%' },
  yoga:         { top: '23%', left: '35%', width: '17%', height: '30%' },
  initiation:   { top: '23%', left: '53%', width: '17%', height: '30%' },
  hyrogliphics: { top: '23%', left: '71%', width: '17%', height: '30%' },
  susquehanna:  { top: '54%', left: '19%', width: '19%', height: '24%' },
  scratch:      { top: '54%', left: '42%', width: '16%', height: '24%' },
  source:       { top: '54%', left: '61%', width: '18%', height: '24%' },
}

function zoneKey(app: AppEntry): string {
  return 'slug' in app ? app.slug : app.name.toLowerCase()
}

type Suggestion = { name: string; why: string }
type Suggestions = { vibe: string; suggestions: Suggestion[]; fetchedAt: number }

const SUGGESTIONS_KEY = 'matisos:suggestions'
const SUGGESTIONS_CACHE_MS = 3 * 60 * 60 * 1000

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

function formatDateLabel(d: Date) {
  // "14 MAY 2026"
  return d
    .toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
    .toUpperCase()
}

function formatWeekday(d: Date) {
  return d.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()
}

function ToolZone({
  app,
  zone,
  dimmed,
}: {
  app: AppEntry
  zone: Zone
  dimmed: boolean
}) {
  const base =
    'absolute rounded-md cursor-pointer transition-all duration-200 ' +
    'hover:bg-amber-200/[0.07] ' +
    'hover:shadow-[0_0_40px_8px_rgba(201,161,74,0.25)] ' +
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300'
  const dim = dimmed ? ' bg-[#0d0805]/55 hover:bg-[#0d0805]/35' : ''
  const className = base + dim

  if (app.kind === 'external') {
    return (
      <a
        href={app.url}
        target="_blank"
        rel="noreferrer"
        aria-label={app.name}
        title={app.name}
        className={className}
        style={zone}
      />
    )
  }
  return (
    <Link
      to={`/apps/${app.slug}`}
      aria-label={app.name}
      title={app.name}
      className={className}
      style={zone}
    />
  )
}

export default function Launcher() {
  const liveApps = apps.filter((a) => a.status === 'live')
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [weather, setWeather] = useState<Weather | null>(() => loadCachedWeather())
  const [location, setLocation] = useState<Location | null>(() => loadCachedLocation())
  const [suggestions, setSuggestions] = useState<Suggestions | null>(() =>
    loadCachedSuggestions(),
  )

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        let loc = location
        let w = weather
        if (!loc) {
          loc = await getLocation()
          if (cancelled) return
          setLocation(loc)
        }
        if (!w && loc) {
          w = await fetchWeather(loc)
          if (cancelled) return
          setWeather(w)
        }
        if (!suggestions && loc && w) {
          const s = await fetchSuggestions(w, loc)
          if (cancelled) return
          setSuggestions(s)
        }
      } catch {
        // permission denied or network error — painted defaults remain visible
      }
    }
    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const now = new Date()
  const dateLabel = formatDateLabel(now)
  const weekday = formatWeekday(now)

  const matchedSlugs = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return null
    const matches = new Set<string>()
    for (const a of liveApps) {
      if (
        a.name.toLowerCase().includes(q) ||
        a.tagline.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      ) {
        matches.add(zoneKey(a))
      }
    }
    return matches
  }, [query, liveApps])

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault()
    if (!matchedSlugs || matchedSlugs.size === 0) return
    const first = liveApps.find((a) => matchedSlugs.has(zoneKey(a)))
    if (!first) return
    if (first.kind === 'external') {
      window.open(first.url, '_blank', 'noreferrer')
    } else {
      navigate(`/apps/${first.slug}`)
    }
  }

  // Three suggestions, padded to three slots so layout is stable.
  const suggestionSlots: (Suggestion | null)[] = [0, 1, 2].map(
    (i) => suggestions?.suggestions[i] ?? null,
  )

  return (
    <div className="fixed inset-0 grid place-items-center overflow-auto bg-[#0d0805]">
      <div
        className="relative"
        style={{
          width: `min(100vw, calc(100vh * ${ASPECT}))`,
          aspectRatio: String(ASPECT),
          containerType: 'inline-size',
        }}
      >
        <img
          src="/workshop-backdrop.png"
          alt=""
          className="absolute inset-0 h-full w-full select-none"
          draggable={false}
        />

        {/* Date plaque overlay (top-left) */}
        <div
          className="absolute flex flex-col items-center justify-center text-center"
          style={{ top: '1.6%', left: '9.5%', width: '13%', height: '5.5%' }}
        >
          <div className="absolute inset-0 rounded-[3px] bg-[#1a120a]" />
          <div
            className="relative font-display font-semibold tracking-[0.18em] text-[#e8dcc4]"
            style={{ fontSize: 'min(1.55cqw, 22px)', lineHeight: 1 }}
          >
            {dateLabel}
          </div>
          <div
            className="relative mt-[0.4%] font-display tracking-[0.3em] text-[#c9a14a]"
            style={{ fontSize: 'min(0.95cqw, 13px)', lineHeight: 1 }}
          >
            {weekday}
          </div>
        </div>

        {/* Search input overlay (top-right brass frame) */}
        <form
          onSubmit={handleSearchSubmit}
          className="absolute"
          style={{ top: '8.7%', left: '57%', width: '27%', height: '4.5%' }}
        >
          <input
            type="search"
            placeholder="find a tool"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="find a tool"
            className="h-full w-full rounded-[3px] bg-[#1a120a] pl-[14%] pr-3 font-display italic text-[#e8dcc4] outline-none placeholder:text-[#c9bf9d]/50"
            style={{ fontSize: 'min(1.4cqw, 20px)' }}
          />
        </form>

        {/* Almanac left side: weather */}
        <div
          className="absolute"
          style={{ top: '82%', left: '12.5%', width: '30%', height: '14%' }}
        >
          <div className="absolute inset-0 rounded-[4px] bg-[#1a120a]" />
          <div className="relative flex h-full items-center gap-3 px-4">
            <span style={{ fontSize: 'min(4.5cqw, 64px)' }}>
              {weather?.emoji ?? '🌤️'}
            </span>
            <div className="flex flex-col leading-none">
              <span
                className="font-display font-semibold text-[#e8dcc4]"
                style={{ fontSize: 'min(4cqw, 56px)', lineHeight: 1 }}
              >
                {weather ? `${weather.tempF}°` : '—'}
              </span>
            </div>
            <div className="flex flex-col justify-center font-display italic text-[#c9bf9d]">
              <span style={{ fontSize: 'min(1.3cqw, 18px)', lineHeight: 1.1 }}>
                {weather ? weather.condition.toLowerCase() : 'reading the day…'}
              </span>
              <span
                className="mt-1 text-[#c9a14a]"
                style={{ fontSize: 'min(1.15cqw, 16px)', lineHeight: 1.1 }}
              >
                {location?.city ? location.city.toLowerCase() : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Three suggestion cards */}
        {suggestionSlots.map((s, i) => (
          <div
            key={i}
            className="absolute flex flex-col items-center justify-center px-2 text-center"
            style={{
              top: '82.5%',
              left: `${45 + i * 14.5}%`,
              width: '13%',
              height: '13%',
            }}
          >
            <div className="absolute inset-0 rounded-[3px] bg-gradient-to-b from-[#e8dcc4] to-[#d4c39a] shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_4px_rgba(0,0,0,0.3)]" />
            {s ? (
              <>
                <div
                  className="relative font-display font-semibold text-[#3a2814]"
                  style={{ fontSize: 'min(1.15cqw, 16px)', lineHeight: 1.1 }}
                >
                  {s.name.toLowerCase()}
                </div>
                <div
                  className="relative mt-1 font-display italic text-[#5a3a1c]"
                  style={{ fontSize: 'min(0.9cqw, 13px)', lineHeight: 1.2 }}
                >
                  {s.why.toLowerCase()}
                </div>
              </>
            ) : (
              <div
                className="relative font-display italic text-[#8a6f3c]/60"
                style={{ fontSize: 'min(0.9cqw, 13px)' }}
              >
                …
              </div>
            )}
          </div>
        ))}

        {/* Tile click hotspots */}
        {liveApps.map((app) => {
          const key = zoneKey(app)
          const zone = TILE_ZONES[key]
          if (!zone) return null
          const dimmed = matchedSlugs !== null && !matchedSlugs.has(key)
          return <ToolZone key={app.name} app={app} zone={zone} dimmed={dimmed} />
        })}
      </div>
    </div>
  )
}
