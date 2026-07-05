import { useState } from 'react'
import { motion } from 'framer-motion'

const questions = [
  { q: "Dijkstra's algorithm finds:", options: ['The longest path between two vertices', 'The shortest path from a source to all other vertices in a weighted graph', 'The minimum spanning tree of a graph', 'All cycles in a directed graph'], answer: 1 },
  { q: "Dijkstra's algorithm FAILS when:", options: ['The graph is undirected', 'The graph has more edges than vertices', 'The graph has negative weight edges', 'The graph has more than 1000 vertices'], answer: 2 },
  { q: "The 'relaxation' step in Dijkstra's updates a neighbor's distance if:", options: ['The neighbor has not been visited yet', 'The neighbor has more edges than the current node', 'current_distance + edge_weight < neighbor\'s current distance', 'The edge weight is greater than zero'], answer: 2 },
  { q: "Dijkstra's algorithm uses which data structure for efficiency?", options: ['A stack', 'A regular queue', 'A hash map', 'A min-heap / priority queue'], answer: 3 },
  { q: "What is the time complexity of Dijkstra's with a min-heap?", options: ['O(V²)', 'O(E log E)', 'O(V + E)', 'O((V + E) log V)'], answer: 3 },
]

export default function Quiz19_Dijkstra({ onComplete }) {
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
      <p style={{ color: 'var(--text-muted)' }}>{score >= 3 ? 'Shortest path navigator!' : 'Review the topic and try again!'}</p>
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
