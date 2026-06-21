import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/*
  QUIZ 5 — Detector Match: Speed Sorting Game
  Conveyor belt with steel sheet cards scrolling by. User sorts each card
  into the correct YOLO output bin (Scratch, Crack, Pit, Good).
  15 cards in 30 seconds. Score 12+ to pass.
*/

const DEFECT_CARDS = [
  { id: 1, description: 'Long thin mark along rolling direction', answer: 'Scratch', pattern: 'linear-gradient(5deg, transparent 45%, rgba(239,68,68,0.4) 45%, rgba(239,68,68,0.4) 46%, transparent 46%)' },
  { id: 2, description: 'Branching fracture near edge', answer: 'Crack', pattern: 'linear-gradient(30deg, transparent 48%, rgba(251,146,60,0.5) 48%, rgba(251,146,60,0.5) 49%, transparent 49%), linear-gradient(50deg, transparent 52%, rgba(251,146,60,0.4) 52%, rgba(251,146,60,0.4) 53%, transparent 53%)' },
  { id: 3, description: 'Small circular depression on surface', answer: 'Pit', pattern: 'radial-gradient(circle at 55% 50%, rgba(168,85,247,0.5) 4px, transparent 5px)' },
  { id: 4, description: 'Uniform smooth surface, no anomalies', answer: 'Good', pattern: 'none' },
  { id: 5, description: 'Parallel grooves from abrasion', answer: 'Scratch', pattern: 'linear-gradient(2deg, transparent 30%, rgba(239,68,68,0.3) 30%, rgba(239,68,68,0.3) 31%, transparent 31%), linear-gradient(4deg, transparent 60%, rgba(239,68,68,0.3) 60%, rgba(239,68,68,0.3) 61%, transparent 61%)' },
  { id: 6, description: 'Jagged line propagating from corner', answer: 'Crack', pattern: 'linear-gradient(135deg, rgba(251,146,60,0.6) 0%, transparent 3%), linear-gradient(140deg, transparent 10%, rgba(251,146,60,0.4) 10%, rgba(251,146,60,0.4) 11%, transparent 11%)' },
  { id: 7, description: 'Cluster of small holes', answer: 'Pit', pattern: 'radial-gradient(circle at 40% 40%, rgba(168,85,247,0.5) 3px, transparent 4px), radial-gradient(circle at 60% 55%, rgba(168,85,247,0.4) 3px, transparent 4px), radial-gradient(circle at 50% 65%, rgba(168,85,247,0.45) 2px, transparent 3px)' },
  { id: 8, description: 'Clean inspection — production standard met', answer: 'Good', pattern: 'none' },
  { id: 9, description: 'Diagonal scoring across width', answer: 'Scratch', pattern: 'linear-gradient(45deg, transparent 47%, rgba(239,68,68,0.5) 47%, rgba(239,68,68,0.5) 48%, transparent 48%)' },
  { id: 10, description: 'V-shaped fracture at stress point', answer: 'Crack', pattern: 'linear-gradient(60deg, transparent 46%, rgba(251,146,60,0.5) 46%, rgba(251,146,60,0.5) 47%, transparent 47%), linear-gradient(-60deg, transparent 46%, rgba(251,146,60,0.5) 46%, rgba(251,146,60,0.5) 47%, transparent 47%)' },
  { id: 11, description: 'Isolated deep pockmark center-surface', answer: 'Pit', pattern: 'radial-gradient(circle at 50% 50%, rgba(168,85,247,0.6) 6px, transparent 7px)' },
  { id: 12, description: 'Micro-scratches from handling', answer: 'Scratch', pattern: 'linear-gradient(10deg, transparent 35%, rgba(239,68,68,0.25) 35%, rgba(239,68,68,0.25) 36%, transparent 36%), linear-gradient(-5deg, transparent 55%, rgba(239,68,68,0.2) 55%, rgba(239,68,68,0.2) 56%, transparent 56%), linear-gradient(15deg, transparent 70%, rgba(239,68,68,0.25) 70%, rgba(239,68,68,0.25) 71%, transparent 71%)' },
  { id: 13, description: 'No visible defects detected', answer: 'Good', pattern: 'none' },
  { id: 14, description: 'Hairline crack along grain boundary', answer: 'Crack', pattern: 'linear-gradient(88deg, transparent 49%, rgba(251,146,60,0.45) 49%, rgba(251,146,60,0.45) 49.5%, transparent 49.5%)' },
  { id: 15, description: 'Multiple pitting from corrosion', answer: 'Pit', pattern: 'radial-gradient(circle at 30% 35%, rgba(168,85,247,0.4) 2px, transparent 3px), radial-gradient(circle at 55% 45%, rgba(168,85,247,0.5) 3px, transparent 4px), radial-gradient(circle at 70% 60%, rgba(168,85,247,0.4) 2px, transparent 3px), radial-gradient(circle at 45% 70%, rgba(168,85,247,0.45) 2px, transparent 3px)' },
]

const BINS = [
  { label: 'Scratch', color: '#ef4444', icon: '∕' },
  { label: 'Crack', color: '#fb923c', icon: '⚡' },
  { label: 'Pit', color: '#a855f7', icon: '○' },
  { label: 'Good', color: '#10b981', icon: '✓' },
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function Quiz5_DetectorMatch({ onComplete }) {
  const [cards] = useState(() => shuffle(DEFECT_CARDS))
  const [currentIdx, setCurrentIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [started, setStarted] = useState(false)
  const [done, setDone] = useState(false)
  const [flyAnim, setFlyAnim] = useState(null) // { binIdx, correct }
  const [timerRef] = useState({ current: null })

  const startGame = () => {
    setStarted(true)
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          setDone(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleBinClick = (binLabel, binIdx) => {
    if (!started || done || flyAnim || currentIdx >= cards.length) return

    const card = cards[currentIdx]
    const correct = card.answer === binLabel

    if (correct) {
      setScore((s) => s + 1)
      setStreak((s) => {
        const newStreak = s + 1
        setBestStreak((b) => Math.max(b, newStreak))
        return newStreak
      })
    } else {
      setStreak(0)
    }

    setFlyAnim({ binIdx, correct })

    setTimeout(() => {
      setFlyAnim(null)
      const nextIdx = currentIdx + 1
      if (nextIdx >= cards.length) {
        clearInterval(timerRef.current)
        setDone(true)
        if (correct ? score + 1 >= 12 : score >= 12) {
          // Pass threshold check handled in done screen
        }
      } else {
        setCurrentIdx(nextIdx)
      }
    }, 400)
  }

  const passed = score >= 12
  const card = cards[currentIdx]

  return (
    <div>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, marginBottom: 8 }}>
        Detector Match
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
        Sort steel defect cards into the correct YOLO output bins. 12/15 to pass in 30 seconds!
      </p>

      {!started && !done && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', padding: '40px 20px' }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>{'\u{1F3ED}'}</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
            Conveyor Belt Challenge
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8, maxWidth: 400, margin: '0 auto 24px' }}>
            Steel sheets will appear on the conveyor belt. Read the defect description and quickly sort each one into the correct bin. You have 30 seconds for 15 cards.
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
            style={{
              padding: '14px 40px', borderRadius: 12, border: 'none',
              background: 'var(--gradient-primary)', color: '#fff',
              cursor: 'pointer', fontSize: 16, fontWeight: 700,
              fontFamily: 'var(--font-heading)',
            }}
          >
            Start Sorting
          </motion.button>
        </motion.div>
      )}

      {started && !done && (
        <>
          {/* Stats bar */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 16, padding: '10px 16px', borderRadius: 12,
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', gap: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Score</div>
                <motion.div
                  key={score}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  style={{ fontSize: 20, fontWeight: 700, color: '#10b981' }}
                >
                  {score}
                </motion.div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Streak</div>
                <motion.div
                  key={streak}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  style={{ fontSize: 20, fontWeight: 700, color: streak >= 3 ? '#f59e0b' : 'var(--text-primary)' }}
                >
                  {streak}{streak >= 3 ? '\u{1F525}' : ''}
                </motion.div>
              </div>
            </div>

            {/* Timer */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Time</div>
              <motion.div
                animate={{ color: timeLeft <= 10 ? '#ef4444' : timeLeft <= 20 ? '#f59e0b' : 'var(--text-primary)' }}
                style={{ fontSize: 20, fontWeight: 700, fontFamily: 'monospace' }}
              >
                {timeLeft}s
              </motion.div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Card</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
                {currentIdx + 1}/{cards.length}
              </div>
            </div>
          </div>

          {/* Conveyor belt */}
          <div style={{
            position: 'relative', overflow: 'hidden', borderRadius: 16,
            background: 'repeating-linear-gradient(90deg, rgba(100,100,100,0.08) 0px, rgba(100,100,100,0.08) 20px, transparent 20px, transparent 40px)',
            border: '2px solid var(--border)', padding: '24px 20px',
            minHeight: 160, marginBottom: 20,
          }}>
            {/* Belt roller indicators */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: 8,
              background: 'linear-gradient(90deg, rgba(100,100,100,0.2) 0%, rgba(100,100,100,0.1) 50%, rgba(100,100,100,0.2) 100%)',
            }} />

            <AnimatePresence mode="wait">
              {card && !flyAnim && (
                <motion.div
                  key={card.id}
                  initial={{ x: 300, opacity: 0, rotate: 3 }}
                  animate={{ x: 0, opacity: 1, rotate: 0 }}
                  exit={flyAnim ? { y: 100, opacity: 0, scale: 0.5 } : { x: -300, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  style={{
                    padding: '20px 24px', borderRadius: 14,
                    background: 'var(--bg-card)', border: '2px solid var(--border)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    position: 'relative',
                  }}
                >
                  {/* Steel surface visual */}
                  <div style={{
                    width: '100%', height: 60, borderRadius: 8, marginBottom: 12,
                    background: `${card.pattern}, linear-gradient(135deg, #94a3b8 0%, #cbd5e1 50%, #94a3b8 100%)`,
                    border: '1px solid rgba(148,163,184,0.3)',
                  }} />
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                    Steel Sheet #{card.id}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {card.description}
                  </div>
                </motion.div>
              )}

              {flyAnim && (
                <motion.div
                  key="flying"
                  initial={{ scale: 1, opacity: 1 }}
                  animate={{
                    scale: 0.3,
                    opacity: 0,
                    y: 80,
                    x: (flyAnim.binIdx - 1.5) * 80,
                  }}
                  transition={{ duration: 0.35 }}
                  style={{
                    padding: '20px 24px', borderRadius: 14,
                    background: flyAnim.correct ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                    border: `2px solid ${flyAnim.correct ? '#10b981' : '#ef4444'}`,
                    textAlign: 'center',
                  }}
                >
                  <div style={{
                    fontSize: 28, fontWeight: 700,
                    color: flyAnim.correct ? '#10b981' : '#ef4444',
                  }}>
                    {flyAnim.correct ? '✓' : '✗'}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sorting bins */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            {BINS.map((bin, idx) => (
              <motion.button
                key={bin.label}
                whileHover={{ scale: 1.06, y: -4 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleBinClick(bin.label, idx)}
                style={{
                  flex: 1, maxWidth: 140, padding: '16px 8px', borderRadius: 14,
                  border: `2px solid ${bin.color}40`,
                  background: `${bin.color}10`,
                  cursor: 'pointer', textAlign: 'center',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                }}
              >
                <div style={{ fontSize: 22 }}>{bin.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: bin.color, letterSpacing: 0.5 }}>
                  {bin.label}
                </div>
              </motion.button>
            ))}
          </div>
        </>
      )}

      {done && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center' }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            style={{ fontSize: 56, marginBottom: 16 }}
          >
            {passed ? '\u{1F3AF}' : '\u{1F504}'}
          </motion.div>

          <div style={{
            fontSize: 24, fontWeight: 700, marginBottom: 8,
            color: passed ? '#10b981' : '#ef4444',
            fontFamily: 'var(--font-heading)',
          }}>
            {score}/{cards.length} Sorted Correctly
          </div>

          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
            {passed
              ? `Excellent sorting! Best streak: ${bestStreak}. You're ready for the production line.`
              : `Need 12+ to pass. Best streak: ${bestStreak}. Try again!`}
          </div>

          {/* Performance breakdown */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
            marginBottom: 24,
          }}>
            {[
              { label: 'Accuracy', value: `${Math.round((score / cards.length) * 100)}%`, color: '#10b981' },
              { label: 'Best Streak', value: bestStreak, color: '#f59e0b' },
              { label: 'Time Used', value: `${30 - timeLeft}s`, color: '#3b82f6' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                style={{
                  padding: '14px 12px', borderRadius: 12,
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: stat.color }}>
                  {stat.value}
                </div>
              </motion.div>
            ))}
          </div>

          {passed && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onComplete()}
              style={{
                padding: '12px 32px', borderRadius: 12, border: 'none',
                background: 'var(--gradient-primary)', color: '#fff',
                cursor: 'pointer', fontSize: 16, fontWeight: 700,
                fontFamily: 'var(--font-heading)',
              }}
            >
              Continue
            </motion.button>
          )}

          {!passed && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setCurrentIdx(0)
                setScore(0)
                setStreak(0)
                setBestStreak(0)
                setTimeLeft(30)
                setStarted(false)
                setDone(false)
                setFlyAnim(null)
              }}
              style={{
                padding: '12px 32px', borderRadius: 12, border: 'none',
                background: 'var(--accent)', color: '#fff',
                cursor: 'pointer', fontSize: 16, fontWeight: 700,
                fontFamily: 'var(--font-heading)',
              }}
            >
              Try Again
            </motion.button>
          )}
        </motion.div>
      )}

      {/* Progress bar */}
      <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, height: 6, background: 'var(--bg-secondary)', borderRadius: 3, overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${((done ? cards.length : currentIdx) / cards.length) * 100}%` }}
            style={{ height: '100%', background: 'var(--accent)', borderRadius: 3 }}
          />
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {done ? cards.length : currentIdx}/{cards.length}
        </span>
      </div>
    </div>
  )
}
