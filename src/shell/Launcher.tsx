import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { apps, type AppEntry } from '../apps'

function timeOfDayGreeting() {
  const h = new Date().getHours()
  if (h < 5) return 'Up late'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 21) return 'Good evening'
  return 'Good evening'
}

function dateLabel() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
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

function pickToday(): AppEntry {
  const recent = loadRecentSlug()
  if (recent) {
    const found = apps.find(
      (a) =>
        a.kind === 'internal' && a.slug === recent && a.status === 'live',
    )
    if (found) return found
  }
  return (
    apps.find((a) => a.kind === 'internal' && a.status === 'live') ?? apps[0]
  )
}

function AppLink({
  app,
  className,
  children,
  onClick,
}: {
  app: AppEntry
  className: string
  children: ReactNode
  onClick?: () => void
}) {
  if (!isOpenable(app)) {
    return <div className={className}>{children}</div>
  }
  if (app.kind === 'external') {
    return (
      <a
        href={app.url}
        target="_blank"
        rel="noreferrer"
        className={className}
        onClick={onClick}
      >
        {children}
      </a>
    )
  }
  return (
    <Link to={`/apps/${app.slug}`} className={className} onClick={onClick}>
      {children}
    </Link>
  )
}

function categoryTone(category: string): { bg: string; text: string } {
  switch (category) {
    case 'Wellness':
      return { bg: 'bg-emerald-100', text: 'text-emerald-700' }
    case 'Tools':
      return { bg: 'bg-amber-100', text: 'text-amber-700' }
    case 'Meta':
      return { bg: 'bg-slate-100', text: 'text-slate-600' }
    default:
      return { bg: 'bg-slate-100', text: 'text-slate-600' }
  }
}

export default function Launcher() {
  const today = useMemo(pickToday, [])
  const [query, setQuery] = useState('')

  const liveApps = apps.filter((a) => a.status === 'live')
  const filteredApps = liveApps.filter(
    (a) =>
      !query.trim() ||
      a.name.toLowerCase().includes(query.toLowerCase()) ||
      a.tagline.toLowerCase().includes(query.toLowerCase()) ||
      a.category.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className="mx-auto max-w-3xl px-5 pt-8 pb-16 sm:px-6 sm:pt-12">
      <header
        className="mb-7 animate-fade-up px-1"
        style={{ animationDelay: '0ms' }}
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-700">
          {dateLabel()}
        </p>
        <h1 className="mt-1 text-[40px] font-extrabold leading-[1.05] tracking-tight text-slate-900 sm:text-[52px]">
          {timeOfDayGreeting()},{' '}
          <span className="font-display italic font-medium hg-gold-text">
            matis
          </span>
          .
        </h1>
        <p className="mt-3 max-w-md text-[15px] leading-relaxed text-slate-600 sm:text-[16px]">
          Pick something nourishing. Everything you're building lives here.
        </p>
      </header>

      <section
        className="mb-8 animate-fade-up"
        style={{ animationDelay: '80ms' }}
      >
        <p className="mb-3 px-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
          {loadRecentSlug() ? 'Where you left off' : 'Featured today'}
        </p>
        <TodayCard app={today} />
      </section>

      <section
        className="animate-fade-up"
        style={{ animationDelay: '180ms' }}
      >
        <div className="mb-4 flex items-baseline justify-between px-1">
          <h2 className="text-[24px] font-bold tracking-tight text-slate-900 sm:text-[28px]">
            All apps
          </h2>
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
            {liveApps.length} live
          </span>
        </div>

        <div className="mb-5 px-1">
          <label className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-2.5 shadow-card ring-1 ring-black/5">
            <svg
              width="15"
              height="15"
              viewBox="0 0 16 16"
              className="text-slate-400"
              aria-hidden
            >
              <path
                fill="currentColor"
                d="M11.74 10.34l3.46 3.46-1.41 1.41-3.46-3.46a6 6 0 1 1 1.41-1.41zM6.5 11A4.5 4.5 0 1 0 6.5 2a4.5 4.5 0 0 0 0 9z"
              />
            </svg>
            <input
              type="search"
              placeholder="Search apps"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-[14px] text-slate-900 outline-none placeholder:text-slate-400"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filteredApps.map((app) => (
            <AppCard key={app.name} app={app} />
          ))}
          {filteredApps.length === 0 && (
            <p className="col-span-full text-center text-[13px] text-slate-500">
              Nothing matches "{query}".
            </p>
          )}
        </div>
      </section>

      <footer className="mt-14 flex items-center justify-between border-t border-amber-900/15 px-1 pt-5 text-[11px] uppercase tracking-[0.16em] text-slate-500">
        <span className="font-display text-[13px] italic normal-case tracking-normal text-slate-600">
          matis · {new Date().getFullYear()}
        </span>
        <span>matisOS</span>
      </footer>
    </div>
  )
}

function TodayCard({ app }: { app: AppEntry }) {
  const openable = isOpenable(app)
  function handleClick() {
    if (app.kind === 'internal' && openable) {
      try {
        localStorage.setItem(RECENT_KEY, app.slug)
      } catch {
        // ignored
      }
    }
  }
  return (
    <AppLink
      app={app}
      onClick={handleClick}
      className={`psychedelic-shimmer group relative block overflow-hidden rounded-[22px] bg-gradient-to-br ${app.gradient} shadow-hero press ${
        openable
          ? 'hover:-translate-y-0.5 active:scale-[0.99] active:translate-y-0'
          : ''
      }`}
    >
      <div className="flex min-h-[200px] flex-col p-5 sm:min-h-[220px] sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <span className="text-[44px] leading-none drop-shadow-lg sm:text-[54px]">
            {app.icon}
          </span>
          <span className="shrink-0 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
            {app.category}
          </span>
        </div>
        <div className="mt-4 flex-1">
          <h3 className="text-[28px] font-bold leading-tight tracking-tight text-white sm:text-[32px]">
            {app.name}
          </h3>
          <p className="mt-2 max-w-md font-display text-[15px] italic leading-snug text-white/95 sm:text-[17px]">
            {app.tagline}
          </p>
        </div>
        <div className="mt-5 flex items-center justify-between rounded-xl bg-white/95 px-4 py-2.5 text-[13px] font-bold uppercase tracking-[0.14em] text-slate-900">
          <span>Open</span>
          <span className="text-base">→</span>
        </div>
      </div>
    </AppLink>
  )
}

function AppCard({ app }: { app: AppEntry }) {
  const openable = isOpenable(app)
  const tone = categoryTone(app.category)
  function handleClick() {
    if (app.kind === 'internal' && openable) {
      try {
        localStorage.setItem(RECENT_KEY, app.slug)
      } catch {
        // ignored
      }
    }
  }
  return (
    <AppLink
      app={app}
      onClick={handleClick}
      className={`group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-card press ring-1 ring-black/5 ${
        openable
          ? 'hover:-translate-y-0.5 hover:shadow-card-hover active:scale-[0.99]'
          : 'opacity-60'
      }`}
    >
      <div
        className={`relative flex h-28 items-center justify-center bg-gradient-to-br ${app.gradient}`}
      >
        <span className="text-[44px] drop-shadow-md">{app.icon}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-[18px] font-bold leading-tight text-slate-900">
            {app.name}
          </h3>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tone.bg} ${tone.text}`}
          >
            {app.category}
          </span>
        </div>
        <p className="font-display text-[14px] italic leading-snug text-slate-600">
          {app.tagline}
        </p>
        <p className="mt-auto text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-400 group-hover:text-slate-700">
          Open →
        </p>
      </div>
    </AppLink>
  )
}
