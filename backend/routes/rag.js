const express = require('express')
const OpenAI = require('openai')

const router = express.Router()

router.post('/chat', async (req, res) => {
  const { question, context, systemPrompt } = req.body

  if (!question || !context) {
    return res.status(400).json({ error: 'Question and context are required' })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return res.json({
      answer: generateFallbackAnswer(question, context),
      model: 'fallback',
    })
  }

  const sysPrompt = systemPrompt || 'You are a helpful assistant. Answer the question using ONLY the provided context. If the context does not contain the answer, say so. Be concise and accurate.'

  try {
    const client = new OpenAI({ apiKey })

    // Try Responses API first (free tier supports gpt-5.4-mini)
    const response = await client.responses.create({
      model: 'gpt-5.4-mini',
      instructions: sysPrompt,
      input: `Context:\n${context}\n\nQuestion: ${question}`,
    })

    const answer = response.output_text || 'No response generated.'
    res.json({ answer, model: 'gpt-5.4-mini' })
  } catch (err) {
    console.error('RAG chat error:', err.status, err.message)

    // Try Chat Completions API as fallback (for paid keys)
    if (err.status !== 429 && err.status !== 401) {
      try {
        const client = new OpenAI({ apiKey })
        const completion = await client.chat.completions.create({
          model: 'gpt-4o-mini',
          max_tokens: 512,
          messages: [
            { role: 'system', content: sysPrompt },
            { role: 'user', content: `Context:\n${context}\n\nQuestion: ${question}` },
          ],
        })
        const answer = completion.choices[0]?.message?.content || 'No response generated.'
        return res.json({ answer, model: 'gpt-4o-mini' })
      } catch (err2) {
        console.error('Chat completions fallback error:', err2.message)
        err = err2
      }
    }

    if (err.status === 429 || err.message?.includes('quota') || err.message?.includes('billing')) {
      return res.json({
        answer: 'API credits are not available. Please add credits at platform.openai.com → Settings → Billing to use the AI-powered chatbot.',
        model: 'no-credits',
      })
    }

    if (err.status === 401) {
      return res.json({
        answer: 'Invalid API key. Please check your OpenAI API key configuration.',
        model: 'auth-error',
      })
    }

    res.json({
      answer: generateFallbackAnswer(question, context),
      model: 'fallback',
    })
  }
})

function generateFallbackAnswer(question, context) {
  const qWords = question.toLowerCase().split(/\s+/).filter(w => w.length > 3)
  const sentences = context.match(/[^.!?]+[.!?]+/g) || [context]
  const scored = sentences.map(s => ({
    text: s.trim(),
    score: qWords.reduce((acc, w) => acc + (s.toLowerCase().includes(w) ? 1 : 0), 0),
  })).sort((a, b) => b.score - a.score)

  const best = scored.slice(0, 3).filter(s => s.score > 0)
  if (best.length === 0) return 'I could not find relevant information in the provided documents to answer this question.'
  return `Based on the provided documents: ${best.map(s => s.text).join(' ')}`
}

module.exports = router
