import { useEffect, useMemo, useRef, useState } from 'react'
import { storage } from '../../lib/storage'
import { chapters, allLessons } from './lessons'
import type { Block, Lesson } from './lessons'
import { extras } from './extras'
import ProfileSetup from './ProfileSetup'
import type { Profile } from './ProfileSetup'
import Teacher from './Teacher'

const PROGRESS_KEY = 'hyrogliphics:progress'
const POSITION_KEY = 'hyrogliphics:position'
const PROFILE_KEY = 'hyrogliphics:profile'

function readProfile(): Profile | null {
  const raw = storage.get(PROFILE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Profile
  } catch {
    return null
  }
}

function writeProfile(p: Profile) {
  storage.set(PROFILE_KEY, JSON.stringify(p))
}

function readProgress(): Record<string, boolean> {
  const raw = storage.get(PROGRESS_KEY)
  if (!raw) return {}
  try {
    return JSON.parse(raw) as Record<string, boolean>
  } catch {
    return {}
  }
}

function writeProgress(map: Record<string, boolean>) {
  storage.set(PROGRESS_KEY, JSON.stringify(map))
}

function readPosition(): { chapter: number; lesson: number } | null {
  const raw = storage.get(POSITION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function writePosition(chapter: number, lesson: number) {
  storage.set(POSITION_KEY, JSON.stringify({ chapter, lesson }))
}

export default function School({
  onClose,
  initialChapter,
  initialLesson,
}: {
  onClose: () => void
  initialChapter?: number
  initialLesson?: number
}) {
  const saved = useMemo(readPosition, [])
  const [chapterIdx, setChapterIdx] = useState(
    initialChapter ?? saved?.chapter ?? 0,
  )
  const [lessonIdx, setLessonIdx] = useState(
    initialLesson ?? saved?.lesson ?? 0,
  )
  const [progress, setProgress] = useState<Record<string, boolean>>(readProgress)
  const [profile, setProfile] = useState<Profile | null>(readProfile)
  const [profileGate, setProfileGate] = useState<'first' | 'edit' | null>(() =>
    readProfile() ? null : 'first',
  )
  const [navOpen, setNavOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const chapter = chapters[chapterIdx]
  const lesson: Lesson = chapter.lessons[lessonIdx]
  const lessonExtras = extras[lesson.id] ?? null

  const flat = useMemo(allLessons, [])
  const flatIndex = flat.findIndex(
    (f) => f.chapterIndex === chapterIdx && f.lessonIndex === lessonIdx,
  )
  const totalLessons = flat.length
  const completedCount = Object.values(progress).filter(Boolean).length

  useEffect(() => {
    writePosition(chapterIdx, lessonIdx)
    if (scrollRef.current) scrollRef.current.scrollTop = 0
    setNavOpen(false)
  }, [chapterIdx, lessonIdx])

  const goTo = (c: number, l: number) => {
    setChapterIdx(c)
    setLessonIdx(l)
  }

  const goPrev = () => {
    if (flatIndex <= 0) return
    const target = flat[flatIndex - 1]
    goTo(target.chapterIndex, target.lessonIndex)
  }

  const goNext = () => {
    if (flatIndex >= flat.length - 1) {
      markComplete()
      return
    }
    markComplete()
    const target = flat[flatIndex + 1]
    goTo(target.chapterIndex, target.lessonIndex)
  }

  const markComplete = () => {
    if (progress[lesson.id]) return
    const next = { ...progress, [lesson.id]: true }
    setProgress(next)
    writeProgress(next)
  }

  const toggleComplete = () => {
    const next = { ...progress, [lesson.id]: !progress[lesson.id] }
    setProgress(next)
    writeProgress(next)
  }

  return (
    <div
      ref={scrollRef}
      className="fixed inset-0 z-50 overflow-y-auto bg-[#0d0b08] text-[#e8dcc4]"
    >
      <style>{`
        @keyframes shimmerGold {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        .hg-gold {
          background-image: linear-gradient(
            100deg, #8b6914 0%, #c9a14a 30%, #f3deaa 50%, #c9a14a 70%, #8b6914 100%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text; background-clip: text; color: transparent;
          animation: shimmerGold 9s linear infinite;
        }
        .hg-stone {
          background:
            radial-gradient(at 18% 12%, rgba(201, 161, 74, 0.08), transparent 55%),
            radial-gradient(at 88% 8%,  rgba(139, 105, 20, 0.08), transparent 50%),
            linear-gradient(180deg, #0d0b08 0%, #15110b 50%, #0d0b08 100%);
        }
        .hg-grain {
          background-image:
            radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            radial-gradient(rgba(0,0,0,0.18) 1px, transparent 1px);
          background-size: 3px 3px, 5px 5px;
          background-position: 0 0, 1.5px 1.5px;
        }
      `}</style>

      <div className="hg-stone hg-grain fixed inset-0 -z-10" />

      {/* Top bar */}
      <header className="sticky top-0 z-20 backdrop-blur-md bg-[#0d0b08]/85 border-b border-[#c9a14a]/15">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="text-[20px] leading-none hg-gold">𓋹</span>
            <span className="hidden font-display text-[18px] font-semibold tracking-wide hg-gold sm:inline">
              hyrogliphics
            </span>
            <span className="hidden text-[#c9a14a]/40 sm:inline">·</span>
            <span className="truncate text-[12px] uppercase tracking-[0.2em] text-[#c9a14a]/80">
              {chapter.title}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-[11px] tracking-wide text-[#c9bf9d]/60 sm:inline">
              {completedCount}/{totalLessons} complete
            </span>
            {profile && (
              <button
                onClick={() => setProfileGate('edit')}
                className="hidden rounded-full border border-[#c9a14a]/25 px-3 py-1.5 text-[12px] tracking-wide text-[#e8dcc4]/85 transition hover:border-[#c9a14a]/60 hover:text-[#f3deaa] sm:inline-block"
              >
                {profile.name}
              </button>
            )}
            <button
              onClick={() => setNavOpen((o) => !o)}
              className="rounded-full border border-[#c9a14a]/25 px-3 py-1.5 text-[12px] tracking-wide text-[#e8dcc4]/85 transition hover:border-[#c9a14a]/60 hover:text-[#f3deaa] lg:hidden"
            >
              {navOpen ? '✕ close' : '☰ chapters'}
            </button>
            <button
              onClick={onClose}
              aria-label="Exit school"
              className="rounded-full border border-[#c9a14a]/25 px-3 py-1.5 text-[12px] tracking-wide text-[#e8dcc4]/85 transition hover:border-[#c9a14a]/60 hover:text-[#f3deaa]"
            >
              ✕ exit
            </button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-[2px] w-full bg-[#c9a14a]/10">
          <div
            className="h-full bg-gradient-to-r from-[#8b6914] via-[#f3deaa] to-[#8b6914] transition-all"
            style={{ width: `${(completedCount / totalLessons) * 100}%` }}
          />
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8 sm:px-5 sm:py-10 lg:gap-10">
        {/* Chapter / lesson nav */}
        <aside
          className={`${
            navOpen
              ? 'fixed inset-x-0 top-[57px] z-10 max-h-[calc(100vh-57px)] overflow-y-auto bg-[#0d0b08]/95 backdrop-blur-md px-5 py-6 lg:static lg:bg-transparent lg:px-0 lg:py-0'
              : 'hidden lg:block'
          } lg:sticky lg:top-[80px] lg:h-[calc(100vh-100px)] lg:w-72 lg:shrink-0 lg:overflow-y-auto`}
        >
          <nav className="flex flex-col gap-6">
            {chapters.map((c, ci) => (
              <div key={c.id}>
                <div className="mb-2 flex items-center gap-2 px-1">
                  <span className="text-[18px] hg-gold">{c.glyph}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-[15px] font-semibold leading-tight text-[#f3deaa]">
                      {c.title}
                    </p>
                    <p className="truncate text-[10px] uppercase tracking-[0.18em] text-[#c9a14a]/65">
                      {c.subtitle}
                    </p>
                  </div>
                </div>
                <ul className="flex flex-col gap-px overflow-hidden rounded-lg border border-[#c9a14a]/15 bg-[#0d0b08]/50">
                  {c.lessons.map((l, li) => {
                    const isCurrent = ci === chapterIdx && li === lessonIdx
                    const isDone = !!progress[l.id]
                    return (
                      <li key={l.id}>
                        <button
                          onClick={() => goTo(ci, li)}
                          className={`group flex w-full items-start gap-3 px-3 py-2.5 text-left transition ${
                            isCurrent
                              ? 'bg-[#c9a14a]/12'
                              : 'hover:bg-[#c9a14a]/[0.06]'
                          }`}
                        >
                          <span
                            className={`mt-[2px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[9px] ${
                              isDone
                                ? 'border-[#c9a14a] bg-[#c9a14a] text-[#0d0b08]'
                                : isCurrent
                                ? 'border-[#f3deaa]/80'
                                : 'border-[#c9a14a]/30'
                            }`}
                          >
                            {isDone ? '✓' : ''}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span
                              className={`block text-[13px] leading-snug ${
                                isCurrent
                                  ? 'text-[#f3deaa]'
                                  : 'text-[#e8dcc4]/85'
                              }`}
                            >
                              {l.title}
                            </span>
                            <span className="block text-[10px] text-[#c9bf9d]/55">
                              {l.minutes} min read
                            </span>
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Lesson body */}
        <main className="min-w-0 flex-1">
          <article className="mx-auto max-w-2xl">
            <div className="mb-6 flex items-center gap-3">
              <span className="text-[44px] leading-none hg-gold">
                {lesson.glyph}
              </span>
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-[#c9a14a]/75">
                  {chapter.title} · Lesson {lessonIdx + 1} of{' '}
                  {chapter.lessons.length}
                </p>
                <p className="mt-1 text-[12px] text-[#c9bf9d]/65">
                  {lesson.minutes} minute read
                </p>
              </div>
            </div>

            <h1 className="font-display text-[36px] sm:text-[44px] font-semibold leading-[1.05] tracking-tight">
              <span className="hg-gold">{lesson.title}</span>
            </h1>
            <p className="mt-3 font-display text-[18px] sm:text-[20px] italic leading-snug text-[#e8dcc4]/85">
              {lesson.summary}
            </p>

            <div className="mt-10 flex flex-col gap-5">
              {lesson.body.map((b, i) => (
                <BlockView key={i} block={b} />
              ))}
            </div>

            {/* Practice exercise */}
            {lessonExtras && (
              <section className="mt-12 overflow-hidden rounded-2xl border border-[#c9a14a]/25 bg-gradient-to-b from-[#1a1612] to-[#120e0a]">
                <div className="border-b border-[#c9a14a]/15 px-5 py-4">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-[#c9a14a]/80">
                    Practice
                  </p>
                  <h3 className="mt-1.5 font-display text-[22px] font-semibold leading-tight text-[#f3deaa]">
                    {lessonExtras.practice.title}
                  </h3>
                </div>
                <div className="flex flex-col gap-4 px-5 py-5">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-[#c9a14a]/70">
                      What you make
                    </p>
                    <p className="mt-1 text-[14px] leading-relaxed text-[#e8dcc4]/90">
                      {lessonExtras.practice.artifact}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-[#c9a14a]/70">
                      How
                    </p>
                    <p className="mt-1 text-[14px] leading-relaxed text-[#c9bf9d]">
                      {lessonExtras.practice.brief}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Teacher chat */}
            {lessonExtras && (
              <div className="mt-8">
                <Teacher
                  lessonId={lesson.id}
                  teacher={lessonExtras.teacher}
                  practice={lessonExtras.practice}
                  profile={profile}
                />
              </div>
            )}

            {/* Footer nav */}
            <div className="mt-14 flex items-center justify-between gap-3 border-t border-[#c9a14a]/15 pt-6">
              <button
                onClick={goPrev}
                disabled={flatIndex <= 0}
                className="rounded-full border border-[#c9a14a]/25 px-5 py-2.5 text-[13px] tracking-wide text-[#e8dcc4]/85 transition hover:border-[#c9a14a]/60 hover:text-[#f3deaa] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-[#c9a14a]/25 disabled:hover:text-[#e8dcc4]/85"
              >
                ← Previous
              </button>

              <button
                onClick={toggleComplete}
                className={`rounded-full border px-4 py-2.5 text-[12px] tracking-wide transition ${
                  progress[lesson.id]
                    ? 'border-[#c9a14a] bg-[#c9a14a]/15 text-[#f3deaa]'
                    : 'border-[#c9a14a]/25 text-[#e8dcc4]/75 hover:border-[#c9a14a]/60'
                }`}
              >
                {progress[lesson.id] ? '✓ Completed' : 'Mark complete'}
              </button>

              <button
                onClick={goNext}
                className="rounded-full bg-gradient-to-b from-[#e8c878] to-[#c9a14a] px-5 py-2.5 text-[13px] font-semibold tracking-wide text-[#1a1208] transition hover:from-[#f3deaa] hover:to-[#d4b25a]"
              >
                {flatIndex >= flat.length - 1 ? 'Finish' : 'Next →'}
              </button>
            </div>

            {flatIndex >= flat.length - 1 && progress[lesson.id] && (
              <div className="mt-10 rounded-2xl border border-[#c9a14a]/25 bg-gradient-to-b from-[#1a1612] to-[#120e0a] p-6 text-center">
                <div className="hg-gold text-[40px]">𓋹</div>
                <p className="mt-3 font-display text-[24px] font-semibold tracking-tight">
                  <span className="hg-gold">The wall has come down.</span>
                </p>
                <p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-[#c9bf9d]">
                  You have read the alphabet end to end. Now go write
                  something in it.
                </p>
              </div>
            )}
          </article>
        </main>
      </div>

      {profileGate && (
        <ProfileSetup
          initial={profile ?? undefined}
          onSave={(p) => {
            setProfile(p)
            writeProfile(p)
            setProfileGate(null)
          }}
          onSkip={profileGate === 'edit' ? () => setProfileGate(null) : () => setProfileGate(null)}
        />
      )}
    </div>
  )
}

function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case 'p':
      return (
        <p className="text-[16px] leading-[1.75] text-[#e8dcc4]/90">
          {block.text}
        </p>
      )
    case 'h':
      return (
        <h2 className="mt-4 font-display text-[24px] font-semibold tracking-tight text-[#f3deaa]">
          {block.text}
        </h2>
      )
    case 'quote':
      return (
        <blockquote className="border-l-2 border-[#c9a14a]/60 pl-5 font-display text-[20px] italic leading-snug text-[#e8dcc4]">
          {block.text}
        </blockquote>
      )
    case 'list':
      return (
        <ul className="flex flex-col gap-2.5 pl-1">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3 text-[15px] leading-[1.65] text-[#e8dcc4]/85">
              <span className="mt-[10px] inline-block h-[5px] w-[5px] shrink-0 rotate-45 bg-[#c9a14a]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )
    case 'try':
      return (
        <div className="rounded-xl border border-[#c9a14a]/25 bg-[#c9a14a]/[0.04] p-5">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#c9a14a]/85">
            Try this
          </p>
          <p className="mt-2 text-[15px] leading-[1.65] text-[#e8dcc4]">
            {block.prompt}
          </p>
          {block.note && (
            <p className="mt-2 text-[13px] italic leading-relaxed text-[#c9bf9d]/80">
              {block.note}
            </p>
          )}
        </div>
      )
    case 'aside':
      return (
        <p className="border-l border-[#c9a14a]/30 pl-4 text-[14px] italic leading-relaxed text-[#c9bf9d]">
          {block.text}
        </p>
      )
  }
}
