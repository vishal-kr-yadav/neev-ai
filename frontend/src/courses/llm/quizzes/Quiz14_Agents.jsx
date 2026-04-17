import { useState } from 'react'
import { motion } from 'framer-motion'

const questions = [
  { q: 'What is an AI agent?', options: ['A chatbot that only answers questions', 'An AI system that can reason, plan, and take actions autonomously to achieve goals', 'A robot with physical capabilities', 'A data visualization tool'], answer: 1 },
  { q: 'What does the ReAct pattern stand for in AI agents?', options: ['Reactive Actions', 'Reasoning and Acting', 'Real-time Activation', 'Recursive Action Training'], answer: 1 },
  { q: 'What is the purpose of tool use in AI agents?', options: ['To make the model larger', 'To allow the agent to interact with external systems like APIs, databases, and code execution', 'To speed up training', 'To reduce model parameters'], answer: 1 },
  { q: 'Which type of memory allows an agent to recall information from earlier in a conversation?', options: ['Procedural memory', 'Short-term (working) memory', 'Sensory memory', 'Cache memory'], answer: 1 },
  { q: 'What is LangChain?', options: ['A blockchain for AI', 'A framework for building applications powered by LLMs, including agents and chains', 'A new programming language', 'A model training platform'], answer: 1 },
]

export default function Quiz14_Agents({ onComplete }) {
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
