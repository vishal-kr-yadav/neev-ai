import { useState } from 'react'
import { motion } from 'framer-motion'

const questions = [
  { q: 'Two Pointers technique reduces brute force O(n²) to:', options: ['O(n log n)', 'O(n)', 'O(log n)', 'O(n³)'], answer: 1 },
  { q: 'In the Two Sum problem on a sorted array, if the sum is too small, you:', options: ['Move the right pointer left (to decrease the sum)', 'Move the left pointer right (to increase the sum)', 'Reset both pointers to the start', 'Move both pointers toward the center'], answer: 1 },
  { q: 'Sliding Window is useful for:', options: ['Finding the longest path in a graph', 'Sorting elements in place', 'Finding maximum/minimum sum of k consecutive elements', 'Detecting cycles in a linked list'], answer: 2 },
  { q: 'In variable-size sliding window, you shrink the window when:', options: ['The window size exceeds the array length', 'The current window meets or exceeds the target condition', 'The left pointer reaches the middle of the array', 'The sum of the window becomes negative'], answer: 1 },
  { q: "'Container With Most Water' moves which pointer?", options: ['The pointer at the taller line (since it already contributes maximum height)', 'Both pointers simultaneously toward the center', 'Always the right pointer regardless of height', 'The pointer at the shorter line (to potentially find a taller line)'], answer: 3 },
]

export default function Quiz22_TwoPointers({ onComplete }) {
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
      <p style={{ color: 'var(--text-muted)' }}>{score >= 3 ? 'Pattern recognition ace!' : 'Review the topic and try again!'}</p>
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
