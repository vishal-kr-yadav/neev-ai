import { useState } from 'react'
import { motion } from 'framer-motion'

const questions = [
  { q: 'Why does multiprocessing achieve true parallelism in Python?', options: ['It removes the GIL entirely', 'Each process has its own GIL and Python interpreter', 'It uses special CPU instructions', 'It runs on GPU instead of CPU'], answer: 1 },
  { q: 'What is the main downside of multiprocessing vs threading?', options: ['It cannot run in parallel', 'Each process uses its own memory — higher memory overhead', 'It is always slower', 'It only works on Linux'], answer: 1 },
  { q: 'For a 4-core CPU server, what is the ideal number of worker processes?', options: ['1 — to avoid overhead', '4 — one per core', '100 — more is always better', '8 — double the cores'], answer: 1 },
  { q: "What does Amdahl's Law tell us?", options: ['More cores always mean linear speedup', 'The serial portion of code limits maximum parallel speedup', 'Python cannot be parallelized', 'Threads are always better than processes'], answer: 1 },
  { q: 'If 80% of your code is parallelizable, what is the maximum speedup with infinite cores?', options: ['80x', '5x', '10x', '2x'], answer: 1 },
]

export default function Quiz5_MultiProcessing({ onComplete }) {
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
      <p style={{ color: 'var(--text-muted)' }}>{score >= 3 ? 'Multiprocessing concepts nailed!' : 'Review the topic and try again!'}</p>
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
