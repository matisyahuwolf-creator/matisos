import { useEffect, useState } from 'react'
import ChatWidget from './ChatWidget'

const SCOPED_STYLES = `
  #susq-landing { font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; color: #221d16; scroll-behavior: smooth; }
  #susq-landing .serif { font-family: 'Fraunces', Georgia, serif; font-feature-settings: "ss01" on, "ss02" on; }
  #susq-landing .text-balance { text-wrap: balance; }
  #susq-landing .text-pretty { text-wrap: pretty; }

  /* parchment grain */
  #susq-landing .grain {
    background-image:
      radial-gradient(circle at 25% 30%, rgba(192, 140, 74, 0.05) 0%, transparent 40%),
      radial-gradient(circle at 75% 70%, rgba(122, 145, 98, 0.05) 0%, transparent 45%),
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220' viewBox='0 0 220 220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.13 0 0 0 0 0.11 0 0 0 0 0.08 0 0 0 0 0.07 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }

  /* postcard look */
  #susq-landing .postcard {
    background: #f7f0dd;
    border: 1px solid #d8c79b;
    box-shadow:
      0 1px 0 rgba(255,255,255,0.4) inset,
      0 20px 40px -20px rgba(122, 95, 58, 0.25),
      0 2px 6px rgba(122, 95, 58, 0.08);
  }

  /* deckled / torn paper edge (using inset shadow + clip) */
  #susq-landing .deckle {
    background: #f7f0dd;
    border: 1px solid #d8c79b;
    box-shadow:
      0 14px 30px -20px rgba(122, 95, 58, 0.3),
      0 2px 6px rgba(122, 95, 58, 0.08);
  }

  /* river wave divider */
  #susq-landing .wave-divider svg { display: block; width: 100%; height: 100%; }

  /* primary navy button */
  #susq-landing .btn-navy {
    background: #1b2f37;
    color: #f5efe1;
    transition: transform 180ms ease, background 180ms ease, box-shadow 180ms ease;
    box-shadow: 0 6px 16px -8px rgba(27, 47, 55, 0.4);
  }
  #susq-landing .btn-navy:hover { background: #2e525e; transform: translateY(-1px); }

  /* ochre / orange button */
  #susq-landing .btn-ochre {
    background: #c08c4a;
    color: #f5efe1;
    transition: transform 180ms ease, background 180ms ease, box-shadow 180ms ease;
    box-shadow: 0 6px 16px -8px rgba(192, 140, 74, 0.4);
  }
  #susq-landing .btn-ochre:hover { background: #b07c3a; transform: translateY(-1px); }

  #susq-landing .btn-ghost {
    border: 1.5px solid rgba(34, 29, 22, 0.35);
    color: #221d16;
    transition: border-color 180ms ease, background 180ms ease;
  }
  #susq-landing .btn-ghost:hover { border-color: rgba(34, 29, 22, 0.7); background: rgba(34, 29, 22, 0.04); }

  /* service / approach cards */
  #susq-landing .feature-card {
    background: #f3ead2;
    border: 1px solid #d8c79b;
    transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease;
  }
  #susq-landing .feature-card:hover {
    transform: translateY(-2px);
    border-color: #c08c4a;
    box-shadow: 0 16px 32px -16px rgba(122, 95, 58, 0.3);
  }

  /* link underline grow */
  #susq-landing .underline-grow {
    background-image: linear-gradient(currentColor, currentColor);
    background-size: 0% 1px;
    background-repeat: no-repeat;
    background-position: 0 100%;
    transition: background-size 280ms ease;
  }
  #susq-landing .underline-grow:hover { background-size: 100% 1px; }

  /* soft pulse */
  @keyframes susq-soft-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.45; } }
  #susq-landing .soft-pulse { animation: susq-soft-pulse 2s ease-in-out infinite; }

  /* drift */
  @keyframes susq-drift { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
  #susq-landing .drift { animation: susq-drift 7s ease-in-out infinite; }

  /* flowing dashed line for chat scenarios */
  @keyframes susq-flow-dash { to { stroke-dashoffset: -200; } }
  #susq-landing .flow-line { stroke-dasharray: 6 10; animation: susq-flow-dash 8s linear infinite; }

  /* reveal on scroll */
  #susq-landing .reveal { opacity: 0; transform: translateY(14px); transition: opacity 800ms ease, transform 800ms ease; }
  #susq-landing .reveal.in { opacity: 1; transform: none; }

  /* bounce dots */
  @keyframes susq-bounce {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
    40% { transform: translateY(-4px); opacity: 1; }
  }

  /* stamp tilt */
  #susq-landing .stamp { transform: rotate(8deg); }
`

const TRUST_LOGOS = [
  { name: "Cooper's", sub: 'Seafood House', style: 'script' as const },
  { name: 'Sette Luna', sub: 'Ristorante', style: 'caps' as const },
  { name: 'Fireside', sub: 'Tavern', style: 'stack' as const },
  { name: 'The Slovak', sub: 'Kitchen', style: 'caps' as const },
  { name: 'River Commons', sub: 'Coffee · Eatery', style: 'caps' as const },
  { name: 'The Abington', sub: 'Ale House', style: 'script' as const },
]

const SERVICES = [
  {
    title: 'Smart Conversations',
    body: 'AI assistants that answer calls, texts, and messages like your best team member.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 14 h32 a2 2 0 0 1 2 2 v18 a2 2 0 0 1 -2 2 H22 l-8 6 v-6 H8 a2 2 0 0 1 -2 -2 V16 a2 2 0 0 1 2 -2 z" />
        <line x1="15" y1="22" x2="33" y2="22" />
        <line x1="15" y1="28" x2="27" y2="28" />
      </svg>
    ),
  },
  {
    title: 'Reservations & Scheduling',
    body: 'More bookings. Fewer no-shows. Seamless scheduling across channels.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="8" y="12" width="32" height="28" rx="2" />
        <line x1="8" y1="20" x2="40" y2="20" />
        <line x1="16" y1="8" x2="16" y2="14" />
        <line x1="32" y1="8" x2="32" y2="14" />
        <circle cx="16" cy="28" r="1.2" fill="currentColor" />
        <circle cx="24" cy="28" r="1.2" fill="currentColor" />
        <circle cx="32" cy="28" r="1.2" fill="currentColor" />
        <circle cx="16" cy="34" r="1.2" fill="currentColor" />
        <circle cx="24" cy="34" r="1.2" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: 'Insights & Reporting',
    body: "Understand what's working and where to focus, with clear, actionable data.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <line x1="10" y1="38" x2="40" y2="38" />
        <rect x="13" y="28" width="5" height="10" />
        <rect x="22" y="22" width="5" height="16" />
        <rect x="31" y="16" width="5" height="22" />
        <polyline points="13,24 22,18 31,12 40,8" />
      </svg>
    ),
  },
  {
    title: 'Marketing & Outreach',
    body: 'Targeted messages that bring people in and keep them coming back.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 28 V20 L34 12 V36 L10 28 Z" />
        <path d="M14 28 v6 a2 2 0 0 0 2 2 h4 a2 2 0 0 0 2 -2 v-3" />
        <path d="M37 18 q4 2 4 6 q0 4 -4 6" />
      </svg>
    ),
  },
  {
    title: 'Operations & Automation',
    body: 'Save time on the busy work so your team can focus on what matters.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="24" cy="24" r="6" />
        <path d="M24 8 v6 M24 34 v6 M8 24 h6 M34 24 h6 M12 12 l4 4 M32 32 l4 4 M36 12 l-4 4 M16 32 l-4 4" />
      </svg>
    ),
  },
]

const APPROACH = [
  {
    num: '1',
    name: 'Listen',
    body: 'We start with real conversations and real understanding.',
    icon: (
      <svg viewBox="0 0 80 64" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
        {/* chair on stones */}
        <path d="M28 14 v22 h18 v-22 z" />
        <line x1="28" y1="36" x2="28" y2="52" />
        <line x1="46" y1="36" x2="46" y2="52" />
        <line x1="28" y1="42" x2="46" y2="42" />
        <ellipse cx="40" cy="58" rx="22" ry="3" />
        <path d="M14 56 q4 -4 8 0" />
        <path d="M58 56 q4 -4 8 0" />
        {/* clouds */}
        <path d="M8 18 q3 -4 7 -2 q3 -3 7 0 q3 -1 4 2" />
      </svg>
    ),
  },
  {
    num: '2',
    name: 'Build',
    body: 'We design and build solutions that fit your business.',
    icon: (
      <svg viewBox="0 0 80 64" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
        {/* easel + canvas */}
        <line x1="20" y1="56" x2="32" y2="14" />
        <line x1="60" y1="56" x2="48" y2="14" />
        <line x1="40" y1="14" x2="40" y2="56" />
        <rect x="26" y="18" width="28" height="22" />
        <line x1="32" y1="28" x2="46" y2="22" />
        <line x1="32" y1="34" x2="40" y2="30" />
        {/* paintbrush */}
        <line x1="62" y1="20" x2="68" y2="14" />
        <path d="M68 14 l3 -3 l2 2 l-3 3 z" />
      </svg>
    ),
  },
  {
    num: '3',
    name: 'Tend',
    body: 'We stay close, refine, and grow with you for the long haul.',
    icon: (
      <svg viewBox="0 0 80 64" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
        {/* watering can */}
        <path d="M24 28 h22 v18 q0 4 -4 4 h-14 q-4 0 -4 -4 v-18 z" />
        <path d="M46 32 l8 -4 l2 4" />
        <path d="M24 24 h22 v4 h-22 z" />
        <line x1="30" y1="24" x2="30" y2="20" />
        <line x1="40" y1="24" x2="40" y2="20" />
        {/* drops */}
        <circle cx="60" cy="38" r="1" />
        <circle cx="64" cy="44" r="1" />
        <circle cx="58" cy="48" r="1" />
        {/* sprout */}
        <path d="M14 52 q2 -8 6 -8 q-2 -4 -6 -2" />
      </svg>
    ),
  },
]

const ERAS = [
  {
    range: '2005–2012',
    title: 'The Idea',
    body: 'Conversations on riverbanks and in kitchen corners.',
  },
  {
    range: '2013–2016',
    title: 'Listening First',
    body: 'We listened to local businesses and learned what really matters.',
  },
  {
    range: '2017–2020',
    title: 'Early Currents',
    body: 'Pilots, partnerships, and proof of what AI could do here.',
  },
  {
    range: '2021–2023',
    title: 'Building the Current',
    body: 'A platform shaped for real work in real places across NEPA.',
  },
  {
    range: '2024–Today',
    title: 'Stronger Together',
    body: 'Expanding our reach, our team, and our impact — together.',
  },
]

const STATS = [
  { value: '100%', label: 'NEPA Focused' },
  { value: '50+', label: 'Local Businesses Supported' },
  { value: '1,000+', label: 'Hours Saved for Our Clients' },
  { value: '98%', label: 'Client Satisfaction' },
]

const CHARTER_BENEFITS = [
  'Locked-in founding pricing',
  'Influence on roadmap & features',
  'Priority support & early access',
  'Co-marketing & local spotlight',
]

const CHARTER_CLAIMED = 1
const CHARTER_TOTAL = 10

export default function Landing({ onClose }: { onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatPrompt, setChatPrompt] = useState<string | null>(null)

  const openDemo = () => {
    setChatPrompt(
      "Show me a live demo of what a Susquehanna chatbot would feel like on my restaurant's site. Pretend you're the bot for a local NEPA spot.",
    )
    setChatOpen(true)
  }

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
      { threshold: 0.12 },
    )
    root.querySelectorAll('.reveal').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

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

      {/* parchment grain backdrop */}
      <div className="grain pointer-events-none fixed inset-0 -z-10" />

      {/* close → back to matisOS */}
      <button
        onClick={onClose}
        aria-label="Back to matisOS"
        className="fixed left-4 top-4 z-[60] inline-flex items-center gap-1.5 rounded-full bg-[#1b2f37]/90 px-4 py-2 text-[13px] font-medium text-[#f5efe1] backdrop-blur-sm transition hover:bg-[#1b2f37]"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13L5 8l5-5" />
        </svg>
        matisOS
      </button>

      {/* ============ NAV ============ */}
      <header className="relative z-30">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 pt-7 pb-4 md:pt-9">
          <a href="#susq-top" className="block">
            <div className="serif text-[26px] font-medium leading-none tracking-[0.04em] text-[#1b2f37] md:text-[30px]">
              SUSQUEHANNA
            </div>
            <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.28em] text-[#75694d]">
              AI for Northeast Pennsylvania
            </div>
          </a>

          <div className="hidden items-center gap-8 text-[13.5px] font-medium text-[#3b3528] lg:flex">
            <a href="#susq-services" className="underline-grow">Services</a>
            <a href="#susq-restaurants" className="underline-grow">For Restaurants</a>
            <a href="#susq-story" className="underline-grow">Our Story</a>
            <a href="#susq-charter" className="underline-grow">Charter Membership</a>
            <a href="#susq-services" className="underline-grow">Resources</a>
          </div>

          <a href="#susq-contact" className="btn-ochre rounded-full px-5 py-2.5 text-[13.5px] font-medium">
            Contact Us
          </a>
        </nav>
      </header>

      {/* ============ HERO ============ */}
      <section id="susq-top" className="relative z-10 overflow-hidden">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-12 px-6 pt-10 pb-20 md:grid-cols-12 md:gap-10 md:pt-14 md:pb-32">
          <div className="md:col-span-6">
            <div className="mb-6 flex items-center gap-2.5">
              <svg viewBox="0 0 40 12" className="h-3 w-10 text-[#4a7c8c]" aria-hidden>
                <path d="M0 6 Q8 1 16 6 T32 6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                <path d="M2 9 Q10 5 18 9 T34 9" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
              </svg>
              <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#75694d]">
                From the banks of the Susquehanna
              </span>
            </div>

            <h1 className="serif text-balance text-[44px] font-medium leading-[1.03] tracking-tight text-[#1b2f37] sm:text-[52px] md:text-[64px]">
              AI that <em className="not-italic text-[#3b6877]" style={{ fontStyle: 'italic', fontWeight: 400 }}>flows</em>{' '}
              with the work already here.
            </h1>

            <p className="text-pretty mt-6 max-w-lg text-[16.5px] leading-relaxed text-[#3b3528] md:text-[17.5px]">
              Practical, people-first AI that helps NEPA businesses save time, serve better, and grow without losing what makes them local.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a href="#susq-services" className="btn-navy inline-flex items-center justify-center rounded-full px-7 py-3.5 text-[14.5px] font-medium">
                Explore Services
              </a>
              <button onClick={openDemo} className="btn-ghost inline-flex items-center gap-2 rounded-full px-5 py-3.5 text-[14.5px] font-medium">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1b2f37] text-[#f5efe1]">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                </span>
                See How It Works
              </button>
            </div>
          </div>

          {/* hero illustration card */}
          <div className="md:col-span-6">
            <HeroIllustration />
          </div>
        </div>

        {/* river divider */}
        <div className="wave-divider -mb-1 leading-none">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="h-[70px] w-full" aria-hidden>
            <path d="M0 50 Q180 18 360 42 T720 42 T1080 42 T1440 36 L1440 80 L0 80 Z" fill="#cddbe0" opacity="0.5" />
            <path d="M0 60 Q180 30 360 52 T720 50 T1080 54 T1440 48 L1440 80 L0 80 Z" fill="#8aaab5" opacity="0.45" />
            <path d="M0 68 Q180 42 360 60 T720 58 T1080 62 T1440 56 L1440 80 L0 80 Z" fill="#3b6877" opacity="0.65" />
          </svg>
        </div>
      </section>

      {/* ============ TRUST STRIP ============ */}
      <section className="relative z-10 bg-[#f3ead2]/60">
        <div className="mx-auto max-w-7xl px-6 py-10 md:py-12">
          <p className="mb-6 text-center text-[10.5px] font-semibold uppercase tracking-[0.28em] text-[#75694d]">
            Trusted by businesses across Northeast Pennsylvania
          </p>
          <div className="grid grid-cols-2 items-center gap-x-8 gap-y-6 sm:grid-cols-3 md:grid-cols-6 md:gap-x-2">
            {TRUST_LOGOS.map((logo) => (
              <TrustLogo key={logo.name} {...logo} />
            ))}
          </div>
        </div>
      </section>

      {/* ============ MISSION (POSTCARD) ============ */}
      <section id="susq-story" className="relative z-10">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="reveal postcard relative grid grid-cols-1 overflow-hidden rounded-md md:grid-cols-2">
            {/* left: illustrated NEPA town */}
            <div className="relative aspect-[5/4] overflow-hidden md:aspect-auto">
              <MissionIllustration />
            </div>

            {/* right: text + stamp */}
            <div className="relative p-7 md:p-12">
              {/* stamp */}
              <div className="stamp absolute right-6 top-6 hidden h-20 w-16 md:block">
                <div className="relative h-full w-full rounded-[3px] border-2 border-dashed border-[#a16a35]/70 bg-[#f5efe1] p-1 shadow-sm">
                  <div className="flex h-full w-full flex-col items-center justify-center rounded-sm bg-[#c08c4a]/90 text-[9px] font-medium uppercase tracking-widest text-[#f5efe1]">
                    <div className="serif text-[15px] leading-none">NEPA</div>
                    <div className="mt-1 leading-none">2026</div>
                    <div className="mt-1 h-[1px] w-6 bg-[#f5efe1]/60" />
                    <div className="mt-1 leading-none">USA</div>
                  </div>
                </div>
              </div>

              <p className="text-[10.5px] font-semibold uppercase tracking-[0.26em] text-[#a16a35]">Our Mission</p>
              <h2 className="serif mt-4 text-balance text-[32px] font-medium leading-[1.1] tracking-tight text-[#1b2f37] md:text-[40px]">
                Rooted in NEPA.<br />Built for what's next.
              </h2>
              <p className="text-pretty mt-5 max-w-md leading-relaxed text-[#3b3528]">
                We exist to help the hardworking businesses of Northeastern Pennsylvania thrive in an AI-powered world &mdash; without losing the soul, service, and sense of place that make this region home.
              </p>
              <p className="serif mt-5 text-[18px] italic text-[#3b6877]">
                Local roots. Lasting impact.
              </p>

              {/* botanical sprig */}
              <svg viewBox="0 0 80 24" className="mt-6 h-5 text-[#7a9162]" aria-hidden>
                <path d="M2 12 Q40 6 78 12" fill="none" stroke="currentColor" strokeWidth="1" />
                <path d="M20 10 q-3 -4 -6 -3" fill="none" stroke="currentColor" strokeWidth="1" />
                <path d="M30 9 q-2 -4 -5 -4" fill="none" stroke="currentColor" strokeWidth="1" />
                <path d="M44 8 q-2 -4 -5 -4" fill="none" stroke="currentColor" strokeWidth="1" />
                <path d="M58 9 q-2 -4 -5 -4" fill="none" stroke="currentColor" strokeWidth="1" />
                <ellipse cx="14" cy="6" rx="3" ry="1.5" transform="rotate(-20 14 6)" fill="currentColor" opacity="0.6" />
                <ellipse cx="25" cy="5" rx="3" ry="1.5" transform="rotate(-20 25 5)" fill="currentColor" opacity="0.6" />
                <ellipse cx="39" cy="4" rx="3" ry="1.5" transform="rotate(-20 39 4)" fill="currentColor" opacity="0.6" />
                <ellipse cx="53" cy="5" rx="3" ry="1.5" transform="rotate(-20 53 5)" fill="currentColor" opacity="0.6" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TIMELINE — A RIVER RUNS THROUGH IT ============ */}
      <section id="susq-journey" className="relative z-10">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
          <div className="reveal mb-12 md:mb-16">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.26em] text-[#a16a35]">Our Journey</p>
            <h2 className="serif mt-3 text-balance text-[34px] font-medium leading-tight tracking-tight text-[#1b2f37] md:text-[44px]">
              A River Runs Through It
            </h2>
          </div>

          <TimelineRiver eras={ERAS} />
        </div>
      </section>

      {/* ============ SERVICES ============ */}
      <section id="susq-services" className="relative z-10">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="reveal mb-10 text-center md:mb-14">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.26em] text-[#a16a35]">How We Help</p>
            <h2 className="serif mt-3 text-balance text-[32px] font-medium leading-tight tracking-tight text-[#1b2f37] md:text-[42px]">
              Practical AI Services for Local Business
            </h2>
          </div>

          <div className="reveal grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {SERVICES.map((s) => (
              <div key={s.title} className="feature-card rounded-xl p-5 text-center">
                <div className="mx-auto mb-4 h-12 w-12 text-[#1b2f37]">{s.icon}</div>
                <h3 className="serif text-[17px] font-medium leading-tight text-[#1b2f37]">{s.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-[#3b3528]">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ MANIFESTO QUOTE ============ */}
      <section className="relative z-10">
        <div className="reveal mx-auto max-w-4xl px-6 py-6 text-center md:py-12">
          <p className="serif text-balance text-[22px] italic leading-[1.35] text-[#1b2f37] md:text-[30px]">
            &ldquo;Technology should bend to the people, not the other way around.&rdquo;
          </p>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.26em] text-[#a16a35]">
            &mdash; Our Manifesto
          </p>
        </div>
      </section>

      {/* ============ APPROACH ============ */}
      <section className="relative z-10">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
          <p className="reveal text-center text-[10.5px] font-semibold uppercase tracking-[0.26em] text-[#a16a35]">
            Our Approach
          </p>

          <div className="reveal mt-10 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-12">
            {APPROACH.map((step) => (
              <div key={step.num} className="flex flex-col items-center text-center md:flex-row md:items-start md:text-left">
                <div className="mb-4 flex items-start gap-4 md:mb-0 md:mr-5">
                  <div className="serif text-[52px] font-medium leading-none text-[#1b2f37]/85">{step.num}</div>
                </div>
                <div className="flex flex-col items-center md:items-start">
                  <h3 className="serif text-[22px] font-medium leading-tight text-[#1b2f37]">{step.name}</h3>
                  <div className="my-3 h-14 w-20 text-[#465938]">{step.icon}</div>
                  <p className="max-w-[230px] text-[14px] leading-relaxed text-[#3b3528]">{step.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="reveal mt-12 flex justify-center md:mt-16">
            <div className="flex items-center gap-3 text-[#75694d]">
              <span className="h-px w-12 bg-[#cdbf9f]" />
              <span className="text-[10.5px] uppercase tracking-[0.26em]">·</span>
              <span className="h-px w-12 bg-[#cdbf9f]" />
            </div>
          </div>
        </div>
      </section>

      {/* ============ WHY US + RESTAURANTS (split) ============ */}
      <section id="susq-restaurants" className="relative z-10">
        <div className="mx-auto max-w-7xl px-6 pb-16 md:pb-24">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* WHY US */}
            <div className="reveal deckle rounded-md p-7 md:p-9">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.26em] text-[#a16a35]">
                Why Choose Susquehanna
              </p>
              <h3 className="serif mt-2 text-[28px] font-medium leading-tight text-[#1b2f37] md:text-[32px]">
                Local people. Real results.
              </h3>
              <p className="mt-3 max-w-md text-[14px] leading-relaxed text-[#3b3528]">
                We're not a faceless platform. We're your neighbors &mdash; invested in NEPA's success and committed to doing things the right way.
              </p>

              <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-4">
                {STATS.map((s) => (
                  <div key={s.label}>
                    <div className="flex items-center gap-1.5 text-[#a16a35]">
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M9 12l2 2 4-4" />
                      </svg>
                    </div>
                    <div className="serif mt-1 text-[26px] font-medium leading-none text-[#1b2f37]">{s.value}</div>
                    <div className="mt-1.5 text-[11.5px] leading-tight text-[#3b3528]">{s.label}</div>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-[10.5px] italic text-[#75694d]">
                *Early pilot and client-reported data.
              </p>
            </div>

            {/* RESTAURANTS */}
            <div className="reveal deckle rounded-md p-7 md:p-9">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.26em] text-[#a16a35]">
                We're starting with the restaurants
              </p>
              <h3 className="serif mt-2 text-[28px] font-medium leading-tight text-[#1b2f37] md:text-[32px]">
                Built for the rhythm of your service.
              </h3>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <RestaurantCard
                  title="AI Phone Receptionist"
                  body="Never miss a call. Capture every guest opportunity."
                  icon={<PhoneIcon />}
                />
                <RestaurantCard
                  title="Reservations & Waitlists"
                  body="More tables filled. Smarter lists. Happier guests."
                  icon={<BellIcon />}
                />
                <RestaurantCard
                  title="Guest Follow-Up"
                  body="Thank guests, get reviews, and bring them back — automatically."
                  icon={<EnvelopeIcon />}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CHARTER MEMBERS ============ */}
      <section id="susq-charter" className="relative z-10">
        <div className="mx-auto max-w-7xl px-6 pb-16 md:pb-24">
          <div className="relative overflow-hidden rounded-lg bg-[#1b2f37] p-7 text-[#f5efe1] md:p-12">
            {/* river illustration backdrop */}
            <svg viewBox="0 0 1200 360" preserveAspectRatio="xMidYMid slice" className="pointer-events-none absolute inset-0 h-full w-full opacity-50" aria-hidden>
              <path d="M0 240 Q200 200 400 230 T800 230 T1200 220" fill="none" stroke="#8aaab5" strokeWidth="1.2" />
              <path d="M0 270 Q200 230 400 260 T800 260 T1200 250" fill="none" stroke="#8aaab5" strokeWidth="1" opacity="0.7" />
              <path d="M0 300 Q200 260 400 290 T800 290 T1200 280" fill="none" stroke="#a8b888" strokeWidth="1" opacity="0.6" />
              {/* trees right */}
              <g fill="none" stroke="#a8b888" strokeWidth="0.8" opacity="0.55">
                <path d="M1080 200 L1080 240 M1075 220 q5 -16 10 0 M1072 210 q8 -20 16 0" />
                <path d="M1130 180 L1130 240 M1122 210 q8 -22 16 0 M1118 195 q12 -28 24 0" />
              </g>
              {/* trees left */}
              <g fill="none" stroke="#a8b888" strokeWidth="0.8" opacity="0.5">
                <path d="M80 200 L80 240 M72 220 q8 -22 16 0" />
              </g>
            </svg>

            <div className="relative grid grid-cols-1 items-center gap-8 md:grid-cols-12">
              <div className="md:col-span-5">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.26em] text-[#c08c4a]">
                  Charter Members
                </p>
                <h2 className="serif mt-3 text-balance text-[30px] font-medium leading-tight md:text-[36px]">
                  Help shape what's next.
                </h2>
                <p className="mt-3 max-w-md text-[14px] leading-relaxed text-[#cddbe0]/85">
                  We're onboarding our first 10 partners to help build, test, and guide Susquehanna from the ground up.
                </p>
              </div>

              <div className="text-center md:col-span-3">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="serif text-[64px] font-medium leading-none text-[#f5efe1] md:text-[80px]">{CHARTER_CLAIMED}</span>
                  <span className="serif text-[28px] text-[#8aaab5] md:text-[36px]">/{CHARTER_TOTAL}</span>
                </div>
                <p className="mt-2 text-[10.5px] font-semibold uppercase tracking-[0.26em] text-[#8aaab5]">
                  Charter positions claimed
                </p>
                <div className="mt-4 flex justify-center gap-2">
                  {Array.from({ length: CHARTER_TOTAL }).map((_, i) => (
                    <span
                      key={i}
                      className={`h-3 w-3 rounded-full ${
                        i < CHARTER_CLAIMED
                          ? 'bg-[#c08c4a]'
                          : 'border border-[#c08c4a]/45 bg-transparent'
                      }`}
                      aria-hidden
                    />
                  ))}
                </div>
              </div>

              <div className="md:col-span-4">
                <p className="mb-4 text-[10.5px] font-semibold uppercase tracking-[0.26em] text-[#c08c4a]">
                  Founding Member Benefits
                </p>
                <ul className="space-y-2 text-[14px] text-[#cddbe0]">
                  {CHARTER_BENEFITS.map((b) => (
                    <li key={b} className="flex items-center gap-2.5">
                      <svg className="h-4 w-4 shrink-0 text-[#c08c4a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {b}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                  <a href="#susq-contact" className="btn-ochre inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-[14px] font-medium">
                    Apply for Charter Membership
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
                  </a>
                  <button onClick={openDemo} className="inline-flex items-center justify-center gap-2 rounded-full text-[14px] font-medium text-[#cddbe0] underline-grow">
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CONTACT ============ */}
      <section id="susq-contact" className="relative z-10">
        <div className="mx-auto max-w-7xl px-6 pb-16 md:pb-24">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.26em] text-[#a16a35]">Let's start a conversation</p>
              <h2 className="serif mt-3 text-balance text-[30px] font-medium leading-tight text-[#1b2f37] md:text-[36px]">
                We'd love to hear from you.
              </h2>
              <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-[#3b3528]">
                Tell us about your business and what you're looking to achieve. We'll get back to you within one business day.
              </p>
            </div>

            <form
              className="grid gap-3 md:col-span-5"
              onSubmit={(e) => {
                e.preventDefault()
                setSubmitted(true)
              }}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <input required type="text" placeholder="Full Name" className="rounded-md border border-[#cdbf9f] bg-[#fffaee] px-4 py-3 text-[14px] text-[#221d16] placeholder-[#75694d] transition focus:border-[#c08c4a] focus:outline-none" />
                <input required type="text" placeholder="Business Name" className="rounded-md border border-[#cdbf9f] bg-[#fffaee] px-4 py-3 text-[14px] text-[#221d16] placeholder-[#75694d] transition focus:border-[#c08c4a] focus:outline-none" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input required type="email" placeholder="Email Address" className="rounded-md border border-[#cdbf9f] bg-[#fffaee] px-4 py-3 text-[14px] text-[#221d16] placeholder-[#75694d] transition focus:border-[#c08c4a] focus:outline-none" />
                <input type="tel" placeholder="Phone Number" className="rounded-md border border-[#cdbf9f] bg-[#fffaee] px-4 py-3 text-[14px] text-[#221d16] placeholder-[#75694d] transition focus:border-[#c08c4a] focus:outline-none" />
              </div>
              <textarea rows={4} placeholder="How can we help?" className="resize-none rounded-md border border-[#cdbf9f] bg-[#fffaee] px-4 py-3 text-[14px] text-[#221d16] placeholder-[#75694d] transition focus:border-[#c08c4a] focus:outline-none" />
              <button
                type="submit"
                disabled={submitted}
                className="btn-navy mt-1 inline-flex w-fit items-center gap-2 rounded-full px-7 py-3 text-[14px] font-medium disabled:opacity-80"
              >
                {submitted ? "Thanks — we'll be in touch." : (
                  <>
                    Send Message
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
                  </>
                )}
              </button>
            </form>

            <div className="md:col-span-3">
              <p className="text-[14px] leading-relaxed text-[#3b3528]">
                Proudly based in NEPA. Serving businesses across the region we call home.
              </p>
              <div className="mt-4 flex items-center gap-3 text-[#75694d]">
                <SocialIcon kind="facebook" />
                <SocialIcon kind="instagram" />
                <SocialIcon kind="linkedin" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="relative z-10 border-t border-[#cdbf9f]/40 bg-[#ede4d0]/60">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-7 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="serif text-[18px] font-medium tracking-[0.04em] text-[#1b2f37]">SUSQUEHANNA</div>
            <div className="mt-0.5 text-[9.5px] font-medium uppercase tracking-[0.26em] text-[#75694d]">
              AI for Northeast Pennsylvania
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] text-[#3b3528]">
            <a href="#susq-services" className="underline-grow">Services</a>
            <a href="#susq-restaurants" className="underline-grow">For Restaurants</a>
            <a href="#susq-story" className="underline-grow">Our Story</a>
            <a href="#susq-services" className="underline-grow">Resources</a>
            <span className="text-[#3b3528]/70">Privacy Policy</span>
            <span className="text-[#3b3528]/70">Terms of Service</span>
          </div>
          <div className="text-right text-[11px] text-[#75694d]">
            © 2026 Susquehanna AI, LLC.<br />All rights reserved.
          </div>
        </div>
      </footer>

      {/* Live AI chat — both info assistant and product demo */}
      <ChatWidget
        open={chatOpen}
        onOpenChange={setChatOpen}
        initialPrompt={chatPrompt}
        onPromptConsumed={() => setChatPrompt(null)}
      />
    </div>
  )
}

/* ============================================================
   ILLUSTRATION SUB-COMPONENTS
   These are stylized SVG approximations of the hand-drawn
   illustrations in the design mockup. Replace any of them with
   real watercolor/hand-illustrated PNGs by:
     - dropping the image into /public/susquehanna/<name>.png
     - swapping the <svg>...</svg> for <img src="/susquehanna/<name>.png" />
   ============================================================ */

function HeroIllustration() {
  return (
    <div className="postcard relative aspect-[5/4] overflow-hidden rounded-lg">
      {/* backdrop scene: window with mountains + river */}
      <svg viewBox="0 0 500 400" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="hero-wall" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#e9d8b3" />
            <stop offset="100%" stopColor="#d8c79b" />
          </linearGradient>
          <linearGradient id="hero-sky" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#e9d8b3" />
            <stop offset="80%" stopColor="#cddbe0" />
          </linearGradient>
          <linearGradient id="hero-water" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#8aaab5" />
            <stop offset="100%" stopColor="#3b6877" />
          </linearGradient>
        </defs>
        <rect width="500" height="400" fill="url(#hero-wall)" />
        {/* wood panels */}
        <g opacity="0.4">
          <line x1="0" y1="260" x2="500" y2="260" stroke="#a16a35" strokeWidth="0.5" />
          <line x1="0" y1="310" x2="500" y2="310" stroke="#a16a35" strokeWidth="0.5" />
          <line x1="0" y1="350" x2="500" y2="350" stroke="#a16a35" strokeWidth="0.5" />
        </g>
        {/* window frame with view */}
        <g>
          <rect x="320" y="60" width="150" height="160" fill="url(#hero-sky)" stroke="#75694d" strokeWidth="2" />
          {/* distant mountains */}
          <path d="M320 170 L340 150 L370 165 L395 145 L425 160 L450 145 L470 160 L470 220 L320 220 Z" fill="#5f7549" opacity="0.7" />
          <path d="M320 180 L350 165 L385 175 L420 160 L450 170 L470 165 L470 220 L320 220 Z" fill="#465938" opacity="0.85" />
          {/* river */}
          <path d="M320 200 Q360 192 395 200 T470 200 L470 220 L320 220 Z" fill="url(#hero-water)" />
          {/* sun */}
          <circle cx="440" cy="100" r="14" fill="#c08c4a" opacity="0.65" />
        </g>
        {/* picture frames on wall */}
        <g stroke="#75694d" strokeWidth="1.5" fill="#f3ead2">
          <rect x="50" y="80" width="40" height="50" />
          <rect x="105" y="65" width="55" height="40" />
          <rect x="178" y="80" width="38" height="46" />
        </g>
        {/* counter / desk */}
        <rect x="50" y="260" width="430" height="90" fill="#a16a35" opacity="0.75" />
        <rect x="50" y="260" width="430" height="6" fill="#75694d" />
        {/* sign */}
        <g transform="translate(245 340)">
          <rect x="-50" y="-12" width="100" height="22" fill="#f3ead2" stroke="#75694d" strokeWidth="1" />
          <text x="0" y="3" textAnchor="middle" fontFamily="Fraunces, serif" fontSize="9" fill="#1b2f37">
            WELCOME
          </text>
          <text x="0" y="14" textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="8" fill="#3b6877">
            to The River Table
          </text>
        </g>
        {/* plant */}
        <g transform="translate(75 230)">
          <path d="M0 30 q-4 -22 0 -28 q4 6 0 28" fill="#5f7549" opacity="0.85" />
          <path d="M-4 30 q-10 -16 -2 -26 q6 8 2 26" fill="#7a9162" opacity="0.85" />
          <path d="M4 30 q10 -16 2 -26 q-6 8 -2 26" fill="#7a9162" opacity="0.85" />
          <rect x="-9" y="28" width="18" height="14" fill="#a16a35" />
        </g>
        {/* simplified figure at counter (hostess) */}
        <g transform="translate(245 230)">
          {/* hair bun */}
          <circle cx="0" cy="-30" r="8" fill="#3b2618" />
          <circle cx="0" cy="-40" r="5" fill="#3b2618" />
          {/* face */}
          <ellipse cx="0" cy="-18" rx="9" ry="10" fill="#e9c9a3" />
          {/* body */}
          <path d="M-18 -8 q0 -4 4 -6 q6 -3 14 -3 q8 0 14 3 q4 2 4 6 v36 h-36 z" fill="#3b3528" />
          {/* arms / tablet */}
          <rect x="-14" y="6" width="28" height="18" rx="2" fill="#1b2f37" />
          <rect x="-12" y="8" width="24" height="14" rx="1" fill="#cddbe0" />
        </g>
      </svg>

      {/* floating UI cards */}
      <div className="absolute left-4 top-4 max-w-[180px] rounded-lg border border-[#d8c79b] bg-[#fffaee]/95 p-3 shadow-sm backdrop-blur">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#75694d]">
          <svg className="h-3 w-3 text-[#3b6877]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 10h.01M12 10h.01M16 10h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /></svg>
          <span>Table for 4</span>
        </div>
        <div className="serif mt-1 text-[13px] text-[#1b2f37]">Tonight at 6:30 PM</div>
      </div>

      <div className="drift absolute left-4 bottom-32 max-w-[210px] rounded-lg border border-[#d8c79b] bg-[#fffaee]/95 p-3 shadow-md">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#5f7549]">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          Reservation Confirmed
        </div>
        <div className="serif mt-1.5 text-[14px] text-[#1b2f37]">The River Table</div>
        <div className="mt-1 text-[11px] text-[#3b3528]">6:30 PM · Table 12 · Special Occasion</div>
        <button className="mt-2 w-full rounded border border-[#cdbf9f] bg-[#f3ead2] px-2 py-1 text-[11px] font-medium text-[#1b2f37]">
          Add to Waitlist
        </button>
        <div className="mt-2 flex items-center gap-1 text-[10px] text-[#75694d]">
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
          Send Pre-Visit Note
        </div>
      </div>

      <div className="absolute right-4 bottom-4 max-w-[170px] rounded-lg border border-[#d8c79b] bg-[#fffaee]/95 p-3 shadow-md">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-[#1b2f37]">Tonight's Snapshot</div>
        <div className="mt-2 space-y-1 text-[11px]">
          <div className="flex justify-between text-[#3b3528]"><span>Reservations</span><span className="serif text-[#1b2f37]">28</span></div>
          <div className="flex justify-between text-[#3b3528]"><span>Walk-ins</span><span className="serif text-[#1b2f37]">9</span></div>
          <div className="flex justify-between text-[#3b3528]"><span>Waitlist</span><span className="serif text-[#1b2f37]">6</span></div>
        </div>
        <div className="mt-2 border-t border-[#cdbf9f]/60 pt-2 text-[10px] text-[#5f7549]">
          <div className="font-semibold uppercase tracking-widest">AI Suggestion</div>
          <div className="mt-1 text-[#3b3528] leading-snug">Prep for a busy 6–8pm window. Upsize staff and notify kitchen.</div>
        </div>
      </div>
    </div>
  )
}

function MissionIllustration() {
  return (
    <svg viewBox="0 0 500 400" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="mission-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#e9d8b3" />
          <stop offset="100%" stopColor="#f3ead2" />
        </linearGradient>
        <linearGradient id="mission-river" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#8aaab5" />
          <stop offset="100%" stopColor="#3b6877" />
        </linearGradient>
      </defs>
      <rect width="500" height="400" fill="url(#mission-sky)" />
      {/* distant mountains */}
      <path d="M0 180 L50 130 L100 160 L160 110 L220 150 L290 120 L360 155 L420 130 L500 165 L500 240 L0 240 Z" fill="#7a9162" opacity="0.55" />
      <path d="M0 200 L60 170 L130 195 L200 165 L260 190 L330 165 L400 195 L460 175 L500 200 L500 260 L0 260 Z" fill="#5f7549" opacity="0.75" />
      {/* bridge across river */}
      <g stroke="#75694d" strokeWidth="1.5" fill="#a16a35" opacity="0.8">
        <path d="M40 250 q30 -20 60 0 q30 -20 60 0 q30 -20 60 0 L220 260 L40 260 Z" />
        <line x1="50" y1="260" x2="50" y2="280" />
        <line x1="100" y1="260" x2="100" y2="280" />
        <line x1="150" y1="260" x2="150" y2="280" />
        <line x1="200" y1="260" x2="200" y2="280" />
      </g>
      {/* town */}
      <g>
        {/* church */}
        <rect x="240" y="200" width="40" height="60" fill="#a16a35" />
        <polygon points="240,200 260,170 280,200" fill="#75694d" />
        <rect x="255" y="175" width="10" height="20" fill="#75694d" />
        <polygon points="255,175 260,165 265,175" fill="#1b2f37" />
        {/* houses */}
        <rect x="290" y="220" width="35" height="40" fill="#c08c4a" />
        <polygon points="290,220 308,205 325,220" fill="#75694d" />
        <rect x="335" y="225" width="30" height="35" fill="#a16a35" />
        <polygon points="335,225 350,212 365,225" fill="#75694d" />
        <rect x="375" y="215" width="38" height="45" fill="#c08c4a" />
        <polygon points="375,215 394,200 413,215" fill="#75694d" />
        {/* windows */}
        <g fill="#f3ead2">
          <rect x="298" y="235" width="6" height="8" />
          <rect x="312" y="235" width="6" height="8" />
          <rect x="345" y="238" width="5" height="7" />
          <rect x="355" y="238" width="5" height="7" />
          <rect x="382" y="230" width="6" height="8" />
          <rect x="396" y="230" width="6" height="8" />
        </g>
      </g>
      {/* trees */}
      <g fill="#465938" opacity="0.9">
        <path d="M20 240 q4 -28 8 0" />
        <path d="M35 245 q5 -34 10 0" />
        <path d="M425 235 q5 -32 10 0" />
        <path d="M445 240 q4 -28 8 0" />
        <path d="M465 245 q4 -28 8 0" />
      </g>
      {/* river */}
      <path d="M0 300 Q120 280 240 295 T500 290 L500 400 L0 400 Z" fill="url(#mission-river)" />
      <path d="M40 320 Q140 305 240 315 T480 315" fill="none" stroke="#cddbe0" strokeWidth="1" opacity="0.7" />
      <path d="M20 340 Q150 325 260 335 T490 335" fill="none" stroke="#cddbe0" strokeWidth="1" opacity="0.5" />
    </svg>
  )
}

function TimelineRiver({ eras }: { eras: typeof ERAS }) {
  return (
    <div className="relative">
      {/* flowing river backdrop */}
      <svg viewBox="0 0 1200 360" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="tl-river" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#8aaab5" />
            <stop offset="100%" stopColor="#3b6877" />
          </linearGradient>
        </defs>
        {/* meandering river */}
        <path d="M0 200 Q150 140 320 200 T640 220 T960 200 T1200 240 L1200 360 L0 360 Z" fill="url(#tl-river)" opacity="0.6" />
        <path d="M0 220 Q150 160 320 220 T640 240 T960 220 T1200 260" fill="none" stroke="#cddbe0" strokeWidth="1" opacity="0.5" />
        <path d="M0 240 Q150 180 320 240 T640 260 T960 240 T1200 280" fill="none" stroke="#cddbe0" strokeWidth="1" opacity="0.4" />
        {/* pine trees scattered */}
        <g fill="#465938" opacity="0.85">
          <path d="M70 200 q4 -28 8 0 z" />
          <path d="M90 195 q5 -35 10 0 z" />
          <path d="M275 180 q5 -36 10 0 z" />
          <path d="M540 200 q5 -35 10 0 z" />
          <path d="M820 195 q5 -34 10 0 z" />
          <path d="M1100 165 q5 -36 10 0 z" />
          <path d="M1130 200 q4 -28 8 0 z" />
        </g>
        {/* small rowboat with 3 figures */}
        <g transform="translate(1010 240)">
          <path d="M-30 0 q30 14 60 0 L20 8 L-20 8 Z" fill="#75694d" />
          <circle cx="-12" cy="-6" r="3" fill="#3b3528" />
          <circle cx="0" cy="-7" r="3" fill="#3b3528" />
          <circle cx="12" cy="-6" r="3" fill="#3b3528" />
          <rect x="-13" y="-3" width="6" height="6" fill="#a16a35" />
          <rect x="-1" y="-4" width="6" height="7" fill="#a16a35" />
          <rect x="11" y="-3" width="6" height="6" fill="#a16a35" />
        </g>
      </svg>

      {/* era nodes */}
      <div className="reveal relative grid grid-cols-1 gap-y-12 pt-2 md:grid-cols-5 md:gap-x-2 md:pt-12">
        {eras.map((era, i) => (
          <div
            key={era.range}
            className={`relative px-3 ${i % 2 === 1 ? 'md:mt-24' : ''}`}
          >
            {/* pin */}
            <div className="mb-3 flex items-center gap-2">
              <svg viewBox="0 0 16 24" className="h-5 w-3.5 text-[#5f7549]" aria-hidden>
                <path d="M8 0 C3.5 0 0 3.5 0 8 C0 13 8 24 8 24 C8 24 16 13 16 8 C16 3.5 12.5 0 8 0 Z" fill="currentColor" />
                <circle cx="8" cy="8" r="3" fill="#f5efe1" />
              </svg>
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#75694d]">{era.range}</span>
            </div>
            <h3 className="serif text-[19px] font-medium leading-tight text-[#1b2f37]">{era.title}</h3>
            <p className="mt-2 max-w-[200px] text-[12.5px] leading-relaxed text-[#3b3528]">{era.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function TrustLogo({ name, sub, style }: { name: string; sub: string; style: 'script' | 'caps' | 'stack' }) {
  if (style === 'script') {
    return (
      <div className="text-center">
        <div className="text-[26px] leading-none text-[#1b2f37]" style={{ fontFamily: "'Caveat', cursive", fontWeight: 600 }}>
          {name}
        </div>
        <div className="mt-1 text-[9px] uppercase tracking-[0.26em] text-[#75694d]">{sub}</div>
      </div>
    )
  }
  if (style === 'stack') {
    return (
      <div className="text-center">
        <div className="serif text-[16px] font-medium uppercase tracking-[0.12em] leading-none text-[#1b2f37]">
          {name}
        </div>
        <div className="serif mt-0.5 text-[16px] font-medium uppercase tracking-[0.12em] leading-none text-[#1b2f37]">
          {sub}
        </div>
      </div>
    )
  }
  return (
    <div className="text-center">
      <div className="serif text-[16px] font-medium uppercase tracking-[0.16em] text-[#1b2f37]">
        {name}
      </div>
      <div className="mt-0.5 text-[9px] uppercase tracking-[0.26em] text-[#75694d]">{sub}</div>
    </div>
  )
}

function RestaurantCard({ title, body, icon }: { title: string; body: string; icon: React.ReactNode }) {
  return (
    <div className="feature-card rounded-lg p-4 text-center">
      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center text-[#1b2f37]">{icon}</div>
      <h4 className="serif text-[15px] font-medium leading-tight text-[#1b2f37]">{title}</h4>
      <p className="mt-2 text-[12px] leading-snug text-[#3b3528]">{body}</p>
    </div>
  )
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      {/* rotary phone */}
      <rect x="10" y="22" width="28" height="14" rx="2" />
      <rect x="14" y="14" width="20" height="10" rx="5" />
      <circle cx="24" cy="29" r="4" />
      <circle cx="24" cy="29" r="1.4" fill="currentColor" />
      <path d="M10 36 q-3 6 4 6 h20 q7 0 4 -6" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      {/* hotel bell */}
      <path d="M10 32 q14 -22 28 0" />
      <line x1="8" y1="34" x2="40" y2="34" />
      <line x1="24" y1="12" x2="24" y2="10" />
      <circle cx="24" cy="9" r="1.6" fill="currentColor" />
      <line x1="8" y1="38" x2="40" y2="38" />
    </svg>
  )
}

function EnvelopeIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="14" width="32" height="22" rx="1.5" />
      <path d="M8 16 L24 28 L40 16" />
      {/* heart */}
      <path d="M24 22 q-2 -3 -4 -1 q-2 2 4 6 q6 -4 4 -6 q-2 -2 -4 1 z" fill="currentColor" opacity="0.8" />
    </svg>
  )
}

function SocialIcon({ kind }: { kind: 'facebook' | 'instagram' | 'linkedin' }) {
  const paths = {
    facebook: <path d="M22 12c0-5.5-4.5-10-10-10S2 6.5 2 12c0 5 3.7 9.1 8.4 9.9v-7H8v-2.9h2.4V9.8c0-2.4 1.4-3.7 3.6-3.7 1 0 2.1.2 2.1.2v2.3h-1.2c-1.2 0-1.5.7-1.5 1.5v1.8H16l-.4 2.9h-2.2v7C18.3 21.1 22 17 22 12z" fill="currentColor" />,
    instagram: <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17" cy="7" r="1" fill="currentColor" /></g>,
    linkedin: <g fill="currentColor"><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /><path d="M9 9h4v2c.7-1.2 2.2-2.3 4-2.3 3.2 0 4 2 4 4.5V21h-4v-6c0-1.4-.5-2.3-1.8-2.3-1.4 0-2.2 1-2.2 2.3v6H9z" /></g>,
  }
  return (
    <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#cdbf9f] text-[#75694d] transition hover:border-[#c08c4a] hover:text-[#1b2f37]" aria-label={kind}>
      <svg className="h-4 w-4" viewBox="0 0 24 24">{paths[kind]}</svg>
    </a>
  )
}
