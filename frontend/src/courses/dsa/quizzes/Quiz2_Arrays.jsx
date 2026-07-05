import { useState } from 'react'
import { motion } from 'framer-motion'

const questions = [
  { q: 'What is the time complexity of accessing an element by index in an array?', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], answer: 3 },
  { q: 'What happens when you insert an element at the beginning of an array?', options: ['Only the first element changes', 'All existing elements must shift right', 'The array is recreated from scratch', 'Nothing changes'], answer: 1 },
  { q: 'In a zero-indexed array of 10 elements, what is the last valid index?', options: ['10', '8', '9', '7'], answer: 2 },
  { q: 'What does a dynamic array do when it runs out of space?', options: ['Throws an error immediately', 'Deletes the oldest element', 'Creates a new array with double the size and copies elements', 'Compresses existing elements'], answer: 2 },
  { q: 'In a 2D array, how do you access row 2, column 3?', options: ['array[3][2]', 'array[2,3]', 'array(2)(3)', 'array[2][3]'], answer: 3 },
]

export default function Quiz2_Arrays({ onComplete }) {
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
      <p style={{ color: 'var(--text-muted)' }}>{score >= 3 ? 'Excellent! You\'ve mastered array fundamentals!' : 'Review the topic and try again!'}</p>
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
