import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
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

// matisOS workshop — coded from scratch, no image dependency.
// Designed full-bleed for the viewport, fills 100vw × 100vh.

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
  try { localStorage.setItem(SUGGESTIONS_KEY, JSON.stringify(s)) } catch {}
}
async function fetchSuggestions(weather: Weather, location: Location): Promise<Suggestions> {
  const r = await fetch('/api/where-to-go', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ city: location.city ?? 'your area', condition: weather.condition, tempF: weather.tempF }),
  })
  if (!r.ok) throw new Error(`Suggestions ${r.status}`)
  const data = await r.json()
  const out: Suggestions = {
    vibe: typeof data?.vibe === 'string' ? data.vibe : '',
    suggestions: Array.isArray(data?.suggestions) ? data.suggestions.filter((s: Suggestion) => s?.name && s?.why) : [],
    fetchedAt: Date.now(),
  }
  saveSuggestions(out)
  return out
}

function tiltFor(name: string): number {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff
  return ((h % 7) - 3) * 0.65
}
function zoneKey(app: AppEntry): string { return 'slug' in app ? app.slug : app.name.toLowerCase() }
function formatDate(d: Date) { return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase() }
function formatWeekday(d: Date) { return d.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase() }
function formatClock(d: Date) {
  return d
    .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    .toLowerCase()
}

const RECENT_KEY = 'matisos:recent-app'
function loadRecentSlug(): string | null {
  try { return localStorage.getItem(RECENT_KEY) } catch { return null }
}
function rememberRecent(app: AppEntry) {
  if (app.kind !== 'internal') return
  try { localStorage.setItem(RECENT_KEY, app.slug) } catch {}
}

// ── SVG: lantern ─────────────────────────────────────────────────────────
function Lantern() {
  return (
    <svg viewBox="0 0 140 240" className="h-full w-full overflow-visible" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="lanternHalo" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#ffd980" stopOpacity="0.55" />
          <stop offset="35%" stopColor="#ff9938" stopOpacity="0.3" />
          <stop offset="80%" stopColor="#5a2b06" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="lanternFlame" cx="50%" cy="55%" r="50%">
          <stop offset="0%" stopColor="#fff8dc" />
          <stop offset="25%" stopColor="#ffdf6a" />
          <stop offset="55%" stopColor="#ff8e2e" />
          <stop offset="85%" stopColor="#c4500e" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#5a2b06" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="lanternBrass" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#f3deaa" />
          <stop offset="35%" stopColor="#c9a14a" />
          <stop offset="70%" stopColor="#8b6914" />
          <stop offset="100%" stopColor="#3a2814" />
        </linearGradient>
        <linearGradient id="lanternBrassH" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#5a3a14" />
          <stop offset="15%" stopColor="#c9a14a" />
          <stop offset="50%" stopColor="#f3deaa" />
          <stop offset="85%" stopColor="#c9a14a" />
          <stop offset="100%" stopColor="#5a3a14" />
        </linearGradient>
        <linearGradient id="lanternGlass" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#1a0a04" />
          <stop offset="50%" stopColor="#3a200a" />
          <stop offset="100%" stopColor="#1a0a04" />
        </linearGradient>
      </defs>
      {/* halo behind lantern */}
      <ellipse className="ws-halo" cx="70" cy="118" rx="80" ry="80" fill="url(#lanternHalo)" />
      {/* chain */}
      <path d="M70 0 L70 26" stroke="#3a2814" strokeWidth="2" />
      <circle cx="70" cy="6" r="3" fill="none" stroke="#5a3a14" strokeWidth="1" />
      <circle cx="70" cy="14" r="3" fill="none" stroke="#5a3a14" strokeWidth="1" />
      <circle cx="70" cy="22" r="3" fill="none" stroke="#5a3a14" strokeWidth="1" />
      {/* top cap */}
      <path d="M40 28 L100 28 L88 44 L52 44 Z" fill="url(#lanternBrass)" stroke="#1a0a04" strokeWidth="0.8" />
      <rect x="48" y="44" width="44" height="8" fill="url(#lanternBrassH)" stroke="#1a0a04" strokeWidth="0.5" />
      {/* vertical brass posts (4 corners of glass) */}
      <rect x="36" y="52" width="5" height="100" fill="url(#lanternBrass)" stroke="#1a0a04" strokeWidth="0.5" />
      <rect x="99" y="52" width="5" height="100" fill="url(#lanternBrass)" stroke="#1a0a04" strokeWidth="0.5" />
      {/* glass body (between posts) */}
      <rect x="41" y="52" width="58" height="100" fill="url(#lanternGlass)" opacity="0.85" />
      {/* flame */}
      <g className="ws-flame">
        <ellipse cx="70" cy="108" rx="18" ry="30" fill="url(#lanternFlame)" />
        <ellipse cx="70" cy="102" rx="6" ry="14" fill="#fff8dc" opacity="0.9" />
      </g>
      {/* glass highlight */}
      <rect x="45" y="58" width="6" height="88" fill="#fff" opacity="0.06" />
      <rect x="92" y="58" width="3" height="88" fill="#fff" opacity="0.04" />
      {/* bottom ring */}
      <rect x="36" y="152" width="68" height="8" fill="url(#lanternBrassH)" stroke="#1a0a04" strokeWidth="0.5" />
      {/* base flare */}
      <path d="M30 160 L110 160 L100 178 L40 178 Z" fill="url(#lanternBrass)" stroke="#1a0a04" strokeWidth="0.8" />
      <ellipse cx="70" cy="178" rx="32" ry="5" fill="#1a0a04" />
    </svg>
  )
}

// ── SVG: paper note ──────────────────────────────────────────────────────
function PaperNote() {
  return (
    <div className="relative h-full w-full" style={{ transform: 'rotate(-5deg)' }}>
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(0,0,0,0.15), transparent 60%),' +
            'radial-gradient(rgba(0,0,0,0.04) 0.5px, transparent 1px),' +
            'linear-gradient(180deg, #ddd1a8 0%, #b39660 100%)',
          backgroundSize: '100% 100%, 3px 3px, 100% 100%',
          boxShadow: '0 6px 12px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.3)',
          clipPath:
            'polygon(2% 0%, 98% 1%, 100% 99%, 0% 98%)',
        }}
      />
      <span
        className="absolute left-1/2 -translate-x-1/2 rounded-full"
        style={{
          top: '6%',
          width: '14%',
          aspectRatio: '1',
          background: 'radial-gradient(circle at 30% 30%, #f3deaa 0%, #8b6914 60%, #3a2814 100%)',
          boxShadow: '0 2px 3px rgba(0,0,0,0.7), inset 0 -1px 0 rgba(0,0,0,0.5)',
        }}
      />
      <div
        className="absolute inset-0 flex flex-col items-center justify-center font-display italic text-[#3a2814]"
        style={{ fontSize: 'min(1.05cqw, 14px)', lineHeight: 1.25, paddingTop: '18%' }}
      >
        <span>build</span>
        <span>beautiful</span>
        <span>things.</span>
        <div className="mt-1 h-px w-3/5 bg-[#3a2814]/40" />
      </div>
    </div>
  )
}

// ── SVG: pencil tin ──────────────────────────────────────────────────────
function PencilJar() {
  return (
    <svg viewBox="0 0 110 150" className="h-full w-full">
      <defs>
        <linearGradient id="tinBody" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#5a3a14" />
          <stop offset="35%" stopColor="#c9a14a" />
          <stop offset="65%" stopColor="#a07c30" />
          <stop offset="100%" stopColor="#3a2814" />
        </linearGradient>
        <linearGradient id="pencilA" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#2c1810" />
          <stop offset="50%" stopColor="#6b4a23" />
          <stop offset="100%" stopColor="#2c1810" />
        </linearGradient>
      </defs>
      {/* pencils */}
      <g>
        <rect x="36" y="22" width="7" height="42" fill="url(#pencilA)" />
        <polygon points="36,22 43,22 39.5,14" fill="#3a2814" />
        <rect x="46" y="10" width="6" height="54" fill="#9d7445" />
        <polygon points="46,10 52,10 49,3" fill="#3a2814" />
        <rect x="55" y="18" width="6" height="46" fill="#c4a473" />
        <polygon points="55,18 61,18 58,11" fill="#3a2814" />
        <rect x="64" y="14" width="7" height="50" fill="#6b4a23" />
        <polygon points="64,14 71,14 67.5,7" fill="#3a2814" />
        <rect x="74" y="22" width="6" height="42" fill="#9d7445" />
        <polygon points="74,22 80,22 77,15" fill="#3a2814" />
      </g>
      {/* tin */}
      <rect x="20" y="60" width="70" height="76" rx="3" fill="url(#tinBody)" stroke="#1a0a04" strokeWidth="1" />
      <rect x="20" y="64" width="70" height="5" fill="#f3deaa" opacity="0.35" />
      <rect x="20" y="125" width="70" height="8" fill="#1a0a04" opacity="0.55" />
      <rect x="22" y="78" width="3" height="46" fill="#fff" opacity="0.08" />
      <rect x="83" y="78" width="2" height="46" fill="#000" opacity="0.18" />
      <ellipse cx="55" cy="140" rx="38" ry="5" fill="#000" opacity="0.55" />
    </svg>
  )
}

// ── SVG: leather book ────────────────────────────────────────────────────
function LeatherBook() {
  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.08), transparent 50%),' +
          'linear-gradient(135deg, #2c1810 0%, #4a3520 45%, #2c1810 100%)',
        boxShadow:
          'inset 0 2px 0 rgba(255,255,255,0.1), inset 0 -2px 6px rgba(0,0,0,0.55), 0 4px 8px rgba(0,0,0,0.6)',
        border: '1.5px solid #1a0a04',
        borderRadius: '3px',
      }}
    >
      <div
        className="absolute inset-y-2 left-1.5 w-[2px]"
        style={{ background: 'linear-gradient(180deg, transparent, #c9a14a, transparent)', opacity: 0.4 }}
      />
      <div
        className="absolute inset-y-2 right-1.5 w-[2px]"
        style={{ background: 'linear-gradient(180deg, transparent, #c9a14a, transparent)', opacity: 0.3 }}
      />
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center font-display italic"
        style={{
          color: '#c9a14a',
          fontSize: 'min(1cqw, 14px)',
          lineHeight: 1.35,
          textShadow: '0 1px 0 rgba(0,0,0,0.7)',
        }}
      >
        <span>ideas</span>
        <span>become</span>
        <span>systems</span>
      </div>
    </div>
  )
}

// ── SVG: compass panel ───────────────────────────────────────────────────
function CompassPanel() {
  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at 50% 35%, #3a2814 0%, #1a0a04 100%)',
        boxShadow:
          'inset 0 2px 0 rgba(201,161,74,0.18), inset 0 -2px 8px rgba(0,0,0,0.5), 0 4px 8px rgba(0,0,0,0.55)',
        border: '1.5px solid #1a0a04',
        borderRadius: '3px',
      }}
    >
      <svg viewBox="0 0 100 100" className="absolute inset-x-0 mx-auto" style={{ top: '8%', width: '78%', opacity: 0.55 }}>
        <circle cx="50" cy="50" r="42" stroke="#c9a14a" strokeWidth="0.6" fill="none" opacity="0.6" />
        <circle cx="50" cy="50" r="34" stroke="#c9a14a" strokeWidth="0.4" fill="none" opacity="0.5" />
        <circle cx="50" cy="50" r="22" stroke="#c9a14a" strokeWidth="0.4" fill="none" opacity="0.4" />
        {/* main 4 points */}
        <polygon points="50,8 54,50 50,92 46,50" fill="#c9a14a" opacity="0.85" />
        <polygon points="8,50 50,54 92,50 50,46" fill="#c9a14a" opacity="0.7" />
        {/* secondary 4 points (diagonal) */}
        <polygon points="20,20 50,50 80,80 50,50" stroke="#c9a14a" strokeWidth="0.5" fill="none" />
        <polygon points="20,80 50,50 80,20 50,50" stroke="#c9a14a" strokeWidth="0.5" fill="none" />
        <circle cx="50" cy="50" r="3" fill="#c9a14a" />
        <circle cx="50" cy="50" r="1.5" fill="#0a0604" />
        {/* tick marks at compass headings */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180
          const r1 = 38
          const r2 = 42
          return (
            <line
              key={i}
              x1={50 + Math.sin(angle) * r1}
              y1={50 - Math.cos(angle) * r1}
              x2={50 + Math.sin(angle) * r2}
              y2={50 - Math.cos(angle) * r2}
              stroke="#c9a14a"
              strokeWidth="0.6"
              opacity="0.7"
            />
          )
        })}
      </svg>
      <div
        className="absolute inset-x-0 bottom-3 text-center font-display italic"
        style={{
          color: '#c9a14a',
          fontSize: 'min(1.1cqw, 16px)',
          letterSpacing: '0.04em',
          textShadow: '0 1px 0 rgba(0,0,0,0.6)',
        }}
      >
        stay curious
      </div>
    </div>
  )
}

// ── SVG: drawer cabinet ──────────────────────────────────────────────────
function DrawerCabinet() {
  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #2c1a0e 0%, #1a0a04 100%)',
        boxShadow:
          'inset 0 2px 0 rgba(201,161,74,0.1), 0 4px 8px rgba(0,0,0,0.55)',
        border: '1.5px solid #5a3a14',
        borderRadius: '3px',
      }}
    >
      {(['TOOLS', 'PARTS', 'NOTES'] as const).map((label, i) => (
        <div
          key={label}
          className="relative flex items-center justify-center"
          style={{
            height: '33.33%',
            borderBottom: i < 2 ? '1px solid #1a0a04' : 'none',
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.04), transparent 50%),' +
              (i % 2 === 0
                ? 'linear-gradient(180deg, #3a2814 0%, #2c1a0e 100%)'
                : 'linear-gradient(180deg, #2c1a0e 0%, #1a0a04 100%)'),
          }}
        >
          {/* brass label plate */}
          <div
            className="flex items-center justify-center font-mono font-bold tracking-[0.18em]"
            style={{
              width: '62%',
              height: '46%',
              background:
                'linear-gradient(180deg, #f3deaa 0%, #c9a14a 35%, #8b6914 65%, #5a3a14 100%)',
              border: '1px solid #1a0a04',
              borderRadius: '2px',
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(0,0,0,0.3), 0 2px 3px rgba(0,0,0,0.6)',
              color: '#1a0a04',
              fontSize: 'min(1cqw, 14px)',
              textShadow: '0 1px 0 rgba(255,255,255,0.15)',
            }}
          >
            {label}
          </div>
          {/* drawer pull */}
          <div
            className="absolute right-[8%] top-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: 'min(1.2cqw, 16px)',
              height: 'min(1.2cqw, 16px)',
              background:
                'radial-gradient(circle at 30% 30%, #f3deaa 0%, #c9a14a 40%, #5a3a14 100%)',
              boxShadow: '0 2px 3px rgba(0,0,0,0.7), inset 0 -1px 0 rgba(0,0,0,0.4)',
            }}
          />
        </div>
      ))}
    </div>
  )
}

// ── Brass corner bracket ─────────────────────────────────────────────────
function BrassCorner({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const rot = pos === 'tl' ? 0 : pos === 'tr' ? 90 : pos === 'br' ? 180 : 270
  return (
    <svg
      viewBox="0 0 40 40"
      style={{
        position: 'absolute',
        width: 'min(3.5cqw, 50px)',
        height: 'min(3.5cqw, 50px)',
        transform: `rotate(${rot}deg)`,
        ...(pos === 'tl' && { left: '-1px', top: '-1px' }),
        ...(pos === 'tr' && { right: '-1px', top: '-1px' }),
        ...(pos === 'bl' && { left: '-1px', bottom: '-1px' }),
        ...(pos === 'br' && { right: '-1px', bottom: '-1px' }),
      }}
    >
      <defs>
        <linearGradient id={`brC-${pos}`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#f3deaa" />
          <stop offset="40%" stopColor="#c9a14a" />
          <stop offset="100%" stopColor="#5a3a14" />
        </linearGradient>
      </defs>
      <path
        d="M0 0 L40 0 L40 8 L8 8 L8 40 L0 40 Z"
        fill={`url(#brC-${pos})`}
        stroke="#1a0a04"
        strokeWidth="0.6"
      />
      <circle cx="4" cy="4" r="1.5" fill="#1a0a04" />
      <circle cx="36" cy="4" r="1.5" fill="#1a0a04" />
      <circle cx="4" cy="36" r="1.5" fill="#1a0a04" />
    </svg>
  )
}

// ── Per-app illustrations (richer SVGs with layered gradients) ───────────
function NebulaIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <defs>
        <radialGradient id="nebCore" cx="50%" cy="50%" r="20%">
          <stop offset="0%" stopColor="#fff7d6" />
          <stop offset="100%" stopColor="#fde68a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="nebMid" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="35%" stopColor="#c026d3" stopOpacity="0.9" />
          <stop offset="70%" stopColor="#6d28d9" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.6" />
        </radialGradient>
        <radialGradient id="nebGlow" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="45" fill="url(#nebGlow)" />
      <circle cx="50" cy="50" r="38" fill="url(#nebMid)" />
      <circle cx="50" cy="50" r="14" fill="url(#nebCore)" />
      <circle cx="22" cy="32" r="1.2" fill="white" />
      <circle cx="78" cy="42" r="0.8" fill="white" />
      <circle cx="68" cy="22" r="0.6" fill="white" />
      <circle cx="32" cy="78" r="1.3" fill="white" opacity="0.9" />
      <circle cx="86" cy="68" r="0.9" fill="white" />
      <circle cx="16" cy="62" r="0.7" fill="white" />
      <circle cx="84" cy="22" r="0.5" fill="white" />
      <circle cx="48" cy="84" r="0.6" fill="white" opacity="0.7" />
    </svg>
  )
}
function FlameIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <defs>
        <linearGradient id="flameOuter" x1="0" x2="0" y1="1" y2="0">
          <stop offset="0%" stopColor="#9333ea" />
          <stop offset="40%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#fde68a" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="flameMid" x1="0" x2="0" y1="1" y2="0">
          <stop offset="0%" stopColor="#dc2626" />
          <stop offset="50%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>
        <linearGradient id="flameInner" x1="0" x2="0" y1="1" y2="0">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#fff7d6" />
        </linearGradient>
      </defs>
      <path d="M50 95 C 20 85, 18 58, 36 38 C 36 50, 46 48, 42 34 C 50 18, 64 16, 58 4 C 80 28, 82 60, 72 80 C 66 92, 60 94, 50 95 Z"
            fill="url(#flameOuter)" opacity="0.7" />
      <path d="M50 92 C 26 82, 26 58, 42 42 C 42 52, 50 50, 46 38 C 52 24, 62 22, 58 12 C 76 32, 76 60, 68 78 C 62 88, 58 90, 50 92 Z"
            fill="url(#flameMid)" />
      <path d="M50 86 C 36 76, 38 60, 48 50 C 48 56, 53 54, 50 46 C 56 32, 62 32, 60 24 C 68 38, 68 58, 64 72 C 60 82, 56 84, 50 86 Z"
            fill="url(#flameInner)" opacity="0.85" />
    </svg>
  )
}
function RingIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <defs>
        <linearGradient id="ringG" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#6b6b6b" />
          <stop offset="50%" stopColor="#9a9a9a" />
          <stop offset="100%" stopColor="#5a5a5a" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="34" stroke="url(#ringG)" strokeWidth="8" fill="none" />
      <circle cx="50" cy="50" r="34" stroke="#fff" strokeWidth="1" fill="none" opacity="0.4" />
      <circle cx="50" cy="50" r="30" stroke="#3a3a3a" strokeWidth="0.5" fill="none" />
    </svg>
  )
}
function EyeRaysIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <defs>
        <radialGradient id="eyeIris" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="55%" stopColor="#c9a14a" />
          <stop offset="100%" stopColor="#5a3a14" />
        </radialGradient>
      </defs>
      {/* eye almond shape */}
      <ellipse cx="50" cy="38" rx="15" ry="8.5" stroke="#c9a14a" strokeWidth="1.6" fill="none" />
      <circle cx="50" cy="38" r="5.5" fill="url(#eyeIris)" />
      <circle cx="50" cy="38" r="2.2" fill="#0a0604" />
      <circle cx="51.5" cy="36.5" r="1" fill="#fff" opacity="0.6" />
      {/* radiating rays */}
      {Array.from({ length: 11 }).map((_, i) => {
        const a = (i - 5) * 14
        const r1 = 14
        const r2 = 42
        const cx = 50, cy = 58
        return (
          <line
            key={i}
            x1={cx + Math.sin((a * Math.PI) / 180) * r1}
            y1={cy + Math.cos((a * Math.PI) / 180) * r1}
            x2={cx + Math.sin((a * Math.PI) / 180) * r2}
            y2={cy + Math.cos((a * Math.PI) / 180) * r2}
            stroke="#c9a14a"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        )
      })}
    </svg>
  )
}
function StarIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <defs>
        <radialGradient id="starG" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff7d6" />
          <stop offset="40%" stopColor="#fde68a" />
          <stop offset="75%" stopColor="#e0617a" />
          <stop offset="100%" stopColor="#5a2b4a" />
        </radialGradient>
        <radialGradient id="starGlow" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#fde68a" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#fff7d6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="40" fill="url(#starGlow)" />
      <polygon points="50,8 55,45 92,50 55,55 50,92 45,55 8,50 45,45" fill="url(#starG)" />
      <polygon points="50,30 52,48 70,50 52,52 50,70 48,52 30,50 48,48" fill="#fff7d6" opacity="0.85" />
    </svg>
  )
}
function MoonIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <defs>
        <linearGradient id="moonG" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="60%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <radialGradient id="moonGlow" cx="60%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="40" fill="url(#moonGlow)" />
      <circle cx="50" cy="50" r="34" fill="#1a0a2c" stroke="#a78bfa" strokeWidth="1.8" />
      <path d="M50 16 A 34 34 0 0 1 50 84 Z" fill="url(#moonG)" />
    </svg>
  )
}
function WaveIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <defs>
        <linearGradient id="waveG" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#bae6fd" />
          <stop offset="55%" stopColor="#0891b2" />
          <stop offset="100%" stopColor="#083344" />
        </linearGradient>
      </defs>
      <path d="M4 70 C 18 32, 38 32, 56 56 C 64 68, 78 60, 96 52 L 96 96 L 4 96 Z"
            fill="url(#waveG)" />
      <path d="M8 76 C 24 56, 44 60, 60 70 C 76 80, 86 74, 94 70"
            stroke="white" strokeWidth="1.8" fill="none" opacity="0.6" />
      <path d="M22 50 C 30 44, 38 46, 44 52"
            stroke="white" strokeWidth="1.2" fill="none" opacity="0.7" />
    </svg>
  )
}
function NotepadIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <defs>
        <linearGradient id="padG" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#f0e2c5" />
          <stop offset="100%" stopColor="#d4b884" />
        </linearGradient>
      </defs>
      <rect x="22" y="18" width="50" height="68" rx="2" fill="url(#padG)" stroke="#5a3a14" strokeWidth="1.6" />
      <rect x="22" y="18" width="50" height="8" fill="#c9a14a" />
      <circle cx="30" cy="22" r="1.4" fill="#3a2814" />
      <circle cx="50" cy="22" r="1.4" fill="#3a2814" />
      <circle cx="64" cy="22" r="1.4" fill="#3a2814" />
      <line x1="28" y1="38" x2="64" y2="38" stroke="#5a3a14" strokeWidth="1" opacity="0.7" />
      <line x1="28" y1="48" x2="64" y2="48" stroke="#5a3a14" strokeWidth="1" opacity="0.7" />
      <line x1="28" y1="58" x2="64" y2="58" stroke="#5a3a14" strokeWidth="1" opacity="0.7" />
      <line x1="28" y1="68" x2="54" y2="68" stroke="#5a3a14" strokeWidth="1" opacity="0.7" />
      {/* pencil */}
      <g transform="rotate(28 76 60)">
        <rect x="73" y="38" width="5" height="38" fill="#9d7445" stroke="#3a2814" strokeWidth="0.5" />
        <polygon points="73,38 78,38 75.5,32" fill="#3a2814" />
        <rect x="73" y="74" width="5" height="3" fill="#ec4899" />
      </g>
    </svg>
  )
}
function BoxIcon() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <defs>
        <linearGradient id="bxTop" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#8a8a8a" />
          <stop offset="100%" stopColor="#4a4a4a" />
        </linearGradient>
        <linearGradient id="bxL" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#6a6a6a" />
          <stop offset="100%" stopColor="#3a3a3a" />
        </linearGradient>
        <linearGradient id="bxR" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#4a4a4a" />
          <stop offset="100%" stopColor="#2a2a2a" />
        </linearGradient>
      </defs>
      <polygon points="50,16 84,30 50,46 16,30" fill="url(#bxTop)" stroke="#1a0a04" strokeWidth="1.2" />
      <polygon points="16,30 50,46 50,84 16,68" fill="url(#bxL)" stroke="#1a0a04" strokeWidth="1.2" />
      <polygon points="84,30 50,46 50,84 84,68" fill="url(#bxR)" stroke="#1a0a04" strokeWidth="1.2" />
      <line x1="20" y1="42" x2="50" y2="56" stroke="#1a0a04" strokeWidth="0.8" opacity="0.7" />
      <line x1="80" y1="42" x2="50" y2="56" stroke="#1a0a04" strokeWidth="0.8" opacity="0.7" />
    </svg>
  )
}
function PathIcon() {
  return (
    <svg viewBox="0 0 100 60" className="h-full w-full">
      <path d="M5 50 Q 30 30 50 35 T 95 18" stroke="#5a3a14" strokeWidth="1.5" fill="none" />
      <polygon points="14,42 19,28 24,42" fill="#3a4a23" />
      <polygon points="34,32 39,16 44,32" fill="#3a4a23" />
      <polygon points="62,28 67,14 72,28" fill="#3a4a23" />
    </svg>
  )
}
function MugIcon() {
  return (
    <svg viewBox="0 0 100 60" className="h-full w-full">
      <rect x="22" y="16" width="40" height="36" rx="2" fill="#e8dcc4" stroke="#5a3a14" strokeWidth="1.5" />
      <path d="M62 22 Q 80 22 80 32 Q 80 42 62 42" fill="none" stroke="#5a3a14" strokeWidth="1.5" />
      <path d="M30 10 Q 32 4 34 10" stroke="#5a3a14" strokeWidth="1" fill="none" />
      <path d="M40 10 Q 42 4 44 10" stroke="#5a3a14" strokeWidth="1" fill="none" />
      <path d="M50 10 Q 52 4 54 10" stroke="#5a3a14" strokeWidth="1" fill="none" />
    </svg>
  )
}
function ArchIcon() {
  return (
    <svg viewBox="0 0 100 60" className="h-full w-full">
      <rect x="20" y="50" width="60" height="3" fill="#5a3a14" />
      <path d="M25 50 L 25 25 Q 50 5 75 25 L 75 50 Z" fill="#e8dcc4" stroke="#5a3a14" strokeWidth="1.5" />
      <rect x="46" y="30" width="8" height="20" fill="#5a3a14" opacity="0.4" />
      <line x1="35" y1="30" x2="35" y2="50" stroke="#5a3a14" strokeWidth="1" />
      <line x1="65" y1="30" x2="65" y2="50" stroke="#5a3a14" strokeWidth="1" />
    </svg>
  )
}

// ── Tile materials ───────────────────────────────────────────────────────
type TileMaterial = 'slate' | 'parchment' | 'gray' | 'teal' | 'cream'

const APP_VISUALS: Record<string, { material: TileMaterial; Illustration: () => ReactNode; tape?: 'tl' | 'tr' | 'bl' | 'br' | 'clip' }> = {
  pardes:       { material: 'slate',     Illustration: NebulaIcon,    tape: 'tl' },
  yoga:         { material: 'parchment', Illustration: FlameIcon },
  initiation:   { material: 'gray',      Illustration: RingIcon },
  hyrogliphics: { material: 'slate',     Illustration: EyeRaysIcon,   tape: 'tr' },
  renaissance:  { material: 'cream',     Illustration: StarIcon },
  cadence:      { material: 'slate',     Illustration: MoonIcon,      tape: 'clip' },
  susquehanna:  { material: 'teal',      Illustration: WaveIcon },
  scratch:      { material: 'parchment', Illustration: NotepadIcon },
  source:       { material: 'slate',     Illustration: BoxIcon,       tape: 'br' },
}

function materialStyles(mat: TileMaterial) {
  switch (mat) {
    case 'slate':
      return {
        bg:
          'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.08), transparent 50%),' +
          'radial-gradient(ellipse at 50% 100%, rgba(0,0,0,0.4), transparent 60%),' +
          'radial-gradient(rgba(255,255,255,0.025) 0.5px, transparent 1px),' +
          'linear-gradient(135deg, #2c2c3a 0%, #1a1a25 50%, #14141e 100%)',
        bgSize: '100% 100%, 100% 100%, 4px 4px, 100% 100%',
        title: '#e8dcc4',
        body: '#c9bf9d',
        divider: '#c9a14a',
        border: 'rgba(0,0,0,0.6)',
      }
    case 'gray':
      return {
        bg:
          'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.18), transparent 60%),' +
          'radial-gradient(ellipse at 0% 100%, rgba(0,0,0,0.2), transparent 60%),' +
          'radial-gradient(rgba(0,0,0,0.06) 0.5px, transparent 1px),' +
          'linear-gradient(135deg, #cdc8bc 0%, #a09a8a 50%, #807a6e 100%)',
        bgSize: '100% 100%, 100% 100%, 4px 4px, 100% 100%',
        title: '#2a1a0e',
        body: '#3a2814',
        divider: '#5a3a14',
        border: 'rgba(58,40,20,0.5)',
      }
    case 'parchment':
      return {
        bg:
          'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.25), transparent 50%),' +
          'radial-gradient(ellipse at 100% 100%, rgba(58,40,20,0.4), transparent 50%),' +
          'radial-gradient(rgba(0,0,0,0.05) 0.5px, transparent 1px),' +
          'linear-gradient(135deg, #ecdeb8 0%, #c4a673 50%, #9c7e45 100%)',
        bgSize: '100% 100%, 100% 100%, 4px 4px, 100% 100%',
        title: '#2a1a0e',
        body: '#5a3a1c',
        divider: '#5a3a14',
        border: 'rgba(58,40,20,0.5)',
      }
    case 'cream':
      return {
        bg:
          'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.3), transparent 50%),' +
          'radial-gradient(ellipse at 100% 100%, rgba(120,80,40,0.3), transparent 50%),' +
          'radial-gradient(rgba(0,0,0,0.04) 0.5px, transparent 1px),' +
          'linear-gradient(135deg, #f2e6c8 0%, #d4b883 50%, #b09660 100%)',
        bgSize: '100% 100%, 100% 100%, 4px 4px, 100% 100%',
        title: '#2a1a0e',
        body: '#5a3a1c',
        divider: '#8b6914',
        border: 'rgba(58,40,20,0.4)',
      }
    case 'teal':
      return {
        bg:
          'radial-gradient(ellipse at 50% 0%, rgba(186,230,253,0.18), transparent 50%),' +
          'radial-gradient(ellipse at 0% 100%, rgba(0,0,0,0.3), transparent 60%),' +
          'radial-gradient(rgba(255,255,255,0.03) 0.5px, transparent 1px),' +
          'linear-gradient(135deg, #3d7a82 0%, #1d4d55 50%, #0e3038 100%)',
        bgSize: '100% 100%, 100% 100%, 4px 4px, 100% 100%',
        title: '#e8dcc4',
        body: '#c9bf9d',
        divider: '#c9a14a',
        border: 'rgba(0,0,0,0.6)',
      }
  }
}

function TapeStrip({ corner }: { corner: 'tl' | 'tr' | 'bl' | 'br' }) {
  const opts = {
    tl: { top: '-4%', left: '-3%', rotate: -22 },
    tr: { top: '-4%', right: '-3%', rotate: 22 },
    bl: { bottom: '-4%', left: '-3%', rotate: 22 },
    br: { bottom: '-4%', right: '-3%', rotate: -22 },
  }
  const { rotate, ...positioning } = opts[corner]
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        ...positioning,
        width: '24%',
        height: '14%',
        background:
          'linear-gradient(180deg, rgba(232,220,196,0.85) 0%, rgba(216,200,154,0.75) 100%)',
        transform: `rotate(${rotate}deg)`,
        boxShadow: '0 1px 2px rgba(0,0,0,0.4)',
      }}
    />
  )
}

function BulldogClip() {
  return (
    <svg
      viewBox="0 0 60 30"
      className="absolute"
      style={{ top: '-7%', left: '50%', transform: 'translateX(-50%)', width: '28%', height: 'auto', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.6))' }}
    >
      <defs>
        <linearGradient id="clipG" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#f3deaa" />
          <stop offset="50%" stopColor="#c9a14a" />
          <stop offset="100%" stopColor="#5a3a14" />
        </linearGradient>
      </defs>
      <rect x="6" y="8" width="48" height="18" rx="2" fill="url(#clipG)" stroke="#1a0a04" strokeWidth="0.6" />
      <rect x="8" y="10" width="44" height="3" fill="#fff" opacity="0.25" />
      <path d="M14 8 L20 0 L22 8 Z M38 8 L40 0 L46 8 Z" fill="#1a0a04" />
    </svg>
  )
}

// ── Hanging tile ──────────────────────────────────────────────────────────
function HangingTile({ app, dimmed, recent, onOpen }: { app: AppEntry; dimmed: boolean; recent: boolean; onOpen: (app: AppEntry) => void }) {
  const key = zoneKey(app)
  const vis = APP_VISUALS[key]
  const Illustration = vis?.Illustration
  const styles = materialStyles(vis?.material ?? 'parchment')
  const tilt = tiltFor(app.name)

  const inner = (
    <div className={'ws-tile relative h-full w-full ' + (dimmed ? 'opacity-25 grayscale ' : '')}>
      <div
        className="ws-tile-inner relative flex h-full w-full flex-col items-center"
        style={{ transform: `rotate(${tilt}deg)`, filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.55))' }}
      >
        {/* brass hook */}
        <div
          className="relative z-10 rounded-full"
          style={{
            width: 'min(1cqw, 14px)',
            height: 'min(1cqw, 14px)',
            background:
              'radial-gradient(circle at 30% 30%, #f3deaa 0%, #c9a14a 40%, #5a3a14 100%)',
            boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.5), 0 2px 3px rgba(0,0,0,0.7)',
          }}
        />
        {/* twine */}
        <svg
          className="pointer-events-none -mt-0.5"
          viewBox="0 0 100 26"
          preserveAspectRatio="none"
          style={{ width: '76%', height: 'min(1.9cqw, 26px)' }}
        >
          <line x1="50" y1="0" x2="14" y2="24" stroke="#3a2814" strokeWidth="0.8" />
          <line x1="50" y1="0" x2="86" y2="24" stroke="#3a2814" strokeWidth="0.8" />
          <line x1="50" y1="0" x2="14" y2="24" stroke="#c9a14a" strokeWidth="0.3" opacity="0.5" />
          <line x1="50" y1="0" x2="86" y2="24" stroke="#c9a14a" strokeWidth="0.3" opacity="0.5" />
        </svg>
        {/* card */}
        <div
          className="relative flex w-full flex-1 flex-col items-center overflow-hidden"
          style={{
            background: styles.bg,
            backgroundSize: styles.bgSize,
            borderRadius: '4px',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.3), 0 8px 14px rgba(0,0,0,0.6)',
            border: `1px solid ${styles.border}`,
            padding: 'min(1cqw, 14px) min(0.8cqw, 11px)',
            marginTop: '-2px',
          }}
        >
          {vis?.tape && vis.tape !== 'clip' && <TapeStrip corner={vis.tape} />}
          {vis?.tape === 'clip' && <BulldogClip />}

          {recent && (
            <span
              aria-label="last used"
              className="absolute"
              style={{
                top: '6%',
                right: '6%',
                width: 'min(0.9cqw, 13px)',
                height: 'min(0.9cqw, 13px)',
                borderRadius: '9999px',
                background:
                  'radial-gradient(circle at 30% 30%, #fff7d6 0%, #c9a14a 60%, #8b6914 100%)',
                boxShadow: '0 0 12px rgba(201,161,74,0.9), 0 0 4px rgba(255,239,180,0.8)',
                animation: 'wsGlint 2.6s ease-in-out infinite',
              }}
            />
          )}

          {/* illustration */}
          <div className="relative flex items-center justify-center"
               style={{ width: '55%', aspectRatio: '1', marginTop: '4%' }}>
            {Illustration ? <Illustration /> : <span style={{ fontSize: '300%' }}>{app.icon}</span>}
          </div>
          {/* name */}
          <p
            className="relative text-center font-display font-semibold"
            style={{ color: styles.title, fontSize: 'min(1.5cqw, 21px)', lineHeight: 1.05, marginTop: 'min(0.7cqw, 10px)' }}
          >
            {app.name}
          </p>
          {/* tagline */}
          <p
            className="relative text-center font-display italic"
            style={{ color: styles.body, fontSize: 'min(1cqw, 14px)', lineHeight: 1.2, marginTop: '3px' }}
          >
            {app.tagline}
          </p>
          {/* divider */}
          <span
            className="mt-auto text-center"
            style={{ color: styles.divider, fontSize: 'min(0.8cqw, 11px)', opacity: 0.55, marginTop: 'min(0.6cqw, 8px)', lineHeight: 1 }}
          >
            ✶
          </span>
        </div>
      </div>
    </div>
  )

  const wrap = 'block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 rounded-md'

  if (app.kind === 'external') {
    return (
      <a href={app.url} target="_blank" rel="noreferrer" aria-label={app.name} title={app.name} className={wrap} onClick={() => onOpen(app)}>
        {inner}
      </a>
    )
  }
  return (
    <Link to={`/apps/${app.slug}`} aria-label={app.name} title={app.name} className={wrap} onClick={() => onOpen(app)}>
      {inner}
    </Link>
  )
}

// ── Main launcher ─────────────────────────────────────────────────────────
export default function Launcher() {
  const navigate = useNavigate()
  const liveApps = apps.filter((a) => a.status === 'live')
  const searchRef = useRef<HTMLInputElement>(null)

  const [query, setQuery] = useState('')
  const [now, setNow] = useState(() => new Date())
  const [weather, setWeather] = useState<Weather | null>(() => loadCachedWeather())
  const [location, setLocation] = useState<Location | null>(() => loadCachedLocation())
  const [suggestions, setSuggestions] = useState<Suggestions | null>(() => loadCachedSuggestions())
  const [recentSlug] = useState<string | null>(() => loadRecentSlug())
  const [booted, setBooted] = useState(false)

  // Boot fade-in
  useEffect(() => {
    const t = setTimeout(() => setBooted(true), 30)
    return () => clearTimeout(t)
  }, [])

  // Live clock — tick every 30s
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])

  // ⌘K / Ctrl+K to focus the search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'
      if (isCmdK) {
        e.preventDefault()
        searchRef.current?.focus()
        searchRef.current?.select()
      } else if (e.key === 'Escape' && document.activeElement === searchRef.current) {
        searchRef.current?.blur()
        setQuery('')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

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
      } catch {}
    }
    load()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const matchedSlugs = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return null
    const matches = new Set<string>()
    for (const a of liveApps) {
      if (a.name.toLowerCase().includes(q) || a.tagline.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)) {
        matches.add(zoneKey(a))
      }
    }
    return matches
  }, [query, liveApps])

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    if (!matchedSlugs || matchedSlugs.size === 0) return
    const first = liveApps.find((a) => matchedSlugs.has(zoneKey(a)))
    if (!first) return
    rememberRecent(first)
    if (first.kind === 'external') window.open(first.url, '_blank', 'noreferrer')
    else navigate(`/apps/${first.slug}`)
  }

  const suggestionSlots: (Suggestion | null)[] = [0, 1, 2].map((i) => suggestions?.suggestions[i] ?? null)
  const suggestionIcons = [PathIcon, MugIcon, ArchIcon]
  const tiles = liveApps.slice(0, 12)

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{
        opacity: booted ? 1 : 0,
        transition: 'opacity 600ms ease-out',
        background:
          // ambient lantern pool (warm)
          'radial-gradient(ellipse 35% 50% at 8% 28%, rgba(255,180,80,0.22), transparent 60%),' +
          // top ambient highlight
          'radial-gradient(ellipse 70% 30% at 50% 0%, rgba(201,161,74,0.07), transparent 80%),' +
          // dark vignette
          'radial-gradient(ellipse 80% 60% at 50% 60%, transparent 30%, rgba(0,0,0,0.55) 100%),' +
          // wood gradient base
          'linear-gradient(180deg, #2a1a0e 0%, #1f130a 50%, #15100a 100%)',
      }}
    >
      <Style />
      {/* wood grain noise overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            // vertical grain lines
            'repeating-linear-gradient(90deg, rgba(255,255,255,0.014) 0, rgba(255,255,255,0.014) 1px, transparent 1px, transparent 4px),' +
            'repeating-linear-gradient(90deg, rgba(0,0,0,0.06) 0, rgba(0,0,0,0.06) 1px, transparent 1px, transparent 7px),' +
            // grain noise dots
            'radial-gradient(rgba(0,0,0,0.22) 1px, transparent 1.4px)',
          backgroundSize: '100% 100%, 100% 100%, 6px 6px',
          mixBlendMode: 'overlay',
          opacity: 0.65,
        }}
      />
      {/* Container that establishes container queries */}
      <div className="relative h-full w-full" style={{ containerType: 'inline-size' }}>

        {/* ── LEFT SIDE DECOR ── */}
        <div className="absolute" style={{ left: '0.5%', top: '0%', width: '11%', height: '40%' }}>
          <Lantern />
        </div>
        <div className="absolute" style={{ left: '2%', top: '42%', width: '9%', height: '12%' }}>
          <PaperNote />
        </div>
        <div className="absolute" style={{ left: '1%', top: '63%', width: '11%', height: '25%' }}>
          <PencilJar />
        </div>

        {/* ── RIGHT SIDE DECOR ── */}
        <div className="absolute" style={{ right: '1%', top: '3%', width: '11%', height: '18%' }}>
          <LeatherBook />
        </div>
        <div className="absolute" style={{ right: '1%', top: '23%', width: '11%', height: '32%' }}>
          <CompassPanel />
        </div>
        <div className="absolute" style={{ right: '0.5%', top: '57%', width: '13%', height: '40%' }}>
          <DrawerCabinet />
        </div>

        {/* ── DATE PLAQUE ── */}
        <div
          className="absolute flex flex-col items-center justify-center"
          style={{
            top: '2%', left: '12%', width: '13%', height: '6.5%',
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(201,161,74,0.18), transparent 60%),' +
              'linear-gradient(180deg, #1a120a 0%, #0d0805 100%)',
            border: '1.5px solid #c9a14a',
            borderRadius: '3px',
            boxShadow:
              'inset 0 1px 0 rgba(201,161,74,0.22), 0 2px 4px rgba(0,0,0,0.6)',
            padding: '0.4rem 0.6rem',
          }}
        >
          <div className="font-mono font-bold tracking-[0.2em] text-[#e8dcc4]"
               style={{ fontSize: 'min(1.55cqw, 22px)', lineHeight: 1 }}>
            {formatDate(now)}
          </div>
          <div className="flex items-baseline gap-2" style={{ marginTop: '5px' }}>
            <div className="font-mono font-bold tracking-[0.3em] text-[#c9a14a]"
                 style={{ fontSize: 'min(0.9cqw, 13px)', lineHeight: 1 }}>
              {formatWeekday(now)}
            </div>
            <div className="font-mono tracking-[0.15em] text-[#c9a14a]/80"
                 style={{ fontSize: 'min(0.85cqw, 12px)', lineHeight: 1 }}>
              {formatClock(now)}
            </div>
          </div>
        </div>

        {/* ── WORDMARK ── */}
        <div className="absolute" style={{ top: '4.5%', left: '26%', width: '30%' }}>
          <h1 className="font-display font-semibold"
              style={{
                color: '#e8dcc4',
                fontSize: 'min(5.8cqw, 84px)',
                lineHeight: 0.95,
                letterSpacing: '-0.015em',
                textShadow: '0 3px 6px rgba(0,0,0,0.7), 0 1px 0 rgba(255,255,255,0.08)',
              }}>
            matisOS
          </h1>
          <p className="font-display italic"
             style={{ color: '#c9a14a', fontSize: 'min(2cqw, 28px)', lineHeight: 1, marginTop: '6px', textShadow: '0 1px 0 rgba(0,0,0,0.5)' }}>
            the workshop
          </p>
          <p className="font-display italic"
             style={{ color: 'rgba(201,191,157,0.8)', fontSize: 'min(1.35cqw, 19px)', marginTop: '8px' }}>
            What are you reaching for?
          </p>
        </div>

        {/* ── SEARCH BOX ── */}
        <form onSubmit={handleSearch}
              className="absolute flex items-center"
              style={{
                top: '9%', left: '60%', width: '28%', height: '5.5%',
                background:
                  'radial-gradient(ellipse at 50% 0%, rgba(201,161,74,0.18), transparent 60%),' +
                  'linear-gradient(180deg, #1a120a 0%, #0d0805 100%)',
                border: '1.5px solid #c9a14a',
                borderRadius: '4px',
                boxShadow:
                  'inset 0 1px 0 rgba(201,161,74,0.2), 0 2px 4px rgba(0,0,0,0.6)',
                padding: '0 1rem',
              }}>
          <svg width="16" height="16" viewBox="0 0 16 16" className="text-[#c9a14a] shrink-0" aria-hidden>
            <path fill="currentColor" d="M11.74 10.34l3.46 3.46-1.41 1.41-3.46-3.46a6 6 0 1 1 1.41-1.41zM6.5 11A4.5 4.5 0 1 0 6.5 2a4.5 4.5 0 0 0 0 9z" />
          </svg>
          <input ref={searchRef} type="search" placeholder="find a tool" value={query}
                 onChange={(e) => setQuery(e.target.value)}
                 aria-label="find a tool"
                 className="font-display italic flex-1 bg-transparent text-[#e8dcc4] outline-none placeholder:text-[#c9bf9d]/55"
                 style={{ fontSize: 'min(1.4cqw, 20px)', marginLeft: '0.9rem' }} />
          <span className="font-mono tracking-widest text-[#c9a14a]/55 shrink-0"
                style={{ fontSize: 'min(0.8cqw, 11px)', border: '1px solid rgba(201,161,74,0.35)', borderRadius: '2px', padding: '2px 5px' }}>
            ⌘K
          </span>
        </form>

        {/* ── PEGBOARD ── */}
        <div
          className="absolute"
          style={{
            top: '17%', left: '13%', width: '73%', height: '60%',
            background:
              'radial-gradient(circle at center, #0a0604 0, #0a0604 2.4px, transparent 2.6px),' +
              'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.5) 100%),' +
              'linear-gradient(180deg, #1a1208 0%, #15100a 100%)',
            backgroundSize: '30px 30px, 100% 100%, 100% 100%',
            backgroundPosition: '15px 15px, 0 0, 0 0',
            border: '3px solid #5a3a14',
            outline: '1px solid rgba(201,161,74,0.45)',
            outlineOffset: '-5px',
            borderRadius: '8px',
            boxShadow:
              'inset 0 2px 0 rgba(255,255,255,0.04), inset 0 -28px 56px rgba(0,0,0,0.55), 0 10px 28px rgba(0,0,0,0.65)',
          }}
        >
          <BrassCorner pos="tl" />
          <BrassCorner pos="tr" />
          <BrassCorner pos="bl" />
          <BrassCorner pos="br" />
          <div
            className="grid h-full w-full"
            style={{
              gridTemplateColumns: 'repeat(4, 1fr)',
              gridTemplateRows: 'repeat(3, 1fr)',
              gap: 'min(1.6cqw, 24px)',
              padding: 'min(3cqw, 42px) min(2.4cqw, 34px)',
              alignContent: 'center',
            }}
          >
            {tiles.map((app) => {
              const key = zoneKey(app)
              const dimmed = matchedSlugs !== null && !matchedSlugs.has(key)
              const isRecent = app.kind === 'internal' && app.slug === recentSlug
              return <HangingTile key={app.name} app={app} dimmed={dimmed} recent={isRecent} onOpen={rememberRecent} />
            })}
          </div>
        </div>

        {/* ── ALMANAC ── */}
        <div
          className="absolute"
          style={{
            top: '79%', left: '13%', width: '73%', height: '18%',
            background:
              'radial-gradient(circle at center, #0a0604 0, #0a0604 1.5px, transparent 1.7px),' +
              'linear-gradient(180deg, #1f130a 0%, #15100a 100%)',
            backgroundSize: '22px 22px, 100% 100%',
            border: '3px solid #5a3a14',
            outline: '1px solid rgba(201,161,74,0.35)',
            outlineOffset: '-5px',
            borderRadius: '6px',
            boxShadow:
              'inset 0 1px 0 rgba(201,161,74,0.12), 0 6px 18px rgba(0,0,0,0.55)',
          }}
        >
          <BrassCorner pos="tl" />
          <BrassCorner pos="tr" />
          <BrassCorner pos="bl" />
          <BrassCorner pos="br" />
          <div
            className="grid h-full w-full"
            style={{
              gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)',
              padding: 'min(1.8cqw, 26px) min(2.2cqw, 32px)',
              gap: 'min(2.4cqw, 32px)',
            }}
          >
            {/* Almanac left */}
            <div className="flex flex-col">
              <div className="font-display italic" style={{ color: '#c9a14a', fontSize: 'min(1.9cqw, 27px)', lineHeight: 1 }}>
                the almanac
              </div>
              <div style={{ height: '1px', background: 'linear-gradient(90deg, rgba(201,161,74,0.5), transparent)', marginTop: '8px' }} />
              <div className="mt-3 flex items-center gap-3">
                <span style={{ fontSize: 'min(4.5cqw, 64px)', lineHeight: 1, filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.5))' }}>
                  {weather?.emoji ?? '🌤️'}
                </span>
                <div className="font-display font-semibold"
                     style={{ color: '#e8dcc4', fontSize: 'min(4.2cqw, 60px)', lineHeight: 1, textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
                  {weather ? `${weather.tempF}°` : '—'}
                </div>
                <div className="flex flex-col">
                  <span className="font-display italic" style={{ color: '#c9bf9d', fontSize: 'min(1.3cqw, 18px)', lineHeight: 1.1 }}>
                    {weather ? weather.condition.toLowerCase() : ''}
                  </span>
                  {location?.city && (
                    <span className="font-display italic" style={{ color: 'rgba(201,191,157,0.85)', fontSize: 'min(1.15cqw, 16px)', lineHeight: 1.1, marginTop: '3px' }}>
                      {location.city.toLowerCase()}
                    </span>
                  )}
                </div>
              </div>
              <p className="mt-2 font-display italic" style={{ color: 'rgba(201,161,74,0.75)', fontSize: 'min(1.2cqw, 17px)' }}>
                reading the day…
              </p>
            </div>
            {/* Almanac right */}
            <div className="flex flex-col">
              <div className="font-display italic" style={{ color: '#c9a14a', fontSize: 'min(1.45cqw, 20px)', lineHeight: 1 }}>
                places to go today
              </div>
              <div className="mt-3 grid flex-1 grid-cols-3 gap-3">
                {suggestionSlots.map((s, i) => {
                  const Icon = suggestionIcons[i]
                  return (
                    <div key={i} className="relative flex flex-col p-2.5"
                         style={{
                           background:
                             'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.35), transparent 60%),' +
                             'radial-gradient(rgba(0,0,0,0.05) 0.5px, transparent 1px),' +
                             'linear-gradient(135deg, #ecdeb8 0%, #c9a777 100%)',
                           backgroundSize: '100% 100%, 3px 3px, 100% 100%',
                           borderRadius: '3px',
                           boxShadow:
                             'inset 0 1px 0 rgba(255,255,255,0.5), 0 3px 6px rgba(0,0,0,0.45)',
                           border: '1px solid rgba(90,58,28,0.4)',
                         }}>
                      <p className="font-display font-semibold" style={{ color: '#3a2814', fontSize: 'min(1.2cqw, 17px)', lineHeight: 1.1 }}>
                        {(s?.name ?? '').toLowerCase() || '…'}
                      </p>
                      <div className="mt-1.5 flex flex-1 items-end gap-2">
                        <div style={{ width: '38%', height: 'min(3.5cqw, 48px)' }}>
                          <Icon />
                        </div>
                        <p className="font-display italic flex-1"
                           style={{ color: '#5a3a1c', fontSize: 'min(0.95cqw, 13px)', lineHeight: 1.2 }}>
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

        {/* ── FOOTER ── */}
        <div className="absolute flex justify-between"
             style={{ bottom: '1%', left: '13%', right: '13%', color: '#c9a14a', opacity: 0.55 }}>
          <span className="font-mono font-bold tracking-[0.25em]" style={{ fontSize: 'min(0.9cqw, 13px)' }}>
            matis · {now.getFullYear()}
          </span>
          <span className="font-mono font-bold tracking-[0.25em]" style={{ fontSize: 'min(0.9cqw, 13px)' }}>
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
      .ws-tile { transition: filter 220ms, opacity 220ms; }
      .ws-tile-inner {
        transition: transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
        transform-origin: 50% 4px;
      }
      .ws-tile:hover .ws-tile-inner {
        transform: rotate(0deg) translateY(-4px) !important;
      }
      @keyframes wsFlicker {
        0%, 100% { transform: scale(1, 1); opacity: 1; }
        20% { transform: scale(1.04, 0.97); opacity: 0.95; }
        45% { transform: scale(0.98, 1.03); opacity: 1; }
        70% { transform: scale(1.03, 0.99); opacity: 0.92; }
      }
      @keyframes wsHalo {
        0%, 100% { opacity: 0.85; }
        50% { opacity: 1; }
      }
      @keyframes wsGlint {
        0%, 100% { opacity: 0.85; }
        50% { opacity: 1; }
      }
      .ws-flame {
        animation: wsFlicker 3.4s ease-in-out infinite;
        transform-origin: 50% 75%;
      }
      .ws-halo {
        animation: wsHalo 5s ease-in-out infinite;
      }
    `}</style>
  )
}
