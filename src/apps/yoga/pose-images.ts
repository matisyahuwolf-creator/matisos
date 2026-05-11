import { catalog } from './catalog'

const STYLE =
  'minimalist black ink line drawing of a person performing the yoga pose, anatomically correct, simple sketch style, white background, instructional illustration, single figure centered, no text'

export function poseImageUrl(poseId: string, size = 400): string {
  const name = catalog.find((p) => p.id === poseId)?.name ?? poseId
  const prompt = `${STYLE}, pose: ${name}`
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${size}&height=${size}&nologo=true&seed=${encodeURIComponent(poseId)}`
}
