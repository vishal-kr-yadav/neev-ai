import { useState } from 'react'
import { motion } from 'framer-motion'

const questions = [
  { q: 'In a RAG chatbot request, which stage typically takes the longest?', options: ['JWT Authentication', 'Request parsing', 'LLM API call (GPT-4)', 'Response formatting'], answer: 2 },
  { q: 'If the LLM call takes 2000ms out of a 2300ms request, what % of time does it consume?', options: ['About 50%', 'About 70%', 'About 87%', 'About 95%'], answer: 2 },
  { q: 'Optimizing auth from 15ms to 5ms saves how much of total request time (2300ms)?', options: ['About 0.4%', 'About 5%', 'About 10%', 'About 25%'], answer: 0 },
  { q: 'What does "streaming" an LLM response do for the user?', options: ['Makes the LLM generate faster', 'Reduces perceived latency — user sees tokens arrive immediately', 'Uses less memory', 'Removes the need for authentication'], answer: 1 },
  { q: 'When scaling to 10K users, which is often the first bottleneck hit?', options: ['CPU running out', 'Disk space filling up', 'External API rate limits (e.g., OpenAI)', 'Running out of variable names'], answer: 2 },
]

export default function Quiz7_RequestAnatomy({ onComplete }) {
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
      <p style={{ color: 'var(--text-muted)' }}>{score >= 3 ? 'You understand production request anatomy!' : 'Review the topic and try again!'}</p>
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
