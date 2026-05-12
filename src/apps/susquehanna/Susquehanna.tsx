import { useState } from 'react'
import Landing from './Landing'

export default function Susquehanna() {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      {/* Preview hero card */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 text-[#221d16] shadow-[0_10px_30px_-10px_rgba(46,82,94,0.35)] ring-1 ring-[#4a7c8c]/15"
        style={{ background: 'linear-gradient(160deg, #f5efe1 0%, #ede4d0 60%, #cddbe0 100%)' }}
      >
        {/* topographic overlay */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-20"
          viewBox="0 0 400 200"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden
        >
          <g fill="none" stroke="#3b6877" strokeWidth="0.6">
            <path d="M-20 80 Q60 50 140 80 T300 80 T460 80" />
            <path d="M-20 100 Q70 70 150 100 T310 100 T470 100" />
            <path d="M-20 120 Q80 90 160 120 T320 120 T480 120" />
            <path d="M-20 140 Q90 110 170 140 T330 140 T490 140" />
            <path d="M-20 160 Q100 130 180 160 T340 160 T500 160" />
          </g>
        </svg>

        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#5f7549]">
            AI for NEPA · landing site
          </p>
          <h2
            className="mt-2 text-[40px] font-medium leading-[1.02] tracking-tight text-[#221d16]"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Susquehanna
          </h2>
          <p
            className="mt-2 text-[15px] italic leading-relaxed text-[#3b6877]"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            AI that flows with the work already here.
          </p>
          <p className="mt-3 text-[13px] leading-relaxed text-[#3b3528]/85">
            Landing page for an AI integrations company serving the small
            businesses of Northeastern Pennsylvania &mdash; starting with local
            restaurants. Modern websites + customer-service chatbots.
          </p>

          {/* river wave accent */}
          <svg
            viewBox="0 0 300 18"
            className="my-5 w-full"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              d="M0 9 Q30 2 60 9 T120 9 T180 9 T240 9 T300 9"
              fill="none"
              stroke="#3b6877"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M0 14 Q30 9 60 14 T120 14 T180 14 T240 14 T300 14"
              fill="none"
              stroke="#7a9162"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.7"
            />
          </svg>

          <button
            onClick={() => setOpen(true)}
            className="w-full rounded-xl bg-gradient-to-b from-[#3b6877] to-[#2e525e] px-4 py-3 text-[15px] font-semibold text-[#f5efe1] shadow-[0_0_0_1px_rgba(58,104,119,0.3)] transition hover:from-[#4a7c8c] hover:to-[#3b6877]"
          >
            View the landing page
          </button>
        </div>
      </div>

      {/* What's on the page */}
      <section>
        <h3 className="mb-3 px-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
          What's on the page
        </h3>
        <ul className="space-y-2.5 px-1 text-[14px] leading-relaxed text-slate-700">
          <li className="flex items-start gap-2.5">
            <span className="mt-2 inline-block h-px w-3 bg-[#3b6877]" />
            <span>
              <span className="font-semibold text-slate-900">Hero</span> with a
              live restaurant scenario card — Friday dinner rush, AI books a
              table in 12 seconds.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-2 inline-block h-px w-3 bg-[#3b6877]" />
            <span>
              <span className="font-semibold text-slate-900">
                Regional mission
              </span>{' '}
              — building an AI infrastructure for NEPA small business, not
              selling AI <em>to</em> the region from outside.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-2 inline-block h-px w-3 bg-[#3b6877]" />
            <span>
              <span className="font-semibold text-slate-900">Services</span>:
              quiet automation and a never-miss-a-call front desk, with the
              approach in three steps (Listen / Build / Tend).
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-2 inline-block h-px w-3 bg-[#3b6877]" />
            <span>
              <span className="font-semibold text-slate-900">Our plan</span> —
              starting with restaurants. Modern websites + customer-service
              chatbots as the v1 wedge.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-2 inline-block h-px w-3 bg-[#3b6877]" />
            <span>
              <span className="font-semibold text-slate-900">Pilot offer</span>{' '}
              for the first ten NEPA restaurants, plus a contact form.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="mt-2 inline-block h-px w-3 bg-[#5f7549]" />
            <span>
              <span className="font-semibold text-slate-900">
                Live AI assistant
              </span>{' '}
              built into the page itself — answers questions about Susquehanna
              and role-plays as a restaurant chatbot on demand. The product
              demos itself.
            </span>
          </li>
        </ul>
      </section>

      {/* Status */}
      <section>
        <h3 className="mb-3 px-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
          Status
        </h3>
        <div className="rounded-xl bg-slate-50 px-4 py-3 text-[13px] leading-relaxed text-slate-700 ring-1 ring-slate-200">
          Lower priority than matisOS for now. Concept + landing live; first
          restaurant outreach not yet started.
        </div>
      </section>

      {open && <Landing onClose={() => setOpen(false)} />}
    </div>
  )
}
