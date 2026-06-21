import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/*
  QUIZ 8 — Quality Inspector: Final Challenge
  8 steel surface images in rapid succession (3 seconds each).
  User classifies PASS/FAIL and identifies defect type if FAIL.
  Simulates a real QC inspection terminal. 6/8 to pass.
*/

const INSPECTION_ITEMS = [
  {
    id: 'COIL-2847',
    status: 'FAIL',
    defectType: 'Scratch',
    surface: {
      base: 'linear-gradient(135deg, #8e99a4 0%, #b0bac5 50%, #8e99a4 100%)',
      defect: 'linear-gradient(6deg, transparent 44%, rgba(239,68,68,0.55) 44%, rgba(239,68,68,0.55) 45.5%, transparent 45.5%), linear-gradient(8deg, transparent 54%, rgba(239,68,68,0.35) 54%, rgba(239,68,68,0.35) 55%, transparent 55%)',
    },
    batchInfo: 'Batch #A-291 | Hot-rolled | 1.5mm gauge',
  },
  {
    id: 'COIL-2848',
    status: 'PASS',
    defectType: null,
    surface: {
      base: 'linear-gradient(135deg, #94a3b8 0%, #cbd5e1 50%, #94a3b8 100%)',
      defect: 'none',
    },
    batchInfo: 'Batch #A-291 | Hot-rolled | 1.5mm gauge',
  },
  {
    id: 'COIL-2849',
    status: 'FAIL',
    defectType: 'Crack',
    surface: {
      base: 'linear-gradient(135deg, #9ca3af 0%, #b8c0cc 50%, #9ca3af 100%)',
      defect: 'linear-gradient(35deg, transparent 38%, rgba(251,146,60,0.65) 38%, rgba(251,146,60,0.65) 39%, transparent 39%), linear-gradient(50deg, transparent 41%, rgba(251,146,60,0.45) 41%, rgba(251,146,60,0.45) 42%, transparent 42%)',
    },
    batchInfo: 'Batch #A-291 | Hot-rolled | 2.0mm gauge',
  },
  {
    id: 'COIL-2850',
    status: 'FAIL',
    defectType: 'Pit',
    surface: {
      base: 'linear-gradient(135deg, #a1a8b4 0%, #bcc3cf 50%, #a1a8b4 100%)',
      defect: 'radial-gradient(circle at 45% 42%, rgba(168,85,247,0.65) 5px, rgba(168,85,247,0.3) 9px, transparent 12px), radial-gradient(circle at 58% 56%, rgba(168,85,247,0.5) 3px, transparent 6px)',
    },
    batchInfo: 'Batch #B-104 | Cold-rolled | 0.8mm gauge',
  },
  {
    id: 'COIL-2851',
    status: 'PASS',
    defectType: null,
    surface: {
      base: 'linear-gradient(135deg, #90979e 0%, #c2ccd6 50%, #90979e 100%)',
      defect: 'none',
    },
    batchInfo: 'Batch #B-104 | Cold-rolled | 0.8mm gauge',
  },
  {
    id: 'COIL-2852',
    status: 'FAIL',
    defectType: 'Scratch',
    surface: {
      base: 'linear-gradient(135deg, #8b939d 0%, #a8b2bc 50%, #8b939d 100%)',
      defect: 'linear-gradient(170deg, transparent 48%, rgba(239,68,68,0.5) 48%, rgba(239,68,68,0.5) 49%, transparent 49%)',
    },
    batchInfo: 'Batch #B-104 | Cold-rolled | 1.2mm gauge',
  },
  {
    id: 'COIL-2853',
    status: 'PASS',
    defectType: null,
    surface: {
      base: 'linear-gradient(135deg, #99a1ab 0%, #c8d0d8 50%, #99a1ab 100%)',
      defect: 'none',
    },
    batchInfo: 'Batch #C-057 | Galvanized | 1.0mm gauge',
  },
  {
    id: 'COIL-2854',
    status: 'FAIL',
    defectType: 'Crack',
    surface: {
      base: 'linear-gradient(135deg, #929aa4 0%, #b4bcc6 50%, #929aa4 100%)',
      defect: 'linear-gradient(80deg, transparent 47%, rgba(251,146,60,0.6) 47%, rgba(251,146,60,0.6) 48%, transparent 48%), linear-gradient(95deg, transparent 50%, rgba(251,146,60,0.4) 50%, rgba(251,146,60,0.4) 51%, transparent 51%)',
    },
    batchInfo: 'Batch #C-057 | Galvanized | 1.0mm gauge',
  },
]

const DEFECT_TYPES = ['Scratch', 'Crack', 'Pit']

const DEFECT_COLORS = {
  Scratch: '#ef4444',
  Crack: '#fb923c',
  Pit: '#a855f7',
}

export default function Quiz8_QualityInspector({ onComplete }) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [timeLeft, setTimeLeft] = useState(3)
  const [started, setStarted] = useState(false)
  const [done, setDone] = useState(false)
  const [results, setResults] = useState([])
  const [selectedStatus, setSelectedStatus] = useState(null) // 'PASS' | 'FAIL'
  const [selectedDefect, setSelectedDefect] = useState(null)
  const [showFeedback, setShowFeedback] = useState(null)
  const [timerRef] = useState({ current: null })
  const [inspected, setInspected] = useState(0)

  const item = INSPECTION_ITEMS[currentIdx]

  const startInspection = () => {
    setStarted(true)
    startTimer()
  }

  const startTimer = () => {
    setTimeLeft(3)
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          // Auto-skip if time runs out
          handleTimeout()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleTimeout = () => {
    const result = {
      id: INSPECTION_ITEMS[currentIdx]?.id,
      correct: false,
      timedOut: true,
      actualStatus: INSPECTION_ITEMS[currentIdx]?.status,
      actualDefect: INSPECTION_ITEMS[currentIdx]?.defectType,
      userStatus: null,
      userDefect: null,
    }
    setResults((prev) => [...prev, result])
    setInspected((p) => p + 1)
    setShowFeedback({ ...result, isCorrect: false })

    setTimeout(() => {
      moveToNext()
    }, 1000)
  }

  const handleSubmit = () => {
    if (!selectedStatus) return
    clearInterval(timerRef.current)

    const statusCorrect = selectedStatus === item.status
    const defectCorrect = item.status === 'PASS'
      ? selectedStatus === 'PASS'
      : selectedDefect === item.defectType

    const isCorrect = statusCorrect && defectCorrect

    const result = {
      id: item.id,
      correct: isCorrect,
      timedOut: false,
      actualStatus: item.status,
      actualDefect: item.defectType,
      userStatus: selectedStatus,
      userDefect: selectedDefect,
    }

    setResults((prev) => [...prev, result])
    setInspected((p) => p + 1)
    setShowFeedback({ ...result, isCorrect })

    setTimeout(() => {
      moveToNext()
    }, 1200)
  }

  const moveToNext = () => {
    const nextIdx = currentIdx + 1
    if (nextIdx >= INSPECTION_ITEMS.length) {
      clearInterval(timerRef.current)
      setDone(true)
    } else {
      setCurrentIdx(nextIdx)
      setSelectedStatus(null)
      setSelectedDefect(null)
      setShowFeedback(null)
      startTimer()
    }
  }

  const totalCorrect = results.filter((r) => r.correct).length
  const accuracy = inspected > 0 ? Math.round((totalCorrect / inspected) * 100) : 0
  const passed = totalCorrect >= 6

  return (
    <div>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, marginBottom: 8 }}>
        Quality Inspector
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
        Inspect steel surfaces under time pressure. Classify PASS/FAIL and identify defects. 6/8 to pass.
      </p>

      {!started && !done && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', padding: '32px 20px' }}
        >
          {/* Terminal-style start screen */}
          <div style={{
            maxWidth: 440, margin: '0 auto', borderRadius: 14, overflow: 'hidden',
            border: '2px solid rgba(16,185,129,0.3)', background: '#0a0f1a',
          }}>
            <div style={{
              padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8,
              background: '#0d1320', borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
              <span style={{ fontSize: 11, color: '#4a5568', fontFamily: 'monospace' }}>
                QC-Terminal v3.2 | SHIFT-07
              </span>
            </div>

            <div style={{ padding: '24px 20px', fontFamily: 'monospace', textAlign: 'left' }}>
              <div style={{ color: '#10b981', fontSize: 13, marginBottom: 6 }}>
                {'>'} QUALITY CONTROL SYSTEM READY
              </div>
              <div style={{ color: '#64748b', fontSize: 12, marginBottom: 4 }}>
                {'>'} Production line: Steel Coil Inspection
              </div>
              <div style={{ color: '#64748b', fontSize: 12, marginBottom: 4 }}>
                {'>'} Items in queue: {INSPECTION_ITEMS.length}
              </div>
              <div style={{ color: '#64748b', fontSize: 12, marginBottom: 4 }}>
                {'>'} Time per inspection: 3 seconds
              </div>
              <div style={{ color: '#64748b', fontSize: 12, marginBottom: 4 }}>
                {'>'} Pass threshold: 6/{INSPECTION_ITEMS.length} correct
              </div>
              <div style={{ color: '#f59e0b', fontSize: 12, marginBottom: 16 }}>
                {'>'} WARNING: Fast-paced inspection — decide quickly!
              </div>

              <motion.div
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                style={{ color: '#10b981', fontSize: 13 }}
              >
                {'>'} Press START to begin shift...
              </motion.div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startInspection}
            style={{
              marginTop: 24, padding: '14px 40px', borderRadius: 12, border: 'none',
              background: '#10b981', color: '#fff',
              cursor: 'pointer', fontSize: 16, fontWeight: 700,
              fontFamily: 'var(--font-heading)', letterSpacing: 1,
            }}
          >
            START SHIFT
          </motion.button>
        </motion.div>
      )}

      {started && !done && (
        <>
          {/* Factory terminal header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'stretch',
            marginBottom: 16, gap: 8,
          }}>
            {/* Production counter */}
            <div style={{
              flex: 1, padding: '10px 14px', borderRadius: 10,
              background: '#0a0f1a', border: '1px solid rgba(16,185,129,0.2)',
              fontFamily: 'monospace',
            }}>
              <div style={{ fontSize: 10, color: '#4a5568', textTransform: 'uppercase', letterSpacing: 1 }}>
                Production Line
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#10b981' }}>
                {currentIdx + 1}/{INSPECTION_ITEMS.length}
              </div>
            </div>

            {/* Timer */}
            <div style={{
              flex: 1, padding: '10px 14px', borderRadius: 10,
              background: '#0a0f1a', border: `1px solid ${timeLeft <= 1 ? 'rgba(239,68,68,0.4)' : 'rgba(245,158,11,0.2)'}`,
              fontFamily: 'monospace', textAlign: 'center',
            }}>
              <div style={{ fontSize: 10, color: '#4a5568', textTransform: 'uppercase', letterSpacing: 1 }}>
                Time Left
              </div>
              <motion.div
                key={timeLeft}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                style={{
                  fontSize: 18, fontWeight: 700,
                  color: timeLeft <= 1 ? '#ef4444' : '#f59e0b',
                }}
              >
                {timeLeft}s
              </motion.div>
            </div>

            {/* Accuracy */}
            <div style={{
              flex: 1, padding: '10px 14px', borderRadius: 10,
              background: '#0a0f1a', border: '1px solid rgba(99,102,241,0.2)',
              fontFamily: 'monospace', textAlign: 'right',
            }}>
              <div style={{ fontSize: 10, color: '#4a5568', textTransform: 'uppercase', letterSpacing: 1 }}>
                Accuracy
              </div>
              <div style={{
                fontSize: 18, fontWeight: 700,
                color: accuracy >= 75 ? '#10b981' : accuracy >= 50 ? '#f59e0b' : '#ef4444',
              }}>
                {accuracy}%
              </div>
            </div>
          </div>

          {/* Inspection surface */}
          <AnimatePresence mode="wait">
            {!showFeedback && item && (
              <motion.div
                key={item.id}
                initial={{ x: 200, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -200, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{
                  borderRadius: 14, overflow: 'hidden', marginBottom: 16,
                  border: '2px solid var(--border)',
                  background: '#0a0f1a',
                }}
              >
                {/* Item header */}
                <div style={{
                  padding: '8px 14px', display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)',
                  fontFamily: 'monospace',
                }}>
                  <span style={{ fontSize: 13, color: '#10b981', fontWeight: 700 }}>
                    ID: {item.id}
                  </span>
                  <span style={{ fontSize: 11, color: '#4a5568' }}>
                    {item.batchInfo}
                  </span>
                </div>

                {/* Surface image */}
                <div style={{
                  width: '100%', height: 180,
                  background: `${item.surface.defect !== 'none' ? item.surface.defect + ', ' : ''}${item.surface.base}`,
                  position: 'relative',
                }}>
                  {/* Scan line animation */}
                  <motion.div
                    animate={{ top: ['0%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    style={{
                      position: 'absolute', left: 0, right: 0, height: 2,
                      background: 'rgba(16,185,129,0.4)',
                      boxShadow: '0 0 8px rgba(16,185,129,0.3)',
                      pointerEvents: 'none',
                    }}
                  />
                  {/* Metallic texture */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)',
                    pointerEvents: 'none',
                  }} />
                </div>
              </motion.div>
            )}

            {/* Feedback overlay */}
            {showFeedback && (
              <motion.div
                key="feedback"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  padding: '24px 20px', borderRadius: 14, marginBottom: 16,
                  background: showFeedback.isCorrect ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                  border: `2px solid ${showFeedback.isCorrect ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                  textAlign: 'center',
                }}
              >
                <div style={{
                  fontSize: 32, fontWeight: 700,
                  color: showFeedback.isCorrect ? '#10b981' : '#ef4444',
                  marginBottom: 4,
                }}>
                  {showFeedback.timedOut ? 'TIME UP' : showFeedback.isCorrect ? 'CORRECT' : 'WRONG'}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  {showFeedback.actualStatus === 'PASS'
                    ? 'This surface was clean (PASS)'
                    : `Defect: ${showFeedback.actualDefect} (FAIL)`}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Controls */}
          {!showFeedback && (
            <div>
              {/* PASS / FAIL buttons */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedStatus('PASS')
                    setSelectedDefect(null)
                  }}
                  style={{
                    flex: 1, padding: '14px 16px', borderRadius: 12,
                    border: `2px solid ${selectedStatus === 'PASS' ? '#10b981' : 'rgba(16,185,129,0.2)'}`,
                    background: selectedStatus === 'PASS' ? 'rgba(16,185,129,0.12)' : '#0a0f1a',
                    color: '#10b981', cursor: 'pointer',
                    fontSize: 16, fontWeight: 700, fontFamily: 'monospace',
                    letterSpacing: 2,
                  }}
                >
                  PASS
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedStatus('FAIL')}
                  style={{
                    flex: 1, padding: '14px 16px', borderRadius: 12,
                    border: `2px solid ${selectedStatus === 'FAIL' ? '#ef4444' : 'rgba(239,68,68,0.2)'}`,
                    background: selectedStatus === 'FAIL' ? 'rgba(239,68,68,0.12)' : '#0a0f1a',
                    color: '#ef4444', cursor: 'pointer',
                    fontSize: 16, fontWeight: 700, fontFamily: 'monospace',
                    letterSpacing: 2,
                  }}
                >
                  FAIL
                </motion.button>
              </div>

              {/* Defect type selection (shown only when FAIL) */}
              <AnimatePresence>
                {selectedStatus === 'FAIL' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: 'hidden', marginBottom: 12 }}
                  >
                    <div style={{
                      fontSize: 10, color: '#4a5568', fontFamily: 'monospace',
                      textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
                    }}>
                      Identify defect type:
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {DEFECT_TYPES.map((type) => (
                        <motion.button
                          key={type}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedDefect(type)}
                          style={{
                            flex: 1, padding: '10px 12px', borderRadius: 10,
                            border: `2px solid ${selectedDefect === type ? DEFECT_COLORS[type] : `${DEFECT_COLORS[type]}30`}`,
                            background: selectedDefect === type ? `${DEFECT_COLORS[type]}18` : '#0a0f1a',
                            color: DEFECT_COLORS[type], cursor: 'pointer',
                            fontSize: 13, fontWeight: 600, fontFamily: 'monospace',
                          }}
                        >
                          {type}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button
                whileHover={(selectedStatus === 'PASS' || (selectedStatus === 'FAIL' && selectedDefect)) ? { scale: 1.02 } : {}}
                whileTap={(selectedStatus === 'PASS' || (selectedStatus === 'FAIL' && selectedDefect)) ? { scale: 0.98 } : {}}
                onClick={handleSubmit}
                disabled={!selectedStatus || (selectedStatus === 'FAIL' && !selectedDefect)}
                style={{
                  width: '100%', padding: '12px 24px', borderRadius: 10,
                  border: 'none', fontFamily: 'monospace', letterSpacing: 1,
                  background: (selectedStatus === 'PASS' || (selectedStatus === 'FAIL' && selectedDefect))
                    ? 'var(--accent)' : 'rgba(100,100,120,0.2)',
                  color: (selectedStatus === 'PASS' || (selectedStatus === 'FAIL' && selectedDefect))
                    ? '#fff' : '#4a5568',
                  cursor: (selectedStatus === 'PASS' || (selectedStatus === 'FAIL' && selectedDefect))
                    ? 'pointer' : 'not-allowed',
                  fontSize: 14, fontWeight: 700,
                }}
              >
                SUBMIT INSPECTION
              </motion.button>
            </div>
          )}
        </>
      )}

      {/* Shift Report */}
      {done && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Terminal-style report */}
          <div style={{
            maxWidth: 500, margin: '0 auto', borderRadius: 14, overflow: 'hidden',
            border: `2px solid ${passed ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
            background: '#0a0f1a',
          }}>
            <div style={{
              padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8,
              background: '#0d1320', borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: passed ? '#10b981' : '#ef4444',
              }} />
              <span style={{ fontSize: 11, color: '#4a5568', fontFamily: 'monospace' }}>
                QC-Terminal | SHIFT REPORT
              </span>
            </div>

            <div style={{ padding: '20px', fontFamily: 'monospace' }}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{ color: '#10b981', fontSize: 14, marginBottom: 16, textAlign: 'center' }}
              >
                ====== SHIFT SUMMARY ======
              </motion.div>

              {/* Stats grid */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
                marginBottom: 20,
              }}>
                {[
                  { label: 'Items Inspected', value: INSPECTION_ITEMS.length, color: '#64748b' },
                  { label: 'Correct Decisions', value: `${totalCorrect}/${INSPECTION_ITEMS.length}`, color: '#10b981' },
                  { label: 'Accuracy Rate', value: `${Math.round((totalCorrect / INSPECTION_ITEMS.length) * 100)}%`, color: totalCorrect >= 6 ? '#10b981' : '#ef4444' },
                  { label: 'Timed Out', value: results.filter((r) => r.timedOut).length, color: '#f59e0b' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    style={{
                      padding: '10px 12px', borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.05)',
                      background: 'rgba(255,255,255,0.02)',
                    }}
                  >
                    <div style={{ fontSize: 10, color: '#4a5568', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                      {stat.label}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: stat.color }}>
                      {stat.value}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Individual results */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: '#4a5568', marginBottom: 8, letterSpacing: 1 }}>
                  INSPECTION LOG:
                </div>
                {results.map((r, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.08 }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '6px 10px', borderRadius: 6, marginBottom: 4,
                      background: r.correct ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
                      borderLeft: `3px solid ${r.correct ? '#10b981' : '#ef4444'}`,
                    }}
                  >
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>
                      {r.id}
                    </span>
                    <span style={{ fontSize: 11, color: '#64748b' }}>
                      {r.actualStatus}{r.actualDefect ? ` (${r.actualDefect})` : ''}
                    </span>
                    <span style={{
                      fontSize: 11, fontWeight: 700,
                      color: r.timedOut ? '#f59e0b' : r.correct ? '#10b981' : '#ef4444',
                    }}>
                      {r.timedOut ? 'TIMEOUT' : r.correct ? 'OK' : 'MISS'}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Verdict */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                style={{
                  padding: '14px', borderRadius: 8, textAlign: 'center',
                  background: passed ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${passed ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                }}
              >
                <div style={{
                  fontSize: 16, fontWeight: 700,
                  color: passed ? '#10b981' : '#ef4444',
                  marginBottom: 4,
                }}>
                  {passed ? 'SHIFT APPROVED' : 'SHIFT NEEDS REVIEW'}
                </div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  {passed
                    ? 'Inspection quality meets production standards. Good work, inspector.'
                    : 'Accuracy below threshold (6/8). Additional training recommended.'}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Action button */}
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            {passed ? (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onComplete()}
                style={{
                  padding: '14px 36px', borderRadius: 12, border: 'none',
                  background: 'var(--gradient-primary)', color: '#fff',
                  cursor: 'pointer', fontSize: 16, fontWeight: 700,
                  fontFamily: 'var(--font-heading)',
                }}
              >
                Complete Course
              </motion.button>
            ) : (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setCurrentIdx(0)
                  setStarted(false)
                  setDone(false)
                  setResults([])
                  setSelectedStatus(null)
                  setSelectedDefect(null)
                  setShowFeedback(null)
                  setInspected(0)
                  setTimeLeft(3)
                }}
                style={{
                  padding: '14px 36px', borderRadius: 12, border: 'none',
                  background: 'var(--accent)', color: '#fff',
                  cursor: 'pointer', fontSize: 16, fontWeight: 700,
                  fontFamily: 'var(--font-heading)',
                }}
              >
                Retry Shift
              </motion.button>
            )}
          </div>
        </motion.div>
      )}

      {/* Progress bar */}
      <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, height: 6, background: 'var(--bg-secondary)', borderRadius: 3, overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${((done ? INSPECTION_ITEMS.length : currentIdx) / INSPECTION_ITEMS.length) * 100}%` }}
            style={{ height: '100%', background: passed ? '#10b981' : 'var(--accent)', borderRadius: 3 }}
          />
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
          {done ? INSPECTION_ITEMS.length : currentIdx}/{INSPECTION_ITEMS.length}
        </span>
      </div>
    </div>
  )
}
