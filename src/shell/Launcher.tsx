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
      className={`group relative block overflow-hidden rounded-[22px] bg-gradient-to-br ${app.gradient} shadow-[0_10px_30px_-10px_rgba(0,0,0,0.25)] transition-transform duration-200 ${
        openable ? 'active:scale-[0.99]' : ''
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
        className={`flex items-center gap-3 px-4 py-3 transition ${
          openable ? 'cursor-pointer active:bg-slate-100' : 'cursor-default opacity-60'
        }`}
      >
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br ${app.gradient} text-[26px] shadow-sm`}
        >
          <span>{app.icon}</span>
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="truncate text-[15px] font-semibold text-slate-900">
            {app.name}
          </p>
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
          className="mb-6 px-1 animate-fade-up"
          style={{ animationDelay: '0ms' }}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#ff3b30]">
            {todayLabel()}
          </p>
          <h1 className="mt-1 text-[40px] font-extrabold leading-tight tracking-tight text-slate-900 sm:text-[44px]">
            Today
          </h1>
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
          <div className="mb-3 flex items-baseline justify-between px-1">
            <h2 className="text-[22px] font-bold tracking-tight text-slate-900">
              All Apps
            </h2>
            <span className="text-[13px] text-slate-500">
              {apps.length} total
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

          <div className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.08)] ring-1 ring-black/5">
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

        <footer className="mt-10 px-1 text-[12px] text-slate-400">
          {liveCount} live · {wipCount} in progress
        </footer>
      </div>
    </div>
  )
}
