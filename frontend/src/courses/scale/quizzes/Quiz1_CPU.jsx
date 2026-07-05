import { useState } from 'react'
import { motion } from 'framer-motion'

const questions = [
  { q: 'What does a CPU core do?', options: ['Stores files on disk', 'Executes instructions one at a time', 'Manages network connections', 'Displays graphics on screen'], answer: 1 },
  { q: 'A 4-core CPU can theoretically do what compared to a single core?', options: ['4x faster for any task', '4x parallel tasks (if parallelizable)', 'Uses 4x less power', 'Stores 4x more data'], answer: 1 },
  { q: 'What does "3.5 GHz clock speed" mean?', options: ['3.5 GB of memory', '3.5 billion cycles per second', '3.5 tasks per second', '3.5 watts of power'], answer: 1 },
  { q: 'Which task is CPU-bound?', options: ['Waiting for a database query', 'Downloading a file from S3', 'Training a neural network on data', 'Calling an external API'], answer: 2 },
  { q: 'Which task is I/O-bound?', options: ['Encrypting a password with bcrypt', 'Resizing 1000 images', 'Calling the OpenAI API and waiting for response', 'Computing Fibonacci numbers'], answer: 2 },
]

export default function Quiz1_CPU({ onComplete }) {
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
      <p style={{ color: 'var(--text-muted)' }}>{score >= 3 ? 'Great understanding of CPU fundamentals!' : 'Review the topic and try again!'}</p>
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
