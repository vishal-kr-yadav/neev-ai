import { useState } from 'react'
import { motion } from 'framer-motion'

const questions = [
  { q: 'INNER JOIN returns:', options: ['All rows from both tables regardless of matches', 'Only rows that have matching values in both tables', 'All rows from the left table with NULLs for non-matches', 'All rows from the right table with NULLs for non-matches'], answer: 1 },
  { q: 'LEFT JOIN returns:', options: ['Only rows that match in both tables', 'All rows from the right table, with NULLs for non-matching left table rows', 'All rows from the left table, with NULLs for non-matching right table rows', 'A full Cartesian product of both tables'], answer: 2 },
  { q: 'GROUP BY is used with:', options: ['WHERE clauses to filter individual rows', 'ORDER BY to sort the final result', 'Aggregate functions (COUNT, SUM, AVG, MIN, MAX)', 'LIMIT to restrict the number of groups returned'], answer: 2 },
  { q: 'HAVING differs from WHERE because:', options: ['HAVING can only be used with JOINs', 'WHERE applies only to numeric columns', 'HAVING filters groups AFTER aggregation, WHERE filters rows BEFORE', 'HAVING is faster than WHERE for large datasets'], answer: 2 },
  { q: 'To find customers with no orders, you would use:', options: ['INNER JOIN with a COUNT check', 'RIGHT JOIN with WHERE customers.id IS NULL', 'FULL OUTER JOIN with HAVING COUNT = 0', 'LEFT JOIN with WHERE orders.id IS NULL'], answer: 3 },
]

export default function Quiz24_SQL_Joins({ onComplete }) {
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
      <p style={{ color: 'var(--text-muted)' }}>{score >= 3 ? 'JOIN master!' : 'Review the topic and try again!'}</p>
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
