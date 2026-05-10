export type PoseInfo = {
  title: string
  extract: string
  thumbnail: string | null
  url: string
}

const cache = new Map<string, PoseInfo | null>()

async function tryFetch(title: string): Promise<PoseInfo | null> {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) return null
  const data = await res.json()
  if (data.type === 'disambiguation') return null
  if (!data.extract) return null
  return {
    title: data.title ?? title,
    extract: data.extract,
    thumbnail: data.thumbnail?.source ?? null,
    url: data.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
  }
}

export async function fetchPoseInfo(name: string): Promise<PoseInfo | null> {
  const key = name.trim().toLowerCase()
  if (cache.has(key)) return cache.get(key)!

  const candidates = [name, `${name} (yoga)`, `${name} pose`]
  for (const candidate of candidates) {
    const result = await tryFetch(candidate)
    if (result) {
      cache.set(key, result)
      return result
    }
  }
  cache.set(key, null)
  return null
}
