import { useState } from 'react'
import { motion } from 'framer-motion'

const questions = [
  { q: 'What are embeddings in the context of AI?', options: ['Compressed model weights', 'Dense numerical vector representations of data that capture semantic meaning', 'Encrypted tokens for security', 'Physical hardware components in GPUs'], answer: 1 },
  { q: 'What does cosine similarity measure between two embeddings?', options: ['The physical distance between vectors', 'The angle between two vectors, indicating semantic similarity', 'The number of shared dimensions', 'The total magnitude of both vectors'], answer: 1 },
  { q: 'What is the primary purpose of a vector database?', options: ['Storing relational tables', 'Efficiently storing and querying high-dimensional embeddings for similarity search', 'Running SQL queries faster', 'Backing up model checkpoints'], answer: 1 },
  { q: 'In the famous Word2Vec analogy, what does "King - Man + Woman" approximately equal?', options: ['Princess', 'Queen', 'Empress', 'Duchess'], answer: 1 },
  { q: 'How does semantic search differ from keyword search?', options: ['Semantic search is always faster', 'Semantic search understands meaning and intent, not just exact word matches', 'Keyword search is more accurate', 'There is no difference'], answer: 1 },
]

export default function Quiz13_Embeddings({ onComplete }) {
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
      <p style={{ color: 'var(--text-muted)' }}>{score >= 3 ? 'Great job!' : 'Review the topic and try again!'}</p>
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
