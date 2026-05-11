import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { apps, type AppEntry } from '../apps'

function todayLabel() {
  return new Date()
    .toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })
    .toUpperCase()
}

function categoryTone(category: string): string {
  switch (category) {
    case 'Wellness':
      return 'bg-emerald-100 text-emerald-700'
    case 'Tools':
      return 'bg-amber-100 text-amber-700'
    case 'Meta':
      return 'bg-slate-100 text-slate-600'
    default:
      return 'bg-slate-100 text-slate-600'
  }
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
      <a
        href={app.url}
        target="_blank"
        rel="noreferrer"
        className={className}
      >
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

function HeroCard({ app }: { app: AppEntry }) {
  const openable = isOpenable(app)
  return (
    <AppLink
      app={app}
      className={`psychedelic-shimmer group relative block overflow-hidden rounded-[24px] bg-gradient-to-br ${app.gradient} shadow-hero press ${
        openable ? 'hover:-translate-y-0.5 active:scale-[0.99] active:translate-y-0' : ''
      }`}
    >
      <div className="flex min-h-[460px] flex-col p-6 sm:p-8">
        <div className="flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/85">
            {app.tagline}
          </p>
          <h2 className="mt-2 text-[40px] font-extrabold leading-[1.05] tracking-tight text-white sm:text-[48px]">
            {app.name}
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-white/90">
            {app.description}
          </p>
        </div>

        <div className="mt-8 flex items-center gap-3 rounded-2xl bg-white/95 p-3 shadow-sm backdrop-blur">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br ${app.gradient} text-2xl shadow-md`}
          >
            <span>{app.icon}</span>
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-[15px] font-semibold text-slate-900">
              {app.name}
            </p>
            <p className="truncate text-xs text-slate-500">{app.tagline}</p>
          </div>
          <span className="rounded-full bg-[#0071e3] px-4 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white">
            {openable ? 'Open' : 'Soon'}
          </span>
        </div>
      </div>
    </AppLink>
  )
}

function AppRow({ app, isLast }: { app: AppEntry; isLast: boolean }) {
  const openable = isOpenable(app)
  return (
    <>
      <AppLink
        app={app}
        className={`flex items-center gap-3 px-4 py-3 press ${
          openable
            ? 'cursor-pointer hover:bg-slate-50 active:bg-slate-100'
            : 'cursor-default opacity-60'
        }`}
      >
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br ${app.gradient} text-[26px] shadow-sm`}
        >
          <span>{app.icon}</span>
        </div>
        <div className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-2">
            <p className="truncate text-[15px] font-semibold text-slate-900">
              {app.name}
            </p>
            <span
              className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${categoryTone(app.category)}`}
            >
              {app.category}
            </span>
          </div>
          <p className="truncate text-[13px] text-slate-500">{app.tagline}</p>
        </div>
        <span
          className={`rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-wide ${
            openable ? 'bg-slate-100 text-[#0071e3]' : 'bg-slate-100 text-slate-400'
          }`}
        >
          {openable ? 'Open' : 'Soon'}
        </span>
      </AppLink>
      {!isLast && <div className="ml-[76px] h-px bg-slate-200/70" />}
    </>
  )
}

export default function Launcher() {
  const [query, setQuery] = useState('')

  const featured = apps[0]
  const restApps = apps.slice(1)

  const filteredRest = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return restApps
    return restApps.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.tagline.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q),
    )
  }, [query, restApps])

  const liveCount = apps.filter((a) => a.status === 'live').length
  const wipCount = apps.filter((a) => a.status === 'wip').length

  return (
    <div className="min-h-screen bg-[#f2f2f7] text-slate-900 antialiased">
      <div className="mx-auto max-w-2xl px-4 pt-8 pb-16 sm:px-5 sm:pt-12">
        <header
          className="mb-8 px-1 animate-fade-up"
          style={{ animationDelay: '0ms' }}
        >
          <p className="ornament text-[11px] font-bold uppercase tracking-[0.22em] text-amber-700/90">
            Personal Toolkit
          </p>
          <h1 className="mt-3 font-display gradient-text text-[64px] italic font-medium leading-[0.95] sm:text-[88px]">
            matisOS
          </h1>
          <p className="mt-4 max-w-md font-display text-[18px] italic leading-snug text-slate-700 sm:text-[20px]">
            A home for everything I'm building. Tools, practices, and the
            occasional experiment.
          </p>
          <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
            {todayLabel()}
          </p>
        </header>

        <section
          className="mb-12 animate-fade-up"
          style={{ animationDelay: '80ms' }}
        >
          <HeroCard app={featured} />
        </section>

        <section
          className="animate-fade-up"
          style={{ animationDelay: '180ms' }}
        >
          <div className="mb-4 flex items-baseline justify-between px-1">
            <h2 className="font-display text-[28px] italic font-medium leading-none tracking-tight text-slate-900 sm:text-[32px]">
              Your Toolkit
            </h2>
            <span className="text-[12px] font-medium uppercase tracking-[0.14em] text-slate-500">
              {apps.length} {apps.length === 1 ? 'app' : 'apps'}
            </span>
          </div>

          <div className="mb-3 px-1">
            <label className="flex items-center gap-2 rounded-xl bg-slate-200/70 px-3 py-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                className="text-slate-500"
                aria-hidden
              >
                <path
                  fill="currentColor"
                  d="M11.74 10.34l3.46 3.46-1.41 1.41-3.46-3.46a6 6 0 1 1 1.41-1.41zM6.5 11A4.5 4.5 0 1 0 6.5 2a4.5 4.5 0 0 0 0 9z"
                />
              </svg>
              <input
                type="search"
                placeholder="Search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-slate-500"
              />
            </label>
          </div>

          <div className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-black/5">
            {filteredRest.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-slate-500">
                No apps match "{query}".
              </p>
            ) : (
              filteredRest.map((app, i) => (
                <AppRow
                  key={app.name}
                  app={app}
                  isLast={i === filteredRest.length - 1}
                />
              ))
            )}
          </div>
        </section>

        <footer className="mt-14 flex items-center justify-between border-t border-amber-900/15 px-1 pt-5 text-[11px] uppercase tracking-[0.16em] text-slate-500">
          <span className="font-display text-[13px] italic normal-case tracking-normal text-slate-600">
            matis · {new Date().getFullYear()}
          </span>
          <span>
            {liveCount} live{wipCount > 0 ? ` · ${wipCount} in progress` : ''}
          </span>
        </footer>
      </div>
    </div>
  )
}
