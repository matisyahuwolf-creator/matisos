import { useEffect, useState } from 'react'
import { storage } from '../../lib/storage'

const KEY = 'scratch:text'

export default function Scratch() {
  const [text, setText] = useState(() => storage.get(KEY) ?? '')
  const [savedAt, setSavedAt] = useState<Date | null>(null)

  useEffect(() => {
    const id = setTimeout(() => {
      storage.set(KEY, text)
      setSavedAt(new Date())
    }, 300)
    return () => clearTimeout(id)
  }, [text])

  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Start typing — anything you write saves automatically."
        className="min-h-[50vh] w-full resize-none bg-transparent text-[15px] leading-relaxed outline-none placeholder:text-slate-400"
      />
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>{text.length} characters</span>
        <span>
          {savedAt
            ? `Saved · ${savedAt.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}`
            : 'Not saved yet'}
        </span>
      </div>
    </div>
  )
}
