import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apps, type AppEntry } from '../apps'
import {
  fetchWeather,
  getLocation,
  loadCachedLocation,
  loadCachedWeather,
  type Location,
  type Weather,
} from '../lib/weather'

// Pixel-recreated workshop scene — no image dependency.
// 1448:1086 reference aspect; everything sized in cqw so the scene scales
// proportionally as the viewport changes.
const ASPECT = 1448 / 1086

type Suggestion = { name: string; why: string }
type Suggestions = { vibe: string; suggestions: Suggestion[]; fetchedAt: number }
const SUGGESTIONS_KEY = 'matisos:suggestions'
const SUGGESTIONS_CACHE_MS = 3 * 60 * 60 * 1000

function loadCachedSuggestions(): Suggestions | null {
  try {
    const raw = localStorage.getItem(SUGGESTIONS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Suggestions
    if (Date.now() - parsed.fetchedAt > SUGGESTIONS_CACHE_MS) return null
    return parsed
  } catch {
    return null
  }
}

function saveSuggestions(s: Suggestions) {
  try {
    localStorage.setItem(SUGGESTIONS_KEY, JSON.stringify(s))
  } catch {
    // ignored
  }
}

async function fetchSuggestions(weather: Weather, location: Location): Promise<Suggestions> {
  const r = await fetch('/api/where-to-go', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      city: location.city ?? 'your area',
      condition: weather.condition,
      tempF: weather.tempF,
    }),
  })
  if (!r.ok) throw new Error(`Suggestions ${r.status}`)
  const data = await r.json()
  const out: Suggestions = {
    vibe: typeof data?.vibe === 'string' ? data.vibe : '',
    suggestions: Array.isArray(data?.suggestions)
      ? data.suggestions.filter((s: Suggestion) => s?.name && s?.why)
      : [],
    fetchedAt: Date.now(),
  }
  saveSuggestions(out)
  return out
}

function tiltFor(name: string): number {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff
  return ((h % 7) - 3) * 0.7
}

function zoneKey(app: AppEntry): string {
  return 'slug' in app ? app.slug : app.name.toLowerCase()
}

function formatDate(d: Date) {
  return d
    .toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
    .toUpperCase()
}
function formatWeekday(d: Date) {
  return d.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()
}

// ── SVG illustrations (line-art for the painted scene) ───────────────────

function Lantern() {
  return (
    <svg viewBox="0 0 100 200" className="h-full w-full overflow-visible">
      <defs>
        <radialGradient id="flame" cx="50%" cy="55%" r="50%">
          <stop offset="0%" stopColor="#fff7d6" />
          <stop offset="40%" stopColor="#ffb648" />
          <stop offset="80%" stopColor="#cc7218" />
          <stop offset="100%" stopColor="#5a2b06" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="glassGlow" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#fde9a8" stopOpacity="0.65" />
          <stop offset="60%" stopColor="#a86913" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="brass" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#f3deaa" />
          <stop offset="50%" stopColor="#c9a14a" />
          <stop offset="100%" stopColor="#5a3a14" />
        </linearGradient>
      </defs>
      {/* chain */}
      <line x1="50" y1="0" x2="50" y2="22" stroke="#3a2814" strokeWidth="1.5" />
      {/* top brass cap */}
      <path d="M30 22 L70 22 L62 36 L38 36 Z" fill="url(#brass)" stroke="#3a2814" strokeWidth="0.6" />
      {/* brass top ring */}
      <rect x="36" y="36" width="28" height="6" fill="url(#brass)" stroke="#3a2814" strokeWidth="0.4" />
      {/* ambient glow halo (outside glass) */}
      <ellipse cx="50" cy="100" rx="55" ry="55" fill="url(#glassGlow)" />
      {/* glass body */}
      <rect x="28" y="42" width="44" height="86" rx="3" fill="#0d0805" stroke="url(#brass)" strokeWidth="1.5" opacity="0.85" />
      {/* glass shine */}
      <rect x="32" y="46" width="6" height="78" fill="#fff" opacity="0.05" rx="1" />
      {/* flame */}
      <ellipse cx="50" cy="92" rx="13" ry="20" fill="url(#flame)" />
      <ellipse cx="50" cy="88" rx="4" ry="9" fill="#fff7d6" opacity="0.9" />
      {/* base */}
      <rect x="30" y="128" width="40" height="8" fill="url(#brass)" stroke="#3a2814" strokeWidth="0.4" />
      <path d="M26 136 L74 136 L70 148 L30 148 Z" fill="url(#brass)" stroke="#3a2814" strokeWidth="0.6" />
      <ellipse cx="50" cy="148" rx="20" ry="4" fill="#3a2814" />
    </svg>
  )
}

function PaperNote() {
  return (
    <div
      className="relative h-full w-full"
      style={{
        background:
          'radial-gradient(rgba(0,0,0,0.04) 0.5px, transparent 1px), linear-gradient(180deg, #e0d3aa 0%, #b59963 100%)',
        backgroundSize: '3px 3px, 100% 100%',
        boxShadow: '0 4px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.3)',
        transform: 'rotate(-4deg)',
      }}
    >
      {/* tack */}
      <span
        className="absolute left-1/2 top-1 -translate-x-1/2 rounded-full"
        style={{
          width: '12%',
          aspectRatio: '1',
          background: 'radial-gradient(circle at 35% 35%, #f3deaa 0%, #8b6914 70%, #3a2814 100%)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.6)',
        }}
      />
      <div
        className="absolute inset-0 flex flex-col items-center justify-center font-display italic text-[#3a2814]"
        style={{ fontSize: 'min(1.05cqw, 14px)', lineHeight: 1.2, paddingTop: '12%' }}
      >
        <span>build</span>
        <span>beautiful</span>
        <span>things.</span>
        <div className="mt-1 h-px w-3/5 bg-[#3a2814]/40" />
      </div>
    </div>
  )
}

function PencilJar() {
  return (
    <svg viewBox="0 0 100 130" className="h-full w-full">
      <defs>
        <linearGradient id="tin" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#c4a473" />
          <stop offset="40%" stopColor="#8b6914" />
          <stop offset="100%" stopColor="#3a2814" />
        </linearGradient>
      </defs>
      {/* pencils */}
      <rect x="34" y="20" width="6" height="40" fill="#5a3a1c" />
      <polygon points="34,20 40,20 37,12" fill="#3a2814" />
      <rect x="44" y="10" width="5" height="50" fill="#9d7445" />
      <polygon points="44,10 49,10 46.5,3" fill="#3a2814" />
      <rect x="52" y="18" width="5" height="42" fill="#c4a473" />
      <polygon points="52,18 57,18 54.5,11" fill="#3a2814" />
      <rect x="60" y="14" width="6" height="46" fill="#6b4a23" />
      <polygon points="60,14 66,14 63,7" fill="#3a2814" />
      {/* tin */}
      <rect x="22" y="55" width="56" height="60" rx="2" fill="url(#tin)" stroke="#1a0a04" strokeWidth="1" />
      <rect x="22" y="58" width="56" height="4" fill="#f3deaa" opacity="0.3" />
      <rect x="22" y="105" width="56" height="6" fill="#1a0a04" opacity="0.5" />
      <ellipse cx="50" cy="118" rx="28" ry="3" fill="#000" opacity="0.5" />
    </svg>
  )
}

function Books() {
  return (
    <svg viewBox="0 0 100 80" className="h-full w-full">
      <defs>
        <linearGradient id="bookSpine1" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#3a2814" />
          <stop offset="50%" stopColor="#6b4a23" />
          <stop offset="100%" stopColor="#3a2814" />
        </linearGradient>
        <linearGradient id="bookSpine2" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#2c1810" />
          <stop offset="50%" stopColor="#4a3520" />
          <stop offset="100%" stopColor="#2c1810" />
        </linearGradient>
      </defs>
      <rect x="10" y="6" width="18" height="74" fill="url(#bookSpine1)" stroke="#1a0a04" strokeWidth="0.5" />
      <rect x="30" y="2" width="14" height="78" fill="url(#bookSpine2)" stroke="#1a0a04" strokeWidth="0.5" />
      <rect x="46" y="10" width="16" height="70" fill="url(#bookSpine1)" stroke="#1a0a04" strokeWidth="0.5" />
      {/* gold accents */}
      <rect x="12" y="20" width="14" height="0.6" fill="#c9a14a" opacity="0.7" />
      <rect x="12" y="60" width="14" height="0.6" fill="#c9a14a" opacity="0.7" />
      <rect x="32" y="22" width="10" height="0.6" fill="#c9a14a" opacity="0.7" />
      <rect x="48" y="25" width="12" height="0.6" fill="#c9a14a" opacity="0.7" />
    </svg>
  )
}

function LeatherBook() {
  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-[2px]"
      style={{
        background:
          'linear-gradient(135deg, #2c1810 0%, #4a3520 40%, #2c1810 100%)',
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.08), 0 3px 6px rgba(0,0,0,0.6), inset 0 -10px 20px rgba(0,0,0,0.5)',
        border: '1px solid #1a0a04',
      }}
    >
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center font-display italic"
        style={{
          color: '#c9a14a',
          fontSize: 'min(0.95cqw, 13px)',
          lineHeight: 1.3,
          textShadow: '0 1px 0 rgba(0,0,0,0.6)',
        }}
      >
        <span>ideas</span>
        <span>become</span>
        <span>systems</span>
      </div>
      {/* spine band */}
      <div
        className="absolute inset-y-2 left-1 w-[3px]"
        style={{
          background: 'linear-gradient(180deg, #c9a14a, #5a3a14)',
          opacity: 0.5,
        }}
      />
    </div>
  )
}

function CompassPanel() {
  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-[2px]"
      style={{
        background:
          'radial-gradient(ellipse at 50% 30%, #3a2814 0%, #1a0a04 100%)',
        boxShadow: 'inset 0 1px 0 rgba(201,161,74,0.15), 0 3px 6px rgba(0,0,0,0.5)',
        border: '1px solid #5a3a14',
      }}
    >
      <svg viewBox="0 0 100 100" className="absolute inset-x-0 top-2 mx-auto" style={{ width: '70%', opacity: 0.4 }}>
        <circle cx="50" cy="50" r="40" stroke="#c9a14a" strokeWidth="0.7" fill="none" />
        <circle cx="50" cy="50" r="30" stroke="#c9a14a" strokeWidth="0.4" fill="none" />
        {/* 4-point compass */}
        <polygon points="50,10 53,50 50,90 47,50" fill="#c9a14a" opacity="0.6" />
        <polygon points="10,50 50,53 90,50 50,47" fill="#c9a14a" opacity="0.5" />
        {/* diagonals */}
        <polygon points="22,22 50,50 78,78 78,78" stroke="#c9a14a" strokeWidth="0.4" fill="none" />
        <polygon points="22,78 50,50 78,22 78,22" stroke="#c9a14a" strokeWidth="0.4" fill="none" />
        <circle cx="50" cy="50" r="2" fill="#c9a14a" />
      </svg>
      <div
        className="absolute inset-x-0 bottom-2 text-center font-display italic"
        style={{
          color: '#c9a14a',
          fontSize: 'min(1cqw, 14px)',
          letterSpacing: '0.05em',
        }}
      >
        stay curious
      </div>
    </div>
  )
}

function DrawerCabinet() {
  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-[2px]"
      style={{
        background:
          'linear-gradient(180deg, #2c1a0e 0%, #1a0a04 100%)',
        boxShadow: 'inset 0 1px 0 rgba(201,161,74,0.1), 0 4px 8px rgba(0,0,0,0.5)',
        border: '1px solid #5a3a14',
      }}
    >
      {(['TOOLS', 'PARTS', 'NOTES'] as const).map((label, i) => (
        <div
          key={label}
          className="relative flex items-center justify-center"
          style={{
            height: '33.3%',
            borderBottom: i < 2 ? '1px solid #1a0a04' : 'none',
            background:
              i % 2 === 0
                ? 'linear-gradient(180deg, #3a2814 0%, #2c1a0e 100%)'
                : 'linear-gradient(180deg, #2c1a0e 0%, #1a0a04 100%)',
          }}
        >
          {/* brass label plate */}
          <div
            className="flex items-center justify-center px-2 font-mono font-bold tracking-widest"
            style={{
              width: '60%',
              height: '50%',
              background: 'linear-gradient(180deg, #c9a14a 0%, #8b6914 50%, #5a3a14 100%)',
              border: '1px solid #1a0a04',
              borderRadius: '2px',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 1px 2px rgba(0,0,0,0.5)',
              color: '#1a0a04',
              fontSize: 'min(0.95cqw, 13px)',
            }}
          >
            {label}
          </div>
          {/* drawer pull (small ring) */}
          <div
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: 'min(1cqw, 14px)',
              height: 'min(1cqw, 14px)',
              background: 'radial-gradient(circle at 30% 30%, #f3deaa 0%, #8b6914 60%, #3a2814 100%)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.6)',
            }}
          />
        </div>
      ))}
    </div>
  )
}

function BrassFrameCorner({
  pos,
}: {
  pos: 'tl' | 'tr' | 'bl' | 'br'
}) {
  // L-shape brass bracket; rotation per corner
  const rot = pos === 'tl' ? 0 : pos === 'tr' ? 90 : pos === 'br' ? 180 : 270
  return (
    <svg
      viewBox="0 0 30 30"
      style={{
        position: 'absolute',
        width: 'min(3cqw, 42px)',
        height: 'min(3cqw, 42px)',
        transform: `rotate(${rot}deg)`,
        ...(pos === 'tl' && { left: 0, top: 0 }),
        ...(pos === 'tr' && { right: 0, top: 0 }),
        ...(pos === 'bl' && { left: 0, bottom: 0 }),
        ...(pos === 'br' && { right: 0, bottom: 0 }),
      }}
    >
      <defs>
        <linearGradient id={`brassC-${pos}`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#f3deaa" />
          <stop offset="50%" stopColor="#c9a14a" />
          <stop offset="100%" stopColor="#5a3a14" />
        </linearGradient>
      </defs>
      <path
        d="M0 0 L30 0 L30 6 L6 6 L6 30 L0 30 Z"
        fill={`url(#brassC-${pos})`}
        stroke="#1a0a04"
        strokeWidth="0.5"
      />
      <circle cx="3" cy="3" r="1.4" fill="#3a2814" />
      <circle cx="26" cy="3" r="1.4" fill="#3a2814" />
      <circle cx="3" cy="26" r="1.4" fill="#3a2814" />
    </svg>
  )
}

// ── Per-app painted illustrations ─────────────────────────────────────────

function NebulaIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <defs>
        <radialGradient id="neb" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="20%" stopColor="#ec4899" />
          <stop offset="55%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.95" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="38" fill="url(#neb)" />
      <circle cx="20" cy="30" r="0.9" fill="white" />
      <circle cx="80" cy="40" r="0.7" fill="white" />
      <circle cx="65" cy="22" r="0.6" fill="white" />
      <circle cx="30" cy="78" r="1.1" fill="white" />
      <circle cx="86" cy="70" r="0.8" fill="white" />
      <circle cx="14" cy="60" r="0.7" fill="white" />
    </svg>
  )
}

function FlameIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <defs>
        <linearGradient id="fl" x1="0" x2="0" y1="1" y2="0">
          <stop offset="0%" stopColor="#dc2626" />
          <stop offset="50%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>
        <linearGradient id="fl2" x1="0" x2="0" y1="1" y2="0">
          <stop offset="0%" stopColor="#9333ea" />
          <stop offset="80%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>
      </defs>
      <path
        d="M50 95 C 25 85, 22 60, 38 42 C 38 52, 46 50, 44 38 C 50 20, 60 18, 56 8 C 76 28, 78 60, 70 78 C 65 90, 60 92, 50 95 Z"
        fill="url(#fl2)"
        opacity="0.85"
      />
      <path
        d="M50 90 C 32 82, 30 60, 44 48 C 44 56, 50 54, 48 44 C 52 30, 60 28, 58 18 C 72 36, 72 62, 64 76 C 60 86, 56 88, 50 90 Z"
        fill="url(#fl)"
      />
    </svg>
  )
}

function RingIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <circle cx="50" cy="50" r="32" stroke="#4a4a4a" strokeWidth="6" fill="none" />
      <circle cx="50" cy="50" r="32" stroke="#9a9a9a" strokeWidth="2" fill="none" opacity="0.6" />
    </svg>
  )
}

function EyeRaysIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <defs>
        <radialGradient id="iris" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="60%" stopColor="#c9a14a" />
          <stop offset="100%" stopColor="#5a3a14" />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="38" rx="14" ry="8" stroke="#c9a14a" strokeWidth="1.5" fill="none" />
      <circle cx="50" cy="38" r="5" fill="url(#iris)" />
      <circle cx="50" cy="38" r="2" fill="#0a0604" />
      {/* rays */}
      {Array.from({ length: 9 }).map((_, i) => {
        const a = (i - 4) * 15
        return (
          <line
            key={i}
            x1="50"
            y1="55"
            x2={50 + Math.sin((a * Math.PI) / 180) * 38}
            y2={55 + Math.cos((a * Math.PI) / 180) * 38}
            stroke="#c9a14a"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        )
      })}
    </svg>
  )
}

function WaveIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <defs>
        <linearGradient id="wv" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#a7e6ff" />
          <stop offset="60%" stopColor="#3b9eb8" />
          <stop offset="100%" stopColor="#0e4c5f" />
        </linearGradient>
      </defs>
      <path
        d="M5 70 C 20 35, 40 35, 55 55 C 62 65, 75 60, 90 55 L 90 95 L 5 95 Z"
        fill="url(#wv)"
      />
      <path
        d="M10 75 C 25 55, 45 60, 60 70 C 75 80, 85 75, 92 72"
        stroke="white"
        strokeWidth="1.5"
        fill="none"
        opacity="0.7"
      />
    </svg>
  )
}

function NotepadIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <rect x="22" y="20" width="48" height="62" rx="2" fill="#e8dcc4" stroke="#5a3a14" strokeWidth="1.5" />
      <rect x="22" y="20" width="48" height="6" fill="#c9a14a" />
      <circle cx="30" cy="23" r="1.4" fill="#3a2814" />
      <circle cx="62" cy="23" r="1.4" fill="#3a2814" />
      <line x1="28" y1="38" x2="62" y2="38" stroke="#5a3a14" strokeWidth="1" />
      <line x1="28" y1="48" x2="62" y2="48" stroke="#5a3a14" strokeWidth="1" />
      <line x1="28" y1="58" x2="62" y2="58" stroke="#5a3a14" strokeWidth="1" />
      <line x1="28" y1="68" x2="50" y2="68" stroke="#5a3a14" strokeWidth="1" />
      {/* pencil */}
      <rect x="68" y="40" width="4" height="30" fill="#9d7445" transform="rotate(20 70 55)" />
      <polygon points="68,40 72,40 70,34" fill="#3a2814" transform="rotate(20 70 55)" />
    </svg>
  )
}

function BoxIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <defs>
        <linearGradient id="bxTop" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#7a7a7a" />
          <stop offset="100%" stopColor="#4a4a4a" />
        </linearGradient>
        <linearGradient id="bxLeft" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#5a5a5a" />
          <stop offset="100%" stopColor="#3a3a3a" />
        </linearGradient>
        <linearGradient id="bxRight" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#4a4a4a" />
          <stop offset="100%" stopColor="#2a2a2a" />
        </linearGradient>
      </defs>
      {/* top */}
      <polygon points="50,18 82,32 50,46 18,32" fill="url(#bxTop)" stroke="#1a0a04" strokeWidth="1" />
      {/* left */}
      <polygon points="18,32 50,46 50,82 18,68" fill="url(#bxLeft)" stroke="#1a0a04" strokeWidth="1" />
      {/* right */}
      <polygon points="82,32 50,46 50,82 82,68" fill="url(#bxRight)" stroke="#1a0a04" strokeWidth="1" />
    </svg>
  )
}

function StarIcon() {
  // Renaissance ✦
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <defs>
        <radialGradient id="star" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="60%" stopColor="#e0617a" />
          <stop offset="100%" stopColor="#5a2b4a" />
        </radialGradient>
      </defs>
      <polygon points="50,10 56,44 90,50 56,56 50,90 44,56 10,50 44,44" fill="url(#star)" />
    </svg>
  )
}

function MoonIcon() {
  // Cadence ◑
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <defs>
        <linearGradient id="mn" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="32" fill="#1a0a2c" stroke="#a78bfa" strokeWidth="1.5" />
      <path d="M50 18 A 32 32 0 0 1 50 82 Z" fill="url(#mn)" />
    </svg>
  )
}

function PathIcon() {
  return (
    <svg viewBox="0 0 100 60" className="h-full w-full">
      <path
        d="M5 50 Q 30 30 50 35 T 95 18"
        stroke="#5a3a14"
        strokeWidth="1.5"
        fill="none"
      />
      {/* trees */}
      <polygon points="15,40 20,28 25,40" fill="#3a4a23" />
      <polygon points="35,30 40,18 45,30" fill="#3a4a23" />
    </svg>
  )
}

function MugIcon() {
  return (
    <svg viewBox="0 0 100 60" className="h-full w-full">
      <rect x="20" y="15" width="40" height="35" rx="2" fill="none" stroke="#5a3a14" strokeWidth="1.5" />
      <path d="M60 22 Q 78 22 78 32 Q 78 42 60 42" fill="none" stroke="#5a3a14" strokeWidth="1.5" />
      <path d="M28 8 Q 30 4 32 8" stroke="#5a3a14" strokeWidth="1" fill="none" />
      <path d="M38 8 Q 40 4 42 8" stroke="#5a3a14" strokeWidth="1" fill="none" />
      <path d="M48 8 Q 50 4 52 8" stroke="#5a3a14" strokeWidth="1" fill="none" />
    </svg>
  )
}

function ArchIcon() {
  return (
    <svg viewBox="0 0 100 60" className="h-full w-full">
      <rect x="20" y="50" width="60" height="3" fill="#5a3a14" />
      <path d="M25 50 L 25 25 Q 50 5 75 25 L 75 50 Z" fill="none" stroke="#5a3a14" strokeWidth="1.5" />
      <rect x="46" y="30" width="8" height="20" fill="none" stroke="#5a3a14" strokeWidth="1" />
      <line x1="35" y1="30" x2="35" y2="50" stroke="#5a3a14" strokeWidth="1" />
      <line x1="65" y1="30" x2="65" y2="50" stroke="#5a3a14" strokeWidth="1" />
    </svg>
  )
}

// ── Hanging tile (one of the painted signs) ──────────────────────────────

type TileMaterial = 'slate' | 'parchment' | 'gray' | 'teal' | 'cream'

const APP_VISUALS: Record<string, { material: TileMaterial; Illustration: () => ReactNode }> = {
  pardes: { material: 'slate', Illustration: NebulaIcon },
  yoga: { material: 'parchment', Illustration: FlameIcon },
  initiation: { material: 'gray', Illustration: RingIcon },
  hyrogliphics: { material: 'slate', Illustration: EyeRaysIcon },
  renaissance: { material: 'cream', Illustration: StarIcon },
  cadence: { material: 'slate', Illustration: MoonIcon },
  susquehanna: { material: 'teal', Illustration: WaveIcon },
  scratch: { material: 'parchment', Illustration: NotepadIcon },
  source: { material: 'slate', Illustration: BoxIcon },
}

function materialStyles(mat: TileMaterial): {
  bg: string
  title: string
  body: string
  divider: string
} {
  switch (mat) {
    case 'slate':
      return {
        bg:
          'radial-gradient(rgba(255,255,255,0.04) 0.5px, transparent 1px), linear-gradient(135deg, #2a2a35 0%, #1a1a25 100%)',
        title: '#e8dcc4',
        body: '#c9bf9d',
        divider: '#c9a14a',
      }
    case 'gray':
      return {
        bg:
          'radial-gradient(rgba(0,0,0,0.06) 0.5px, transparent 1px), linear-gradient(135deg, #c2bdb0 0%, #8a8578 100%)',
        title: '#2a1a0e',
        body: '#3a2814',
        divider: '#5a3a14',
      }
    case 'parchment':
      return {
        bg:
          'radial-gradient(rgba(0,0,0,0.05) 0.5px, transparent 1px), linear-gradient(135deg, #e8dcc4 0%, #b89b5e 100%)',
        title: '#2a1a0e',
        body: '#5a3a1c',
        divider: '#5a3a14',
      }
    case 'cream':
      return {
        bg:
          'radial-gradient(rgba(0,0,0,0.04) 0.5px, transparent 1px), linear-gradient(135deg, #f0e2c5 0%, #c9a777 100%)',
        title: '#2a1a0e',
        body: '#5a3a1c',
        divider: '#5a3a14',
      }
    case 'teal':
      return {
        bg:
          'radial-gradient(rgba(255,255,255,0.04) 0.5px, transparent 1px), linear-gradient(135deg, #3a6b6e 0%, #1d3d44 100%)',
        title: '#e8dcc4',
        body: '#c9bf9d',
        divider: '#c9a14a',
      }
  }
}

function HangingTile({
  app,
  dimmed,
}: {
  app: AppEntry
  dimmed: boolean
}) {
  const key = zoneKey(app)
  const vis = APP_VISUALS[key]
  const Illustration = vis?.Illustration
  const styles = materialStyles(vis?.material ?? 'parchment')
  const tilt = tiltFor(app.name)

  const inner = (
    <div
      className={
        'ws-tile relative h-full w-full ' +
        (dimmed ? 'opacity-25 grayscale ' : '')
      }
    >
      <div
        className="ws-tile-inner relative flex h-full w-full flex-col items-center"
        style={{ transform: `rotate(${tilt}deg)` }}
      >
        {/* brass hook */}
        <div
          className="relative z-10 rounded-full"
          style={{
            width: 'min(0.9cqw, 13px)',
            height: 'min(0.9cqw, 13px)',
            background:
              'radial-gradient(circle at 30% 30%, #f3deaa 0%, #8b6914 65%, #3a2814 100%)',
            boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.5), 0 2px 3px rgba(0,0,0,0.6)',
          }}
        />
        {/* twine V */}
        <svg
          className="pointer-events-none -mt-1"
          viewBox="0 0 100 24"
          preserveAspectRatio="none"
          style={{ width: '78%', height: 'min(1.7cqw, 24px)' }}
        >
          <line x1="50" y1="0" x2="14" y2="22" stroke="#5a3a14" strokeWidth="0.8" />
          <line x1="50" y1="0" x2="86" y2="22" stroke="#5a3a14" strokeWidth="0.8" />
        </svg>
        {/* card */}
        <div
          className="relative flex w-full flex-1 flex-col items-center rounded-[4px] overflow-hidden"
          style={{
            background: styles.bg,
            backgroundSize: '4px 4px, 100% 100%',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -2px 0 rgba(0,0,0,0.25), 0 6px 12px rgba(0,0,0,0.55), 0 14px 24px rgba(0,0,0,0.35)',
            border: '1px solid rgba(0,0,0,0.4)',
            padding: 'min(0.9cqw, 12px)',
            marginTop: '-2px',
          }}
        >
          {/* corner tape strip (decorative, on some tiles) */}
          {(key === 'pardes' || key === 'hyrogliphics') && (
            <div
              className="pointer-events-none absolute"
              style={{
                top: '-4%',
                left: '-3%',
                width: '22%',
                height: '14%',
                background:
                  'linear-gradient(180deg, rgba(232,220,196,0.8) 0%, rgba(216,200,154,0.7) 100%)',
                transform: 'rotate(-22deg)',
                boxShadow: '0 1px 1px rgba(0,0,0,0.3)',
              }}
            />
          )}
          {(key === 'source') && (
            <div
              className="pointer-events-none absolute"
              style={{
                bottom: '-3%',
                right: '-3%',
                width: '22%',
                height: '14%',
                background:
                  'linear-gradient(180deg, rgba(232,220,196,0.8) 0%, rgba(216,200,154,0.7) 100%)',
                transform: 'rotate(20deg)',
                boxShadow: '0 1px 1px rgba(0,0,0,0.3)',
              }}
            />
          )}

          {/* illustration */}
          <div
            className="relative flex items-center justify-center"
            style={{ width: '52%', aspectRatio: '1', marginTop: '6%' }}
          >
            {Illustration ? <Illustration /> : <span style={{ fontSize: '300%' }}>{app.icon}</span>}
          </div>
          {/* name */}
          <p
            className="relative text-center font-display font-semibold"
            style={{
              color: styles.title,
              fontSize: 'min(1.4cqw, 19px)',
              lineHeight: 1.05,
              marginTop: 'min(0.6cqw, 9px)',
            }}
          >
            {app.name}
          </p>
          {/* tagline (split into lines of up to ~22 chars) */}
          <p
            className="relative text-center font-display italic"
            style={{
              color: styles.body,
              fontSize: 'min(0.95cqw, 13px)',
              lineHeight: 1.2,
              marginTop: '2px',
            }}
          >
            {app.tagline}
          </p>
          {/* divider star */}
          <span
            className="mt-auto text-center"
            style={{
              color: styles.divider,
              fontSize: 'min(0.7cqw, 10px)',
              opacity: 0.6,
              lineHeight: 1,
              marginTop: 'min(0.5cqw, 7px)',
            }}
          >
            ✶
          </span>
        </div>
      </div>
    </div>
  )

  const wrap =
    'block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 rounded-md'

  if (app.kind === 'external') {
    return (
      <a
        href={app.url}
        target="_blank"
        rel="noreferrer"
        aria-label={app.name}
        title={app.name}
        className={wrap}
      >
        {inner}
      </a>
    )
  }
  return (
    <Link to={`/apps/${app.slug}`} aria-label={app.name} title={app.name} className={wrap}>
      {inner}
    </Link>
  )
}

// ── Main launcher ─────────────────────────────────────────────────────────

export default function Launcher() {
  const navigate = useNavigate()
  const liveApps = apps.filter((a) => a.status === 'live')

  const [query, setQuery] = useState('')
  const [weather, setWeather] = useState<Weather | null>(() => loadCachedWeather())
  const [location, setLocation] = useState<Location | null>(() => loadCachedLocation())
  const [suggestions, setSuggestions] = useState<Suggestions | null>(() =>
    loadCachedSuggestions(),
  )

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        let loc = location
        let w = weather
        if (!loc) {
          loc = await getLocation()
          if (cancelled) return
          setLocation(loc)
        }
        if (!w && loc) {
          w = await fetchWeather(loc)
          if (cancelled) return
          setWeather(w)
        }
        if (!suggestions && loc && w) {
          const s = await fetchSuggestions(w, loc)
          if (cancelled) return
          setSuggestions(s)
        }
      } catch {
        // ignore
      }
    }
    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const matchedSlugs = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return null
    const matches = new Set<string>()
    for (const a of liveApps) {
      if (
        a.name.toLowerCase().includes(q) ||
        a.tagline.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      ) {
        matches.add(zoneKey(a))
      }
    }
    return matches
  }, [query, liveApps])

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault()
    if (!matchedSlugs || matchedSlugs.size === 0) return
    const first = liveApps.find((a) => matchedSlugs.has(zoneKey(a)))
    if (!first) return
    if (first.kind === 'external') {
      window.open(first.url, '_blank', 'noreferrer')
    } else {
      navigate(`/apps/${first.slug}`)
    }
  }

  const now = new Date()
  const suggestionSlots: (Suggestion | null)[] = [0, 1, 2].map(
    (i) => suggestions?.suggestions[i] ?? null,
  )
  const suggestionIcons = [PathIcon, MugIcon, ArchIcon]

  // Up to 16 tiles, 4 cols × 4 rows
  const tiles = liveApps.slice(0, 16)

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#0d0805]">
      <Style />
      <div
        className="relative h-full w-full"
        style={{
          containerType: 'inline-size',
          background:
            'radial-gradient(ellipse at 8% 20%, rgba(255,180,80,0.18), transparent 35%),' +
            'radial-gradient(ellipse at 75% 100%, rgba(0,0,0,0.55), transparent 60%),' +
            'linear-gradient(180deg, #2a1a0e 0%, #1a1208 50%, #0d0805 100%)',
        }}
      >
        {/* wood grain noise overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, rgba(255,255,255,0.012) 0, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 3px),' +
              'radial-gradient(rgba(0,0,0,0.22) 1px, transparent 1.4px)',
            backgroundSize: '100% 100%, 6px 6px',
            mixBlendMode: 'overlay',
            opacity: 0.55,
          }}
        />

        {/* Left side decorations */}
        <div className="absolute" style={{ left: '1%', top: '0%', width: '11%', height: '38%' }}>
          <Lantern />
        </div>
        <div className="absolute" style={{ left: '2%', top: '40%', width: '9%', height: '12%' }}>
          <PaperNote />
        </div>
        <div className="absolute" style={{ left: '1.5%', top: '63%', width: '10%', height: '24%' }}>
          <PencilJar />
        </div>
        <div className="absolute" style={{ left: '0%', top: '79%', width: '7%', height: '16%' }}>
          <Books />
        </div>

        {/* Right side decorations */}
        <div className="absolute" style={{ right: '1%', top: '3%', width: '11%', height: '18%' }}>
          <LeatherBook />
        </div>
        <div className="absolute" style={{ right: '1%', top: '24%', width: '11%', height: '32%' }}>
          <CompassPanel />
        </div>
        <div className="absolute" style={{ right: '0.5%', top: '58%', width: '13%', height: '38%' }}>
          <DrawerCabinet />
        </div>

        {/* Date plaque */}
        <div
          className="absolute flex flex-col items-center justify-center rounded-[3px]"
          style={{
            top: '1.5%',
            left: '9.5%',
            width: '13%',
            height: '5.5%',
            background: 'linear-gradient(180deg, #1a120a 0%, #0d0805 100%)',
            border: '1px solid #c9a14a',
            boxShadow:
              'inset 0 1px 0 rgba(201,161,74,0.2), 0 1px 2px rgba(0,0,0,0.6)',
            padding: '0.3rem 0.5rem',
          }}
        >
          <div
            className="font-mono font-bold tracking-[0.18em] text-[#e8dcc4]"
            style={{ fontSize: 'min(1.45cqw, 20px)', lineHeight: 1 }}
          >
            {formatDate(now)}
          </div>
          <div
            className="font-mono font-bold tracking-[0.3em] text-[#c9a14a]"
            style={{ fontSize: 'min(0.85cqw, 12px)', lineHeight: 1, marginTop: '4px' }}
          >
            {formatWeekday(now)}
          </div>
        </div>

        {/* Wordmark */}
        <div className="absolute" style={{ top: '5%', left: '23%', width: '32%' }}>
          <h1
            className="font-display font-semibold text-[#e8dcc4]"
            style={{
              fontSize: 'min(5.2cqw, 75px)',
              lineHeight: 0.95,
              letterSpacing: '-0.01em',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            matisOS
          </h1>
          <p
            className="font-display italic text-[#c9a14a]"
            style={{ fontSize: 'min(1.8cqw, 26px)', lineHeight: 1, marginTop: '4px' }}
          >
            the workshop
          </p>
          <p
            className="font-display italic text-[#c9bf9d]/85"
            style={{ fontSize: 'min(1.25cqw, 18px)', marginTop: '6px' }}
          >
            What are you reaching for?
          </p>
        </div>

        {/* Search box */}
        <form
          onSubmit={handleSearchSubmit}
          className="absolute flex items-center rounded-[4px]"
          style={{
            top: '8.5%',
            left: '57%',
            width: '28%',
            height: '5.5%',
            background: 'linear-gradient(180deg, #1a120a 0%, #0d0805 100%)',
            border: '1px solid #c9a14a',
            boxShadow:
              'inset 0 1px 0 rgba(201,161,74,0.2), 0 1px 2px rgba(0,0,0,0.6)',
            padding: '0 1rem',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" className="text-[#c9a14a]/80 shrink-0" aria-hidden>
            <path
              fill="currentColor"
              d="M11.74 10.34l3.46 3.46-1.41 1.41-3.46-3.46a6 6 0 1 1 1.41-1.41zM6.5 11A4.5 4.5 0 1 0 6.5 2a4.5 4.5 0 0 0 0 9z"
            />
          </svg>
          <input
            type="search"
            placeholder="find a tool"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="find a tool"
            className="font-display italic flex-1 bg-transparent text-[#e8dcc4] outline-none placeholder:text-[#c9bf9d]/55"
            style={{ fontSize: 'min(1.35cqw, 19px)', marginLeft: '0.8rem' }}
          />
        </form>

        {/* Pegboard */}
        <div
          className="absolute"
          style={{
            top: '17%',
            left: '13.5%',
            width: '72%',
            height: '60%',
            background:
              'radial-gradient(circle at center, #0a0604 0, #0a0604 2.2px, transparent 2.4px), linear-gradient(180deg, #1a1208 0%, #15100a 100%)',
            backgroundSize: '28px 28px, 100% 100%',
            backgroundPosition: '14px 14px, 0 0',
            border: '2px solid #5a3a14',
            outline: '1px solid rgba(201,161,74,0.4)',
            outlineOffset: '-5px',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -24px 48px rgba(0,0,0,0.55), 0 8px 22px rgba(0,0,0,0.55)',
            borderRadius: '6px',
          }}
        >
          <BrassFrameCorner pos="tl" />
          <BrassFrameCorner pos="tr" />
          <BrassFrameCorner pos="bl" />
          <BrassFrameCorner pos="br" />

          <div
            className="grid h-full w-full"
            style={{
              gridTemplateColumns: 'repeat(4, 1fr)',
              gridTemplateRows: 'repeat(2, 1fr)',
              gap: 'min(1.4cqw, 20px)',
              padding: 'min(2.5cqw, 36px) min(2.2cqw, 32px)',
              alignContent: 'center',
            }}
          >
            {tiles.map((app) => {
              const key = zoneKey(app)
              const dimmed = matchedSlugs !== null && !matchedSlugs.has(key)
              return <HangingTile key={app.name} app={app} dimmed={dimmed} />
            })}
          </div>
        </div>

        {/* Almanac panel */}
        <div
          className="absolute"
          style={{
            top: '79.5%',
            left: '13.5%',
            width: '72%',
            height: '17.5%',
            background:
              'radial-gradient(circle at center, #0a0604 0, #0a0604 1.4px, transparent 1.5px), linear-gradient(180deg, #1f130a 0%, #15100a 100%)',
            backgroundSize: '20px 20px, 100% 100%',
            border: '2px solid #5a3a14',
            outline: '1px solid rgba(201,161,74,0.35)',
            outlineOffset: '-5px',
            borderRadius: '6px',
            boxShadow:
              'inset 0 1px 0 rgba(201,161,74,0.12), 0 4px 14px rgba(0,0,0,0.5)',
          }}
        >
          <BrassFrameCorner pos="tl" />
          <BrassFrameCorner pos="tr" />
          <BrassFrameCorner pos="bl" />
          <BrassFrameCorner pos="br" />
          <div
            className="grid h-full w-full"
            style={{
              gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)',
              padding: 'min(1.5cqw, 22px) min(2cqw, 28px)',
              gap: 'min(2cqw, 28px)',
            }}
          >
            {/* Almanac left */}
            <div className="flex flex-col">
              <div
                className="font-display italic"
                style={{
                  color: '#c9a14a',
                  fontSize: 'min(1.7cqw, 24px)',
                  lineHeight: 1,
                }}
              >
                the almanac
              </div>
              <div
                style={{
                  height: '1px',
                  background:
                    'linear-gradient(90deg, rgba(201,161,74,0.4), transparent)',
                  marginTop: '6px',
                }}
              />
              <div className="mt-2 flex items-center gap-3">
                <span style={{ fontSize: 'min(4cqw, 56px)', lineHeight: 1 }}>🌤️</span>
                <div
                  className="font-display font-semibold text-[#e8dcc4]"
                  style={{ fontSize: 'min(3.8cqw, 54px)', lineHeight: 1 }}
                >
                  {weather ? `${weather.tempF}°` : '—'}
                </div>
                <div className="flex flex-col">
                  <span
                    className="font-display italic text-[#c9bf9d]"
                    style={{ fontSize: 'min(1.2cqw, 17px)', lineHeight: 1.1 }}
                  >
                    {weather ? weather.condition.toLowerCase() : ''}
                  </span>
                  {location?.city && (
                    <span
                      className="font-display italic text-[#c9bf9d]/85"
                      style={{ fontSize: 'min(1.1cqw, 16px)', lineHeight: 1.1, marginTop: '2px' }}
                    >
                      {location.city.toLowerCase()}
                    </span>
                  )}
                </div>
              </div>
              <p
                className="mt-2 font-display italic text-[#c9a14a]/80"
                style={{ fontSize: 'min(1.1cqw, 16px)' }}
              >
                reading the day…
              </p>
            </div>
            {/* Almanac right */}
            <div className="flex flex-col">
              <div
                className="font-display italic text-[#c9a14a]"
                style={{ fontSize: 'min(1.3cqw, 18px)', lineHeight: 1 }}
              >
                places to go today
              </div>
              <div className="mt-3 grid flex-1 grid-cols-3 gap-3">
                {suggestionSlots.map((s, i) => {
                  const Icon = suggestionIcons[i]
                  return (
                    <div
                      key={i}
                      className="relative flex flex-col rounded-[3px] p-2"
                      style={{
                        background:
                          'radial-gradient(rgba(0,0,0,0.05) 0.5px, transparent 1px), linear-gradient(180deg, #e8dcc4 0%, #d4c39a 100%)',
                        backgroundSize: '3px 3px, 100% 100%',
                        boxShadow:
                          'inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.4)',
                        border: '1px solid rgba(90,58,28,0.3)',
                      }}
                    >
                      <p
                        className="font-display font-semibold text-[#3a2814]"
                        style={{ fontSize: 'min(1.1cqw, 15px)', lineHeight: 1.1 }}
                      >
                        {(s?.name ?? '').toLowerCase() || '…'}
                      </p>
                      <div className="mt-1 flex flex-1 items-end gap-2">
                        <div style={{ width: '40%', height: 'min(3cqw, 42px)' }}>
                          <Icon />
                        </div>
                        <p
                          className="font-display italic text-[#5a3a1c]"
                          style={{
                            fontSize: 'min(0.85cqw, 12px)',
                            lineHeight: 1.2,
                            flex: 1,
                          }}
                        >
                          {(s?.why ?? '').toLowerCase()}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="absolute flex justify-between"
          style={{
            bottom: '0.8%',
            left: '13.5%',
            right: '13.5%',
            color: '#c9a14a',
            opacity: 0.55,
          }}
        >
          <span
            className="font-mono font-bold tracking-[0.25em]"
            style={{ fontSize: 'min(0.85cqw, 12px)' }}
          >
            matis · {now.getFullYear()}
          </span>
          <span
            className="font-mono font-bold tracking-[0.25em]"
            style={{ fontSize: 'min(0.85cqw, 12px)' }}
          >
            matisOS
          </span>
        </div>
      </div>
    </div>
  )
}

function Style(): ReactNode {
  return (
    <style>{`
      .ws-tile {
        transition: filter 220ms, opacity 220ms;
      }
      .ws-tile-inner {
        transition: transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
        transform-origin: 50% 4px;
      }
      .ws-tile:hover .ws-tile-inner {
        transform: rotate(0deg) translateY(-3px) !important;
      }
    `}</style>
  )
}
