import { useState } from 'react'
import { motion } from 'framer-motion'

const questions = [
  { q: 'What is the purpose of a Staging environment?', options: ['For end users to access the app', 'A production mirror for integration testing before release', 'For storing backup data', 'To run marketing campaigns'], answer: 1 },
  { q: 'What does UAT stand for and who performs it?', options: ['Universal Access Test — performed by developers', 'User Acceptance Testing — performed by business stakeholders and QA', 'Unified Automation Testing — performed by CI/CD', 'User Authentication Token — performed by security team'], answer: 1 },
  { q: 'In a Blue-Green deployment, how do you rollback if the new version has a bug?', options: ['Redeploy the old code from scratch', 'Switch traffic back to the blue (old) environment instantly', 'Restart the servers', 'Ask users to clear their cache'], answer: 1 },
  { q: 'What is a Canary deployment?', options: ['Deploying code only at night', 'Sending a small percentage of traffic to the new version first', 'Testing in a sandbox environment', 'Deploying without any tests'], answer: 1 },
  { q: 'Why is it dangerous to use production API keys in a development environment?', options: ['The code runs slower', 'You might accidentally run up real charges or affect real data', 'The keys expire faster', 'It violates the GPL license'], answer: 1 },
]

export default function Quiz11_Environments({ onComplete }) {
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
      <p style={{ color: 'var(--text-muted)' }}>{score >= 3 ? 'Deployment environments mastered!' : 'Review the topic and try again!'}</p>
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
