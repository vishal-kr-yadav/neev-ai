import { useState } from 'react'
import { motion } from 'framer-motion'

const questions = [
  { q: 'What does Selection Sort do in each iteration?', options: ['Swaps every adjacent pair', 'Splits the array in half', 'Finds the minimum element and places it at the beginning of unsorted section', 'Inserts elements one by one from the right'], answer: 2 },
  { q: 'What is the main advantage of Insertion Sort over other O(n²) sorts?', options: ['It uses less memory', 'It is easier to code', 'It runs in O(n) on nearly sorted data', 'It never performs any swaps'], answer: 2 },
  { q: 'How many swaps does Selection Sort perform per iteration?', options: ['n swaps', 'At most 1 swap', 'Exactly 2 swaps', 'No swaps'], answer: 1 },
  { q: 'Insertion Sort is similar to:', options: ['Organizing books by weight', 'Shuffling a deck of cards randomly', 'Sorting playing cards in your hand', 'Building a pyramid layer by layer'], answer: 2 },
  { q: 'Which sort is best for small arrays (n < 20) in practice?', options: ['Merge Sort', 'Quick Sort', 'Heap Sort', 'Insertion Sort'], answer: 3 },
]

export default function Quiz5_SelectionInsertion({ onComplete }) {
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
      <p style={{ color: 'var(--text-muted)' }}>{score >= 3 ? 'You\'ve nailed Selection and Insertion Sort!' : 'Review the topic and try again!'}</p>
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
