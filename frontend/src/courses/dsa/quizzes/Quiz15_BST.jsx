import { useState } from 'react'
import { motion } from 'framer-motion'

const questions = [
  { q: 'In a BST, all values in the LEFT subtree are:', options: ['Greater than the node\'s value', 'Equal to the node\'s value', 'Less than the node\'s value', 'Random — BSTs have no ordering rule'], answer: 2 },
  { q: 'What is the time complexity of search in a balanced BST?', options: ['O(1)', 'O(n)', 'O(n log n)', 'O(log n)'], answer: 3 },
  { q: 'In-Order traversal of a BST gives:', options: ['Elements in reverse order', 'Elements in insertion order', 'Elements in random order', 'Elements in sorted (ascending) order'], answer: 3 },
  { q: 'What happens when you insert sorted data [1,2,3,4,5] into a BST?', options: ['It builds a perfectly balanced tree', 'It creates a tree with height log n', 'It degenerates into a linked list (straight line)', 'It throws an error for duplicate structure'], answer: 2 },
  { q: 'To delete a BST node with two children, you replace it with:', options: ['The node\'s left child directly', 'Any arbitrary leaf node', 'The node\'s right child directly', 'Its in-order successor (smallest node in right subtree)'], answer: 3 },
]

export default function Quiz15_BST({ onComplete }) {
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
      <p style={{ color: 'var(--text-muted)' }}>{score >= 3 ? 'BST mastered!' : 'Review the topic and try again!'}</p>
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
