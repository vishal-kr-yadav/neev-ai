import { useState } from 'react'
import { motion } from 'framer-motion'

const questions = [
  { q: 'What does "multimodal" mean in the context of AI models?', options: ['Models that run on multiple GPUs', 'Models that can process and generate multiple types of data (text, images, audio)', 'Models trained on multiple datasets', 'Models with multiple output layers'], answer: 1 },
  { q: 'What is the primary purpose of a Vision Transformer (ViT)?', options: ['Generating 3D models', 'Processing and understanding images using transformer architecture', 'Converting text to speech', 'Compressing video files'], answer: 1 },
  { q: 'Which model is natively multimodal, accepting both text and images as input?', options: ['GPT-2', 'BERT', 'GPT-4V', 'Word2Vec'], answer: 2 },
  { q: 'What role does CLIP play in multimodal AI?', options: ['It generates images from scratch', 'It connects text and image representations in a shared embedding space', 'It compresses audio files', 'It translates between languages'], answer: 1 },
  { q: 'Why do images typically cost more tokens than text in multimodal models?', options: ['Images are always higher quality', 'Images contain dense spatial information requiring many tokens to represent', 'Image tokens are priced higher arbitrarily', 'Images need encryption tokens'], answer: 1 },
]

export default function Quiz11_Multimodal({ onComplete }) {
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
