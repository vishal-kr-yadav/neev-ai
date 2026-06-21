import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/*
  QUIZ: Production Ready — Rapid-fire True/False
  10 Docker best-practice statements. User swipes/clicks True or False.
  Cards animate out with swipe effect. Score shown at end.
*/

const STATEMENTS = [
  { text: 'Always use the :latest tag in production', answer: false, explanation: 'Pin specific versions for reproducibility.' },
  { text: 'Multi-stage builds reduce image size', answer: true, explanation: 'They discard build dependencies in the final image.' },
  { text: 'Run containers as root for best performance', answer: false, explanation: 'Running as non-root is a security best practice.' },
  { text: 'Use health checks in production containers', answer: true, explanation: 'Health checks help orchestrators detect and replace unhealthy containers.' },
  { text: 'Store secrets in environment variables inside Dockerfiles', answer: false, explanation: 'Use Docker secrets or a vault, never bake secrets into images.' },
  { text: 'Use .dockerignore to keep images small', answer: true, explanation: 'It prevents unnecessary files from being sent to the build context.' },
  { text: 'One process per container is a best practice', answer: true, explanation: 'It simplifies logging, scaling, and lifecycle management.' },
  { text: 'Docker containers are automatically secure by default', answer: false, explanation: 'Containers share the host kernel — proper config is needed.' },
  { text: 'Alpine-based images are smaller than Ubuntu-based', answer: true, explanation: 'Alpine is ~5MB vs Ubuntu at ~70MB+.' },
  { text: 'You should always use docker-compose in production', answer: false, explanation: 'Kubernetes or Docker Swarm are better suited for production orchestration.' },
]

export default function Quiz8_ProductionReady({ onComplete }) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState([])
  const [exitDir, setExitDir] = useState(0)
  const [showFeedback, setShowFeedback] = useState(null)
  const [done, setDone] = useState(false)
  const [dragX, setDragX] = useState(0)

  const current = STATEMENTS[currentIdx]

  const handleAnswer = (userAnswer) => {
    if (showFeedback || done) return

    const isCorrect = userAnswer === current.answer
    if (isCorrect) setScore((s) => s + 1)

    setExitDir(userAnswer ? 1 : -1)
    setAnswers((prev) => [...prev, { ...current, userAnswer, isCorrect }])
    setShowFeedback({ isCorrect, explanation: current.explanation })

    setTimeout(() => {
      const nextIdx = currentIdx + 1
      if (nextIdx >= STATEMENTS.length) {
        setDone(true)
        onComplete()
      } else {
        setCurrentIdx(nextIdx)
      }
      setShowFeedback(null)
      setDragX(0)
    }, 1200)
  }

  const getSwipeHint = () => {
    if (dragX > 40) return { text: 'TRUE', color: '#10b981' }
    if (dragX < -40) return { text: 'FALSE', color: '#ef4444' }
    return null
  }

  const swipeHint = getSwipeHint()

  return (
    <div>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, marginBottom: 8 }}>
        Production Ready?
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
        Docker best practices rapid fire! Swipe right or click True / False.
      </p>

      {!done ? (
        <>
          {/* Score tracker */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 20, fontSize: 13, color: 'var(--text-muted)',
          }}>
            <span>Question {currentIdx + 1} of {STATEMENTS.length}</span>
            <span style={{ color: '#10b981', fontWeight: 600 }}>Score: {score}</span>
          </div>

          {/* Card area */}
          <div style={{ position: 'relative', minHeight: 240, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {/* Background label hints */}
            <div style={{
              position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
              fontSize: 14, fontWeight: 700, color: 'rgba(239,68,68,0.15)', userSelect: 'none',
            }}>
              FALSE
            </div>
            <div style={{
              position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
              fontSize: 14, fontWeight: 700, color: 'rgba(16,185,129,0.15)', userSelect: 'none',
            }}>
              TRUE
            </div>

            <AnimatePresence mode="wait">
              {!showFeedback && current && (
                <motion.div
                  key={currentIdx}
                  initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, x: exitDir * 300, rotate: exitDir * 20 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.8}
                  onDrag={(_, info) => setDragX(info.offset.x)}
                  onDragEnd={(_, info) => {
                    if (info.offset.x > 80) handleAnswer(true)
                    else if (info.offset.x < -80) handleAnswer(false)
                    else setDragX(0)
                  }}
                  style={{
                    width: '100%', maxWidth: 400, padding: '32px 28px',
                    borderRadius: 20, background: 'var(--bg-card)',
                    border: `2px solid ${swipeHint ? swipeHint.color : 'var(--border)'}`,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    textAlign: 'center', cursor: 'grab', userSelect: 'none',
                    position: 'relative',
                  }}
                >
                  {/* Swipe overlay label */}
                  {swipeHint && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{
                        position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
                        padding: '4px 16px', borderRadius: 8,
                        background: swipeHint.color, color: '#fff',
                        fontSize: 14, fontWeight: 700, letterSpacing: 2,
                      }}
                    >
                      {swipeHint.text}
                    </motion.div>
                  )}

                  <div style={{ fontSize: 32, marginBottom: 16 }}>&#x1f433;</div>
                  <div style={{
                    fontSize: 18, fontWeight: 600, color: 'var(--text-primary)',
                    lineHeight: 1.5,
                  }}>
                    "{current.text}"
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 16 }}>
                    Swipe or use buttons below
                  </div>
                </motion.div>
              )}

              {/* Feedback overlay */}
              {showFeedback && (
                <motion.div
                  key="feedback"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    width: '100%', maxWidth: 400, padding: '28px 24px',
                    borderRadius: 20,
                    background: showFeedback.isCorrect ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                    border: `2px solid ${showFeedback.isCorrect ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 36, marginBottom: 8 }}>
                    {showFeedback.isCorrect ? '✓' : '✗'}
                  </div>
                  <div style={{
                    fontSize: 18, fontWeight: 700, marginBottom: 8,
                    color: showFeedback.isCorrect ? '#10b981' : '#ef4444',
                  }}>
                    {showFeedback.isCorrect ? 'Correct!' : 'Wrong!'}
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {showFeedback.explanation}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* True / False buttons */}
          {!showFeedback && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 24 }}>
              <motion.button
                whileHover={{ scale: 1.06, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAnswer(false)}
                style={{
                  padding: '14px 36px', borderRadius: 14, border: '2px solid rgba(239,68,68,0.3)',
                  background: 'rgba(239,68,68,0.06)', color: '#ef4444',
                  cursor: 'pointer', fontSize: 16, fontWeight: 700,
                }}
              >
                &#x2717; False
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.06, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAnswer(true)}
                style={{
                  padding: '14px 36px', borderRadius: 14, border: '2px solid rgba(16,185,129,0.3)',
                  background: 'rgba(16,185,129,0.06)', color: '#10b981',
                  cursor: 'pointer', fontSize: 16, fontWeight: 700,
                }}
              >
                &#x2713; True
              </motion.button>
            </div>
          )}
        </>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          {/* Score display */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>
              {score >= 8 ? '🏆' : score >= 5 ? '👍' : '📚'}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#10b981', marginBottom: 4 }}>
              {score}/{STATEMENTS.length}
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              {score === STATEMENTS.length
                ? 'Perfect! You\'re production-ready!'
                : score >= 7
                  ? 'Great job! Almost there!'
                  : 'Review Docker best practices and try again!'}
            </div>
          </div>

          {/* Answer review */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {answers.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', borderRadius: 10,
                  background: a.isCorrect ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
                  border: `1px solid ${a.isCorrect ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                }}
              >
                <span style={{
                  fontSize: 16, fontWeight: 700,
                  color: a.isCorrect ? '#10b981' : '#ef4444',
                  minWidth: 20, textAlign: 'center',
                }}>
                  {a.isCorrect ? '✓' : '✗'}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{a.text}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    Answer: {a.answer ? 'True' : 'False'}
                    {!a.isCorrect && ` — ${a.explanation}`}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Progress */}
      <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, height: 6, background: 'var(--bg-secondary)', borderRadius: 3, overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${((done ? STATEMENTS.length : currentIdx) / STATEMENTS.length) * 100}%` }}
            style={{ height: '100%', background: 'var(--accent)', borderRadius: 3 }}
          />
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {done ? STATEMENTS.length : currentIdx}/{STATEMENTS.length}
        </span>
      </div>
    </div>
  )
}
