import { useState } from 'react'
import { motion } from 'framer-motion'

const questions = [
  { q: 'At 100 concurrent users on a 4-vCPU server (RAG app, 2.3s/request), what is the approximate CPU usage?', options: ['5%', '26%', '75%', '100%'], answer: 1 },
  { q: 'When scaling from 100 to 1000 users, what new bottleneck typically appears first?', options: ['Running out of disk space', 'External API rate limits (e.g., OpenAI)', 'DNS resolution failures', 'CSS rendering issues'], answer: 1 },
  { q: 'How many servers (4 vCPU each) are needed for 10,000 concurrent RAG app users without optimization?', options: ['2 servers', '5 servers', '~20 servers', '100 servers'], answer: 2 },
  { q: 'Which optimization has the biggest impact on reducing server count at scale?', options: ['Minifying JavaScript', 'Semantic caching of LLM responses', 'Using shorter variable names', 'Switching to a faster font'], answer: 1 },
  { q: 'After applying caching + streaming + smart routing, the 10K user deployment drops from 20 to 8 servers. What percentage reduction is that?', options: ['20%', '40%', '60%', '80%'], answer: 2 },
]

export default function Quiz9_ScalingSimulator({ onComplete }) {
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
      <p style={{ color: 'var(--text-muted)' }}>{score >= 3 ? 'You can think at scale!' : 'Review the scaling simulator and try again!'}</p>
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
