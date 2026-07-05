import { useState } from 'react'
import { motion } from 'framer-motion'

const questions = [
  { q: 'What is the average time complexity of HashMap lookup?', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'], answer: 2 },
  { q: 'What is a hash collision?', options: ['When the HashMap runs out of memory', 'Two different keys produce the same hash value', 'When a key maps to a null value', 'When the load factor drops below 0.5'], answer: 1 },
  { q: 'Chaining handles collisions by:', options: ['Rehashing the key with a new function', 'Evicting the older entry from the bucket', 'Storing multiple entries in a linked list at the same bucket', 'Skipping the colliding key entirely'], answer: 2 },
  { q: 'What triggers a HashMap resize?', options: ['When any bucket holds more than one entry', 'When the HashMap is first created', 'When a key is deleted from the map', 'When the load factor exceeds a threshold (typically 0.75)'], answer: 3 },
  { q: 'The Two Sum problem can be solved in O(n) using:', options: ['A sorted array and binary search', 'A nested loop over all pairs', 'A HashMap to store complements', 'A priority queue (min-heap)'], answer: 2 },
]

export default function Quiz12_HashMaps({ onComplete }) {
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
      <p style={{ color: 'var(--text-muted)' }}>{score >= 3 ? 'Hashing expert!' : 'Review the topic and try again!'}</p>
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
