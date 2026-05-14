import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'
import { findFigure } from '../src/apps/renaissance/figures'

export const maxDuration = 60
export const config = { maxDuration: 60 }

type ChatMsg = { role: 'user' | 'assistant'; content: string }

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'ANTHROPIC_API_KEY env var is missing.' })
    return
  }

  const figureId: string | undefined = req.body?.figureId
  if (!figureId || typeof figureId !== 'string') {
    res.status(400).json({ error: 'figureId required' })
    return
  }

  const figure = findFigure(figureId)
  if (!figure) {
    res.status(404).json({ error: `Unknown figureId: ${figureId}` })
    return
  }

  const rawMessages: unknown = req.body?.messages
  const messages: ChatMsg[] = Array.isArray(rawMessages)
    ? rawMessages.filter(
        (m): m is ChatMsg =>
          !!m &&
          typeof m === 'object' &&
          ((m as ChatMsg).role === 'user' ||
            (m as ChatMsg).role === 'assistant') &&
          typeof (m as ChatMsg).content === 'string' &&
          (m as ChatMsg).content.length > 0 &&
          (m as ChatMsg).content.length < 8000,
      )
    : []

  if (messages.length === 0) {
    res.status(400).json({ error: 'messages must include at least one user turn' })
    return
  }
  if (messages[0].role !== 'user') {
    res.status(400).json({ error: 'first message must be a user turn' })
    return
  }

  const trimmed = messages.slice(-20)

  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders?.()

  const client = new Anthropic({ apiKey })

  try {
    const stream = client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: [
        {
          type: 'text',
          text: figure.systemPrompt,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: trimmed,
    })

    stream.on('text', (delta) => {
      res.write(delta)
    })

    await stream.finalMessage()
    res.end()
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    if (!res.headersSent) {
      res.status(500).json({ error: msg })
    } else {
      res.write(`\n\n[error: ${msg}]`)
      res.end()
    }
  }
}
