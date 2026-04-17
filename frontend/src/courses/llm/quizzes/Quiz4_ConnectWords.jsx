import { useState } from 'react'
import { motion } from 'framer-motion'

/*
  QUIZ: Given a sentence and a highlighted word, click the words that should have
  the highest attention. Visual connection lines appear.
*/

const challenges = [
  {
    sentence: ['The', 'fluffy', 'cat', 'chased', 'the', 'mouse'],
    focus: 2, // "cat"
    highAttention: [1, 3], // "fluffy" and "chased" — what describes/involves cat
    explain: '"fluffy" describes the cat, and "chased" is what the cat did.',
  },
  {
    sentence: ['She', 'went', 'to', 'the', 'bank', 'by', 'the', 'river'],
    focus: 4, // "bank"
    highAttention: [6, 7], // "the" (2nd) and "river" — disambiguates bank
    explain: '"river" tells us this is a riverbank, not a financial bank.',
  },
]

export default function Quiz4_ConnectWords({ onComplete }) {
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState([])
  const [checked, setChecked] = useState(false)
  const [results, setResults] = useState([])
  const [done, setDone] = useState(false)

  const ch = challenges[idx]

  const toggleWord = (wordIdx) => {
    if (checked || wordIdx === ch.focus) return
    setSelected((prev) =>
      prev.includes(wordIdx) ? prev.filter((x) => x !== wordIdx) : [...prev, wordIdx]
    )
  }

  const check = () => {
    const correct = selected.length === ch.highAttention.length &&
      selected.every((s) => ch.highAttention.includes(s))
    setResults((prev) => [...prev, correct])
    setChecked(true)

    setTimeout(() => {
      if (idx < challenges.length - 1) {
        setIdx((i) => i + 1)
        setSelected([])
        setChecked(false)
      } else {
        setDone(true)
        onComplete()
      }
    }, 2500)
  }

  if (done) {
    const score = results.filter(Boolean).length
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: 32 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
        <div style={{ fontSize: 20, fontWeight: 600, color: '#10b981' }}>
          {score}/{challenges.length} correct!
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 8 }}>
          You're thinking like an attention mechanism!
        </p>
      </motion.div>
    )
  }

  return (
    <div>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, marginBottom: 8 }}>
        Connect the Attention
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>
        The highlighted word needs context. Click the {ch.highAttention.length} words it should pay the <b>most</b> attention to.
      </p>

      <div style={{
        background: 'var(--bg-card)', borderRadius: 20, padding: 32,
        border: '1px solid var(--border)', textAlign: 'center',
      }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
          Challenge {idx + 1}/{challenges.length}
        </div>

        {/* Sentence */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
          {ch.sentence.map((word, i) => {
            const isFocus = i === ch.focus
            const isSel = selected.includes(i)
            const isCorrectTarget = checked && ch.highAttention.includes(i)
            const isWrongTarget = checked && isSel && !ch.highAttention.includes(i)

            return (
              <motion.button
                key={i}
                onClick={() => toggleWord(i)}
                whileHover={!isFocus && !checked ? { scale: 1.1 } : {}}
                whileTap={!isFocus && !checked ? { scale: 0.95 } : {}}
                animate={{
                  y: isSel ? -6 : 0,
                }}
                style={{
                  padding: '14px 22px', borderRadius: 14, fontSize: 20, fontWeight: 600,
                  fontFamily: 'var(--font-heading)',
                  cursor: isFocus || checked ? 'default' : 'pointer',
                  border: isFocus ? '2px solid #4f46e5'
                    : isCorrectTarget ? '2px solid #10b981'
                    : isWrongTarget ? '2px solid #ef4444'
                    : isSel ? '2px solid #818cf8'
                    : '2px solid var(--border)',
                  background: isFocus ? 'rgba(79,70,229,0.2)'
                    : isCorrectTarget ? 'rgba(16,185,129,0.15)'
                    : isWrongTarget ? 'rgba(239,68,68,0.15)'
                    : isSel ? 'rgba(129,140,248,0.15)'
                    : 'var(--bg-secondary)',
                  color: isFocus ? '#818cf8'
                    : isCorrectTarget ? '#10b981'
                    : isWrongTarget ? '#ef4444'
                    : isSel ? '#818cf8'
                    : 'var(--text-primary)',
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
              >
                {word}
                {isFocus && (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    style={{
                      position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
                      fontSize: 14,
                    }}
                  >
                    🔦
                  </motion.div>
                )}
                {isSel && !checked && (
                  <div style={{
                    position: 'absolute', top: -8, right: -8, width: 18, height: 18,
                    borderRadius: '50%', background: '#818cf8', fontSize: 10, color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    ✓
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>

        {/* Visual connection lines (simple) */}
        {(selected.length > 0 || checked) && (
          <div style={{ marginBottom: 20, fontSize: 14, color: 'var(--accent-light)' }}>
            "{ch.sentence[ch.focus]}" → {(checked ? ch.highAttention : selected).map((i) => `"${ch.sentence[i]}"`).join(', ')}
          </div>
        )}

        {checked && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{
              padding: 16, background: 'var(--bg-secondary)', borderRadius: 12,
              fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7,
            }}>
            💡 {ch.explain}
          </motion.div>
        )}
      </div>

      {!checked && (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <motion.button whileHover={{ scale: 1.05 }} onClick={check}
            disabled={selected.length !== ch.highAttention.length}
            style={{
              padding: '12px 32px', background: selected.length === ch.highAttention.length ? 'var(--gradient-primary)' : 'var(--bg-card)',
              border: 'none', borderRadius: 12, color: 'white', fontSize: 15,
              fontWeight: 600, cursor: selected.length === ch.highAttention.length ? 'pointer' : 'default',
              opacity: selected.length === ch.highAttention.length ? 1 : 0.4,
            }}>
            Check ({selected.length}/{ch.highAttention.length} selected)
          </motion.button>
        </div>
      )}
    </div>
  )
}
