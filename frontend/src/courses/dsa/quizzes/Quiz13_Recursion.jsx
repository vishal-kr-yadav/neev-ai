import { useState } from 'react'
import { motion } from 'framer-motion'

const questions = [
  { q: 'Every recursive function must have:', options: ['A loop inside it', 'At least two parameters', 'A base case to stop the recursion', 'A return type of void'], answer: 2 },
  { q: 'What happens if a recursive function has no base case?', options: ['It returns undefined automatically', 'It runs exactly once', 'It compiles but produces wrong output', 'Stack Overflow — infinite recursion'], answer: 3 },
  { q: 'Recursive Fibonacci has time complexity:', options: ['O(n) — linear scan', 'O(n log n) — divide and conquer', 'O(log n) — halves each step', 'O(2^n) — exponential due to redundant calculations'], answer: 3 },
  { q: 'What data structure tracks recursive function calls?', options: ['A Queue', 'A Heap', 'The Call Stack', 'A Hash Table'], answer: 2 },
  { q: 'Which problem is NATURALLY recursive?', options: ['Finding the maximum in a flat array', 'Reversing a string with two pointers', 'Sorting an array with bubble sort', 'Tree traversal — every subtree is itself a tree'], answer: 3 },
]

export default function Quiz13_Recursion({ onComplete }) {
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
      <p style={{ color: 'var(--text-muted)' }}>{score >= 3 ? 'Recursion unlocked!' : 'Review the topic and try again!'}</p>
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
