import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../../context/AuthContext'
import HindiExplainer from '../../../components/HindiExplainer'
import AIEvaluationPanel from '../../../components/AIEvaluationPanel'

/* ─── CONSTANTS ─── */
const COURSE_ID = 'dsa'
const ASSIGNMENT_ID = 1
const TOTAL_QUESTIONS = 10
const ACCENT = '#f59e0b'
const ACCENT_LIGHT = 'rgba(245,158,11,0.12)'
const ACCENT_BORDER = 'rgba(245,158,11,0.3)'

const SECTIONS = [
  { id: 1, title: 'Understanding the Problem', questions: [1, 2] },
  { id: 2, title: 'Choosing the Algorithm', questions: [3, 4] },
  { id: 3, title: 'Stability Matters', questions: [5] },
  { id: 4, title: 'Multi-Level Sort Design', questions: [6, 7] },
  { id: 5, title: 'Handling Edge Cases', questions: [8] },
  { id: 6, title: 'Performance Optimization', questions: [9, 10] },
  { id: 7, title: 'Hindi Summary', questions: [] },
]

const MCQ_DATA = {
  2: {
    question: 'Which property of pin codes makes this problem different from general sorting?',
    options: [
      { key: 'a', text: "They're strings" },
      { key: 'b', text: 'They have a fixed, known range (100000–999999)' },
      { key: 'c', text: "They're always unique" },
      { key: 'd', text: "They're already sorted" },
    ],
    answer: 'b',
  },
  4: {
    question: 'For sorting 50,000 integers in a known range, which approach gives the best theoretical time complexity?',
    options: [
      { key: 'a', text: 'Quick Sort — O(n log n) average' },
      { key: 'b', text: 'Merge Sort — O(n log n) guaranteed' },
      { key: 'c', text: 'Radix Sort — O(d × n) where d = 6 digits' },
      { key: 'd', text: 'Bubble Sort — O(n²)' },
    ],
    answer: 'c',
  },
  7: {
    question: 'When doing multi-level sorting (sort by A, then by B within A), which approach is correct?',
    options: [
      { key: 'a', text: 'Sort by A first, then by B' },
      { key: 'b', text: 'Sort by B first, then by A (because stable sort preserves B order within same A)' },
      { key: 'c', text: 'Sort by A+B concatenated as one key' },
      { key: 'd', text: 'Use separate arrays for each level' },
    ],
    answer: 'b',
  },
  10: {
    question: 'If you parallelize sorting across 4 conveyor belts, what is the speedup with Merge Sort?',
    options: [
      { key: 'a', text: 'Exactly 4x faster' },
      { key: 'b', text: 'Close to 4x for the sort phase, but merging is the bottleneck' },
      { key: 'c', text: 'No speedup possible — sorting is inherently sequential' },
      { key: 'd', text: '2x faster due to Amdahl\'s law' },
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
export default function Assignment1_SortWarehouse() {
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
            Your SpeedPost warehouse sorting design has been submitted. An AI instructor will review your responses and provide feedback.
          </p>
          <div style={{ ...card, textAlign: 'left' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: 16, fontFamily: 'var(--font-heading)' }}>Submission Summary</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              Questions answered: <strong style={{ color: ACCENT }}>{answered}/{TOTAL_QUESTIONS}</strong>
            </p>
            {SECTIONS.filter(s => s.questions.length > 0).map(sec => {
              const filled = sec.questions.filter(q => responses[q] && String(responses[q]).trim()).length
              return (
                <div key={sec.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 0', borderBottom: '1px solid var(--border)',
                }}>
                  <span style={{ color: filled === sec.questions.length ? ACCENT : 'var(--text-secondary)', fontSize: 16 }}>
                    {filled === sec.questions.length ? '✓' : '○'}
                  </span>
                  <span style={{ color: 'var(--text-primary)', fontSize: 15, flex: 1 }}>
                    Section {sec.id}: {sec.title}
                  </span>
                  <span style={{ fontSize: 13, color: filled === sec.questions.length ? ACCENT : 'var(--text-secondary)' }}>
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
            Sort the Warehouse &mdash; SpeedPost Logistics
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, margin: 0 }}>
            Assignment 1 &mdash; Sorting Algorithm Design Case Study
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
            <span style={{ color: ACCENT, fontSize: 14, fontWeight: 700 }}>{answered}/{TOTAL_QUESTIONS} answered</span>
          </div>
          <div style={{ height: 8, background: 'var(--bg-secondary)', borderRadius: 4, overflow: 'hidden' }}>
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
              style={{ height: '100%', background: `linear-gradient(90deg, ${ACCENT}, #fbbf24)`, borderRadius: 4 }}
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
            background: `linear-gradient(135deg, ${ACCENT_LIGHT}, rgba(245,158,11,0.03))`,
            border: `1px solid ${ACCENT_BORDER}`,
            marginBottom: 28,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 22 }}>{'📦'}</span>
            <span style={{ color: ACCENT, fontWeight: 700, fontSize: 17, fontFamily: 'var(--font-heading)' }}>
              Mission Brief
            </span>
          </div>
          <p style={{ color: 'var(--text-primary)', fontSize: 15, lineHeight: 1.8, margin: 0 }}>
            You are the tech lead at <strong>SpeedPost Logistics</strong>, India&rsquo;s fastest-growing delivery company.
            Their warehouse in <strong>Gurugram</strong> processes <strong>50,000 packages daily</strong>.
            Currently, workers sort packages manually by destination pin code &mdash; it takes <strong>4 hours</strong>.
            Management wants it done in under <strong>30 minutes</strong>. Design the sorting algorithm system.
          </p>
          <div style={{ display: 'flex', gap: 14, marginTop: 18, flexWrap: 'wrap' }}>
            {[
              { l: 'Daily Packages', v: '50,000' },
              { l: 'Pin Code Range', v: '6 digits' },
              { l: 'Current Time', v: '4 hours' },
              { l: 'Target Time', v: '30 min' },
              { l: 'Possible Pins', v: '900,000' },
              { l: 'Sort Method', v: 'Manual' },
            ].map(m => (
              <div key={m.l} style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: '10px 16px', flex: '1 1 120px' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>{m.l}</div>
                <div style={{ color: ACCENT, fontWeight: 700, fontSize: 18, marginTop: 2 }}>{m.v}</div>
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
                padding: '14px 36px', borderRadius: 12, border: `2px solid ${ACCENT}`,
                background: 'transparent', color: ACCENT, fontSize: 16, fontWeight: 700,
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
                background: `linear-gradient(135deg, ${ACCENT}, #fbbf24)`,
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
              style={{ color: saveMsg.includes('Failed') ? '#ef4444' : ACCENT, fontSize: 14, margin: 0 }}
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
      border: expanded ? `1px solid ${ACCENT_BORDER}` : '1px solid var(--border)',
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
          background: allFilled ? ACCENT : expanded ? ACCENT_LIGHT : 'var(--bg-secondary)',
          color: allFilled ? '#fff' : expanded ? ACCENT : 'var(--text-secondary)',
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
          {section.id === 7 && <Section7 />}

          {total > 0 && (
            <div style={{ marginTop: 20, textAlign: 'right' }}>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onSave}
                disabled={saving}
                style={{
                  padding: '10px 24px', borderRadius: 10, border: `1px solid ${ACCENT}`,
                  background: ACCENT_LIGHT, color: ACCENT, fontSize: 14, fontWeight: 600,
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
              {hasAnswered && isSelected && (
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
   SECTION 1 — Understanding the Problem
   ═══════════════════════════════════════════════════════════════════ */
function Section1({ setR, getR }) {
  return (
    <div>
      <TextInput
        label="Q1: The warehouse has 50,000 packages with 6-digit pin codes (100,000–999,999 possible values). Workers currently do a rough manual sort. List the properties of this data that affect algorithm choice — consider: data type, value range, distribution, dataset size, and memory constraints."
        value={getR(1)}
        onChange={v => setR(1, v)}
        rows={7}
        placeholder="Data type: integers (6-digit pin codes)&#10;Range: 100000 to 999999 — fixed, known range of 900,000 possible values&#10;Distribution: likely uneven — more packages to major cities (Mumbai 400xxx, Delhi 110xxx)&#10;Size: 50,000 packages — medium-large dataset&#10;Memory: each pin code is 4 bytes → 50,000 × 4 = ~200KB, very manageable&#10;&#10;Why this matters: A fixed known range enables counting-based sorts..."
      />
      <MCQ qId={2} setR={setR} getR={getR} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 2 — Choosing the Algorithm
   ═══════════════════════════════════════════════════════════════════ */
function Section2({ setR, getR }) {
  return (
    <div>
      <TextInput
        label="Q3: Compare Bubble Sort, Merge Sort, Quick Sort, and Counting/Radix Sort for this specific problem. For each algorithm, state: (a) time complexity, (b) space needed, and (c) whether it is practical for 50,000 packages. Which would you choose and why?"
        value={getR(3)}
        onChange={v => setR(3, v)}
        rows={10}
        placeholder="Bubble Sort:&#10;  Time: O(n²) — for 50,000 items = 2.5 billion comparisons&#10;  Space: O(1) in-place&#10;  Practical: NO — far too slow for warehouse use&#10;&#10;Merge Sort:&#10;  Time: O(n log n) — ~800,000 comparisons&#10;  Space: O(n) extra memory needed&#10;  Practical: YES — fast and stable&#10;&#10;Quick Sort:&#10;  Time: O(n log n) average, O(n²) worst case&#10;  Space: O(log n) stack space&#10;  Practical: YES but risky if pin codes cluster around a bad pivot&#10;&#10;Radix Sort:&#10;  Time: O(d × n) where d=6 digits — just 300,000 operations&#10;  Space: O(n + k) buckets&#10;  Practical: BEST CHOICE — exploits the fixed range of pin codes&#10;&#10;Choice: Radix Sort because..."
      />
      <MCQ qId={4} setR={setR} getR={getR} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 3 — Stability Matters
   ═══════════════════════════════════════════════════════════════════ */
function Section3({ setR, getR }) {
  return (
    <div>
      <TextInput
        label="Q5: Two packages have the same destination pin code but different priorities (Express vs Standard). Explain why sorting stability matters here. Which algorithms from Q3 are stable vs unstable, and what happens to Express packages if you use an unstable sort?"
        value={getR(5)}
        onChange={v => setR(5, v)}
        rows={8}
        placeholder="Stability means: when two elements have equal keys, their original order is preserved after sorting.&#10;&#10;Why it matters here:&#10;If a warehouse worker loaded Express and Standard packages for pin 110001 in that order, a stable sort keeps Express first — ensuring it gets delivered first. An unstable sort might swap them, delaying the Express package.&#10;&#10;Stable algorithms from Q3:&#10;  - Merge Sort: STABLE — equal elements maintain relative order&#10;  - Counting Sort (base of Radix Sort): STABLE when implemented correctly&#10;  - Radix Sort: STABLE — relies on stable counting sort internally&#10;  - Bubble Sort: STABLE&#10;&#10;Unstable algorithms:&#10;  - Quick Sort: UNSTABLE — partitioning can reorder equal elements&#10;&#10;Conclusion: For this warehouse, we must use a stable sort..."
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 4 — Multi-Level Sort Design
   ═══════════════════════════════════════════════════════════════════ */
function Section4({ setR, getR }) {
  return (
    <div>
      <TextInput
        label="Q6: Design a multi-level sorting system: first by state (28 states), then by city within each state, then by area within each city. Write pseudo-code or step-by-step instructions for this 3-level sort. What is the total time complexity?"
        value={getR(6)}
        onChange={v => setR(6, v)}
        rows={10}
        placeholder="Multi-level sort using stable sort (LSD Radix approach):&#10;&#10;Step 1 — Sort by area code (most specific level):&#10;  Apply stable Counting Sort on area portion of pin code&#10;  After this step: packages grouped by area&#10;&#10;Step 2 — Sort by city (middle level):&#10;  Apply stable Counting Sort on city portion&#10;  Because sort is stable, area order is preserved within each city&#10;&#10;Step 3 — Sort by state (broadest level):&#10;  Apply stable Counting Sort on state portion&#10;  Because sort is stable, city/area order is preserved within each state&#10;&#10;Result: packages sorted state → city → area, all with O(n) per pass&#10;&#10;Total complexity: O(3n) = O(n) — linear time!&#10;&#10;Why sort in reverse order (area first, state last)?&#10;  Because stable sort preserves earlier passes when later keys are equal..."
      />
      <MCQ qId={7} setR={setR} getR={getR} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 5 — Handling Edge Cases
   ═══════════════════════════════════════════════════════════════════ */
function Section5({ setR, getR }) {
  return (
    <div>
      <TextInput
        label="Q8: List 5 edge cases that could break your sorting system and how you would handle each. Consider: duplicate pin codes, invalid/missing pin codes, packages arriving mid-sort, system crash recovery, and memory overflow with 500,000 packages."
        value={getR(8)}
        onChange={v => setR(8, v)}
        rows={12}
        placeholder="Edge Case 1: Duplicate pin codes&#10;  Problem: Multiple packages share the same destination — algorithm must not treat them as a single entry&#10;  Solution: Sort objects (package_id + pin_code) not just integers; stability preserves order within duplicates&#10;&#10;Edge Case 2: Invalid or missing pin codes&#10;  Problem: OCR scanner misreads a code as '00000' or label is smudged&#10;  Solution: Validate pin code range (100000–999999) at scan time; route invalid packages to a 'manual review' bin before sorting begins&#10;&#10;Edge Case 3: Packages arriving mid-sort&#10;  Problem: New packages enter the conveyor while sort is in progress&#10;  Solution: Use a buffer queue; late arrivals join the next sort batch rather than disrupting the current run&#10;&#10;Edge Case 4: System crash recovery&#10;  Problem: Power failure loses all in-memory sort state&#10;  Solution: Checkpoint sorted output to disk every 5,000 packages; on restart, reload last checkpoint and continue from there&#10;&#10;Edge Case 5: Memory overflow at 500,000 packages&#10;  Problem: Counting Sort needs a frequency array of size 900,000 — fine. But holding 500,000 package objects may exceed RAM&#10;  Solution: External sort — split into 10 chunks of 50,000, sort each in memory, then merge sorted chunks using a min-heap (k-way merge)"
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 6 — Performance Optimization
   ═══════════════════════════════════════════════════════════════════ */
function Section6({ setR, getR }) {
  return (
    <div>
      <TextInput
        label="Q9: Your system must sort 50,000 packages in under 30 minutes. If each comparison takes 0.1ms (physical movement of packages on the conveyor), calculate: how many comparisons Bubble Sort, Merge Sort, and Radix Sort each require. Which algorithms fit within the 30-minute time budget?"
        value={getR(9)}
        onChange={v => setR(9, v)}
        rows={10}
        placeholder="Given: n = 50,000 packages, each comparison = 0.1ms, budget = 30 min = 1,800,000ms&#10;&#10;Bubble Sort — O(n²):&#10;  Comparisons: 50,000² = 2,500,000,000&#10;  Time: 2,500,000,000 × 0.1ms = 250,000,000ms = ~2,893 days ❌&#10;&#10;Merge Sort — O(n log n):&#10;  Comparisons: 50,000 × log₂(50,000) ≈ 50,000 × 15.6 ≈ 780,000&#10;  Time: 780,000 × 0.1ms = 78,000ms = 78 seconds ✓&#10;&#10;Radix Sort — O(d × n):&#10;  Operations: 6 × 50,000 = 300,000 (no comparisons, just bucket assignments)&#10;  Time: 300,000 × 0.1ms = 30,000ms = 30 seconds ✓&#10;&#10;Fits within budget:&#10;  - Merge Sort: YES (78 seconds, well within 30 minutes)&#10;  - Radix Sort: YES (30 seconds, fastest option)&#10;  - Bubble Sort: NO (effectively never finishes)"
      />
      <MCQ qId={10} setR={setR} getR={getR} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION 7 — Hindi Summary
   ═══════════════════════════════════════════════════════════════════ */
function Section7() {
  return (
    <div>
      <HindiExplainer
        concept="वेयरहाउस सॉर्टिंग पाइपलाइन"
        english="Warehouse Sorting Pipeline Design"
        explanation="50,000 पैकेजेज़ को pin code से sort करने के लिए सबसे पहले data की properties समझो। Pin codes की range fixed है (100000–999999) — यही Radix Sort को perfect बनाती है। Bubble Sort O(n²) = 2.5 अरब operations — warehouse में 2893 दिन लगेंगे! Radix Sort O(d×n) = सिर्फ 3 लाख operations — 30 सेकंड में काम खत्म। Multi-level sort के लिए पहले area, फिर city, फिर state sort करो — stable sort पिछले order को preserve करता है।"
        example="SpeedPost Gurugram warehouse: पहले Radix Sort से pin code के last digit के हिसाब से 10 bins में डालो, फिर second digit, फिर तीसरा... 6 बार करने पर सब sorted! Express पैकेज पहले डाले थे, stable sort उन्हें Standard से आगे रखेगा। 4 घंटे का काम 30 सेकंड में — यही algorithm design का जादू है।"
        terms={[
          { hindi: 'स्टेबल सॉर्ट', english: 'Stable Sort', meaning: 'जब equal elements हों, उनका original order बना रहे — Express package, Standard से पहले रहे' },
          { hindi: 'रेडिक्स सॉर्ट', english: 'Radix Sort', meaning: 'Digit-by-digit sort करो — fixed range के numbers के लिए O(n) linear time में काम करता है' },
          { hindi: 'एज केस', english: 'Edge Case', meaning: 'Unusual inputs जो system तोड़ सकते हैं — invalid pin code, mid-sort arrivals, memory overflow' },
          { hindi: 'मल्टी-लेवल सॉर्ट', english: 'Multi-Level Sort', meaning: 'पहले broad category (state), फिर narrow (city, area) — LSD radix approach से stable sort करो' },
        ]}
      />
    </div>
  )
}
