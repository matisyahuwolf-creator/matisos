import { useState } from 'react'
import { sefirot } from './sefirot'
import SefirotMeditation from './SefirotMeditation'

export default function Pardes() {
  const [running, setRunning] = useState(false)

  const totalMin = Math.round((sefirot.length * 60) / 60)

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-orange-500 p-6 text-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)]">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/85">
          Sefirot Meditation
        </p>
        <h2 className="mt-2 text-4xl font-extrabold tracking-tight">
          פַּרְדֵּס
        </h2>
        <p className="mt-2 text-base leading-relaxed text-white/90">
          A {totalMin}-minute journey through the ten Sefirot. Hebrew, color,
          and breath drawn from Kabbalistic tradition.
        </p>
        <button
          onClick={() => setRunning(true)}
          className="mt-5 w-full rounded-xl bg-white px-4 py-3 text-[15px] font-bold text-slate-900 shadow transition hover:bg-white/90"
        >
          ▶ Enter the orchard
        </button>
      </div>

      <section>
        <h3 className="mb-3 px-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
          What you'll move through
        </h3>
        <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
          {sefirot.map((s, i) => (
            <div
              key={s.id}
              className={`flex items-center gap-3 px-4 py-3 ${
                i < sefirot.length - 1 ? 'border-b border-slate-100' : ''
              }`}
            >
              <div
                className={`h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br ${s.bgGradient} ring-1 ring-black/5`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <p className="text-[16px] font-bold text-slate-900">
                    {s.hebrew}
                  </p>
                  <p className="text-[14px] font-semibold text-slate-700">
                    {s.transliteration}
                  </p>
                </div>
                <p className="truncate text-[12px] text-slate-500">
                  {s.attribute}
                </p>
              </div>
              <span className="shrink-0 text-[11px] text-slate-400">
                1 min
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl bg-slate-50 px-4 py-3 text-[12px] leading-relaxed text-slate-600">
        Draws from Sefer Yetzirah and the lineage of Lurianic Kabbalah.
        Approach it lightly — as practice, not prescription. Find a quiet place.
        Sit. Let the colors and the letters do their work.
      </section>

      {running && <SefirotMeditation onClose={() => setRunning(false)} />}
    </div>
  )
}
