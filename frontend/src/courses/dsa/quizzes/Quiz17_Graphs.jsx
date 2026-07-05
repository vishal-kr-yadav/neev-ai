import { useState } from 'react'
import { motion } from 'framer-motion'

const questions = [
  { q: 'A graph consists of:', options: ['Only nodes arranged in a tree', 'Vertices (nodes) and Edges (connections)', 'A root node with two children each', 'A sequence of elements in sorted order'], answer: 1 },
  { q: 'In a directed graph, edge (A→B) means:', options: ['A and B are the same node', 'You can go from B to A, but not from A to B', 'You can go from A to B, but not necessarily from B to A', 'A and B are connected bidirectionally'], answer: 2 },
  { q: 'An adjacency matrix for V vertices uses space:', options: ['O(V)', 'O(E)', 'O(V²)', 'O(V + E)'], answer: 2 },
  { q: 'The degree of a vertex in an undirected graph is:', options: ['The total number of vertices in the graph', 'The weight of the heaviest edge connected to it', 'The depth of the vertex in the graph', 'The number of edges connected to it'], answer: 3 },
  { q: 'A cycle in a graph is:', options: ['A path with no repeated vertices', 'A path that starts and ends at the same vertex', 'An edge that connects two disconnected components', 'A vertex with no outgoing edges'], answer: 1 },
]

export default function Quiz17_Graphs({ onComplete }) {
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
      <p style={{ color: 'var(--text-muted)' }}>{score >= 3 ? 'Graph fundamentals clear!' : 'Review the topic and try again!'}</p>
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
