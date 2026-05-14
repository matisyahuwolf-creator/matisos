import { Link } from 'react-router-dom'
import { apps, type AppEntry } from '../apps'

// Backdrop is a painted scene (public/workshop-backdrop.png, 1448x1086).
// Each painted sign on the pegboard is a clickable hotspot positioned
// as a percentage of the backdrop. Re-measure these if the backdrop changes.
const ASPECT = 1448 / 1086

type Zone = { top: string; left: string; width: string; height: string }

const TILE_ZONES: Record<string, Zone> = {
  pardes:       { top: '23%', left: '16%', width: '17%', height: '30%' },
  yoga:         { top: '23%', left: '35%', width: '17%', height: '30%' },
  initiation:   { top: '23%', left: '53%', width: '17%', height: '30%' },
  hyrogliphics: { top: '23%', left: '71%', width: '17%', height: '30%' },
  susquehanna:  { top: '54%', left: '19%', width: '19%', height: '24%' },
  scratch:      { top: '54%', left: '42%', width: '16%', height: '24%' },
  source:       { top: '54%', left: '61%', width: '18%', height: '24%' },
}

function zoneKey(app: AppEntry): string {
  return 'slug' in app ? app.slug : app.name.toLowerCase()
}

function ToolZone({ app, zone }: { app: AppEntry; zone: Zone }) {
  const className =
    'absolute rounded-md cursor-pointer transition-all duration-200 ' +
    'hover:bg-amber-200/[0.07] ' +
    'hover:shadow-[0_0_40px_8px_rgba(201,161,74,0.25)] ' +
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300'

  if (app.kind === 'external') {
    return (
      <a
        href={app.url}
        target="_blank"
        rel="noreferrer"
        aria-label={app.name}
        title={app.name}
        className={className}
        style={zone}
      />
    )
  }
  return (
    <Link
      to={`/apps/${app.slug}`}
      aria-label={app.name}
      title={app.name}
      className={className}
      style={zone}
    />
  )
}

export default function Launcher() {
  const liveApps = apps.filter((a) => a.status === 'live')

  return (
    <div className="fixed inset-0 grid place-items-center overflow-auto bg-[#0d0805]">
      <div
        className="relative"
        style={{
          width: `min(100vw, calc(100vh * ${ASPECT}))`,
          aspectRatio: String(ASPECT),
        }}
      >
        <img
          src="/workshop-backdrop.png"
          alt="matisOS — the workshop"
          className="absolute inset-0 h-full w-full select-none"
          draggable={false}
        />
        {liveApps.map((app) => {
          const zone = TILE_ZONES[zoneKey(app)]
          if (!zone) return null
          return <ToolZone key={app.name} app={app} zone={zone} />
        })}
      </div>
    </div>
  )
}
