import { useState } from 'react'

export default function AIDiagram({
  poseName,
  imageUrl,
  onGenerated,
}: {
  poseName: string
  imageUrl: string | undefined
  onGenerated: (dataUrl: string) => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function generate() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/generate-pose-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poseName }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.dataUrl) {
        throw new Error(data.error ?? `Request failed (${res.status})`)
      }
      onGenerated(data.dataUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  if (imageUrl) {
    return (
      <div className="flex flex-col gap-2">
        <img
          src={imageUrl}
          alt={`AI diagram of ${poseName}`}
          className="w-full rounded-lg bg-white object-contain ring-1 ring-slate-200"
        />
        <button
          onClick={generate}
          disabled={loading}
          className="self-start text-[12px] font-medium text-slate-500 transition hover:text-slate-700 disabled:opacity-50"
        >
          {loading ? 'Regenerating…' : '↻ Regenerate diagram'}
        </button>
        {error && <p className="text-[12px] text-red-600">{error}</p>}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={generate}
        disabled={loading}
        className="self-start rounded-lg bg-slate-900 px-3 py-2 text-[13px] font-medium text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:bg-slate-400"
      >
        {loading ? 'Generating diagram (10–20s)…' : '✨ Generate AI diagram'}
      </button>
      {error && <p className="text-[12px] text-red-600">{error}</p>}
    </div>
  )
}
