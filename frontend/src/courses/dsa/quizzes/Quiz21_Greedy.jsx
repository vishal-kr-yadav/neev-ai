import { useState } from 'react'
import { motion } from 'framer-motion'

const questions = [
  { q: 'A Greedy algorithm makes decisions by:', options: ['Exploring all possible solutions recursively', 'Choosing the locally optimal option at each step', 'Using dynamic programming to memoize results', 'Backtracking when a choice leads to failure'], answer: 1 },
  { q: 'Greedy coin change works perfectly for standard denominations but fails for:', options: ['Denominations that are powers of 2', 'Arbitrary coin systems where local optimum ≠ global optimum', 'Coin systems with only odd denominations', 'Coin systems with more than 5 denominations'], answer: 1 },
  { q: "Activity Selection's greedy strategy is:", options: ['Pick the activity that starts earliest', 'Pick the activity with the shortest duration', 'Pick the activity that ends earliest', 'Pick the activity with the highest priority'], answer: 2 },
  { q: 'Fractional Knapsack can be solved greedily because:', options: ['Items have equal weights', 'The problem has overlapping subproblems', 'You can take fractions of items, so highest value/weight ratio first always works', 'The knapsack capacity is always very large'], answer: 2 },
  { q: 'When does a Greedy approach guarantee the optimal solution?', options: ['When the problem has overlapping subproblems', 'When the input is already sorted', 'When the problem can be solved recursively', 'When the problem has the greedy choice property'], answer: 3 },
]

export default function Quiz21_Greedy({ onComplete }) {
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
      <p style={{ color: 'var(--text-muted)' }}>{score >= 3 ? 'Greedy thinking mastered!' : 'Review the topic and try again!'}</p>
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
