import { useState } from 'react'
import { motion } from 'framer-motion'

const questions = [
  { q: 'What is the time complexity of Merge Sort?', options: ['O(n)', 'O(n²)', 'O(n log n) — always', 'O(log n)'], answer: 2 },
  { q: 'Merge Sort uses which strategy?', options: ['Greedy', 'Dynamic Programming', 'Divide and Conquer', 'Backtracking'], answer: 2 },
  { q: 'What is the space complexity of Merge Sort?', options: ['O(1)', 'O(log n)', 'O(n log n)', 'O(n) — needs extra arrays for merging'], answer: 3 },
  { q: 'How many levels does the recursion tree have for n elements?', options: ['n', 'n/2', 'log₂(n)', '2n'], answer: 2 },
  { q: 'Why is merging two sorted arrays O(n)?', options: ['Because sorting is always O(n)', 'Because we copy arrays directly', 'Each element is compared at most once using two pointers', 'Because recursion is O(1)'], answer: 2 },
]

export default function Quiz6_MergeSort({ onComplete }) {
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
      <p style={{ color: 'var(--text-muted)' }}>{score >= 3 ? 'Divide and conquer mastered!' : 'Review the topic and try again!'}</p>
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
