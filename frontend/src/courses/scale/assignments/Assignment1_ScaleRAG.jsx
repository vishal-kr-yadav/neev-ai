import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../../context/AuthContext'
import HindiExplainer from '../../../components/HindiExplainer'
import AIEvaluationPanel from '../../../components/AIEvaluationPanel'

/* ─── CONSTANTS ─── */
const COURSE_ID = 'scale'
const ASSIGNMENT_ID = 1
const TOTAL_QUESTIONS = 12
const GREEN = '#059669'
const GREEN_LIGHT = 'rgba(5,150,105,0.12)'
const GREEN_BORDER = 'rgba(5,150,105,0.3)'

const SECTIONS = [
  { id: 1, title: 'Request Analysis', questions: [1, 2] },
  { id: 2, title: 'Server Sizing', questions: [3, 4] },
  { id: 3, title: 'Bottleneck Identification', questions: [5, 6] },
  { id: 4, title: 'Optimization Strategy', questions: [7, 8] },
  { id: 5, title: 'Architecture Design', questions: [9] },
  { id: 6, title: 'Latency & SLA', questions: [10, 11] },
  { id: 7, title: 'Cost Optimization', questions: [12] },
  { id: 8, title: 'Hindi Summary', questions: [] },
]

const MCQ_DATA = {
  2: {
    question: 'What percentage of the total request time (2,265ms) is actual CPU computation (~13ms)?',
    options: [
      { key: 'a', text: 'About 50%' },
      { key: 'b', text: 'About 10%' },
      { key: 'c', text: 'About 0.6%' },
      { key: 'd', text: 'About 25%' },
    ],
    answer: 'c',
  },
  6: {
    question: 'Which bottleneck will you hit FIRST when scaling from 100 to 10K users?',
    options: [
      { key: 'a', text: 'Server CPU maxing out' },
      { key: 'b', text: 'OpenAI API rate limits' },
      { key: 'c', text: 'Running out of disk space' },
      { key: 'd', text: 'DNS resolution failures' },
    ],
    answer: 'b',
  },
  11: {
    question: 'For a medical application, which latency percentile is MOST important to track?',
    options: [
      { key: 'a', text: 'P50 — the average experience' },
      { key: 'b', text: 'P99 — because even 1% of doctors waiting 10+ seconds is unacceptable for patient care' },
      { key: 'c', text: 'Average — it gives the overall picture' },
      { key: 'd', text: 'Maximum — the absolute worst case' },
    ],
    answer: 'b',
  },
}

/* ─── STYLES ─── */
const card = {
  background: 'var(--bg-card)',
  borderRadius: 16,
  border: '1px solid var(--border)',
  padding: 24,
  marginBottom: 20,
}

const textarea = {
  width: '100%',
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: '14px 16px',
  color: 'var(--text-primary)',
  fontFamily: 'inherit',
  fontSize: 15,
  lineHeight: 1.6,
  resize: 'vertical',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle = {
  display: 'block',
  fontWeight: 600,
  color: 'var(--text-primary)',
  marginBottom: 10,
  fontSize: 15,
  lineHeight: 1.6,
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export default function Assignment1_ScaleRAG() {
  const { saveAssignment, getAssignment } = useAuth()
  const [responses, setResponses] = useState({})
  const [expanded, setExpanded] = useState({ 1: true })
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  /* ── Load saved responses on mount ── */
  useEffect(() => {
    async function load() {
      const data = await getAssignment(COURSE_ID, ASSIGNMENT_ID)
      if (data && data.responses) {
        setResponses(data.responses)
        if (data.submitted) setSubmitted(true)
      }
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Helpers ── */
  const setR = (qId, value) => {
    setResponses(prev => ({ ...prev, [qId]: value }))
  }

  const getR = (qId) => responses[qId] || ''

  const answeredCount = () => {
    let count = 0
    for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
      const val = responses[i]
      if (val && typeof val === 'string' && val.trim().length > 0) count++
    }
    return count
  }

  const toggleSection = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveMsg('')
    try {
      await saveAssignment(COURSE_ID, ASSIGNMENT_ID, responses, false)
      setSaveMsg('Progress saved!')
    } catch {
      setSaveMsg('Failed to save. Try again.')
    }
    setSaving(false)
    setTimeout(() => setSaveMsg(''), 3000)
  }

  const handleSubmit = async () => {
    if (!window.confirm('Submit your final answers? You can still view them after submission.')) return
    setSaving(true)
    try {
      await saveAssignment(COURSE_ID, ASSIGNMENT_ID, responses, true)
      setSubmitted(true)
    } catch {
      setSaveMsg('Failed to submit. Try again.')
    }
    setSaving(false)
  }

  const answered = answeredCount()
  const progress = Math.round((answered / TOTAL_QUESTIONS) * 100)

  /* ── Submitted state ── */
  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '60px 24px' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}
        >
          <div style={{ fontSize: 64, marginBottom: 20 }}>&#10003;</div>
          <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', fontSize: 32, marginBottom: 16 }}>
            Assignment Submitted!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 17, lineHeight: 1.7, marginBottom: 32 }}>
            Your MediBot scaling design has been submitted. An AI instructor will review your responses and provide feedback.
          </p>
          <div style={{ ...card, textAlign: 'left' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: 16, fontFamily: 'var(--font-heading)' }}>Submission Summary</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              Questions answered: <strong style={{ color: GREEN }}>{answered}/{TOTAL_QUESTIONS}</strong>
            </p>
            {SECTIONS.filter(s => s.questions.length > 0).map(sec => {
              const filled = sec.questions.filter(q => responses[q] && String(responses[q]).trim()).length
              return (
                <div key={sec.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 0', borderBottom: '1px solid var(--border)',
                }}>
                  <span style={{ color: filled === sec.questions.length ? GREEN : 'var(--text-secondary)', fontSize: 16 }}>
                    {filled === sec.questions.length ? '✓' : '○'}
                  </span>
                  <span style={{ color: 'var(--text-primary)', fontSize: 15, flex: 1 }}>
                    Section {sec.id}: {sec.title}
                  </span>
                  <span style={{ fontSize: 13, color: filled === sec.questions.length ? GREEN : 'var(--text-secondary)' }}>
                    {filled}/{sec.questions.length}
                  </span>
                </div>
              )
            })}
          </div>
        </motion.div>
        <AIEvaluationPanel courseId={COURSE_ID} assignmentId={ASSIGNMENT_ID} />
      </div>
    )
  }

  /* ── Main layout ── */
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '40px 24px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: 32 }}
        >
          <h1 style={{
            fontFamily: 'var(--font-heading)', color: 'var(--text-primary)',
            fontSize: 30, margin: '0 0 8px',
          }}>
            Scale a RAG Application &mdash; MediBot
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, margin: 0 }}>
            Assignment 1 &mdash; Infrastructure Design Case Study
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ ...card, marginBottom: 24 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500 }}>Progress</span>
            <span style={{ color: GREEN, fontSize: 14, fontWeight: 700 }}>{answered}/{TOTAL_QUESTIONS} answered</span>
          </div>
          <div style={{ height: 8, background: 'var(--bg-secondary)', borderRadius: 4, overflow: 'hidden' }}>
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
              style={{ height: '100%', background: `linear-gradient(90deg, ${GREEN}, #10b981)`, borderRadius: 4 }}
            />
          </div>
        </motion.div>

        {/* Scenario Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            ...card,
            background: `linear-gradient(135deg, ${GREEN_LIGHT}, rgba(5,150,105,0.03))`,
            border: `1px solid ${GREEN_BORDER}`,
            marginBottom: 28,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 22 }}>{'🏥'}</span>
            <span style={{ color: GREEN, fontWeight: 700, fontSize: 17, fontFamily: 'var(--font-heading)' }}>
              Mission Brief
            </span>
          </div>
          <p style={{ color: 'var(--text-primary)', fontSize: 15, lineHeight: 1.8, margin: 0 }}>
            You are the infrastructure architect at <strong>HealthAI</strong>, building <strong>MediBot</strong> &mdash;
            an AI-powered medical Q&amp;A chatbot for Indian hospitals. It uses RAG: user question &rarr;
            embedding (OpenAI, 200ms) &rarr; vector search (Qdrant, 50ms) &rarr; LLM call (GPT-4, 2000ms) &rarr;
            response. Currently serves <strong>50 doctors</strong>. Now 200 hospitals want to onboard &mdash;
            that&rsquo;s <strong>10,000 concurrent users</strong>. Design the infrastructure.
          </p>
          <div style={{ display: 'flex', gap: 14, marginTop: 18, flexWrap: 'wrap' }}>
            {[
              { l: 'Current Users', v: '50' },
              { l: 'Target Users', v: '10,000' },
              { l: 'Embedding', v: '200ms' },
              { l: 'Vector Search', v: '50ms' },
              { l: 'LLM Call', v: '2,000ms' },
              { l: 'Total Latency', v: '~2,265ms' },
            ].map(m => (
              <div key={m.l} style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: '10px 16px', flex: '1 1 120px' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>{m.l}</div>
                <div style={{ color: GREEN, fontWeight: 700, fontSize: 18, marginTop: 2 }}>{m.v}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Sections */}
        {SECTIONS.map((sec, idx) => (
          <motion.div
            key={sec.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * idx }}
            style={{ marginBottom: 16 }}
          >
            <SectionCard
              section={sec}
              expanded={!!expanded[sec.id]}
              onToggle={() => toggleSection(sec.id)}
              responses={responses}
              setR={setR}
              getR={getR}
              onSave={handleSave}
              saving={saving}
            />
          </motion.div>
        ))}

        {/* Save / Submit Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{ ...card, textAlign: 'center', marginTop: 32, marginBottom: 40 }}
        >
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '14px 36px', borderRadius: 12, border: `2px solid ${GREEN}`,
                background: 'transparent', color: GREEN, fontSize: 16, fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-heading)',
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? 'Saving...' : 'Save Progress'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              disabled={saving}
              style={{
                padding: '14px 36px', borderRadius: 12, border: 'none',
                background: `linear-gradient(135deg, ${GREEN}, #10b981)`,
                color: '#fff', fontSize: 16, fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-heading)',
                opacity: saving ? 0.6 : 1,
              }}
            >
              Submit Final
            </motion.button>
          </div>
          {saveMsg && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ color: saveMsg.includes('Failed') ? '#ef4444' : GREEN, fontSize: 14, margin: 0 }}
            >
              {saveMsg}
            </motion.p>
          )}
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 8, lineHeight: 1.6 }}>
            You can save your progress at any time and come back later. Submit when you are ready for review.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION CARD (Expandable)
   ═══════════════════════════════════════════════════════════════════ */
function SectionCard({ section, expanded, onToggle, responses, setR, getR, onSave, saving }) {
  const filledCount = section.questions.filter(q => responses[q] && String(responses[q]).trim()).length
  const total = section.questions.length
  const allFilled = total > 0 && filledCount === total

  return (
    <div style={{
      ...card,
      marginBottom: 0,
      border: expanded ? `1px solid ${GREEN_BORDER}` : '1px solid var(--border)',
    }}>
      {/* Header */}
      <button
        onClick={onToggle}
        style={{
          display: 'flex', alignItems: 'center', width: '100%',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0, gap: 14,
        }}
      >
        <div style={{
          width: 40, height: 40, borderRadius: 10, display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          background: allFilled ? GREEN : expanded ? GREEN_LIGHT : 'var(--bg-secondary)',
          color: allFilled ? '#fff' : expanded ? GREEN : 'var(--text-secondary)',
          fontWeight: 700, fontSize: 16, fontFamily: 'var(--font-heading)',
        }}>
          {allFilled ? '✓' : section.id}
        </div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <h3 style={{
            fontFamily: 'var(--font-heading)', color: 'var(--text-primary)',
            fontSize: 18, margin: 0,
          }}>
            Section {section.id}: {section.title}
          </h3>
          {total > 0 && (
            <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
              {filledCount}/{total} question{total > 1 ? 's' : ''} answered
            </span>
          )}
        </div>
        <span style={{
          fontSize: 20, color: 'var(--text-secondary)',
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s',
        }}>
          {'▼'}
        </span>
      </button>

      {/* Content */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          style={{ marginTop: 20, overflow: 'hidden' }}
        >
          {section.id === 1 && <Section1 setR={setR} getR={getR} />}
          {section.id === 2 && <Section2 setR={setR} getR={getR} />}
          {section.id === 3 && <Section3 setR={setR} getR={getR} />}
          {section.id === 4 && <Section4 setR={setR} getR={getR} />}
          {section.id === 5 && <Section5 setR={setR} getR={getR} />}
          {section.id === 6 && <Section6 setR={setR} getR={getR} />}
          {section.id === 7 && <Section7 setR={setR} getR={getR} />}
          {section.id === 8 && <Section8 />}

          {total > 0 && (
            <div style={{ marginTop: 20, textAlign: 'right' }}>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onSave}
                disabled={saving}
                style={{
                  padding: '10px 24px', borderRadius: 10, border: `1px solid ${GREEN}`,
                  background: GREEN_LIGHT, color: GREEN, fontSize: 14, fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                }}
              >
                {saving ? 'Saving...' : 'Save Progress'}
              </motion.button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   TEXTAREA WITH CHAR COUNT
   ═══════════════════════════════════════════════════════════════════ */
function TextInput({ label, value, onChange, rows, placeholder }) {
  const len = (value || '').length
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={labelStyle}>{label}</label>
      <textarea
        rows={rows || 5}
        style={textarea}
        placeholder={placeholder}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
      />
      <div style={{ textAlign: 'right', color: 'var(--text-secondary)', fontSize: 12, marginTop: 4 }}>
        {len} character{len !== 1 ? 's' : ''}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   MCQ COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
function MCQ({ qId, setR, getR }) {
  const data = MCQ_DATA[qId]
  const selected = getR(qId)
  const hasAnswered = !!selected

  return (
    <div style={{ marginBottom: 20 }}>
      <label style={labelStyle}>{data.question}</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {data.options.map(opt => {
          const isSelected = selected === opt.key
          const isCorrect = opt.key === data.answer
          const showFeedback = hasAnswered && isSelected

          let borderColor = 'var(--border)'
          let bg = 'var(--bg-secondary)'
          let textColor = 'var(--text-primary)'

          if (isSelected) {
            borderColor = isCorrect ? '#22c55e' : '#ef4444'
            bg = isCorrect ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)'
          } else if (hasAnswered && isCorrect) {
            borderColor = '#22c55e'
            bg = 'rgba(34,197,94,0.06)'
          }

          return (
            <button
              key={opt.key}
              onClick={() => setR(qId, opt.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 18px', borderRadius: 12, cursor: 'pointer',
                border: `2px solid ${borderColor}`,
                background: bg, textAlign: 'left', width: '100%',
                transition: 'all 0.2s',
              }}
            >
              <span style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                border: `2px solid ${isSelected ? borderColor : 'var(--border)'}`,
                background: isSelected ? borderColor : 'transparent',
                color: isSelected ? '#fff' : 'var(--text-secondary)',
                fontSize: 13, fontWeight: 700,
              }}>
                {opt.key}
              </span>
              <span style={{ color: textColor, fontSize: 15, lineHeight: 1.5 }}>{opt.text}</span>
              {showFeedback && (
                <span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 600, color: isCorrect ? '#22c55e' : '#ef4444' }}>
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </span>
              )}
            </button>
          )
        })}
      </div>
      {hasAnswered && selected !== data.answer && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ color: '#22c55e', fontSize: 13, marginTop: 8 }}
        >
          The correct answer is highlighted above.
        </motion.p>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 1 — Request Analysis
   ═══════════════════════════════════════════════════════════════════ */
function Section1({ setR, getR }) {
  return (
    <div>
      <TextInput
        label="Q1: Break down the MediBot request lifecycle. For each stage, identify: (a) time taken, (b) is it CPU-bound or I/O-bound, (c) which resource is consumed. Calculate the total request time and CPU utilization percentage."
        value={getR(1)}
        onChange={v => setR(1, v)}
        rows={7}
        placeholder="Stage 1: Receive HTTP request &#10;  Time: ~2ms &#10;  Type: I/O-bound &#10;  Resource: Network &#10;&#10;Stage 2: Generate embedding (OpenAI API) &#10;  Time: 200ms ..."
      />
      <MCQ qId={2} setR={setR} getR={getR} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 2 — Server Sizing
   ═══════════════════════════════════════════════════════════════════ */
function Section2({ setR, getR }) {
  return (
    <div>
      <TextInput
        label="Q3: Given a 4 vCPU server with 16GB RAM running 5 Uvicorn workers: Calculate the maximum number of concurrent requests per server. Show your math step by step. (Consider: CPU time per request, I/O overlap with async, memory per request ~2MB)"
        value={getR(3)}
        onChange={v => setR(3, v)}
        rows={8}
        placeholder="Step 1: CPU time per request = ... &#10;Step 2: With async I/O, during the ~2250ms I/O wait... &#10;Step 3: Memory constraint: 16GB / 2MB = ... &#10;Step 4: Taking the minimum of CPU and memory limits..."
      />
      <TextInput
        label="Q4: How many servers do you need for 10,000 concurrent users? What is the estimated monthly cost at $80/server/month?"
        value={getR(4)}
        onChange={v => setR(4, v)}
        rows={5}
        placeholder="Concurrent users: 10,000 &#10;Requests per server: ... &#10;Servers needed: ... &#10;Monthly cost: ... servers x $80 = $..."
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 3 — Bottleneck Identification
   ═══════════════════════════════════════════════════════════════════ */
function Section3({ setR, getR }) {
  return (
    <div>
      <TextInput
        label="Q5: At 10K concurrent users, list the TOP 3 bottlenecks you'll hit (hint: it's not just compute). For each, explain WHY it's a bottleneck and what the specific limit is."
        value={getR(5)}
        onChange={v => setR(5, v)}
        rows={8}
        placeholder="Bottleneck 1: ... &#10;  Why: ... &#10;  Limit: ... &#10;&#10;Bottleneck 2: ... &#10;  Why: ... &#10;  Limit: ..."
      />
      <MCQ qId={6} setR={setR} getR={getR} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 4 — Optimization Strategy
   ═══════════════════════════════════════════════════════════════════ */
function Section4({ setR, getR }) {
  return (
    <div>
      <TextInput
        label="Q7: Design a caching strategy for MediBot. What should you cache? (Embeddings? LLM responses? Both?) How do you handle cache invalidation for medical data that changes? What cache hit rate do you expect?"
        value={getR(7)}
        onChange={v => setR(7, v)}
        rows={8}
        placeholder="Caching layers: &#10;1. Embedding cache: ... &#10;2. LLM response cache: ... &#10;&#10;Cache invalidation strategy: ... &#10;Expected hit rate: ..."
      />
      <TextInput
        label={'Q8: The LLM call (2000ms) is 88% of total request time. List 3 specific ways to reduce its impact on the user experience WITHOUT switching to a different LLM.'}
        value={getR(8)}
        onChange={v => setR(8, v)}
        rows={6}
        placeholder="1. Streaming responses: ... &#10;2. ... &#10;3. ..."
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 5 — Architecture Design
   ═══════════════════════════════════════════════════════════════════ */
function Section5({ setR, getR }) {
  return (
    <div>
      <TextInput
        label="Q9: Design the complete architecture for MediBot at 10K scale. Include: load balancers, app servers, database, cache layer, vector DB, external APIs. Draw it in text form (boxes and arrows)."
        value={getR(9)}
        onChange={v => setR(9, v)}
        rows={12}
        placeholder={"[User] --> [Nginx LB] --> [App Server Pool] \\n                              |-> [Redis Cache] \\n                              |-> [Qdrant Cluster] \\n                              |-> [OpenAI API] \\n                              |-> [PostgreSQL]"}
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 6 — Latency & SLA
   ═══════════════════════════════════════════════════════════════════ */
function Section6({ setR, getR }) {
  return (
    <div>
      <TextInput
        label="Q10: Define the SLA for MediBot. What P50, P95, and P99 latency targets would you set? What uptime percentage? What happens if a doctor is waiting for a critical medical answer and the system is slow?"
        value={getR(10)}
        onChange={v => setR(10, v)}
        rows={7}
        placeholder="P50 latency target: ... &#10;P95 latency target: ... &#10;P99 latency target: ... &#10;Uptime target: ... &#10;&#10;Degradation handling for critical queries: ..."
      />
      <MCQ qId={11} setR={setR} getR={getR} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 7 — Cost Optimization
   ═══════════════════════════════════════════════════════════════════ */
function Section7({ setR, getR }) {
  return (
    <div>
      <TextInput
        label="Q12: Your initial design requires 20 servers at $80/month = $1,600/month. The CEO says budget is $800/month. Apply optimizations to bring it under budget. Show before/after for: server count, LLM API costs, and total monthly cost."
        value={getR(12)}
        onChange={v => setR(12, v)}
        rows={10}
        placeholder={"BEFORE optimization: \\n  Servers: 20 x $80 = $1,600 \\n  LLM API: ... \\n  Total: ... \\n\\nOptimizations applied: \\n  1. Caching (reduce LLM calls by ...%) \\n  2. ... \\n  3. ... \\n\\nAFTER optimization: \\n  Servers: ... x $80 = $... \\n  LLM API: ... \\n  Total: $..."}
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 8 — Hindi Summary
   ═══════════════════════════════════════════════════════════════════ */
function Section8() {
  return (
    <div>
      <HindiExplainer
        concept="RAG ऐप को स्केल करना"
        english="Scaling a RAG Application"
        explanation="RAG app को scale करने के लिए सिर्फ servers बढ़ाना काफ़ी नहीं — bottlenecks समझो (API rate limits, DB connections, memory), caching लगाओ (similar questions का जवाब cache करो), streaming use करो (user को तुरंत response दिखना शुरू हो), और cost optimize करो (simple questions के लिए cheaper model use करो)।"
        example="MediBot 50 doctors से 10,000 तक scale करने के लिए: 20 servers चाहिए बिना optimization → $1,600/month। Caching + streaming + smart routing से 8 servers → $640/month। Budget बचाओ, performance बढ़ाओ!"
        terms={[
          { hindi: 'कैपेसिटी प्लानिंग', english: 'Capacity Planning', meaning: 'कितने users के लिए कितने resources चाहिए — calculate करना' },
          { hindi: 'बॉटलनेक', english: 'Bottleneck', meaning: 'सबसे slow हिस्सा जो पूरे system को रोक दे' },
          { hindi: 'सिमेंटिक कैश', english: 'Semantic Cache', meaning: 'Similar (identical नहीं) questions का cached answer देना' },
        ]}
      />
    </div>
  )
}
