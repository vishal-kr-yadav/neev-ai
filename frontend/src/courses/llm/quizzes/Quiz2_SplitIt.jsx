import { useState } from 'react'
import { motion } from 'framer-motion'

/*
  QUIZ: Click between characters to split text into tokens.
  The user must figure out where the token boundaries are.
*/

const challenges = [
  {
    text: 'unhappiness',
    correctSplits: [2, 7], // un|happi|ness → indices after which to split
    hint: 'Think: prefix + root + suffix',
  },
  {
    text: 'transformer',
    correctSplits: [5], // trans|former
    hint: 'A common English prefix...',
  },
]

export default function Quiz2_SplitIt({ onComplete }) {
  const [challengeIdx, setChallengeIdx] = useState(0)
  const [userSplits, setUserSplits] = useState([])
  const [checked, setChecked] = useState(false)
  const [results, setResults] = useState([])
  const [done, setDone] = useState(false)

  const challenge = challenges[challengeIdx]
  const chars = challenge.text.split('')

  const toggleSplit = (idx) => {
    if (checked) return
    setUserSplits((prev) =>
      prev.includes(idx) ? prev.filter((x) => x !== idx) : [...prev, idx].sort((a, b) => a - b)
    )
  }

  const checkAnswer = () => {
    const correct =
      userSplits.length === challenge.correctSplits.length &&
      userSplits.every((s, i) => s === challenge.correctSplits[i])
    setChecked(true)
    setResults((prev) => [...prev, correct])

    setTimeout(() => {
      if (challengeIdx < challenges.length - 1) {
        setChallengeIdx((i) => i + 1)
        setUserSplits([])
        setChecked(false)
      } else {
        setDone(true)
        onComplete()
      }
    }, 1500)
  }

  // Build tokens from splits
  const getTokens = (splits) => {
    const tokens = []
    let start = 0
    for (const s of splits) {
      tokens.push(challenge.text.slice(start, s + 1))
      start = s + 1
    }
    tokens.push(challenge.text.slice(start))
    return tokens
  }

  if (done) {
    const score = results.filter(Boolean).length
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: 32 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
        <div style={{ fontSize: 20, fontWeight: 600, color: '#10b981', marginBottom: 8 }}>
          {score}/{challenges.length} correct splits!
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Tokenizers use similar logic — finding meaningful sub-word pieces.
        </p>
      </motion.div>
    )
  }

  return (
    <div>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, marginBottom: 8 }}>
        Split the Token
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 8 }}>
        Click between characters to split the word into sub-word tokens, like a tokenizer would.
      </p>
      <p style={{ color: 'var(--accent-light)', fontSize: 13, marginBottom: 28 }}>
        💡 Hint: {challenge.hint}
      </p>

      {/* Character display */}
      <div style={{
        background: 'var(--bg-card)', borderRadius: 20, padding: 32,
        border: '1px solid var(--border)', marginBottom: 24, textAlign: 'center',
      }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
          Challenge {challengeIdx + 1}/{challenges.length}
        </div>

        <div style={{
          display: 'inline-flex', alignItems: 'center', background: 'var(--bg-secondary)',
          borderRadius: 14, padding: '16px 8px', gap: 0,
        }}>
          {chars.map((ch, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{
                fontSize: 32, fontFamily: 'monospace', fontWeight: 700,
                color: 'var(--text-primary)', padding: '0 2px',
              }}>
                {ch}
              </span>
              {/* Clickable split point (not after last char) */}
              {i < chars.length - 1 && (
                <motion.button
                  onClick={() => toggleSplit(i)}
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    width: 20, height: 48, border: 'none', cursor: checked ? 'default' : 'pointer',
                    background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  <div style={{
                    width: userSplits.includes(i) ? 4 : 2,
                    height: userSplits.includes(i) ? 40 : 24,
                    borderRadius: 2,
                    background: userSplits.includes(i) ? '#4f46e5' : 'var(--border)',
                    transition: 'all 0.2s',
                    boxShadow: userSplits.includes(i) ? '0 0 8px rgba(79,70,229,0.5)' : 'none',
                  }} />
                </motion.button>
              )}
            </div>
          ))}
        </div>

        {/* Show resulting tokens */}
        {userSplits.length > 0 && (
          <div style={{ marginTop: 20, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {getTokens(userSplits).map((tok, i) => (
              <span key={i} style={{
                padding: '8px 16px',
                background: checked
                  ? (results[results.length - 1] !== undefined
                    ? (results[results.length - 1] ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)')
                    : 'rgba(79,70,229,0.15)')
                  : 'rgba(79,70,229,0.15)',
                borderRadius: 10, fontFamily: 'monospace', fontSize: 18,
                color: checked
                  ? (results.length > 0 && results[results.length - 1] ? '#10b981' : '#ef4444')
                  : '#818cf8',
                fontWeight: 600,
              }}>
                {tok}
              </span>
            ))}
          </div>
        )}

        {checked && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: 16, fontSize: 14, fontWeight: 600 }}>
            {results[results.length - 1]
              ? <span style={{ color: '#10b981' }}>✅ Perfect split!</span>
              : (
                <div>
                  <span style={{ color: '#ef4444' }}>Not quite. Correct: </span>
                  <span style={{ color: '#818cf8' }}>
                    {getTokens(challenge.correctSplits).join(' | ')}
                  </span>
                </div>
              )
            }
          </motion.div>
        )}
      </div>

      {!checked && (
        <div style={{ textAlign: 'center' }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={checkAnswer}
            disabled={userSplits.length === 0}
            style={{
              padding: '12px 32px', background: userSplits.length > 0 ? 'var(--gradient-primary)' : 'var(--bg-card)',
              border: 'none', borderRadius: 12, color: 'white', fontSize: 15, fontWeight: 600,
              cursor: userSplits.length > 0 ? 'pointer' : 'default',
              opacity: userSplits.length > 0 ? 1 : 0.4,
            }}
          >
            Check Split
          </motion.button>
        </div>
      )}
    </div>
  )
}
