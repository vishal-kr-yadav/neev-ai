import { useState } from 'react'
import { motion } from 'framer-motion'

/*
  QUIZ: Arrange the training pipeline stages on a timeline by clicking in order.
*/

const stages = [
  { label: 'Collect massive text data', emoji: '📚', color: '#4f46e5', phase: 'Pre-training' },
  { label: 'Predict next word (self-supervised)', emoji: '🔮', color: '#818cf8', phase: 'Pre-training' },
  { label: 'Write instruction-response pairs', emoji: '✏️', color: '#0ea5e9', phase: 'Fine-tuning' },
  { label: 'Train on Q&A format', emoji: '🎯', color: '#10b981', phase: 'Fine-tuning' },
  { label: 'Humans rank outputs', emoji: '👍', color: '#ec4899', phase: 'RLHF' },
  { label: 'Optimize for human preferences', emoji: '🏆', color: '#f59e0b', phase: 'RLHF' },
]

export default function Quiz5_Timeline({ onComplete }) {
  const [shuffled] = useState(() => [...stages].sort(() => Math.random() - 0.5))
  const [placed, setPlaced] = useState([])
  const [available, setAvailable] = useState(() => shuffled.map((_, i) => i))
  const [checked, setChecked] = useState(false)
  const [score, setScore] = useState(0)

  const place = (sIdx) => {
    if (checked) return
    setPlaced((prev) => [...prev, sIdx])
    setAvailable((prev) => prev.filter((i) => i !== sIdx))
  }

  const remove = (pIdx) => {
    if (checked) return
    const sIdx = placed[pIdx]
    setPlaced((prev) => prev.filter((_, i) => i !== pIdx))
    setAvailable((prev) => [...prev, sIdx].sort((a, b) => a - b))
  }

  const check = () => {
    let s = 0
    placed.forEach((sIdx, pIdx) => {
      if (shuffled[sIdx].label === stages[pIdx].label) s++
    })
    setScore(s)
    setChecked(true)
    onComplete()
  }

  return (
    <div>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, marginBottom: 8 }}>
        Build the Training Timeline
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>
        Click stages in the correct order to build the LLM training pipeline.
      </p>

      {/* Available */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
          Click to place on timeline:
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {available.map((sIdx) => {
            const st = shuffled[sIdx]
            return (
              <motion.button key={st.label} onClick={() => place(sIdx)}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                style={{
                  padding: '10px 16px', borderRadius: 10, border: '1px solid var(--border)',
                  background: 'var(--bg-card)', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                  color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8,
                }}>
                <span style={{ fontSize: 18 }}>{st.emoji}</span> {st.label}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Timeline */}
      <div style={{
        background: 'var(--bg-card)', borderRadius: 20, padding: 24,
        border: '1px solid var(--border)', minHeight: 300,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, position: 'relative' }}>
          {/* Timeline line */}
          <div style={{
            position: 'absolute', left: 20, top: 0, bottom: 0, width: 2,
            background: 'var(--border)',
          }} />

          {placed.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              Click stages above to build the timeline
            </div>
          )}

          {placed.map((sIdx, pIdx) => {
            const st = shuffled[sIdx]
            const isRight = checked && st.label === stages[pIdx].label
            const isWrong = checked && st.label !== stages[pIdx].label
            return (
              <motion.div key={`${st.label}-${pIdx}`}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                onClick={() => remove(pIdx)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px 12px 44px',
                  borderRadius: 12, cursor: checked ? 'default' : 'pointer',
                  background: isRight ? 'rgba(16,185,129,0.1)' : isWrong ? 'rgba(239,68,68,0.1)' : 'transparent',
                  position: 'relative',
                }}>
                <div style={{
                  position: 'absolute', left: 12, width: 18, height: 18, borderRadius: '50%',
                  background: isRight ? '#10b981' : isWrong ? '#ef4444' : st.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, color: '#000', fontWeight: 700, zIndex: 1,
                }}>
                  {pIdx + 1}
                </div>
                <span style={{ fontSize: 18 }}>{st.emoji}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: isRight ? '#10b981' : isWrong ? '#ef4444' : 'var(--text-primary)' }}>
                    {st.label}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{st.phase}</div>
                </div>
                {isRight && <span style={{ marginLeft: 'auto' }}>✅</span>}
                {isWrong && <span style={{ marginLeft: 'auto' }}>❌</span>}
              </motion.div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 20, justifyContent: 'center' }}>
        {!checked && placed.length === stages.length && (
          <motion.button whileHover={{ scale: 1.05 }} onClick={check}
            style={{
              padding: '12px 32px', background: 'var(--gradient-primary)', border: 'none',
              borderRadius: 12, color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer',
            }}>
            Check Timeline
          </motion.button>
        )}
      </div>

      {checked && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ textAlign: 'center', marginTop: 16 }}>
          <div style={{ fontSize: 20, fontWeight: 600, color: score === stages.length ? '#10b981' : '#f59e0b' }}>
            {score}/{stages.length} in the right position!
          </div>
        </motion.div>
      )}
    </div>
  )
}
