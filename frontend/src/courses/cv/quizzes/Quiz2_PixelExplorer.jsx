import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ================================================================
   QUIZ 2 — Pixel Explorer: Fill in the Grayscale Grid
   Format: 8x8 grid with missing values, user fills to recreate
   a diagonal scratch pattern (dark pixels on light background)
================================================================ */

// Target grid: light background (200-230) with a dark diagonal scratch (20-50)
const TARGET_GRID = [
  [40, 220, 220, 220, 220, 220, 220, 220],
  [220, 35, 220, 220, 220, 220, 220, 220],
  [220, 220, 30, 220, 220, 220, 220, 220],
  [220, 220, 220, 25, 220, 220, 220, 220],
  [220, 220, 220, 220, 20, 220, 220, 220],
  [220, 220, 220, 220, 220, 25, 220, 220],
  [220, 220, 220, 220, 220, 220, 30, 220],
  [220, 220, 220, 220, 220, 220, 220, 40],
]

// Which cells are pre-filled vs blank (true = user must fill)
const BLANK_MASK = [
  [false, true, false, true, true, true, false, true],
  [true, false, true, true, false, true, true, true],
  [false, true, false, true, true, true, true, false],
  [true, true, true, false, true, true, false, true],
  [true, false, true, true, false, true, true, true],
  [true, true, true, false, true, false, true, false],
  [false, true, true, true, true, true, false, true],
  [true, false, true, true, false, true, true, false],
]

const TOLERANCE = 30
const PASS_THRESHOLD = 0.8

function countBlanks() {
  let count = 0
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (BLANK_MASK[r][c]) count++
  return count
}

const totalBlanks = countBlanks()

export default function Quiz2_PixelExplorer({ onComplete }) {
  const [grid, setGrid] = useState(() => {
    const g = []
    for (let r = 0; r < 8; r++) {
      const row = []
      for (let c = 0; c < 8; c++) {
        row.push(BLANK_MASK[r][c] ? '' : TARGET_GRID[r][c])
      }
      g.push(row)
    }
    return g
  })

  const [selectedCell, setSelectedCell] = useState(null)
  const [sliderValue, setSliderValue] = useState(128)
  const [submitted, setSubmitted] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)

  const getCellStatus = (r, c) => {
    if (!BLANK_MASK[r][c]) return 'prefilled'
    if (grid[r][c] === '') return 'empty'
    const diff = Math.abs(Number(grid[r][c]) - TARGET_GRID[r][c])
    if (submitted) {
      return diff <= TOLERANCE ? 'correct' : 'wrong'
    }
    return 'filled'
  }

  const handleCellClick = (r, c) => {
    if (!BLANK_MASK[r][c] || submitted) return
    setSelectedCell({ r, c })
    setSliderValue(grid[r][c] === '' ? 128 : Number(grid[r][c]))
  }

  const handleSliderChange = (val) => {
    setSliderValue(val)
    if (selectedCell) {
      const newGrid = grid.map((row) => [...row])
      newGrid[selectedCell.r][selectedCell.c] = val
      setGrid(newGrid)
    }
  }

  const handleInputChange = (val) => {
    const num = Math.max(0, Math.min(255, Number(val) || 0))
    setSliderValue(num)
    if (selectedCell) {
      const newGrid = grid.map((row) => [...row])
      newGrid[selectedCell.r][selectedCell.c] = num
      setGrid(newGrid)
    }
  }

  const handleSubmit = () => {
    let correct = 0
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (BLANK_MASK[r][c] && grid[r][c] !== '') {
          const diff = Math.abs(Number(grid[r][c]) - TARGET_GRID[r][c])
          if (diff <= TOLERANCE) correct++
        }
      }
    }
    setCorrectCount(correct)
    setSubmitted(true)
  }

  const passed = submitted && correctCount >= Math.ceil(totalBlanks * PASS_THRESHOLD)
  const filledCount = grid.flat().filter((v, i) => {
    const r = Math.floor(i / 8)
    const c = i % 8
    return BLANK_MASK[r][c] && v !== ''
  }).length

  const getCellColor = (r, c) => {
    const val = grid[r][c] === '' ? 200 : Number(grid[r][c])
    return `rgb(${val},${val},${val})`
  }

  const getCellBorder = (r, c) => {
    const status = getCellStatus(r, c)
    if (status === 'correct') return '2px solid #10b981'
    if (status === 'wrong') return '2px solid #ef4444'
    if (selectedCell?.r === r && selectedCell?.c === c) return '2px solid var(--accent)'
    if (status === 'prefilled') return '1px solid var(--border)'
    if (status === 'filled') return '2px solid #3b82f6'
    return '1px dashed var(--border)'
  }

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
        Pixel Explorer
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 6, fontSize: 14 }}
      >
        Recreate the diagonal scratch pattern! Fill in the missing pixel values (0=black, 255=white).
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: 20, fontSize: 12 }}
      >
        Hint: The scratch is a dark diagonal line on a light background. Click a cell, then use the slider.
      </motion.p>

      {/* Progress */}
      <div style={{ height: 6, background: 'var(--bg-secondary)', borderRadius: 3, marginBottom: 20, overflow: 'hidden' }}>
        <motion.div
          animate={{ width: `${(filledCount / totalBlanks) * 100}%` }}
          style={{ height: '100%', background: 'var(--accent)', borderRadius: 3 }}
          transition={{ type: 'spring', stiffness: 120 }}
        />
      </div>

      <div style={{ display: 'flex', gap: 32, justifyContent: 'center', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Grid */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 1fr)',
            gap: 3,
            background: 'var(--bg-secondary)',
            padding: 8,
            borderRadius: 12,
            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
          }}
        >
          {grid.map((row, r) =>
            row.map((val, c) => {
              const status = getCellStatus(r, c)
              const isSelected = selectedCell?.r === r && selectedCell?.c === c
              return (
                <motion.div
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  whileHover={BLANK_MASK[r][c] && !submitted ? { scale: 1.1 } : {}}
                  whileTap={BLANK_MASK[r][c] && !submitted ? { scale: 0.95 } : {}}
                  animate={
                    status === 'correct'
                      ? { scale: [1, 1.15, 1] }
                      : status === 'wrong'
                      ? { x: [0, -3, 3, -3, 0] }
                      : {}
                  }
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: BLANK_MASK[r][c] && !submitted ? 'pointer' : 'default',
                    background: getCellColor(r, c),
                    border: getCellBorder(r, c),
                    color: (val === '' ? 200 : Number(val)) > 128 ? '#333' : '#eee',
                    position: 'relative',
                    transition: 'background 0.3s',
                    boxShadow: isSelected ? '0 0 0 2px var(--accent)' : 'none',
                  }}
                >
                  {val !== '' ? val : (
                    <span style={{ opacity: 0.4, fontSize: 16 }}>?</span>
                  )}
                  {status === 'prefilled' && (
                    <div style={{
                      position: 'absolute',
                      top: 2,
                      right: 3,
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      background: 'var(--accent)',
                      opacity: 0.5,
                    }} />
                  )}
                </motion.div>
              )
            })
          )}
        </motion.div>

        {/* Controls panel */}
        <div style={{ minWidth: 200, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Target preview */}
          <div style={{
            padding: 16,
            borderRadius: 12,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>
              Target Pattern
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(8, 1fr)',
              gap: 1,
              borderRadius: 4,
              overflow: 'hidden',
            }}>
              {TARGET_GRID.map((row, r) =>
                row.map((val, c) => (
                  <div
                    key={`t-${r}-${c}`}
                    style={{
                      width: 16,
                      height: 16,
                      background: `rgb(${val},${val},${val})`,
                    }}
                  />
                ))
              )}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>
              Dark diagonal scratch
            </div>
          </div>

          {/* Slider control */}
          {selectedCell && !submitted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: 16,
                borderRadius: 12,
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 8 }}>
                CELL ({selectedCell.r}, {selectedCell.c})
              </div>
              <div style={{
                width: 60,
                height: 60,
                borderRadius: 8,
                margin: '0 auto 12px',
                background: `rgb(${sliderValue},${sliderValue},${sliderValue})`,
                border: '2px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                fontWeight: 700,
                color: sliderValue > 128 ? '#333' : '#eee',
              }}>
                {sliderValue}
              </div>
              <input
                type="range"
                min="0"
                max="255"
                value={sliderValue}
                onChange={(e) => handleSliderChange(Number(e.target.value))}
                style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                <span>0 (Black)</span>
                <span>255 (White)</span>
              </div>
              <input
                type="number"
                min="0"
                max="255"
                value={sliderValue}
                onChange={(e) => handleInputChange(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: 8,
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: 14,
                  textAlign: 'center',
                }}
              />
            </motion.div>
          )}

          {/* Legend */}
          <div style={{
            padding: 12,
            borderRadius: 10,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            fontSize: 12,
            color: 'var(--text-muted)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: '#ccc', border: '1px solid var(--border)' }} />
              Pre-filled
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: '#ccc', border: '1px dashed var(--border)' }} />
              Empty (click to fill)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: '#ccc', border: '2px solid #3b82f6' }} />
              Filled by you
            </div>
          </div>

          {/* Stats */}
          <div style={{
            fontSize: 13,
            color: 'var(--text-secondary)',
            textAlign: 'center',
          }}>
            {filledCount} / {totalBlanks} cells filled
          </div>

          {/* Submit / Result */}
          {!submitted ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={filledCount < Math.ceil(totalBlanks * 0.5)}
              style={{
                padding: '12px 24px',
                background: filledCount >= Math.ceil(totalBlanks * 0.5) ? 'var(--accent)' : 'var(--bg-secondary)',
                color: filledCount >= Math.ceil(totalBlanks * 0.5) ? '#fff' : 'var(--text-muted)',
                border: 'none',
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 700,
                cursor: filledCount >= Math.ceil(totalBlanks * 0.5) ? 'pointer' : 'not-allowed',
                fontFamily: 'var(--font-heading)',
              }}
            >
              Check Pattern
            </motion.button>
          ) : (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center' }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: '50%',
                    border: `3px solid ${passed ? '#10b981' : '#f59e0b'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    background: 'var(--bg-card)',
                  }}
                >
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>
                    {correctCount}/{totalBlanks}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                    {Math.round((correctCount / totalBlanks) * 100)}%
                  </div>
                </motion.div>

                <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  {passed
                    ? 'Excellent! You understand pixel intensity values.'
                    : 'Almost there! Remember: dark = low values, light = high values.'}
                </p>

                {passed && (
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
                )}

                {!passed && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSubmitted(false)
                      setCorrectCount(0)
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
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  )
}
