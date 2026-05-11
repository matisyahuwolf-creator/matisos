import { useEffect, useMemo, useRef, useState } from 'react'
import { catalog } from './catalog'
import type { Session, SessionStep } from './sessions'
import { poseImageUrl } from './pose-images'
import { storage } from '../../lib/storage'

const AUDIO_KEY = 'yoga:audio-enabled'
const MUSIC_KEY = 'yoga:music-enabled'

function loadAudioPref(): boolean {
  const raw = storage.get(AUDIO_KEY)
  if (raw === null) return true
  return raw === 'true'
}

function loadMusicPref(): boolean {
  const raw = storage.get(MUSIC_KEY)
  if (raw === null) return true
  return raw === 'true'
}

function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const en = voices.filter((v) => v.lang.toLowerCase().startsWith('en'))
  if (en.length === 0) return null
  const premium = en.find((v) => /premium|enhanced|neural|wavenet/i.test(v.name))
  if (premium) return premium
  const named = en.find((v) =>
    /samantha|karen|moira|daniel|fiona|aaron|nicky|allison|joelle/i.test(
      v.name,
    ),
  )
  if (named) return named
  return en[0]
}

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
  const src = userImage ?? poseImageUrl(poseId, 600)
  return (
    <img
      key={poseId}
      src={src}
      alt={poseName(poseId)}
      className="h-56 w-56 rounded-2xl bg-white object-cover shadow-xl ring-1 ring-white/20 sm:h-64 sm:w-64"
    />
  )
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

const STEP_GRADIENTS = [
  'from-violet-600 via-fuchsia-500 to-rose-600',
  'from-sky-500 via-cyan-500 to-emerald-500',
  'from-amber-500 via-orange-500 to-rose-500',
  'from-emerald-600 via-teal-600 to-cyan-700',
  'from-indigo-700 via-purple-600 to-pink-600',
  'from-slate-700 via-blue-700 to-indigo-800',
  'from-rose-500 via-pink-500 to-fuchsia-600',
  'from-yellow-500 via-amber-500 to-orange-600',
  'from-purple-700 via-violet-700 to-fuchsia-800',
  'from-cyan-600 via-blue-600 to-indigo-700',
  'from-orange-600 via-red-600 to-pink-700',
  'from-green-600 via-emerald-600 to-teal-700',
]

// A minor pentatonic scale, low octave — meditative and consonant
const STEP_FREQUENCIES = [110, 130.81, 146.83, 164.81, 196, 220, 246.94]

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
  const [audioEnabled, setAudioEnabled] = useState<boolean>(() => loadAudioPref())
  const [musicEnabled, setMusicEnabled] = useState<boolean>(() => loadMusicPref())
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const audioCtxRef = useRef<AudioContext | null>(null)
  const droneRef = useRef<{
    osc1: OscillatorNode
    osc2: OscillatorNode
    osc3: OscillatorNode
    lfo: OscillatorNode
    gain: GainNode
  } | null>(null)
  const userImages = useMemo(() => loadUserImages(), [])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    const load = () => setVoices(window.speechSynthesis.getVoices())
    load()
    window.speechSynthesis.addEventListener('voiceschanged', load)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', load)
      window.speechSynthesis.cancel()
    }
  }, [])

  const voice = useMemo(() => pickVoice(voices), [voices])

  function speak(text: string) {
    if (!audioEnabled) return
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    if (voice) u.voice = voice
    u.rate = 0.9
    u.pitch = 0.95
    u.volume = 1
    window.speechSynthesis.speak(u)
  }

  function toggleAudio() {
    const next = !audioEnabled
    setAudioEnabled(next)
    storage.set(AUDIO_KEY, String(next))
    if (!next && typeof window !== 'undefined') {
      window.speechSynthesis?.cancel()
    }
  }

  function startDrone() {
    const ctx = audioCtxRef.current
    if (!ctx || droneRef.current) return
    try {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {})
      }
      const masterGain = ctx.createGain()
      masterGain.gain.setValueAtTime(0, ctx.currentTime)
      masterGain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 2.5)
      masterGain.connect(ctx.destination)
      const fundamental = 110
      const osc1 = ctx.createOscillator()
      osc1.type = 'sine'
      osc1.frequency.value = fundamental
      osc1.connect(masterGain)
      const osc2 = ctx.createOscillator()
      osc2.type = 'sine'
      osc2.frequency.value = fundamental * 1.5
      osc2.connect(masterGain)
      const osc3 = ctx.createOscillator()
      osc3.type = 'sine'
      osc3.frequency.value = fundamental * 2
      osc3.connect(masterGain)
      const lfo = ctx.createOscillator()
      lfo.frequency.value = 0.08
      const lfoGain = ctx.createGain()
      lfoGain.gain.value = 1.8
      lfo.connect(lfoGain)
      lfoGain.connect(osc1.frequency)
      lfoGain.connect(osc2.frequency)
      osc1.start()
      osc2.start()
      osc3.start()
      lfo.start()
      droneRef.current = { osc1, osc2, osc3, lfo, gain: masterGain }
    } catch {
      // ignored
    }
  }

  function stopDrone() {
    const ctx = audioCtxRef.current
    const drone = droneRef.current
    if (!ctx || !drone) return
    try {
      drone.gain.gain.cancelScheduledValues(ctx.currentTime)
      drone.gain.gain.setValueAtTime(drone.gain.gain.value, ctx.currentTime)
      drone.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1)
    } catch {
      // ignored
    }
    setTimeout(() => {
      try {
        drone.osc1.stop()
        drone.osc2.stop()
        drone.osc3.stop()
        drone.lfo.stop()
      } catch {
        // ignored
      }
      droneRef.current = null
    }, 1200)
  }

  function toggleMusic() {
    const next = !musicEnabled
    setMusicEnabled(next)
    storage.set(MUSIC_KEY, String(next))
    if (next) startDrone()
    else stopDrone()
  }

  useEffect(() => {
    if (typeof navigator === 'undefined') return
    const nav = navigator as Navigator & {
      wakeLock?: { request: (type: 'screen') => Promise<{ release: () => Promise<void> }> }
    }
    if (!nav.wakeLock) return
    let lock: { release: () => Promise<void> } | null = null
    nav.wakeLock
      .request('screen')
      .then((l) => {
        lock = l
      })
      .catch(() => {
        // ignored
      })
    return () => {
      lock?.release().catch(() => {})
    }
  }, [])

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
    if (musicEnabled && !paused && !isComplete) {
      startDrone()
    } else {
      stopDrone()
    }
    return () => {
      stopDrone()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [musicEnabled, paused, isComplete])

  useEffect(() => {
    const drone = droneRef.current
    const ctx = audioCtxRef.current
    if (!drone || !ctx) return
    const fundamental = STEP_FREQUENCIES[index % STEP_FREQUENCIES.length]
    const now = ctx.currentTime
    const rampTime = 2.5
    const targets: [OscillatorNode, number][] = [
      [drone.osc1, fundamental],
      [drone.osc2, fundamental * 1.5],
      [drone.osc3, fundamental * 2],
    ]
    for (const [osc, target] of targets) {
      try {
        osc.frequency.cancelScheduledValues(now)
        osc.frequency.setValueAtTime(osc.frequency.value, now)
        osc.frequency.exponentialRampToValueAtTime(
          Math.max(20, target),
          now + rampTime,
        )
      } catch {
        // ignored
      }
    }
  }, [index])

  useEffect(() => {
    if (paused || isComplete) return
    if (remaining > 0) {
      const id = setTimeout(() => setRemaining((r) => r - 1), 1000)
      return () => clearTimeout(id)
    }
    if (!isLastStep) {
      if (!audioEnabled) playDing()
      setIndex((i) => i + 1)
      setRemaining(flat[index + 1].durationSec)
    } else {
      if (!audioEnabled) playDing()
    }
  }, [remaining, paused, index, isLastStep, isComplete, flat, audioEnabled])

  useEffect(() => {
    if (!audioEnabled || isComplete) {
      if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
      return
    }
    if (paused) {
      if (typeof window !== 'undefined') window.speechSynthesis?.pause()
      return
    }
    if (typeof window !== 'undefined') window.speechSynthesis?.resume()
    const step = flat[index]
    if (!step) return
    const name = poseName(step.poseId)
    const sideText =
      step.side && step.totalSides > 1
        ? step.side === 1
          ? 'First side. '
          : 'Other side. '
        : ''
    const cueText = step.cue ? ` ${step.cue}` : ''
    speak(`${sideText}${name}.${cueText}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, audioEnabled, paused, isComplete, voice])

  useEffect(() => {
    if (isComplete && audioEnabled) {
      speak('Session complete. Notice the body. Take a moment.')
    }
  }, [isComplete, audioEnabled, voice])

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
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white overflow-hidden">
      {flat.map((_, i) => (
        <div
          key={i}
          className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${STEP_GRADIENTS[i % STEP_GRADIENTS.length]} transition-opacity duration-[2500ms] ease-out`}
          style={{ opacity: index === i && !isComplete ? 0.38 : 0 }}
        />
      ))}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            radial-gradient(circle at 15% 20%, rgba(217, 70, 239, 0.35), transparent 45%),
            radial-gradient(circle at 85% 80%, rgba(56, 189, 248, 0.3), transparent 45%),
            radial-gradient(circle at 50% 50%, rgba(251, 146, 60, 0.2), transparent 60%)
          `,
          animation: 'pardesShift 28s ease-in-out infinite',
          mixBlendMode: 'screen',
        }}
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[160vmin] w-[160vmin] -translate-x-1/2 -translate-y-1/2 opacity-15"
        style={{
          backgroundImage: `conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.4) 10deg, transparent 20deg, transparent 40deg, rgba(255,255,255,0.3) 50deg, transparent 60deg, transparent 80deg, rgba(255,255,255,0.4) 90deg, transparent 100deg, transparent 120deg, rgba(255,255,255,0.3) 130deg, transparent 140deg, transparent 360deg)`,
          borderRadius: '50%',
          animation: 'pardesShift 90s linear infinite',
          mixBlendMode: 'overlay',
        }}
      />
      <div className="relative flex h-full flex-col px-6 pt-[max(env(safe-area-inset-top),1.5rem)] pb-[max(env(safe-area-inset-bottom),1.5rem)]">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/60">
            {session.name}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMusic}
              className="rounded-full bg-white/10 px-2 py-1 text-[14px] backdrop-blur transition hover:bg-white/20"
              aria-label={musicEnabled ? 'Mute music' : 'Enable music'}
              title={musicEnabled ? 'Music on' : 'Music off'}
            >
              {musicEnabled ? '🎵' : '🎶'}
            </button>
            <button
              onClick={toggleAudio}
              className="rounded-full bg-white/10 px-2 py-1 text-[14px] backdrop-blur transition hover:bg-white/20"
              aria-label={audioEnabled ? 'Mute voice guide' : 'Enable voice guide'}
              title={audioEnabled ? 'Voice on' : 'Voice off'}
            >
              {audioEnabled ? '🔊' : '🔇'}
            </button>
            <button
              onClick={onClose}
              className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur transition hover:bg-white/20"
            >
              End
            </button>
          </div>
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
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                  poseName(current.poseId) + ' yoga tutorial',
                )}`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[12px] font-semibold text-white/95 backdrop-blur transition hover:bg-white/25"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden>
                  <path fill="currentColor" d="M8 5v14l11-7L8 5z" />
                </svg>
                Watch tutorial
              </a>
              {current.cue && (
                <p className="mt-3 max-w-md text-[14px] leading-relaxed text-white/85">
                  {current.cue}
                </p>
              )}
              {current.rationale && (
                <p className="mt-3 max-w-md rounded-lg bg-white/10 px-3 py-2 text-[12px] leading-relaxed italic text-white/80 backdrop-blur">
                  {current.rationale}
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
