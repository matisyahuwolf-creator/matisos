import { useEffect, useState } from 'react'
import { fetchPoseInfo, type PoseInfo as Info } from './wiki'

type State =
  | { kind: 'loading' }
  | { kind: 'found'; info: Info }
  | { kind: 'missing' }

export default function PoseInfo({ name }: { name: string }) {
  const [state, setState] = useState<State>({ kind: 'loading' })

  useEffect(() => {
    let active = true
    setState({ kind: 'loading' })
    fetchPoseInfo(name).then((info) => {
      if (!active) return
      setState(info ? { kind: 'found', info } : { kind: 'missing' })
    })
    return () => {
      active = false
    }
  }, [name])

  if (state.kind === 'loading') {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-3 text-[13px] text-slate-500">
        <span className="inline-block h-3 w-3 animate-pulse rounded-full bg-slate-300" />
        Looking up "{name}"…
      </div>
    )
  }

  if (state.kind === 'missing') {
    const ytSearch = `https://www.youtube.com/results?search_query=${encodeURIComponent(
      name + ' yoga tutorial',
    )}`
    return (
      <div className="rounded-lg bg-slate-50 px-3 py-3 text-[13px] text-slate-600">
        No Wikipedia entry found for "{name}".{' '}
        <a
          href={ytSearch}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-[#0071e3] hover:underline"
        >
          Watch on YouTube →
        </a>
      </div>
    )
  }

  const { info } = state
  return (
    <a
      href={info.url}
      target="_blank"
      rel="noreferrer"
      className="flex gap-3 rounded-lg bg-slate-50 p-3 transition hover:bg-slate-100"
    >
      {info.thumbnail ? (
        <img
          src={info.thumbnail}
          alt={info.title}
          loading="lazy"
          className="h-24 w-24 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-3xl">
          🧘
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-semibold text-slate-900">{info.title}</p>
        <p className="mt-1 line-clamp-4 text-[12px] leading-snug text-slate-600">
          {info.extract}
        </p>
        <p className="mt-1 text-[11px] font-medium text-[#0071e3]">
          Read on Wikipedia →
        </p>
      </div>
    </a>
  )
}
