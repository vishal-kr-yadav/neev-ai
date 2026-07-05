import { useState } from 'react'
import { motion } from 'framer-motion'

const questions = [
  { q: 'What is the prerequisite for Binary Search to work?', options: ['The array must have an even number of elements', 'The array must be sorted', 'The array must contain only integers', 'The array must be stored in a hash table'], answer: 1 },
  { q: 'How many steps does Binary Search need for 1,000,000 elements?', options: ['1,000,000', '500,000', '1,000', '~20 (log₂ of 1 million)'], answer: 3 },
  { q: 'In Binary Search, if the target is less than the middle element, you:', options: ['Stop and return -1', 'Search the right half', 'Search the left half', 'Start over from the beginning'], answer: 2 },
  { q: 'What is the time complexity of Binary Search?', options: ['O(1)', 'O(n)', 'O(n log n)', 'O(log n)'], answer: 3 },
  { q: 'Which real-world task is analogous to Binary Search?', options: ['Scrolling through a social media feed from the top', 'Searching every page of a book one by one', 'Looking up a word in a dictionary by opening to the middle', 'Trying all keys on a keyring one by one'], answer: 2 },
]

export default function Quiz8_BinarySearch({ onComplete }) {
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
      <p style={{ color: 'var(--text-muted)' }}>{score >= 3 ? 'Search master!' : 'Review the topic and try again!'}</p>
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
