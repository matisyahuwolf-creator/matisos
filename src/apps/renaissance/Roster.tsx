import type { Figure } from './figures'
import { FIGURES } from './figures'

export default function Roster({
  onSelect,
}: {
  onSelect: (figure: Figure) => void
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
          AI-native education
        </p>
        <h2 className="mt-2 font-display text-[28px] font-medium leading-tight tracking-tight text-slate-900">
          Chat with history.
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-slate-600">
          Eight figures, each grounded in their own writings and the world they
          actually lived in. They do not know what came after their death. They
          will not pretend to.
        </p>
      </div>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {FIGURES.map((figure) => (
          <li key={figure.id}>
            <button
              type="button"
              onClick={() => onSelect(figure)}
              className="press group flex w-full items-start gap-3 rounded-2xl border border-slate-100 bg-white p-3 text-left transition hover:border-slate-200 hover:shadow-md active:opacity-70"
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${figure.gradient} font-display text-xl text-white shadow-sm`}
                aria-hidden
              >
                {figure.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold text-slate-900">
                  {figure.name}
                </p>
                <p className="truncate text-[11px] uppercase tracking-wider text-slate-500">
                  {figure.lifespan}
                </p>
                <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-slate-600">
                  {figure.blurb}
                </p>
              </div>
            </button>
          </li>
        ))}
      </ul>

      <p className="rounded-xl bg-slate-50 px-4 py-3 text-[12px] leading-relaxed text-slate-600">
        Each conversation is grounded by a system prompt that fixes the figure’s
        voice, era, and knowledge boundary. Powered by Claude Sonnet 4.6 with
        prompt caching so long conversations stay cheap.
      </p>
    </div>
  )
}
