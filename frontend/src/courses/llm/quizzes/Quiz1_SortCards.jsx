import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/*
  QUIZ: Sort items into "LLM Can Do" vs "LLM Cannot Do" buckets
  by clicking/tapping cards to send them to the correct side.
*/

const items = [
  { text: 'Write a poem', canDo: true },
  { text: 'Feel emotions', canDo: false },
  { text: 'Summarize an article', canDo: true },
  { text: 'Browse the internet live', canDo: false },
  { text: 'Translate languages', canDo: true },
  { text: 'Truly understand meaning', canDo: false },
  { text: 'Generate code', canDo: true },
  { text: 'Have consciousness', canDo: false },
]

export default function Quiz1_SortCards({ onComplete }) {
  const [remaining, setRemaining] = useState(() => [...items].sort(() => Math.random() - 0.5))
  const [canDo, setCanDo] = useState([])
  const [cannotDo, setCannotDo] = useState([])
  const [wrong, setWrong] = useState(null)
  const [done, setDone] = useState(false)
  const [score, setScore] = useState(0)

  const current = remaining[0]

  const sortCard = (bucket) => {
    if (!current || done) return
    const correct = (bucket === 'can' && current.canDo) || (bucket === 'cannot' && !current.canDo)

    if (correct) {
      setScore((s) => s + 1)
      if (bucket === 'can') setCanDo((prev) => [...prev, current])
      else setCannotDo((prev) => [...prev, current])
      setWrong(null)
    } else {
      setWrong(current.text)
      // Still place it in correct bucket after a flash
      setTimeout(() => {
        if (current.canDo) setCanDo((prev) => [...prev, current])
        else setCannotDo((prev) => [...prev, current])
        setWrong(null)
      }, 800)
    }

    const next = remaining.slice(1)
    setRemaining(next)
    if (next.length === 0) {
      setTimeout(() => {
        setDone(true)
        onComplete()
      }, 900)
    }
  }

  return (
    <div>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, marginBottom: 8 }}>
        Sort the Cards
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>
        Can an LLM do this? Tap the correct bucket to sort each card.
      </p>

      {/* Buckets */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 32 }}>
        {/* CAN DO bucket */}
        <motion.div
          onClick={() => sortCard('can')}
          whileHover={current ? { scale: 1.02, borderColor: '#10b981' } : {}}
          whileTap={current ? { scale: 0.98 } : {}}
          style={{
            flex: 1, minHeight: 180, padding: 20, borderRadius: 16,
            background: 'rgba(16,185,129,0.05)', border: '2px dashed rgba(16,185,129,0.3)',
            cursor: current ? 'pointer' : 'default', transition: 'border-color 0.2s',
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, color: '#10b981', marginBottom: 12, textAlign: 'center' }}>
            ✅ CAN Do
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {canDo.map((item) => (
              <motion.span key={item.text} initial={{ scale: 0 }} animate={{ scale: 1 }}
                style={{ padding: '6px 12px', background: 'rgba(16,185,129,0.15)', borderRadius: 8, fontSize: 12, color: '#10b981' }}>
                {item.text}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* CANNOT bucket */}
        <motion.div
          onClick={() => sortCard('cannot')}
          whileHover={current ? { scale: 1.02, borderColor: '#ef4444' } : {}}
          whileTap={current ? { scale: 0.98 } : {}}
          style={{
            flex: 1, minHeight: 180, padding: 20, borderRadius: 16,
            background: 'rgba(239,68,68,0.05)', border: '2px dashed rgba(239,68,68,0.3)',
            cursor: current ? 'pointer' : 'default', transition: 'border-color 0.2s',
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, color: '#ef4444', marginBottom: 12, textAlign: 'center' }}>
            ❌ CANNOT Do
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {cannotDo.map((item) => (
              <motion.span key={item.text} initial={{ scale: 0 }} animate={{ scale: 1 }}
                style={{ padding: '6px 12px', background: 'rgba(239,68,68,0.15)', borderRadius: 8, fontSize: 12, color: '#ef4444' }}>
                {item.text}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Current card */}
      <div style={{ textAlign: 'center', minHeight: 100 }}>
        <AnimatePresence mode="wait">
          {current && !done ? (
            <motion.div
              key={current.text}
              initial={{ opacity: 0, y: 30, rotate: -3 }}
              animate={{
                opacity: 1, y: 0, rotate: 0,
                borderColor: wrong === current.text ? '#ef4444' : 'var(--border)',
                boxShadow: wrong === current.text ? '0 0 20px rgba(239,68,68,0.3)' : 'none',
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{
                display: 'inline-block', padding: '24px 40px', background: 'var(--bg-card)',
                border: '2px solid var(--border)', borderRadius: 16, fontSize: 18,
                fontWeight: 600, color: 'var(--text-primary)',
              }}
            >
              {current.text}
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                👆 Tap a bucket above
              </div>
            </motion.div>
          ) : done ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
              <div style={{ fontSize: 20, fontWeight: 600, color: '#10b981', marginBottom: 4 }}>
                {score}/{items.length} correct!
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                {score === items.length ? 'Perfect! You nailed it!' : 'Good try! Review the topic for the ones you missed.'}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {wrong && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ marginTop: 12, fontSize: 13, color: '#ef4444' }}>
            Oops! Moving to the correct bucket...
          </motion.div>
        )}
      </div>

      {/* Progress */}
      <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, height: 6, background: 'var(--bg-secondary)', borderRadius: 3, overflow: 'hidden' }}>
          <motion.div animate={{ width: `${((items.length - remaining.length) / items.length) * 100}%` }}
            style={{ height: '100%', background: 'var(--gradient-primary)', borderRadius: 3 }} />
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {items.length - remaining.length}/{items.length}
        </span>
      </div>
    </div>
  )
}
