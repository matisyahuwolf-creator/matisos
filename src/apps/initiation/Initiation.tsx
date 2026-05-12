import { useState } from 'react'
import Landing from './Landing'

export default function Initiation() {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-2xl border border-[#e8e6df] bg-[#fafaf7] p-6 text-[#0a0a0a] shadow-[0_10px_30px_-12px_rgba(0,0,0,0.15)]">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#6b6b66]">
          AI safety · open research commons
        </p>
        <h2 className="mt-2 flex items-center gap-2 font-display text-[40px] font-medium tracking-tight">
          <span className="text-[24px] leading-none">○</span>
          Initiation
        </h2>
        <p className="mt-2 font-display text-[15px] italic leading-relaxed text-[#3a3a35]">
          A free commons for research into AI safety, consciousness, and the
          meeting of East and West.
        </p>
        <p className="mt-3 text-[13px] leading-relaxed text-[#3a3a35]/85">
          Free, open-source, and unowned. The problem of AI safety is only
          solved by a collective — not by individuals or single labs.
        </p>
        <button
          onClick={() => setOpen(true)}
          className="mt-5 w-full rounded-xl bg-[#0a0a0a] px-4 py-3 text-[15px] font-medium text-[#fafaf7] transition hover:bg-[#1a1a1a]"
        >
          ○  Read the manifesto
        </button>
      </div>

      <section>
        <h3 className="mb-3 px-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
          On the page
        </h3>
        <ul className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
          {[
            { num: '01', title: 'Premise', note: "Jung's East/West split, in every person" },
            { num: '02', title: 'Mission', note: 'Three braided questions' },
            { num: '03', title: 'Work', note: 'Safety · Consciousness · Integration · Quantum' },
            { num: '04', title: 'Commons', note: 'Why free, open-source, unowned' },
            { num: '05', title: 'Invitation', note: 'Read · Contribute · Stay close' },
          ].map((row, i, arr) => (
            <li
              key={row.title}
              className={`flex items-center gap-3 px-4 py-3 ${
                i < arr.length - 1 ? 'border-b border-slate-100' : ''
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0a0a0a] font-display text-[13px] text-[#fafaf7]">
                {row.num}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-bold text-slate-900">{row.title}</p>
                <p className="truncate text-[12px] text-slate-500">{row.note}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl bg-slate-50 px-4 py-3 text-[12px] leading-relaxed text-slate-600">
        Manifesto-first landing page for an open research commons. Restrained
        research-institute aesthetic — paper background, serif headlines, a
        single geometric anchor. Tap above to view fullscreen.
      </section>

      {open && <Landing onClose={() => setOpen(false)} />}
    </div>
  )
}
