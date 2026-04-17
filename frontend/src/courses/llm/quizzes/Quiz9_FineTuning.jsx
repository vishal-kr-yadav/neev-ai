import { useState } from 'react'
import { motion } from 'framer-motion'

const questions = [
  { q: 'What is fine-tuning?', options: ['Training a model from scratch', 'Adjusting a pre-trained model for a specific task', 'Deleting model weights', 'Making the model smaller'], answer: 1 },
  { q: 'What does RLHF stand for?', options: ['Rapid Learning High Fidelity', 'Reinforcement Learning from Human Feedback', 'Recursive Language Heuristic Framework', 'Real-time Language Helper Function'], answer: 1 },
  { q: 'What is LoRA?', options: ['A new LLM model', 'Low-Rank Adaptation — trains small adapters instead of all weights', 'A type of GPU', 'A tokenization method'], answer: 1 },
  { q: 'In RLHF, what does the reward model learn?', options: ['How to generate text', 'Which responses humans prefer', 'How to tokenize input', 'How to compress models'], answer: 1 },
  { q: 'Why is fine-tuning cheaper than pre-training?', options: ['It uses less data and fewer parameter updates', 'It uses a different programming language', 'It runs on phones instead of GPUs', 'It skips the neural network entirely'], answer: 0 },
]

export default function Quiz9_FineTuning({ onComplete }) {
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
      <p style={{ color: 'var(--text-muted)' }}>{score >= 3 ? 'Great job on fine-tuning & RLHF!' : 'Review the topic and try again!'}</p>
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
