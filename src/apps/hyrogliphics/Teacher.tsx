import { useEffect, useRef, useState } from 'react'
import { storage } from '../../lib/storage'
import type { Teacher as TeacherMeta, Practice } from './extras'
import type { Profile } from './ProfileSetup'

type ChatMsg = { role: 'user' | 'assistant'; content: string }

function chatKey(lessonId: string) {
  return `hyrogliphics:chat:${lessonId}`
}

function readChat(lessonId: string): ChatMsg[] {
  const raw = storage.get(chatKey(lessonId))
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeChat(lessonId: string, messages: ChatMsg[]) {
  storage.set(chatKey(lessonId), JSON.stringify(messages))
}

export default function Teacher({
  lessonId,
  teacher,
  practice,
  profile,
}: {
  lessonId: string
  teacher: TeacherMeta
  practice: Practice
  profile: Profile | null
}) {
  const [messages, setMessages] = useState<ChatMsg[]>(() => readChat(lessonId))
  const [draft, setDraft] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Reset state when lesson changes
  useEffect(() => {
    setMessages(readChat(lessonId))
    setDraft('')
    setError(null)
    setPending(false)
  }, [lessonId])

  // Persist messages
  useEffect(() => {
    writeChat(lessonId, messages)
  }, [lessonId, messages])

  // Scroll to bottom on new messages
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages, pending])

  // Auto-fetch opener on first open (no messages yet)
  useEffect(() => {
    if (messages.length === 0) {
      void fetchReply([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId])

  async function fetchReply(history: ChatMsg[]) {
    setPending(true)
    setError(null)
    try {
      const r = await fetch('/api/hyrogliphics-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId,
          messages: history,
          profile: profile ?? {},
        }),
      })
      if (!r.ok) {
        const data = (await r.json().catch(() => null)) as { error?: string } | null
        throw new Error(data?.error ?? `Request failed (${r.status})`)
      }
      const data = (await r.json()) as { reply: string }
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setPending(false)
    }
  }

  function onSend(e: React.FormEvent) {
    e.preventDefault()
    const text = draft.trim()
    if (!text || pending) return
    const next: ChatMsg[] = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setDraft('')
    void fetchReply(next)
  }

  function onResetChat() {
    if (!confirm('Reset this conversation with ' + teacher.name + '?')) return
    setMessages([])
    storage.remove(chatKey(lessonId))
    setTimeout(() => void fetchReply([]), 50)
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-[#c9a14a]/20 bg-gradient-to-b from-[#15110b] to-[#0d0b08]">
      <header className="flex items-center justify-between gap-3 border-b border-[#c9a14a]/15 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#c9a14a]/40 bg-[#0d0b08] text-[16px]"
            style={{
              backgroundImage:
                'radial-gradient(circle, rgba(201,161,74,0.18) 0%, transparent 70%)',
            }}>
            <span style={{
              backgroundImage:
                'linear-gradient(100deg, #8b6914, #c9a14a 40%, #f3deaa 50%, #c9a14a 60%, #8b6914)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}>𓂀</span>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#c9a14a]/80">
              Your teacher for this lesson
            </p>
            <p className="mt-0.5 font-display text-[18px] font-semibold leading-tight text-[#f3deaa]">
              {teacher.name}
              <span className="ml-2 font-sans text-[12px] font-normal italic text-[#c9bf9d]/70">
                — {teacher.role}
              </span>
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={onResetChat}
            className="shrink-0 text-[11px] tracking-wide text-[#c9bf9d]/60 transition hover:text-[#f3deaa]"
          >
            ↻ reset
          </button>
        )}
      </header>

      <div
        ref={listRef}
        className="flex max-h-[480px] flex-col gap-3 overflow-y-auto px-5 py-5"
      >
        {messages.length === 0 && pending && (
          <ThinkingBubble teacher={teacher.name} />
        )}
        {messages.map((m, i) => (
          <Bubble key={i} msg={m} teacherName={teacher.name} />
        ))}
        {messages.length > 0 && pending && (
          <ThinkingBubble teacher={teacher.name} />
        )}
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-200">
            {error}
          </div>
        )}
      </div>

      <form
        onSubmit={onSend}
        className="flex items-end gap-2 border-t border-[#c9a14a]/15 bg-[#0d0b08]/60 px-3 py-3"
      >
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              onSend(e as unknown as React.FormEvent)
            }
          }}
          placeholder={`Talk to ${teacher.name}, or paste your practice…`}
          rows={1}
          className="min-h-[42px] max-h-[200px] flex-1 resize-none rounded-lg border border-[#c9a14a]/20 bg-[#15110b] px-3 py-2.5 text-[14px] leading-snug text-[#e8dcc4] placeholder:text-[#c9bf9d]/35 outline-none transition focus:border-[#c9a14a]/60"
        />
        <button
          type="submit"
          disabled={pending || draft.trim().length === 0}
          className="shrink-0 rounded-full bg-gradient-to-b from-[#e8c878] to-[#c9a14a] px-4 py-2.5 text-[12px] font-semibold tracking-wide text-[#1a1208] transition hover:from-[#f3deaa] hover:to-[#d4b25a] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Send
        </button>
      </form>

      {/* Practice nudge bar */}
      <div className="border-t border-[#c9a14a]/10 bg-[#0d0b08]/40 px-5 py-3">
        <button
          onClick={() => {
            const seed = `I want to do the practice: "${practice.title}". Walk me through it.`
            setDraft(seed)
          }}
          className="text-left text-[11px] leading-snug text-[#c9bf9d]/65 transition hover:text-[#f3deaa]"
        >
          ↳ tap to start the practice with {teacher.name}
        </button>
      </div>
    </section>
  )
}

function Bubble({
  msg,
  teacherName,
}: {
  msg: ChatMsg
  teacherName: string
}) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-[14px] leading-[1.55] ${
          isUser
            ? 'bg-gradient-to-b from-[#c9a14a] to-[#8b6914] text-[#1a1208]'
            : 'bg-[#1a1612] text-[#e8dcc4] ring-1 ring-[#c9a14a]/15'
        }`}
      >
        {!isUser && (
          <p className="mb-1 text-[10px] uppercase tracking-[0.22em] text-[#c9a14a]/70">
            {teacherName}
          </p>
        )}
        <div className="whitespace-pre-wrap">{msg.content}</div>
      </div>
    </div>
  )
}

function ThinkingBubble({ teacher }: { teacher: string }) {
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl bg-[#1a1612] px-4 py-2.5 ring-1 ring-[#c9a14a]/15">
        <p className="mb-1 text-[10px] uppercase tracking-[0.22em] text-[#c9a14a]/70">
          {teacher}
        </p>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#c9a14a]/70" style={{ animationDelay: '0ms' }} />
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#c9a14a]/70" style={{ animationDelay: '180ms' }} />
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#c9a14a]/70" style={{ animationDelay: '360ms' }} />
        </div>
      </div>
    </div>
  )
}
