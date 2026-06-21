import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ================================================================
   QUIZ 4 — Filter Builder: Build Convolution Kernels
   Format: Fill a 3x3 kernel matrix to match target filters.
   Challenge 1: Edge detection (horizontal Sobel-like)
   Challenge 2: Sharpen filter
   Live preview of the filter effect updates as user changes values.
================================================================ */

const CHALLENGES = [
  {
    id: 'edge',
    title: 'Edge Detection Filter',
    description: 'Build a horizontal edge detection kernel. Top row detects light-to-dark transitions, bottom row detects dark-to-light.',
    hint: 'Top row should be all -1, middle row all 0, bottom row all +1',
    target: [[-1, -1, -1], [0, 0, 0], [1, 1, 1]],
    allowedValues: [-1, 0, 1, 2],
  },
  {
    id: 'sharpen',
    title: 'Sharpen Filter',
    description: 'Build a sharpening kernel. It enhances edges by subtracting surrounding pixels and amplifying the center.',
    hint: 'Center = 5, direct neighbors = -1, corners = 0',
    target: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]],
    allowedValues: [-1, 0, 1, 2, 5],
  },
]

// Simulated 5x5 grayscale image for preview
const SAMPLE_IMAGE = [
  [180, 180, 180, 180, 180],
  [180, 180, 60, 180, 180],
  [180, 60, 60, 60, 180],
  [180, 180, 60, 180, 180],
  [180, 180, 180, 180, 180],
]

function applyKernel(image, kernel) {
  const rows = image.length
  const cols = image[0].length
  const result = []
  for (let r = 1; r < rows - 1; r++) {
    const row = []
    for (let c = 1; c < cols - 1; c++) {
      let sum = 0
      for (let kr = -1; kr <= 1; kr++) {
        for (let kc = -1; kc <= 1; kc++) {
          sum += image[r + kr][c + kc] * kernel[kr + 1][kc + 1]
        }
      }
      // Clamp to 0-255
      row.push(Math.max(0, Math.min(255, Math.round(sum))))
    }
    result.push(row)
  }
  return result
}

function kernelMatches(kernel, target) {
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (kernel[r][c] !== target[r][c]) return false
    }
  }
  return true
}

function kernelCellCorrect(val, target) {
  return val !== '' && Number(val) === target
}

export default function Quiz4_FilterBuilder({ onComplete }) {
  const [challengeIdx, setChallengeIdx] = useState(0)
  const [kernel, setKernel] = useState(() => Array(3).fill(null).map(() => Array(3).fill('')))
  const [selectedCell, setSelectedCell] = useState(null)
  const [completedChallenges, setCompletedChallenges] = useState([])
  const [showSuccess, setShowSuccess] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [allDone, setAllDone] = useState(false)

  const challenge = CHALLENGES[challengeIdx]

  // Convert kernel to numbers for preview
  const numericKernel = kernel.map((row) => row.map((v) => (v === '' ? 0 : Number(v))))
  const preview = applyKernel(SAMPLE_IMAGE, numericKernel)
  const targetPreview = applyKernel(SAMPLE_IMAGE, challenge.target)

  const isMatch = kernel.every((row) => row.every((v) => v !== '')) && kernelMatches(numericKernel, challenge.target)

  const handleValueSelect = (value) => {
    if (!selectedCell) return
    const newKernel = kernel.map((row) => [...row])
    newKernel[selectedCell.r][selectedCell.c] = value
    setKernel(newKernel)

    // Check after placing value
    const updatedNumeric = newKernel.map((row) => row.map((v) => (v === '' ? 0 : Number(v))))
    const allFilled = newKernel.every((row) => row.every((v) => v !== ''))
    if (allFilled && kernelMatches(updatedNumeric, challenge.target)) {
      setShowSuccess(true)
      setTimeout(() => {
        const newCompleted = [...completedChallenges, challenge.id]
        setCompletedChallenges(newCompleted)
        if (challengeIdx < CHALLENGES.length - 1) {
          setChallengeIdx(challengeIdx + 1)
          setKernel(Array(3).fill(null).map(() => Array(3).fill('')))
          setSelectedCell(null)
          setShowSuccess(false)
          setShowHint(false)
        } else {
          setAllDone(true)
        }
      }, 1800)
    }
  }

  const handleCellClick = (r, c) => {
    if (showSuccess) return
    setSelectedCell({ r, c })
  }

  const handleClear = () => {
    setKernel(Array(3).fill(null).map(() => Array(3).fill('')))
    setSelectedCell(null)
    setShowHint(false)
  }

  const filledCount = kernel.flat().filter((v) => v !== '').length

  return (
    <div style={{ padding: 24, maxWidth: 750, margin: '0 auto' }}>
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
        Filter Builder
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 20, fontSize: 14 }}
      >
        Build convolution kernels by filling in the 3x3 matrix. Watch the filter effect in real time!
      </motion.p>

      {/* Challenge progress */}
      <div style={{
        display: 'flex',
        gap: 12,
        justifyContent: 'center',
        marginBottom: 24,
      }}>
        {CHALLENGES.map((ch, i) => (
          <motion.div
            key={ch.id}
            animate={challengeIdx === i ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 0.6, repeat: challengeIdx === i ? Infinity : 0, repeatType: 'reverse' }}
            style={{
              padding: '8px 20px',
              borderRadius: 20,
              background: completedChallenges.includes(ch.id)
                ? '#10b98120'
                : challengeIdx === i
                ? 'var(--accent)'
                : 'var(--bg-secondary)',
              color: completedChallenges.includes(ch.id)
                ? '#10b981'
                : challengeIdx === i
                ? '#fff'
                : 'var(--text-muted)',
              border: `2px solid ${
                completedChallenges.includes(ch.id) ? '#10b981' : challengeIdx === i ? 'var(--accent)' : 'var(--border)'
              }`,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {completedChallenges.includes(ch.id) ? '✅ ' : ''}
            Challenge {i + 1}
          </motion.div>
        ))}
      </div>

      {!allDone ? (
        <>
          {/* Challenge description */}
          <AnimatePresence mode="wait">
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              style={{
                padding: 16,
                borderRadius: 12,
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                marginBottom: 24,
                textAlign: 'center',
              }}
            >
              <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: 6, fontSize: 18 }}>
                {challenge.title}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 8 }}>
                {challenge.description}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowHint(!showHint)}
                style={{
                  padding: '4px 14px',
                  borderRadius: 6,
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                {showHint ? 'Hide Hint' : 'Show Hint'}
              </motion.button>
              <AnimatePresence>
                {showHint && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ color: 'var(--accent)', fontSize: 13, marginTop: 8, fontStyle: 'italic' }}
                  >
                    {'\u{1F4A1}'} {challenge.hint}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>

          <div style={{ display: 'flex', gap: 32, justifyContent: 'center', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Kernel matrix */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1.5, textTransform: 'uppercase', textAlign: 'center', marginBottom: 10 }}>
                Your Kernel
              </div>
              <motion.div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 4,
                  padding: 10,
                  borderRadius: 12,
                  background: 'var(--bg-secondary)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                }}
              >
                {kernel.map((row, r) =>
                  row.map((val, c) => {
                    const isSelected = selectedCell?.r === r && selectedCell?.c === c
                    const isCorrect = val !== '' && kernelCellCorrect(val, challenge.target[r][c])
                    const isFilled = val !== ''

                    return (
                      <motion.div
                        key={`${r}-${c}`}
                        onClick={() => handleCellClick(r, c)}
                        whileHover={!showSuccess ? { scale: 1.08 } : {}}
                        whileTap={!showSuccess ? { scale: 0.95 } : {}}
                        animate={
                          showSuccess && isCorrect
                            ? { scale: [1, 1.15, 1], borderColor: '#10b981' }
                            : {}
                        }
                        transition={showSuccess ? { delay: r * 0.1 + c * 0.1 } : {}}
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: 8,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 22,
                          fontWeight: 700,
                          cursor: showSuccess ? 'default' : 'pointer',
                          background: showSuccess && isCorrect
                            ? '#10b98118'
                            : isFilled
                            ? 'var(--bg-card)'
                            : 'var(--bg-card)',
                          border: `2px solid ${
                            showSuccess && isCorrect
                              ? '#10b981'
                              : isSelected
                              ? 'var(--accent)'
                              : isFilled
                              ? '#3b82f6'
                              : 'var(--border)'
                          }`,
                          color: val < 0 ? '#ef4444' : val > 1 ? '#8b5cf6' : 'var(--text-primary)',
                          boxShadow: isSelected ? '0 0 0 3px rgba(99,102,241,0.3)' : 'none',
                          transition: 'all 0.2s',
                        }}
                      >
                        {val !== '' ? val : (
                          <span style={{ opacity: 0.3, fontSize: 18 }}>?</span>
                        )}
                      </motion.div>
                    )
                  })
                )}
              </motion.div>

              {/* Value buttons */}
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>
                  {selectedCell ? `Cell (${selectedCell.r}, ${selectedCell.c}) — pick a value:` : 'Click a cell first'}
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                  {challenge.allowedValues.map((v) => (
                    <motion.button
                      key={v}
                      onClick={() => handleValueSelect(v)}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      disabled={!selectedCell || showSuccess}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        border: '2px solid var(--border)',
                        background: v < 0 ? '#ef444420' : v > 1 ? '#8b5cf620' : 'var(--bg-card)',
                        color: v < 0 ? '#ef4444' : v > 1 ? '#8b5cf6' : 'var(--text-primary)',
                        fontSize: 18,
                        fontWeight: 700,
                        cursor: selectedCell && !showSuccess ? 'pointer' : 'not-allowed',
                        opacity: selectedCell && !showSuccess ? 1 : 0.5,
                      }}
                    >
                      {v}
                    </motion.button>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClear}
                  style={{
                    marginTop: 12,
                    padding: '6px 16px',
                    borderRadius: 6,
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-muted)',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  Clear All
                </motion.button>
              </div>
            </div>

            {/* Preview panel */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1.5, textTransform: 'uppercase', textAlign: 'center', marginBottom: 10 }}>
                Filter Preview
              </div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                {/* Original image */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>Original</div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: 1,
                    borderRadius: 6,
                    overflow: 'hidden',
                    border: '1px solid var(--border)',
                  }}>
                    {SAMPLE_IMAGE.map((row, r) =>
                      row.map((val, c) => (
                        <div
                          key={`o-${r}-${c}`}
                          style={{
                            width: 24,
                            height: 24,
                            background: `rgb(${val},${val},${val})`,
                          }}
                        />
                      ))
                    )}
                  </div>
                </div>

                {/* Your result */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>Your Filter</div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 1,
                    borderRadius: 6,
                    overflow: 'hidden',
                    border: `2px solid ${isMatch ? '#10b981' : 'var(--border)'}`,
                    transition: 'border-color 0.3s',
                  }}>
                    {preview.map((row, r) =>
                      row.map((val, c) => (
                        <motion.div
                          key={`p-${r}-${c}`}
                          animate={{ background: `rgb(${val},${val},${val})` }}
                          transition={{ duration: 0.3 }}
                          style={{
                            width: 32,
                            height: 32,
                            background: `rgb(${val},${val},${val})`,
                          }}
                        />
                      ))
                    )}
                  </div>
                </div>

                {/* Target result */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>Target</div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 1,
                    borderRadius: 6,
                    overflow: 'hidden',
                    border: '1px solid var(--border)',
                  }}>
                    {targetPreview.map((row, r) =>
                      row.map((val, c) => (
                        <div
                          key={`t-${r}-${c}`}
                          style={{
                            width: 32,
                            height: 32,
                            background: `rgb(${val},${val},${val})`,
                          }}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Match indicator */}
              <motion.div
                animate={{ opacity: filledCount > 0 ? 1 : 0.5 }}
                style={{
                  marginTop: 16,
                  padding: '10px 16px',
                  borderRadius: 10,
                  background: 'var(--bg-card)',
                  border: `1px solid ${isMatch ? '#10b981' : 'var(--border)'}`,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                  Filter Match
                </div>
                <div style={{
                  display: 'flex',
                  gap: 2,
                  justifyContent: 'center',
                }}>
                  {kernel.flat().map((val, i) => {
                    const r = Math.floor(i / 3)
                    const c = i % 3
                    const correct = val !== '' && Number(val) === challenge.target[r][c]
                    return (
                      <motion.div
                        key={i}
                        animate={{
                          background: val === '' ? 'var(--bg-secondary)' : correct ? '#10b981' : '#ef4444',
                        }}
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 3,
                          background: 'var(--bg-secondary)',
                        }}
                      />
                    )
                  })}
                </div>
                <div style={{ fontSize: 11, color: isMatch ? '#10b981' : 'var(--text-muted)', marginTop: 6, fontWeight: 600 }}>
                  {isMatch ? 'Perfect match!' : `${kernel.flat().filter((v, i) => v !== '' && Number(v) === challenge.target[Math.floor(i / 3)][i % 3]).length}/9 correct`}
                </div>
              </motion.div>

              {/* Explanation */}
              <div style={{
                marginTop: 16,
                padding: 12,
                borderRadius: 10,
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                fontSize: 12,
                color: 'var(--text-muted)',
              }}>
                <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-secondary)' }}>How it works:</div>
                The kernel slides over the image. Each output pixel = sum of (kernel value x corresponding pixel).
                Negative values detect edges, high center values sharpen.
              </div>
            </div>
          </div>

          {/* Success animation overlay */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 50,
                  pointerEvents: 'none',
                }}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  style={{
                    padding: '24px 48px',
                    borderRadius: 20,
                    background: 'var(--bg-card)',
                    border: '3px solid #10b981',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 48, marginBottom: 8 }}>{'✅'}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#10b981', fontFamily: 'var(--font-heading)' }}>
                    {challenge.title} Complete!
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                    {challengeIdx < CHALLENGES.length - 1 ? 'Loading next challenge...' : 'All challenges complete!'}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        /* Final result */
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center' }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            style={{ fontSize: 64, marginBottom: 16 }}
          >
            {'\u{1F9EA}'}
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
              {CHALLENGES.length}/{CHALLENGES.length}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>challenges</div>
          </motion.div>

          <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', marginBottom: 8 }}>
            All Filters Built!
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 4, fontSize: 14 }}>
            You understand how convolution kernels work. Edge detection and sharpening are fundamental CV operations!
          </p>

          {/* Summary of challenges */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
            {CHALLENGES.map((ch, i) => (
              <motion.div
                key={ch.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.15 }}
                style={{
                  padding: 16,
                  borderRadius: 12,
                  background: '#10b98112',
                  border: '1px solid #10b98140',
                  textAlign: 'center',
                  minWidth: 200,
                }}
              >
                <div style={{ fontWeight: 700, color: '#10b981', marginBottom: 8 }}>
                  {'✅'} {ch.title}
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 2,
                  justifyItems: 'center',
                }}>
                  {ch.target.flat().map((v, j) => (
                    <div
                      key={j}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 4,
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 13,
                        fontWeight: 600,
                        color: v < 0 ? '#ef4444' : v > 1 ? '#8b5cf6' : 'var(--text-primary)',
                      }}
                    >
                      {v}
                    </div>
                  ))}
                </div>
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
