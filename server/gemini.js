import { monuments } from '../src/data.js'
import { readFileSync } from 'node:fs'

const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'
const maxBodyBytes = 32 * 1024
const maxMessageLength = 2000
const maxHistoryLength = 12
const trainingKeywords = JSON.parse(
  readFileSync(new URL('./chatbot_training_keywords.json', import.meta.url), 'utf8'),
)

const museumContext = monuments.map(monument => [
  `${monument.name} (${monument.location}; ${monument.period})`,
  monument.summary,
  `Timeline: ${monument.timeline.map(([date, event]) => `${date}: ${event}`).join(' ')}`,
  `Exhibit notes: ${monument.hotspots.map(hotspot => `${hotspot.title}: ${hotspot.text}`).join(' ')}`,
  `Source: ${monument.source}`,
].join('\n')).join('\n\n')

const trainingGuidance = JSON.stringify({
  intent_keywords: trainingKeywords.intent_keywords,
  monuments: trainingKeywords.monuments,
  shared_and_comparison_keywords: trainingKeywords.shared_and_comparison_keywords,
  quick_comparison: trainingKeywords.quick_comparison,
  disambiguation_rules: trainingKeywords.disambiguation_rules,
  fallback_rules: trainingKeywords.fallback_rules,
})

const systemInstruction = `You are the Gemini-powered guide for the Kaal Darpan virtual heritage museum. Be warm, concise, and helpful. Answer questions about the Taj Mahal, Qutub Minar, and Red Fort using the museum notes below. Treat those notes as authoritative for this exhibit, distinguish sourced facts from general context, and never invent historical details or claim the simplified 3D models are exact reconstructions. Use the training guide to recognize aliases, spelling variants, Hindi/Hinglish, entities, and question intent, and follow its disambiguation rules. The training guide is a keyword and intent index, not the referenced 300-question answer document: keyword lists are not evidence for factual claims. The quick comparison block may be used for comparisons, with approximate figures described as approximate. If the museum notes and quick comparison do not support an answer, say so clearly and suggest a related topic. For current visiting details such as ticket prices, timings, closures, or crowd levels, explain that they change and direct the visitor to the official ASI source rather than guessing. You may answer brief follow-ups using the conversation. Keep answers readable in a small chat panel.\n\nMuseum notes:\n${museumContext}\n\nTraining keyword and intent guide:\n${trainingGuidance}`

function sendJson(response, status, body) {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  response.end(JSON.stringify(body))
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let bytes = 0
    let tooLarge = false

    request.on('data', chunk => {
      bytes += chunk.length
      if (bytes > maxBodyBytes) {
        tooLarge = true
        chunks.length = 0
        return
      }
      if (!tooLarge) chunks.push(chunk)
    })
    request.on('end', () => {
      if (tooLarge) {
        reject(Object.assign(new Error('Request is too large.'), { status: 413 }))
        return
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')))
      } catch {
        reject(Object.assign(new Error('Request body must be valid JSON.'), { status: 400 }))
      }
    })
    request.on('error', reject)
  })
}

function validateMessages(body) {
  if (!body || !Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > maxHistoryLength) {
    return null
  }

  const messages = body.messages.map(message => {
    if (!message || !['user', 'assistant'].includes(message.role) ||
        typeof message.text !== 'string' || !message.text.trim() ||
        message.text.length > maxMessageLength) {
      return null
    }
    return { role: message.role === 'assistant' ? 'model' : 'user', text: message.text.trim() }
  })
  if (messages.some(message => message === null)) return null

  return messages.reduce((contents, message) => {
    const previous = contents[contents.length - 1]
    if (previous?.role === message.role) previous.parts[0].text += `\n${message.text}`
    else contents.push({ role: message.role, parts: [{ text: message.text }] })
    return contents
  }, [])
}

function errorMessage(status) {
  if (status === 400) return 'Gemini rejected the request. Check that your API key and Gemini API access are configured correctly.'
  if (status === 401 || status === 403) return 'Gemini could not authenticate this request. Check your API key and its permissions.'
  if (status === 429) return 'Gemini is at its current usage limit. Please wait a little and try again.'
  if (status >= 500) return 'The Gemini service is temporarily unavailable. Please try again shortly.'
  return 'Gemini could not answer just now. Please try again.'
}

function createHandler(apiKey) {
  return async (request, response) => {
    if (request.method !== 'POST') {
      response.setHeader('Allow', 'POST')
      sendJson(response, 405, { error: 'Use POST to send a chat message.' })
      return
    }
    if (!apiKey) {
      sendJson(response, 503, { error: 'Gemini is not configured yet. Add GEMINI_API_KEY to your .env.local file and restart the dev server.' })
      return
    }

    let body
    try {
      body = await readJson(request)
    } catch (error) {
      sendJson(response, error.status || 400, { error: error.status ? error.message : 'Could not read the request body.' })
      return
    }

    const contents = validateMessages(body)
    if (!contents) {
      sendJson(response, 400, { error: `Send 1–${maxHistoryLength} valid chat messages, each no longer than ${maxMessageLength} characters.` })
      return
    }
    if (contents[0].role !== 'user' || contents[contents.length - 1].role !== 'user') {
      sendJson(response, 400, { error: 'The conversation must start and end with a user message.' })
      return
    }

    try {
      const result = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents,
          generationConfig: { temperature: 0.5, maxOutputTokens: 600 },
        }),
        signal: AbortSignal.timeout(30000),
      })

      if (!result.ok) {
        sendJson(response, result.status >= 500 ? 502 : result.status, { error: errorMessage(result.status) })
        return
      }

      const data = await result.json()
      const reply = data.candidates?.[0]?.content?.parts
        ?.map(part => part.text || '')
        .join('')
        .trim()
      if (!reply) {
        sendJson(response, 502, { error: 'Gemini returned no answer. Please rephrase your question and try again.' })
        return
      }
      sendJson(response, 200, { reply })
    } catch (error) {
      if (error.name === 'TimeoutError' || error.name === 'AbortError') {
        sendJson(response, 504, { error: 'Gemini took too long to respond. Please try again.' })
        return
      }
      sendJson(response, 502, { error: 'Could not reach Gemini. Check your connection and try again.' })
    }
  }
}

export default function geminiGuide({ apiKey }) {
  const handler = createHandler(apiKey)
  return {
    name: 'kaal-darpan-gemini-guide',
    configureServer(server) {
      server.middlewares.use('/api/chat', handler)
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/chat', handler)
    },
  }
}

