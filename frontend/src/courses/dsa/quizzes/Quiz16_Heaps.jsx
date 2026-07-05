import { useState } from 'react'
import { motion } from 'framer-motion'

const questions = [
  { q: 'In a Min-Heap, the parent is always:', options: ['Larger than or equal to its children', 'Smaller than or equal to its children', 'Equal to its children', 'Unrelated to its children'], answer: 1 },
  { q: 'What is the time complexity of finding the minimum in a min-heap?', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'], answer: 2 },
  { q: 'A heap is stored as:', options: ['A linked list with parent pointers', 'A binary search tree', 'A flat array using index formulas (parent = (i-1)/2)', 'A doubly linked list'], answer: 2 },
  { q: 'After removing the root from a heap, the fix-up operation is called:', options: ['Bubble up (or heapify up)', 'Rotate left', 'Sink down (or heapify down)', 'Rebalance'], answer: 2 },
  { q: 'Which algorithm uses a heap/priority queue?', options: ['Binary search', 'Bubble sort', 'Merge sort', "Dijkstra's shortest path algorithm"], answer: 3 },
]

export default function Quiz16_Heaps({ onComplete }) {
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
      <p style={{ color: 'var(--text-muted)' }}>{score >= 3 ? 'Heap operations mastered!' : 'Review the topic and try again!'}</p>
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
