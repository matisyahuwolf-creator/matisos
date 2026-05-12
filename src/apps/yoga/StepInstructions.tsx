import { useEffect, useState } from 'react'
import { catalog } from './catalog'
import { storage } from '../../lib/storage'

type Instructions = {
  steps: string[]
  feel?: string
  modify?: string
}

type State =
  | { kind: 'loading' }
  | { kind: 'ready'; data: Instructions }
  | { kind: 'error' }

function cacheKey(poseId: string) {
  return `yoga:instructions:${poseId}`
}

function loadCached(poseId: string): Instructions | null {
  const raw = storage.get(cacheKey(poseId))
  if (!raw) return null
  try {
    const data = JSON.parse(raw) as Instructions
    if (Array.isArray(data.steps) && data.steps.length > 0) return data
    return null
  } catch {
    return null
  }
}

function saveCached(poseId: string, data: Instructions) {
  storage.set(cacheKey(poseId), JSON.stringify(data))
}

export default function StepInstructions({ poseId }: { poseId: string }) {
  const [state, setState] = useState<State>(() => {
    const cached = loadCached(poseId)
    return cached ? { kind: 'ready', data: cached } : { kind: 'loading' }
  })
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let active = true
    const cached = loadCached(poseId)
    if (cached) {
      setState({ kind: 'ready', data: cached })
      return () => {
        active = false
      }
    }
    setState({ kind: 'loading' })
    const name = catalog.find((p) => p.id === poseId)?.name ?? poseId
    fetch('/api/pose-instructions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ poseName: name }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!active) return
        if (Array.isArray(data?.steps) && data.steps.length > 0) {
          const clean: Instructions = {
            steps: data.steps,
            feel: data.feel,
            modify: data.modify,
          }
          saveCached(poseId, clean)
          setState({ kind: 'ready', data: clean })
        } else {
          setState({ kind: 'error' })
        }
      })
      .catch(() => {
        if (active) setState({ kind: 'error' })
      })
    return () => {
      active = false
    }
  }, [poseId])

  if (state.kind === 'error') return null

  return (
    <div className="mt-3 w-full max-w-md">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-lg bg-white/10 px-3 py-2 text-[12px] font-bold uppercase tracking-[0.14em] text-white/85 backdrop-blur transition hover:bg-white/20"
      >
        <span>{open ? 'Hide steps' : 'How to do this'}</span>
        <span className="text-[14px]">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="mt-2 rounded-lg bg-white/95 px-4 py-3 text-left text-slate-900">
          {state.kind === 'loading' ? (
            <p className="text-[12px] text-slate-500">Loading…</p>
          ) : (
            <>
              <ol className="flex flex-col gap-1.5">
                {state.data.steps.map((s, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-[12px] leading-relaxed text-slate-700"
                  >
                    <span className="shrink-0 font-bold text-violet-600">
                      {i + 1}.
                    </span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
              {state.data.feel && (
                <p className="mt-2.5 rounded bg-emerald-50 px-2 py-1.5 text-[11px] italic leading-relaxed text-emerald-800">
                  <span className="font-semibold">Feel — </span>
                  {state.data.feel}
                </p>
              )}
              {state.data.modify && (
                <p className="mt-1.5 rounded bg-amber-50 px-2 py-1.5 text-[11px] italic leading-relaxed text-amber-800">
                  <span className="font-semibold">Modify — </span>
                  {state.data.modify}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
