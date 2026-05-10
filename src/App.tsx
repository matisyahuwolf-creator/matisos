import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Launcher from './shell/Launcher'
import AppShell from './shell/AppShell'
import { apps } from './apps'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Launcher />} />
        {apps.map((app) => {
          if (app.kind !== 'internal') return null
          const Inner = app.component
          return (
            <Route
              key={app.slug}
              path={`/apps/${app.slug}`}
              element={
                <AppShell app={app}>
                  <Inner />
                </AppShell>
              }
            />
          )
        })}
      </Routes>
    </BrowserRouter>
  )
}
