import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Trophy, RotateCcw, Home } from 'lucide-react'

const questions = [
  {
    type: 'bucket',
    title: 'Sort: What does an LLM actually do?',
    instruction: 'Tap items into YES or NO',
    items: [
      { text: 'Predict next tokens', yes: true },
      { text: 'Store a database of facts', yes: false },
      { text: 'Learn patterns from text', yes: true },
      { text: 'Think and reason consciously', yes: false },
    ],
  },
  {
    type: 'order',
    title: 'Order: Tokenization steps',
    instruction: 'Click in correct order (first to last)',
    items: ['Split into characters', 'Find common pairs', 'Merge frequently', 'Final sub-word tokens'],
  },
  {
    type: 'highlight',
    title: 'Highlight: Which are Transformer components?',
    instruction: 'Tap all that belong in a Transformer',
    items: [
      { text: 'Self-Attention', correct: true },
      { text: 'Backpropagation', correct: false },
      { text: 'Feed Forward Network', correct: true },
      { text: 'Convolution Layer', correct: false },
      { text: 'Positional Encoding', correct: true },
      { text: 'Pooling Layer', correct: false },
    ],
  },
  {
    type: 'slider',
    title: 'Guess: What temperature made this?',
    output: '"The old wizard conjured quantum butterflies that spoke fluent calculus"',
    answer: 1.0,
    tolerance: 0.2,
  },
  {
    type: 'bucket',
    title: 'Sort: Fact or Hallucination?',
    instruction: 'Is this statement about AI true?',
    items: [
      { text: 'Attention lets words look at other words', yes: true },
      { text: 'LLMs can browse the internet while generating', yes: false },
      { text: 'Training uses human feedback (RLHF)', yes: true },
      { text: 'LLMs truly understand language meaning', yes: false },
    ],
  },
  {
    type: 'highlight',
    title: 'Highlight: Good prompting practices',
    instruction: 'Tap all good practices',
    items: [
      { text: 'Be specific about format', correct: true },
      { text: 'Use vague instructions', correct: false },
      { text: 'Provide examples (few-shot)', correct: true },
      { text: 'Ask to think step-by-step', correct: true },
      { text: 'Write as short as possible', correct: false },
    ],
  },
  {
    type: 'order',
    title: 'Order: LLM Training Pipeline',
    instruction: 'Arrange from first to last stage',
    items: ['Pre-training on text', 'Supervised fine-tuning', 'RLHF with human rankings', 'Deployment'],
  },
  {
    type: 'slider',
    title: 'Guess: What temperature made this?',
    output: '"The sun rises in the east. The sun rises in the east. The sun rises in the east."',
    answer: 0.1,
    tolerance: 0.2,
  },
  {
    type: 'highlight',
    title: 'Highlight: What can go wrong with LLMs?',
    instruction: 'Tap all real problems',
    items: [
      { text: 'Hallucinating false facts', correct: true },
      { text: 'Knowledge cutoff date', correct: true },
      { text: 'They get tired after long chats', correct: false },
      { text: 'Bias from training data', correct: true },
      { text: 'They forget their programming', correct: false },
    ],
  },
  {
    type: 'bucket',
    title: 'Sort: Query, Key, or neither?',
    instruction: 'In attention: is this about Query (YES) or not?',
    items: [
      { text: '"What am I looking for?"', yes: true },
      { text: '"What information do I have?"', yes: false },
      { text: 'Searches for relevant context', yes: true },
      { text: 'Stores the actual data values', yes: false },
    ],
  },
]

function BucketQ({ q, onAnswer }) {
  const [remaining, setRemaining] = useState([...q.items])
  const [yesItems, setYesItems] = useState([])
  const [noItems, setNoItems] = useState([])
  const current = remaining[0]

  const sort = (isYes) => {
    if (!current) return
    if (isYes) setYesItems((p) => [...p, current])
    else setNoItems((p) => [...p, current])
    const next = remaining.slice(1)
    setRemaining(next)
    if (next.length === 0) {
      const score = q.items.filter((item) => {
        const inYes = [...yesItems, ...(isYes ? [current] : [])].some((y) => y.text === item.text)
        return item.yes === inYes
      }).length
      setTimeout(() => onAnswer(score === q.items.length), 300)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <motion.div onClick={() => sort(true)} whileHover={current ? { scale: 1.03 } : {}}
          style={{ flex: 1, minHeight: 100, padding: 16, borderRadius: 14, background: '#f0fdf4', border: '2px dashed #86efac', cursor: current ? 'pointer' : 'default', textAlign: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#16a34a', marginBottom: 8 }}>YES</div>
          {yesItems.map((i) => <div key={i.text} style={{ fontSize: 12, color: '#16a34a', marginBottom: 4 }}>{i.text}</div>)}
        </motion.div>
        <motion.div onClick={() => sort(false)} whileHover={current ? { scale: 1.03 } : {}}
          style={{ flex: 1, minHeight: 100, padding: 16, borderRadius: 14, background: '#fef2f2', border: '2px dashed #fca5a5', cursor: current ? 'pointer' : 'default', textAlign: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#dc2626', marginBottom: 8 }}>NO</div>
          {noItems.map((i) => <div key={i.text} style={{ fontSize: 12, color: '#dc2626', marginBottom: 4 }}>{i.text}</div>)}
        </motion.div>
      </div>
      {current && (
        <motion.div key={current.text} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', padding: 20, background: 'white', borderRadius: 14, border: '1px solid var(--border)', fontSize: 16, fontWeight: 500, boxShadow: 'var(--shadow-sm)' }}>
          {current.text}
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>Tap a bucket above</div>
        </motion.div>
      )}
    </div>
  )
}

function OrderQ({ q, onAnswer }) {
  const [shuffled] = useState(() => [...q.items].sort(() => Math.random() - 0.5))
  const [placed, setPlaced] = useState([])
  const [avail, setAvail] = useState(() => shuffled.map((_, i) => i))

  const place = (sIdx) => {
    const newPlaced = [...placed, sIdx]
    setPlaced(newPlaced)
    setAvail((p) => p.filter((i) => i !== sIdx))
    if (newPlaced.length === q.items.length) {
      const correct = newPlaced.every((sIdx, pIdx) => shuffled[sIdx] === q.items[pIdx])
      setTimeout(() => onAnswer(correct), 500)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {avail.map((sIdx) => (
          <motion.button key={shuffled[sIdx]} onClick={() => place(sIdx)} whileHover={{ scale: 1.05 }}
            style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'white', cursor: 'pointer', fontSize: 13, color: 'var(--text-primary)', boxShadow: 'var(--shadow-sm)' }}>
            {shuffled[sIdx]}
          </motion.button>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {placed.map((sIdx, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#ede9fe', borderRadius: 10 }}>
            <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#4f46e5', color: 'white', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
            <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>{shuffled[sIdx]}</span>
          </div>
        ))}
        {placed.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: 16, textAlign: 'center' }}>Click items above in order</div>}
      </div>
    </div>
  )
}

function HighlightQ({ q, onAnswer }) {
  const [selected, setSelected] = useState(new Set())
  const [submitted, setSubmitted] = useState(false)

  const toggle = (i) => {
    if (submitted) return
    setSelected((p) => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n })
  }
  const submit = () => {
    const correct = q.items.every((item, i) => item.correct === selected.has(i))
    setSubmitted(true)
    setTimeout(() => onAnswer(correct), 500)
  }

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        {q.items.map((item, i) => (
          <motion.button key={item.text} onClick={() => toggle(i)} whileHover={{ scale: 1.05 }}
            style={{
              padding: '12px 18px', borderRadius: 12, fontSize: 14, cursor: submitted ? 'default' : 'pointer',
              border: selected.has(i) ? '2px solid #4f46e5' : '2px solid var(--border)',
              background: selected.has(i) ? '#ede9fe' : 'white',
              color: selected.has(i) ? '#4f46e5' : 'var(--text-primary)', fontWeight: 500, transition: 'all 0.2s',
            }}>
            {selected.has(i) && '✓ '}{item.text}
          </motion.button>
        ))}
      </div>
      {!submitted && (
        <motion.button whileHover={{ scale: 1.05 }} onClick={submit} disabled={selected.size === 0}
          style={{
            padding: '10px 28px', background: selected.size > 0 ? 'var(--gradient-primary)' : 'var(--bg-secondary)',
            border: 'none', borderRadius: 10, color: 'white', fontSize: 14, fontWeight: 600,
            cursor: selected.size > 0 ? 'pointer' : 'default', opacity: selected.size > 0 ? 1 : 0.4,
          }}>
          Confirm
        </motion.button>
      )}
    </div>
  )
}

function SliderQ({ q, onAnswer }) {
  const [guess, setGuess] = useState(0.5)
  const [submitted, setSubmitted] = useState(false)

  const submit = () => {
    setSubmitted(true)
    setTimeout(() => onAnswer(Math.abs(guess - q.answer) <= q.tolerance), 800)
  }

  return (
    <div>
      <div style={{
        padding: 24, background: 'var(--bg-secondary)', borderRadius: 14,
        fontSize: 16, fontStyle: 'italic', textAlign: 'center', marginBottom: 24,
        border: '1px solid var(--border)', lineHeight: 1.7, color: 'var(--text-primary)',
      }}>
        {q.output}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
        <span>🧊</span>
        <input type="range" min="0.1" max="1.0" step="0.1" value={guess}
          onChange={(e) => !submitted && setGuess(parseFloat(e.target.value))}
          style={{ flex: 1, accentColor: '#4f46e5' }} />
        <span>🔥</span>
        <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)', minWidth: 40, textAlign: 'center' }}>{guess.toFixed(1)}</span>
      </div>
      {!submitted && (
        <motion.button whileHover={{ scale: 1.05 }} onClick={submit}
          style={{ padding: '10px 28px', background: 'var(--gradient-primary)', border: 'none', borderRadius: 10, color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          Lock In
        </motion.button>
      )}
      {submitted && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ fontSize: 14, color: Math.abs(guess - q.answer) <= q.tolerance ? '#16a34a' : '#f59e0b', fontWeight: 600 }}>
          {Math.abs(guess - q.answer) <= q.tolerance ? '✅ Great guess!' : `Close — it was ${q.answer}`}
        </motion.div>
      )}
    </div>
  )
}

export default function FinalQuiz() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { isLoggedIn, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && !isLoggedIn) navigate('/login')
  }, [isLoggedIn, authLoading])

  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState([])
  const [done, setDone] = useState(false)

  const handleAnswer = (correct) => {
    const newAnswers = [...answers, correct]
    setAnswers(newAnswers)
    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ((q) => q + 1)
      } else {
        setDone(true)
      }
    }, 800)
  }

  const score = answers.filter(Boolean).length
  const q = questions[currentQ]

  if (done) {
    const pct = Math.round((score / questions.length) * 100)
    const grade = pct >= 90 ? { emoji: '🏆', label: 'LLM Master!', color: '#f59e0b' }
      : pct >= 70 ? { emoji: '🌟', label: 'Great Job!', color: '#10b981' }
      : pct >= 50 ? { emoji: '👍', label: 'Good Effort!', color: '#4f46e5' }
      : { emoji: '📚', label: 'Keep Learning!', color: '#ec4899' }

    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, background: 'var(--bg-primary)' }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center', maxWidth: 500 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>{grade.emoji}</div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 36, marginBottom: 8, color: 'var(--text-primary)' }}>
            {grade.label}
          </h1>
          <div style={{ fontSize: 48, fontWeight: 800, color: grade.color, marginBottom: 8 }}>
            {score}/{questions.length}
          </div>
          <div style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 32 }}>
            You scored {pct}% on the LLM comprehensive quiz
          </div>

          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 32, flexWrap: 'wrap' }}>
            {answers.map((correct, i) => (
              <div key={i} style={{
                width: 36, height: 36, borderRadius: 8,
                background: correct ? '#d1fae5' : '#fee2e2',
                border: `1px solid ${correct ? '#86efac' : '#fca5a5'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, color: correct ? '#16a34a' : '#dc2626',
              }}>
                {correct ? '✓' : '✗'}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <motion.button whileHover={{ scale: 1.05 }}
              onClick={() => { setCurrentQ(0); setAnswers([]); setDone(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '14px 28px', background: 'white', border: '1px solid var(--border)',
                borderRadius: 14, color: 'var(--text-primary)', fontSize: 15, cursor: 'pointer',
              }}>
              <RotateCcw size={18} /> Retry
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }}
              onClick={() => navigate('/')}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '14px 28px', background: 'var(--gradient-primary)', border: 'none',
                borderRadius: 14, color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer',
              }}>
              <Home size={18} /> Home
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100, padding: '14px 24px',
        background: 'rgba(240,241,248,0.92)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <button onClick={() => navigate(`/course/${courseId}/8`)}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 6, display: 'flex' }}>
          <ArrowLeft size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Trophy size={16} color="#f59e0b" />
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, color: 'var(--text-primary)' }}>Final Quiz</span>
          </div>
        </div>
        <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
          {currentQ + 1}/{questions.length}
        </span>
      </header>

      {/* Progress */}
      <div style={{ height: 3, background: 'var(--bg-secondary)' }}>
        <motion.div animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
          style={{ height: '100%', background: 'var(--gradient-warm)', borderRadius: '0 2px 2px 0' }} />
      </div>

      {/* Question */}
      <main style={{ maxWidth: 750, margin: '0 auto', padding: '40px 32px 80px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{
                padding: '4px 12px', background: '#fff7ed',
                borderRadius: 8, fontSize: 12, color: '#f97316', fontWeight: 700,
                border: '1px solid #fed7aa',
              }}>
                Q{currentQ + 1}
              </span>
              {answers.length > currentQ && (
                <span style={{ fontSize: 18 }}>{answers[currentQ] ? '✅' : '❌'}</span>
              )}
            </div>

            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, marginBottom: 6, lineHeight: 1.3, color: 'var(--text-primary)' }}>
              {q.title}
            </h2>
            {q.instruction && (
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
                {q.instruction}
              </p>
            )}

            {q.type === 'bucket' && <BucketQ q={q} onAnswer={handleAnswer} />}
            {q.type === 'order' && <OrderQ q={q} onAnswer={handleAnswer} />}
            {q.type === 'highlight' && <HighlightQ q={q} onAnswer={handleAnswer} />}
            {q.type === 'slider' && <SliderQ q={q} onAnswer={handleAnswer} />}
          </motion.div>
        </AnimatePresence>

        {/* Score so far */}
        <div style={{ marginTop: 32, display: 'flex', gap: 6, justifyContent: 'center' }}>
          {Array.from({ length: questions.length }).map((_, i) => (
            <div key={i} style={{
              width: 28, height: 6, borderRadius: 3,
              background: i < answers.length
                ? (answers[i] ? '#10b981' : '#ef4444')
                : i === currentQ ? 'var(--accent)' : 'var(--border)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>
      </main>
    </div>
  )
}
