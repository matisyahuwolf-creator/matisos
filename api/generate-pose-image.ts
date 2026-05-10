import OpenAI from 'openai'

const client = new OpenAI()

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let poseName: string | undefined
  try {
    const body = await req.json()
    poseName = typeof body?.poseName === 'string' ? body.poseName.trim() : ''
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!poseName) {
    return Response.json({ error: 'poseName is required' }, { status: 400 })
  }

  const prompt = `A clean minimalist black-ink line drawing illustration of a single person performing the yoga pose "${poseName}". Pure white background. Three-quarter or side view. Simple instructional textbook diagram style — only black line strokes, no shading, no color, no gradients. Anatomically correct posture with proper alignment. Whole body visible, figure centered with generous whitespace around it. No text, no labels, no decorative elements.`

  try {
    const result = await client.images.generate({
      model: 'gpt-image-1',
      prompt,
      size: '1024x1024',
      quality: 'low',
      n: 1,
    })

    const b64 = result.data?.[0]?.b64_json
    if (!b64) {
      return Response.json(
        { error: 'No image returned from model' },
        { status: 502 },
      )
    }

    return Response.json({ dataUrl: `data:image/png;base64,${b64}` })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Image generation failed'
    return Response.json({ error: message }, { status: 500 })
  }
}
