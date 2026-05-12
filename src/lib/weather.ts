export type Weather = {
  tempF: number
  condition: string
  emoji: string
  isDay: boolean
  fetchedAt: number
}

export type Location = {
  lat: number
  lon: number
  city?: string
  fetchedAt: number
}

const WEATHER_CACHE_KEY = 'matisos:weather'
const LOCATION_CACHE_KEY = 'matisos:location'
const CACHE_MS = 60 * 60 * 1000 // 1 hour

// Open-Meteo WMO Weather codes → readable
function decodeWeather(code: number, isDay: boolean): { condition: string; emoji: string } {
  if (code === 0) return { condition: 'Clear', emoji: isDay ? '☀️' : '🌙' }
  if (code === 1) return { condition: 'Mostly clear', emoji: isDay ? '🌤️' : '🌙' }
  if (code === 2) return { condition: 'Partly cloudy', emoji: '⛅' }
  if (code === 3) return { condition: 'Overcast', emoji: '☁️' }
  if (code === 45 || code === 48) return { condition: 'Foggy', emoji: '🌫️' }
  if (code >= 51 && code <= 57) return { condition: 'Drizzle', emoji: '🌦️' }
  if (code >= 61 && code <= 67) return { condition: 'Rain', emoji: '🌧️' }
  if (code >= 71 && code <= 77) return { condition: 'Snow', emoji: '❄️' }
  if (code >= 80 && code <= 82) return { condition: 'Showers', emoji: '🌧️' }
  if (code >= 95 && code <= 99) return { condition: 'Thunderstorms', emoji: '⛈️' }
  return { condition: 'Unknown', emoji: '🌡️' }
}

export function loadCachedLocation(): Location | null {
  try {
    const raw = localStorage.getItem(LOCATION_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Location
    return parsed
  } catch {
    return null
  }
}

export function loadCachedWeather(): Weather | null {
  try {
    const raw = localStorage.getItem(WEATHER_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Weather
    if (Date.now() - parsed.fetchedAt > CACHE_MS) return null
    return parsed
  } catch {
    return null
  }
}

export async function getLocation(): Promise<Location> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lon = pos.coords.longitude
        let city: string | undefined
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=12`,
            { headers: { 'Accept-Language': 'en' } },
          )
          if (r.ok) {
            const data = await r.json()
            city =
              data?.address?.city ??
              data?.address?.town ??
              data?.address?.village ??
              data?.address?.county ??
              data?.address?.state ??
              undefined
          }
        } catch {
          // ignored
        }
        const loc: Location = { lat, lon, city, fetchedAt: Date.now() }
        try {
          localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(loc))
        } catch {}
        resolve(loc)
      },
      (err) => reject(err),
      { timeout: 10_000, maximumAge: 60_000 },
    )
  })
}

export async function fetchWeather(loc: Location): Promise<Weather> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,weather_code,is_day&temperature_unit=fahrenheit`
  const r = await fetch(url)
  if (!r.ok) throw new Error(`Weather API ${r.status}`)
  const data = await r.json()
  const code = data?.current?.weather_code ?? 0
  const isDay = data?.current?.is_day === 1
  const decoded = decodeWeather(code, isDay)
  const w: Weather = {
    tempF: Math.round(data?.current?.temperature_2m ?? 0),
    condition: decoded.condition,
    emoji: decoded.emoji,
    isDay,
    fetchedAt: Date.now(),
  }
  try {
    localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(w))
  } catch {}
  return w
}
