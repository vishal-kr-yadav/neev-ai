import { useState } from 'react'
import { motion } from 'framer-motion'

const questions = [
  { q: 'What is the time complexity of inserting at the HEAD of a linked list?', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], answer: 3 },
  { q: 'What is the main disadvantage of linked lists over arrays?', options: ['They use less memory', 'No random access — must traverse to reach an element', 'They cannot store integers', 'Insertion is always O(n)'], answer: 1 },
  { q: 'A doubly linked list differs from singly linked by:', options: ['It stores twice as many values per node', 'It can only traverse forward', 'Each node has pointers to both next AND previous nodes', 'It has a fixed size'], answer: 2 },
  { q: 'Inserting in the middle of a linked list (given the node) is:', options: ['O(n) — must rebuild the list', 'O(log n) — binary search needed', 'O(n²) — nested traversal', 'O(1) — just change pointers'], answer: 3 },
  { q: 'Which uses more memory per element?', options: ['Array — it pre-allocates extra space', 'Both use the same memory', 'Neither — it depends on the OS', 'Linked List — each node stores data plus pointer(s)'], answer: 3 },
]

export default function Quiz11_LinkedLists({ onComplete }) {
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
      <p style={{ color: 'var(--text-muted)' }}>{score >= 3 ? 'Linked List master!' : 'Review the topic and try again!'}</p>
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
