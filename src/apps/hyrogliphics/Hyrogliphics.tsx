import { useState } from 'react'
import Landing from './Landing'

export default function Hyrogliphics() {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#15110b] via-[#1a1612] to-[#0d0b08] p-6 text-[#e8dcc4] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.4)] ring-1 ring-[#c9a14a]/20">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#c9a14a]">
          AI school · landing site
        </p>
        <h2 className="mt-2 font-display text-[40px] font-semibold tracking-tight">
          <span style={{
            backgroundImage: 'linear-gradient(100deg, #8b6914, #c9a14a 40%, #f3deaa 50%, #c9a14a 60%, #8b6914)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}>
            hyrogliphics
          </span>
        </h2>
        <p className="mt-2 font-display text-[15px] italic leading-relaxed text-[#c9bf9d]">
          Decode the language of intelligence.
        </p>
        <p className="mt-3 text-[13px] leading-relaxed text-[#c9bf9d]/85">
          A landing page for an AI school. Three paths — Initiate, Practitioner,
          Adept — taught from the same alphabet.
        </p>
        <button
          onClick={() => setOpen(true)}
          className="mt-5 w-full rounded-xl bg-gradient-to-b from-[#e8c878] to-[#c9a14a] px-4 py-3 text-[15px] font-bold text-[#1a1208] shadow-[0_0_0_1px_rgba(243,222,170,0.3)] transition hover:from-[#f3deaa] hover:to-[#d4b25a]"
        >
          𓋹  View the landing page
        </button>
      </div>

      <section>
        <h3 className="mb-3 px-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
          What's on the page
        </h3>
        <ul className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
          {[
            { glyph: '𓇳', title: 'Hero', note: 'Wordmark, tagline, glyph scroller' },
            { glyph: '𓂀', title: 'Manifesto', note: '"AI is the new wall."' },
            { glyph: '𓊽', title: 'Three paths', note: 'Initiate / Practitioner / Adept' },
            { glyph: '𓋹', title: 'Curriculum', note: 'Six chapters of the alphabet' },
            { glyph: '𓆣', title: 'Method', note: 'Read · Write · Build' },
            { glyph: '𓁹', title: 'Waitlist', note: 'Cohort signup' },
          ].map((row, i, arr) => (
            <li
              key={row.title}
              className={`flex items-center gap-3 px-4 py-3 ${
                i < arr.length - 1 ? 'border-b border-slate-100' : ''
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1a1612] to-[#0d0b08] text-[18px] text-[#c9a14a] ring-1 ring-[#c9a14a]/30">
                {row.glyph}
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
        First draft of a landing page for an AI education brand. Dark stone,
        gold leaf, hieroglyph motifs — ancient-meets-future. Tap above to view
        it fullscreen.
      </section>

      {open && <Landing onClose={() => setOpen(false)} />}
    </div>
  )
}
