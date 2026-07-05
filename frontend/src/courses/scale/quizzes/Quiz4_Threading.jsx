import { useState } from 'react'
import { motion } from 'framer-motion'

const questions = [
  { q: 'What is the GIL in Python?', options: ['A graphics library', 'A lock that allows only one thread to execute Python bytecode at a time', 'A garbage collector', 'A type of thread pool'], answer: 1 },
  { q: 'When does Python threading actually help with performance?', options: ['For CPU-bound tasks like number crunching', 'For I/O-bound tasks like API calls and database queries', 'It never helps — always use multiprocessing', 'Only when using exactly 2 threads'], answer: 1 },
  { q: 'What happens to 4 Python threads doing CPU-bound work?', options: ['They run 4x faster', 'They take turns — same speed as 1 thread (or slower)', 'Python automatically switches to multiprocessing', 'They each get their own GIL'], answer: 1 },
  { q: 'How does async/await differ from threading?', options: ['Async uses multiple cores', 'Async uses one thread with cooperative multitasking during I/O', 'Async is always slower', 'They are identical'], answer: 1 },
  { q: 'What do threads within the same process share?', options: ['Nothing — they are fully isolated', 'Only CPU time', 'Memory space, file handles, and global variables', 'Only the GIL'], answer: 2 },
]

export default function Quiz4_Threading({ onComplete }) {
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
      <p style={{ color: 'var(--text-muted)' }}>{score >= 3 ? 'You get threading and the GIL!' : 'Review the topic and try again!'}</p>
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
