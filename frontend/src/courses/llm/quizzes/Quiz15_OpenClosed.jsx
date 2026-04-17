import { useState } from 'react'
import { motion } from 'framer-motion'

const questions = [
  { q: 'What type of license does Meta\'s Llama use?', options: ['Fully proprietary', 'Open-source with a community license allowing broad use', 'Public domain', 'Subscription-based only'], answer: 1 },
  { q: 'What is a key advantage of open-source LLMs?', options: ['They are always more accurate', 'You can inspect, modify, and self-host them for full control and privacy', 'They require no compute resources', 'They never need fine-tuning'], answer: 1 },
  { q: 'What does quantization do to a model?', options: ['Makes it more accurate', 'Reduces model size by using lower-precision numbers, trading some accuracy for efficiency', 'Increases the number of parameters', 'Converts it to a different programming language'], answer: 1 },
  { q: 'What is Hugging Face\'s role in the AI ecosystem?', options: ['A cloud computing provider', 'A platform for sharing models, datasets, and ML tools with a large open-source community', 'A hardware manufacturer', 'A regulatory body for AI'], answer: 1 },
  { q: 'When is it most appropriate to use a closed-source model like GPT-4 or Claude?', options: ['When you need to modify the model weights', 'When you need state-of-the-art performance and don\'t require full model control', 'When budget is the only concern', 'When you need to train from scratch'], answer: 1 },
]

export default function Quiz15_OpenClosed({ onComplete }) {
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
