import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../../context/AuthContext'
import HindiExplainer from '../../../components/HindiExplainer'
import AIEvaluationPanel from '../../../components/AIEvaluationPanel'

/* ─── CONSTANTS ─── */
const COURSE_ID = 'dsa'
const ASSIGNMENT_ID = 4
const TOTAL_QUESTIONS = 10
const ACCENT = '#f59e0b'
const ACCENT_LIGHT = 'rgba(245,158,11,0.12)'
const ACCENT_BORDER = 'rgba(245,158,11,0.3)'

const SECTIONS = [
  { id: 'basic', num: 1, title: 'Basic Queries', icon: '🔍', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', questions: [1, 2] },
  { id: 'aggregations', num: 2, title: 'Aggregations & Grouping', icon: '📊', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', questions: [3, 4] },
  { id: 'joins', num: 3, title: 'JOINs', icon: '🔗', gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)', questions: [5, 6] },
  { id: 'window', num: 4, title: 'Window Functions', icon: '🪟', gradient: 'linear-gradient(135deg, #10b981, #059669)', questions: [7] },
  { id: 'subqueries', num: 5, title: 'Subqueries', icon: '🔁', gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)', questions: [8] },
  { id: 'advanced', num: 6, title: 'Advanced Analysis', icon: '🛡️', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)', questions: [9, 10] },
  { id: 'hindi', num: 7, title: 'Hindi Summary', icon: '🇮🇳', gradient: 'linear-gradient(135deg, #ff9933, #e67e22)', questions: [] },
]

const MCQ_Q2 = {
  question: 'To find customers who have NEVER placed an order, which approach is correct?',
  options: [
    { key: 'a', text: 'SELECT * FROM customers WHERE order_count = 0' },
    { key: 'b', text: 'SELECT c.* FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id WHERE o.order_id IS NULL' },
    { key: 'c', text: 'SELECT * FROM customers WHERE customer_id NOT IN orders' },
    { key: 'd', text: 'SELECT * FROM customers HAVING COUNT(orders) = 0' },
  ],
  answer: 'b',
}

const MCQ_Q4 = {
  question: "What's the difference between WHERE and HAVING in this query: SELECT category, AVG(price) FROM products GROUP BY category HAVING AVG(price) > 500?",
  options: [
    { key: 'a', text: "No difference — they're interchangeable" },
    { key: 'b', text: 'WHERE filters rows BEFORE grouping, HAVING filters groups AFTER aggregation' },
    { key: 'c', text: 'HAVING is faster than WHERE' },
    { key: 'd', text: "WHERE works with GROUP BY, HAVING doesn't" },
  ],
  answer: 'b',
}

const MCQ_Q6 = {
  question: 'A product exists in the products table but has no entries in order_items. Which JOIN ensures this product still appears in the results (with 0 sales)?',
  options: [
    { key: 'a', text: 'INNER JOIN' },
    { key: 'b', text: 'LEFT JOIN from products' },
    { key: 'c', text: 'RIGHT JOIN from order_items' },
    { key: 'd', text: 'CROSS JOIN' },
  ],
  answer: 'b',
}

const MCQ_Q10 = {
  question: 'To find products frequently bought together (bought in the same order), which approach works?',
  options: [
    { key: 'a', text: 'GROUP BY product_id' },
    { key: 'b', text: 'SELF JOIN order_items with itself ON same order_id but different product_id' },
    { key: 'c', text: 'UNION of all products' },
    { key: 'd', text: 'DISTINCT product pairs' },
  ],
  answer: 'b',
}

/* ─── SHARED STYLES ─── */
const crd = {
  background: 'var(--bg-card)', borderRadius: 16,
  border: '1px solid var(--border)', padding: 24, marginBottom: 20,
}
const ta = {
  width: '100%', background: 'var(--bg-secondary)',
  border: '1px solid var(--border)', borderRadius: 12,
  padding: '14px 16px', color: 'var(--text-primary)',
  fontFamily: 'inherit', fontSize: 15, lineHeight: 1.6,
  resize: 'vertical', outline: 'none', boxSizing: 'border-box',
}
const lb = {
  display: 'block', fontWeight: 600, color: 'var(--text-primary)',
  marginBottom: 10, fontSize: 15, lineHeight: 1.6,
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
            borderColor = ACCENT
            bg = ACCENT_LIGHT
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
                background: selected ? (submitted ? (isCorrect ? '#22c55e' : '#ef4444') : ACCENT) : 'transparent',
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

/* ─── SCHEMA DISPLAY ─── */
const SCHEMA_TABLES = [
  {
    name: 'customers',
    columns: ['customer_id', 'name', 'email', 'city', 'join_date'],
  },
  {
    name: 'orders',
    columns: ['order_id', 'customer_id', 'order_date', 'total_amount', 'status'],
  },
  {
    name: 'order_items',
    columns: ['item_id', 'order_id', 'product_id', 'quantity', 'price'],
  },
  {
    name: 'products',
    columns: ['product_id', 'product_name', 'category', 'brand', 'price'],
  },
  {
    name: 'reviews',
    columns: ['review_id', 'product_id', 'customer_id', 'rating', 'review_date'],
  },
]

function SchemaDisplay() {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${ACCENT_LIGHT}, rgba(245,158,11,0.04))`,
      border: `1px solid ${ACCENT_BORDER}`,
      borderRadius: 14, padding: '18px 22px', marginBottom: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 20 }}>🗄️</span>
        <h3 style={{ color: ACCENT, margin: 0, fontFamily: 'var(--font-heading)', fontSize: 16 }}>
          FlipMart Database Schema
        </h3>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 12,
      }}>
        {SCHEMA_TABLES.map(table => (
          <div key={table.name} style={{
            background: 'var(--bg-card)', borderRadius: 10,
            border: `1px solid ${ACCENT_BORDER}`, padding: '12px 14px',
          }}>
            <div style={{
              fontWeight: 700, fontSize: 13, color: ACCENT,
              fontFamily: 'monospace', marginBottom: 8,
              paddingBottom: 6, borderBottom: `1px solid ${ACCENT_BORDER}`,
            }}>
              {table.name}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {table.columns.map((col, i) => (
                <span key={col} style={{
                  fontSize: 12, color: i === 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontFamily: 'monospace',
                  fontWeight: i === 0 ? 700 : 400,
                }}>
                  {i === 0 ? '🔑 ' : '  '}{col}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* =====================================================================
   ROOT COMPONENT
   ===================================================================== */
export default function Assignment4_ECommerceSQL() {
  const { saveAssignment, getAssignment } = useAuth()
  const [resp, setResp] = useState({})
  const [expanded, setExpanded] = useState({ basic: true })
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

  const setR = (field, val) => setResp(prev => ({ ...prev, [field]: val }))
  const getR = (field) => resp[field] || ''

  const toggleSection = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const answeredCount = countAnswered(resp)

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
    if (!window.confirm(`You are about to submit Assignment ${ASSIGNMENT_ID}. You have answered ${answeredCount} out of ${TOTAL_QUESTIONS} questions. Continue?`)) return
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
        background: saving[sectionId] ? '#22c55e' : ACCENT,
        color: '#fff', transition: 'background 0.3s',
      }}
    >
      {saving[sectionId] ? 'Saved!' : 'Save Progress'}
    </motion.button>
  )

  /* ── SUBMITTED STATE ── */
  if (submitted) {
    const sectionQuestions = {
      basic: ['q1', 'q2'], aggregations: ['q3', 'q4'], joins: ['q5', 'q6'],
      window: ['q7'], subqueries: ['q8'], advanced: ['q9', 'q10'], hindi: [],
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
            Your SQL analysis for FlipMart's quarterly review has been submitted. You answered {answeredCount} out of {TOTAL_QUESTIONS} questions.
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
            E-Commerce Data Challenge — FlipMart
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.8, margin: '0 0 20px' }}>
            You are the data analyst at <strong style={{ color: 'var(--text-primary)' }}>FlipMart</strong>, a Flipkart-style e-commerce platform.
            Management needs 10 SQL queries answered for their quarterly business review — covering customer behavior,
            revenue trends, product performance, and fraud detection.
          </p>

          {/* Schema display */}
          <SchemaDisplay />

          {/* Progress bar */}
          <div style={{
            background: 'var(--bg-card)', borderRadius: 14, padding: '16px 20px',
            border: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600 }}>Progress</span>
              <span style={{ color: ACCENT, fontSize: 13, fontWeight: 700 }}>
                {answeredCount}/{TOTAL_QUESTIONS} answered
              </span>
            </div>
            <div style={{ height: 6, background: 'var(--bg-secondary)', borderRadius: 3, overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${(answeredCount / TOTAL_QUESTIONS) * 100}%` }}
                style={{
                  height: '100%', borderRadius: 3,
                  background: answeredCount === TOTAL_QUESTIONS
                    ? 'linear-gradient(90deg, #22c55e, #10b981)'
                    : `linear-gradient(90deg, ${ACCENT}, #f97316)`,
                }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        </motion.div>

        {/* ── SECTION 1: Basic Queries ── */}
        <SectionCard section={SECTIONS[0]} expanded={expanded.basic} onToggle={() => toggleSection('basic')}>
          <TextArea
            qNum={1}
            label="Write a SQL query to find the top 10 customers by total spending. Show customer_name, city, total_spent, and number_of_orders. Sort by total_spent descending."
            placeholder={
              'SELECT\n' +
              '  c.name AS customer_name,\n' +
              '  c.city,\n' +
              '  SUM(o.total_amount) AS total_spent,\n' +
              '  COUNT(o.order_id) AS number_of_orders\n' +
              'FROM customers c\n' +
              'JOIN orders o ON c.customer_id = o.customer_id\n' +
              'GROUP BY c.customer_id, c.name, c.city\n' +
              'ORDER BY total_spent DESC\n' +
              'LIMIT 10;'
            }
            rows={10}
            value={getR('q1')}
            onChange={v => setR('q1', v)}
          />
          <McqQuestion
            qNum={2}
            mcq={MCQ_Q2}
            value={getR('q2')}
            onChange={v => setR('q2', v)}
            submitted={submitted}
          />
          <SaveBtn sectionId="basic" />
        </SectionCard>

        {/* ── SECTION 2: Aggregations & Grouping ── */}
        <SectionCard section={SECTIONS[1]} expanded={expanded.aggregations} onToggle={() => toggleSection('aggregations')}>
          <TextArea
            qNum={3}
            label="Write a SQL query to find the monthly revenue trend for the last 12 months. Show month, total_revenue, number_of_orders, and avg_order_value. Include months with zero orders (show 0)."
            placeholder={
              '-- Hint: Use a date series / calendar table for months with zero orders\n' +
              'WITH months AS (\n' +
              '  SELECT DATE_TRUNC(\'month\', CURRENT_DATE - INTERVAL \'1 month\' * n) AS month\n' +
              '  FROM generate_series(0, 11) AS n\n' +
              ')\n' +
              'SELECT\n' +
              '  TO_CHAR(m.month, \'YYYY-MM\') AS month,\n' +
              '  COALESCE(SUM(o.total_amount), 0) AS total_revenue,\n' +
              '  COUNT(o.order_id) AS number_of_orders,\n' +
              '  COALESCE(AVG(o.total_amount), 0) AS avg_order_value\n' +
              'FROM months m\n' +
              'LEFT JOIN orders o ON DATE_TRUNC(\'month\', o.order_date) = m.month\n' +
              'GROUP BY m.month\n' +
              'ORDER BY m.month;'
            }
            rows={12}
            value={getR('q3')}
            onChange={v => setR('q3', v)}
          />
          <McqQuestion
            qNum={4}
            mcq={MCQ_Q4}
            value={getR('q4')}
            onChange={v => setR('q4', v)}
            submitted={submitted}
          />
          <SaveBtn sectionId="aggregations" />
        </SectionCard>

        {/* ── SECTION 3: JOINs ── */}
        <SectionCard section={SECTIONS[2]} expanded={expanded.joins} onToggle={() => toggleSection('joins')}>
          <TextArea
            qNum={5}
            label="Write a SQL query to find each product's average rating AND total units sold. Show product_name, category, avg_rating (rounded to 1 decimal), total_units_sold, and total_revenue. Only include products with at least 5 reviews. Sort by avg_rating DESC."
            placeholder={
              'SELECT\n' +
              '  p.product_name,\n' +
              '  p.category,\n' +
              '  ROUND(AVG(r.rating), 1) AS avg_rating,\n' +
              '  COALESCE(SUM(oi.quantity), 0) AS total_units_sold,\n' +
              '  COALESCE(SUM(oi.quantity * oi.price), 0) AS total_revenue\n' +
              'FROM products p\n' +
              'JOIN reviews r ON p.product_id = r.product_id\n' +
              'LEFT JOIN order_items oi ON p.product_id = oi.product_id\n' +
              'GROUP BY p.product_id, p.product_name, p.category\n' +
              'HAVING COUNT(r.review_id) >= 5\n' +
              'ORDER BY avg_rating DESC;'
            }
            rows={12}
            value={getR('q5')}
            onChange={v => setR('q5', v)}
          />
          <McqQuestion
            qNum={6}
            mcq={MCQ_Q6}
            value={getR('q6')}
            onChange={v => setR('q6', v)}
            submitted={submitted}
          />
          <SaveBtn sectionId="joins" />
        </SectionCard>

        {/* ── SECTION 4: Window Functions ── */}
        <SectionCard section={SECTIONS[3]} expanded={expanded.window} onToggle={() => toggleSection('window')}>
          <TextArea
            qNum={7}
            label="Write SQL queries using WINDOW FUNCTIONS to: (1) Rank products by sales within each category using RANK(), (2) Show each order's running total per customer using SUM() OVER(), (3) Find each customer's most recent order using ROW_NUMBER(). Write all three queries."
            placeholder={
              '-- Query 1: Rank products by sales within each category\n' +
              'SELECT\n' +
              '  p.product_name, p.category,\n' +
              '  SUM(oi.quantity) AS units_sold,\n' +
              '  RANK() OVER (PARTITION BY p.category ORDER BY SUM(oi.quantity) DESC) AS category_rank\n' +
              'FROM products p JOIN order_items oi ON p.product_id = oi.product_id\n' +
              'GROUP BY p.product_id, p.product_name, p.category;\n\n' +
              '-- Query 2: Running total per customer\n' +
              'SELECT\n' +
              '  customer_id, order_id, order_date, total_amount,\n' +
              '  SUM(total_amount) OVER (PARTITION BY customer_id ORDER BY order_date) AS running_total\n' +
              'FROM orders;\n\n' +
              '-- Query 3: Most recent order per customer\n' +
              'SELECT * FROM (\n' +
              '  SELECT *,\n' +
              '    ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC) AS rn\n' +
              '  FROM orders\n' +
              ') t WHERE rn = 1;'
            }
            rows={18}
            value={getR('q7')}
            onChange={v => setR('q7', v)}
          />
          <SaveBtn sectionId="window" />
        </SectionCard>

        {/* ── SECTION 5: Subqueries ── */}
        <SectionCard section={SECTIONS[4]} expanded={expanded.subqueries} onToggle={() => toggleSection('subqueries')}>
          <TextArea
            qNum={8}
            label="Write a SQL query to find 'at-risk' customers — those who placed orders in the first 6 months but NOT in the last 3 months. Use subqueries. Show customer_name, city, last_order_date, and days_since_last_order."
            placeholder={
              'SELECT\n' +
              '  c.name AS customer_name,\n' +
              '  c.city,\n' +
              '  MAX(o.order_date) AS last_order_date,\n' +
              '  CURRENT_DATE - MAX(o.order_date) AS days_since_last_order\n' +
              'FROM customers c\n' +
              'JOIN orders o ON c.customer_id = o.customer_id\n' +
              'WHERE c.customer_id IN (\n' +
              '  -- Customers who ordered in first 6 months after joining\n' +
              '  SELECT DISTINCT o1.customer_id\n' +
              '  FROM orders o1\n' +
              '  JOIN customers c1 ON o1.customer_id = c1.customer_id\n' +
              '  WHERE o1.order_date <= c1.join_date + INTERVAL \'6 months\'\n' +
              ')\n' +
              'AND c.customer_id NOT IN (\n' +
              '  -- Customers who ordered in the last 3 months\n' +
              '  SELECT DISTINCT customer_id FROM orders\n' +
              '  WHERE order_date >= CURRENT_DATE - INTERVAL \'3 months\'\n' +
              ')\n' +
              'GROUP BY c.customer_id, c.name, c.city\n' +
              'ORDER BY days_since_last_order DESC;'
            }
            rows={14}
            value={getR('q8')}
            onChange={v => setR('q8', v)}
          />
          <SaveBtn sectionId="subqueries" />
        </SectionCard>

        {/* ── SECTION 6: Advanced Analysis ── */}
        <SectionCard section={SECTIONS[5]} expanded={expanded.advanced} onToggle={() => toggleSection('advanced')}>
          <TextArea
            qNum={9}
            label="Write a query to detect potential fraud: find customers who placed more than 3 orders in a single day with different shipping addresses, or any single order over ₹50,000. Use CTEs (WITH clause) for readability."
            placeholder={
              'WITH orders_per_day AS (\n' +
              '  SELECT\n' +
              '    customer_id,\n' +
              '    DATE(order_date) AS order_day,\n' +
              '    COUNT(*) AS order_count\n' +
              '  FROM orders\n' +
              '  GROUP BY customer_id, DATE(order_date)\n' +
              '  HAVING COUNT(*) > 3\n' +
              '),\n' +
              'high_value_orders AS (\n' +
              '  SELECT customer_id, order_id, total_amount\n' +
              '  FROM orders\n' +
              '  WHERE total_amount > 50000\n' +
              ')\n' +
              'SELECT DISTINCT c.customer_id, c.name, c.email,\n' +
              '  \'Multiple orders in one day\' AS fraud_flag\n' +
              'FROM customers c JOIN orders_per_day opd ON c.customer_id = opd.customer_id\n' +
              'UNION\n' +
              'SELECT DISTINCT c.customer_id, c.name, c.email,\n' +
              '  \'High value order (>50000)\' AS fraud_flag\n' +
              'FROM customers c JOIN high_value_orders hvo ON c.customer_id = hvo.customer_id;'
            }
            rows={16}
            value={getR('q9')}
            onChange={v => setR('q9', v)}
          />
          <McqQuestion
            qNum={10}
            mcq={MCQ_Q10}
            value={getR('q10')}
            onChange={v => setR('q10', v)}
            submitted={submitted}
          />
          <SaveBtn sectionId="advanced" />
        </SectionCard>

        {/* ── SECTION 7: Hindi Summary ── */}
        <SectionCard section={SECTIONS[6]} expanded={expanded.hindi} onToggle={() => toggleSection('hindi')}>
          <HindiExplainer
            concept="SQL Analysis — FlipMart Case Study"
            english="SQL for E-Commerce Analytics"
            explanation="FlipMart जैसी e-commerce company में हर दिन लाखों orders आते हैं। SQL से हम इस data का analysis करते हैं — कौन से customers सबसे ज़्यादा खर्च करते हैं, कौन से products best-seller हैं, किस महीने revenue सबसे ज़्यादा था। Window functions से running totals और rankings निकालते हैं, CTEs से complex fraud queries को readable बनाते हैं।"
            example="Flipkart की Big Billion Days sale में analysts SQL queries run करते हैं — 'TOP 10 cities by revenue', 'products with rating > 4 and 1000+ reviews', 'customers who bought during sale but haven't returned'. यही queries business decisions drive करती हैं — कहाँ discount दें, कौन सा product promote करें, किस customer को retention offer भेजें।"
            terms={[
              { hindi: 'विंडो फंक्शन', english: 'Window Function', meaning: 'RANK(), SUM() OVER() — groups बनाए बिना row-level calculations करो' },
              { hindi: 'सब-क्वेरी', english: 'Subquery', meaning: 'एक query के अंदर दूसरी query — nested filtering के लिए' },
              { hindi: 'सीटीई', english: 'CTE (WITH clause)', meaning: 'Complex queries को readable steps में तोड़ो' },
              { hindi: 'लेफ्ट जॉइन', english: 'LEFT JOIN', meaning: 'Left table के सभी rows रखो, right table से matching data जोड़ो' },
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
            background: `linear-gradient(135deg, ${ACCENT_LIGHT}, rgba(245,158,11,0.04))`,
            border: `1px solid ${ACCENT_BORDER}`,
          }}
        >
          <h3 style={{
            fontFamily: 'var(--font-heading)', color: 'var(--text-primary)',
            fontSize: 20, margin: '0 0 8px',
          }}>
            Ready to Submit?
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, margin: '0 0 20px' }}>
            You have answered <strong>{answeredCount}</strong> out of <strong>{TOTAL_QUESTIONS}</strong> questions.
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
                border: `2px solid ${ACCENT}`, color: ACCENT,
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
                background: `linear-gradient(135deg, ${ACCENT}, #f97316)`,
                boxShadow: '0 4px 20px rgba(245,158,11,0.3)',
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
