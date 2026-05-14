import { useEffect, useRef, useState } from 'react'

type Msg = { role: 'user' | 'assistant'; content: string }

const STARTERS = [
  'What does Susquehanna actually do?',
  'Show me a demo of a restaurant chatbot.',
  'Tell me about the free pilot.',
]

const WELCOME: Msg = {
  role: 'assistant',
  content:
    "Hi — I'm Susquehanna's assistant. I can answer questions about what we build, or **act as a live demo** of the kind of chatbot we'd put on your restaurant's site. What would you like to start with?",
}

type Props = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  initialPrompt?: string | null
  onPromptConsumed?: () => void
}

export default function ChatWidget({
  open: controlledOpen,
  onOpenChange,
  initialPrompt,
  onPromptConsumed,
}: Props = {}) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next)
    onOpenChange?.(next)
  }

  const [messages, setMessages] = useState<Msg[]>([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesRef = useRef(messages)
  const loadingRef = useRef(loading)
  useEffect(() => {
    messagesRef.current = messages
  }, [messages])
  useEffect(() => {
    loadingRef.current = loading
  }, [loading])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading, open])

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 200)
      return () => clearTimeout(t)
    }
  }, [open])

  // Auto-send an externally provided prompt when the widget opens (e.g. hero "Try a demo" CTA)
  useEffect(() => {
    if (open && initialPrompt && !loadingRef.current) {
      const text = initialPrompt
      // small delay so the panel renders before the message appears
      const t = setTimeout(() => {
        send(text)
        onPromptConsumed?.()
      }, 250)
      return () => clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialPrompt])

  async function send(text: string) {
    const content = text.trim()
    if (!content || loadingRef.current) return
    setError(null)
    const next: Msg[] = [...messagesRef.current, { role: 'user', content }]
    setMessages(next)
    setInput('')
    setLoading(true)
    try {
      // strip the WELCOME message — server doesn't need it
      const history = next.filter((m, i) => !(m.role === 'assistant' && i === 0 && m === WELCOME))
      const r = await fetch('/api/susquehanna-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      })
      const raw = await r.text()
      if (!r.ok) {
        let serverMsg = `HTTP ${r.status}`
        try {
          const parsed = JSON.parse(raw)
          if (parsed?.error) serverMsg = parsed.error
        } catch {
          if (raw) serverMsg = `${serverMsg}: ${raw.slice(0, 120)}`
        }
        console.error('[susquehanna-chat]', r.status, raw)
        throw new Error(serverMsg)
      }
      if (!raw) {
        console.error('[susquehanna-chat] empty body, status', r.status)
        throw new Error('Empty response from server')
      }
      let data: { reply?: string }
      try {
        data = JSON.parse(raw)
      } catch {
        console.error('[susquehanna-chat] non-JSON response:', raw.slice(0, 300))
        throw new Error('Server returned non-JSON response')
      }
      if (!data.reply) throw new Error('No reply field in server response')
      setMessages([...next, { role: 'assistant', content: data.reply }])
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.'
      setError(msg)
      setMessages([
        ...next,
        {
          role: 'assistant',
          content:
            "Sorry — I couldn't reach my brain just now. Try again in a moment, or email hello@susquehanna.ai directly.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    send(input)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  return (
    <>
      {/* Floating launcher button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close chat' : 'Open chat with Susquehanna'}
        className="fixed bottom-5 right-5 z-[55] flex h-14 w-14 items-center justify-center rounded-full text-[#f5efe1] shadow-[0_14px_32px_-10px_rgba(46,82,94,0.6)] transition hover:scale-[1.04] active:scale-[0.98]"
        style={{ background: 'linear-gradient(160deg, #3b6877 0%, #2e525e 60%, #5f7549 100%)' }}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 right-5 z-[55] flex w-[min(380px,calc(100vw-2.5rem))] max-w-[380px] flex-col overflow-hidden rounded-2xl border border-[#cdbf9f] bg-[#fffaee] shadow-[0_30px_60px_-20px_rgba(46,82,94,0.45)]"
          style={{ height: 'min(560px, calc(100vh - 10rem))' }}
        >
          {/* Header */}
          <div className="relative overflow-hidden border-b border-[#cdbf9f]/60 px-5 py-4" style={{ background: 'linear-gradient(135deg, #1b2f37 0%, #2e525e 100%)' }}>
            <svg viewBox="0 0 400 60" className="pointer-events-none absolute inset-0 h-full w-full opacity-30" preserveAspectRatio="none" aria-hidden>
              <path d="M0 20 Q100 5 200 18 T400 14" fill="none" stroke="#8aaab5" strokeWidth="1" />
              <path d="M0 35 Q100 22 200 33 T400 30" fill="none" stroke="#a8b888" strokeWidth="1" opacity="0.7" />
              <path d="M0 50 Q100 38 200 48 T400 44" fill="none" stroke="#8aaab5" strokeWidth="1" opacity="0.5" />
            </svg>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5efe1]/15 ring-1 ring-[#f5efe1]/25">
                  <svg viewBox="0 0 40 40" className="h-5 w-5" aria-hidden>
                    <path d="M3 22 Q10 14 18 20 T36 18" fill="none" stroke="#cddbe0" strokeWidth="2.4" strokeLinecap="round" />
                    <path d="M3 28 Q11 22 19 26 T36 24" fill="none" stroke="#a8b888" strokeWidth="2.4" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <div
                    className="text-[15px] font-medium text-[#f5efe1]"
                    style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                  >
                    Susquehanna
                  </div>
                  <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.18em] text-[#cddbe0]/80">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#a8b888]" />
                    Live demo
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-full p-1 text-[#cddbe0]/80 transition hover:bg-[#f5efe1]/10 hover:text-[#f5efe1]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
            <div className="flex flex-col gap-3">
              {messages.map((m, i) => (
                <MessageBubble key={i} msg={m} />
              ))}
              {loading && <ThinkingBubble />}
            </div>

            {/* Starter chips, only on first turn */}
            {messages.length === 1 && !loading && (
              <div className="mt-5 flex flex-col gap-2">
                <div className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-[#75694d]">
                  Try asking
                </div>
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-xl border border-[#cdbf9f] bg-[#f5efe1] px-3 py-2 text-left text-[13px] text-[#221d16] transition hover:border-[#4a7c8c] hover:bg-[#f0e9d8]"
                    style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Error banner */}
          {error && (
            <div className="border-t border-[#cdbf9f]/60 bg-[#fce8d8] px-4 py-2 text-[12px] text-[#a16a35]">
              {error}
            </div>
          )}

          {/* Input */}
          <form onSubmit={onSubmit} className="border-t border-[#cdbf9f]/60 bg-[#f5efe1] p-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Ask anything, or say 'demo'…"
                rows={1}
                className="max-h-32 flex-1 resize-none rounded-xl border border-[#cdbf9f] bg-[#fffaee] px-3 py-2 text-[14px] text-[#221d16] placeholder-[#75694d] transition focus:border-[#4a7c8c] focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#f5efe1] transition disabled:cursor-not-allowed disabled:opacity-50"
                style={{ background: 'linear-gradient(180deg, #3b6877, #2e525e)' }}
                aria-label="Send"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
            <p className="mt-2 px-1 text-[10.5px] text-[#75694d]">
              Powered by Susquehanna. Replies are AI-generated.
            </p>
          </form>
        </div>
      )}
    </>
  )
}

function MessageBubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed ${
          isUser
            ? 'rounded-br-md bg-[#3b6877] text-[#f5efe1]'
            : 'rounded-bl-md border border-[#cdbf9f]/60 bg-[#f5efe1] text-[#221d16]'
        }`}
      >
        {renderRichText(msg.content)}
      </div>
    </div>
  )
}

function ThinkingBubble() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-[#cdbf9f]/60 bg-[#f5efe1] px-3.5 py-3">
        <Dot delay={0} />
        <Dot delay={150} />
        <Dot delay={300} />
      </div>
    </div>
  )
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 rounded-full bg-[#4a7c8c]"
      style={{
        animation: 'susq-bounce 1.2s ease-in-out infinite',
        animationDelay: `${delay}ms`,
      }}
    />
  )
}

// minimal bold rendering — supports **bold** inline so the LLM's emphasis lands
function renderRichText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return <span key={i}>{part}</span>
  })
}
