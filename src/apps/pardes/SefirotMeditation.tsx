import { useEffect, useRef, useState } from 'react'
import { sefirot, type Sefira } from './sefirot'

const SECONDS_PER_SEFIRA = 60

function format(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function SefirotMeditation({
  onClose,
}: {
  onClose: () => void
}) {
  const [index, setIndex] = useState(0)
  const [remaining, setRemaining] = useState(SECONDS_PER_SEFIRA)
  const [paused, setPaused] = useState(false)
  const [breathPhase, setBreathPhase] = useState<'in' | 'out'>('in')
  const audioCtxRef = useRef<AudioContext | null>(null)

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

  function playSoftChime(freq: number) {
    const ctx = audioCtxRef.current
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    osc.connect(gain)
    gain.connect(ctx.destination)
    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5)
    osc.start()
    osc.stop(ctx.currentTime + 1.6)
  }

  const isLast = index >= sefirot.length - 1
  const isComplete = isLast && remaining <= 0
  const current: Sefira = sefirot[index]

  useEffect(() => {
    if (paused || isComplete) return
    if (remaining > 0) {
      const id = setTimeout(() => setRemaining((r) => r - 1), 1000)
      return () => clearTimeout(id)
    }
    if (!isLast) {
      playSoftChime(440)
      setIndex((i) => i + 1)
      setRemaining(SECONDS_PER_SEFIRA)
    } else {
      playSoftChime(528)
    }
  }, [remaining, paused, index, isLast, isComplete])

  useEffect(() => {
    if (paused || isComplete) return
    setBreathPhase('in')
    const halfCycleMs = current.breathSec * 500
    const id = setInterval(() => {
      setBreathPhase((p) => (p === 'in' ? 'out' : 'in'))
    }, halfCycleMs)
    return () => clearInterval(id)
  }, [current, paused, isComplete])

  function goPrev() {
    if (index === 0) return
    setIndex(index - 1)
    setRemaining(SECONDS_PER_SEFIRA)
  }

  function goNext() {
    if (isLast) {
      onClose()
      return
    }
    setIndex(index + 1)
    setRemaining(SECONDS_PER_SEFIRA)
  }

  const isLight = current.textTone === 'light'
  const textBase = isLight ? 'text-white' : 'text-slate-900'
  const subtleText = isLight ? 'text-white/70' : 'text-slate-600'
  const mutedText = isLight ? 'text-white/55' : 'text-slate-500'

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden transition-colors duration-[2000ms] ${textBase}`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${current.bgGradient} transition-all duration-[2000ms]`}
      />

      <div
        className="absolute inset-0 mix-blend-screen opacity-70"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, ${current.accentColor}66, transparent 45%),
            radial-gradient(circle at 80% 70%, ${current.accentColor}55, transparent 50%),
            radial-gradient(circle at 50% 90%, ${current.accentColor}44, transparent 55%)
          `,
          animation: 'pardesShift 18s ease-in-out infinite',
        }}
      />

      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          width: breathPhase === 'in' ? '70vmin' : '40vmin',
          height: breathPhase === 'in' ? '70vmin' : '40vmin',
          background: `radial-gradient(circle, ${current.accentColor}88, transparent 70%)`,
          transition: `width ${current.breathSec / 2}s ease-in-out, height ${current.breathSec / 2}s ease-in-out, opacity ${current.breathSec / 2}s ease-in-out`,
          opacity: breathPhase === 'in' ? 0.8 : 0.4,
        }}
      />

      <div className="relative flex h-full flex-col px-6 pt-[max(env(safe-area-inset-top),1.5rem)] pb-[max(env(safe-area-inset-bottom),1.5rem)]">
        <div className="flex items-center justify-between">
          <p
            className={`text-[11px] font-bold uppercase tracking-[0.18em] ${subtleText}`}
          >
            Pardes · Sefirot
          </p>
          <button
            onClick={onClose}
            className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur transition ${isLight ? 'bg-white/15 hover:bg-white/25' : 'bg-black/10 hover:bg-black/20'}`}
          >
            End
          </button>
        </div>

        <div className="mt-3 flex items-center gap-1">
          {sefirot.map((s, i) => (
            <div
              key={s.id}
              className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${
                i < index
                  ? isLight
                    ? 'bg-white/70'
                    : 'bg-slate-700'
                  : i === index
                    ? isLight
                      ? 'bg-white'
                      : 'bg-slate-900'
                    : isLight
                      ? 'bg-white/15'
                      : 'bg-slate-300'
              }`}
            />
          ))}
        </div>

        <div className="flex flex-1 flex-col items-center justify-center text-center">
          {isComplete ? (
            <>
              <p
                className={`text-[11px] font-bold uppercase tracking-[0.2em] ${subtleText}`}
              >
                Complete
              </p>
              <h2 className="mt-4 text-5xl font-bold">תָּם וְנִשְׁלָם</h2>
              <p className={`mt-3 max-w-md text-[14px] ${subtleText}`}>
                Return slowly. Notice the body. Carry what you can with you.
              </p>
              <button
                onClick={onClose}
                className={`mt-8 rounded-full px-8 py-3 font-semibold backdrop-blur transition ${isLight ? 'bg-white/20 hover:bg-white/30' : 'bg-slate-900/10 hover:bg-slate-900/20'}`}
              >
                Close
              </button>
            </>
          ) : (
            <>
              <p
                className={`text-[11px] font-bold uppercase tracking-[0.2em] ${subtleText}`}
              >
                {index + 1} · {sefirot.length}
              </p>
              <h1
                className="mt-3 text-[88px] font-bold leading-none drop-shadow-lg sm:text-[120px]"
                style={{ textShadow: `0 0 40px ${current.accentColor}` }}
              >
                {current.hebrew}
              </h1>
              <p className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                {current.transliteration}
              </p>
              <p className={`mt-1 text-[13px] uppercase tracking-[0.18em] ${subtleText}`}>
                {current.attribute}
              </p>
              <p
                className={`mt-8 max-w-md text-[15px] leading-relaxed italic ${subtleText}`}
              >
                {current.kavanah}
              </p>
              <p
                className={`mt-10 text-[11px] font-bold uppercase tracking-[0.18em] ${mutedText}`}
              >
                {breathPhase === 'in' ? 'Inhale' : 'Exhale'}
              </p>
              <p className={`mt-3 text-[12px] tabular-nums ${mutedText}`}>
                {format(remaining)}
              </p>
              {paused && (
                <p
                  className={`mt-2 text-[11px] font-bold uppercase tracking-[0.2em] ${mutedText}`}
                >
                  Paused
                </p>
              )}
            </>
          )}
        </div>

        {!isComplete && (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={goPrev}
              disabled={index === 0}
              className={`rounded-full p-3 backdrop-blur transition disabled:opacity-30 ${isLight ? 'bg-white/15 hover:bg-white/25' : 'bg-black/10 hover:bg-black/20'}`}
              aria-label="Previous"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                <path
                  d="M6 5h2v14H6V5zm12 0v14L8 12l10-7z"
                  fill="currentColor"
                />
              </svg>
            </button>
            <button
              onClick={() => setPaused((p) => !p)}
              className={`rounded-full px-7 py-3 font-bold backdrop-blur transition ${isLight ? 'bg-white text-slate-900 hover:bg-white/90' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
              aria-label={paused ? 'Resume' : 'Pause'}
            >
              {paused ? (
                <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
                  <path d="M8 5v14l11-7L8 5z" fill="currentColor" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
                  <path
                    d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"
                    fill="currentColor"
                  />
                </svg>
              )}
            </button>
            <button
              onClick={goNext}
              className={`rounded-full p-3 backdrop-blur transition ${isLight ? 'bg-white/15 hover:bg-white/25' : 'bg-black/10 hover:bg-black/20'}`}
              aria-label="Next"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
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
