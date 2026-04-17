import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/*
  QUIZ: Swipe/click cards left (hallucinated) or right (factual).
  Cards fly off screen in the direction chosen.
*/

const cards = [
  { text: 'GPT-4 was released by OpenAI in 2023', fact: true },
  { text: 'LLMs understand the meaning of every word they generate', fact: false },
  { text: 'Transformers process all tokens in parallel', fact: true },
  { text: 'LLMs can access live internet data during generation', fact: false },
  { text: 'Attention mechanism helps words understand context', fact: true },
  { text: 'A larger model always produces better results than a smaller one', fact: false },
]

export default function Quiz7_SwipeCards({ onComplete }) {
  const [remaining, setRemaining] = useState(() => [...cards])
  const [swipeDir, setSwipeDir] = useState(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const current = remaining[0]

  const swipe = (isFact) => {
    if (!current || swipeDir) return
    const correct = current.fact === isFact
    if (correct) setScore((s) => s + 1)
    setFeedback(correct ? '✅' : '❌')
    setSwipeDir(isFact ? 'right' : 'left')

    setTimeout(() => {
      const next = remaining.slice(1)
      setRemaining(next)
      setSwipeDir(null)
      setFeedback(null)
      if (next.length === 0) {
        setDone(true)
        onComplete()
      }
    }, 600)
  }

  if (done) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: 32 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
        <div style={{ fontSize: 20, fontWeight: 600, color: '#10b981', marginBottom: 8 }}>
          {score}/{cards.length} correct!
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          {score >= 5 ? 'Excellent critical thinking!' : 'Review hallucinations & limits to improve!'}
        </p>
      </motion.div>
    )
  }

  return (
    <div>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, marginBottom: 8 }}>
        Fact or Fiction?
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>
        Swipe each statement: is it a real fact or a hallucination?
      </p>

      {/* Swipe area */}
      <div style={{
        display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'center',
        marginBottom: 32, minHeight: 200,
      }}>
        {/* Left: Hallucination */}
        <motion.button
          onClick={() => swipe(false)}
          whileHover={{ scale: 1.1, background: 'rgba(239,68,68,0.2)' }}
          whileTap={{ scale: 0.95 }}
          style={{
            width: 80, height: 80, borderRadius: '50%', border: '2px solid rgba(239,68,68,0.4)',
            background: 'rgba(239,68,68,0.08)', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 4, transition: 'all 0.2s',
          }}
        >
          <span style={{ fontSize: 24 }}>🤥</span>
          <span style={{ fontSize: 10, color: '#ef4444', fontWeight: 600 }}>FICTION</span>
        </motion.button>

        {/* Card */}
        <div style={{ position: 'relative', width: 280, height: 160 }}>
          <AnimatePresence mode="wait">
            {current && (
              <motion.div
                key={current.text}
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                animate={{
                  opacity: 1, scale: 1, rotate: 0,
                  x: swipeDir === 'left' ? -300 : swipeDir === 'right' ? 300 : 0,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  position: 'absolute', inset: 0, padding: 24,
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 20, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.6, color: 'var(--text-primary)' }}>
                  "{current.text}"
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Feedback overlay */}
          {feedback && (
            <motion.div
              initial={{ opacity: 0, scale: 2 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                position: 'absolute', inset: 0, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 48, zIndex: 10, pointerEvents: 'none',
              }}
            >
              {feedback}
            </motion.div>
          )}
        </div>

        {/* Right: Fact */}
        <motion.button
          onClick={() => swipe(true)}
          whileHover={{ scale: 1.1, background: 'rgba(16,185,129,0.2)' }}
          whileTap={{ scale: 0.95 }}
          style={{
            width: 80, height: 80, borderRadius: '50%', border: '2px solid rgba(16,185,129,0.4)',
            background: 'rgba(16,185,129,0.08)', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 4, transition: 'all 0.2s',
          }}
        >
          <span style={{ fontSize: 24 }}>✅</span>
          <span style={{ fontSize: 10, color: '#10b981', fontWeight: 600 }}>FACT</span>
        </motion.button>
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, height: 6, background: 'var(--bg-secondary)', borderRadius: 3, overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${((cards.length - remaining.length) / cards.length) * 100}%` }}
            style={{ height: '100%', background: 'var(--gradient-primary)', borderRadius: 3 }}
          />
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {cards.length - remaining.length}/{cards.length}
        </span>
      </div>
    </div>
  )
}
