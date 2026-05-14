import { useEffect, useMemo, useState, type ReactNode } from 'react'
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

// Painted scene (public/workshop-backdrop.png, 1448x1086) is the
// atmospheric base. Lantern, leather book, drawers, wood texture all
// come from the painted image. Inside the painted pegboard frame we
// cover the painted tiles with our own pegboard-textured panel and
// render a dynamic CSS tile grid on top — so the grid scales to any
// number of apps while keeping the painted atmosphere.
const ASPECT = 1448 / 1086

// Pegboard interior bounds (% of backdrop). Re-measure if backdrop changes.
const PEGBOARD = { top: '17.5%', left: '13.5%', width: '73%', height: '61%' }

// Painted-text regions we override with live data.
const DATE_REGION = { top: '1.6%', left: '9.5%', width: '13%', height: '5.5%' }
const SEARCH_REGION = { top: '8.7%', left: '57%', width: '27%', height: '4.5%' }
const WEATHER_REGION = { top: '82%', left: '12.5%', width: '30%', height: '14%' }
const SUGGESTION_REGIONS = [0, 1, 2].map((i) => ({
  top: '82.5%',
  left: `${45 + i * 14.5}%`,
  width: '13%',
  height: '13%',
}))

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

async function fetchSuggestions(weather: Weather, location: Location): Promise<Suggestions> {
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

function tiltFor(name: string): number {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff
  return ((h % 7) - 3) * 0.5
}

function isOpenable(app: AppEntry) {
  if (app.status !== 'live') return false
  if (app.kind === 'external') return app.url !== '#'
  return true
}

function zoneKey(app: AppEntry): string {
  return 'slug' in app ? app.slug : app.name.toLowerCase()
}

function formatDate(d: Date) {
  return d
    .toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
    .toUpperCase()
}

function formatWeekday(d: Date) {
  return d.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()
}

function HangingTile({
  app,
  dimmed,
}: {
  app: AppEntry
  dimmed: boolean
}) {
  const openable = isOpenable(app)
  const tilt = tiltFor(app.name)

  const inner = (
    <div
      className={
        'ws-tile group block h-full w-full ' +
        (openable ? '' : 'opacity-40 ') +
        (dimmed ? 'opacity-25 grayscale ' : '')
      }
    >
      <div
        style={{ transform: `rotate(${tilt}deg)` }}
        className="ws-tile-inner flex h-full w-full flex-col items-center"
      >
        {/* brass hooks */}
        <div className="relative z-10 flex w-full items-center justify-center gap-[40%]"
             style={{ height: 'min(0.7cqw, 10px)' }}>
          <span className="ws-brass block rounded-full shadow-[inset_0_-1px_0_rgba(0,0,0,0.4),0_1px_2px_rgba(0,0,0,0.6)]"
                style={{ height: 'min(0.7cqw, 10px)', width: 'min(0.7cqw, 10px)' }} />
          <span className="ws-brass block rounded-full shadow-[inset_0_-1px_0_rgba(0,0,0,0.4),0_1px_2px_rgba(0,0,0,0.6)]"
                style={{ height: 'min(0.7cqw, 10px)', width: 'min(0.7cqw, 10px)' }} />
        </div>
        {/* twine */}
        <div className="pointer-events-none relative flex w-full items-start justify-center gap-[40%]"
             style={{ height: 'min(1.2cqw, 16px)', marginTop: '-2px' }}>
          <span className="block w-px bg-[#c9a14a]/50" style={{ height: '100%' }} />
          <span className="block w-px bg-[#c9a14a]/50" style={{ height: '100%' }} />
        </div>
        {/* card */}
        <div className="ws-card relative flex flex-1 w-full flex-col items-center justify-center overflow-hidden rounded-md"
             style={{ marginTop: '-3px', padding: 'min(0.8cqw, 10px)' }}>
          <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${app.gradient} opacity-[0.16]`} />
          <span
            className="relative drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]"
            style={{ fontSize: 'min(3cqw, 44px)', lineHeight: 1 }}
          >
            {app.icon}
          </span>
          <p
            className="relative text-center font-display font-semibold tracking-tight text-[#2a1a0e]"
            style={{ fontSize: 'min(1.05cqw, 15px)', lineHeight: 1.1, marginTop: 'min(0.6cqw, 8px)' }}
          >
            {app.name}
          </p>
          <p
            className="relative text-center font-display italic text-[#5a3a1c]"
            style={{ fontSize: 'min(0.8cqw, 11px)', lineHeight: 1.15, marginTop: '2px' }}
          >
            {app.tagline}
          </p>
        </div>
      </div>
    </div>
  )

  const wrapper =
    'block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 rounded-md'

  if (!openable) {
    return <div className={wrapper}>{inner}</div>
  }
  if (app.kind === 'external') {
    return (
      <a
        href={app.url}
        target="_blank"
        rel="noreferrer"
        aria-label={app.name}
        title={app.name}
        className={wrapper}
      >
        {inner}
      </a>
    )
  }
  return (
    <Link to={`/apps/${app.slug}`} aria-label={app.name} title={app.name} className={wrapper}>
      {inner}
    </Link>
  )
}

export default function Launcher() {
  const navigate = useNavigate()
  const liveApps = apps.filter((a) => a.status === 'live')

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
        // permission denied; painted defaults stay visible underneath
      }
    }
    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const now = new Date()

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

  function handleSearchSubmit(e: React.FormEvent) {
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

  // Choose grid columns based on number of apps so the grid feels intentional.
  const cols = liveApps.length <= 6 ? 3 : liveApps.length <= 10 ? 5 : 4
  const rows = Math.ceil(liveApps.length / cols)

  const suggestionSlots: (Suggestion | null)[] = [0, 1, 2].map(
    (i) => suggestions?.suggestions[i] ?? null,
  )

  return (
    <div className="fixed inset-0 grid place-items-center overflow-auto bg-[#0d0805]">
      <Style />
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

        {/* Dynamic pegboard panel covering the painted tiles */}
        <div className="ws-pegboard absolute" style={PEGBOARD}>
          <div
            className="grid h-full w-full"
            style={{
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gridTemplateRows: `repeat(${rows}, 1fr)`,
              gap: 'min(1.2cqw, 18px)',
              padding: 'min(1.5cqw, 22px)',
              alignContent: 'center',
              justifyContent: 'center',
            }}
          >
            {liveApps.map((app) => {
              const key = zoneKey(app)
              const dimmed = matchedSlugs !== null && !matchedSlugs.has(key)
              return <HangingTile key={app.name} app={app} dimmed={dimmed} />
            })}
          </div>
        </div>

        {/* Date plaque overlay */}
        <div
          className="ws-plaque absolute flex flex-col items-center justify-center rounded-[3px]"
          style={DATE_REGION}
        >
          <div
            className="font-display font-semibold tracking-[0.18em] text-[#e8dcc4]"
            style={{ fontSize: 'min(1.55cqw, 22px)', lineHeight: 1 }}
          >
            {formatDate(now)}
          </div>
          <div
            className="mt-1 font-display tracking-[0.3em] text-[#c9a14a]"
            style={{ fontSize: 'min(0.95cqw, 13px)', lineHeight: 1 }}
          >
            {formatWeekday(now)}
          </div>
        </div>

        {/* Search input overlay */}
        <form
          onSubmit={handleSearchSubmit}
          className="ws-search absolute rounded-[3px]"
          style={SEARCH_REGION}
        >
          <input
            type="search"
            placeholder="find a tool"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="find a tool"
            className="font-display italic h-full w-full bg-transparent pl-[14%] pr-3 text-[#e8dcc4] outline-none placeholder:text-[#c9bf9d]/50"
            style={{ fontSize: 'min(1.4cqw, 20px)' }}
          />
        </form>

        {/* Weather overlay */}
        <div className="ws-almanac-cell absolute rounded-[3px]" style={WEATHER_REGION}>
          <div className="relative flex h-full items-center gap-3 px-4">
            <span style={{ fontSize: 'min(4.5cqw, 64px)' }}>{weather?.emoji ?? '🌤️'}</span>
            <span
              className="font-display font-semibold text-[#e8dcc4]"
              style={{ fontSize: 'min(4cqw, 56px)', lineHeight: 1 }}
            >
              {weather ? `${weather.tempF}°` : '—'}
            </span>
            <div className="flex flex-col justify-center font-display italic text-[#c9bf9d]">
              <span style={{ fontSize: 'min(1.3cqw, 18px)', lineHeight: 1.1 }}>
                {weather ? weather.condition.toLowerCase() : 'reading the day…'}
              </span>
              {location?.city && (
                <span
                  className="mt-1 text-[#c9a14a]"
                  style={{ fontSize: 'min(1.15cqw, 16px)', lineHeight: 1.1 }}
                >
                  {location.city.toLowerCase()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Suggestion overlays */}
        {suggestionSlots.map((s, i) => (
          <div
            key={i}
            className="ws-card-mini absolute flex flex-col items-center justify-center rounded-[3px] px-2 text-center"
            style={SUGGESTION_REGIONS[i]}
          >
            {s ? (
              <>
                <p
                  className="font-display font-semibold text-[#3a2814]"
                  style={{ fontSize: 'min(1.15cqw, 16px)', lineHeight: 1.1 }}
                >
                  {s.name.toLowerCase()}
                </p>
                <p
                  className="mt-1 font-display italic text-[#5a3a1c]"
                  style={{ fontSize: 'min(0.9cqw, 13px)', lineHeight: 1.2 }}
                >
                  {s.why.toLowerCase()}
                </p>
              </>
            ) : (
              <p
                className="font-display italic text-[#8a6f3c]/60"
                style={{ fontSize: 'min(0.9cqw, 13px)' }}
              >
                …
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function Style(): ReactNode {
  return (
    <style>{`
      .ws-brass {
        background-image: linear-gradient(180deg, #f3deaa 0%, #c9a14a 50%, #8b6914 100%);
      }
      .ws-pegboard {
        background-color: #1a1208;
        background-image: radial-gradient(
          circle at center,
          #0a0604 0,
          #0a0604 2.2px,
          transparent 2.4px
        );
        background-size: 28px 28px;
        background-position: 14px 14px;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.04),
          inset 0 -20px 40px rgba(0,0,0,0.55);
        border-radius: 6px;
      }
      .ws-plaque {
        background: linear-gradient(180deg, #1a120a 0%, #0d0805 100%);
        border: 1px solid rgba(201,161,74,0.5);
        box-shadow:
          inset 0 1px 0 rgba(201,161,74,0.15),
          0 1px 2px rgba(0,0,0,0.5);
        text-align: center;
        padding: 0.4rem 0.5rem;
      }
      .ws-search {
        background: linear-gradient(180deg, #1a120a 0%, #0d0805 100%);
        border: 1px solid rgba(201,161,74,0.5);
        box-shadow:
          inset 0 1px 0 rgba(201,161,74,0.15),
          0 1px 2px rgba(0,0,0,0.5);
      }
      .ws-almanac-cell {
        background: linear-gradient(180deg, #1f130a 0%, #15100a 100%);
        border: 1px solid rgba(201,161,74,0.3);
        box-shadow: inset 0 1px 0 rgba(201,161,74,0.12);
      }
      .ws-card {
        background:
          radial-gradient(rgba(0,0,0,0.05) 0.5px, transparent 1px),
          linear-gradient(180deg, #e8dcc4 0%, #c9a777 100%);
        background-size: 4px 4px, 100% 100%;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.4),
          inset 0 -2px 0 rgba(0,0,0,0.18),
          0 5px 12px rgba(0,0,0,0.5),
          0 12px 22px rgba(0,0,0,0.35);
        border: 1px solid rgba(90,58,28,0.4);
      }
      .ws-card-mini {
        background:
          radial-gradient(rgba(0,0,0,0.05) 0.5px, transparent 1px),
          linear-gradient(180deg, #e8dcc4 0%, #d4c39a 100%);
        background-size: 3px 3px, 100% 100%;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.4),
          0 2px 4px rgba(0,0,0,0.4);
        border: 1px solid rgba(90,58,28,0.3);
      }
      .ws-tile {
        transition: transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1), filter 220ms;
      }
      .ws-tile-inner {
        transition: transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
        transform-origin: 50% 4px;
      }
      .ws-tile:hover .ws-tile-inner {
        transform: rotate(0deg) translateY(-2px) !important;
      }
    `}</style>
  )
}
