import { useState } from 'react'
import Roster from './Roster'
import Chat from './Chat'
import type { Figure } from './figures'

export default function Renaissance() {
  const [active, setActive] = useState<Figure | null>(null)

  if (active) {
    return <Chat figure={active} onBack={() => setActive(null)} />
  }
  return <Roster onSelect={setActive} />
}
