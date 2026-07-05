import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../../context/AuthContext'
import HindiExplainer from '../../../components/HindiExplainer'
import AIEvaluationPanel from '../../../components/AIEvaluationPanel'

/* ─── CONSTANTS ─── */
const COURSE_ID = 'scale'
const ASSIGNMENT_ID = 4
const TOTAL_QUESTIONS = 12

const SECTIONS = [
  { id: 'crisis', num: 1, title: 'Current Crisis Analysis', icon: '\u{1F6A8}', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)', questions: [1, 2] },
  { id: 'pooling', num: 2, title: 'Connection Pooling Design', icon: '\u{1F3CA}', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', questions: [3, 4] },
  { id: 'indexing', num: 3, title: 'Indexing Strategy', icon: '\u{1F4D1}', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', questions: [5, 6] },
  { id: 'replicas', num: 4, title: 'Read Replica Architecture', icon: '\u{1F4D6}', gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)', questions: [7, 8] },
  { id: 'sharding', num: 5, title: 'Sharding Decision', icon: '\u{1F52A}', gradient: 'linear-gradient(135deg, #10b981, #059669)', questions: [9, 10] },
  { id: 'sqlnosql', num: 6, title: 'SQL vs NoSQL Evaluation', icon: '\u{1F500}', gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)', questions: [11, 12] },
  { id: 'hindi', num: 7, title: 'Hindi Summary', icon: '\u{1F1EE}\u{1F1F3}', gradient: 'linear-gradient(135deg, #ff9933, #e67e22)', questions: [] },
]

const MCQ_Q2 = {
  question: "BookKart's app creates a new database connection for every API request. With 2000 requests/second, what fails first?",
  options: [
    { key: 'a', text: 'CPU hits 100% from query processing' },
    { key: 'b', text: "Connection limit exhausted — new requests get 'too many connections' error" },
    { key: 'c', text: 'Disk runs out of space' },
    { key: 'd', text: 'Network bandwidth saturates' },
  ],
  answer: 'b',
}

const MCQ_Q6 = {
  question: 'BookKart has 12 indexes on the orders table. Write throughput has dropped 40%. What\'s the best action?',
  options: [
    { key: 'a', text: 'Add more indexes to speed up reads' },
    { key: 'b', text: 'Remove ALL indexes to speed up writes' },
    { key: 'c', text: 'Audit indexes — remove unused ones, merge overlapping ones, consider partial indexes' },
    { key: 'd', text: 'Switch to MongoDB which handles indexes better' },
  ],
  answer: 'c',
}

const MCQ_Q8 = {
  question: 'A user adds an item to cart (write → primary), then immediately views their cart (read). With 100ms replication lag, they see an empty cart. Best solution?',
  options: [
    { key: 'a', text: 'Increase replica count to reduce lag' },
    { key: 'b', text: 'Route read-after-write queries to primary for a short window' },
    { key: 'c', text: 'Add a 200ms sleep before the read' },
    { key: 'd', text: 'Cache the write in localStorage and merge with DB response' },
  ],
  answer: 'b',
}

const MCQ_Q10 = {
  question: "For BookKart's orders table, which shard key provides the best balance of even distribution and query efficiency?",
  options: [
    { key: 'a', text: 'order_date (range-based)' },
    { key: 'b', text: 'user_id (hash-based)' },
    { key: 'c', text: 'status (e.g., pending, shipped, delivered)' },
    { key: 'd', text: 'order_id (sequential)' },
  ],
  answer: 'b',
}

/* ─── SHARED STYLES ─── */
const crd = {
  background: 'var(--bg-card)', borderRadius: 20,
  border: '1px solid var(--border)', padding: 28, marginBottom: 20,
}
const ta = {
  width: '100%', background: 'var(--bg-secondary)',
  border: '1px solid var(--border)', borderRadius: 12,
  padding: '14px 16px', color: 'var(--text-primary)',
  fontFamily: 'monospace', fontSize: 14, lineHeight: 1.6,
  resize: 'vertical', outline: 'none', boxSizing: 'border-box',
}
const lb = {
  display: 'block', fontWeight: 600, color: 'var(--text-primary)',
  marginBottom: 10, fontSize: 15, lineHeight: 1.5,
}

/* ─── HELPERS ─── */
function countAnswered(resp) {
  let count = 0
  for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
    const v = resp[`q${i}`]
    if (v && (typeof v === 'string' ? v.trim() : v)) count++
  }
  return count
}

/* ─── MCQ WIDGET ─── */
function McqQuestion({ qNum, mcq, value, onChange, submitted }) {
  const isCorrect = value === mcq.answer
  return (
    <div style={crd}>
      <label style={lb}>Q{qNum}: {mcq.question}</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {mcq.options.map(opt => {
          const selected = value === opt.key
          const showFeedback = submitted && selected
          let borderColor = 'var(--border)'
          let bg = 'var(--bg-secondary)'
          if (selected && !submitted) {
            borderColor = 'var(--accent)'
            bg = 'rgba(6,182,212,0.08)'
          }
          if (showFeedback && isCorrect) {
            borderColor = '#22c55e'
            bg = 'rgba(34,197,94,0.08)'
          }
          if (showFeedback && !isCorrect) {
            borderColor = '#ef4444'
            bg = 'rgba(239,68,68,0.08)'
          }
          if (submitted && opt.key === mcq.answer && !selected) {
            borderColor = '#22c55e'
            bg = 'rgba(34,197,94,0.06)'
          }
          return (
            <button
              key={opt.key}
              onClick={() => !submitted && onChange(opt.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 18px', borderRadius: 12, cursor: submitted ? 'default' : 'pointer',
                border: `2px solid ${borderColor}`, background: bg,
                textAlign: 'left', transition: 'all 0.15s',
              }}
            >
              <span style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700,
                border: selected ? 'none' : '2px solid var(--border)',
                background: selected ? (submitted ? (isCorrect ? '#22c55e' : '#ef4444') : 'var(--accent)') : 'transparent',
                color: selected ? '#fff' : 'var(--text-secondary)',
              }}>
                {opt.key.toUpperCase()}
              </span>
              <span style={{ color: 'var(--text-primary)', fontSize: 15 }}>{opt.text}</span>
            </button>
          )
        })}
      </div>
      {submitted && value && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: 14, padding: '10px 16px', borderRadius: 10,
            background: isCorrect ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${isCorrect ? '#22c55e' : '#ef4444'}`,
            color: isCorrect ? '#22c55e' : '#ef4444',
            fontSize: 14, fontWeight: 600,
          }}
        >
          {isCorrect ? 'Correct!' : `Incorrect. The correct answer is ${mcq.answer.toUpperCase()}.`}
        </motion.div>
      )}
    </div>
  )
}

/* ─── TEXTAREA WITH CHAR COUNT ─── */
function TextArea({ qNum, label, placeholder, rows, value, onChange }) {
  const len = (value || '').length
  return (
    <div style={crd}>
      <label style={lb}>Q{qNum}: {label}</label>
      <textarea
        rows={rows || 6}
        style={ta}
        placeholder={placeholder}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
      />
      <div style={{
        display: 'flex', justifyContent: 'flex-end', marginTop: 6,
        fontSize: 12, color: 'var(--text-secondary)',
      }}>
        {len} characters
      </div>
    </div>
  )
}

/* ─── SECTION CARD ─── */
function SectionCard({ section, expanded, onToggle, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: section.num * 0.05 }}
      style={{
        background: 'var(--bg-card)', borderRadius: 20,
        border: '1px solid var(--border)', marginBottom: 16,
        overflow: 'hidden',
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: '100%', padding: '20px 28px', border: 'none', cursor: 'pointer',
          background: expanded ? section.gradient : 'var(--bg-card)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          transition: 'background 0.3s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{
            width: 36, height: 36, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 700,
            background: expanded ? 'rgba(255,255,255,0.2)' : 'var(--bg-secondary)',
            color: expanded ? '#fff' : 'var(--text-secondary)',
          }}>
            {section.num}
          </span>
          <span style={{
            fontSize: 17, fontWeight: 700,
            fontFamily: 'var(--font-heading)',
            color: expanded ? '#fff' : 'var(--text-primary)',
          }}>
            {section.title}
          </span>
        </div>
        <span style={{
          fontSize: 20, color: expanded ? '#fff' : 'var(--text-secondary)',
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s',
        }}>
          &#9660;
        </span>
      </button>
      {expanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{ padding: 28 }}
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  )
}

/* =====================================================================
   ROOT COMPONENT
   ===================================================================== */
export default function Assignment4_DatabaseScaling() {
  const { saveAssignment, getAssignment } = useAuth()
  const [resp, setResp] = useState({})
  const [expanded, setExpanded] = useState({ crisis: true })
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState({})
  const [loaded, setLoaded] = useState(false)

  /* Load saved responses on mount */
  useEffect(() => {
    async function load() {
      try {
        const data = await getAssignment(COURSE_ID, ASSIGNMENT_ID)
        if (data && data.responses) {
          setResp(data.responses)
          if (data.submitted) setSubmitted(true)
        }
      } catch (_) {
        /* ignore load errors */
      }
      setLoaded(true)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const put = (field, val) => setResp(prev => ({ ...prev, [field]: val }))
  const get = (field) => resp[field] || ''

  const toggleSection = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const answered = countAnswered(resp)

  /* Save progress for a section */
  const handleSave = async (sectionId) => {
    setSaving(prev => ({ ...prev, [sectionId]: true }))
    try {
      await saveAssignment(COURSE_ID, ASSIGNMENT_ID, resp, false)
    } catch (_) {
      /* ignore save errors */
    }
    setTimeout(() => setSaving(prev => ({ ...prev, [sectionId]: false })), 1200)
  }

  /* Final submit */
  const handleSubmit = async () => {
    if (!window.confirm(`You are about to submit Assignment ${ASSIGNMENT_ID}. You have answered ${answered} out of ${TOTAL_QUESTIONS} questions. Continue?`)) return
    try {
      await saveAssignment(COURSE_ID, ASSIGNMENT_ID, resp, true)
      setSubmitted(true)
    } catch (_) {
      /* ignore submit errors */
    }
  }

  /* Save button per section */
  const SaveBtn = ({ sectionId }) => (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => handleSave(sectionId)}
      style={{
        marginTop: 16, padding: '10px 28px', borderRadius: 10,
        border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
        background: saving[sectionId] ? '#22c55e' : 'var(--accent)',
        color: '#fff', transition: 'background 0.3s',
      }}
    >
      {saving[sectionId] ? 'Saved!' : 'Save Progress'}
    </motion.button>
  )

  /* ── SUBMITTED STATE ── */
  if (submitted) {
    const sectionQuestions = {
      crisis: ['q1', 'q2'], pooling: ['q3', 'q4'], indexing: ['q5', 'q6'],
      replicas: ['q7', 'q8'], sharding: ['q9', 'q10'], sqlnosql: ['q11', 'q12'], hindi: [],
    }
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '60px 24px' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}
        >
          <div style={{ fontSize: 72, marginBottom: 20 }}>&#10003;</div>
          <h1 style={{
            fontFamily: 'var(--font-heading)', color: 'var(--text-primary)',
            fontSize: 32, marginBottom: 16,
          }}>
            Assignment Submitted!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 17, lineHeight: 1.7, marginBottom: 32 }}>
            Your database scaling plan for BookKart will be reviewed. You answered {answered} out of {TOTAL_QUESTIONS} questions.
          </p>
          <div style={{ ...crd, textAlign: 'left' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: 16, fontFamily: 'var(--font-heading)' }}>
              Submission Summary
            </h3>
            {SECTIONS.map(sec => {
              const qs = sectionQuestions[sec.id] || []
              const filled = qs.filter(q => resp[q] && (typeof resp[q] === 'string' ? resp[q].trim() : resp[q])).length
              const ok = qs.length === 0 || filled > 0
              return (
                <div key={sec.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 0', borderBottom: '1px solid var(--border)',
                }}>
                  <span style={{ color: ok ? '#22c55e' : 'var(--text-secondary)', fontSize: 16 }}>
                    {ok ? '✓' : '○'}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 13, minWidth: 24 }}>S{sec.num}</span>
                  <span style={{ color: 'var(--text-primary)', fontSize: 15 }}>{sec.title}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 13, color: ok ? '#22c55e' : 'var(--text-secondary)' }}>
                    {qs.length === 0 ? 'Reference' : ok ? `${filled}/${qs.length}` : 'Skipped'}
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

  if (!loaded) {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--bg-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Loading...</p>
      </div>
    )
  }

  /* ── MAIN LAYOUT ── */
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '40px 24px' }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 32 }}
        >
          <h1 style={{
            fontFamily: 'var(--font-heading)', color: 'var(--text-primary)',
            fontSize: 30, margin: '0 0 10px',
          }}>
            Database Scaling Challenge — BookKart
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.8, margin: '0 0 20px' }}>
            You are the lead database engineer at BookKart, an e-commerce platform that has
            grown from 10K to 2 million active users in just 6 months. The PostgreSQL database
            is crumbling under the load. The CTO wants a comprehensive scaling plan within 48 hours.
          </p>

          {/* Crisis metrics card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.02))',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 14, padding: '18px 22px', marginBottom: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 20 }}>&#x1F6A8;</span>
              <h3 style={{ color: '#ef4444', margin: 0, fontFamily: 'var(--font-heading)', fontSize: 16 }}>
                CRISIS DASHBOARD
              </h3>
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: 12,
            }}>
              {[
                { label: 'Avg Query Time', value: '8 seconds', color: '#ef4444' },
                { label: 'Connection Pool', value: '100/100', color: '#f59e0b' },
                { label: 'Disk Usage', value: '95%', color: '#ef4444' },
                { label: 'CPU Usage', value: '90%', color: '#f59e0b' },
              ].map(m => (
                <div key={m.label} style={{
                  background: 'var(--bg-card)', borderRadius: 10, padding: '12px 16px',
                  border: '1px solid var(--border)', textAlign: 'center',
                }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: m.color, fontFamily: 'var(--font-heading)' }}>
                    {m.value}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div style={{
            background: 'var(--bg-card)', borderRadius: 14, padding: '16px 20px',
            border: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600 }}>Progress</span>
              <span style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 700 }}>
                {answered}/{TOTAL_QUESTIONS} answered
              </span>
            </div>
            <div style={{ height: 6, background: 'var(--bg-secondary)', borderRadius: 3, overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${(answered / TOTAL_QUESTIONS) * 100}%` }}
                style={{
                  height: '100%', borderRadius: 3,
                  background: answered === TOTAL_QUESTIONS
                    ? 'linear-gradient(90deg, #22c55e, #10b981)'
                    : 'linear-gradient(90deg, var(--accent), #3b82f6)',
                }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        </motion.div>

        {/* ── SECTION 1: Current Crisis Analysis ── */}
        <SectionCard section={SECTIONS[0]} expanded={expanded.crisis} onToggle={() => toggleSection('crisis')}>
          <TextArea
            qNum={1}
            label="The monitoring dashboard shows: avg query time 8s, connection pool 100/100, disk 95%, CPU 90%. Identify the top 3 bottlenecks and explain WHY each is happening at this scale."
            placeholder={"1. Connection exhaustion: With 2000 req/s and only 100 connections...\n2. Missing indexes: Full table scans on...\n3. Storage pressure: ..."}
            rows={8}
            value={get('q1')}
            onChange={v => put('q1', v)}
          />
          <McqQuestion
            qNum={2}
            mcq={MCQ_Q2}
            value={get('q2')}
            onChange={v => put('q2', v)}
            submitted={submitted}
          />
          <SaveBtn sectionId="crisis" />
        </SectionCard>

        {/* ── SECTION 2: Connection Pooling Design ── */}
        <SectionCard section={SECTIONS[1]} expanded={expanded.pooling} onToggle={() => toggleSection('pooling')}>
          <TextArea
            qNum={3}
            label="Design the connection pool configuration for BookKart using SQLAlchemy. Specify pool_size, max_overflow, pool_timeout, pool_recycle and justify each value based on BookKart's traffic (2000 req/s, 2 app servers, PostgreSQL max_connections=200)."
            placeholder={"from sqlalchemy import create_engine\n\nengine = create_engine(\n    'postgresql://...',\n    pool_size=__,     # Because...\n    max_overflow=__,  # Because...\n    pool_timeout=__,  # Because...\n    pool_recycle=__,  # Because...\n)"}
            rows={10}
            value={get('q3')}
            onChange={v => put('q3', v)}
          />
          <TextArea
            qNum={4}
            label="BookKart uses FastAPI. Write the dependency injection pattern (get_db generator) that ensures connections are always returned to the pool, even when request handlers throw exceptions."
            placeholder={"from fastapi import Depends\nfrom sqlalchemy.orm import Session\n\ndef get_db():\n    db = SessionLocal()\n    try:\n        yield db\n    finally:\n        ..."}
            rows={8}
            value={get('q4')}
            onChange={v => put('q4', v)}
          />
          <SaveBtn sectionId="pooling" />
        </SectionCard>

        {/* ── SECTION 3: Indexing Strategy ── */}
        <SectionCard section={SECTIONS[2]} expanded={expanded.indexing} onToggle={() => toggleSection('indexing')}>
          <TextArea
            qNum={5}
            label="The slowest query is: SELECT * FROM orders WHERE user_id = ? AND status = 'pending' ORDER BY created_at DESC LIMIT 20. Design the optimal compound index. Explain why (user_id, status, created_at) is better than three separate single-column indexes."
            placeholder={"CREATE INDEX idx_orders_user_status_date ON orders(...);\n\nThis compound index is optimal because:\n1. ..."}
            rows={10}
            value={get('q5')}
            onChange={v => put('q5', v)}
          />
          <McqQuestion
            qNum={6}
            mcq={MCQ_Q6}
            value={get('q6')}
            onChange={v => put('q6', v)}
            submitted={submitted}
          />
          <SaveBtn sectionId="indexing" />
        </SectionCard>

        {/* ── SECTION 4: Read Replica Architecture ── */}
        <SectionCard section={SECTIONS[3]} expanded={expanded.replicas} onToggle={() => toggleSection('replicas')}>
          <TextArea
            qNum={7}
            label="Design the read replica topology for BookKart. How many replicas do you need? Which queries should go to replicas vs primary? How will you handle the shopping cart read-after-write consistency problem?"
            placeholder={"Replica topology:\n- Number of replicas: __\n- Replica regions: __\n\nRouting rules:\n- Primary: (writes, cart reads after write...)\n- Replicas: (product catalog, search, order history...)\n\nRead-after-write solution:\n..."}
            rows={10}
            value={get('q7')}
            onChange={v => put('q7', v)}
          />
          <McqQuestion
            qNum={8}
            mcq={MCQ_Q8}
            value={get('q8')}
            onChange={v => put('q8', v)}
            submitted={submitted}
          />
          <SaveBtn sectionId="replicas" />
        </SectionCard>

        {/* ── SECTION 5: Sharding Decision ── */}
        <SectionCard section={SECTIONS[4]} expanded={expanded.sharding} onToggle={() => toggleSection('sharding')}>
          <TextArea
            qNum={9}
            label="BookKart's orders table has 500M rows, growing by 2M/day. Design a sharding strategy: choose shard key, sharding method (range vs hash), number of shards, and explain how these queries work: (a) Get all orders for user X, (b) Get all orders in the last hour, (c) Get order by order_id."
            placeholder={"Shard key: __ (because...)\nMethod: __ sharding\nNumber of shards: __\n\nQuery routing:\n(a) All orders for user X: ...\n(b) All orders in last hour: ...\n(c) Order by ID: ..."}
            rows={10}
            value={get('q9')}
            onChange={v => put('q9', v)}
          />
          <McqQuestion
            qNum={10}
            mcq={MCQ_Q10}
            value={get('q10')}
            onChange={v => put('q10', v)}
            submitted={submitted}
          />
          <SaveBtn sectionId="sharding" />
        </SectionCard>

        {/* ── SECTION 6: SQL vs NoSQL Evaluation ── */}
        <SectionCard section={SECTIONS[5]} expanded={expanded.sqlnosql} onToggle={() => toggleSection('sqlnosql')}>
          <TextArea
            qNum={11}
            label="BookKart has two different data access patterns: (1) Product catalog — 50K items, read-heavy with complex filtering (price, category, brand, rating). (2) User reviews — 10K new reviews/day, mostly writes then reads. Should each stay in PostgreSQL, move to MongoDB, or use a different approach? Justify each separately."
            placeholder={"Product Catalog:\n- Recommendation: Stay in PostgreSQL / Move to MongoDB\n- Reason: ...\n\nUser Reviews:\n- Recommendation: Stay in PostgreSQL / Move to MongoDB\n- Reason: ..."}
            rows={10}
            value={get('q11')}
            onChange={v => put('q11', v)}
          />
          <TextArea
            qNum={12}
            label="Write a 1-paragraph executive summary for BookKart's CTO: what changes you recommend (prioritized), expected performance improvement, estimated timeline, and top 2 risks."
            placeholder={"Executive Summary:\n\nBookKart's database infrastructure needs immediate attention across four areas..."}
            rows={8}
            value={get('q12')}
            onChange={v => put('q12', v)}
          />
          <SaveBtn sectionId="sqlnosql" />
        </SectionCard>

        {/* ── SECTION 7: Hindi Summary ── */}
        <SectionCard section={SECTIONS[6]} expanded={expanded.hindi} onToggle={() => toggleSection('hindi')}>
          <HindiExplainer
            concept="Database Scaling — BookKart Case Study"
            english="Database Scaling for E-Commerce"
            explanation="BookKart जैसी e-commerce app में 2 million users आ गए तो database crash होने लगा। Connection pooling से connections manage करो, indexes से queries fast करो, read replicas से read load बाँटो, और sharding से data split करो। हर problem का अलग solution है — सबको एक साथ apply करो तो database फिर से smooth चलेगा।"
            example="Flipkart जैसी companies में orders table को user_id पर shard करते हैं ताकि एक user के सारे orders एक shard पर रहें। Product catalog के लिए read replicas रखते हैं क्योंकि 90% traffic सिर्फ products देखने की होती है। Connection pool से हर server 50-80 connections maintain करता है — हर request पर नया connection नहीं बनाते।"
            terms={[
              { hindi: 'कनेक्शन पूलिंग', english: 'Connection Pooling', meaning: 'Database connections पहले से बनाकर रखो, बार-बार नया मत बनाओ' },
              { hindi: 'रीड रेप्लिका', english: 'Read Replica', meaning: 'Primary DB की copy — सिर्फ read queries यहाँ भेजो' },
              { hindi: 'शार्डिंग', english: 'Sharding', meaning: 'Data को multiple databases में split करो for horizontal scaling' },
              { hindi: 'कम्पाउंड इंडेक्स', english: 'Compound Index', meaning: 'Multiple columns पर एक साथ index — complex queries fast करता है' },
            ]}
          />
        </SectionCard>

        {/* ── SUBMIT FINAL ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            ...crd, textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(6,182,212,0.06))',
            border: '1px solid rgba(59,130,246,0.2)',
          }}
        >
          <h3 style={{
            fontFamily: 'var(--font-heading)', color: 'var(--text-primary)',
            fontSize: 20, margin: '0 0 8px',
          }}>
            Ready to Submit?
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, margin: '0 0 20px' }}>
            You have answered <strong>{answered}</strong> out of <strong>{TOTAL_QUESTIONS}</strong> questions.
            You can submit even with incomplete answers and revisit later.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSave('final')}
              style={{
                padding: '14px 36px', fontSize: 16, fontWeight: 700,
                fontFamily: 'var(--font-heading)', borderRadius: 14, cursor: 'pointer',
                border: '2px solid var(--accent)', color: 'var(--accent)',
                background: 'transparent',
              }}
            >
              {saving.final ? 'Saved!' : 'Save Draft'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              style={{
                padding: '14px 48px', fontSize: 17, fontWeight: 700,
                fontFamily: 'var(--font-heading)', borderRadius: 14, cursor: 'pointer',
                border: 'none', color: '#fff',
                background: 'linear-gradient(135deg, #3b82f6, var(--accent))',
                boxShadow: '0 4px 20px rgba(59,130,246,0.3)',
              }}
            >
              Submit Final
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
