import { apps, type AppEntry } from './apps'

function AppCard({ app }: { app: AppEntry }) {
  const isLive = app.status === 'live' && app.url !== '#'
  const Wrapper = isLive ? 'a' : 'div'
  return (
    <Wrapper
      {...(isLive ? { href: app.url, target: '_blank', rel: 'noreferrer' } : {})}
      className={`group relative flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition ${
        isLive
          ? 'hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/10'
          : 'opacity-60'
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="text-4xl">{app.icon}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            app.status === 'live'
              ? 'bg-emerald-500/15 text-emerald-300'
              : 'bg-amber-500/15 text-amber-300'
          }`}
        >
          {app.status === 'live' ? 'Live' : 'WIP'}
        </span>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-white">{app.name}</h2>
        <p className="mt-1 text-sm text-white/60">{app.description}</p>
      </div>
    </Wrapper>
  )
}

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <header className="mb-12">
          <p className="text-sm font-medium uppercase tracking-widest text-indigo-300">
            personal launcher
          </p>
          <h1 className="mt-2 text-5xl font-bold tracking-tight">matisOS</h1>
          <p className="mt-3 max-w-xl text-white/60">
            A home for everything I'm building. Click an app to open it.
          </p>
        </header>

        <main className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {apps.map((app) => (
            <AppCard key={app.name} app={app} />
          ))}
        </main>

        <footer className="mt-16 text-sm text-white/40">
          {apps.filter((a) => a.status === 'live').length} live ·{' '}
          {apps.filter((a) => a.status === 'wip').length} in progress
        </footer>
      </div>
    </div>
  )
}

export default App
