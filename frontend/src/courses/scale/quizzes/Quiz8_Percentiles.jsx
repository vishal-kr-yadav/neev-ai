import { useState } from 'react'
import { motion } from 'framer-motion'

const questions = [
  { q: 'Why is P99 latency more useful than average latency?', options: ['P99 is always lower', 'Average hides slow outliers — P99 shows the worst 1% experience', 'P99 is easier to calculate', 'Average requires more data points'], answer: 1 },
  { q: 'If P99 = 5 seconds and you have 10,000 requests/hour, how many experience >5s latency?', options: ['10 requests', '100 requests', '1,000 requests', '5,000 requests'], answer: 1 },
  { q: 'What does 99.9% uptime SLA mean in allowed downtime per year?', options: ['52 minutes', '8.7 hours', '3.6 days', '0 minutes'], answer: 0 },
  { q: 'If a user makes 10 requests per session, what is the probability they hit a P99 event at least once?', options: ['1%', '~10%', '50%', '99%'], answer: 1 },
  { q: 'Which is a common cause of tail latency (P99 spikes)?', options: ['Clean code', 'Garbage collection pauses and cold starts', 'Using async/await', 'Having too few users'], answer: 1 },
]

export default function Quiz8_Percentiles({ onComplete }) {
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
      <p style={{ color: 'var(--text-muted)' }}>{score >= 3 ? 'Percentiles and SLAs understood!' : 'Review the topic and try again!'}</p>
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
