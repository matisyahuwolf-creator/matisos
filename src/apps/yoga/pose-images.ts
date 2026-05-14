import { catalog } from './catalog'
import type { Modality } from './modalities'

const STYLE_BY_MODALITY: Record<Modality, string> = {
  yoga: 'minimalist black ink line drawing of a person performing the yoga pose, anatomically correct, simple sketch style, white background, instructional illustration, single figure centered, no text',
  dance: 'minimalist black ink line drawing of a person dancing, expressive movement captured mid-motion, simple sketch style, white background, single figure centered, no text',
  'martial-arts': 'minimalist black ink line drawing of a person performing a kung fu technique, anatomically correct, dynamic stance or strike, simple sketch style, white background, single figure centered, no text',
  strength: 'minimalist black ink line drawing of a person performing the bodyweight exercise, anatomically correct, simple sketch style, white background, single figure centered, no text',
  breath: 'minimalist black ink line drawing of a person seated cross-legged and breathing, calm, simple sketch style, white background, single figure centered, no text',
  meditation: 'minimalist black ink line drawing of a person sitting in meditation, calm, simple sketch style, white background, single figure centered, no text',
}

export function poseImageUrl(poseId: string, size = 400): string {
  const entry = catalog.find((p) => p.id === poseId)
  const name = entry?.name ?? poseId
  const style = STYLE_BY_MODALITY[entry?.modality ?? 'yoga']
  const prompt = `${style}, pose: ${name}`
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${size}&height=${size}&nologo=true&seed=${encodeURIComponent(poseId)}`
}
