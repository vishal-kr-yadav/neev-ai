import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/*
  QUIZ 6 — Label Challenge: Annotation Practice
  Show 5 steel surface "images" (styled divs with CSS patterns).
  User must: (1) identify defect type, (2) click to place bounding box center.
  Score based on classification AND proximity. 4/5 to pass.
*/

const SURFACES = [
  {
    id: 1,
    defectType: 'Scratch',
    defectCenter: { x: 50, y: 45 },
    description: 'Surface with linear marking',
    bgBase: 'linear-gradient(135deg, #94a3b8 0%, #b0bec5 50%, #94a3b8 100%)',
    defectPattern: 'linear-gradient(8deg, transparent 42%, rgba(239,68,68,0.6) 42%, rgba(239,68,68,0.6) 43.5%, transparent 43.5%)',
    hint: 'Look for the thin diagonal line across the surface.',
  },
  {
    id: 2,
    defectType: 'Crack',
    defectCenter: { x: 30, y: 55 },
    description: 'Surface with fracture pattern',
    bgBase: 'linear-gradient(135deg, #9ca3af 0%, #b8c0cc 50%, #9ca3af 100%)',
    defectPattern: 'linear-gradient(40deg, transparent 25%, rgba(251,146,60,0.7) 25%, rgba(251,146,60,0.7) 26%, transparent 26%), linear-gradient(55deg, transparent 28%, rgba(251,146,60,0.5) 28%, rgba(251,146,60,0.5) 29%, transparent 29%)',
    hint: 'Notice the branching lines in the lower-left area.',
  },
  {
    id: 3,
    defectType: 'Pit',
    defectCenter: { x: 62, y: 40 },
    description: 'Surface with circular depression',
    bgBase: 'linear-gradient(135deg, #a1a8b4 0%, #bcc3cf 50%, #a1a8b4 100%)',
    defectPattern: 'radial-gradient(circle at 62% 40%, rgba(168,85,247,0.7) 6px, rgba(168,85,247,0.3) 10px, transparent 12px)',
    hint: 'Find the circular dark spot on the right side.',
  },
  {
    id: 4,
    defectType: 'Stain',
    defectCenter: { x: 45, y: 50 },
    description: 'Surface with discoloration',
    bgBase: 'linear-gradient(135deg, #94a3b8 0%, #adb5c2 50%, #94a3b8 100%)',
    defectPattern: 'radial-gradient(ellipse at 45% 50%, rgba(234,179,8,0.5) 0%, rgba(234,179,8,0.3) 20px, transparent 40px)',
    hint: 'Look for the yellowish discolored region in the center.',
  },
  {
    id: 5,
    defectType: 'Good',
    defectCenter: { x: 50, y: 50 },
    description: 'Clean steel surface',
    bgBase: 'linear-gradient(135deg, #94a3b8 0%, #cbd5e1 50%, #94a3b8 100%)',
    defectPattern: 'none',
    hint: 'This surface looks clean and uniform.',
  },
]

const DEFECT_OPTIONS = ['Scratch', 'Crack', 'Pit', 'Stain', 'Good']

const DEFECT_COLORS = {
  Scratch: '#ef4444',
  Crack: '#fb923c',
  Pit: '#a855f7',
  Stain: '#eab308',
  Good: '#10b981',
}

export default function Quiz6_LabelChallenge({ onComplete }) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedType, setSelectedType] = useState('')
  const [clickPoint, setClickPoint] = useState(null)
  const [results, setResults] = useState([])
  const [showResult, setShowResult] = useState(null)
  const [done, setDone] = useState(false)

  const surface = SURFACES[currentIdx]
  const isGood = surface?.defectType === 'Good'

  const handleSurfaceClick = (e) => {
    if (showResult || done) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setClickPoint({ x, y })
  }

  const calculateDistance = (p1, p2) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
  }

  const handleSubmit = () => {
    if (!selectedType || (!clickPoint && !isGood)) return

    const typeCorrect = selectedType === surface.defectType

    // For "Good" surfaces, location doesn't matter
    let locationScore = 0
    let distance = 0
    if (isGood) {
      locationScore = selectedType === 'Good' ? 1 : 0
    } else if (clickPoint) {
      distance = calculateDistance(clickPoint, surface.defectCenter)
      locationScore = distance < 15 ? 1 : distance < 30 ? 0.5 : 0
    }

    const correct = typeCorrect && (isGood || locationScore >= 0.5)

    const result = {
      surface: surface.id,
      typeCorrect,
      locationScore,
      distance: Math.round(distance),
      correct,
      selectedType,
      actualType: surface.defectType,
    }

    setResults((prev) => [...prev, result])
    setShowResult(result)
  }

  const handleNext = () => {
    const nextIdx = currentIdx + 1
    if (nextIdx >= SURFACES.length) {
      setDone(true)
    } else {
      setCurrentIdx(nextIdx)
      setSelectedType('')
      setClickPoint(null)
      setShowResult(null)
    }
  }

  const totalCorrect = results.filter((r) => r.correct).length
  const passed = totalCorrect >= 4

  return (
    <div>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, marginBottom: 8 }}>
        Label Challenge
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
        Identify defect types and mark their location. 4/5 correct to pass.
      </p>

      {!done ? (
        <>
          {/* Progress indicator */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 16, fontSize: 13, color: 'var(--text-muted)',
          }}>
            <span>Image {currentIdx + 1} of {SURFACES.length}</span>
            <span style={{ color: '#10b981', fontWeight: 600 }}>
              Score: {results.filter((r) => r.correct).length}/{results.length}
            </span>
          </div>

          {/* Steel surface image */}
          <motion.div
            key={surface.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ marginBottom: 20 }}
          >
            <div style={{
              fontSize: 12, color: 'var(--text-muted)', marginBottom: 6,
              textTransform: 'uppercase', letterSpacing: 1,
            }}>
              Steel Surface #{surface.id} — {surface.description}
            </div>

            <div
              onClick={handleSurfaceClick}
              style={{
                position: 'relative', width: '100%', height: 220, borderRadius: 14,
                background: `${surface.defectPattern !== 'none' ? surface.defectPattern + ', ' : ''}${surface.bgBase}`,
                border: '2px solid var(--border)', cursor: showResult ? 'default' : 'crosshair',
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              }}
            >
              {/* Metallic texture overlay */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
                pointerEvents: 'none',
              }} />

              {/* User's click point */}
              <AnimatePresence>
                {clickPoint && !showResult && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      position: 'absolute',
                      left: `${clickPoint.x}%`, top: `${clickPoint.y}%`,
                      transform: 'translate(-50%, -50%)',
                      width: 16, height: 16, borderRadius: '50%',
                      border: '3px solid var(--accent)',
                      background: 'rgba(99,102,241,0.3)',
                      pointerEvents: 'none',
                    }}
                  />
                )}
              </AnimatePresence>

              {/* Show actual center on result */}
              {showResult && !isGood && (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      position: 'absolute',
                      left: `${surface.defectCenter.x}%`, top: `${surface.defectCenter.y}%`,
                      transform: 'translate(-50%, -50%)',
                      width: 20, height: 20, borderRadius: '50%',
                      border: '3px solid #10b981',
                      background: 'rgba(16,185,129,0.2)',
                      pointerEvents: 'none',
                    }}
                  />
                  {/* Radius guide */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.15 }}
                    style={{
                      position: 'absolute',
                      left: `${surface.defectCenter.x}%`, top: `${surface.defectCenter.y}%`,
                      transform: 'translate(-50%, -50%)',
                      width: 60, height: 60, borderRadius: '50%',
                      border: '2px dashed #10b981',
                      pointerEvents: 'none',
                    }}
                  />
                  {/* User's point */}
                  {clickPoint && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{
                        position: 'absolute',
                        left: `${clickPoint.x}%`, top: `${clickPoint.y}%`,
                        transform: 'translate(-50%, -50%)',
                        width: 14, height: 14, borderRadius: '50%',
                        border: `3px solid ${showResult.correct ? '#10b981' : '#ef4444'}`,
                        background: showResult.correct ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)',
                        pointerEvents: 'none',
                      }}
                    />
                  )}
                </>
              )}

              {/* Instruction overlay */}
              {!clickPoint && !showResult && !isGood && (
                <div style={{
                  position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
                  padding: '4px 12px', borderRadius: 8,
                  background: 'rgba(0,0,0,0.6)', color: '#fff',
                  fontSize: 11, whiteSpace: 'nowrap', pointerEvents: 'none',
                }}>
                  Click on the defect center
                </div>
              )}
            </div>
          </motion.div>

          {/* Classification dropdown */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
              Step 1: Classify the defect
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {DEFECT_OPTIONS.map((opt) => (
                <motion.button
                  key={opt}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => !showResult && setSelectedType(opt)}
                  style={{
                    padding: '10px 18px', borderRadius: 10,
                    border: `2px solid ${selectedType === opt ? DEFECT_COLORS[opt] : 'var(--border)'}`,
                    background: selectedType === opt ? `${DEFECT_COLORS[opt]}15` : 'var(--bg-card)',
                    color: selectedType === opt ? DEFECT_COLORS[opt] : 'var(--text-primary)',
                    cursor: showResult ? 'default' : 'pointer',
                    fontSize: 14, fontWeight: selectedType === opt ? 700 : 500,
                    opacity: showResult && selectedType !== opt ? 0.5 : 1,
                  }}
                >
                  {opt}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Step 2 instruction */}
          {selectedType && selectedType !== 'Good' && !showResult && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                fontSize: 12, color: 'var(--text-muted)', marginBottom: 16,
                textTransform: 'uppercase', letterSpacing: 1,
              }}
            >
              Step 2: Click on the defect location in the image above
              {clickPoint && (
                <span style={{ color: '#10b981', marginLeft: 8, fontWeight: 600, textTransform: 'none' }}>
                  Point placed
                </span>
              )}
            </motion.div>
          )}

          {/* Submit button */}
          {!showResult && (
            <motion.button
              whileHover={selectedType && (clickPoint || isGood || selectedType === 'Good') ? { scale: 1.03 } : {}}
              whileTap={selectedType && (clickPoint || isGood || selectedType === 'Good') ? { scale: 0.97 } : {}}
              onClick={handleSubmit}
              disabled={!selectedType || (!clickPoint && selectedType !== 'Good')}
              style={{
                padding: '12px 28px', borderRadius: 10, border: 'none',
                background: selectedType && (clickPoint || selectedType === 'Good') ? 'var(--accent)' : 'var(--bg-secondary)',
                color: selectedType && (clickPoint || selectedType === 'Good') ? '#fff' : 'var(--text-muted)',
                cursor: selectedType && (clickPoint || selectedType === 'Good') ? 'pointer' : 'not-allowed',
                fontSize: 15, fontWeight: 600, width: '100%',
              }}
            >
              Submit Annotation
            </motion.button>
          )}

          {/* Result feedback */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  padding: '16px 20px', borderRadius: 12, marginBottom: 16,
                  background: showResult.correct ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                  border: `1px solid ${showResult.correct ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                }}
              >
                <div style={{
                  fontSize: 16, fontWeight: 700, marginBottom: 6,
                  color: showResult.correct ? '#10b981' : '#ef4444',
                }}>
                  {showResult.correct ? 'Correct Annotation!' : 'Needs Improvement'}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <div>
                    Classification: {showResult.typeCorrect ? 'Correct' : `Wrong (was ${showResult.actualType})`}
                    {showResult.typeCorrect ? ' ✓' : ' ✗'}
                  </div>
                  {showResult.actualType !== 'Good' && (
                    <div>
                      Location: {showResult.distance}% off center
                      {showResult.locationScore >= 0.5 ? ' ✓' : ' ✗'}
                    </div>
                  )}
                  <div style={{ marginTop: 4, fontStyle: 'italic', color: 'var(--text-muted)' }}>
                    {surface.hint}
                  </div>
                </div>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleNext}
                  style={{
                    marginTop: 12, padding: '10px 24px', borderRadius: 10, border: 'none',
                    background: 'var(--accent)', color: '#fff',
                    cursor: 'pointer', fontSize: 14, fontWeight: 600,
                  }}
                >
                  {currentIdx < SURFACES.length - 1 ? 'Next Image' : 'See Results'}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
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
            {passed ? '\u{1F3F7}\u{FE0F}' : '\u{1F50D}'}
          </motion.div>

          <div style={{
            fontSize: 24, fontWeight: 700, marginBottom: 8,
            color: passed ? '#10b981' : '#ef4444',
            fontFamily: 'var(--font-heading)',
          }}>
            {totalCorrect}/{SURFACES.length} Correctly Labeled
          </div>

          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
            {passed
              ? 'Great annotation skills! You understand both classification and localization.'
              : 'Need 4/5 correct. Review the defect patterns and try again!'}
          </div>

          {/* Result summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            {results.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', borderRadius: 10,
                  background: r.correct ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
                  border: `1px solid ${r.correct ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                  textAlign: 'left',
                }}
              >
                <span style={{
                  fontSize: 18, fontWeight: 700,
                  color: r.correct ? '#10b981' : '#ef4444',
                  minWidth: 24, textAlign: 'center',
                }}>
                  {r.correct ? '✓' : '✗'}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>
                    Surface #{r.surface}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Labeled: {r.selectedType} | Actual: {r.actualType}
                    {r.actualType !== 'Good' && ` | Distance: ${r.distance}%`}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {passed ? (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
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
          ) : (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setCurrentIdx(0)
                setSelectedType('')
                setClickPoint(null)
                setResults([])
                setShowResult(null)
                setDone(false)
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
            animate={{ width: `${((done ? SURFACES.length : currentIdx) / SURFACES.length) * 100}%` }}
            style={{ height: '100%', background: 'var(--accent)', borderRadius: 3 }}
          />
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {done ? SURFACES.length : currentIdx}/{SURFACES.length}
        </span>
      </div>
    </div>
  )
}
