import { useEffect, useMemo, useRef, useState } from 'react'
import { catalog } from './catalog'
import type { Session, SessionStep } from './sessions'
import { fetchPoseInfo } from './wiki'
import { storage } from '../../lib/storage'

function loadUserImages(): Record<string, string> {
  const raw = storage.get('yoga:state-v2')
  if (!raw) return {}
  try {
    const poses = JSON.parse(raw) as Array<{ id: string; imageUrl?: string }>
    const map: Record<string, string> = {}
    for (const p of poses) {
      if (p.imageUrl) map[p.id] = p.imageUrl
    }
    return map
  } catch {
    return {}
  }
}

function PosePreview({
  poseId,
  userImage,
}: {
  poseId: string
  userImage?: string
}) {
  const [wikiImage, setWikiImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (userImage) return
    let active = true
    setWikiImage(null)
    setLoading(true)
    const name = catalog.find((c) => c.id === poseId)?.name ?? poseId
    fetchPoseInfo(name)
      .then((info) => {
        if (!active) return
        setWikiImage(info?.thumbnail ?? null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [poseId, userImage])

  const src = userImage ?? wikiImage

  if (src) {
    return (
      <img
        src={src}
        alt={poseName(poseId)}
        className="h-56 w-56 rounded-2xl bg-white object-contain shadow-xl ring-1 ring-white/20 sm:h-64 sm:w-64"
      />
    )
  }
  if (loading) {
    return <div className="h-56 w-56 animate-pulse rounded-2xl bg-white/10 sm:h-64 sm:w-64" />
  }
  return null
}

function format(sec: number): string {
  const safe = Math.max(0, sec)
  const m = Math.floor(safe / 60)
  const s = safe % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function poseName(id: string): string {
  return catalog.find((p) => p.id === id)?.name ?? id
}

type FlatStep = SessionStep & { side?: 1 | 2; totalSides: number }

function flatten(session: Session): FlatStep[] {
  const out: FlatStep[] = []
  for (const step of session.steps) {
    if (step.perSide) {
      out.push({ ...step, side: 1, totalSides: 2 })
      out.push({ ...step, side: 2, totalSides: 2 })
    } else {
      out.push({ ...step, totalSides: 1 })
    }
  }
  return out
}

export default function SessionRunner({
  session,
  onClose,
}: {
  session: Session
  onClose: () => void
}) {
  const flat = useMemo(() => flatten(session), [session])
  const [index, setIndex] = useState(0)
  const [remaining, setRemaining] = useState(flat[0]?.durationSec ?? 0)
  const [paused, setPaused] = useState(false)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const userImages = useMemo(() => loadUserImages(), [])

  useEffect(() => {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    audioCtxRef.current = new Ctx()
    return () => {
      audioCtxRef.current?.close()
    }
  }, [])

  function playDing() {
    const ctx = audioCtxRef.current
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.value = 880
    osc.connect(gain)
    gain.connect(ctx.destination)
    gain.gain.setValueAtTime(0.22, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.65)
    osc.start()
    osc.stop(ctx.currentTime + 0.7)
  }

  const isLastStep = index >= flat.length - 1
  const isComplete = isLastStep && remaining <= 0
  const current = flat[index]

  useEffect(() => {
    if (paused || isComplete) return
    if (remaining > 0) {
      const id = setTimeout(() => setRemaining((r) => r - 1), 1000)
      return () => clearTimeout(id)
    }
    if (!isLastStep) {
      playDing()
      setIndex((i) => i + 1)
      setRemaining(flat[index + 1].durationSec)
    } else {
      playDing()
    }
  }, [remaining, paused, index, isLastStep, isComplete, flat])

  function goPrev() {
    if (index === 0) return
    const next = index - 1
    setIndex(next)
    setRemaining(flat[next].durationSec)
  }

  function goNext() {
    if (isLastStep) {
      onClose()
      return
    }
    const next = index + 1
    setIndex(next)
    setRemaining(flat[next].durationSec)
  }

  const progress = ((index + (isComplete ? 1 : 0)) / flat.length) * 100

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white">
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${session.gradient} opacity-25`}
      />
      <div className="relative flex h-full flex-col px-6 pt-[max(env(safe-area-inset-top),1.5rem)] pb-[max(env(safe-area-inset-bottom),1.5rem)]">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/60">
            {session.name}
          </p>
          <button
            onClick={onClose}
            className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur transition hover:bg-white/20"
          >
            End
          </button>
        </div>

        <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full bg-white/85 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex flex-1 flex-col items-center justify-center text-center">
          {isComplete ? (
            <>
              <p className="text-6xl">✓</p>
              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                Session complete
              </h2>
              <p className="mt-3 max-w-md text-white/80">
                {session.steps.length} steps · {session.durationMin} min
              </p>
              <button
                onClick={onClose}
                className="mt-8 rounded-full bg-white px-8 py-3 font-semibold text-slate-900 transition hover:bg-white/90"
              >
                Done
              </button>
            </>
          ) : (
            <>
              <PosePreview
                poseId={current.poseId}
                userImage={userImages[current.poseId]}
              />
              <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.12em] text-white/70">
                Step {index + 1} of {flat.length}
                {current.side &&
                  current.totalSides > 1 &&
                  ` · Side ${current.side} of ${current.totalSides}`}
              </p>
              <h2 className="mt-2 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">
                {poseName(current.poseId)}
              </h2>
              {current.cue && (
                <p className="mt-2 max-w-md text-[14px] leading-relaxed text-white/85">
                  {current.cue}
                </p>
              )}
              <div className="mt-5 text-6xl font-bold tabular-nums sm:text-7xl">
                {format(remaining)}
              </div>
              {paused && (
                <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white/60">
                  Paused
                </p>
              )}
            </>
          )}
        </div>

        {!isComplete && (
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={goPrev}
              disabled={index === 0}
              className="rounded-full bg-white/10 p-4 backdrop-blur transition hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10"
              aria-label="Previous step"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
                <path
                  d="M6 5h2v14H6V5zm12 0v14L8 12l10-7z"
                  fill="currentColor"
                />
              </svg>
            </button>
            <button
              onClick={() => setPaused((p) => !p)}
              className="rounded-full bg-white px-8 py-4 text-slate-900 transition hover:bg-white/90"
              aria-label={paused ? 'Resume' : 'Pause'}
            >
              {paused ? (
                <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden>
                  <path d="M8 5v14l11-7L8 5z" fill="currentColor" />
                </svg>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden>
                  <path
                    d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"
                    fill="currentColor"
                  />
                </svg>
              )}
            </button>
            <button
              onClick={goNext}
              className="rounded-full bg-white/10 p-4 backdrop-blur transition hover:bg-white/20"
              aria-label="Next step"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
                <path
                  d="M16 5h2v14h-2V5zM6 5v14l10-7L6 5z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
