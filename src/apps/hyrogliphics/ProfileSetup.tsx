import { useState } from 'react'

export type Profile = {
  name: string
  role: string
  level: 'new' | 'user' | 'builder'
  goal: string
}

const LEVELS: { id: Profile['level']; label: string; sub: string }[] = [
  { id: 'new', label: 'New to it', sub: "I've barely touched AI" },
  { id: 'user', label: 'I use it', sub: 'Chat tools, daily-ish' },
  { id: 'builder', label: 'I build with it', sub: 'I write code, ship things' },
]

export default function ProfileSetup({
  onSave,
  initial,
  onSkip,
}: {
  onSave: (p: Profile) => void
  initial?: Partial<Profile>
  onSkip?: () => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [role, setRole] = useState(initial?.role ?? '')
  const [level, setLevel] = useState<Profile['level']>(
    initial?.level ?? 'user',
  )
  const [goal, setGoal] = useState(initial?.goal ?? '')

  const canSave = name.trim().length > 0 && role.trim().length > 0

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0d0b08]/95 p-5 backdrop-blur-md">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[#c9a14a]/25 bg-gradient-to-b from-[#1a1612] to-[#120e0a]">
        <div className="border-b border-[#c9a14a]/15 px-6 py-5 text-center">
          <div className="text-[32px] leading-none"
            style={{
              backgroundImage:
                'linear-gradient(100deg, #8b6914, #c9a14a 40%, #f3deaa 50%, #c9a14a 60%, #8b6914)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}>
            𓋹
          </div>
          <p className="mt-3 text-[11px] uppercase tracking-[0.3em] text-[#c9a14a]/80">
            Before we begin
          </p>
          <h2 className="mt-2 font-display text-[24px] font-semibold tracking-tight text-[#f3deaa]">
            Who am I teaching?
          </h2>
          <p className="mx-auto mt-2 max-w-xs text-[12px] leading-relaxed text-[#c9bf9d]">
            Four quick questions. Your teachers will use this to make every
            lesson land in your world.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!canSave) return
            onSave({ name: name.trim(), role: role.trim(), level, goal: goal.trim() })
          }}
          className="flex flex-col gap-5 px-6 py-6"
        >
          <Field label="What should we call you?">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your first name"
              className="w-full rounded-lg border border-[#c9a14a]/25 bg-[#0d0b08] px-3 py-2.5 text-[14px] text-[#e8dcc4] placeholder:text-[#c9bf9d]/30 outline-none transition focus:border-[#c9a14a]/70"
            />
          </Field>

          <Field label="What do you do? (one line)">
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. founder, dentist, designer, student, retired"
              className="w-full rounded-lg border border-[#c9a14a]/25 bg-[#0d0b08] px-3 py-2.5 text-[14px] text-[#e8dcc4] placeholder:text-[#c9bf9d]/30 outline-none transition focus:border-[#c9a14a]/70"
            />
          </Field>

          <Field label="Your comfort with AI">
            <div className="grid grid-cols-3 gap-2">
              {LEVELS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setLevel(l.id)}
                  className={`rounded-lg border px-2 py-2.5 text-left transition ${
                    level === l.id
                      ? 'border-[#c9a14a] bg-[#c9a14a]/12 text-[#f3deaa]'
                      : 'border-[#c9a14a]/20 text-[#e8dcc4]/80 hover:border-[#c9a14a]/45'
                  }`}
                >
                  <div className="text-[12px] font-semibold">{l.label}</div>
                  <div className="mt-1 text-[10px] leading-tight text-[#c9bf9d]/65">
                    {l.sub}
                  </div>
                </button>
              ))}
            </div>
          </Field>

          <Field label="Why are you learning this? (optional)">
            <input
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. ship a side project, save time at work, just curious"
              className="w-full rounded-lg border border-[#c9a14a]/25 bg-[#0d0b08] px-3 py-2.5 text-[14px] text-[#e8dcc4] placeholder:text-[#c9bf9d]/30 outline-none transition focus:border-[#c9a14a]/70"
            />
          </Field>

          <div className="mt-2 flex items-center justify-between gap-3">
            {onSkip ? (
              <button
                type="button"
                onClick={onSkip}
                className="text-[12px] text-[#c9bf9d]/60 transition hover:text-[#e8dcc4]"
              >
                Skip for now
              </button>
            ) : <span />}
            <button
              type="submit"
              disabled={!canSave}
              className="rounded-full bg-gradient-to-b from-[#e8c878] to-[#c9a14a] px-6 py-2.5 text-[13px] font-semibold tracking-wide text-[#1a1208] transition hover:from-[#f3deaa] hover:to-[#d4b25a] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Begin →
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] uppercase tracking-[0.22em] text-[#c9a14a]/75">
        {label}
      </span>
      {children}
    </label>
  )
}
