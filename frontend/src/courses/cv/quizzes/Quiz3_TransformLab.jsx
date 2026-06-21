import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ================================================================
   QUIZ 3 — Transform Lab: Identify Preprocessing Techniques
   Format: 6 before/after pairs shown as styled divs,
   user drags the correct label onto each pair. 5/6 to pass.
================================================================ */

const TRANSFORMS = [
  {
    id: 'rot',
    label: 'Rotation',
    before: { background: 'linear-gradient(135deg, #3b82f6 30%, #8b5cf6 70%)', content: 'A' },
    after: { background: 'linear-gradient(135deg, #3b82f6 30%, #8b5cf6 70%)', content: 'A', transform: 'rotate(45deg)' },
    hint: 'The content is tilted at an angle',
  },
  {
    id: 'flip',
    label: 'Flip',
    before: { background: 'linear-gradient(to right, #ef4444 0%, #f59e0b 100%)', content: 'F', textAlign: 'left' },
    after: { background: 'linear-gradient(to left, #ef4444 0%, #f59e0b 100%)', content: 'F', transform: 'scaleX(-1)', textAlign: 'left' },
    hint: 'The image is mirrored horizontally',
  },
  {
    id: 'bright',
    label: 'Brightness',
    before: { background: '#555', content: '\u{2600}' },
    after: { background: '#bbb', content: '\u{2600}', filter: 'brightness(1.8)' },
    hint: 'Everything looks lighter/brighter',
  },
  {
    id: 'blur',
    label: 'Blur',
    before: { background: 'linear-gradient(45deg, #10b981, #06b6d4)', content: '\u{1F332}', fontSize: 32 },
    after: { background: 'linear-gradient(45deg, #10b981, #06b6d4)', content: '\u{1F332}', filter: 'blur(4px)', fontSize: 32 },
    hint: 'Details have become fuzzy and soft',
  },
  {
    id: 'crop',
    label: 'Crop',
    before: { background: 'linear-gradient(to bottom right, #ec4899, #8b5cf6)', content: '\u{1F5BC}', padding: 20 },
    after: { background: 'linear-gradient(to bottom right, #ec4899, #8b5cf6)', content: '\u{1F5BC}', clipPath: 'inset(20% 15% 10% 15%)', padding: 0 },
    hint: 'Part of the image has been cut away',
  },
  {
    id: 'norm',
    label: 'Normalize',
    before: { background: 'linear-gradient(to right, #222 0%, #333 30%, #444 70%, #555 100%)', content: 'N', color: '#777' },
    after: { background: 'linear-gradient(to right, #000 0%, #555 30%, #aaa 70%, #fff 100%)', content: 'N', color: '#eee' },
    hint: 'Contrast has been stretched to use the full range',
  },
]

const ALL_LABELS = ['Rotation', 'Flip', 'Brightness', 'Blur', 'Crop', 'Normalize']

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const PASS_SCORE = 5

export default function Quiz3_TransformLab({ onComplete }) {
  const [shuffledTransforms] = useState(() => shuffle(TRANSFORMS))
  const [answers, setAnswers] = useState({})
  const [draggedLabel, setDraggedLabel] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [hoveredTarget, setHoveredTarget] = useState(null)
  const [showHint, setShowHint] = useState(null)

  const usedLabels = Object.values(answers)

  const handleLabelClick = (label) => {
    if (submitted) return
    if (draggedLabel === label) {
      setDraggedLabel(null)
    } else {
      setDraggedLabel(label)
    }
  }

  const handleTargetClick = (transformId) => {
    if (submitted) return
    if (draggedLabel) {
      // If this target already had a label, free it
      const newAnswers = { ...answers }
      newAnswers[transformId] = draggedLabel
      setAnswers(newAnswers)
      setDraggedLabel(null)
    } else if (answers[transformId]) {
      // Remove existing answer
      const newAnswers = { ...answers }
      delete newAnswers[transformId]
      setAnswers(newAnswers)
    }
  }

  const handleSubmit = () => {
    let correct = 0
    shuffledTransforms.forEach((t) => {
      if (answers[t.id] === t.label) correct++
    })
    setScore(correct)
    setSubmitted(true)
  }

  const passed = submitted && score >= PASS_SCORE
  const allAnswered = Object.keys(answers).length === shuffledTransforms.length

  const renderImageBox = (config, label) => (
    <div style={{
      width: 90,
      height: 90,
      borderRadius: 10,
      background: config.background,
      display: 'flex',
      alignItems: 'center',
      justifyContent: config.textAlign === 'left' ? 'flex-start' : 'center',
      fontSize: config.fontSize || 28,
      fontWeight: 800,
      color: config.color || '#fff',
      overflow: 'hidden',
      position: 'relative',
      border: '1px solid var(--border)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      padding: config.padding !== undefined ? config.padding : 8,
    }}>
      <div style={{
        transform: config.transform || 'none',
        filter: config.filter || 'none',
        clipPath: config.clipPath || 'none',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: config.textAlign === 'left' ? 'flex-start' : 'center',
        paddingLeft: config.textAlign === 'left' ? 8 : 0,
      }}>
        {config.content}
      </div>
      <div style={{
        position: 'absolute',
        bottom: 2,
        right: 4,
        fontSize: 8,
        color: 'rgba(255,255,255,0.5)',
        fontWeight: 400,
      }}>
        {label}
      </div>
    </div>
  )

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
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
        Transform Lab
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 6, fontSize: 14 }}
      >
        Identify which preprocessing technique was applied to each image.
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: 20, fontSize: 12 }}
      >
        Click a label below, then click a pair to assign it. Score {PASS_SCORE}/6 to pass.
      </motion.p>

      {/* Progress bar */}
      <div style={{ height: 6, background: 'var(--bg-secondary)', borderRadius: 3, marginBottom: 24, overflow: 'hidden' }}>
        <motion.div
          animate={{ width: `${(Object.keys(answers).length / shuffledTransforms.length) * 100}%` }}
          style={{ height: '100%', background: 'var(--accent)', borderRadius: 3 }}
          transition={{ type: 'spring', stiffness: 120 }}
        />
      </div>

      {/* Label bank */}
      <div style={{
        display: 'flex',
        gap: 10,
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: 28,
        padding: '16px',
        borderRadius: 12,
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
      }}>
        <div style={{ width: '100%', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1.5, textTransform: 'uppercase', textAlign: 'center', marginBottom: 4 }}>
          Technique Labels
        </div>
        {ALL_LABELS.map((label) => {
          const isUsed = usedLabels.includes(label)
          const isSelected = draggedLabel === label
          return (
            <motion.div
              key={label}
              onClick={() => !isUsed && handleLabelClick(label)}
              whileHover={!isUsed ? { scale: 1.08 } : {}}
              whileTap={!isUsed ? { scale: 0.95 } : {}}
              animate={isSelected ? { scale: [1, 1.05, 1], borderColor: 'var(--accent)' } : {}}
              style={{
                padding: '8px 18px',
                borderRadius: 20,
                background: isUsed ? 'var(--bg-secondary)' : isSelected ? 'var(--accent)' : 'var(--bg-card)',
                color: isUsed ? 'var(--text-muted)' : isSelected ? '#fff' : 'var(--text-primary)',
                border: `2px solid ${isSelected ? 'var(--accent)' : isUsed ? 'transparent' : 'var(--border)'}`,
                fontSize: 13,
                fontWeight: 600,
                cursor: isUsed ? 'default' : 'pointer',
                opacity: isUsed ? 0.4 : 1,
                textDecoration: isUsed ? 'line-through' : 'none',
                userSelect: 'none',
              }}
            >
              {label}
            </motion.div>
          )
        })}
      </div>

      {/* Transform pairs grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300, 1fr))',
        gap: 16,
        marginBottom: 28,
      }}>
        {shuffledTransforms.map((t, idx) => {
          const answer = answers[t.id]
          const isCorrect = submitted && answer === t.label
          const isWrong = submitted && answer && answer !== t.label
          const isHovered = hoveredTarget === t.id && draggedLabel

          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.08 }}
              onClick={() => handleTargetClick(t.id)}
              onMouseEnter={() => setHoveredTarget(t.id)}
              onMouseLeave={() => setHoveredTarget(null)}
              style={{
                padding: 16,
                borderRadius: 14,
                background: isCorrect
                  ? '#10b98112'
                  : isWrong
                  ? '#ef444412'
                  : isHovered
                  ? 'rgba(99,102,241,0.08)'
                  : 'var(--bg-card)',
                border: `2px solid ${
                  isCorrect ? '#10b981' : isWrong ? '#ef4444' : isHovered ? 'var(--accent)' : 'var(--border)'
                }`,
                cursor: submitted ? 'default' : draggedLabel ? 'pointer' : 'default',
                transition: 'all 0.2s',
                position: 'relative',
              }}
            >
              {/* Pair number */}
              <div style={{
                position: 'absolute',
                top: 8,
                left: 12,
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--text-muted)',
                background: 'var(--bg-secondary)',
                padding: '2px 8px',
                borderRadius: 6,
              }}>
                #{idx + 1}
              </div>

              {/* Hint button */}
              {!submitted && (
                <motion.div
                  onClick={(e) => { e.stopPropagation(); setShowHint(showHint === t.id ? null : t.id) }}
                  whileHover={{ scale: 1.2 }}
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 12,
                    fontSize: 14,
                    cursor: 'pointer',
                    opacity: 0.6,
                  }}
                >
                  {'\u{1F4A1}'}
                </motion.div>
              )}

              {/* Before / After boxes */}
              <div style={{
                display: 'flex',
                gap: 12,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 20,
                marginBottom: 12,
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600, letterSpacing: 1 }}>BEFORE</div>
                  {renderImageBox(t.before, 'before')}
                </div>
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ fontSize: 20, color: 'var(--text-muted)' }}
                >
                  {'\u{27A1}'}
                </motion.div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600, letterSpacing: 1 }}>AFTER</div>
                  {renderImageBox(t.after, 'after')}
                </div>
              </div>

              {/* Hint */}
              <AnimatePresence>
                {showHint === t.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{
                      fontSize: 12,
                      color: 'var(--text-muted)',
                      textAlign: 'center',
                      padding: '4px 0',
                      fontStyle: 'italic',
                    }}
                  >
                    {'\u{1F4A1}'} {t.hint}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Answer slot */}
              <div style={{
                marginTop: 8,
                padding: '8px 12px',
                borderRadius: 8,
                background: answer
                  ? (isCorrect ? '#10b98120' : isWrong ? '#ef444420' : 'rgba(99,102,241,0.1)')
                  : 'var(--bg-secondary)',
                border: `1px dashed ${answer ? (isCorrect ? '#10b981' : isWrong ? '#ef4444' : 'var(--accent)') : 'var(--border)'}`,
                textAlign: 'center',
                fontSize: 14,
                fontWeight: 600,
                color: answer ? (isCorrect ? '#10b981' : isWrong ? '#ef4444' : 'var(--text-primary)') : 'var(--text-muted)',
                minHeight: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}>
                {answer ? (
                  <>
                    {submitted && isCorrect && '✅'}
                    {submitted && isWrong && '❌'}
                    {answer}
                    {submitted && isWrong && (
                      <span style={{ fontSize: 12, color: '#10b981', marginLeft: 8 }}>
                        (correct: {t.label})
                      </span>
                    )}
                  </>
                ) : (
                  draggedLabel ? 'Click to assign' : 'Select a label first'
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Submit / Result */}
      {!submitted ? (
        <div style={{ textAlign: 'center' }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={!allAnswered}
            style={{
              padding: '12px 32px',
              background: allAnswered ? 'var(--accent)' : 'var(--bg-secondary)',
              color: allAnswered ? '#fff' : 'var(--text-muted)',
              border: 'none',
              borderRadius: 10,
              fontSize: 16,
              fontWeight: 700,
              cursor: allAnswered ? 'pointer' : 'not-allowed',
              fontFamily: 'var(--font-heading)',
            }}
          >
            Check Answers
          </motion.button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center' }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            style={{
              width: 110,
              height: 110,
              borderRadius: '50%',
              border: `4px solid ${passed ? '#10b981' : '#f59e0b'}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              background: 'var(--bg-card)',
            }}
          >
            <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--text-primary)' }}>
              {score}/{shuffledTransforms.length}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {Math.round((score / shuffledTransforms.length) * 100)}%
            </div>
          </motion.div>

          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
            {passed
              ? 'Excellent! You can identify image preprocessing techniques.'
              : 'Almost! Review the transforms and try again.'}
          </p>

          {passed ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onComplete()}
              style={{
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
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSubmitted(false)
                setScore(0)
                setAnswers({})
                setDraggedLabel(null)
              }}
              style={{
                padding: '10px 24px',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Try Again
            </motion.button>
          )}
        </motion.div>
      )}
    </div>
  )
}
