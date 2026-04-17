import { useState } from 'react'
import { motion } from 'framer-motion'

/*
  QUIZ: Match the output to the correct temperature setting.
  User sees generated text and must place a slider to guess the temperature.
*/

const challenges = [
  {
    output: 'The capital of France is Paris. The capital of France is Paris.',
    answer: 0.1,
    explain: 'Very repetitive and predictable = very low temperature.',
  },
  {
    output: 'The quantum fox leaped through crystalline dimensions of pure jazz.',
    answer: 1.0,
    explain: 'Wild, creative, unexpected combinations = very high temperature.',
  },
  {
    output: 'The weather today is sunny with a gentle breeze from the west.',
    answer: 0.5,
    explain: 'Natural and coherent but not boring or wild = balanced temperature.',
  },
]

export default function Quiz8_TemperatureLab({ onComplete }) {
  const [idx, setIdx] = useState(0)
  const [guess, setGuess] = useState(0.5)
  const [checked, setChecked] = useState(false)
  const [scores, setScores] = useState([])
  const [done, setDone] = useState(false)

  const ch = challenges[idx]

  const check = () => {
    const diff = Math.abs(guess - ch.answer)
    const correct = diff <= 0.2
    setScores((prev) => [...prev, correct])
    setChecked(true)

    setTimeout(() => {
      if (idx < challenges.length - 1) {
        setIdx((i) => i + 1)
        setGuess(0.5)
        setChecked(false)
      } else {
        setDone(true)
        onComplete()
      }
    }, 2500)
  }

  if (done) {
    const s = scores.filter(Boolean).length
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: 32 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🌡️</div>
        <div style={{ fontSize: 20, fontWeight: 600, color: '#10b981', marginBottom: 8 }}>
          {s}/{challenges.length} correct temperature guesses!
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>You've got great intuition for temperature control!</p>
      </motion.div>
    )
  }

  return (
    <div>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, marginBottom: 8 }}>
        Temperature Lab 🌡️
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>
        Read the AI output and guess: what temperature produced this?
      </p>

      <div style={{
        background: 'var(--bg-card)', borderRadius: 20, padding: 32,
        border: '1px solid var(--border)', marginBottom: 24,
      }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
          Sample {idx + 1}/{challenges.length}
        </div>

        {/* Output */}
        <div style={{
          padding: 24, background: 'var(--bg-secondary)', borderRadius: 14,
          fontSize: 16, fontStyle: 'italic', color: 'var(--text-primary)',
          lineHeight: 1.7, textAlign: 'center', marginBottom: 28,
          border: '1px solid var(--border)',
        }}>
          "{ch.output}"
        </div>

        {/* Temperature slider */}
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 12, textAlign: 'center' }}>
          Set your temperature guess:
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <span style={{ fontSize: 20 }}>🧊</span>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="range" min="0.1" max="1.0" step="0.1" value={guess}
              onChange={(e) => !checked && setGuess(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#4f46e5' }}
            />
            {/* Show correct answer marker */}
            {checked && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  position: 'absolute', bottom: -24,
                  left: `${((ch.answer - 0.1) / 0.9) * 100}%`,
                  transform: 'translateX(-50%)',
                  fontSize: 12, color: '#10b981', fontWeight: 600, whiteSpace: 'nowrap',
                }}
              >
                ↑ Correct: {ch.answer}
              </motion.div>
            )}
          </div>
          <span style={{ fontSize: 20 }}>🔥</span>
          <div style={{
            padding: '8px 16px', background: 'var(--bg-secondary)', borderRadius: 10,
            fontSize: 20, fontWeight: 700, color: 'var(--accent-light)', minWidth: 60, textAlign: 'center',
          }}>
            {guess.toFixed(1)}
          </div>
        </div>

        {/* Visual indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20, marginTop: 16 }}>
          {[0.1, 0.3, 0.5, 0.7, 1.0].map((t) => (
            <div key={t} style={{
              width: 50, height: 50, borderRadius: 10,
              background: Math.abs(guess - t) < 0.15
                ? `rgba(79,70,229,${0.3 + (1 - Math.abs(guess - t)) * 0.5})`
                : 'var(--bg-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, color: Math.abs(guess - t) < 0.15 ? 'var(--accent-light)' : 'var(--text-muted)',
              fontWeight: 600, transition: 'all 0.2s',
              border: Math.abs(guess - t) < 0.05 ? '2px solid var(--accent)' : '2px solid transparent',
            }}>
              {t}
            </div>
          ))}
        </div>

        {checked && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{
              padding: 16, background: 'var(--bg-secondary)', borderRadius: 12,
              fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center',
              marginTop: 20,
            }}>
            {scores[scores.length - 1]
              ? <span style={{ color: '#10b981' }}>✅ Great guess!</span>
              : <span style={{ color: '#f59e0b' }}>Close! The answer was {ch.answer}</span>
            }
            <div style={{ marginTop: 6, fontSize: 13 }}>💡 {ch.explain}</div>
          </motion.div>
        )}
      </div>

      {!checked && (
        <div style={{ textAlign: 'center' }}>
          <motion.button whileHover={{ scale: 1.05 }} onClick={check}
            style={{
              padding: '12px 32px', background: 'var(--gradient-primary)', border: 'none',
              borderRadius: 12, color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer',
            }}>
            Lock In Guess
          </motion.button>
        </div>
      )}
    </div>
  )
}
