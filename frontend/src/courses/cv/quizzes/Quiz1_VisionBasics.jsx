import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ================================================================
   QUIZ 1 — Vision Basics: Drag-and-Drop Matching Game
   Format: Match 6 CV applications to their descriptions
================================================================ */

const PAIRS = [
  { id: 'qc', app: 'Manufacturing QC', desc: 'Detects defective products on assembly lines using visual inspection' },
  { id: 'driving', app: 'Self-Driving Cars', desc: 'Perceives lanes, pedestrians, and obstacles in real time' },
  { id: 'medical', app: 'Medical Imaging', desc: 'Identifies tumors and anomalies in X-rays, MRIs, and CT scans' },
  { id: 'face', app: 'Face Unlock', desc: 'Verifies identity by matching facial geometry to stored templates' },
  { id: 'crop', app: 'Crop Monitoring', desc: 'Analyzes aerial imagery to assess plant health and detect disease' },
  { id: 'barcode', app: 'Barcode Scanning', desc: 'Reads encoded data from patterns of lines or squares in images' },
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const ICONS = {
  qc: '\u{1F3ED}',
  driving: '\u{1F697}',
  medical: '\u{1FA7A}',
  face: '\u{1F464}',
  crop: '\u{1F33E}',
  barcode: '\u{1F4F1}',
}

const MATCH_COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#06b6d4']

export default function Quiz1_VisionBasics({ onComplete }) {
  const [shuffledDescs] = useState(() => shuffle(PAIRS))
  const [selectedLeft, setSelectedLeft] = useState(null)
  const [selectedRight, setSelectedRight] = useState(null)
  const [matched, setMatched] = useState({})
  const [matchColors, setMatchColors] = useState({})
  const [wrongPair, setWrongPair] = useState(null)
  const [attempts, setAttempts] = useState(0)

  const allMatched = Object.keys(matched).length === PAIRS.length
  const score = PAIRS.length
  const maxPossible = PAIRS.length

  const tryMatch = (leftId, rightId) => {
    setAttempts((a) => a + 1)
    if (leftId === rightId) {
      const colorIdx = Object.keys(matched).length % MATCH_COLORS.length
      setMatched((prev) => ({ ...prev, [leftId]: true }))
      setMatchColors((prev) => ({ ...prev, [leftId]: MATCH_COLORS[colorIdx] }))
      setSelectedLeft(null)
      setSelectedRight(null)
    } else {
      setWrongPair({ left: leftId, right: rightId })
      setTimeout(() => {
        setWrongPair(null)
        setSelectedLeft(null)
        setSelectedRight(null)
      }, 700)
    }
  }

  const handleLeftClick = (id) => {
    if (matched[id]) return
    setSelectedLeft(id)
    setWrongPair(null)
    if (selectedRight) {
      tryMatch(id, selectedRight)
    }
  }

  const handleRightClick = (id) => {
    if (matched[id]) return
    setSelectedRight(id)
    setWrongPair(null)
    if (selectedLeft) {
      tryMatch(selectedLeft, id)
    }
  }

  const itemStyle = (isMatched, isSelected, isWrong, color) => ({
    padding: '14px 16px',
    borderRadius: 12,
    background: isMatched
      ? `${color}18`
      : isWrong
      ? '#ef444420'
      : isSelected
      ? 'rgba(99,102,241,0.12)'
      : 'var(--bg-card)',
    border: `2px solid ${
      isMatched ? color : isWrong ? '#ef4444' : isSelected ? 'var(--accent)' : 'var(--border)'
    }`,
    color: isMatched ? color : 'var(--text-primary)',
    cursor: isMatched ? 'default' : 'pointer',
    fontSize: 14,
    fontWeight: 500,
    userSelect: 'none',
    position: 'relative',
    transition: 'background 0.2s, border-color 0.2s',
  })

  return (
    <div style={{ padding: 24, maxWidth: 780, margin: '0 auto' }}>
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
        Vision Basics Match
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 8, fontSize: 14 }}
      >
        Click an application on the left, then its matching description on the right.
      </motion.p>

      {/* Progress */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {Object.keys(matched).length} / {PAIRS.length} matched
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ height: 6, background: 'var(--bg-secondary)', borderRadius: 3, marginBottom: 24, overflow: 'hidden' }}>
        <motion.div
          animate={{ width: `${(Object.keys(matched).length / PAIRS.length) * 100}%` }}
          style={{ height: '100%', background: 'var(--accent)', borderRadius: 3 }}
          transition={{ type: 'spring', stiffness: 120 }}
        />
      </div>

      {!allMatched ? (
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center' }}>
          {/* Left column: Applications */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, maxWidth: 240 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1.5, textAlign: 'center', marginBottom: 4, textTransform: 'uppercase' }}>
              Applications
            </div>
            {PAIRS.map((p) => {
              const isMatched = matched[p.id]
              const isSelected = selectedLeft === p.id
              const isWrong = wrongPair?.left === p.id
              return (
                <motion.div
                  key={p.id}
                  onClick={() => handleLeftClick(p.id)}
                  animate={
                    isWrong
                      ? { x: [0, -8, 8, -8, 8, 0] }
                      : isMatched
                      ? { scale: [1, 1.06, 1] }
                      : {}
                  }
                  transition={isWrong ? { duration: 0.4 } : { duration: 0.3 }}
                  whileHover={!isMatched ? { scale: 1.03 } : {}}
                  whileTap={!isMatched ? { scale: 0.97 } : {}}
                  style={itemStyle(isMatched, isSelected, isWrong, matchColors[p.id])}
                >
                  {isMatched && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{ position: 'absolute', top: -8, right: -8, fontSize: 14 }}
                    >
                      {'✅'}
                    </motion.div>
                  )}
                  <span style={{ marginRight: 8 }}>{ICONS[p.id]}</span>
                  {p.app}
                </motion.div>
              )
            })}
          </div>

          {/* Connection indicators */}
          <div style={{ width: 48, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
            {PAIRS.map((p) => (
              <AnimatePresence key={p.id}>
                {matched[p.id] && (
                  <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    style={{
                      width: 36,
                      height: 3,
                      background: matchColors[p.id] || 'var(--accent)',
                      borderRadius: 2,
                      margin: '12px 0',
                    }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  />
                )}
              </AnimatePresence>
            ))}
          </div>

          {/* Right column: Descriptions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1.3, maxWidth: 340 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1.5, textAlign: 'center', marginBottom: 4, textTransform: 'uppercase' }}>
              Descriptions
            </div>
            {shuffledDescs.map((p) => {
              const isMatched = matched[p.id]
              const isSelected = selectedRight === p.id
              const isWrong = wrongPair?.right === p.id
              return (
                <motion.div
                  key={p.id}
                  onClick={() => handleRightClick(p.id)}
                  animate={
                    isWrong
                      ? { x: [0, -8, 8, -8, 8, 0] }
                      : isMatched
                      ? { scale: [1, 1.06, 1] }
                      : {}
                  }
                  transition={isWrong ? { duration: 0.4 } : { duration: 0.3 }}
                  whileHover={!isMatched ? { scale: 1.03 } : {}}
                  whileTap={!isMatched ? { scale: 0.97 } : {}}
                  style={itemStyle(isMatched, isSelected, isWrong, matchColors[p.id])}
                >
                  {isMatched && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{ position: 'absolute', top: -8, right: -8, fontSize: 14 }}
                    >
                      {'✅'}
                    </motion.div>
                  )}
                  {p.desc}
                </motion.div>
              )
            })}
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center' }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            style={{ fontSize: 56, marginBottom: 16 }}
          >
            {'\u{1F3AF}'}
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            style={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              border: '4px solid #10b981',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              background: 'var(--bg-card)',
            }}
          >
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)' }}>
              {score}/{maxPossible}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {attempts} attempts
            </div>
          </motion.div>

          <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', marginBottom: 8 }}>
            All Matched!
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 4, fontSize: 14 }}>
            You know your Computer Vision applications. Great foundation!
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20, alignItems: 'center' }}>
            {PAIRS.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                style={{
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                  padding: '8px 16px',
                  borderRadius: 10,
                  background: `${matchColors[p.id]}12`,
                  border: `1px solid ${matchColors[p.id]}40`,
                  fontSize: 14,
                  maxWidth: 500,
                  width: '100%',
                }}
              >
                <span style={{ fontSize: 18 }}>{ICONS[p.id]}</span>
                <span style={{ fontWeight: 700, color: matchColors[p.id] }}>{p.app}</span>
                <span style={{ color: 'var(--text-muted)' }}>{'→'}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{p.desc}</span>
              </motion.div>
            ))}
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
