import { useState } from 'react'
import { motion } from 'framer-motion'

/*
  QUIZ: Arrange transformer layers in correct order by clicking them in sequence.
*/

const correctOrder = [
  { label: 'Input Embedding', emoji: '📥', color: '#4f46e5' },
  { label: 'Positional Encoding', emoji: '📍', color: '#818cf8' },
  { label: 'Self-Attention', emoji: '🎯', color: '#0ea5e9' },
  { label: 'Feed Forward Network', emoji: '⚡', color: '#f59e0b' },
  { label: 'Layer Norm + Residual', emoji: '🔄', color: '#ec4899' },
  { label: 'Output Probabilities', emoji: '📤', color: '#10b981' },
]

export default function Quiz3_BuildStack({ onComplete }) {
  const [shuffled] = useState(() => [...correctOrder].sort(() => Math.random() - 0.5))
  const [placed, setPlaced] = useState([])
  const [available, setAvailable] = useState(() => shuffled.map((_, i) => i))
  const [checked, setChecked] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const placeLayer = (shuffledIdx) => {
    if (checked) return
    setPlaced((prev) => [...prev, shuffledIdx])
    setAvailable((prev) => prev.filter((i) => i !== shuffledIdx))
  }

  const removeLayer = (placedIdx) => {
    if (checked) return
    const shuffledIdx = placed[placedIdx]
    setPlaced((prev) => prev.filter((_, i) => i !== placedIdx))
    setAvailable((prev) => [...prev, shuffledIdx].sort((a, b) => a - b))
  }

  const check = () => {
    const correct = placed.every((sIdx, pIdx) => shuffled[sIdx].label === correctOrder[pIdx].label)
    setIsCorrect(correct)
    setChecked(true)
    if (correct) onComplete()
    else setTimeout(() => { onComplete() }, 2000)
  }

  const reset = () => {
    setPlaced([])
    setAvailable(shuffled.map((_, i) => i))
    setChecked(false)
    setIsCorrect(false)
  }

  return (
    <div>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, marginBottom: 8 }}>
        Build the Transformer
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>
        Click layers in the correct order (top to bottom) to build the Transformer stack.
      </p>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {/* Available layers */}
        <div style={{ flex: 1, minWidth: 250 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
            Available Layers (click to place):
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {available.map((sIdx) => {
              const layer = shuffled[sIdx]
              return (
                <motion.button
                  key={layer.label}
                  onClick={() => placeLayer(sIdx)}
                  whileHover={{ scale: 1.03, x: 8 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 500,
                    color: 'var(--text-primary)', textAlign: 'left', transition: 'border-color 0.2s',
                  }}
                >
                  <span style={{ fontSize: 22 }}>{layer.emoji}</span>
                  <span>{layer.label}</span>
                </motion.button>
              )
            })}
            {available.length === 0 && (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                All layers placed!
              </div>
            )}
          </div>
        </div>

        {/* Build area */}
        <div style={{ flex: 1, minWidth: 250 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
            Your Stack (click to remove):
          </div>
          <div style={{
            minHeight: 380, padding: 16, background: 'var(--bg-secondary)',
            borderRadius: 16, border: '2px dashed var(--border)',
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            {placed.length === 0 && (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                Click layers to add them here ↗
              </div>
            )}
            {placed.map((sIdx, pIdx) => {
              const layer = shuffled[sIdx]
              const isRight = checked && layer.label === correctOrder[pIdx].label
              const isWrong = checked && layer.label !== correctOrder[pIdx].label
              return (
                <motion.div
                  key={`${layer.label}-${pIdx}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => removeLayer(pIdx)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
                    background: isRight ? 'rgba(16,185,129,0.15)' : isWrong ? 'rgba(239,68,68,0.15)' : `${layer.color}15`,
                    border: `1px solid ${isRight ? '#10b981' : isWrong ? '#ef4444' : layer.color + '44'}`,
                    borderRadius: 10, cursor: checked ? 'default' : 'pointer', fontSize: 14,
                  }}
                >
                  <span style={{
                    width: 24, height: 24, borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: 11,
                    fontWeight: 700, background: `${layer.color}33`, color: layer.color,
                  }}>
                    {pIdx + 1}
                  </span>
                  <span style={{ fontSize: 18 }}>{layer.emoji}</span>
                  <span style={{ fontWeight: 500 }}>{layer.label}</span>
                  {isRight && <span style={{ marginLeft: 'auto', color: '#10b981' }}>✓</span>}
                  {isWrong && <span style={{ marginLeft: 'auto', color: '#ef4444' }}>✗</span>}
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'center' }}>
        {!checked && placed.length === correctOrder.length && (
          <motion.button whileHover={{ scale: 1.05 }} onClick={check}
            style={{
              padding: '12px 32px', background: 'var(--gradient-primary)', border: 'none',
              borderRadius: 12, color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer',
            }}>
            Check Order
          </motion.button>
        )}
        {!checked && placed.length > 0 && (
          <button onClick={reset} style={{
            padding: '12px 24px', background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 12, color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer',
          }}>
            Reset
          </button>
        )}
      </div>

      {checked && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginTop: 20 }}>
          {isCorrect ? (
            <>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#10b981' }}>Perfect! You built the Transformer!</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔄</div>
              <div style={{ fontSize: 16, color: '#f59e0b', marginBottom: 4 }}>Not quite right — but now you know the order!</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Correct: {correctOrder.map((l) => l.emoji).join(' → ')}
              </div>
            </>
          )}
        </motion.div>
      )}
    </div>
  )
}
