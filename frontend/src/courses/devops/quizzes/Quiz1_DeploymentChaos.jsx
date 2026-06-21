import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ================================================================
   QUIZ 1 — Deployment Chaos: Sort the Scenarios
   Format: Swipe/Sort cards into "Breaks" vs "Safe" buckets
================================================================ */

const SCENARIOS = [
  { id: 1, text: 'Different Node versions on dev and prod', breaks: true },
  { id: 2, text: 'Using environment variables for config', breaks: false },
  { id: 3, text: 'Installing packages globally on dev machine', breaks: true },
  { id: 4, text: 'Using a Dockerfile for builds', breaks: false },
  { id: 5, text: 'Hardcoding database passwords in source code', breaks: true },
  { id: 6, text: 'Pinning dependency versions in package.json', breaks: false },
  { id: 7, text: 'Running app as root user in production', breaks: true },
  { id: 8, text: 'Using a .dockerignore file', breaks: false },
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const bucketStyle = (color) => ({
  flex: 1,
  minHeight: 180,
  border: `2px dashed ${color}`,
  borderRadius: 16,
  padding: 16,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  alignItems: 'center',
  background: `${color}10`,
  transition: 'background 0.3s',
})

const cardBase = {
  padding: '14px 20px',
  borderRadius: 12,
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
  fontSize: 15,
  cursor: 'pointer',
  userSelect: 'none',
  textAlign: 'center',
  width: '100%',
  maxWidth: 340,
}

export default function Quiz1_DeploymentChaos({ onComplete }) {
  const [cards] = useState(() => shuffle(SCENARIOS))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [sorted, setSorted] = useState({ breaks: [], safe: [] })
  const [dragX, setDragX] = useState(0)
  const [finished, setFinished] = useState(false)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(null)

  const current = cards[currentIndex]
  const allDone = currentIndex >= cards.length

  const handleSort = (bucket) => {
    if (allDone) return
    const card = cards[currentIndex]
    const correct = (bucket === 'breaks' && card.breaks) || (bucket === 'safe' && !card.breaks)

    setSorted((prev) => ({
      ...prev,
      [bucket]: [...prev[bucket], { ...card, correct }],
    }))

    if (correct) setScore((s) => s + 1)
    setShowResult(correct ? 'correct' : 'wrong')

    setTimeout(() => {
      setShowResult(null)
      const next = currentIndex + 1
      setCurrentIndex(next)
      if (next >= cards.length) {
        setFinished(true)
      }
    }, 600)
  }

  const handleDragEnd = (_e, info) => {
    if (info.offset.x < -100) {
      handleSort('breaks')
    } else if (info.offset.x > 100) {
      handleSort('safe')
    }
    setDragX(0)
  }

  const finalScore = score
  const pct = Math.round((finalScore / cards.length) * 100)

  return (
    <div style={{ padding: 24, maxWidth: 700, margin: '0 auto' }}>
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          fontFamily: 'var(--font-heading)',
          color: 'var(--text-primary)',
          textAlign: 'center',
          marginBottom: 8,
          fontSize: 24,
        }}
      >
        Deployment Chaos Sort
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 24, fontSize: 14 }}
      >
        Swipe left for "Breaks in Production" or right for "Safe to Deploy". You can also click the buckets.
      </motion.p>

      {/* Progress bar */}
      <div style={{ height: 6, background: 'var(--bg-secondary)', borderRadius: 3, marginBottom: 24, overflow: 'hidden' }}>
        <motion.div
          animate={{ width: `${(currentIndex / cards.length) * 100}%` }}
          style={{ height: '100%', background: 'var(--accent)', borderRadius: 3 }}
          transition={{ type: 'spring', stiffness: 120 }}
        />
      </div>

      {!finished ? (
        <>
          {/* Bucket labels + card area */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 24 }}>
            {/* Left bucket: Breaks */}
            <motion.div
              style={bucketStyle('#ef4444')}
              animate={{ scale: dragX < -50 ? 1.05 : 1, background: dragX < -50 ? '#ef444430' : '#ef444410' }}
              onClick={() => handleSort('breaks')}
            >
              <div style={{ fontSize: 28 }}>💥</div>
              <div style={{ fontWeight: 700, color: '#ef4444', fontSize: 13, letterSpacing: 1 }}>BREAKS</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sorted.breaks.length} sorted</div>
            </motion.div>

            {/* Center card */}
            <div style={{ flex: 1.5, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 180, position: 'relative' }}>
              <AnimatePresence mode="wait">
                {current && !showResult && (
                  <motion.div
                    key={current.id}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDrag={(_e, info) => setDragX(info.offset.x)}
                    onDragEnd={handleDragEnd}
                    initial={{ opacity: 0, scale: 0.8, rotateZ: 0 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      rotateZ: dragX * 0.05,
                      x: 0,
                    }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    whileHover={{ scale: 1.03 }}
                    style={{
                      ...cardBase,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                      padding: '28px 24px',
                      fontSize: 16,
                      fontWeight: 500,
                      maxWidth: 260,
                    }}
                  >
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                      {currentIndex + 1} / {cards.length}
                    </div>
                    {current.text}
                  </motion.div>
                )}
                {showResult && (
                  <motion.div
                    key="result"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    style={{
                      fontSize: 48,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {showResult === 'correct' ? '✅' : '❌'}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right bucket: Safe */}
            <motion.div
              style={bucketStyle('#10b981')}
              animate={{ scale: dragX > 50 ? 1.05 : 1, background: dragX > 50 ? '#10b98130' : '#10b98110' }}
              onClick={() => handleSort('safe')}
            >
              <div style={{ fontSize: 28 }}>🛡️</div>
              <div style={{ fontWeight: 700, color: '#10b981', fontSize: 13, letterSpacing: 1 }}>SAFE</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sorted.safe.length} sorted</div>
            </motion.div>
          </div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center' }}
        >
          {/* Score circle */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            style={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              border: `4px solid ${pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444'}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              background: 'var(--bg-card)',
            }}
          >
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)' }}>{finalScore}/{cards.length}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{pct}%</div>
          </motion.div>

          <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>
            {pct >= 75 ? 'Great job! You know what breaks deployments.' : pct >= 50 ? 'Not bad, but review the tricky ones.' : 'Time to study deployment best practices!'}
          </p>

          {/* Review */}
          <div style={{ display: 'flex', gap: 16, marginTop: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
            {cards.map((c, i) => {
              const inBreaks = sorted.breaks.find((s) => s.id === c.id)
              const entry = inBreaks || sorted.safe.find((s) => s.id === c.id)
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  style={{
                    ...cardBase,
                    maxWidth: 200,
                    fontSize: 13,
                    borderColor: entry?.correct ? '#10b981' : '#ef4444',
                    background: entry?.correct ? '#10b98110' : '#ef444410',
                  }}
                >
                  <div style={{ marginBottom: 4 }}>{entry?.correct ? '✅' : '❌'}</div>
                  {c.text}
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                    {c.breaks ? '💥 Breaks' : '🛡️ Safe'}
                  </div>
                </motion.div>
              )
            })}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onComplete()}
            style={{
              marginTop: 28,
              padding: '12px 32px',
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'var(--font-heading)',
            }}
          >
            Continue
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}
