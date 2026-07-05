import { useState } from 'react'
import { motion } from 'framer-motion'

const questions = [
  { q: 'What are the three areas in Git?', options: ['Client, Server, Database', 'Working Directory, Staging Area, Repository', 'Frontend, Backend, Database', 'Local, Remote, Cloud'], answer: 1 },
  { q: 'What does "git add" do?', options: ['Creates a new branch', 'Moves changes from working directory to staging area', 'Pushes code to GitHub', 'Deletes a file'], answer: 1 },
  { q: 'What is a Git branch?', options: ['A backup of your code', 'A parallel copy of the codebase for independent work', 'A type of commit message', 'A cloud storage location'], answer: 1 },
  { q: 'In a merge conflict, what do <<<<<<< and >>>>>>> markers indicate?', options: ['Deleted code sections', 'The conflicting changes from each branch that Git could not auto-merge', 'Comments in the code', 'Error messages from the compiler'], answer: 1 },
  { q: 'What is a Pull Request?', options: ['Downloading code from GitHub', 'A request to merge your branch into another branch, with code review', 'A command to pull remote changes', 'A type of Git branch'], answer: 1 },
]

export default function Quiz12_Git({ onComplete }) {
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
      <p style={{ color: 'var(--text-muted)' }}>{score >= 3 ? 'Git fundamentals locked in!' : 'Review the topic and try again!'}</p>
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
