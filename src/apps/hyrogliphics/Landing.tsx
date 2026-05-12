import { useEffect, useRef, useState } from 'react'
import School from './School'
import { chapters } from './lessons'

const GLYPHS = ['𓂀', '𓋹', '𓊽', '𓏏', '𓆣', '𓇳', '𓁹', '𓃭']

type Track = {
  glyph: string
  name: string
  subtitle: string
  arc: string
  audience: string
  startChapter: number
}

const TRACKS: Track[] = [
  {
    glyph: '𓋹',
    name: 'Initiate',
    subtitle: 'First contact',
    arc: 'What an AI actually is. How to talk to one. The mental models that stop you from being fooled by it or scared of it.',
    audience: 'New to all of this.',
    startChapter: 0,
  },
  {
    glyph: '𓊽',
    name: 'Practitioner',
    subtitle: 'Daily fluency',
    arc: 'Bend AI to your work. Prompts that hold. Agents that finish. Pipelines that survive a Monday morning.',
    audience: 'You use it. You want to wield it.',
    startChapter: 2,
  },
  {
    glyph: '𓂀',
    name: 'Adept',
    subtitle: 'Build with it',
    arc: 'Architectures. Evals. Production. The shape of systems that learn, and the seams where they break.',
    audience: 'You ship things. AI is your medium.',
    startChapter: 3,
  },
]

export default function Landing({ onClose }: { onClose: () => void }) {
  const [scrolled, setScrolled] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onScroll = () => setScrolled(el.scrollTop > 12)
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      ref={ref}
      className="fixed inset-0 z-50 overflow-y-auto bg-[#0d0b08] text-[#e8dcc4]"
    >
      <style>{`
        @keyframes glyphDrift {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.55; }
          50%      { transform: translateY(-6px) rotate(1.5deg); opacity: 1; }
        }
        @keyframes ember {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50%      { opacity: 0.85; transform: scale(1.08); }
        }
        @keyframes shimmerGold {
          0%   { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes scanGlyph {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .hg-gold {
          background-image: linear-gradient(
            100deg,
            #8b6914 0%,
            #c9a14a 30%,
            #f3deaa 50%,
            #c9a14a 70%,
            #8b6914 100%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: shimmerGold 9s linear infinite;
        }
        .hg-stone {
          background:
            radial-gradient(at 18% 12%, rgba(201, 161, 74, 0.10), transparent 55%),
            radial-gradient(at 88% 8%,  rgba(139, 105, 20, 0.10), transparent 50%),
            radial-gradient(at 50% 100%, rgba(201, 161, 74, 0.06), transparent 60%),
            linear-gradient(180deg, #0d0b08 0%, #15110b 50%, #0d0b08 100%);
        }
        .hg-grain {
          background-image:
            radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            radial-gradient(rgba(0,0,0,0.18) 1px, transparent 1px);
          background-size: 3px 3px, 5px 5px;
          background-position: 0 0, 1.5px 1.5px;
        }
        .hg-glyph { animation: glyphDrift 6s ease-in-out infinite; }
        .hg-ember { animation: ember 4s ease-in-out infinite; }
        .hg-scan  { animation: scanGlyph 40s linear infinite; }
        .hg-rune::before, .hg-rune::after {
          content: '';
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,161,74,0.4), transparent);
        }
        .hg-rune {
          display: flex;
          align-items: center;
          gap: 0.9rem;
          color: rgba(201,161,74,0.85);
        }
      `}</style>

      {/* Stone background */}
      <div className="hg-stone hg-grain fixed inset-0 -z-10" />

      {/* Top bar */}
      <header
        className={`sticky top-0 z-20 transition-all ${
          scrolled
            ? 'backdrop-blur-md bg-[#0d0b08]/80 border-b border-[#c9a14a]/15'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="text-[22px] leading-none hg-gold">𓋹</span>
            <span className="font-display text-[20px] font-semibold tracking-wide hg-gold">
              hyrogliphics
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="#tracks"
              className="hidden sm:inline-block rounded-full border border-[#c9a14a]/25 px-3.5 py-1.5 text-[12px] tracking-wide text-[#e8dcc4]/85 transition hover:border-[#c9a14a]/60 hover:text-[#f3deaa]"
            >
              Paths
            </a>
            <a
              href="#curriculum"
              className="hidden sm:inline-block rounded-full border border-[#c9a14a]/25 px-3.5 py-1.5 text-[12px] tracking-wide text-[#e8dcc4]/85 transition hover:border-[#c9a14a]/60 hover:text-[#f3deaa]"
            >
              Curriculum
            </a>
            <button
              onClick={onClose}
              aria-label="Close"
              className="rounded-full border border-[#c9a14a]/25 px-3 py-1.5 text-[12px] tracking-wide text-[#e8dcc4]/85 transition hover:border-[#c9a14a]/60 hover:text-[#f3deaa]"
            >
              ✕ close
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-5xl px-5 pt-16 pb-24 sm:pt-24 sm:pb-32">
        {/* Floating ankh ember */}
        <div className="pointer-events-none absolute inset-x-0 top-8 flex justify-center">
          <div
            className="hg-ember text-[120px] sm:text-[180px] leading-none hg-gold opacity-40 select-none"
            aria-hidden
          >
            𓋹
          </div>
        </div>

        <div className="relative z-10 text-center">
          <p className="font-display text-[12px] sm:text-[13px] uppercase tracking-[0.4em] text-[#c9a14a]/80">
            an ai school
          </p>

          <h1 className="mt-5 font-display text-[56px] sm:text-[88px] md:text-[112px] font-semibold leading-[0.95] tracking-tight">
            <span className="hg-gold">Decode</span>
            <br />
            <span className="text-[#e8dcc4]">the language of</span>
            <br />
            <span className="italic text-[#e8dcc4]/90">intelligence.</span>
          </h1>

          <p className="mx-auto mt-8 max-w-xl text-[15px] sm:text-[17px] leading-relaxed text-[#c9bf9d]">
            Hyrogliphics is a school for reading, writing, and building with AI.
            Three paths. One alphabet. Move at your own pace.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#tracks"
              className="group relative inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-[#e8c878] to-[#c9a14a] px-7 py-3.5 text-[14px] font-semibold tracking-wide text-[#1a1208] shadow-[0_0_0_1px_rgba(243,222,170,0.4),0_8px_30px_-8px_rgba(201,161,74,0.6)] transition hover:from-[#f3deaa] hover:to-[#d4b25a]"
            >
              Begin
              <span className="transition group-hover:translate-x-0.5">→</span>
            </a>
            <a
              href="#curriculum"
              className="inline-flex items-center gap-2 rounded-full border border-[#c9a14a]/30 px-7 py-3.5 text-[14px] font-semibold tracking-wide text-[#e8dcc4]/90 transition hover:border-[#c9a14a]/60 hover:text-[#f3deaa]"
            >
              See the curriculum
            </a>
          </div>
        </div>

        {/* Glyph scroller */}
        <div className="relative mt-20 overflow-hidden border-y border-[#c9a14a]/15 py-6">
          <div className="hg-scan flex w-[200%] gap-12 text-[34px] sm:text-[44px] text-[#c9a14a]/55 whitespace-nowrap">
            {[...GLYPHS, ...GLYPHS, ...GLYPHS, ...GLYPHS].map((g, i) => (
              <span key={i} className="inline-block">
                {g}
              </span>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#0d0b08] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#0d0b08] to-transparent" />
        </div>
      </section>

      {/* Manifesto */}
      <section className="mx-auto max-w-3xl px-5 py-20 sm:py-28">
        <div className="hg-rune mb-8 text-[13px] uppercase tracking-[0.35em]">
          <span>The premise</span>
        </div>
        <p className="font-display text-[26px] sm:text-[34px] leading-[1.3] tracking-tight text-[#e8dcc4]">
          For most of history, the people who could read held the power. The
          symbols on the wall were closed to everyone else.
          <br />
          <br />
          <span className="hg-gold">AI is the new wall.</span> We teach you the
          alphabet.
        </p>
      </section>

      {/* Three paths */}
      <section id="tracks" className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
        <div className="hg-rune mb-3 text-[13px] uppercase tracking-[0.35em]">
          <span>Three paths</span>
        </div>
        <h2 className="font-display text-[40px] sm:text-[56px] font-semibold leading-tight tracking-tight">
          <span className="hg-gold">Choose</span> where you stand.
        </h2>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[#c9bf9d]">
          Hyrogliphics is built for mixed company. The same alphabet, taught at
          the depth you need.
        </p>

        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {TRACKS.map((t) => (
            <article
              key={t.name}
              className="group relative overflow-hidden rounded-2xl border border-[#c9a14a]/15 bg-gradient-to-b from-[#1a1612] to-[#120e0a] p-6 transition hover:border-[#c9a14a]/45"
            >
              <div className="absolute -top-8 -right-6 text-[120px] leading-none text-[#c9a14a]/[0.06] select-none transition group-hover:text-[#c9a14a]/[0.12]">
                {t.glyph}
              </div>
              <div className="relative">
                <div className="text-[40px] leading-none hg-gold">{t.glyph}</div>
                <h3 className="mt-5 font-display text-[28px] font-semibold tracking-tight text-[#f3deaa]">
                  {t.name}
                </h3>
                <p className="mt-1 text-[12px] uppercase tracking-[0.2em] text-[#c9a14a]/70">
                  {t.subtitle}
                </p>
                <p className="mt-5 text-[14px] leading-relaxed text-[#c9bf9d]">
                  {t.arc}
                </p>
                <p className="mt-6 border-t border-[#c9a14a]/15 pt-4 text-[12px] italic text-[#e8dcc4]/60">
                  {t.audience}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Curriculum */}
      <section id="curriculum" className="mx-auto max-w-5xl px-5 py-20 sm:py-28">
        <div className="hg-rune mb-3 text-[13px] uppercase tracking-[0.35em]">
          <span>The alphabet</span>
        </div>
        <h2 className="font-display text-[40px] sm:text-[56px] font-semibold leading-tight tracking-tight">
          <span className="text-[#e8dcc4]">Six chapters.</span>{' '}
          <span className="hg-gold italic">One literacy.</span>
        </h2>

        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-[#c9a14a]/15 bg-[#c9a14a]/15 sm:grid-cols-2 md:grid-cols-3">
          {CHAPTERS.map((c, i) => (
            <div
              key={c.title}
              className="group flex items-start gap-4 bg-[#120e0a] p-6 transition hover:bg-[#1a1612]"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#c9a14a]/25 bg-[#0d0b08] text-[24px] hg-gold transition group-hover:border-[#c9a14a]/60">
                {c.glyph}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.25em] text-[#c9a14a]/70">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-1 font-display text-[22px] font-semibold leading-tight text-[#f3deaa]">
                  {c.title}
                </h3>
                <p className="mt-1 text-[13px] leading-relaxed text-[#c9bf9d]">
                  {c.note}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Method */}
      <section className="mx-auto max-w-5xl px-5 py-20 sm:py-28">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <div className="hg-rune mb-3 text-[13px] uppercase tracking-[0.35em]">
              <span>The method</span>
            </div>
            <h2 className="font-display text-[40px] sm:text-[52px] font-semibold leading-tight tracking-tight">
              <span className="hg-gold">Read.</span>{' '}
              <span className="text-[#e8dcc4]">Write.</span>{' '}
              <span className="italic text-[#e8dcc4]/90">Build.</span>
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-[#c9bf9d]">
              Every lesson follows the same three motions of literacy. First you
              learn to <em className="text-[#f3deaa] not-italic">read</em>{' '}
              — to see what a model is doing. Then to{' '}
              <em className="text-[#f3deaa] not-italic">write</em> — to shape
              what it produces. Then to{' '}
              <em className="text-[#f3deaa] not-italic">build</em> — to put it
              to work on something that matters to you.
            </p>
            <p className="mt-5 text-[15px] leading-relaxed text-[#c9bf9d]">
              No hype. No magic. The wall comes down by the end of the lesson.
            </p>
          </div>

          <div className="relative aspect-square overflow-hidden rounded-2xl border border-[#c9a14a]/20 bg-gradient-to-br from-[#1a1612] to-[#0d0b08]">
            <div className="absolute inset-0 hg-grain opacity-40" />
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
              {['𓂀', '𓋹', '𓊽', '𓏏', '𓆣', '𓇳', '𓁹', '𓃭', '𓋴'].map(
                (g, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-center text-[44px] sm:text-[60px] hg-gold opacity-70"
                    style={{ animation: `glyphDrift ${4 + (i % 4)}s ease-in-out ${i * 0.3}s infinite` }}
                  >
                    {g}
                  </div>
                ),
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-radial pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at center, transparent 30%, rgba(13,11,8,0.85) 75%)',
              }}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-5 py-20 sm:py-32">
        <div className="relative overflow-hidden rounded-3xl border border-[#c9a14a]/25 bg-gradient-to-b from-[#1a1612] to-[#120e0a] p-10 sm:p-14 text-center">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-[140px] leading-none hg-gold opacity-15 select-none">
            𓋹
          </div>
          <div className="relative">
            <p className="font-display text-[12px] uppercase tracking-[0.4em] text-[#c9a14a]/80">
              The next cohort
            </p>
            <h2 className="mt-4 font-display text-[36px] sm:text-[48px] font-semibold leading-tight tracking-tight">
              <span className="text-[#e8dcc4]">The tablet is</span>{' '}
              <span className="hg-gold italic">waiting.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-[#c9bf9d]">
              Join the waitlist. We'll send one note when the first cohort
              opens — no marketing, no sequence.
            </p>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="mx-auto mt-8 flex max-w-md flex-col gap-2 sm:flex-row"
            >
              <input
                type="email"
                placeholder="you@example.com"
                className="flex-1 rounded-full border border-[#c9a14a]/25 bg-[#0d0b08] px-5 py-3 text-[14px] text-[#e8dcc4] placeholder:text-[#c9bf9d]/40 outline-none transition focus:border-[#c9a14a]/70"
              />
              <button
                type="submit"
                className="rounded-full bg-gradient-to-b from-[#e8c878] to-[#c9a14a] px-6 py-3 text-[14px] font-semibold tracking-wide text-[#1a1208] transition hover:from-[#f3deaa] hover:to-[#d4b25a]"
              >
                Get the note
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#c9a14a]/15">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-5 py-10 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2 text-[#c9a14a]/70">
            <span className="hg-glyph text-[18px]">𓋹</span>
            <span className="font-display text-[15px] tracking-wide">
              hyrogliphics
            </span>
          </div>
          <div className="flex items-center gap-5 text-[12px] text-[#c9bf9d]/60">
            <span>Decode the language of intelligence.</span>
          </div>
          <div className="flex items-center gap-3 text-[18px] text-[#c9a14a]/40">
            {['𓂀', '𓋹', '𓊽'].map((g, i) => (
              <span
                key={i}
                className="hg-glyph"
                style={{ animationDelay: `${i * 0.6}s` }}
              >
                {g}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
