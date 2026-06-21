import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/*
  QUIZ 7 — Metrics Master: Interactive Scenario-Based Quiz
  Show a confusion matrix and detection results. User calculates
  precision, recall, mAP from the visual data and selects answers.
  5 questions, 4/5 to pass.
*/

// Confusion matrix data for a 3-class steel defect detection model
const MATRIX = {
  classes: ['Scratch', 'Crack', 'Pit'],
  // rows = actual, cols = predicted
  data: [
    [42, 3, 5],   // Actual Scratch -> Predicted [Scratch, Crack, Pit]
    [6, 35, 2],   // Actual Crack -> Predicted [Scratch, Crack, Pit]
    [2, 4, 38],   // Actual Pit -> Predicted [Scratch, Crack, Pit]
  ],
}

// Per-class AP values for mAP calculation
const AP_VALUES = { Scratch: 0.82, Crack: 0.78, Pit: 0.85 }

const QUESTIONS = [
  {
    id: 1,
    question: 'What is the precision for Scratch detection?',
    hint: 'Precision = TP / (TP + FP). Look at the Scratch column for all predictions made as Scratch.',
    options: ['72%', '84%', '88%', '92%'],
    correctIdx: 1,
    calculation: {
      label: 'Precision(Scratch)',
      steps: [
        'TP = 42 (correctly predicted Scratch)',
        'FP = 6 + 2 = 8 (Crack and Pit predicted as Scratch)',
        'Precision = 42 / (42 + 8) = 42/50 = 0.84 = 84%',
      ],
    },
  },
  {
    id: 2,
    question: 'What is the recall for Crack detection?',
    hint: 'Recall = TP / (TP + FN). Look at the Crack row for all actual Cracks.',
    options: ['78%', '81%', '83%', '86%'],
    correctIdx: 1,
    calculation: {
      label: 'Recall(Crack)',
      steps: [
        'TP = 35 (correctly predicted Crack)',
        'FN = 6 + 2 = 8 (Actual Cracks predicted as Scratch or Pit)',
        'Recall = 35 / (35 + 8) = 35/43 = 0.814 ≈ 81%',
      ],
    },
  },
  {
    id: 3,
    question: 'Which class has the most false positives?',
    hint: 'False positives for a class = total column sum minus the diagonal (TP).',
    options: ['Scratch (8 FP)', 'Crack (7 FP)', 'Pit (7 FP)', 'All equal'],
    correctIdx: 0,
    calculation: {
      label: 'False Positives per class',
      steps: [
        'Scratch column: 3 + 6 + 2 = 50, TP=42, FP = 50-42 = 8',
        'Crack column: 3 + 35 + 4 = 42, TP=35, FP = 42-35 = 7',
        'Pit column: 5 + 2 + 38 = 45, TP=38, FP = 45-38 = 7',
        'Scratch has the most FP: 8',
      ],
    },
  },
  {
    id: 4,
    question: 'What is the mean Average Precision (mAP)?',
    hint: 'mAP = average of AP values for each class. AP(Scratch)=0.82, AP(Crack)=0.78, AP(Pit)=0.85.',
    options: ['0.78', '0.80', '0.82', '0.85'],
    correctIdx: 2,
    calculation: {
      label: 'mAP',
      steps: [
        'AP(Scratch) = 0.82',
        'AP(Crack) = 0.78',
        'AP(Pit) = 0.85',
        'mAP = (0.82 + 0.78 + 0.85) / 3 = 2.45/3 = 0.8167 ≈ 0.82',
      ],
    },
  },
  {
    id: 5,
    question: 'Which class should you prioritize improving first?',
    hint: 'Consider which class has the lowest overall performance (precision AND recall).',
    options: ['Scratch — lowest recall', 'Crack — lowest precision and recall', 'Pit — most confused class', 'All classes need equal work'],
    correctIdx: 1,
    calculation: {
      label: 'Performance comparison',
      steps: [
        'Scratch: P=84%, R=84% (42/50 actual)',
        'Crack: P=83%, R=81% (lowest on both)',
        'Pit: P=84%, R=86% (best performer)',
        'Crack has the lowest AP (0.78) and worst recall (81%)',
      ],
    },
  },
]

const CELL_COLORS = {
  diagonal: 'rgba(16,185,129,0.2)',
  offDiagonal: 'rgba(239,68,68,0.08)',
  highlight: 'rgba(99,102,241,0.15)',
}

export default function Quiz7_MetricsQuiz({ onComplete }) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedOpt, setSelectedOpt] = useState(null)
  const [showCalc, setShowCalc] = useState(false)
  const [answers, setAnswers] = useState([])
  const [done, setDone] = useState(false)
  const [highlightCells, setHighlightCells] = useState([]) // [{row, col}]
  const [calcStep, setCalcStep] = useState(0)

  const question = QUESTIONS[currentIdx]

  const handleSelect = (idx) => {
    if (showCalc) return
    setSelectedOpt(idx)
  }

  const handleSubmit = () => {
    if (selectedOpt === null) return
    const isCorrect = selectedOpt === question.correctIdx
    setAnswers((prev) => [...prev, { questionId: question.id, isCorrect, selected: selectedOpt }])
    setShowCalc(true)
    setCalcStep(0)

    // Highlight relevant cells based on question
    if (question.id === 1) setHighlightCells([{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 2, col: 0 }]) // Scratch column
    else if (question.id === 2) setHighlightCells([{ row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 }]) // Crack row
    else if (question.id === 3) setHighlightCells([{ row: 1, col: 0 }, { row: 2, col: 0 }, { row: 0, col: 1 }, { row: 2, col: 1 }, { row: 0, col: 2 }, { row: 1, col: 2 }])
    else setHighlightCells([])

    // Animate calculation steps
    question.calculation.steps.forEach((_, i) => {
      setTimeout(() => setCalcStep(i + 1), (i + 1) * 500)
    })
  }

  const handleNext = () => {
    const nextIdx = currentIdx + 1
    if (nextIdx >= QUESTIONS.length) {
      setDone(true)
      const totalCorrect = [...answers].filter((a) => a.isCorrect).length
      if (totalCorrect >= 4) {
        // Handled in done screen
      }
    } else {
      setCurrentIdx(nextIdx)
      setSelectedOpt(null)
      setShowCalc(false)
      setHighlightCells([])
      setCalcStep(0)
    }
  }

  const totalCorrect = answers.filter((a) => a.isCorrect).length
  const passed = totalCorrect >= 4

  const isCellHighlighted = (row, col) =>
    highlightCells.some((c) => c.row === row && c.col === col)

  return (
    <div>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, marginBottom: 8 }}>
        Metrics Master
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
        Calculate metrics from the confusion matrix. 4/5 correct to pass.
      </p>

      {!done ? (
        <>
          {/* Confusion Matrix Display */}
          <div style={{
            marginBottom: 24, padding: '16px', borderRadius: 14,
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          }}>
            <div style={{
              fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase',
              letterSpacing: 1, marginBottom: 12, textAlign: 'center',
            }}>
              Confusion Matrix — Steel Defect Detection
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%', maxWidth: 400, margin: '0 auto',
                borderCollapse: 'separate', borderSpacing: 4,
              }}>
                <thead>
                  <tr>
                    <th style={{ width: 80, padding: 6, fontSize: 10, color: 'var(--text-muted)', textAlign: 'right' }}>
                      Actual ↓ Pred →
                    </th>
                    {MATRIX.classes.map((cls) => (
                      <th key={cls} style={{
                        padding: '8px 6px', fontSize: 12, fontWeight: 700,
                        color: 'var(--text-primary)', textAlign: 'center',
                      }}>
                        {cls}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MATRIX.data.map((row, rIdx) => (
                    <tr key={rIdx}>
                      <td style={{
                        padding: '8px 10px', fontSize: 12, fontWeight: 700,
                        color: 'var(--text-primary)', textAlign: 'right',
                      }}>
                        {MATRIX.classes[rIdx]}
                      </td>
                      {row.map((val, cIdx) => {
                        const isDiag = rIdx === cIdx
                        const isHL = isCellHighlighted(rIdx, cIdx)
                        return (
                          <td key={cIdx}>
                            <motion.div
                              animate={{
                                background: isHL
                                  ? CELL_COLORS.highlight
                                  : isDiag
                                    ? CELL_COLORS.diagonal
                                    : val > 0
                                      ? CELL_COLORS.offDiagonal
                                      : 'transparent',
                                scale: isHL ? [1, 1.08, 1] : 1,
                              }}
                              transition={{ duration: 0.4 }}
                              style={{
                                padding: '10px 6px', borderRadius: 8, textAlign: 'center',
                                fontSize: 18, fontWeight: 700, fontFamily: 'monospace',
                                color: isDiag ? '#10b981' : val > 3 ? '#ef4444' : 'var(--text-secondary)',
                                border: isHL ? '2px solid var(--accent)' : '2px solid transparent',
                              }}
                            >
                              {val}
                            </motion.div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* AP values reference */}
            <div style={{
              display: 'flex', justifyContent: 'center', gap: 16, marginTop: 12,
              fontSize: 11, color: 'var(--text-muted)',
            }}>
              {Object.entries(AP_VALUES).map(([cls, val]) => (
                <span key={cls}>AP({cls}): <strong>{val}</strong></span>
              ))}
            </div>
          </div>

          {/* Question */}
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '16px 20px', borderRadius: 12, marginBottom: 16,
              background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)',
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
              Question {currentIdx + 1}/{QUESTIONS.length}
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
              {question.question}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
              {question.hint}
            </div>
          </motion.div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {question.options.map((opt, idx) => {
              const isSelected = selectedOpt === idx
              const isCorrect = showCalc && idx === question.correctIdx
              const isWrong = showCalc && isSelected && idx !== question.correctIdx

              return (
                <motion.button
                  key={idx}
                  whileHover={!showCalc ? { scale: 1.01, x: 4 } : {}}
                  whileTap={!showCalc ? { scale: 0.99 } : {}}
                  onClick={() => handleSelect(idx)}
                  animate={isWrong ? { x: [0, -6, 6, -6, 0] } : {}}
                  style={{
                    padding: '12px 18px', borderRadius: 10, textAlign: 'left',
                    border: `2px solid ${isCorrect ? '#10b981' : isWrong ? '#ef4444' : isSelected ? 'var(--accent)' : 'var(--border)'}`,
                    background: isCorrect ? 'rgba(16,185,129,0.08)' : isWrong ? 'rgba(239,68,68,0.08)' : isSelected ? 'rgba(99,102,241,0.06)' : 'var(--bg-card)',
                    color: isCorrect ? '#10b981' : isWrong ? '#ef4444' : 'var(--text-primary)',
                    cursor: showCalc ? 'default' : 'pointer',
                    fontSize: 14, fontWeight: isSelected || isCorrect ? 600 : 400,
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}
                >
                  <span style={{
                    width: 24, height: 24, borderRadius: 6, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
                    background: isCorrect ? '#10b981' : isWrong ? '#ef4444' : isSelected ? 'var(--accent)' : 'var(--bg-secondary)',
                    color: (isCorrect || isWrong || isSelected) ? '#fff' : 'var(--text-muted)',
                    flexShrink: 0,
                  }}>
                    {isCorrect ? '✓' : isWrong ? '✗' : String.fromCharCode(65 + idx)}
                  </span>
                  {opt}
                </motion.button>
              )
            })}
          </div>

          {/* Submit or Calculation */}
          {!showCalc ? (
            <motion.button
              whileHover={selectedOpt !== null ? { scale: 1.02 } : {}}
              whileTap={selectedOpt !== null ? { scale: 0.98 } : {}}
              onClick={handleSubmit}
              disabled={selectedOpt === null}
              style={{
                padding: '12px 28px', borderRadius: 10, border: 'none',
                background: selectedOpt !== null ? 'var(--accent)' : 'var(--bg-secondary)',
                color: selectedOpt !== null ? '#fff' : 'var(--text-muted)',
                cursor: selectedOpt !== null ? 'pointer' : 'not-allowed',
                fontSize: 15, fontWeight: 600, width: '100%',
              }}
            >
              Check Answer
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '16px 20px', borderRadius: 12,
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                marginBottom: 16,
              }}
            >
              <div style={{
                fontSize: 12, color: 'var(--accent)', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10,
              }}>
                {question.calculation.label}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {question.calculation.steps.map((step, i) => (
                  <AnimatePresence key={i}>
                    {calcStep > i && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{
                          fontSize: 13, color: 'var(--text-secondary)',
                          fontFamily: 'monospace', padding: '4px 8px',
                          borderLeft: `3px solid ${i === question.calculation.steps.length - 1 ? '#10b981' : 'var(--border)'}`,
                        }}
                      >
                        {step}
                      </motion.div>
                    )}
                  </AnimatePresence>
                ))}
              </div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: calcStep >= question.calculation.steps.length ? 1 : 0 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleNext}
                disabled={calcStep < question.calculation.steps.length}
                style={{
                  marginTop: 14, padding: '10px 24px', borderRadius: 10, border: 'none',
                  background: 'var(--accent)', color: '#fff',
                  cursor: calcStep >= question.calculation.steps.length ? 'pointer' : 'not-allowed',
                  fontSize: 14, fontWeight: 600,
                  opacity: calcStep >= question.calculation.steps.length ? 1 : 0.5,
                }}
              >
                {currentIdx < QUESTIONS.length - 1 ? 'Next Question' : 'See Results'}
              </motion.button>
            </motion.div>
          )}
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
            {passed ? '\u{1F4CA}' : '\u{1F4DD}'}
          </motion.div>

          <div style={{
            fontSize: 24, fontWeight: 700, marginBottom: 8,
            color: passed ? '#10b981' : '#ef4444',
            fontFamily: 'var(--font-heading)',
          }}>
            {totalCorrect}/{QUESTIONS.length} Correct
          </div>

          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
            {passed
              ? 'You have a solid understanding of detection metrics!'
              : 'Need 4/5 correct. Review precision, recall, and mAP concepts.'}
          </div>

          {/* Answer summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            {answers.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', borderRadius: 10,
                  background: a.isCorrect ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
                  border: `1px solid ${a.isCorrect ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                  textAlign: 'left',
                }}
              >
                <span style={{
                  fontSize: 18, fontWeight: 700,
                  color: a.isCorrect ? '#10b981' : '#ef4444',
                  minWidth: 24, textAlign: 'center',
                }}>
                  {a.isCorrect ? '✓' : '✗'}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                    Q{i + 1}: {QUESTIONS[i].question}
                  </div>
                  {!a.isCorrect && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      Correct: {QUESTIONS[i].options[QUESTIONS[i].correctIdx]}
                    </div>
                  )}
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
                setSelectedOpt(null)
                setShowCalc(false)
                setAnswers([])
                setDone(false)
                setHighlightCells([])
                setCalcStep(0)
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
            animate={{ width: `${((done ? QUESTIONS.length : currentIdx) / QUESTIONS.length) * 100}%` }}
            style={{ height: '100%', background: 'var(--accent)', borderRadius: 3 }}
          />
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {done ? QUESTIONS.length : currentIdx}/{QUESTIONS.length}
        </span>
      </div>
    </div>
  )
}
