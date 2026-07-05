import { useState } from 'react'
import { motion } from 'framer-motion'

const questions = [
  { q: 'Queues follow which principle?', options: ['LIFO — Last In, First Out', 'FILO — First In, Last Out', 'Random access order', 'FIFO — First In, First Out'], answer: 3 },
  { q: 'In a Queue, elements are added at the ___ and removed from the ___.', options: ['Front, Rear', 'Top, Bottom', 'Rear, Front', 'Middle, End'], answer: 2 },
  { q: 'A Circular Queue solves what problem?', options: ['Slow enqueue operations', 'Wasted space at the front of a linear queue', 'Overflow when the queue is full', 'Duplicate elements being inserted'], answer: 1 },
  { q: 'In a Priority Queue, which element is dequeued first?', options: ['The element that was inserted first', 'The element that was inserted last', 'The element with the lowest priority', 'The element with the highest priority, regardless of arrival order'], answer: 3 },
  { q: 'Which graph algorithm uses a Queue?', options: ['DFS — Depth-First Search', 'Dijkstra with a min-heap', 'BFS — Breadth-First Search', 'Bellman-Ford Algorithm'], answer: 2 },
]

export default function Quiz10_Queues({ onComplete }) {
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
      <p style={{ color: 'var(--text-muted)' }}>{score >= 3 ? 'Queue concepts clear!' : 'Review the topic and try again!'}</p>
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
