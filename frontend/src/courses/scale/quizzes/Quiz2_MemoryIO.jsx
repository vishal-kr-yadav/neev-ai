import { useState } from 'react'
import { motion } from 'framer-motion'

const questions = [
  { q: 'Which memory is fastest but smallest?', options: ['RAM', 'SSD', 'L1 Cache', 'Hard Disk'], answer: 2 },
  { q: 'If L1 cache access takes 1 nanosecond, how long does a cross-continent network call take in human-scale time?', options: ['About 1 minute', 'About 1 day', 'About 5 years', 'About 1 hour'], answer: 2 },
  { q: 'In a typical web request, what percentage of time is the CPU actually computing?', options: ['About 80-90%', 'About 50%', 'About 1-5%', 'About 30%'], answer: 2 },
  { q: 'What is a memory leak?', options: ['When RAM physically breaks', 'When data is stolen from memory', 'When an app keeps allocating memory without freeing it', 'When cache becomes full'], answer: 2 },
  { q: 'What matters more for API calls — bandwidth or latency?', options: ['Bandwidth — need to send more data', 'Latency — each call waits for round trip', 'Neither — both are irrelevant', 'They are the same thing'], answer: 1 },
]

export default function Quiz2_MemoryIO({ onComplete }) {
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
      <p style={{ color: 'var(--text-muted)' }}>{score >= 3 ? 'Solid grasp of memory & I/O concepts!' : 'Review the topic and try again!'}</p>
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
