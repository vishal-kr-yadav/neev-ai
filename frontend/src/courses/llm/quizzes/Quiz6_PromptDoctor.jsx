import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/*
  QUIZ: "Prompt Doctor" - Given a weak prompt, select the improvements
  that would make it better. Visual before/after with quality meter.
*/

const cases = [
  {
    bad: 'Write something about climate',
    fixes: [
      { text: 'Add specific format (e.g. "5 bullet points")', correct: true },
      { text: 'Add target audience (e.g. "for high school students")', correct: true },
      { text: 'Make it shorter', correct: false },
      { text: 'Add "please" at the start', correct: false },
    ],
    improved: 'Write 5 bullet points about climate change causes for high school students',
  },
  {
    bad: 'Explain code',
    fixes: [
      { text: 'Specify the programming language', correct: true },
      { text: 'Ask for step-by-step breakdown', correct: true },
      { text: 'Add exclamation marks for emphasis', correct: false },
      { text: 'Request it in a different language', correct: false },
    ],
    improved: 'Explain this Python function step by step, describing what each line does',
  },
]

export default function Quiz6_PromptDoctor({ onComplete }) {
  const [caseIdx, setCaseIdx] = useState(0)
  const [selected, setSelected] = useState(new Set())
  const [checked, setChecked] = useState(false)
  const [done, setDone] = useState(false)
  const [scores, setScores] = useState([])

  const c = cases[caseIdx]

  const toggle = (i) => {
    if (checked) return
    setSelected((prev) => {
      const n = new Set(prev)
      n.has(i) ? n.delete(i) : n.add(i)
      return n
    })
  }

  const check = () => {
    const correct = c.fixes.every((f, i) => f.correct === selected.has(i))
    setScores((prev) => [...prev, correct])
    setChecked(true)

    setTimeout(() => {
      if (caseIdx < cases.length - 1) {
        setCaseIdx((i) => i + 1)
        setSelected(new Set())
        setChecked(false)
      } else {
        setDone(true)
        onComplete()
      }
    }, 2500)
  }

  if (done) {
    const s = scores.filter(Boolean).length
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: 32 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>💊</div>
        <div style={{ fontSize: 20, fontWeight: 600, color: '#10b981', marginBottom: 8 }}>
          {s}/{cases.length} prompts healed!
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>You're becoming a Prompt Doctor!</p>
      </motion.div>
    )
  }

  const correctCount = [...selected].filter((i) => c.fixes[i].correct).length
  const totalCorrect = c.fixes.filter((f) => f.correct).length
  const quality = Math.round((correctCount / totalCorrect) * 100)

  return (
    <div>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, marginBottom: 8 }}>
        Prompt Doctor 💊
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>
        This prompt is sick! Select the correct treatments (improvements) to heal it.
      </p>

      <div style={{
        background: 'var(--bg-card)', borderRadius: 20, padding: 32,
        border: '1px solid var(--border)', marginBottom: 24,
      }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
          Patient {caseIdx + 1}/{cases.length}
        </div>

        {/* Sick prompt */}
        <div style={{
          padding: 20, background: 'rgba(239,68,68,0.08)', borderRadius: 14,
          border: '1px solid rgba(239,68,68,0.2)', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 28 }}>🤒</span>
          <div>
            <div style={{ fontSize: 11, color: '#ef4444', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' }}>Sick Prompt</div>
            <div style={{ fontFamily: 'monospace', fontSize: 15, color: 'var(--text-primary)' }}>"{c.bad}"</div>
          </div>
        </div>

        {/* Quality meter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Health:</span>
          <div style={{ flex: 1, height: 10, background: 'var(--bg-secondary)', borderRadius: 5, overflow: 'hidden' }}>
            <motion.div
              animate={{ width: `${selected.size > 0 ? quality : 20}%` }}
              style={{
                height: '100%', borderRadius: 5,
                background: quality > 80 ? '#10b981' : quality > 50 ? '#f59e0b' : '#ef4444',
              }}
            />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: quality > 80 ? '#10b981' : quality > 50 ? '#f59e0b' : '#ef4444' }}>
            {selected.size > 0 ? quality : 20}%
          </span>
        </div>

        {/* Fixes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {c.fixes.map((fix, i) => {
            const isSel = selected.has(i)
            const showResult = checked
            const isCorrectFix = fix.correct
            return (
              <motion.button
                key={fix.text}
                onClick={() => toggle(i)}
                whileHover={!checked ? { scale: 1.02 } : {}}
                style={{
                  padding: '14px 18px', borderRadius: 12, cursor: checked ? 'default' : 'pointer',
                  border: showResult
                    ? (isSel && isCorrectFix ? '2px solid #10b981'
                      : isSel && !isCorrectFix ? '2px solid #ef4444'
                      : !isSel && isCorrectFix ? '2px solid #f59e0b'
                      : '2px solid var(--border)')
                    : (isSel ? '2px solid #818cf8' : '2px solid var(--border)'),
                  background: showResult
                    ? (isSel && isCorrectFix ? 'rgba(16,185,129,0.1)'
                      : isSel && !isCorrectFix ? 'rgba(239,68,68,0.1)'
                      : 'var(--bg-secondary)')
                    : (isSel ? 'rgba(129,140,248,0.1)' : 'var(--bg-secondary)'),
                  fontSize: 14, color: 'var(--text-primary)', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  border: isSel ? '2px solid #818cf8' : '2px solid var(--border)',
                  background: isSel ? '#818cf8' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, color: 'white',
                }}>
                  {isSel && '✓'}
                </div>
                <span>{fix.text}</span>
                {showResult && isCorrectFix && !isSel && (
                  <span style={{ marginLeft: 'auto', fontSize: 12, color: '#f59e0b' }}>← Missed this!</span>
                )}
              </motion.button>
            )
          })}
        </div>

        {/* Improved prompt */}
        {checked && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: 20, padding: 20, background: 'rgba(16,185,129,0.08)',
              borderRadius: 14, border: '1px solid rgba(16,185,129,0.2)',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
            <span style={{ fontSize: 28 }}>💪</span>
            <div>
              <div style={{ fontSize: 11, color: '#10b981', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' }}>Healed Prompt</div>
              <div style={{ fontFamily: 'monospace', fontSize: 14, color: '#10b981' }}>"{c.improved}"</div>
            </div>
          </motion.div>
        )}
      </div>

      {!checked && (
        <div style={{ textAlign: 'center' }}>
          <motion.button whileHover={{ scale: 1.05 }} onClick={check}
            disabled={selected.size === 0}
            style={{
              padding: '12px 32px', background: selected.size > 0 ? 'var(--gradient-primary)' : 'var(--bg-card)',
              border: 'none', borderRadius: 12, color: 'white', fontSize: 15, fontWeight: 600,
              cursor: selected.size > 0 ? 'pointer' : 'default', opacity: selected.size > 0 ? 1 : 0.4,
            }}>
            Apply Treatment
          </motion.button>
        </div>
      )}
    </div>
  )
}
