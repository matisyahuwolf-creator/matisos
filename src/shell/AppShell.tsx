import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { AppEntry } from '../apps'

type InternalApp = Extract<AppEntry, { kind: 'internal' }>

export default function AppShell({
  app,
  children,
}: {
  app: InternalApp
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#f2f2f7] text-slate-900 antialiased">
      <div className="mx-auto max-w-2xl px-4 pt-6 pb-16 sm:px-5">
        <header className="mb-4 flex items-center justify-between px-1">
          <Link
            to="/"
            className="flex items-center gap-1 text-[15px] font-medium text-[#0071e3] press hover:text-[#0064cc] active:opacity-60"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 16 16"
              aria-hidden
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 13L5 8l5-5" />
            </svg>
            matisOS
          </Link>
          <div className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-[10px] bg-gradient-to-br ${app.gradient} text-base shadow-sm`}
            >
              <span>{app.icon}</span>
            </div>
            <span className="text-[15px] font-semibold">{app.name}</span>
          </div>
        </header>

        <div className="mb-5 px-1">
          <h1 className="text-[32px] font-extrabold leading-tight tracking-tight text-slate-900">
            {app.name}
          </h1>
          <p className="mt-1 font-display text-[16px] italic leading-snug text-slate-600">
            {app.tagline}
          </p>
        </div>

        <main className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-black/5">
          {children}
        </main>
      </div>
    </div>
  )
}
