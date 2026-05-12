import { useEffect, useRef, useState } from 'react'
import { storage } from '../../lib/storage'

type ChatMsg = { role: 'user' | 'assistant'; content: string }

const STORAGE_KEY = 'yoga:chat-history'
const MAX_HISTORY = 50

function loadChat(): ChatMsg[] {
  const raw = storage.get(STORAGE_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as ChatMsg[]
  } catch {
    return []
  }
}

function saveChat(msgs: ChatMsg[]) {
  storage.set(STORAGE_KEY, JSON.stringify(msgs.slice(-MAX_HISTORY)))
}

export default function FloatingChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMsg[]>(() => loadChat())
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading, open])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    const next = [...messages, { role: 'user' as const, content: text }]
    setMessages(next)
    setInput('')
    setLoading(true)
    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.slice(-12), // last 12 turns for context
        }),
      })
      const data = await r.json().catch(() => ({}))
      const reply: string =
        typeof data.reply === 'string'
          ? data.reply
          : data.error
            ? `(${data.error})`
            : 'Hmm. Try again in a moment.'
      const withReply: ChatMsg[] = [
        ...next,
        { role: 'assistant', content: reply },
      ]
      setMessages(withReply)
      saveChat(withReply)
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Connection failed'
      setMessages([
        ...next,
        { role: 'assistant', content: `(${errMsg})` },
      ])
    } finally {
      setLoading(false)
    }
  }

  function clearChat() {
    if (!confirm('Clear the conversation?')) return
    setMessages([])
    saveChat([])
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="psychedelic-shimmer fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-600 to-rose-500 text-2xl text-white shadow-xl ring-1 ring-white/30 press hover:scale-105 active:scale-95"
        aria-label={open ? 'Close coach chat' : 'Open coach chat'}
        title={open ? 'Close coach' : 'Talk to your coach'}
      >
        {open ? '×' : '🌀'}
      </button>

      {open && (
        <div className="fixed inset-x-0 bottom-0 z-50 flex max-h-[80vh] flex-col rounded-t-3xl bg-white shadow-2xl ring-1 ring-black/10 sm:right-5 sm:left-auto sm:bottom-24 sm:max-w-md sm:rounded-3xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-600 to-rose-500 text-lg text-white">
                🌀
              </div>
              <div>
                <p className="text-[14px] font-semibold text-slate-900">
                  Coach
                </p>
                <p className="text-[11px] text-slate-500">
                  Talk freely. Trauma-informed.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="text-[11px] font-medium text-slate-500 hover:text-slate-700"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                ×
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3">
            {messages.length === 0 && !loading && (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                <p className="text-3xl">🌀</p>
                <p className="font-display text-[18px] italic text-slate-700">
                  How can I help?
                </p>
                <p className="max-w-xs text-[12px] text-slate-500">
                  Ask anything. About a pose, about how you're feeling, about how to start.
                </p>
              </div>
            )}
            <div className="flex flex-col gap-2">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-[14px] leading-relaxed ${
                    m.role === 'user'
                      ? 'self-end rounded-br-md bg-[#0071e3] text-white'
                      : 'self-start rounded-bl-md bg-slate-100 text-slate-900'
                  }`}
                >
                  {m.content}
                </div>
              ))}
              {loading && (
                <div className="self-start flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-slate-100 px-3.5 py-2.5">
                  <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:0ms]" />
                  <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:150ms]" />
                  <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:300ms]" />
                </div>
              )}
              <div ref={endRef} />
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              send()
            }}
            className="border-t border-slate-100 p-3"
          >
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Say anything…"
                disabled={loading}
                className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-[14px] outline-none transition focus:border-[#0071e3] disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="rounded-full bg-[#0071e3] px-4 py-2 text-[14px] font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
