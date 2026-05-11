import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    res.status(500).json({
      error:
        'OPENAI_API_KEY env var is missing. Add it in Vercel → Settings → Environment Variables to use AI image generation.',
    })
    return
  }

  const poseName: string | undefined =
    typeof req.body?.poseName === 'string'
      ? req.body.poseName.trim()
      : undefined

  if (!poseName) {
    res.status(400).json({ error: 'poseName is required' })
    return
  }

  const prompt = `A clean minimalist black-ink line drawing illustration of a single person performing the yoga pose "${poseName}". Pure white background. Three-quarter or side view. Simple instructional textbook diagram style — only black line strokes, no shading, no color, no gradients. Anatomically correct posture with proper alignment. Whole body visible, figure centered with generous whitespace around it. No text, no labels, no decorative elements.`

  try {
    const apiRes = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt,
        size: '1024x1024',
        quality: 'low',
        n: 1,
      }),
    })

    if (!apiRes.ok) {
      const errText = await apiRes.text()
      res.status(apiRes.status).json({
        error: `OpenAI API ${apiRes.status}: ${errText.slice(0, 300)}`,
      })
      return
    }

    const data = await apiRes.json()
    const b64: string | undefined = data?.data?.[0]?.b64_json
    if (!b64) {
      res.status(502).json({ error: 'No image returned from model' })
      return
    }

    res.status(200).json({ dataUrl: `data:image/png;base64,${b64}` })
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Image generation failed'
    res.status(500).json({ error: errMsg })
  }
}
