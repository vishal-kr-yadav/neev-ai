import { useState } from 'react'
import { motion } from 'framer-motion'

const questions = [
  { q: 'What is the main advantage of connection pooling over dedicated connections?', options: ['Faster DNS resolution', 'Eliminates TCP/TLS/Auth overhead by reusing existing connections', 'Makes SQL queries execute faster', "Increases the database's max_connections limit"], answer: 1 },
  { q: 'In SQLAlchemy, what does pool_recycle=3600 do?', options: ['Creates 3600 connections', 'Replaces connections older than 1 hour to prevent stale connections', 'Recycles query results every hour', 'Sets the maximum pool size to 3600'], answer: 1 },
  { q: 'PostgreSQL uses a ___-per-connection model, consuming ~10MB per connection.', options: ['Thread', 'Process', 'Goroutine', 'Fiber'], answer: 1 },
  { q: 'What happens when all pool connections are busy and max_overflow is also exhausted?', options: ['Database automatically creates more connections', 'The request waits in a queue until pool_timeout, then raises an error', 'The application crashes immediately', 'A new pool is created automatically'], answer: 1 },
  { q: 'Which Python pattern ensures a database connection is always returned to the pool, even on errors?', options: ['Using global variables', 'try/finally block or context manager (with statement)', 'Threading locks', 'Calling gc.collect() manually'], answer: 1 },
]

export default function Quiz14_DBConnections({ onComplete }) {
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
      <p style={{ color: 'var(--text-muted)' }}>{score >= 3 ? 'Connection pooling mastered!' : 'Review the topic and try again!'}</p>
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
