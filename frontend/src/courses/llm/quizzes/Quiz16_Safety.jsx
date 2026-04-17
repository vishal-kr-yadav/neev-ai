import { useState } from 'react'
import { motion } from 'framer-motion'

const questions = [
  { q: 'What is the primary source of AI bias?', options: ['Random hardware errors', 'Biases present in the training data reflecting societal inequalities', 'The programming language used', 'The size of the model'], answer: 1 },
  { q: 'What is the EU AI Act?', options: ['A plan to build a European AI model', 'A comprehensive regulatory framework classifying AI systems by risk level', 'A funding program for AI startups', 'A technical standard for model architectures'], answer: 1 },
  { q: 'How does RLHF (Reinforcement Learning from Human Feedback) contribute to AI safety?', options: ['It makes models run faster', 'It aligns model outputs with human values and preferences, reducing harmful responses', 'It increases model parameter count', 'It removes the need for training data'], answer: 1 },
  { q: 'What is a major challenge in deepfake detection?', options: ['Deepfakes are easy to spot visually', 'Detection methods must constantly evolve as generation techniques improve', 'Deepfakes only exist in video format', 'All deepfakes contain visible watermarks'], answer: 1 },
  { q: 'What is the "alignment problem" in AI?', options: ['Making models run on different hardware', 'The challenge of ensuring AI systems act in accordance with human intentions and values', 'Aligning text in model outputs', 'Synchronizing multiple models together'], answer: 1 },
]

export default function Quiz16_Safety({ onComplete }) {
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
      else { setDone(true); if (score + (correct ? 1 : 0) >= 3) onComplete() }
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
