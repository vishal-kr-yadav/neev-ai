import { useState } from 'react'
import { motion } from 'framer-motion'

const questions = [
  { q: 'Dynamic Programming is applicable when a problem has:', options: ['Only overlapping subproblems but no optimal substructure', 'No subproblems at all', 'Optimal substructure AND overlapping subproblems', 'Independent subproblems that do not repeat'], answer: 2 },
  { q: 'Memoization is:', options: ['Bottom-up approach — fill a table iteratively', 'Top-down approach — cache results of recursive calls', 'Randomly storing results to speed up future runs', 'A technique only used in sorting algorithms'], answer: 1 },
  { q: 'Recursive Fibonacci without memoization has complexity:', options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(2^n)'], answer: 3 },
  { q: 'Fibonacci WITH memoization has complexity:', options: ['O(log n)', 'O(n)', 'O(n²)', 'O(2^n)'], answer: 1 },
  { q: 'The Knapsack problem is solved optimally with:', options: ['Greedy algorithm (always pick the highest value item)', 'Binary search on the item weights', 'Dynamic Programming (not greedy, because items can\'t be fractioned)', 'BFS over the item list'], answer: 2 },
]

export default function Quiz20_DP({ onComplete }) {
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
      <p style={{ color: 'var(--text-muted)' }}>{score >= 3 ? 'Dynamic Programming conquered!' : 'Review the topic and try again!'}</p>
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
