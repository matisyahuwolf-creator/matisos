import { useEffect, useRef, useState } from 'react'
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

  /* reveal on scroll — staggered cubic curve */
  #susq-landing .reveal { opacity: 0; transform: translateY(20px); transition: opacity 900ms cubic-bezier(0.22, 1, 0.36, 1), transform 900ms cubic-bezier(0.22, 1, 0.36, 1); }
  #susq-landing .reveal.in { opacity: 1; transform: none; }

  /* stagger children — applied via inline style with --i index */
  #susq-landing .stagger-child {
    opacity: 0;
    transform: translateY(16px);
    transition: opacity 800ms cubic-bezier(0.22, 1, 0.36, 1), transform 800ms cubic-bezier(0.22, 1, 0.36, 1);
    transition-delay: calc(var(--i, 0) * 90ms);
  }
  #susq-landing .reveal.in .stagger-child { opacity: 1; transform: none; }

  /* bounce dots */
  @keyframes susq-bounce {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
    40% { transform: translateY(-4px); opacity: 1; }
  }

  /* stamp — rotates, gently jiggles on hover of postcard */
  #susq-landing .stamp { transform: rotate(8deg); transition: transform 320ms cubic-bezier(0.22, 1, 0.36, 1); }
  #susq-landing .postcard:hover .stamp { transform: rotate(4deg) scale(1.02); }

  /* postcard subtle 3D tilt on hover */
  #susq-landing .postcard {
    transition: transform 400ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 400ms cubic-bezier(0.22, 1, 0.36, 1);
  }
  #susq-landing .postcard:hover {
    transform: translateY(-3px);
    box-shadow:
      0 1px 0 rgba(255,255,255,0.4) inset,
      0 26px 50px -22px rgba(122, 95, 58, 0.32),
      0 2px 6px rgba(122, 95, 58, 0.1);
  }

  /* swaying trees / reeds */
  @keyframes susq-sway-a { 0%,100% { transform: rotate(-1.5deg); } 50% { transform: rotate(1.5deg); } }
  @keyframes susq-sway-b { 0%,100% { transform: rotate(2deg); } 50% { transform: rotate(-2deg); } }
  #susq-landing .sway-a { animation: susq-sway-a 5.5s ease-in-out infinite; transform-origin: center bottom; }
  #susq-landing .sway-b { animation: susq-sway-b 7s ease-in-out infinite; transform-origin: center bottom; }

  /* bobbing boat */
  @keyframes susq-bob {
    0%,100% { transform: translate(0, 0) rotate(-1.5deg); }
    50% { transform: translate(0, -3px) rotate(1.5deg); }
  }
  #susq-landing .bob { animation: susq-bob 6s ease-in-out infinite; transform-origin: center bottom; }

  /* river current — flowing dashed line */
  @keyframes susq-current { to { stroke-dashoffset: -240; } }
  #susq-landing .current { stroke-dasharray: 4 8; animation: susq-current 14s linear infinite; }
  #susq-landing .current-slow { stroke-dasharray: 6 12; animation: susq-current 22s linear infinite; }

  /* water shimmer — gradient shift */
  @keyframes susq-shimmer {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.7; }
  }
  #susq-landing .shimmer { animation: susq-shimmer 4s ease-in-out infinite; }

  /* SVG stroke draw on enter */
  @keyframes susq-draw {
    to { stroke-dashoffset: 0; }
  }
  #susq-landing .reveal.in .draw-on-enter {
    stroke-dasharray: 400;
    stroke-dashoffset: 400;
    animation: susq-draw 1800ms cubic-bezier(0.65, 0, 0.35, 1) forwards;
    animation-delay: calc(var(--draw-delay, 0) * 1ms);
  }

  /* floating UI cards in hero — different drift speeds for parallax feel */
  @keyframes susq-float-1 {
    0%,100% { transform: translate(0, 0); }
    50% { transform: translate(0, -8px); }
  }
  @keyframes susq-float-2 {
    0%,100% { transform: translate(0, 0); }
    50% { transform: translate(-2px, -10px); }
  }
  @keyframes susq-float-3 {
    0%,100% { transform: translate(0, 0); }
    50% { transform: translate(2px, -6px); }
  }
  #susq-landing .float-1 { animation: susq-float-1 6s ease-in-out infinite; }
  #susq-landing .float-2 { animation: susq-float-2 7.5s ease-in-out infinite; }
  #susq-landing .float-3 { animation: susq-float-3 5.5s ease-in-out infinite; }

  /* card entrance — fade + small scale */
  @keyframes susq-card-in {
    from { opacity: 0; transform: translateY(14px) scale(0.96); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  #susq-landing .card-enter {
    opacity: 0;
    animation: susq-card-in 800ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
    animation-delay: calc(var(--delay, 0) * 1ms);
  }

  /* ochre dot pop-in for charter counter */
  @keyframes susq-pop {
    0% { transform: scale(0); opacity: 0; }
    60% { transform: scale(1.2); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }
  #susq-landing .reveal.in .pop-in {
    animation: susq-pop 600ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    animation-delay: calc(var(--i, 0) * 110ms + 200ms);
    transform: scale(0);
  }

  /* button shine */
  #susq-landing .btn-shine {
    position: relative;
    overflow: hidden;
  }
  #susq-landing .btn-shine::after {
    content: '';
    position: absolute;
    top: 0;
    left: -75%;
    width: 50%;
    height: 100%;
    background: linear-gradient(120deg, transparent, rgba(255,255,255,0.25), transparent);
    transform: skewX(-25deg);
    transition: left 700ms cubic-bezier(0.22, 1, 0.36, 1);
  }
  #susq-landing .btn-shine:hover::after { left: 125%; }

  /* feature card icon micro-bounce on hover */
  #susq-landing .feature-card .icon-wrap { transition: transform 320ms cubic-bezier(0.22, 1, 0.36, 1); }
  #susq-landing .feature-card:hover .icon-wrap { transform: translateY(-3px) scale(1.05); }

  /* paper texture overlay for cards */
  #susq-landing .paper-tex {
    position: relative;
  }
  #susq-landing .paper-tex::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: inherit;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.16 0 0 0 0 0.13 0 0 0 0 0.09 0 0 0 0.04 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    mix-blend-mode: multiply;
    opacity: 0.5;
  }

  /* section-transition gradient bleed */
  #susq-landing .bleed-top {
    background: linear-gradient(to bottom, rgba(243, 234, 210, 0.6) 0%, transparent 80px);
  }
  #susq-landing .bleed-bot {
    background: linear-gradient(to top, rgba(243, 234, 210, 0.6) 0%, transparent 80px);
  }
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
            {SERVICES.map((s, i) => (
              <div
                key={s.title}
                className="feature-card stagger-child paper-tex rounded-xl p-5 text-center"
                style={{ ['--i' as string]: i }}
              >
                <div className="icon-wrap mx-auto mb-4 h-12 w-12 text-[#1b2f37]">{s.icon}</div>
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
                {STATS.map((s, i) => (
                  <div key={s.label} className="stagger-child" style={{ ['--i' as string]: i }}>
                    <div className="flex items-center gap-1.5 text-[#a16a35]">
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M9 12l2 2 4-4" />
                      </svg>
                    </div>
                    <div className="serif mt-1 text-[28px] font-medium leading-none text-[#1b2f37]">
                      <Counter value={s.value} delay={i * 90 + 200} />
                    </div>
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

              <div className="reveal text-center md:col-span-3">
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
                      style={{ ['--i' as string]: i }}
                      className={`pop-in h-3 w-3 rounded-full ${
                        i < CHARTER_CLAIMED
                          ? 'bg-[#c08c4a] shadow-[0_0_10px_rgba(192,140,74,0.6)]'
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

/** Animated count-up for stat values. Parses leading digits, preserves suffix. */
function Counter({ value, delay = 0, duration = 1400 }: { value: string; delay?: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState<string>(() => {
    const m = value.match(/^([\d,]+)(.*)$/)
    if (!m) return value
    return '0' + m[2]
  })
  const startedRef = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const match = value.match(/^([\d,]+)(.*)$/)
    if (!match) {
      setDisplay(value)
      return
    }
    const target = parseInt(match[1].replace(/,/g, ''), 10)
    const suffix = match[2]

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !startedRef.current) {
            startedRef.current = true
            const start = performance.now() + delay
            let raf = 0
            const step = (now: number) => {
              const t = Math.min(1, Math.max(0, (now - start) / duration))
              // easeOutCubic
              const eased = 1 - Math.pow(1 - t, 3)
              const current = Math.round(target * eased)
              const formatted = target >= 1000 ? current.toLocaleString() : String(current)
              setDisplay(formatted + suffix)
              if (t < 1) raf = requestAnimationFrame(step)
            }
            raf = requestAnimationFrame(step)
            return () => cancelAnimationFrame(raf)
          }
        })
      },
      { threshold: 0.3 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [value, delay, duration])

  return <span ref={ref}>{display}</span>
}

function HeroIllustration() {
  return (
    <div className="postcard relative aspect-[5/4] overflow-hidden rounded-lg">
      {/* backdrop scene: warm interior with window view */}
      <svg viewBox="0 0 500 400" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="hero-wall" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#ecdbaf" />
            <stop offset="50%" stopColor="#e2cb95" />
            <stop offset="100%" stopColor="#d2b97c" />
          </linearGradient>
          <linearGradient id="hero-sky" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#f0dbb0" />
            <stop offset="60%" stopColor="#e0d5b6" />
            <stop offset="100%" stopColor="#bcd1d5" />
          </linearGradient>
          <linearGradient id="hero-water" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#8aaab5" />
            <stop offset="100%" stopColor="#2e525e" />
          </linearGradient>
          <linearGradient id="hero-counter" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#a16a35" />
            <stop offset="100%" stopColor="#6e4520" />
          </linearGradient>
          <radialGradient id="hero-glow" cx="0.85" cy="0.25" r="0.6">
            <stop offset="0%" stopColor="#f3deaa" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#f3deaa" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#f3deaa" stopOpacity="0" />
          </radialGradient>
          <pattern id="hero-wood" x="0" y="0" width="500" height="14" patternUnits="userSpaceOnUse">
            <line x1="0" y1="7" x2="500" y2="7" stroke="#7a4a1f" strokeWidth="0.4" opacity="0.35" />
            <path d="M40 7 q20 -2 40 0 q20 2 40 0" fill="none" stroke="#7a4a1f" strokeWidth="0.25" opacity="0.3" />
            <path d="M180 7 q15 -1.5 30 0 q15 1.5 30 0" fill="none" stroke="#7a4a1f" strokeWidth="0.25" opacity="0.3" />
            <path d="M340 7 q20 -2 40 0 q20 2 40 0" fill="none" stroke="#7a4a1f" strokeWidth="0.25" opacity="0.3" />
          </pattern>
        </defs>

        <rect width="500" height="400" fill="url(#hero-wall)" />
        {/* warm glow from window */}
        <rect width="500" height="400" fill="url(#hero-glow)" />

        {/* wall texture — subtle stippling */}
        <g opacity="0.18">
          {Array.from({ length: 36 }).map((_, i) => (
            <circle key={i} cx={(i * 47) % 500} cy={(i * 31) % 260} r="0.6" fill="#7a4a1f" />
          ))}
        </g>

        {/* window frame */}
        <g>
          {/* outer frame */}
          <rect x="310" y="48" width="170" height="180" fill="#5b3a1c" stroke="#3b2618" strokeWidth="2" />
          {/* inner glass area */}
          <rect x="318" y="56" width="154" height="164" fill="url(#hero-sky)" />
          {/* far mountains */}
          <path d="M318 156 L334 130 L352 142 L378 122 L402 138 L424 124 L446 138 L472 124 L472 220 L318 220 Z" fill="#7a9162" opacity="0.55" />
          {/* mid mountains */}
          <path d="M318 172 L336 152 L360 168 L388 148 L412 164 L438 148 L466 164 L472 162 L472 220 L318 220 Z" fill="#5f7549" opacity="0.75" />
          {/* close treeline */}
          <path d="M318 188 L328 178 L340 184 L352 176 L366 184 L380 176 L394 184 L408 178 L424 184 L440 178 L456 184 L472 178 L472 220 L318 220 Z" fill="#465938" opacity="0.9" />
          {/* river under bridge */}
          <path d="M318 200 Q360 192 400 200 T472 198 L472 220 L318 220 Z" fill="url(#hero-water)" />
          {/* river shimmer */}
          <path d="M328 206 Q368 200 408 205 T468 204" fill="none" stroke="#cddbe0" strokeWidth="0.8" opacity="0.6" />
          <path d="M324 213 Q360 208 396 211 T468 210" fill="none" stroke="#cddbe0" strokeWidth="0.6" opacity="0.4" />
          {/* sun + warm halo */}
          <circle cx="448" cy="92" r="22" fill="#f3deaa" opacity="0.55" />
          <circle cx="448" cy="92" r="13" fill="#c08c4a" opacity="0.8" />
          {/* clouds */}
          <ellipse cx="350" cy="82" rx="18" ry="3" fill="#f5efe1" opacity="0.7" />
          <ellipse cx="380" cy="90" rx="14" ry="2.5" fill="#f5efe1" opacity="0.55" />
          {/* mullions */}
          <line x1="395" y1="56" x2="395" y2="220" stroke="#3b2618" strokeWidth="1.5" opacity="0.8" />
          <line x1="318" y1="138" x2="472" y2="138" stroke="#3b2618" strokeWidth="1.5" opacity="0.8" />
        </g>

        {/* picture frames on wall */}
        <g>
          <g stroke="#5b3a1c" strokeWidth="2" fill="#f3ead2">
            <rect x="50" y="78" width="42" height="54" />
          </g>
          <g stroke="#5b3a1c" strokeWidth="1.5" fill="#7a9162" opacity="0.7">
            <path d="M55 92 q5 -8 10 0 q5 -10 12 -2 q4 -6 10 0 v34 h-32 z" />
          </g>
          <g stroke="#5b3a1c" strokeWidth="2" fill="#f3ead2">
            <rect x="108" y="62" width="58" height="42" />
          </g>
          {/* drawing of a river */}
          <g stroke="#3b6877" strokeWidth="1.2" fill="none" opacity="0.8">
            <path d="M112 88 Q124 80 138 86 T164 84" />
            <path d="M112 96 Q124 90 138 94 T164 92" />
          </g>
          <g stroke="#5b3a1c" strokeWidth="2" fill="#f3ead2">
            <rect x="184" y="78" width="38" height="50" />
          </g>
          <text x="203" y="106" textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="11" fill="#75694d">est.</text>
          <text x="203" y="120" textAnchor="middle" fontFamily="Fraunces, serif" fontSize="13" fill="#3b2618">2026</text>
        </g>

        {/* shelf with books */}
        <g transform="translate(35 145)">
          <rect x="0" y="40" width="245" height="3" fill="#5b3a1c" />
          <g>
            <rect x="6" y="20" width="6" height="20" fill="#5f7549" />
            <rect x="13" y="24" width="6" height="16" fill="#a16a35" />
            <rect x="20" y="18" width="6" height="22" fill="#3b6877" />
            <rect x="27" y="22" width="6" height="18" fill="#c08c4a" />
            <rect x="34" y="20" width="6" height="20" fill="#465938" />
            <rect x="48" y="26" width="14" height="14" rx="1" fill="#a16a35" />
            <circle cx="55" cy="33" r="3" fill="#f3deaa" />
          </g>
        </g>

        {/* counter / desk */}
        <rect x="40" y="270" width="440" height="100" fill="url(#hero-counter)" />
        <rect x="40" y="270" width="440" height="14" fill="url(#hero-wood)" />
        <rect x="40" y="270" width="440" height="2" fill="#3b2618" />
        {/* shadow under counter */}
        <rect x="40" y="368" width="440" height="6" fill="#1b1208" opacity="0.4" />

        {/* sign on counter */}
        <g transform="translate(255 350)">
          <rect x="-58" y="-14" width="116" height="26" rx="1.5" fill="#f3ead2" stroke="#5b3a1c" strokeWidth="1.2" />
          <text x="0" y="-2" textAnchor="middle" fontFamily="Fraunces, serif" fontSize="9" letterSpacing="2" fill="#1b2f37">WELCOME</text>
          <text x="0" y="9" textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="9" fill="#3b6877">to The River Table</text>
        </g>

        {/* potted plant — fronds (with sway via class) */}
        <g transform="translate(80 250)">
          <g className="sway-a">
            <path d="M0 38 Q-2 18 -2 -2 Q4 18 0 38 Z" fill="#5f7549" opacity="0.9" />
            <path d="M-6 40 Q-14 22 -10 4 Q-2 22 -6 40 Z" fill="#7a9162" opacity="0.9" />
            <path d="M6 40 Q14 22 10 4 Q2 22 6 40 Z" fill="#7a9162" opacity="0.85" />
            <path d="M-12 42 Q-22 28 -18 14 Q-8 28 -12 42 Z" fill="#465938" opacity="0.8" />
            <path d="M12 42 Q22 28 18 14 Q8 28 12 42 Z" fill="#465938" opacity="0.85" />
          </g>
          {/* pot */}
          <path d="M-14 40 L14 40 L11 60 L-11 60 Z" fill="#a16a35" />
          <ellipse cx="0" cy="40" rx="14" ry="3" fill="#5b3a1c" />
          <line x1="-13" y1="46" x2="13" y2="46" stroke="#5b3a1c" strokeWidth="0.5" opacity="0.6" />
        </g>

        {/* hostess figure */}
        <g transform="translate(250 215)">
          {/* hair bun back */}
          <ellipse cx="0" cy="-43" rx="7" ry="6" fill="#1f1108" />
          {/* head */}
          <ellipse cx="0" cy="-22" rx="11" ry="13" fill="#e9c9a3" />
          {/* cheek tone */}
          <ellipse cx="-5" cy="-19" rx="2" ry="1.5" fill="#d4a380" opacity="0.7" />
          <ellipse cx="5" cy="-19" rx="2" ry="1.5" fill="#d4a380" opacity="0.7" />
          {/* eyes */}
          <ellipse cx="-3.5" cy="-23" rx="1" ry="0.6" fill="#1b1208" />
          <ellipse cx="3.5" cy="-23" rx="1" ry="0.6" fill="#1b1208" />
          {/* smile */}
          <path d="M-3 -16 q3 2 6 0" fill="none" stroke="#7a4a1f" strokeWidth="1" strokeLinecap="round" />
          {/* hair front strands */}
          <path d="M-11 -28 q-2 -8 4 -14 q6 -4 11 -2" fill="none" stroke="#1f1108" strokeWidth="2.5" strokeLinecap="round" />
          {/* hair top bun */}
          <ellipse cx="0" cy="-36" rx="6" ry="5" fill="#2a1a0c" />
          <ellipse cx="-1" cy="-37" rx="3" ry="2.5" fill="#1f1108" />
          {/* shoulders / blouse */}
          <path d="M-22 -7 Q-20 -12 -14 -14 Q-7 -16 0 -16 Q7 -16 14 -14 Q20 -12 22 -7 L24 30 L-24 30 Z" fill="#3b3528" />
          {/* button line */}
          <line x1="0" y1="-10" x2="0" y2="22" stroke="#1f1108" strokeWidth="0.5" opacity="0.6" />
          <circle cx="0" cy="-4" r="0.8" fill="#a16a35" />
          <circle cx="0" cy="6" r="0.8" fill="#a16a35" />
          <circle cx="0" cy="16" r="0.8" fill="#a16a35" />
          {/* arms forward */}
          <path d="M-18 0 Q-22 10 -16 18" fill="none" stroke="#3b3528" strokeWidth="9" strokeLinecap="round" />
          <path d="M18 0 Q22 10 16 18" fill="none" stroke="#3b3528" strokeWidth="9" strokeLinecap="round" />
          {/* hands */}
          <circle cx="-14" cy="20" r="3.5" fill="#e9c9a3" />
          <circle cx="14" cy="20" r="3.5" fill="#e9c9a3" />
          {/* tablet */}
          <rect x="-16" y="18" width="32" height="22" rx="2.5" fill="#1b2f37" />
          <rect x="-14" y="20" width="28" height="18" rx="1" fill="#cddbe0" />
          {/* tablet content */}
          <rect x="-12" y="22" width="14" height="1.2" fill="#3b6877" />
          <rect x="-12" y="25" width="22" height="1" fill="#75694d" opacity="0.6" />
          <rect x="-12" y="28" width="18" height="1" fill="#75694d" opacity="0.6" />
          <rect x="-12" y="33" width="10" height="3" rx="0.5" fill="#c08c4a" />
        </g>
      </svg>

      {/* floating UI cards — staggered entry, gentle individual drift */}
      <div
        className="card-enter float-1 absolute left-4 top-4 max-w-[180px] rounded-lg border border-[#d8c79b] bg-[#fffaee]/95 p-3 shadow-[0_8px_20px_-10px_rgba(122,95,58,0.35)] backdrop-blur"
        style={{ ['--delay' as string]: 300 }}
      >
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#75694d]">
          <svg className="h-3 w-3 text-[#3b6877]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8 v4 l3 2" />
          </svg>
          <span>Table for 4</span>
        </div>
        <div className="serif mt-1 text-[13px] text-[#1b2f37]">Tonight at 6:30 PM</div>
      </div>

      <div
        className="card-enter float-2 absolute left-4 bottom-32 max-w-[210px] rounded-lg border border-[#d8c79b] bg-[#fffaee]/95 p-3 shadow-[0_14px_28px_-14px_rgba(122,95,58,0.4)]"
        style={{ ['--delay' as string]: 600 }}
      >
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#5f7549]">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          Reservation Confirmed
        </div>
        <div className="serif mt-1.5 text-[14px] text-[#1b2f37]">The River Table</div>
        <div className="mt-1 text-[11px] text-[#3b3528]">6:30 PM · Table 12 · Special Occasion</div>
        <button className="mt-2 w-full rounded border border-[#cdbf9f] bg-[#f3ead2] px-2 py-1 text-[11px] font-medium text-[#1b2f37] transition hover:bg-[#ecdbaf]">
          Add to Waitlist
        </button>
        <div className="mt-2 flex items-center gap-1 text-[10px] text-[#75694d]">
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
          Send Pre-Visit Note
        </div>
      </div>

      <div
        className="card-enter float-3 absolute right-4 bottom-4 max-w-[170px] rounded-lg border border-[#d8c79b] bg-[#fffaee]/95 p-3 shadow-[0_14px_28px_-14px_rgba(122,95,58,0.4)]"
        style={{ ['--delay' as string]: 900 }}
      >
        <div className="text-[10px] font-semibold uppercase tracking-widest text-[#1b2f37]">Tonight's Snapshot</div>
        <div className="mt-2 space-y-1 text-[11px]">
          <div className="flex justify-between text-[#3b3528]"><span>Reservations</span><span className="serif text-[#1b2f37]">28</span></div>
          <div className="flex justify-between text-[#3b3528]"><span>Walk-ins</span><span className="serif text-[#1b2f37]">9</span></div>
          <div className="flex justify-between text-[#3b3528]"><span>Waitlist</span><span className="serif text-[#1b2f37]">6</span></div>
        </div>
        <div className="mt-2 border-t border-[#cdbf9f]/60 pt-2 text-[10px] text-[#5f7549]">
          <div className="font-semibold uppercase tracking-widest">AI Suggestion</div>
          <div className="mt-1 leading-snug text-[#3b3528]">Prep for a busy 6–8pm window. Upsize staff and notify kitchen.</div>
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
          <stop offset="0%" stopColor="#f0dbb0" />
          <stop offset="40%" stopColor="#ebd9b0" />
          <stop offset="80%" stopColor="#dbcfa8" />
          <stop offset="100%" stopColor="#bfc9b5" />
        </linearGradient>
        <linearGradient id="mission-far-mtn" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#8aaab5" />
          <stop offset="100%" stopColor="#5f7549" />
        </linearGradient>
        <linearGradient id="mission-river" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#9bb3bb" />
          <stop offset="50%" stopColor="#6d8d97" />
          <stop offset="100%" stopColor="#2e525e" />
        </linearGradient>
      </defs>

      <rect width="500" height="400" fill="url(#mission-sky)" />

      {/* sun glow */}
      <circle cx="120" cy="80" r="50" fill="#f3deaa" opacity="0.55" />
      <circle cx="120" cy="80" r="22" fill="#c08c4a" opacity="0.65" />

      {/* clouds */}
      <g fill="#f5efe1" opacity="0.65">
        <ellipse cx="220" cy="60" rx="34" ry="5" />
        <ellipse cx="260" cy="68" rx="22" ry="4" />
        <ellipse cx="350" cy="50" rx="28" ry="5" />
        <ellipse cx="400" cy="78" rx="20" ry="3.5" />
      </g>

      {/* distant mountain ridges */}
      <path d="M0 170 L40 130 L80 150 L130 110 L180 145 L230 115 L280 145 L320 120 L370 150 L420 130 L470 145 L500 138 L500 220 L0 220 Z" fill="url(#mission-far-mtn)" opacity="0.5" />
      <path d="M0 190 L50 160 L100 180 L160 145 L210 175 L270 150 L320 175 L380 152 L430 175 L500 160 L500 240 L0 240 Z" fill="#5f7549" opacity="0.75" />
      {/* mid hill */}
      <path d="M0 220 L70 195 L150 215 L230 185 L310 215 L390 195 L470 218 L500 210 L500 270 L0 270 Z" fill="#465938" opacity="0.85" />

      {/* tree band on hills */}
      <g fill="#3b4d2a" opacity="0.7">
        <path d="M30 220 q3 -10 6 0" />
        <path d="M44 218 q3 -12 6 0" />
        <path d="M82 215 q3 -11 6 0" />
        <path d="M170 212 q3 -10 6 0" />
        <path d="M250 205 q3 -12 6 0" />
        <path d="M330 215 q3 -10 6 0" />
        <path d="M412 210 q3 -11 6 0" />
      </g>

      {/* bridge across river */}
      <g>
        {/* stone arches */}
        <path d="M40 260 q24 -22 48 0 q24 -22 48 0 q24 -22 48 0 L184 268 L40 268 Z" fill="#bca27c" stroke="#7a4a1f" strokeWidth="1.2" />
        {/* stone texture */}
        <g stroke="#7a4a1f" strokeWidth="0.4" opacity="0.55" fill="none">
          <line x1="50" y1="252" x2="58" y2="252" />
          <line x1="68" y1="246" x2="78" y2="246" />
          <line x1="96" y1="252" x2="106" y2="252" />
          <line x1="120" y1="246" x2="130" y2="246" />
          <line x1="148" y1="252" x2="158" y2="252" />
        </g>
        {/* roadway */}
        <rect x="40" y="240" width="144" height="4" fill="#a16a35" />
        {/* underside shadow */}
        <path d="M40 268 q24 -22 48 0 q24 -22 48 0 q24 -22 48 0" fill="none" stroke="#3b2618" strokeWidth="0.6" opacity="0.5" />
      </g>

      {/* town buildings */}
      <g>
        {/* church */}
        <rect x="235" y="195" width="44" height="68" fill="#b97a3d" />
        <polygon points="235,195 257,165 279,195" fill="#5b3a1c" />
        <rect x="253" y="170" width="8" height="22" fill="#5b3a1c" />
        <polygon points="253,170 257,158 261,170" fill="#1b1208" />
        <rect x="251" y="158" width="1.2" height="6" fill="#1b1208" />
        {/* church windows */}
        <g fill="#f5efe1">
          <rect x="245" y="215" width="6" height="14" rx="3" />
          <rect x="263" y="215" width="6" height="14" rx="3" />
        </g>
        {/* clock */}
        <circle cx="257" cy="190" r="3" fill="#f5efe1" stroke="#5b3a1c" strokeWidth="0.5" />

        {/* houses */}
        <rect x="288" y="220" width="38" height="44" fill="#c08c4a" />
        <polygon points="288,220 307,200 326,220" fill="#5b3a1c" />
        <rect x="290" y="200" width="2" height="6" fill="#5b3a1c" />

        <rect x="334" y="230" width="32" height="34" fill="#a16a35" />
        <polygon points="334,230 350,215 366,230" fill="#5b3a1c" />

        <rect x="372" y="215" width="42" height="48" fill="#c08c4a" />
        <polygon points="372,215 393,198 414,215" fill="#5b3a1c" />
        <rect x="374" y="198" width="2" height="8" fill="#5b3a1c" />

        <rect x="420" y="225" width="32" height="38" fill="#a16a35" />
        <polygon points="420,225 436,210 452,225" fill="#5b3a1c" />

        {/* window grid */}
        <g fill="#f3ead2">
          <rect x="294" y="232" width="5" height="6" />
          <rect x="304" y="232" width="5" height="6" />
          <rect x="294" y="244" width="5" height="6" />
          <rect x="304" y="244" width="5" height="6" />
          <rect x="314" y="232" width="5" height="6" />
          <rect x="314" y="244" width="5" height="6" />

          <rect x="340" y="240" width="5" height="6" />
          <rect x="350" y="240" width="5" height="6" />
          <rect x="356" y="240" width="5" height="6" />

          <rect x="378" y="227" width="5" height="7" />
          <rect x="388" y="227" width="5" height="7" />
          <rect x="398" y="227" width="5" height="7" />
          <rect x="378" y="240" width="5" height="7" />
          <rect x="388" y="240" width="5" height="7" />
          <rect x="398" y="240" width="5" height="7" />

          <rect x="426" y="236" width="4" height="6" />
          <rect x="436" y="236" width="4" height="6" />
          <rect x="446" y="236" width="4" height="6" />
        </g>
      </g>

      {/* trees foreground */}
      <g fill="#465938">
        <g className="sway-a" style={{ transformOrigin: '24px 248px' }}>
          <path d="M20 248 q4 -32 8 0 z" />
        </g>
        <g className="sway-b" style={{ transformOrigin: '38px 252px' }}>
          <path d="M34 252 q5 -38 10 0 z" />
        </g>
        <g className="sway-a" style={{ transformOrigin: '462px 248px' }}>
          <path d="M458 248 q4 -32 8 0 z" />
        </g>
        <g className="sway-b" style={{ transformOrigin: '478px 252px' }}>
          <path d="M474 252 q5 -38 10 0 z" />
        </g>
      </g>

      {/* river */}
      <path d="M0 310 Q120 286 240 302 T500 296 L500 400 L0 400 Z" fill="url(#mission-river)" />
      {/* river highlights — animated */}
      <path d="M40 326 Q140 310 240 320 T480 320" fill="none" stroke="#cddbe0" strokeWidth="1" opacity="0.7" className="current-slow" />
      <path d="M20 346 Q150 332 260 342 T490 342" fill="none" stroke="#cddbe0" strokeWidth="0.8" opacity="0.5" className="current" />
      {/* ripples */}
      <g fill="none" stroke="#cddbe0" strokeWidth="0.5" opacity="0.5">
        <ellipse cx="110" cy="340" rx="14" ry="2" />
        <ellipse cx="320" cy="335" rx="14" ry="2" />
        <ellipse cx="430" cy="350" rx="14" ry="2" />
      </g>
      {/* sun glint */}
      <ellipse cx="240" cy="315" rx="40" ry="3" fill="#f3deaa" opacity="0.45" />
    </svg>
  )
}

function TimelineRiver({ eras }: { eras: typeof ERAS }) {
  // pine tree silhouette
  const tree = (x: number, y: number, h: number, sway: 'a' | 'b' = 'a', opacity = 0.85, color = '#465938') => (
    <g
      transform={`translate(${x} ${y})`}
      className={sway === 'a' ? 'sway-a' : 'sway-b'}
      style={{ transformOrigin: `${x}px ${y}px` }}
    >
      <path d={`M0 0 L-2 ${-h * 0.25} L2 ${-h * 0.25} Z`} fill={color} opacity={opacity} />
      <path d={`M0 ${-h * 0.2} L-${h * 0.18} ${-h * 0.5} L${h * 0.18} ${-h * 0.5} Z`} fill={color} opacity={opacity} />
      <path d={`M0 ${-h * 0.4} L-${h * 0.24} ${-h * 0.75} L${h * 0.24} ${-h * 0.75} Z`} fill={color} opacity={opacity} />
      <path d={`M0 ${-h * 0.6} L-${h * 0.3} ${-h} L${h * 0.3} ${-h} Z`} fill={color} opacity={opacity} />
      <line x1="0" y1="-2" x2="0" y2={-h * 0.25} stroke={color} strokeWidth="1.2" />
    </g>
  )

  return (
    <div className="relative">
      {/* flowing river backdrop */}
      <svg viewBox="0 0 1200 360" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="tl-river" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#a4bcc4" />
            <stop offset="50%" stopColor="#6d8d97" />
            <stop offset="100%" stopColor="#2e525e" />
          </linearGradient>
          <linearGradient id="tl-sky" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#f5efe1" stopOpacity="0" />
            <stop offset="100%" stopColor="#e2d6b2" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* warm sky/grass tone */}
        <rect width="1200" height="200" fill="url(#tl-sky)" />

        {/* far hills */}
        <path d="M0 195 L80 175 L160 185 L240 165 L320 180 L400 165 L480 178 L560 168 L640 180 L720 165 L800 178 L880 168 L960 180 L1040 168 L1120 178 L1200 170 L1200 215 L0 215 Z" fill="#7a9162" opacity="0.4" />

        {/* riverbanks (grass-edge) */}
        <path d="M0 198 Q150 138 320 198 T640 218 T960 198 T1200 238 L1200 260 L0 260 Z" fill="#7a9162" opacity="0.55" />

        {/* meandering river — main body */}
        <path d="M0 210 Q150 150 320 210 T640 230 T960 210 T1200 250 L1200 360 L0 360 Z" fill="url(#tl-river)" opacity="0.85" />

        {/* river highlight strokes (animated current) */}
        <path d="M0 230 Q150 170 320 230 T640 250 T960 230 T1200 270" fill="none" stroke="#cddbe0" strokeWidth="1" opacity="0.55" className="current" />
        <path d="M0 250 Q150 190 320 250 T640 270 T960 250 T1200 290" fill="none" stroke="#cddbe0" strokeWidth="1" opacity="0.4" className="current-slow" />
        <path d="M0 270 Q150 210 320 270 T640 290 T960 270 T1200 310" fill="none" stroke="#a4bcc4" strokeWidth="0.8" opacity="0.4" />

        {/* ripples — scattered ellipses */}
        <g fill="none" stroke="#cddbe0" strokeWidth="0.5" opacity="0.45">
          <ellipse cx="180" cy="240" rx="14" ry="2" />
          <ellipse cx="460" cy="260" rx="14" ry="2" />
          <ellipse cx="780" cy="252" rx="14" ry="2" />
          <ellipse cx="1100" cy="298" rx="14" ry="2" />
        </g>

        {/* reeds on banks */}
        <g stroke="#5f7549" strokeWidth="1" fill="none" opacity="0.6">
          <g className="sway-a" style={{ transformOrigin: '50px 210px' }}>
            <line x1="50" y1="210" x2="48" y2="194" />
            <line x1="54" y1="210" x2="56" y2="192" />
            <line x1="58" y1="210" x2="56" y2="198" />
          </g>
          <g className="sway-b" style={{ transformOrigin: '440px 226px' }}>
            <line x1="440" y1="226" x2="438" y2="208" />
            <line x1="444" y1="226" x2="446" y2="210" />
          </g>
          <g className="sway-a" style={{ transformOrigin: '880px 218px' }}>
            <line x1="876" y1="218" x2="874" y2="200" />
            <line x1="880" y1="218" x2="882" y2="198" />
            <line x1="884" y1="218" x2="882" y2="204" />
          </g>
        </g>

        {/* pine trees — left bank cluster */}
        {tree(60, 200, 32, 'a')}
        {tree(82, 198, 44, 'b')}
        {tree(106, 196, 36, 'a', 0.8)}
        {tree(132, 200, 28, 'b', 0.75)}
        {tree(260, 188, 48, 'a')}
        {tree(286, 192, 32, 'b', 0.85)}
        {tree(530, 200, 42, 'a')}
        {tree(556, 204, 30, 'b', 0.75)}
        {tree(820, 198, 40, 'a')}
        {tree(846, 196, 50, 'b')}
        {tree(872, 200, 32, 'a', 0.8)}
        {tree(1090, 170, 46, 'a')}
        {tree(1118, 172, 38, 'b', 0.85)}
        {tree(1144, 168, 50, 'a')}

        {/* small birds far away */}
        <g stroke="#3b2618" strokeWidth="1" fill="none" opacity="0.6">
          <path d="M650 140 q3 -3 6 0 q3 -3 6 0" />
          <path d="M720 130 q2.5 -2.5 5 0 q2.5 -2.5 5 0" />
          <path d="M780 145 q2 -2 4 0 q2 -2 4 0" />
        </g>

        {/* bobbing rowboat with 3 figures */}
        <g className="bob" transform="translate(1000 250)" style={{ transformOrigin: '1000px 256px' }}>
          {/* shadow */}
          <ellipse cx="0" cy="12" rx="34" ry="3" fill="#1b2f37" opacity="0.2" />
          {/* hull */}
          <path d="M-32 0 Q-30 10 -18 12 L18 12 Q30 10 32 0 Z" fill="#7a4a1f" />
          <path d="M-32 0 Q-30 10 -18 12 L18 12 Q30 10 32 0" fill="none" stroke="#3b2618" strokeWidth="1" />
          {/* plank */}
          <line x1="-30" y1="2" x2="30" y2="2" stroke="#3b2618" strokeWidth="0.6" opacity="0.6" />
          {/* figures */}
          <g>
            <circle cx="-14" cy="-9" r="3.5" fill="#3b2618" />
            <path d="M-18 -3 q4 -3 8 0 L-12 6 L-16 6 Z" fill="#a16a35" />
            <circle cx="0" cy="-10" r="3.5" fill="#3b2618" />
            <path d="M-4 -4 q4 -3 8 0 L2 6 L-2 6 Z" fill="#c08c4a" />
            <circle cx="14" cy="-9" r="3.5" fill="#3b2618" />
            <path d="M10 -3 q4 -3 8 0 L16 6 L12 6 Z" fill="#a16a35" />
          </g>
          {/* oars */}
          <line x1="-22" y1="-2" x2="-32" y2="6" stroke="#5b3a1c" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="22" y1="-2" x2="32" y2="6" stroke="#5b3a1c" strokeWidth="1.2" strokeLinecap="round" />
          {/* wake */}
          <path d="M-44 14 q4 -3 10 0" fill="none" stroke="#cddbe0" strokeWidth="0.8" opacity="0.7" />
          <path d="M-50 18 q4 -3 8 0" fill="none" stroke="#cddbe0" strokeWidth="0.6" opacity="0.5" />
        </g>
      </svg>

      {/* era nodes — staggered drop on reveal */}
      <div className="reveal relative grid grid-cols-1 gap-y-12 pt-2 md:grid-cols-5 md:gap-x-2 md:pt-12">
        {eras.map((era, i) => (
          <div
            key={era.range}
            className={`stagger-child relative px-3 ${i % 2 === 1 ? 'md:mt-24' : ''}`}
            style={{ ['--i' as string]: i }}
          >
            {/* pin with subtle drop shadow */}
            <div className="mb-3 flex items-center gap-2">
              <svg viewBox="0 0 16 26" className="h-6 w-4 drop-shadow-[0_3px_3px_rgba(34,29,22,0.25)]" aria-hidden>
                <path d="M8 0 C3.5 0 0 3.5 0 8 C0 14 8 26 8 26 C8 26 16 14 16 8 C16 3.5 12.5 0 8 0 Z" fill="#5f7549" />
                <circle cx="8" cy="8" r="3" fill="#f5efe1" />
                <circle cx="8" cy="8" r="1.5" fill="#465938" />
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
