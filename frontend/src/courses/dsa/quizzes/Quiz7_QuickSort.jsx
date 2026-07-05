import { useState } from 'react'
import { motion } from 'framer-motion'

const questions = [
  { q: 'What is the average time complexity of Quick Sort?', options: ['O(n)', 'O(n²)', 'O(n log n)', 'O(log n)'], answer: 2 },
  { q: "What is Quick Sort's worst case, and when does it happen?", options: ['O(n log n), when the array is already sorted', 'O(n²), when the pivot is always the smallest or largest element', 'O(n²), when all elements are equal', 'O(n³), when recursion depth exceeds n'], answer: 1 },
  { q: 'After one partition step, what is true about the pivot?', options: ['It is removed from the array', 'It is swapped with the first element', 'It is in its final correct position', 'It is placed at the end of the array'], answer: 2 },
  { q: "What is Quick Sort's space complexity?", options: ['O(1)', 'O(n)', 'O(log n) — for the recursion stack', 'O(n log n)'], answer: 2 },
  { q: 'Why is Quick Sort often faster than Merge Sort in practice?', options: ['It always runs in O(n log n)', 'It uses fewer comparisons mathematically', 'Better cache locality and no extra array allocation', 'It never has a worst case'], answer: 2 },
]

export default function Quiz7_QuickSort({ onComplete }) {
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
      <p style={{ color: 'var(--text-muted)' }}>{score >= 3 ? 'Partitioning pro!' : 'Review the topic and try again!'}</p>
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
