import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ================================================================
   QUIZ 2 — Container Match: Connect Concepts to Descriptions
   Format: Click-pair matching with animated connector lines
================================================================ */

const PAIRS = [
  { id: 'container', concept: 'Container', description: 'Running instance of an image' },
  { id: 'image', concept: 'Image', description: 'Read-only template' },
  { id: 'hub', concept: 'Docker Hub', description: 'Container registry' },
  { id: 'volume', concept: 'Volume', description: 'Persistent storage' },
  { id: 'dockerfile', concept: 'Dockerfile', description: 'Build instructions' },
  { id: 'layer', concept: 'Layer', description: 'Cached build step' },
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899']

export default function Quiz2_ContainerMatch({ onComplete }) {
  const [shuffledDescriptions] = useState(() => shuffle(PAIRS))
  const [selectedLeft, setSelectedLeft] = useState(null)
  const [selectedRight, setSelectedRight] = useState(null)
  const [matched, setMatched] = useState({}) // id -> true
  const [wrongPair, setWrongPair] = useState(null)
  const [matchColors, setMatchColors] = useState({}) // id -> color

  const allMatched = Object.keys(matched).length === PAIRS.length

  const handleLeftClick = (id) => {
    if (matched[id]) return
    setSelectedLeft(id)
    setWrongPair(null)

    if (selectedRight) {
      // Check match
      if (selectedRight === id) {
        const colorIdx = Object.keys(matched).length % COLORS.length
        setMatched((prev) => ({ ...prev, [id]: true }))
        setMatchColors((prev) => ({ ...prev, [id]: COLORS[colorIdx] }))
        setSelectedLeft(null)
        setSelectedRight(null)
      } else {
        setWrongPair({ left: id, right: selectedRight })
        setTimeout(() => {
          setWrongPair(null)
          setSelectedLeft(null)
          setSelectedRight(null)
        }, 700)
      }
    }
  }

  const handleRightClick = (id) => {
    if (matched[id]) return
    setSelectedRight(id)
    setWrongPair(null)

    if (selectedLeft) {
      if (selectedLeft === id) {
        const colorIdx = Object.keys(matched).length % COLORS.length
        setMatched((prev) => ({ ...prev, [id]: true }))
        setMatchColors((prev) => ({ ...prev, [id]: COLORS[colorIdx] }))
        setSelectedLeft(null)
        setSelectedRight(null)
      } else {
        setWrongPair({ left: selectedLeft, right: id })
        setTimeout(() => {
          setWrongPair(null)
          setSelectedLeft(null)
          setSelectedRight(null)
        }, 700)
      }
    }
  }

  const itemStyleBase = (isMatched, isSelected, isWrong, color) => ({
    padding: '14px 18px',
    borderRadius: 12,
    background: isMatched ? `${color}18` : isWrong ? '#ef444420' : isSelected ? 'var(--accent)15' : 'var(--bg-card)',
    border: `2px solid ${isMatched ? color : isWrong ? '#ef4444' : isSelected ? 'var(--accent)' : 'var(--border)'}`,
    color: isMatched ? color : 'var(--text-primary)',
    cursor: isMatched ? 'default' : 'pointer',
    fontSize: 15,
    fontWeight: 500,
    textAlign: 'center',
    userSelect: 'none',
    opacity: isMatched ? 0.85 : 1,
    position: 'relative',
  })

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
        Container Concept Match
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 8, fontSize: 14 }}
      >
        Click a concept on the left, then its matching description on the right.
      </motion.p>

      {/* Progress */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {Object.keys(matched).length} / {PAIRS.length} matched
        </span>
      </div>

      {!allMatched ? (
        <div style={{ display: 'flex', gap: 32, justifyContent: 'center' }}>
          {/* Left column: Concepts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, maxWidth: 220 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, textAlign: 'center', marginBottom: 4 }}>
              CONCEPTS
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
                      ? { scale: [1, 1.08, 1] }
                      : {}
                  }
                  transition={isWrong ? { duration: 0.4 } : { duration: 0.3 }}
                  whileHover={!isMatched ? { scale: 1.03 } : {}}
                  whileTap={!isMatched ? { scale: 0.97 } : {}}
                  style={itemStyleBase(isMatched, isSelected, isWrong, matchColors[p.id])}
                >
                  {isMatched && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{ position: 'absolute', top: -8, right: -8, fontSize: 16 }}
                    >
                      ✅
                    </motion.div>
                  )}
                  {p.concept}
                </motion.div>
              )
            })}
          </div>

          {/* Connection zone */}
          <div style={{ width: 60, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
            {PAIRS.map((p) => (
              <AnimatePresence key={p.id}>
                {matched[p.id] && (
                  <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    style={{
                      width: 40,
                      height: 3,
                      background: matchColors[p.id] || 'var(--accent)',
                      borderRadius: 2,
                      margin: '10px 0',
                    }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  />
                )}
              </AnimatePresence>
            ))}
          </div>

          {/* Right column: Descriptions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, maxWidth: 260 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, textAlign: 'center', marginBottom: 4 }}>
              DESCRIPTIONS
            </div>
            {shuffledDescriptions.map((p) => {
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
                      ? { scale: [1, 1.08, 1] }
                      : {}
                  }
                  transition={isWrong ? { duration: 0.4 } : { duration: 0.3 }}
                  whileHover={!isMatched ? { scale: 1.03 } : {}}
                  whileTap={!isMatched ? { scale: 0.97 } : {}}
                  style={itemStyleBase(isMatched, isSelected, isWrong, matchColors[p.id])}
                >
                  {isMatched && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{ position: 'absolute', top: -8, right: -8, fontSize: 16 }}
                    >
                      ✅
                    </motion.div>
                  )}
                  {p.description}
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
            🎯
          </motion.div>
          <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', marginBottom: 8 }}>
            All Matched!
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 4, fontSize: 14 }}>
            You connected all Docker concepts correctly.
          </p>

          {/* Show all pairs in summary */}
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
                }}
              >
                <span style={{ fontWeight: 700, color: matchColors[p.id] }}>{p.concept}</span>
                <span style={{ color: 'var(--text-muted)' }}> &rarr; </span>
                <span style={{ color: 'var(--text-secondary)' }}>{p.description}</span>
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
