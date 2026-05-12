import { useEffect, useState } from 'react'
import ChatWidget from './ChatWidget'

const SCOPED_STYLES = `
  #susq-landing { font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; color: #221d16; }
  #susq-landing .serif { font-family: 'Fraunces', Georgia, serif; font-feature-settings: "ss01" on, "ss02" on; }
  #susq-landing .text-balance { text-wrap: balance; }
  #susq-landing .text-pretty { text-wrap: pretty; }

  #susq-landing .grain {
    background-image:
      radial-gradient(circle at 25% 30%, rgba(74, 124, 140, 0.05) 0%, transparent 40%),
      radial-gradient(circle at 75% 70%, rgba(122, 145, 98, 0.06) 0%, transparent 45%),
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220' viewBox='0 0 220 220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.13 0 0 0 0 0.11 0 0 0 0 0.08 0 0 0 0 0.06 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }

  #susq-landing .topo {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'%3E%3Cg fill='none' stroke='%234a7c8c' stroke-width='0.6' opacity='0.18'%3E%3Cpath d='M-50 200 Q100 140 250 200 T550 200 T850 200'/%3E%3Cpath d='M-50 240 Q120 180 280 240 T580 240 T880 240'/%3E%3Cpath d='M-50 280 Q140 220 300 280 T600 280 T900 280'/%3E%3Cpath d='M-50 320 Q160 260 320 320 T620 320 T920 320'/%3E%3Cpath d='M-50 360 Q180 300 340 360 T640 360 T940 360'/%3E%3Cpath d='M-50 400 Q200 340 360 400 T660 400 T960 400'/%3E%3Cpath d='M-50 440 Q220 380 380 440 T680 440 T980 440'/%3E%3C/g%3E%3C/svg%3E");
    background-size: 600px 600px;
  }

  #susq-landing .underline-grow {
    background-image: linear-gradient(currentColor, currentColor);
    background-size: 0% 1px;
    background-repeat: no-repeat;
    background-position: 0 100%;
    transition: background-size 300ms ease;
  }
  #susq-landing .underline-grow:hover { background-size: 100% 1px; }

  #susq-landing .wave-divider svg { display: block; width: 100%; height: 100%; }

  @keyframes susq-drift { 0%,100% { transform: translateX(0); } 50% { transform: translateX(-12px); } }
  #susq-landing .drift { animation: susq-drift 12s ease-in-out infinite; }

  @keyframes susq-flow-dash { to { stroke-dashoffset: -200; } }
  #susq-landing .flow-line { stroke-dasharray: 6 10; animation: susq-flow-dash 8s linear infinite; }

  #susq-landing .card {
    background: rgba(255, 252, 244, 0.55);
    backdrop-filter: blur(6px);
    border: 1px solid rgba(74, 66, 51, 0.12);
    transition: transform 240ms ease, box-shadow 240ms ease, border-color 240ms ease;
  }
  #susq-landing .card:hover {
    transform: translateY(-2px);
    border-color: rgba(74, 124, 140, 0.4);
    box-shadow: 0 18px 40px -20px rgba(46, 82, 94, 0.25);
  }

  #susq-landing .scenario {
    background: #fffaee;
    border: 1px solid #cdbf9f;
    box-shadow: 0 24px 50px -28px rgba(46, 82, 94, 0.45);
  }

  #susq-landing .btn-primary {
    background: linear-gradient(180deg, #3b6877, #2e525e);
    color: #fffaee;
    border: 1px solid #2e525e;
    transition: transform 180ms ease, box-shadow 180ms ease;
  }
  #susq-landing .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 10px 24px -12px rgba(46, 82, 94, 0.6); }

  #susq-landing .btn-ghost {
    border: 1px solid rgba(34, 29, 22, 0.25);
    color: #221d16;
    transition: border-color 180ms ease, background 180ms ease;
  }
  #susq-landing .btn-ghost:hover { border-color: rgba(34, 29, 22, 0.55); background: rgba(34, 29, 22, 0.04); }

  @keyframes susq-soft-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.45; } }
  #susq-landing .soft-pulse { animation: susq-soft-pulse 2s ease-in-out infinite; }

  #susq-landing .reveal { opacity: 0; transform: translateY(14px); transition: opacity 800ms ease, transform 800ms ease; }
  #susq-landing .reveal.in { opacity: 1; transform: none; }

  #susq-landing { scroll-behavior: smooth; }

  @keyframes susq-bounce {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
    40% { transform: translateY(-4px); opacity: 1; }
  }
`

export default function Landing({ onClose }: { onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const root = document.getElementById('susq-landing')
    if (!root) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12 }
    )
    root.querySelectorAll('.reveal').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  // lock body scroll while overlay is open
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  return (
    <div
      id="susq-landing"
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ background: '#f5efe1' }}
    >
      <style>{SCOPED_STYLES}</style>

      {/* ambient backdrop */}
      <div className="grain pointer-events-none fixed inset-0 -z-10" />

      {/* close button (floating, top-left) */}
      <button
        onClick={onClose}
        className="fixed left-4 top-4 z-[60] inline-flex items-center gap-1.5 rounded-full bg-[#1b2f37]/90 px-4 py-2 text-[13px] font-medium text-[#f5efe1] backdrop-blur-sm transition hover:bg-[#1b2f37]"
        aria-label="Back to matisOS"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13L5 8l5-5" />
        </svg>
        matisOS
      </button>

      {/* nav */}
      <header className="relative z-20">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <a href="#susq-top" className="group flex items-center gap-3">
            <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden>
              <path d="M3 22 Q10 14 18 20 T36 18" fill="none" stroke="#3b6877" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M3 28 Q11 22 19 26 T36 24" fill="none" stroke="#7a9162" strokeWidth="2.4" strokeLinecap="round" opacity="0.85" />
            </svg>
            <span className="serif text-xl font-medium tracking-tight text-[#221d16]">Susquehanna</span>
          </a>
          <div className="hidden items-center gap-9 text-sm text-[#3b3528] md:flex">
            <a href="#susq-services" className="underline-grow">Services</a>
            <a href="#susq-approach" className="underline-grow">Approach</a>
            <a href="#susq-local" className="underline-grow">Local</a>
            <a href="#susq-contact" className="underline-grow">Contact</a>
          </div>
          <a href="#susq-contact" className="btn-primary rounded-full px-4 py-2 text-sm font-medium">
            Start a conversation
          </a>
        </nav>
      </header>

      {/* hero */}
      <section id="susq-top" className="relative z-10">
        <div className="topo absolute inset-0 -z-10 opacity-90" />

        <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-10 px-6 pb-28 pt-20 md:grid-cols-12 md:pb-40 md:pt-28">
          <div className="md:col-span-7">
            <div className="mb-7 flex items-center gap-3">
              <span className="soft-pulse h-1.5 w-1.5 rounded-full bg-[#5f7549]" />
              <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#4a4233]">
                From the banks of the Susquehanna
              </span>
            </div>

            <h1 className="serif text-balance text-5xl font-medium leading-[1.02] tracking-tight text-[#221d16] sm:text-6xl md:text-7xl">
              AI that flows<br />
              with the work<br />
              <em className="not-italic text-[#3b6877]" style={{ fontStyle: 'italic' }}>already here.</em>
            </h1>

            <p className="text-pretty mt-8 max-w-xl text-lg leading-relaxed text-[#3b3528] md:text-xl">
              Susquehanna is building an infrastructure of growth for the small businesses of Northeastern Pennsylvania &mdash; putting frontier AI in the hands of the dental offices, auto shops, salons, restaurants, and family practices that hold this region together. One business at a time, until the whole region is moving forward.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a href="#susq-contact" className="btn-primary inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 font-medium">
                Start a conversation
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
              </a>
              <a href="#susq-services" className="btn-ghost inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 font-medium">
                See what we build
              </a>
            </div>
          </div>

          {/* scenario card */}
          <div className="md:col-span-5 md:pt-6">
            <div className="scenario drift rounded-2xl p-6 md:p-7">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#75694d]">A Friday, dinner rush</span>
                <span className="font-mono text-[11px] text-[#75694d]">7:18 PM</span>
              </div>
              <div className="mt-5 flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#8aaab5] bg-[#cddbe0]">
                  <svg className="h-4 w-4 text-[#3b6877]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                </div>
                <p className="serif text-lg leading-snug text-[#221d16]">
                  The phone rings &mdash; a table of four for 8:30. The hostess is in the weeds.
                </p>
              </div>

              <svg viewBox="0 0 300 30" className="my-5 w-full text-[#4a7c8c]" preserveAspectRatio="none">
                <path d="M0 15 Q40 5 80 15 T160 15 T240 15 T320 15" fill="none" stroke="currentColor" strokeWidth="1.5" className="flow-line" />
              </svg>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#7a9162] bg-[#a8b888]/40">
                  <svg className="h-4 w-4 text-[#465938]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <p className="serif text-lg leading-snug text-[#221d16]">
                  Twelve seconds later, the reservation is on the books and a confirmation text is on its way.
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-[#cdbf9f]/60 pt-5">
                <span className="text-xs text-[#75694d]">No one stops cooking.</span>
                <span className="text-xs font-medium text-[#3b6877]">Table filled.</span>
              </div>
            </div>
          </div>
        </div>

        {/* river wave divider */}
        <div className="wave-divider -mb-1 leading-none">
          <svg viewBox="0 0 1440 90" preserveAspectRatio="none" className="h-[80px] w-full">
            <path d="M0 60 Q180 20 360 50 T720 50 T1080 50 T1440 40 L1440 90 L0 90 Z" fill="#ede4d0" />
            <path d="M0 70 Q180 40 360 60 T720 58 T1080 62 T1440 55" fill="none" stroke="#4a7c8c" strokeWidth="1.2" opacity="0.35" />
            <path d="M0 75 Q180 50 360 68 T720 66 T1080 70 T1440 63" fill="none" stroke="#7a9162" strokeWidth="1" opacity="0.3" />
          </svg>
        </div>
      </section>

      {/* trust strip */}
      <section className="relative z-10 border-y border-[#cdbf9f]/40 bg-[#ede4d0]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-6 py-7 md:flex-row">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#4a4233]">Built for small businesses across NEPA</p>
          <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-[#3b3528]">
            <span className="serif text-base">Restaurants</span>
            <span className="text-[#a89b78]">&bull;</span>
            <span className="serif text-base">Dental practices</span>
            <span className="text-[#a89b78]">&bull;</span>
            <span className="serif text-base">Medical offices</span>
            <span className="text-[#a89b78]">&bull;</span>
            <span className="serif text-base">Auto shops</span>
            <span className="text-[#a89b78]">&bull;</span>
            <span className="serif text-base">Salons &amp; spas</span>
          </div>
        </div>
      </section>

      {/* local / mission */}
      <section id="susq-local" className="relative z-10">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-28 md:grid-cols-12 md:py-36">
          <div className="reveal md:col-span-6">
            <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.22em] text-[#5f7549]">A regional mission</p>
            <h2 className="serif text-balance text-4xl font-medium leading-[1.05] tracking-tight text-[#221d16] md:text-5xl">
              The river built this region.<br />
              <span className="text-[#3b6877]">We're building its next economy.</span>
            </h2>
            <p className="text-pretty mt-7 text-lg leading-relaxed text-[#3b3528]">
              Northeastern PA powered the country with coal, textiles, and rail. The factories thinned, the trains slowed, and the storefronts you grew up with started turning over. The opportunity in front of us now is just as big &mdash; and this time we don't have to ship it out of state to capture it.
            </p>
            <p className="text-pretty mt-4 text-lg leading-relaxed text-[#3b3528]">
              Susquehanna is building the AI infrastructure underneath the next wave of NEPA small business. Each shop we work with gets smarter, faster, harder to compete with from outside the region. Multiply that across hundreds of local businesses and you don't have a vendor &mdash; you have a regional engine.
            </p>
            <p className="text-pretty mt-4 text-lg leading-relaxed text-[#3b3528]">
              That's the work. Empower every small business here, one at a time, until the whole region is moving forward together.
            </p>
          </div>

          <div className="reveal md:col-span-6">
            <div className="relative aspect-[5/4] overflow-hidden rounded-2xl border border-[#cdbf9f] shadow-lg">
              <svg viewBox="0 0 500 400" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
                <defs>
                  <linearGradient id="susq-sky" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#e9d8b3" />
                    <stop offset="60%" stopColor="#f0e9d8" />
                    <stop offset="100%" stopColor="#cddbe0" />
                  </linearGradient>
                  <linearGradient id="susq-water" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#8aaab5" />
                    <stop offset="100%" stopColor="#3b6877" />
                  </linearGradient>
                </defs>
                <rect width="500" height="400" fill="url(#susq-sky)" />
                <path d="M0 230 L60 200 L120 220 L180 195 L240 215 L300 198 L360 218 L420 200 L500 215 L500 280 L0 280 Z" fill="#465938" opacity="0.55" />
                <path d="M0 250 L70 225 L140 245 L220 220 L290 240 L360 225 L440 245 L500 235 L500 300 L0 300 Z" fill="#5f7549" opacity="0.7" />
                <path d="M0 280 L40 260 L80 275 L120 258 L160 272 L200 260 L240 274 L280 262 L320 273 L360 260 L400 272 L440 261 L480 274 L500 268 L500 320 L0 320 Z" fill="#465938" />
                <path d="M0 340 Q120 305 250 325 T500 320 L500 400 L0 400 Z" fill="url(#susq-water)" />
                <path d="M40 350 Q140 335 250 345 T480 345" fill="none" stroke="#cddbe0" strokeWidth="1" opacity="0.6" />
                <path d="M30 365 Q150 350 260 360 T490 360" fill="none" stroke="#cddbe0" strokeWidth="1" opacity="0.4" />
                <circle cx="370" cy="120" r="36" fill="#c89761" opacity="0.55" />
                <circle cx="370" cy="120" r="22" fill="#c89761" opacity="0.7" />
              </svg>
              <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between text-[11px] uppercase tracking-[0.18em]">
                <span className="rounded bg-[#221d16]/30 px-2.5 py-1 text-[#f5efe1]/90 backdrop-blur-sm">The Endless Mountains</span>
                <span className="rounded bg-[#221d16]/30 px-2.5 py-1 text-[#f5efe1]/90 backdrop-blur-sm">NEPA, 2026</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* services */}
      <section id="susq-services" className="relative z-10 border-y border-[#cdbf9f]/40 bg-[#ede4d0]">
        <div className="mx-auto max-w-7xl px-6 py-28 md:py-36">
          <div className="grid grid-cols-1 items-end gap-10 md:grid-cols-12">
            <div className="reveal md:col-span-7">
              <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.22em] text-[#3b6877]">01 &mdash; What we build</p>
              <h2 className="serif text-balance text-4xl font-medium leading-[1.05] tracking-tight text-[#221d16] md:text-5xl">
                Two things, done<br />quietly and well.
              </h2>
            </div>
            <p className="reveal leading-relaxed text-[#3b3528] md:col-span-5">
              We don't sell &ldquo;AI transformation.&rdquo; We build specific tools that take work off your team's plate, answer your customers when you can't, and pay for themselves within months.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* service 1 */}
            <div className="reveal card rounded-2xl p-8 md:p-10">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#7a9162]/60 bg-[#a8b888]/30">
                  <svg className="h-5 w-5 text-[#465938]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v3M12 19v3M5 12H2M22 12h-3M19.07 4.93l-2.12 2.12M7.05 16.95l-2.12 2.12M19.07 19.07l-2.12-2.12M7.05 7.05L4.93 4.93" />
                    <circle cx="12" cy="12" r="4" />
                  </svg>
                </div>
                <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#75694d]">Service / 01</span>
              </div>
              <h3 className="serif text-3xl leading-tight text-[#221d16]">Quiet automation</h3>
              <p className="mt-3 leading-relaxed text-[#3b3528]">
                The behind-the-counter work eating up your team's days &mdash; inquiries, scheduling, data entry, email triage, invoices, follow-ups. We connect the tools you already use and let AI handle the in-between.
              </p>
              <ul className="mt-7 space-y-3 text-[#3b3528]">
                {[
                  'Voicemails, emails, and inquiries captured automatically — no copy-paste',
                  'Invoices, intake forms, and PDFs sorted into the right place',
                  'Customer follow-ups that just happen, on schedule',
                  "Last week's numbers compiled and waiting in your inbox Monday morning",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-2 inline-block h-px w-3 bg-[#5f7549]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* service 2 */}
            <div className="reveal card rounded-2xl p-8 md:p-10">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#8aaab5] bg-[#cddbe0]">
                  <svg className="h-5 w-5 text-[#3b6877]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#75694d]">Service / 02</span>
              </div>
              <h3 className="serif text-3xl leading-tight text-[#221d16]">Never miss a call</h3>
              <p className="mt-3 leading-relaxed text-[#3b3528]">
                AI assistants that actually know your business &mdash; your hours, services, the way you talk to customers. Answering on your website, by SMS, or over the phone. Stepping aside the moment a real person should take over.
              </p>
              <ul className="mt-7 space-y-3 text-[#3b3528]">
                {[
                  "A voice agent that picks up the main line when no one's free to answer",
                  'Website chat that answers customer questions and books appointments',
                  "SMS that captures inquiries 24/7, even when you're closed",
                  'Friendly follow-ups that bring customers back through the door',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-2 inline-block h-px w-3 bg-[#3b6877]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* manifesto pull-quote */}
      <section className="relative z-10">
        <div className="reveal mx-auto max-w-4xl px-6 py-24 text-center md:py-32">
          <svg viewBox="0 0 200 20" className="mx-auto mb-8 w-32 text-[#4a7c8c]" aria-hidden>
            <path d="M0 10 Q25 2 50 10 T100 10 T150 10 T200 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <p className="serif text-balance text-2xl leading-[1.25] text-[#221d16] md:text-4xl">
            We're not selling AI to Northeastern PA. We're building <span className="italic text-[#3b6877]">NEPA's AI infrastructure</span> &mdash; one local business at a time, until the whole region is competing on a different level.
          </p>
          <p className="mt-8 text-[11px] font-medium uppercase tracking-[0.22em] text-[#4a4233]">The Susquehanna mission</p>
        </div>
      </section>

      {/* approach */}
      <section id="susq-approach" className="relative z-10">
        <div className="mx-auto max-w-7xl px-6 py-28 md:py-36">
          <div className="reveal max-w-2xl">
            <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.22em] text-[#a16a35]">02 &mdash; How we work</p>
            <h2 className="serif text-balance text-4xl font-medium leading-[1.05] tracking-tight text-[#221d16] md:text-5xl">
              Listen. Build.<br />Tend.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-[#3b3528]">
              Three steps. No quarter-long discovery phases. No deck with stock photos of people pointing at screens.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-6">
            {[
              { num: '01', name: 'Listen', color: '#4a7c8c', body: 'We sit down with you — in your shop, your office, your back room. We learn where the day goes and what\'s worth changing first. Thirty minutes, no pressure.' },
              { num: '02', name: 'Build', color: '#7a9162', body: 'We build the first piece, connect it to what you already use, and test it on real data from your business. You see weekly progress, not a final reveal at the end.' },
              { num: '03', name: 'Tend', color: '#a16a35', body: "AI tools need looking after, like anything growing. We stay on after launch — refining, expanding, on the phone when something breaks. We're an hour up the road, not a help desk overseas." },
            ].map((step) => (
              <div key={step.num} className="reveal relative">
                <div className="serif text-6xl leading-none" style={{ color: `${step.color}55` }}>{step.num}</div>
                <div className="serif mt-4 text-2xl text-[#221d16]">{step.name}</div>
                <p className="mt-3 leading-relaxed text-[#3b3528]">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* why us */}
      <section className="relative z-10 border-y border-[#cdbf9f]/40 bg-[#ede4d0]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-12 px-6 py-28 md:grid-cols-12 md:py-36">
          <div className="reveal md:col-span-7">
            <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.22em] text-[#3b6877]">03 &mdash; Why Susquehanna</p>
            <h2 className="serif text-balance text-4xl font-medium leading-[1.05] tracking-tight text-[#221d16] md:text-5xl">
              Local partner.<br /><span className="text-[#5f7549]">Frontier tools.</span>
            </h2>
            <p className="text-pretty mt-7 text-lg leading-relaxed text-[#3b3528]">
              The big AI firms build for big-city budgets. The local tech guys haven't caught up yet. We're the bridge: serious engineering, applied to the businesses actually running NEPA.
            </p>
            <p className="text-pretty mt-4 text-lg leading-relaxed text-[#3b3528]">
              We drive to your office. We answer the phone. And we believe AI shouldn't be something done <em>to</em> small towns by people far away &mdash; it should be built <em>with</em> the people already here.
            </p>
          </div>

          <div className="reveal grid grid-cols-2 gap-px bg-[#cdbf9f]/60 md:col-span-5">
            {[
              { stat: '10×', label: 'faster lead response than industry average' },
              { stat: '24/7', label: 'coverage with no extra payroll' },
              { stat: '2–4 wks', label: 'from kickoff to live system' },
              { stat: 'NEPA', label: 'based, owned & operated — never offshored' },
            ].map((s) => (
              <div key={s.stat} className="bg-[#f5efe1] p-6">
                <div className="serif text-4xl leading-none text-[#221d16]">{s.stat}</div>
                <div className="mt-3 text-sm text-[#3b3528]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* our plan */}
      <section id="susq-plan" className="relative z-10">
        <div className="mx-auto max-w-7xl px-6 py-28 md:py-36">
          <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-12">
            <div className="reveal md:col-span-5">
              <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.22em] text-[#5f7549]">04 &mdash; Our plan</p>
              <h2 className="serif text-balance text-4xl font-medium leading-[1.05] tracking-tight text-[#221d16] md:text-5xl">
                We're starting<br />with the restaurants.
              </h2>
              <p className="text-pretty mt-7 text-lg leading-relaxed text-[#3b3528]">
                Every small business here deserves modern tools. Restaurants are the wedge: they sit at the heart of every Main Street, they live and die by missed calls and full tables, and the work is concrete enough to ship in weeks.
              </p>
              <p className="text-pretty mt-4 text-lg leading-relaxed text-[#3b3528]">
                For our first restaurant partners, we're focused on two things &mdash; a modern website and an AI customer-service chatbot. Once we're running with enough kitchens, we expand out: dental, auto, salons &mdash; the same playbook, the same region.
              </p>
            </div>

            <div className="reveal grid grid-cols-1 gap-5 sm:grid-cols-2 md:col-span-7">
              <div className="card rounded-2xl p-7">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#8aaab5] bg-[#cddbe0]">
                    <svg className="h-5 w-5 text-[#3b6877]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="14" rx="2" />
                      <line x1="3" y1="9" x2="21" y2="9" />
                      <line x1="7" y1="13" x2="11" y2="13" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#75694d]">Offering / 01</span>
                </div>
                <h3 className="serif text-2xl leading-tight text-[#221d16]">Modern restaurant websites</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#3b3528]">
                  Built for how people actually find restaurants in 2026. Mobile-fast, search-optimized for &ldquo;near me,&rdquo; menu front-and-center, and ready to capture bookings the moment someone lands.
                </p>
              </div>

              <div className="card rounded-2xl p-7">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#7a9162]/60 bg-[#a8b888]/30">
                    <svg className="h-5 w-5 text-[#465938]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#75694d]">Offering / 02</span>
                </div>
                <h3 className="serif text-2xl leading-tight text-[#221d16]">Customer-service chatbots</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#3b3528]">
                  An AI agent trained on your restaurant &mdash; hours, menu, allergens, reservation policy. Answering questions on your site and capturing leads when you're closed. In your voice, every time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* pilot offer */}
      <section className="relative z-10">
        <div className="mx-auto max-w-7xl px-6 pt-24 md:pt-28">
          <div className="relative overflow-hidden rounded-3xl bg-[#1b2f37] p-10 text-[#f5efe1] md:p-14">
            <svg className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 800 300">
              <path d="M0 80 Q200 40 400 70 T800 60" fill="none" stroke="#8aaab5" strokeWidth="1" opacity="0.25" />
              <path d="M0 130 Q200 90 400 120 T800 110" fill="none" stroke="#8aaab5" strokeWidth="1" opacity="0.18" />
              <path d="M0 200 Q200 160 400 180 T800 170" fill="none" stroke="#a8b888" strokeWidth="1" opacity="0.18" />
              <path d="M0 260 Q200 220 400 240 T800 230" fill="none" stroke="#a8b888" strokeWidth="1" opacity="0.12" />
            </svg>

            <div className="relative grid grid-cols-1 items-center gap-8 md:grid-cols-12">
              <div className="md:col-span-8">
                <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.22em] text-[#8aaab5]">For our first ten restaurants</p>
                <h2 className="serif text-balance text-3xl font-medium leading-tight md:text-4xl">
                  A free pilot for the first ten NEPA restaurants we work with.
                </h2>
                <p className="mt-4 max-w-2xl leading-relaxed text-[#cddbe0]/90">
                  One small, useful AI tool &mdash; reservation capture, a voice agent, after-hours SMS &mdash; built for your restaurant at no cost. We earn the long-term work by proving the value first. If the pilot doesn't save you real time, you owe us nothing.
                </p>
              </div>
              <div className="md:col-span-4 md:text-right">
                <a href="#susq-contact" className="inline-flex items-center gap-2 rounded-full bg-[#f5efe1] px-6 py-3.5 font-medium text-[#1b2f37] transition hover:bg-[#f0e9d8]">
                  Claim a pilot
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* contact */}
      <section id="susq-contact" className="relative z-10">
        <div className="mx-auto max-w-3xl px-6 py-28 text-center md:py-36">
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.22em] text-[#4a4233]">Let's talk</p>
          <h2 className="serif text-balance text-4xl font-medium leading-[1.05] tracking-tight text-[#221d16] md:text-5xl">
            Find out what ten hours<br />a week back looks like.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[#3b3528]">
            Tell us a bit about your business. We'll get back to you within one business day with where AI fits &mdash; and where it doesn't.
          </p>

          <form
            className="mt-12 grid gap-3 text-left"
            onSubmit={(e) => {
              e.preventDefault()
              setSubmitted(true)
            }}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <input required type="text" placeholder="Your name" className="rounded-xl border border-[#cdbf9f] bg-[#f5efe1] px-4 py-3 text-[#221d16] placeholder-[#75694d] transition focus:border-[#4a7c8c] focus:outline-none" />
              <input required type="text" placeholder="Business name" className="rounded-xl border border-[#cdbf9f] bg-[#f5efe1] px-4 py-3 text-[#221d16] placeholder-[#75694d] transition focus:border-[#4a7c8c] focus:outline-none" />
            </div>
            <input required type="email" placeholder="Email" className="rounded-xl border border-[#cdbf9f] bg-[#f5efe1] px-4 py-3 text-[#221d16] placeholder-[#75694d] transition focus:border-[#4a7c8c] focus:outline-none" />
            <textarea rows={3} placeholder="What's eating the most time right now? (optional)" className="resize-none rounded-xl border border-[#cdbf9f] bg-[#f5efe1] px-4 py-3 text-[#221d16] placeholder-[#75694d] transition focus:border-[#4a7c8c] focus:outline-none" />
            <button
              type="submit"
              disabled={submitted}
              className="btn-primary mt-2 rounded-full px-6 py-3.5 font-medium disabled:opacity-80"
            >
              {submitted ? "Thanks — we'll be in touch." : 'Request your free pilot'}
            </button>
            <p className="mt-3 text-center text-xs text-[#4a4233]">
              Or email us directly:{' '}
              <a href="mailto:hello@susquehanna.ai" className="underline-grow text-[#221d16] underline hover:text-[#3b6877]">
                hello@susquehanna.ai
              </a>
            </p>
          </form>
        </div>
      </section>

      {/* footer wave */}
      <div className="wave-divider -mb-1 leading-none">
        <svg viewBox="0 0 1440 90" preserveAspectRatio="none" className="h-[70px] w-full">
          <path d="M0 50 Q180 20 360 40 T720 40 T1080 40 T1440 30 L1440 90 L0 90 Z" fill="#1b2f37" />
        </svg>
      </div>

      <footer className="relative z-10 bg-[#1b2f37] text-[#f5efe1]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-8 px-6 py-12 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5">
              <svg viewBox="0 0 40 40" className="h-8 w-8" aria-hidden>
                <path d="M3 22 Q10 14 18 20 T36 18" fill="none" stroke="#8aaab5" strokeWidth="2.4" strokeLinecap="round" />
                <path d="M3 28 Q11 22 19 26 T36 24" fill="none" stroke="#a8b888" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
              <span className="serif text-xl font-medium">Susquehanna</span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#cddbe0]/70">
              AI for the small businesses of Northeastern Pennsylvania. Built here. Tended here.
            </p>
          </div>
          <div className="text-sm text-[#cddbe0]/80">
            <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.22em] text-[#8aaab5]">Get in touch</div>
            <a href="mailto:hello@susquehanna.ai" className="block transition hover:text-[#f5efe1]">hello@susquehanna.ai</a>
            <span className="mt-1 block text-[#cddbe0]/60">Serving Scranton, Wilkes-Barre, the Poconos &amp; beyond</span>
          </div>
          <div className="text-sm text-[#cddbe0]/80 md:text-right">
            <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.22em] text-[#8aaab5]">Explore</div>
            <a href="#susq-services" className="block transition hover:text-[#f5efe1]">Services</a>
            <a href="#susq-approach" className="block transition hover:text-[#f5efe1]">Approach</a>
            <a href="#susq-local" className="block transition hover:text-[#f5efe1]">Local</a>
          </div>
        </div>
        <div className="border-t border-[#2e525e]/60">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 text-xs text-[#cddbe0]/60 md:flex-row">
            <span>&copy; 2026 Susquehanna AI. All rights reserved.</span>
            <span className="serif italic">&ldquo;The river built this region. We're building its next economy.&rdquo;</span>
          </div>
        </div>
      </footer>

      {/* Live AI chat — both info assistant and product demo */}
      <ChatWidget />
    </div>
  )
}
