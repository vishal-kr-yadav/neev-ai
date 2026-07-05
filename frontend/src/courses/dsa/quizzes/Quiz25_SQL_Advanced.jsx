import { useState } from 'react'
import { motion } from 'framer-motion'

const questions = [
  { q: 'Window Functions differ from GROUP BY because:', options: ['Window functions only work on numeric columns', 'Window functions require a HAVING clause', 'They compute values without collapsing rows', 'Window functions cannot use aggregate operations'], answer: 2 },
  { q: 'ROW_NUMBER() vs RANK():', options: ['They are identical in behavior', 'RANK always gives unique numbers; ROW_NUMBER gives the same number for ties', 'ROW_NUMBER always gives unique numbers; RANK gives the same number for ties', 'Both skip numbers after ties'], answer: 2 },
  { q: 'A CTE (Common Table Expression) is:', options: ['A permanent table stored in the database', 'A type of index for speeding up queries', 'A named temporary result set defined with WITH clause', 'A constraint that enforces data integrity'], answer: 2 },
  { q: 'LAG() window function does:', options: ['Computes a running total of previous rows', 'Accesses the value from a previous row', 'Returns the last row in a partition', 'Shifts all rows forward by one position'], answer: 1 },
  { q: 'A correlated subquery is:', options: ['A subquery that runs only once for the entire outer query', 'A subquery that references columns from the outer query', 'A subquery that always returns exactly one row', 'A subquery used exclusively in the FROM clause'], answer: 1 },
]

export default function Quiz25_SQL_Advanced({ onComplete }) {
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState(null)
  const [done, setDone] = useState(false)
  const handleSelect = (i) => {
    if (selected !== null) return
    setSelected(i)
    const correct = i === questions[current].answer
    if (correct) setScore(s => s + 1)
    setTimeout(() => {
      if (current < questions.length - 1) { setCurrent(c => c + 1); setSelected(null) }
      else { const finalScore = score + (correct ? 1 : 0); setDone(true); onComplete(finalScore) }
    }, 1000)
  }
  if (done) return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: 40 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>{score >= 4 ? '🏆' : score >= 3 ? '🌟' : '📚'}</div>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, marginBottom: 8 }}>{score}/{questions.length} Correct</h3>
      <p style={{ color: 'var(--text-muted)' }}>{score >= 3 ? 'Advanced SQL conquered!' : 'Review the topic and try again!'}</p>
    </motion.div>
  )
  const q = questions[current]
  return (
    <div>
      <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 12 }}>Question {current + 1}/{questions.length}</div>
      <h3 style={{ fontSize: 20, fontFamily: 'var(--font-heading)', marginBottom: 20, color: 'var(--text-primary)' }}>{q.q}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {q.options.map((opt, i) => {
          let bg = 'var(--bg-card)', border = 'var(--border)', color = 'var(--text-primary)'
          if (selected !== null && i === q.answer) { bg = '#d1fae5'; border = '#10b981'; color = '#065f46' }
          else if (selected === i && i !== q.answer) { bg = '#fee2e2'; border = '#ef4444'; color = '#991b1b' }
          return (
            <motion.button key={i} onClick={() => handleSelect(i)} whileHover={selected === null ? { x: 4 } : {}}
              style={{ padding: '14px 20px', borderRadius: 12, border: `2px solid ${border}`, background: bg, color, fontSize: 16, fontWeight: 500, cursor: selected === null ? 'pointer' : 'default', textAlign: 'left' }}>
              {opt}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
