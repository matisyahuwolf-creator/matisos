import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
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

// Deterministic per-app tilt so tiles hang slightly differently.
function tiltFor(name: string): number {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff
  return ((h % 7) - 3) * 0.55 // ~ -1.65° to +1.65°
}

function isOpenable(app: AppEntry) {
  if (app.status !== 'live') return false
  if (app.kind === 'external') return app.url !== '#'
  return true
}

const RECENT_KEY = 'matisos:recent-app'

function loadRecentSlug(): string | null {
  try {
    return localStorage.getItem(RECENT_KEY)
  } catch {
    return null
  }
}

function rememberApp(app: AppEntry) {
  if (app.kind !== 'internal' || !isOpenable(app)) return
  try {
    localStorage.setItem(RECENT_KEY, app.slug)
  } catch {
    // ignored
  }
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
  onOpen,
  dimmed,
  recent,
}: {
  app: AppEntry
  onOpen: (app: AppEntry) => void
  dimmed: boolean
  recent: boolean
}) {
  const openable = isOpenable(app)
  const tilt = tiltFor(app.name)
  const inner = (
    <div
      className={`ws-tool group block ${openable ? '' : 'opacity-40'} ${
        dimmed ? 'opacity-30 grayscale' : ''
      }`}
    >
      <div style={{ transform: `rotate(${tilt}deg)` }} className="ws-tool-inner flex flex-col items-center">
        {/* brass hooks */}
        <div className="relative z-10 flex h-2.5 w-full items-center justify-center gap-[28%]">
          <span className="ws-hook ws-brass block h-2.5 w-2.5 rounded-full shadow-[inset_0_-1px_0_rgba(0,0,0,0.4),0_1px_2px_rgba(0,0,0,0.6)]" />
          <span className="ws-hook ws-brass block h-2.5 w-2.5 rounded-full shadow-[inset_0_-1px_0_rgba(0,0,0,0.4),0_1px_2px_rgba(0,0,0,0.6)]" />
        </div>
        {/* twine */}
        <div className="relative -mt-1 flex h-5 w-full items-start justify-center gap-[28%] pointer-events-none">
          <span className="block h-4 w-px bg-[#c9a14a]/40" />
          <span className="block h-4 w-px bg-[#c9a14a]/40" />
        </div>
        {/* card */}
        <div className="ws-card relative -mt-2 flex aspect-[4/5] w-full flex-col items-center justify-center overflow-hidden rounded-md px-2 pb-2 pt-3">
          <div
            className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${app.gradient} opacity-[0.14]`}
          />
          {recent && (
            <span
              aria-label="last used"
              className="absolute left-2 top-2 h-1.5 w-1.5 rounded-full bg-[#c9a14a] shadow-[0_0_8px_rgba(201,161,74,0.7)]"
            />
          )}
          <span className="relative font-display text-[44px] leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)] sm:text-[52px]">
            {app.icon}
          </span>
          <p className="relative mt-3 text-center font-display text-[14px] font-semibold leading-tight tracking-tight text-[#2a1a0e] sm:text-[15px]">
            {app.name}
          </p>
          <p className="relative mt-0.5 text-center font-display text-[11px] italic leading-snug text-[#5a3a1c] sm:text-[12px]">
            {app.tagline}
          </p>
        </div>
      </div>
    </div>
  )

  if (!openable) {
    return <div className="ws-tool-wrap">{inner}</div>
  }
  if (app.kind === 'external') {
    return (
      <a
        href={app.url}
        target="_blank"
        rel="noreferrer"
        onClick={() => onOpen(app)}
        className="ws-tool-wrap focus-visible:outline-none"
        aria-label={app.name}
      >
        {inner}
      </a>
    )
  }
  return (
    <Link
      to={`/apps/${app.slug}`}
      onClick={() => onOpen(app)}
      className="ws-tool-wrap focus-visible:outline-none"
      aria-label={app.name}
    >
      {inner}
    </Link>
  )
}

function DatePlaque({ date }: { date: Date }) {
  return (
    <div className="ws-plaque relative flex flex-col items-center justify-center rounded-[4px] px-4 py-2 text-center">
      <span className="ws-stencil text-[12px] text-[#e8dcc4]">{formatDate(date)}</span>
      <span className="ws-stencil mt-1 text-[10px] text-[#c9a14a]">{formatWeekday(date)}</span>
    </div>
  )
}

function SearchBox({
  query,
  setQuery,
  onSubmit,
}: {
  query: string
  setQuery: (q: string) => void
  onSubmit: () => void
}) {
  return (
    <form
      onSubmit={(e: FormEvent) => {
        e.preventDefault()
        onSubmit()
      }}
      className="ws-search relative flex items-center gap-3 rounded-[4px] px-4 py-2.5"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" className="shrink-0 text-[#c9a14a]/70" aria-hidden>
        <path
          fill="currentColor"
          d="M11.74 10.34l3.46 3.46-1.41 1.41-3.46-3.46a6 6 0 1 1 1.41-1.41zM6.5 11A4.5 4.5 0 1 0 6.5 2a4.5 4.5 0 0 0 0 9z"
        />
      </svg>
      <input
        type="search"
        placeholder="find a tool"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="find a tool"
        className="font-display flex-1 bg-transparent text-[14px] italic text-[#e8dcc4] outline-none placeholder:text-[#c9bf9d]/45"
      />
    </form>
  )
}

function Almanac({
  weather,
  location,
  suggestions,
  onEnable,
  state,
}: {
  weather: Weather | null
  location: Location | null
  suggestions: Suggestions | null
  onEnable: () => void
  state: 'idle' | 'loading' | 'ready' | 'denied'
}) {
  const slots: (Suggestion | null)[] = [0, 1, 2].map((i) => suggestions?.suggestions[i] ?? null)
  return (
    <div className="ws-almanac relative rounded-lg p-5 sm:p-6">
      <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:gap-7">
        <div className="flex flex-col">
          <p className="ws-stencil text-[10px] text-[#c9a14a]/75">the almanac</p>
          {state === 'ready' && weather ? (
            <div className="mt-3 flex items-center gap-4">
              <span className="text-[44px] leading-none">{weather.emoji}</span>
              <div>
                <p className="font-display text-[34px] font-semibold leading-none text-[#e8dcc4]">
                  {weather.tempF}°
                </p>
                <p className="font-display mt-1 text-[14px] italic text-[#c9bf9d]/80">
                  {weather.condition.toLowerCase()}
                </p>
                {location?.city && (
                  <p className="font-display mt-0.5 text-[13px] italic text-[#c9a14a]/85">
                    {location.city.toLowerCase()}
                  </p>
                )}
              </div>
            </div>
          ) : state === 'loading' ? (
            <p className="font-display mt-3 text-[14px] italic text-[#c9bf9d]/70">reading the day…</p>
          ) : (
            <button
              onClick={onEnable}
              className="ws-stencil mt-3 self-start rounded-[3px] border border-[#c9a14a]/35 bg-[#0d0805]/50 px-3 py-1.5 text-[10px] text-[#c9a14a] transition hover:bg-[#c9a14a]/10 hover:text-[#f3deaa]"
            >
              {state === 'denied' ? 'enable location' : 'enable location'}
            </button>
          )}
        </div>
        <div className="flex flex-col">
          <p className="ws-stencil text-[10px] text-[#c9a14a]/75">places to go today</p>
          <div className="mt-3 grid grid-cols-3 gap-2.5">
            {slots.map((s, i) => (
              <div
                key={i}
                className="ws-card-mini flex flex-col items-center justify-center rounded-[3px] px-2 py-3 text-center"
              >
                {s ? (
                  <>
                    <p className="font-display text-[13px] font-semibold leading-tight text-[#3a2814]">
                      {s.name.toLowerCase()}
                    </p>
                    <p className="font-display mt-1 text-[11px] italic leading-snug text-[#5a3a1c]">
                      {s.why.toLowerCase()}
                    </p>
                  </>
                ) : (
                  <p className="font-display text-[12px] italic text-[#8a6f3c]/60">…</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Launcher() {
  const navigate = useNavigate()
  const liveApps = apps.filter((a) => a.status === 'live')
  const recentSlug = useMemo(loadRecentSlug, [])

  const [query, setQuery] = useState('')
  const [weather, setWeather] = useState<Weather | null>(() => loadCachedWeather())
  const [location, setLocation] = useState<Location | null>(() => loadCachedLocation())
  const [suggestions, setSuggestions] = useState<Suggestions | null>(() => loadCachedSuggestions())
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'denied'>(() => {
    return loadCachedLocation() && loadCachedWeather() ? 'ready' : 'idle'
  })

  // On mount, if we have cached weather/location but no suggestions, fetch in background.
  useEffect(() => {
    if (state !== 'ready' || suggestions || !weather || !location) return
    let cancelled = false
    fetchSuggestions(weather, location)
      .then((s) => {
        if (!cancelled) setSuggestions(s)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [state, suggestions, weather, location])

  // Auto-prompt for location on mount if we don't have it cached.
  useEffect(() => {
    if (state !== 'idle') return
    enable()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function enable() {
    setState('loading')
    try {
      const loc = await getLocation()
      setLocation(loc)
      const w = await fetchWeather(loc)
      setWeather(w)
      setState('ready')
      try {
        const s = await fetchSuggestions(w, loc)
        setSuggestions(s)
      } catch {
        // non-critical
      }
    } catch (err) {
      const denied =
        err instanceof GeolocationPositionError && err.code === 1
      setState(denied ? 'denied' : 'idle')
    }
  }

  const matchedSlugs = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return null
    const matches = new Set<string>()
    for (const a of liveApps) {
      const key = 'slug' in a ? a.slug : a.name.toLowerCase()
      if (
        a.name.toLowerCase().includes(q) ||
        a.tagline.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      ) {
        matches.add(key)
      }
    }
    return matches
  }, [query, liveApps])

  function openFirstMatch() {
    if (!matchedSlugs || matchedSlugs.size === 0) return
    const first = liveApps.find((a) => {
      const k = 'slug' in a ? a.slug : a.name.toLowerCase()
      return matchedSlugs.has(k)
    })
    if (!first) return
    rememberApp(first)
    if (first.kind === 'external') {
      window.open(first.url, '_blank', 'noreferrer')
    } else {
      navigate(`/apps/${first.slug}`)
    }
  }

  const now = new Date()

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#0d0805] text-[#e8dcc4]">
      <Style />
      <div className="ws-wall pointer-events-none fixed inset-0 -z-20" />
      <div className="ws-grain pointer-events-none fixed inset-0 -z-10 opacity-60" />

      <div className="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-8 sm:pt-12">
        {/* Header */}
        <header className="mb-6 flex flex-wrap items-end justify-between gap-5 sm:mb-8">
          <div className="flex items-center gap-5">
            <DatePlaque date={now} />
            <div>
              <h1 className="font-display text-[46px] font-semibold leading-[0.95] tracking-tight text-[#e8dcc4] sm:text-[60px]">
                matis<span className="text-[#c9a14a]">OS</span>
              </h1>
              <p className="font-display mt-1 text-[16px] italic text-[#c9a14a]/90 sm:text-[18px]">
                the workshop
              </p>
              <p className="font-display mt-1 text-[13px] italic text-[#c9bf9d]/70 sm:text-[14px]">
                What are you reaching for?
              </p>
            </div>
          </div>
          <div className="w-full sm:w-[320px]">
            <SearchBox query={query} setQuery={setQuery} onSubmit={openFirstMatch} />
          </div>
        </header>

        {/* Pegboard */}
        <section className="ws-pegboard relative rounded-2xl p-5 sm:p-9">
          <BrassCorners />
          {liveApps.length === 0 ? (
            <p className="ws-stencil py-16 text-center text-[11px] text-[#c9bf9d]/55">
              no tools yet
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 sm:gap-x-7 sm:gap-y-12 md:grid-cols-4">
              {liveApps.map((app) => {
                const key = 'slug' in app ? app.slug : app.name.toLowerCase()
                const dimmed = matchedSlugs !== null && !matchedSlugs.has(key)
                return (
                  <HangingTile
                    key={app.name}
                    app={app}
                    onOpen={rememberApp}
                    dimmed={dimmed}
                    recent={app.kind === 'internal' && app.slug === recentSlug}
                  />
                )
              })}
            </div>
          )}
        </section>

        {/* Almanac */}
        <section className="mt-7">
          <Almanac
            weather={weather}
            location={location}
            suggestions={suggestions}
            onEnable={enable}
            state={state}
          />
        </section>

        {/* Footer */}
        <footer className="mt-8 flex items-center justify-between px-1">
          <span className="ws-stencil text-[10px] text-[#c9a14a]/55">
            matis · {now.getFullYear()}
          </span>
          <span className="ws-stencil text-[10px] text-[#c9a14a]/55">matisOS</span>
        </footer>
      </div>
    </div>
  )
}

function BrassCorners() {
  return (
    <>
      {(['tl', 'tr', 'bl', 'br'] as const).map((p) => (
        <span
          key={p}
          aria-hidden
          className={
            `ws-brass absolute h-3 w-3 rounded-full shadow-[inset_0_-1px_0_rgba(0,0,0,0.4),0_1px_2px_rgba(0,0,0,0.6)] ` +
            (p === 'tl'
              ? 'left-3 top-3'
              : p === 'tr'
                ? 'right-3 top-3'
                : p === 'bl'
                  ? 'left-3 bottom-3'
                  : 'right-3 bottom-3')
          }
        />
      ))}
    </>
  )
}

function Style(): ReactNode {
  return (
    <style>{`
      .ws-stencil {
        font-family: 'Courier New', ui-monospace, monospace;
        font-weight: 700;
        letter-spacing: 0.18em;
        text-transform: uppercase;
      }
      .ws-wall {
        background:
          radial-gradient(ellipse at 22% -10%, rgba(201,161,74,0.10), transparent 55%),
          radial-gradient(ellipse at 80% 110%, rgba(0,0,0,0.55), transparent 60%),
          linear-gradient(180deg, #2a1a0e 0%, #1a1208 50%, #0d0805 100%);
      }
      .ws-grain {
        background-image:
          repeating-linear-gradient(
            90deg,
            rgba(255,255,255,0.012) 0,
            rgba(255,255,255,0.012) 1px,
            transparent 1px,
            transparent 3px
          ),
          radial-gradient(rgba(0,0,0,0.20) 1px, transparent 1.4px),
          radial-gradient(rgba(255,255,255,0.028) 0.6px, transparent 1px);
        background-size: 100% 100%, 6px 6px, 8px 8px;
        background-position: 0 0, 0 0, 2px 3px;
        mix-blend-mode: overlay;
      }
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
          inset 0 1px 0 rgba(255,255,255,0.05),
          inset 0 -24px 48px rgba(0,0,0,0.55),
          0 8px 28px rgba(0,0,0,0.55);
        border: 2px solid rgba(201,161,74,0.4);
        outline: 1px solid rgba(0,0,0,0.5);
        outline-offset: -4px;
      }
      .ws-plaque {
        background: linear-gradient(180deg, #1a120a 0%, #0d0805 100%);
        border: 1px solid rgba(201,161,74,0.4);
        box-shadow:
          inset 0 1px 0 rgba(201,161,74,0.15),
          0 2px 4px rgba(0,0,0,0.5);
      }
      .ws-search {
        background: linear-gradient(180deg, #1a120a 0%, #0d0805 100%);
        border: 1px solid rgba(201,161,74,0.4);
        box-shadow:
          inset 0 1px 0 rgba(201,161,74,0.12),
          0 2px 6px rgba(0,0,0,0.45);
      }
      .ws-card {
        background:
          radial-gradient(rgba(0,0,0,0.05) 0.5px, transparent 1px),
          linear-gradient(180deg, #e8dcc4 0%, #c9a777 100%);
        background-size: 4px 4px, 100% 100%;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.4),
          inset 0 -2px 0 rgba(0,0,0,0.18),
          0 6px 14px rgba(0,0,0,0.55),
          0 14px 28px rgba(0,0,0,0.35);
        border: 1px solid rgba(90,58,28,0.4);
      }
      .ws-card-mini {
        background:
          radial-gradient(rgba(0,0,0,0.05) 0.5px, transparent 1px),
          linear-gradient(180deg, #e8dcc4 0%, #d4c39a 100%);
        background-size: 3px 3px, 100% 100%;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.4),
          0 2px 4px rgba(0,0,0,0.35);
        border: 1px solid rgba(90,58,28,0.25);
      }
      .ws-almanac {
        background: linear-gradient(180deg, #1f130a 0%, #15100a 100%);
        border: 1px solid rgba(201,161,74,0.28);
        box-shadow:
          inset 0 1px 0 rgba(201,161,74,0.12),
          0 4px 16px rgba(0,0,0,0.45);
      }
      .ws-tool-wrap {
        display: block;
        outline: none;
      }
      .ws-tool {
        transition: transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1), filter 220ms;
        transform-origin: 50% 4px;
      }
      .ws-tool:hover .ws-tool-inner {
        transform: rotate(0deg) translateY(-3px) !important;
      }
      .ws-tool-inner {
        transition: transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
      }
      @keyframes hookGlint {
        0%, 100% { opacity: 0.85; }
        50% { opacity: 1; }
      }
      .ws-hook { animation: hookGlint 4s ease-in-out infinite; }
    `}</style>
  )
}
