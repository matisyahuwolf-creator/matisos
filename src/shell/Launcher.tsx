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

function AppLink({
  app,
  className,
  children,
}: {
  app: AppEntry
  className: string
  children: ReactNode
}) {
  if (!isOpenable(app)) {
    return <div className={className}>{children}</div>
  }
  if (app.kind === 'external') {
    return (
      <a href={app.url} target="_blank" rel="noreferrer" className={className}>
        {children}
      </a>
    )
  }
  return (
    <Link to={`/apps/${app.slug}`} className={className}>
      {children}
    </Link>
  )
}

function pickFeatured(): AppEntry {
  // Prefer internal app, first live one
  const internal = apps.find(
    (a) => a.kind === 'internal' && a.status === 'live',
  )
  return internal ?? apps[0]
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
  return pickFeatured()
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
    <div className="relative min-h-screen overflow-hidden text-slate-100">
      <Wallpaper />

      <div className="relative mx-auto max-w-3xl px-5 pt-12 pb-16 sm:px-6 sm:pt-16">
        <header
          className="mb-8 animate-fade-up"
          style={{ animationDelay: '0ms' }}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/55">
            {dateLabel()}
          </p>
          <h1 className="mt-1 font-display text-[44px] italic font-medium leading-[1.04] tracking-tight text-white sm:text-[60px]">
            {timeOfDayGreeting()}, <span className="hg-gold-text">matis</span>.
          </h1>
          <p className="mt-3 max-w-md font-display text-[16px] italic leading-snug text-white/65 sm:text-[18px]">
            A home for everything you're building. Pick what calls.
          </p>
        </header>

        <section
          className="mb-10 animate-fade-up"
          style={{ animationDelay: '80ms' }}
        >
          <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">
            For you · {loadRecentSlug() ? 'where you left off' : 'featured'}
          </p>
          <TodayCard app={today} />
        </section>

        <section
          className="animate-fade-up"
          style={{ animationDelay: '180ms' }}
        >
          <div className="mb-4 flex items-baseline justify-between px-1">
            <h2 className="font-display text-[24px] italic font-medium leading-none tracking-tight text-white sm:text-[28px]">
              All apps
            </h2>
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/45">
              {liveApps.length} live
            </span>
          </div>

          <div className="mb-5 px-1">
            <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-3.5 py-2.5 backdrop-blur">
              <svg
                width="15"
                height="15"
                viewBox="0 0 16 16"
                className="text-white/55"
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
                className="flex-1 bg-transparent text-[14px] text-white outline-none placeholder:text-white/50"
              />
            </label>
          </div>

          <div className="grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4">
            {filteredApps.map((app) => (
              <IconTile key={app.name} app={app} />
            ))}
            {filteredApps.length === 0 && (
              <p className="col-span-full text-center text-[13px] text-white/55">
                Nothing matches "{query}".
              </p>
            )}
          </div>
        </section>

        <footer className="mt-14 flex items-center justify-between border-t border-white/10 px-1 pt-5 text-[11px] uppercase tracking-[0.16em] text-white/40">
          <span className="font-display text-[13px] italic normal-case tracking-normal text-white/55">
            matis · {new Date().getFullYear()}
          </span>
          <span>matisOS</span>
        </footer>
      </div>
    </div>
  )
}

function Wallpaper() {
  return (
    <>
      <div className="fixed inset-0 -z-10 bg-[#0a0612]" />
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-90"
        style={{
          backgroundImage: `
            radial-gradient(at 18% 22%, rgba(124, 92, 255, 0.38), transparent 50%),
            radial-gradient(at 82% 18%, rgba(217, 70, 239, 0.32), transparent 50%),
            radial-gradient(at 50% 95%, rgba(245, 158, 11, 0.22), transparent 55%),
            radial-gradient(at 92% 78%, rgba(6, 182, 212, 0.22), transparent 50%)
          `,
          animation: 'pardesShift 32s ease-in-out infinite',
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 50%, transparent 0%, rgba(10,6,18,0.45) 100%)',
        }}
      />
    </>
  )
}

function TodayCard({ app }: { app: AppEntry }) {
  const openable = isOpenable(app)
  return (
    <AppLink
      app={app}
      className={`psychedelic-shimmer group relative block overflow-hidden rounded-[24px] bg-gradient-to-br ${app.gradient} shadow-hero press ${
        openable
          ? 'hover:-translate-y-0.5 active:scale-[0.99] active:translate-y-0'
          : ''
      }`}
    >
      <div className="flex min-h-[200px] flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <span className="text-[42px] leading-none drop-shadow-lg sm:text-[52px]">
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
        <div className="mt-5 flex items-center justify-between rounded-xl bg-white/15 px-3.5 py-2.5 text-[12px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur">
          <span>Open</span>
          <span className="text-base">→</span>
        </div>
      </div>
    </AppLink>
  )
}

function IconTile({ app }: { app: AppEntry }) {
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
      className="group flex flex-col items-center gap-2"
    >
      <div
        onClick={handleClick}
        className={`relative flex h-[72px] w-[72px] items-center justify-center rounded-[20px] bg-gradient-to-br ${app.gradient} text-[34px] shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.1)_inset] transition-transform duration-200 group-hover:-translate-y-0.5 group-active:scale-[0.95] sm:h-[80px] sm:w-[80px] sm:text-[38px] ${
          !openable ? 'opacity-50 grayscale' : ''
        }`}
      >
        <span className="drop-shadow-md">{app.icon}</span>
      </div>
      <div className="text-center">
        <p className="text-[12px] font-semibold text-white sm:text-[13px]">
          {app.name}
        </p>
        <p className="text-[10px] uppercase tracking-wider text-white/45">
          {app.category}
        </p>
      </div>
    </AppLink>
  )
}
