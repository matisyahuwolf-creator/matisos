import { Link } from 'react-router-dom'
import { apps, type AppEntry } from '../apps'

// Painted workshop scene fills the entire viewport. Click hotspots are
// positioned as percentages over the painted hanging signs. To get
// painted quality we use the painted image — pure CSS can't match it.
//
// Tradeoffs:
// - Date plaque, weather, suggestions, and search are painted, not live.
// - Only the 7 apps in the painted backdrop have hotspots.
// - On non-4:3 viewports the image stretches to fill — slight aspect
//   distortion in exchange for no black bars.

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
    'hover:bg-amber-200/[0.08] ' +
    'hover:shadow-[0_0_50px_10px_rgba(201,161,74,0.3)] ' +
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
    <div className="fixed inset-0 overflow-hidden bg-[#0d0805]">
      <img
        src="/workshop-backdrop.png"
        alt="matisOS — the workshop"
        draggable={false}
        className="absolute inset-0 h-full w-full select-none"
        style={{ objectFit: 'fill' }}
      />
      {liveApps.map((app) => {
        const zone = TILE_ZONES[zoneKey(app)]
        if (!zone) return null
        return <ToolZone key={app.name} app={app} zone={zone} />
      })}
    </div>
  )
}
