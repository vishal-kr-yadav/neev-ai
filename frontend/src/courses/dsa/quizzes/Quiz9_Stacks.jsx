import { useState } from 'react'
import { motion } from 'framer-motion'

const questions = [
  { q: 'Stacks follow which principle?', options: ['FIFO — First In, First Out', 'FILO — First In, Last Out', 'LIFO — Last In, First Out', 'Random access order'], answer: 2 },
  { q: 'Which operation looks at the top element without removing it?', options: ['Pop', 'Push', 'Peek', 'Enqueue'], answer: 2 },
  { q: 'What real-world feature uses a Stack?', options: ['A printer queue', 'The Undo button (Ctrl+Z)', 'A ticketing system', 'Loading a web page'], answer: 1 },
  { q: 'What happens when you call too many recursive functions without a base case?', options: ['The program runs forever silently', 'Stack Overflow', 'The heap memory fills up', 'The CPU overheats'], answer: 1 },
  { q: 'Balanced parentheses checking uses:', options: ['A Queue — enqueue opening brackets, dequeue and match closing brackets', 'A Hash Map — store bracket counts', 'A Stack — push opening brackets, pop and match closing brackets', 'A Linked List — traverse and compare'], answer: 2 },
]

export default function Quiz9_Stacks({ onComplete }) {
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
      <p style={{ color: 'var(--text-muted)' }}>{score >= 3 ? 'Stack operations mastered!' : 'Review the topic and try again!'}</p>
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
