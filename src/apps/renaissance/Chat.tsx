import { useEffect, useRef, useState } from 'react'
import type { Figure } from './figures'

type Message = { role: 'user' | 'assistant'; content: string }

export default function Chat({
  figure,
  onBack,
}: {
  figure: Figure
  onBack: () => void
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, streaming])

  async function send() {
    const text = draft.trim()
    if (!text || streaming) return

    const nextMessages: Message[] = [
      ...messages,
      { role: 'user', content: text },
    ]
    setMessages(nextMessages)
    setDraft('')
    setStreaming(true)
    setError(null)

    setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

    try {
      const response = await fetch('/api/renaissance-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          figureId: figure.id,
          messages: nextMessages,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data?.error || `Request failed (${response.status})`)
      }

      if (!response.body) throw new Error('No response stream')
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let assembled = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        assembled += chunk
        setMessages((prev) => {
          const copy = prev.slice()
          copy[copy.length - 1] = { role: 'assistant', content: assembled }
          return copy
        })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setError(msg)
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setStreaming(false)
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="flex h-[70vh] flex-col gap-3">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="press flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 active:opacity-60"
          aria-label="Back to roster"
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13L5 8l5-5" />
          </svg>
        </button>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${figure.gradient} font-display text-xl text-white shadow-sm`}
          aria-hidden
        >
          {figure.icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold text-slate-900">
            {figure.name}
          </p>
          <p className="truncate text-[11px] uppercase tracking-wider text-slate-500">
            {figure.lifespan} · {figure.era}
          </p>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto rounded-xl bg-slate-50 p-4"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-slate-500">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${figure.gradient} font-display text-2xl text-white shadow-sm`}
              aria-hidden
            >
              {figure.icon}
            </div>
            <p className="font-display text-[16px] italic leading-snug text-slate-600">
              {figure.blurb}
            </p>
            <p className="text-[11px] uppercase tracking-wider text-slate-400">
              Speak. They are listening.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {messages.map((m, i) => (
              <li
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={
                    m.role === 'user'
                      ? 'max-w-[85%] rounded-2xl rounded-br-md bg-[#0a0a0a] px-3 py-2 text-[14px] leading-relaxed text-white'
                      : 'max-w-[85%] rounded-2xl rounded-bl-md bg-white px-3 py-2 text-[14px] leading-relaxed text-slate-900 shadow-sm ring-1 ring-black/5'
                  }
                >
                  {m.content || (streaming && i === messages.length - 1 ? (
                    <span className="inline-flex gap-1 text-slate-400">
                      <span className="animate-pulse">·</span>
                      <span className="animate-pulse [animation-delay:120ms]">·</span>
                      <span className="animate-pulse [animation-delay:240ms]">·</span>
                    </span>
                  ) : null)}
                  {m.content && m.role === 'assistant' && (
                    <FigureText text={m.content} />
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-[12px] text-rose-700">
          {error}
        </p>
      )}

      <div className="flex items-end gap-2 rounded-xl bg-white p-2 ring-1 ring-black/5">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={`Ask ${figure.name.split(' ')[0]}…`}
          rows={1}
          className="min-h-[36px] flex-1 resize-none bg-transparent px-2 py-1 text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none"
          disabled={streaming}
        />
        <button
          onClick={send}
          disabled={!draft.trim() || streaming}
          className="press shrink-0 rounded-lg bg-[#0a0a0a] px-3 py-2 text-[13px] font-medium text-white transition hover:bg-[#1a1a1a] disabled:opacity-30"
        >
          {streaming ? '…' : 'Send'}
        </button>
      </div>
    </div>
  )
}

function FigureText({ text }: { text: string }) {
  const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim().length > 0)
  if (paragraphs.length <= 1) return <>{text}</>
  return (
    <>
      {paragraphs.map((p, i) => (
        <p key={i} className={i > 0 ? 'mt-2' : ''}>
          {p}
        </p>
      ))}
    </>
  )
}
