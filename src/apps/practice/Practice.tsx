import { useState } from 'react'
import Body from './Body'
import Food from './Food'

type DomainKey = 'body' | 'food'

const DOMAINS: { key: DomainKey; label: string; emoji: string }[] = [
  { key: 'body', label: 'Body', emoji: '🌿' },
  { key: 'food', label: 'Food', emoji: '🍳' },
]

const PLANNED: { label: string; emoji: string; stage: string }[] = [
  { label: 'Sleep', emoji: '🌙', stage: 'Stage 2' },
  { label: 'Learning', emoji: '📖', stage: 'Stage 2' },
  { label: 'Relationships', emoji: '🫂', stage: 'Stage 2' },
  { label: 'Finances', emoji: '💰', stage: 'Stage 2' },
  { label: 'Work', emoji: '💼', stage: 'Stage 3' },
  { label: 'Creativity', emoji: '✨', stage: 'Stage 3' },
]

export default function Practice() {
  const [tab, setTab] = useState<DomainKey>('body')

  return (
    <div className="flex flex-col gap-5">
      <header className="px-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-amber-700">
          Your personal initiation
        </p>
        <h1 className="mt-1 font-display text-[28px] italic font-medium leading-tight tracking-tight text-slate-900 sm:text-[32px]">
          The structure of your days.
        </h1>
        <p className="mt-2 max-w-md text-[13px] leading-relaxed text-slate-600">
          Small daily check-ins across the dimensions of a life. Body and Food first; sleep, learning, relationships, finances next; work and creativity after.
        </p>
      </header>

      <div className="flex gap-1 rounded-full bg-slate-200/70 p-1">
        {DOMAINS.map((d) => (
          <button
            key={d.key}
            onClick={() => setTab(d.key)}
            className={`flex-1 rounded-full px-3 py-1.5 text-[13px] font-semibold press ${
              tab === d.key
                ? 'bg-white text-slate-900 shadow-[0_1px_3px_rgba(15,23,42,0.08)]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="mr-1">{d.emoji}</span>
            {d.label}
          </button>
        ))}
      </div>

      {tab === 'body' && <Body />}
      {tab === 'food' && <Food />}

      <section>
        <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
          Coming next
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PLANNED.map((p) => (
            <div
              key={p.label}
              className="flex items-center gap-2 rounded-xl bg-white/60 px-3 py-2 ring-1 ring-black/5"
            >
              <span className="text-lg opacity-60">{p.emoji}</span>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-slate-600">
                  {p.label}
                </p>
                <p className="text-[10px] text-slate-400">{p.stage}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
